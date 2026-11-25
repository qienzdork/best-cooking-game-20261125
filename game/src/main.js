// main.js — the entry point: wires state, input and rendering into the
// game loop, and poses the game for screenshots when ?shot= is given.
import { VIEW_H, VIEW_W } from './config.js';
import { newGame, startShift, interact, moveChef, update } from './state.js';
import { render } from './render.js';
import { createInput } from './input.js';
import { shotState } from './shots.js';

// Surface load errors where a headless check can see them.
window.addEventListener('error', (ev) => {
  document.title = `ERR: ${ev.message}`;
});
window.addEventListener('unhandledrejection', (ev) => {
  document.title = `ERR: ${ev.reason}`;
});

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || '20261125') || 20261125;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let state = shot ? shotState(shot, seed) : newGame(seed);

const input = createInput(canvas, state, {
  onStart() {
    if (state.mode === 'title') startShift(state);
  },
  onRestart() {
    const fresh = newGame(seed);
    Object.assign(state, fresh);
    startShift(state);
  },
  onUse(station) {
    interact(state, station);
  },
});

let last = performance.now();
let frames = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  frames += 1;
  if (!shot) {
    // Live play: the clock runs, the chef walks, the kitchen simmers.
    // update() advances state.time in play mode; title/over screens tick here.
    if (state.mode !== 'play') state.time += dt;
    input.tick();
    moveChef(state, dt, input.keys);
    update(state, dt);
  } else {
    // Screenshot pose: freeze the kitchen, but let flames and glow breathe.
    state.time += dt;
    if (state.mode === 'play') {
      state.chef.walkPhase += dt * 2;
    }
  }
  render(ctx, state);
  if (frames === 5) {
    // Signal to headless screenshot runs that the first frames rendered.
    document.title = 'The Golden Skillet — Rush Hour Kitchen';
    window.__shotReady = true;
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
