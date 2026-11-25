// audio.js — all sound is synthesized with WebAudio oscillators. No audio
// files, no network. The context is created lazily on the first gesture so
// headless runs and autoplay policies never break the game.
let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function ensureContext() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch (err) {
    ctx = null;
  }
  return ctx;
}

export function unlockAudio() {
  const c = ensureContext();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

function tone(freq, dur, type, vol, when = 0) {
  if (muted) return;
  const c = ensureContext();
  if (!c) return;
  try {
    const t0 = c.currentTime + when;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch (err) {
    // Sound is garnish; a failed beep never breaks the game.
  }
}

export const sfx = {
  pickup() { tone(520, 0.09, 'triangle', 0.12); },
  place() { tone(340, 0.08, 'triangle', 0.1); tone(460, 0.08, 'sine', 0.08, 0.05); },
  chop() { tone(180, 0.07, 'square', 0.07); },
  chopDone() { tone(660, 0.1, 'triangle', 0.12); tone(880, 0.12, 'triangle', 0.1, 0.07); },
  sizzle() { tone(1200, 0.15, 'sawtooth', 0.03); },
  serve() { tone(523, 0.1, 'triangle', 0.14); tone(659, 0.1, 'triangle', 0.14, 0.09); tone(784, 0.18, 'triangle', 0.14, 0.18); },
  bad() { tone(220, 0.16, 'sawtooth', 0.08); tone(174, 0.22, 'sawtooth', 0.08, 0.12); },
  tick() { tone(980, 0.05, 'square', 0.05); },
  order() { tone(392, 0.1, 'sine', 0.1); tone(523, 0.12, 'sine', 0.1, 0.08); },
  over() { tone(392, 0.2, 'triangle', 0.12); tone(330, 0.2, 'triangle', 0.12, 0.18); tone(262, 0.4, 'triangle', 0.12, 0.36); },
};
