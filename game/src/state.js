// state.js — the kitchen's live state: orders, the chef, the chopping board,
// the grill, the plate on the assembly counter, and every rule that moves
// a shift forward. Rendering never lives here; input never lives here.
import {
  CHEF_SPEED, CHEF_START, FLOOR, GRILL_TIME, BURN_TIME, CHOP_TIME,
  INGREDIENTS, MAX_HEARTS, MAX_ORDERS, ORDER_EVERY, ORDER_PATIENCE,
  RECIPES, SHIFT_LENGTH, STATIONS,
} from './config.js';
import { mulberry32, pick } from './rng.js';
import { sfx } from './audio.js';

let orderSeq = 0;

export function newGame(seed = 20261125) {
  return {
    mode: 'title', // title | play | over
    seed,
    rng: mulberry32(seed),
    time: 0,
    shiftLeft: SHIFT_LENGTH,
    score: 0,
    coins: 0,
    served: 0,
    missed: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    orderTimer: 4,
    chef: {
      x: CHEF_START.x, y: CHEF_START.y,
      tx: CHEF_START.x, ty: CHEF_START.y,
      moving: false, face: 1, walkPhase: 0,
      carry: null, // { kind: 'raw'|'item'|'plate', id, items? }
      busy: 0, busyLabel: '',
    },
    orders: [],
    board: { item: null, progress: 0 }, // chopping board
    grill: [null, null], // two slots: { id:'patty', t, state:'raw'|'cooked'|'burnt' }
    plate: null, // plate resting on the assembly counter: { items: [] }
    particles: [],
    floats: [],
    message: '',
    messageT: 0,
    lastTickSecond: -1,
    overReason: '',
    stars: 0,
  };
}

export function stationById(id) {
  return STATIONS.find((s) => s.id === id);
}

export function stationAtPoint(x, y) {
  for (let i = STATIONS.length - 1; i >= 0; i--) {
    const s = STATIONS[i];
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s;
  }
  return null;
}

export function startShift(state) {
  const fresh = newGame(state.seed);
  fresh.mode = 'play';
  Object.assign(state, fresh);
  state.mode = 'play';
  spawnOrder(state, true);
  spawnOrder(state, true);
  state.orderTimer = ORDER_EVERY;
  say(state, 'Shift started! First orders are in.');
}

export function say(state, text) {
  state.message = text;
  state.messageT = 2.6;
}

export function addFloat(state, x, y, text, color) {
  state.floats.push({ x, y, text, color, t: 0, life: 1.4 });
}

export function burst(state, x, y, color, n = 10) {
  for (let i = 0; i < n; i++) {
    const a = state.rng() * Math.PI * 2;
    const sp = 40 + state.rng() * 90;
    state.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
      t: 0, life: 0.5 + state.rng() * 0.4, color, r: 2 + state.rng() * 3,
    });
  }
}

function spawnOrder(state, first = false) {
  if (state.orders.length >= MAX_ORDERS) return;
  const recipe = pick(state.rng, RECIPES);
  state.orders.push({
    id: ++orderSeq,
    recipeId: recipe.id,
    patience: ORDER_PATIENCE,
    maxPatience: ORDER_PATIENCE,
    fresh: first,
  });
  if (!first) sfx.order();
}

// The plate's items, sorted, as one comparable key.
export function plateKey(items) {
  return items.slice().sort().join('+');
}

export function orderMatches(state, order) {
  if (!state.plate) return false;
  const recipe = RECIPES.find((r) => r.id === order.recipeId);
  return plateKey(state.plate.items) === plateKey(recipe.items);
}

function matchingOrder(state) {
  return state.orders.find((o) => orderMatches(state, o));
}

function servePlate(state) {
  const order = matchingOrder(state);
  const serve = stationById('serve');
  if (!order) {
    sfx.bad();
    say(state, 'No order wants this dish yet!');
    burst(state, serve.x + serve.w / 2, serve.y, '#e5484d', 6);
    return;
  }
  const recipe = RECIPES.find((r) => r.id === order.recipeId);
  const urgency = order.patience / order.maxPatience;
  const tip = Math.round(recipe.price * 0.6 * urgency);
  const comboBonus = state.combo >= 2 ? 2 * (state.combo - 1) : 0;
  const earned = recipe.price + tip + comboBonus;
  state.coins += earned;
  state.score += earned * 10 + Math.round(urgency * 50);
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.plate = null;
  sfx.serve();
  burst(state, serve.x + serve.w / 2, serve.y + 10, '#ffd166', 16);
  addFloat(state, serve.x + serve.w / 2, serve.y - 8, `+$${earned}`, '#ffd166');
  if (state.combo >= 3) addFloat(state, serve.x + serve.w / 2, serve.y - 34, `COMBO x${state.combo}!`, '#ff9f43');
  say(state, `${recipe.name} served! +$${earned}${comboBonus ? ` (combo +$${comboBonus})` : ''}`);
}

function loseHeart(state, why) {
  state.hearts -= 1;
  state.combo = 0;
  state.missed += 1;
  sfx.bad();
  say(state, why);
  if (state.hearts <= 0) endShift(state, 'The dinner rush wore the kitchen down.');
}

export function endShift(state, reason) {
  state.mode = 'over';
  state.overReason = reason;
  const served = state.served;
  state.stars = served >= 14 ? 3 : served >= 9 ? 2 : served >= 5 ? 1 : 0;
  sfx.over();
}

// One interaction: the chef has arrived at a station and uses it.
export function interact(state, station) {
  const chef = state.chef;
  if (state.mode !== 'play' || chef.busy > 0) return;
  const carry = chef.carry;

  if (station.kind === 'crate') {
    if (carry) { say(state, 'Hands full! Put it down first.'); sfx.bad(); return; }
    const ing = INGREDIENTS[station.item];
    chef.carry = { kind: 'raw', id: ing.raw, base: station.item };
    sfx.pickup();
    say(state, `Picked up ${ing.name}. ${ing.prep === 'chop' ? 'Chop it on the board!' : ing.prep === 'grill' ? 'Grill it!' : 'Ready to plate!'}`);
    return;
  }

  if (station.kind === 'board') {
    if (state.board.item) {
      if (!carry) {
        chef.carry = { kind: 'item', id: state.board.item };
        state.board.item = null;
        state.board.progress = 0;
        sfx.pickup();
        say(state, 'Picked up the chopped veg.');
      } else { say(state, 'The board is busy — hands full too!'); sfx.bad(); }
      return;
    }
    if (carry && carry.kind === 'raw' && INGREDIENTS[carry.base].prep === 'chop') {
      state.board.item = INGREDIENTS[carry.base].served;
      state.board.progress = 0;
      chef.carry = null;
      chef.busy = CHOP_TIME;
      chef.busyLabel = 'Chopping…';
      sfx.chop();
      return;
    }
    say(state, carry ? 'This needs the grill or goes straight on a plate.' : 'Bring something to chop: tomato, lettuce or onion.');
    return;
  }

  if (station.kind === 'grill') {
    const slot = state.grill.findIndex((g) => g === null);
    if (carry && carry.kind === 'raw' && INGREDIENTS[carry.base].prep === 'grill') {
      if (slot === -1) { say(state, 'Both grill slots are full!'); sfx.bad(); return; }
      state.grill[slot] = { id: 'patty', t: 0, state: 'raw' };
      chef.carry = null;
      sfx.sizzle();
      say(state, 'Patty on the grill — watch it, it burns!');
      return;
    }
    const done = state.grill.findIndex((g) => g && g.state === 'cooked');
    if (done !== -1 && !carry) {
      chef.carry = { kind: 'item', id: 'patty' };
      state.grill[done] = null;
      sfx.pickup();
      say(state, 'Hot patty, ready to plate!');
      return;
    }
    const burnt = state.grill.findIndex((g) => g && g.state === 'burnt');
    if (burnt !== -1) {
      state.grill[burnt] = null;
      say(state, 'Burnt patty binned. Watch the grill next time!');
      return;
    }
    say(state, carry ? 'Only raw patties go on the grill.' : 'Grill a raw patty here.');
    return;
  }

  if (station.kind === 'plates') {
    if (carry) { say(state, 'Hands full!'); sfx.bad(); return; }
    chef.carry = { kind: 'plate', items: [] };
    sfx.pickup();
    say(state, 'Clean plate. Build the dish on the assembly counter!');
    return;
  }

  if (station.kind === 'assembly') {
    if (state.plate && !carry) {
      chef.carry = { kind: 'plate', items: state.plate.items };
      state.plate = null;
      sfx.pickup();
      say(state, 'Picked the plate back up.');
      return;
    }
    if (carry && carry.kind === 'plate' && !state.plate) {
      state.plate = { items: carry.items };
      chef.carry = null;
      sfx.place();
      say(state, 'Plate on the counter. Add ingredients to it!');
      return;
    }
    if (carry && carry.kind === 'item' && state.plate) {
      state.plate.items.push(carry.id);
      chef.carry = null;
      sfx.place();
      say(state, `Added ${INGREDIENTS[carry.id].name} to the plate.`);
      return;
    }
    if (!state.plate && !carry) { say(state, 'Bring a plate from the plate stack first.'); return; }
    if (carry && carry.kind === 'raw') { say(state, 'Prep it first — chop it or grill it!'); sfx.bad(); return; }
    say(state, 'Nothing to do here right now.');
    return;
  }

  if (station.kind === 'serve') {
    if (carry && carry.kind === 'plate') {
      state.plate = { items: carry.items };
      chef.carry = null;
      servePlate(state);
      return;
    }
    if (state.plate) { servePlate(state); return; }
    say(state, 'Bring a finished plate to serve!');
    return;
  }

  if (station.kind === 'trash') {
    if (carry) {
      chef.carry = null;
      sfx.place();
      say(state, 'Binned it.');
      return;
    }
    say(state, 'Nothing to throw away.');
  }
}

// Walk the chef toward a target point, stopping at counters and walls.
export function moveChef(state, dt, keys) {
  const chef = state.chef;
  if (chef.busy > 0) return;
  let dx = 0;
  let dy = 0;
  if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
  if (keys.has('arrowright') || keys.has('d')) dx += 1;
  if (keys.has('arrowup') || keys.has('w')) dy -= 1;
  if (keys.has('arrowdown') || keys.has('s')) dy += 1;
  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    chef.x += (dx / len) * CHEF_SPEED * dt;
    chef.y += (dy / len) * CHEF_SPEED * dt;
    chef.moving = true;
    chef.face = dx !== 0 ? Math.sign(dx) : chef.face;
    chef.walkPhase += dt * 12;
    chef.tx = chef.x;
    chef.ty = chef.y;
    clampChef(state);
    return;
  }
  const ddx = chef.tx - chef.x;
  const ddy = chef.ty - chef.y;
  const dist = Math.hypot(ddx, ddy);
  if (dist > 4) {
    const step = Math.min(dist, CHEF_SPEED * dt);
    chef.x += (ddx / dist) * step;
    chef.y += (ddy / dist) * step;
    chef.moving = true;
    chef.face = Math.abs(ddx) > 2 ? Math.sign(ddx) : chef.face;
    chef.walkPhase += dt * 12;
  } else {
    chef.moving = false;
  }
  clampChef(state);
}

function clampChef(state) {
  const chef = state.chef;
  chef.x = Math.max(FLOOR.x + 18, Math.min(FLOOR.x + FLOOR.w - 18, chef.x));
  chef.y = Math.max(FLOOR.y + 22, Math.min(FLOOR.y + FLOOR.h - 18, chef.y));
  for (const s of STATIONS) {
    const r = 20;
    if (chef.x > s.x - r && chef.x < s.x + s.w + r && chef.y > s.y - r && chef.y < s.y + s.h + r) {
      const pushL = chef.x - (s.x - r);
      const pushR = (s.x + s.w + r) - chef.x;
      const pushT = chef.y - (s.y - r);
      const pushB = (s.y + s.h + r) - chef.y;
      const m = Math.min(pushL, pushR, pushT, pushB);
      if (m === pushL) chef.x = s.x - r;
      else if (m === pushR) chef.x = s.x + s.w + r;
      else if (m === pushT) chef.y = s.y - r;
      else chef.y = s.y + s.h + r;
    }
  }
}

export function update(state, dt) {
  if (state.mode !== 'play') return;
  state.time += dt;
  state.shiftLeft = Math.max(0, SHIFT_LENGTH - state.time);

  const second = Math.floor(state.shiftLeft);
  if (state.shiftLeft <= 10 && second !== state.lastTickSecond && state.shiftLeft > 0) {
    state.lastTickSecond = second;
    sfx.tick();
  }
  if (state.shiftLeft <= 0) {
    endShift(state, 'Shift over! The kitchen closes its doors.');
    return;
  }

  const chef = state.chef;
  if (chef.busy > 0) {
    chef.busy -= dt;
    if (state.board.item) state.board.progress = Math.min(1, 1 - chef.busy / CHOP_TIME);
    if (chef.busy <= 0) {
      state.board.progress = 1;
      sfx.chopDone();
      say(state, 'Chopped! Grab it off the board.');
    }
    if (chef.busy < 0) chef.busy = 0;
  }

  // Grill: raw -> cooked -> burnt.
  for (const slot of state.grill) {
    if (!slot) continue;
    slot.t += dt;
    if (slot.state === 'raw' && slot.t >= GRILL_TIME) { slot.state = 'cooked'; sfx.sizzle(); }
    else if (slot.state === 'cooked' && slot.t >= BURN_TIME) { slot.state = 'burnt'; say(state, 'A patty burnt on the grill!'); }
  }

  // Orders: new ones arrive, patience drains, walk-outs cost a heart.
  state.orderTimer -= dt;
  if (state.orderTimer <= 0) {
    spawnOrder(state);
    state.orderTimer = ORDER_EVERY;
  }
  for (const order of state.orders.slice()) {
    order.patience -= dt;
    if (order.patience <= 0) {
      const recipe = RECIPES.find((r) => r.id === order.recipeId);
      state.orders = state.orders.filter((o) => o.id !== order.id);
      loseHeart(state, `A customer walked out — no ${recipe.name}!`);
      if (state.mode !== 'play') return;
    }
  }

  if (state.messageT > 0) state.messageT -= dt;
  for (const p of state.particles) {
    p.t += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 160 * dt;
  }
  state.particles = state.particles.filter((p) => p.t < p.life);
  for (const f of state.floats) f.t += dt;
  state.floats = state.floats.filter((f) => f.t < f.life);
}
