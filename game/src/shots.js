// shots.js — deterministic demo states for the screenshots. The game reads
// ?shot=<name>&seed=<n> and poses itself: title, a busy mid-game kitchen,
// a chop in progress, and a plate ready to serve. These states are only
// poses for screenshots; real play never uses them.
import { RECIPES } from './config.js';
import { newGame } from './state.js';

function order(state, recipeId, patience) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  state.orders.push({ id: state.orders.length + 1, recipeId, patience, maxPatience: 48, fresh: false });
  return recipe;
}

export function applyShot(state, shot) {
  const s = state;
  if (shot === 'start') {
    s.mode = 'title';
    s.time = 3;
    return;
  }
  if (shot === 'end') {
    s.mode = 'over';
    s.time = 0;
    s.served = 11;
    s.missed = 2;
    s.coins = 264;
    s.score = 3120;
    s.bestCombo = 4;
    s.stars = 2;
    s.overReason = 'Shift over! The kitchen closes its doors.';
    return;
  }

  s.mode = 'play';
  if (shot === 'chop') {
    s.time = 34;
    s.shiftLeft = 116;
    s.score = 640;
    s.coins = 96;
    s.served = 3;
    s.combo = 2;
    order(s, 'burger', 26);
    order(s, 'salad', 38);
    s.chef.x = 765; s.chef.y = 252; s.chef.tx = 765; s.chef.ty = 252;
    s.chef.busy = 0.9; s.chef.busyLabel = 'Chopping…';
    s.board.item = 'tomato';
    s.board.progress = 0.55;
    s.grill[0] = { id: 'patty', t: 3.4, state: 'raw' };
    s.grill[1] = { id: 'patty', t: 6.2, state: 'cooked' };
    s.message = 'Chopping… grab it off the board when the ring fills!';
    s.messageT = 99;
    return;
  }
  if (shot === 'serve') {
    s.time = 127;
    s.shiftLeft = 23;
    s.score = 2840;
    s.coins = 312;
    s.served = 10;
    s.combo = 4;
    order(s, 'burger', 9);
    order(s, 'stack', 21);
    order(s, 'melt', 33);
    s.chef.x = 1094; s.chef.y = 536; s.chef.tx = 1094; s.chef.ty = 536;
    s.chef.face = 1;
    s.chef.carry = { kind: 'plate', items: ['bun', 'patty', 'cheese', 'lettuce'] };
    s.grill[0] = { id: 'patty', t: 7.8, state: 'cooked' };
    s.message = 'Golden Burger ready — ring the bell to serve!';
    s.messageT = 99;
    return;
  }
  // 'cover' (and any unknown shot): the busiest, most complete kitchen.
  s.time = 61;
  s.shiftLeft = 89;
  s.score = 1470;
  s.coins = 168;
  s.served = 6;
  s.combo = 3;
  order(s, 'burger', 31);
  order(s, 'salad', 18);
  order(s, 'melt', 42);
  s.chef.x = 810; s.chef.y = 536; s.chef.tx = 810; s.chef.ty = 536;
  s.chef.face = 1;
  s.plate = { items: ['bun', 'patty', 'cheese'] };
  s.board.item = 'lettuce';
  s.board.progress = 0.7;
  s.grill[0] = { id: 'patty', t: 2.1, state: 'raw' };
  s.grill[1] = { id: 'patty', t: 5.6, state: 'cooked' };
  s.message = 'Burger needs lettuce — chop it, plate it, serve it!';
  s.messageT = 99;
}

export function shotState(shot, seed) {
  const state = newGame(seed);
  applyShot(state, shot || 'cover');
  return state;
}
