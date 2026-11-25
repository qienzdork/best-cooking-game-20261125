// input.js — keyboard and mouse, one clear job: turn browser events into
// game intents (move target, nearest-station use, start, restart, mute).
import { FLOOR, STATIONS } from './config.js';
import { stationAtPoint } from './state.js';
import { unlockAudio, setMuted, isMuted } from './audio.js';

export function createInput(canvas, state, hooks) {
  const keys = new Set();
  let pendingStation = null; // station to use once the chef arrives
  let mouse = { x: 0, y: 0, down: false };

  function canvasPoint(ev) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((ev.clientX - rect.left) / rect.width) * 1280,
      y: ((ev.clientY - rect.top) / rect.height) * 720,
    };
  }

  function nearestStation() {
    let best = null;
    let bestD = Infinity;
    for (const s of STATIONS) {
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h / 2;
      const d = Math.hypot(state.chef.x - cx, state.chef.y - cy);
      if (d < bestD) { bestD = d; best = s; }
    }
    return bestD < 130 ? best : null;
  }

  function useNearest() {
    const s = nearestStation();
    if (s) hooks.onUse(s);
  }

  window.addEventListener('keydown', (ev) => {
    const k = ev.key.toLowerCase();
    unlockAudio();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) ev.preventDefault();
    if (k === 'm') { setMuted(!isMuted()); return; }
    if (k === 'r') { hooks.onRestart(); return; }
    if (k === 'enter' || k === ' ') {
      if (state.mode === 'title') { hooks.onStart(); return; }
      if (state.mode === 'over') { hooks.onRestart(); return; }
      if (k === ' ') useNearest();
      return;
    }
    if (k === 'e') {
      if (state.mode === 'play') useNearest();
      return;
    }
    keys.add(k);
  });
  window.addEventListener('keyup', (ev) => keys.delete(ev.key.toLowerCase()));

  canvas.addEventListener('pointerdown', (ev) => {
    unlockAudio();
    const p = canvasPoint(ev);
    mouse = { x: p.x, y: p.y, down: true };
    if (state.mode === 'title') { hooks.onStart(); return; }
    if (state.mode === 'over') { hooks.onRestart(); return; }
    const s = stationAtPoint(p.x, p.y);
    if (s) {
      state.chef.tx = s.stand.x;
      state.chef.ty = s.stand.y;
      pendingStation = s;
    } else if (p.y > FLOOR.y) {
      state.chef.tx = Math.max(FLOOR.x + 20, Math.min(FLOOR.x + FLOOR.w - 20, p.x));
      state.chef.ty = Math.max(FLOOR.y + 24, Math.min(FLOOR.y + FLOOR.h - 20, p.y));
      pendingStation = null;
    }
  });
  window.addEventListener('pointerup', () => { mouse.down = false; });

  // Called every frame: if the chef reached the station they clicked, use it.
  function tick() {
    if (pendingStation && state.mode === 'play') {
      const d = Math.hypot(state.chef.x - pendingStation.stand.x, state.chef.y - pendingStation.stand.y);
      if (d < 26) {
        hooks.onUse(pendingStation);
        pendingStation = null;
      }
    }
  }

  return { keys, mouse, tick };
}
