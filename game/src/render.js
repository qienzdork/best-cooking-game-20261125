// render.js — every pixel of The Golden Skillet, drawn with canvas code.
// One clear job: turn state into a picture. No rules, no input here.
import { INGREDIENTS, RECIPES, STATIONS, VIEW_H, VIEW_W } from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = 'bold', align = 'center', font = 'Georgia, serif') {
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

// ---- food icons, drawn with code only (no image assets) ----
export function drawIngredient(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'tomato' || id === 'tomato-raw') {
    ctx.fillStyle = '#e5484d';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c22f34';
    ctx.beginPath(); ctx.arc(-r * 0.3, r * 0.25, r * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5da24a';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      ctx.ellipse(Math.cos(a) * r * 0.45, -r * 0.55 + Math.sin(a) * r * 0.2, r * 0.28, r * 0.14, a, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.fillStyle = '#3f7a33';
    ctx.beginPath(); ctx.arc(0, -r * 0.55, r * 0.16, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'lettuce' || id === 'lettuce-raw') {
    ctx.fillStyle = '#7ac74f';
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6;
      ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.55, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#a8e07e';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4c8a2f'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.stroke();
  } else if (id === 'onion' || id === 'onion-raw') {
    ctx.fillStyle = '#e8d8f0';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b08cc4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#7ac74f';
    ctx.beginPath(); ctx.ellipse(r * 0.5, -r * 0.8, r * 0.3, r * 0.12, 0.6, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'patty' || id === 'patty-raw') {
    ctx.fillStyle = id === 'patty-raw' ? '#c97e52' : '#8a5a2e';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = id === 'patty-raw' ? '#a85f38' : '#6b421f';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2); ctx.fill();
    if (id === 'patty') {
      ctx.strokeStyle = '#4a2c12'; ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(i * r * 0.5 - r * 0.3, -r * 0.5); ctx.lineTo(i * r * 0.5 + r * 0.3, r * 0.5); ctx.stroke();
      }
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = '#ffc93c';
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.7); ctx.lineTo(0, -r); ctx.lineTo(r, r * 0.7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8a91c';
    ctx.beginPath(); ctx.arc(-r * 0.3, r * 0.25, r * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.25, r * 0.4, r * 0.12, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'bun') {
    ctx.fillStyle = '#e8a95c';
    ctx.beginPath(); ctx.arc(0, r * 0.25, r, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c9853e';
    ctx.fillRect(-r, r * 0.2, r * 2, r * 0.25);
    ctx.fillStyle = '#fff3d6';
    for (const [sx, sy] of [[-0.45, -0.35], [0.1, -0.55], [0.5, -0.25], [-0.05, -0.15]]) {
      ctx.beginPath(); ctx.ellipse(sx * r, sy * r, r * 0.09, r * 0.05, 0.4, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

export function drawPlate(ctx, x, y, r, items) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#f4f1ea';
  ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.62, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9c2b2'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.78, r * 0.48, 0, 0, Math.PI * 2); ctx.stroke();
  if (items && items.length) {
    const n = items.length;
    items.forEach((id, i) => {
      const ox = (i - (n - 1) / 2) * r * 0.42;
      drawIngredient(ctx, id, ox, -r * 0.08 - i * 1.5, r * 0.34);
    });
  }
  ctx.restore();
}

function drawFlame(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  const wob = Math.sin(t * 9 + x * 0.05) * 0.15;
  ctx.fillStyle = '#ff7b2f';
  ctx.beginPath();
  ctx.moveTo(-s * 0.7, 0);
  ctx.quadraticCurveTo(-s * 0.9, -s * 1.1, wob * s, -s * 1.7);
  ctx.quadraticCurveTo(s * 0.9, -s * 1.1, s * 0.7, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(-s * 0.35, 0);
  ctx.quadraticCurveTo(-s * 0.45, -s * 0.6, wob * s * 0.5, -s * 0.95);
  ctx.quadraticCurveTo(s * 0.45, -s * 0.6, s * 0.35, 0);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawStation(ctx, state, s) {
  const t = state.time;
  ctx.save();
  // counter body
  ctx.fillStyle = '#5d4030';
  rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
  ctx.fillStyle = '#8d6e4f';
  rr(ctx, s.x + 3, s.y + 3, s.w - 6, 20, 6); ctx.fill();
  ctx.fillStyle = '#6b4a2f';
  rr(ctx, s.x + 3, s.y + 26, s.w - 6, s.h - 29, 6); ctx.fill();
  text(ctx, s.label, s.x + s.w / 2, s.y + s.h - 12, 12, '#f5e6c8', 'bold', 'center', 'Verdana, sans-serif');

  const cx = s.x + s.w / 2;
  const cy = s.y + 34;
  if (s.kind === 'crate') {
    const ing = INGREDIENTS[s.item];
    ctx.fillStyle = '#3a2a1c';
    rr(ctx, s.x + 10, s.y + 12, s.w - 20, 34, 6); ctx.fill();
    for (let i = 0; i < 3; i++) {
      drawIngredient(ctx, ing.raw, s.x + 24 + i * 28, cy, 12);
    }
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(s.x + s.w - 14, s.y + 16, 5, 0, Math.PI * 2); ctx.fill();
  } else if (s.kind === 'board') {
    ctx.fillStyle = '#e8d8b0';
    rr(ctx, s.x + 12, s.y + 10, s.w - 24, 38, 6); ctx.fill();
    ctx.strokeStyle = '#c9b183'; ctx.lineWidth = 1.5;
    ctx.strokeRect(s.x + 18, s.y + 15, s.w - 36, 28);
    if (state.board.item) {
      drawIngredient(ctx, state.board.item, cx - 18, cy, 13);
      const done = state.board.progress >= 1;
      ctx.fillStyle = done ? '#7ac74f' : '#ff9f43';
      rr(ctx, s.x + 14, s.y + 50, (s.w - 28) * (done ? 1 : state.board.progress), 6, 3); ctx.fill();
      if (done) text(ctx, 'READY!', cx + 34, cy, 13, '#7ac74f', 'bold', 'center', 'Verdana, sans-serif');
    } else {
      ctx.fillStyle = '#9a7d4f';
      ctx.fillRect(cx + 30, cy - 14, 4, 26);
      ctx.beginPath(); ctx.moveTo(cx + 30, cy - 14); ctx.lineTo(cx + 52, cy - 2); ctx.lineTo(cx + 30, cy + 2); ctx.closePath(); ctx.fill();
    }
  } else if (s.kind === 'grill') {
    ctx.fillStyle = '#2b2b2e';
    rr(ctx, s.x + 10, s.y + 10, s.w - 20, 40, 6); ctx.fill();
    ctx.strokeStyle = '#55555c'; ctx.lineWidth = 2;
    for (let i = 1; i < 6; i++) {
      ctx.beginPath(); ctx.moveTo(s.x + 10 + i * ((s.w - 20) / 6), s.y + 12); ctx.lineTo(s.x + 10 + i * ((s.w - 20) / 6), s.y + 48); ctx.stroke();
    }
    state.grill.forEach((slot, i) => {
      const gx = s.x + 48 + i * 84;
      if (slot) {
        if (slot.state !== 'burnt') {
          drawFlame(ctx, gx - 17, s.y + 46, 6, t + i);
          drawFlame(ctx, gx + 17, s.y + 46, 6, t + i * 2);
        }
        ctx.fillStyle = slot.state === 'burnt' ? '#1c1c1c' : slot.state === 'cooked' ? '#8a5a2e' : '#c97e52';
        ctx.beginPath(); ctx.arc(gx, cy, 12, 0, Math.PI * 2); ctx.fill();
        if (slot.state === 'cooked') {
          ctx.strokeStyle = '#4a2c12'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(gx - 8, cy - 6); ctx.lineTo(gx + 8, cy + 6); ctx.stroke();
        }
        if (slot.state === 'burnt') text(ctx, 'BURNT!', gx, cy - 24, 11, '#e5484d', 'bold', 'center', 'Verdana, sans-serif');
      } else {
        ctx.strokeStyle = '#77777e'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(gx, cy, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  } else if (s.kind === 'plates') {
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === 2 ? '#f4f1ea' : '#d9d2c2';
      ctx.beginPath(); ctx.ellipse(cx, cy + 8 - i * 5, 26, 9, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else if (s.kind === 'assembly') {
    ctx.fillStyle = '#3a2a1c';
    rr(ctx, s.x + 10, s.y + 10, s.w - 20, 38, 6); ctx.fill();
    if (state.plate) drawPlate(ctx, cx, cy + 4, 34, state.plate.items);
    else text(ctx, 'place a plate here', cx, cy, 12, '#8a7a5f', 'bold', 'center', 'Verdana, sans-serif');
  } else if (s.kind === 'serve') {
    ctx.fillStyle = '#7a1f1f';
    rr(ctx, s.x + 8, s.y + 8, s.w - 16, 26, 5); ctx.fill();
    text(ctx, 'SERVICE  •  RING THE BELL', cx, s.y + 21, 12, '#ffd166', 'bold', 'center', 'Verdana, sans-serif');
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(cx, cy + 12, 9, Math.PI, 0); ctx.fill();
    ctx.fillRect(cx - 12, cy + 12, 24, 3);
  } else if (s.kind === 'trash') {
    ctx.fillStyle = '#3c3c40';
    rr(ctx, s.x + 16, s.y + 12, s.w - 32, 40, 5); ctx.fill();
    ctx.fillStyle = '#55555c';
    ctx.fillRect(s.x + 12, s.y + 8, s.w - 24, 7);
    text(ctx, 'BIN', cx, cy + 2, 13, '#b9b9c0', 'bold', 'center', 'Verdana, sans-serif');
  }
  ctx.restore();
}

function drawChef(ctx, state) {
  const chef = state.chef;
  const bob = chef.moving ? Math.sin(chef.walkPhase) * 2.5 : Math.sin(state.time * 2) * 1;
  const x = chef.x;
  const y = chef.y + bob * 0.4;
  ctx.save();
  ctx.translate(x, y);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 16, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
  // body / apron
  ctx.fillStyle = '#f4f1ea';
  ctx.beginPath(); ctx.ellipse(0, 6, 17, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2e6fb0';
  ctx.beginPath(); ctx.ellipse(0, 10, 12, 9, 0, 0, Math.PI); ctx.fill();
  // head
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath(); ctx.arc(0, -14, 13, 0, Math.PI * 2); ctx.fill();
  // chef hat
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-8, -24, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -28, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(8, -24, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-11, -26, 22, 7);
  // face
  ctx.fillStyle = '#26221e';
  ctx.beginPath(); ctx.arc(-4.5 + chef.face * 1.5, -15, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4.5 + chef.face * 1.5, -15, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#26221e'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(chef.face * 1.5, -10, 3.5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // busy ring (chopping)
  if (chef.busy > 0) {
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, -8, 26, -Math.PI / 2, -Math.PI / 2 + (1 - chef.busy / 1.6) * Math.PI * 2); ctx.stroke();
    text(ctx, chef.busyLabel, 0, 40, 13, '#ffd166', 'bold', 'center', 'Verdana, sans-serif');
  }
  // carried item above the hat
  const carry = chef.carry;
  if (carry) {
    if (carry.kind === 'plate') drawPlate(ctx, 0, -48, 20, carry.items);
    else if (carry.kind === 'raw') drawIngredient(ctx, carry.id, 0, -48, 13);
    else drawIngredient(ctx, carry.id, 0, -48, 13);
  }
  ctx.restore();
}

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function drawOrderBoard(ctx, state) {
  // board background
  ctx.fillStyle = '#2e2118';
  ctx.fillRect(0, 0, VIEW_W, 132);
  ctx.fillStyle = '#4a3423';
  ctx.fillRect(0, 128, VIEW_W, 4);
  text(ctx, 'ORDER BOARD', 24, 24, 20, '#ffd166', 'bold', 'left');
  text(ctx, 'serve the ticket before its bar runs out', 24, 48, 12, '#c9a582', 'bold', 'left', 'Verdana, sans-serif');
  // tickets
  const tickets = state.orders;
  tickets.forEach((order, i) => {
    const recipe = RECIPES.find((r) => r.id === order.recipeId);
    const x = 300 + i * 196;
    const y = 14;
    const w = 184;
    const h = 104;
    const frac = Math.max(0, order.patience / order.maxPatience);
    const urgent = frac < 0.35;
    const pulse = urgent ? 0.75 + Math.sin(state.time * 8) * 0.25 : 1;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = urgent ? '#fff0e0' : '#fdf6e3';
    rr(ctx, x, y, w, h, 8); ctx.fill();
    ctx.strokeStyle = urgent ? '#e5484d' : '#d8c9a3'; ctx.lineWidth = 2;
    rr(ctx, x, y, w, h, 8); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#3a2a1c';
    text(ctx, recipe.name, x + 12, y + 16, 15, '#3a2a1c', 'bold', 'left');
    text(ctx, `$${recipe.price}`, x + w - 10, y + 16, 15, '#2e6b34', 'bold', 'right');
    recipe.items.forEach((id, j) => {
      drawIngredient(ctx, id, x + 26 + j * 34, y + 46, 13);
    });
    // patience bar
    ctx.fillStyle = '#e5dcc4';
    rr(ctx, x + 12, y + 70, w - 24, 10, 5); ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#7ac74f' : frac > 0.25 ? '#ff9f43' : '#e5484d';
    if (frac > 0) { rr(ctx, x + 12, y + 70, (w - 24) * frac, 10, 5); ctx.fill(); }
    if (urgent) text(ctx, 'HURRY!', x + 12, y + 94, 11, '#e5484d', 'bold', 'left', 'Verdana, sans-serif');
    text(ctx, `${Math.ceil(order.patience)}s left`, x + w - 12, y + 94, 11, '#3a2a1c', 'bold', 'right', 'Verdana, sans-serif');
  });
  if (!tickets.length) {
    text(ctx, 'No orders — the calm before the rush…', 300, 66, 16, '#8a7a5f', 'bold', 'left');
  }
  // HUD: timer, score, coins, hearts
  const hx = VIEW_W - 230;
  const lowTime = state.shiftLeft <= 30;
  ctx.fillStyle = '#fdf6e3';
  rr(ctx, hx, 12, 214, 52, 10); ctx.fill();
  if (lowTime && state.mode === 'play') {
    ctx.strokeStyle = '#e5484d'; ctx.lineWidth = 3;
    rr(ctx, hx, 12, 214, 52, 10); ctx.stroke();
  }
  text(ctx, 'SHIFT', hx + 14, 28, 11, '#8a7a5f', 'bold', 'left', 'Verdana, sans-serif');
  text(ctx, fmtTime(state.shiftLeft), hx + 14, 50, 26, lowTime ? '#e5484d' : '#3a2a1c', 'bold', 'left', 'Verdana, sans-serif');
  text(ctx, `SCORE ${state.score}`, hx + 208, 28, 12, '#3a2a1c', 'bold', 'right', 'Verdana, sans-serif');
  text(ctx, `🪙 $${state.coins}`, hx + 208, 50, 14, '#8a6d00', 'bold', 'right', 'Verdana, sans-serif');
  // hearts + combo
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < state.hearts ? '#e5484d' : '#5a4632';
    const cxp = hx + 14 + i * 24;
    ctx.beginPath();
    ctx.moveTo(cxp, 74); ctx.arc(cxp - 5, 70, 5, Math.PI, 0); ctx.arc(cxp + 5, 70, 5, Math.PI, 0);
    ctx.lineTo(cxp, 80); ctx.closePath(); ctx.fill();
  }
  text(ctx, state.combo >= 2 ? `COMBO x${state.combo}` : 'THE GOLDEN SKILLET', hx + 100, 76, 12, '#ffd166', 'bold', 'left', 'Verdana, sans-serif');
}

function drawFloor(ctx, state) {
  ctx.fillStyle = '#3a2a1c';
  ctx.fillRect(0, 132, VIEW_W, VIEW_H - 132);
  ctx.fillStyle = '#463322';
  const tile = 64;
  for (let y = 140; y < VIEW_H; y += tile) {
    for (let x = 0; x < VIEW_W; x += tile) {
      if (((x + y) / tile) % 2 === 0) ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4);
    }
  }
  // wall trim + a rug in the middle of the floor + plants for warmth
  ctx.fillStyle = '#5d4030';
  ctx.fillRect(0, 132, VIEW_W, 10);
  ctx.fillStyle = '#7a2e2e';
  rr(ctx, 500, 380, 280, 130, 12); ctx.fill();
  ctx.strokeStyle = '#c9a582'; ctx.lineWidth = 3;
  rr(ctx, 512, 392, 256, 106, 8); ctx.stroke();
  ctx.fillStyle = '#c9a582';
  for (let i = 0; i < 3; i++) {
    const dx = 580 + i * 80;
    ctx.beginPath();
    ctx.moveTo(dx, 425); ctx.lineTo(dx + 12, 445); ctx.lineTo(dx, 465); ctx.lineTo(dx - 12, 445);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#6fae4e';
  ctx.beginPath(); ctx.arc(1240, 690, 16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1224, 682, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(1232, 692, 16, 14);
}

function drawToast(ctx, state) {
  if (state.messageT > 0 && state.message) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.messageT);
    ctx.fillStyle = 'rgba(20,12,6,0.85)';
    const w = Math.min(760, ctx.measureText(state.message).width + 40);
    rr(ctx, VIEW_W / 2 - 330, 648, 660, 40, 20); ctx.fill();
    text(ctx, state.message, VIEW_W / 2, 669, 16, '#fdf6e3', 'bold', 'center', 'Verdana, sans-serif');
    ctx.restore();
  }
  // controls hint
  text(ctx, 'WASD / arrows to move  •  click a station or press E to use it  •  M mute  •  R restart', VIEW_W / 2, 706, 12, '#c9b795', 'bold', 'center', 'Verdana, sans-serif');
}

function drawTitle(ctx, state) {
  ctx.fillStyle = '#2e1c10';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // warm glow
  const g = ctx.createRadialGradient(640, 300, 40, 640, 300, 560);
  g.addColorStop(0, 'rgba(255,180,80,0.28)');
  g.addColorStop(1, 'rgba(46,28,16,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // decorative food row
  ['tomato', 'lettuce', 'patty', 'cheese', 'bun', 'onion'].forEach((id, i) => {
    drawIngredient(ctx, id, 340 + i * 120, 130, 30);
  });
  text(ctx, 'THE GOLDEN SKILLET', 640, 250, 64, '#ffd166', 'bold', 'center', 'Georgia, serif');
  text(ctx, '—  RUSH HOUR KITCHEN  —', 640, 306, 26, '#f5e6c8', 'bold', 'center', 'Georgia, serif');
  text(ctx, 'Orders fly in. Chop it, grill it, plate it, serve it — before the customer walks out.', 640, 350, 18, '#e8d8b0', 'bold', 'center', 'Verdana, sans-serif');
  // how to play card
  ctx.fillStyle = 'rgba(253,246,227,0.96)';
  rr(ctx, 340, 390, 600, 190, 14); ctx.fill();
  const steps = [
    ['1  GRAB', 'Click a crate to pick up an ingredient.'],
    ['2  PREP', 'Chop veg on the board, grill patties — burnt is binned!'],
    ['3  PLATE', 'Take a plate, build the dish on the assembly counter.'],
    ['4  SERVE', 'Ring the bell at the serving window before the timer dies.'],
  ];
  steps.forEach(([head, body], i) => {
    text(ctx, head, 370, 420 + i * 40, 15, '#8a4a12', 'bold', 'left', 'Verdana, sans-serif');
    text(ctx, body, 470, 420 + i * 40, 15, '#3a2a1c', 'bold', 'left', 'Verdana, sans-serif');
  });
  const blink = 0.65 + Math.sin(state.time * 4) * 0.35;
  ctx.save();
  ctx.globalAlpha = blink;
  text(ctx, 'CLICK  or  press  ENTER  to start your shift', 640, 630, 24, '#ffd166', 'bold', 'center', 'Verdana, sans-serif');
  ctx.restore();
  text(ctx, '150-second shift  •  3 strikes and the rush wins  •  combos pay extra', 640, 668, 14, '#c9b795', 'bold', 'center', 'Verdana, sans-serif');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(20,12,6,0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#fdf6e3';
  rr(ctx, 340, 120, 600, 480, 16); ctx.fill();
  text(ctx, 'SHIFT OVER!', 640, 180, 44, '#8a4a12', 'bold', 'center', 'Georgia, serif');
  text(ctx, state.overReason, 640, 222, 16, '#5a4632', 'bold', 'center', 'Verdana, sans-serif');
  // stars
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < state.stars ? '#ffc93c' : '#d8c9a3';
    const sx = 560 + i * 80;
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI / 2 + (k * Math.PI * 2) / 5;
      const a2 = a + Math.PI / 5;
      ctx.lineTo(sx + Math.cos(a) * 26, 268 + Math.sin(a) * 26);
      ctx.lineTo(sx + Math.cos(a2) * 11, 268 + Math.sin(a2) * 11);
    }
    ctx.closePath(); ctx.fill();
  }
  const rows = [
    ['Dishes served', String(state.served)],
    ['Customers lost', String(state.missed)],
    ['Best combo', `x${state.bestCombo}`],
    ['Coins earned', `$${state.coins}`],
    ['Final score', String(state.score)],
  ];
  rows.forEach(([label, value], i) => {
    text(ctx, label, 420, 330 + i * 40, 18, '#5a4632', 'bold', 'left', 'Verdana, sans-serif');
    text(ctx, value, 860, 330 + i * 40, 18, '#3a2a1c', 'bold', 'right', 'Verdana, sans-serif');
  });
  const blink = 0.65 + Math.sin(state.time * 4) * 0.35;
  ctx.save();
  ctx.globalAlpha = blink;
  text(ctx, 'Press R or CLICK to cook again', 640, 560, 22, '#8a4a12', 'bold', 'center', 'Verdana, sans-serif');
  ctx.restore();
}

export function render(ctx, state) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  if (state.mode === 'title') {
    drawTitle(ctx, state);
    return;
  }
  drawFloor(ctx, state);
  for (const s of STATIONS) drawStation(ctx, state, s);
  drawChef(ctx, state);
  // steam / particles
  for (const p of state.particles) {
    ctx.save();
    ctx.globalAlpha = 1 - p.t / p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // floating score texts
  for (const f of state.floats) {
    ctx.save();
    ctx.globalAlpha = 1 - f.t / f.life;
    text(ctx, f.text, f.x, f.y - f.t * 40, 20, f.color, 'bold', 'center', 'Verdana, sans-serif');
    ctx.restore();
  }
  drawOrderBoard(ctx, state);
  drawToast(ctx, state);
  if (state.mode === 'over') drawGameOver(ctx, state);
}
