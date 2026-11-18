// Sound effects made with the Web Audio API - no audio files needed.
// An "oscillator" is a tiny synthesizer: give it a pitch (Hz) and a wave shape.

let ctx = null;
let muted = readMuted();

function readMuted() {
  try {
    return localStorage.getItem('reflex-muted') === '1';
  } catch {
    return false;
  }
}

/** Browsers only allow sound after the user clicks something, so we create it lazily. */
function audio() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Plays one note. type: 'sine' | 'square' | 'triangle' | 'sawtooth' */
function beep(freq, durationMs = 120, type = 'sine', delayMs = 0, volume = 0.18) {
  if (muted) return;
  const a = audio();
  if (!a) return;
  const start = a.currentTime + delayMs / 1000;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + durationMs / 1000);
  osc.connect(gain).connect(a.destination);
  osc.start(start);
  osc.stop(start + durationMs / 1000 + 0.02);
}

export const sound = {
  /** The pad's own note (pitch comes from the theme). */
  pad: (tone) => beep(tone, 140, 'triangle'),
  /** Rising "ding-ding" for a correct answer. */
  good: () => {
    beep(660, 90, 'sine');
    beep(990, 120, 'sine', 80);
  },
  /** Low buzz for a mistake. */
  bad: () => beep(110, 280, 'sawtooth', 0, 0.12),
  /** Little fanfare at the end of a run. */
  fanfare: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 160, 'triangle', i * 120)),
  /** Countdown tick. */
  tick: () => beep(880, 60, 'square', 0, 0.06),
  isMuted: () => muted,
  toggleMute() {
    muted = !muted;
    try {
      localStorage.setItem('reflex-muted', muted ? '1' : '0');
    } catch {
      /* private mode: ignore */
    }
    return muted;
  },
};
