let ctx;

function getContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(audioCtx, freq, startTime, duration, gainPeak = 0.16) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playSaveSound() {
  try {
    const audioCtx = getContext();
    const now = audioCtx.currentTime;
    tone(audioCtx, 660, now, 0.12);
    tone(audioCtx, 880, now + 0.09, 0.16);
  } catch {
    // Web Audio unavailable — sound is a nice-to-have, never block the action
  }
}

export function playShareSound() {
  try {
    const audioCtx = getContext();
    const now = audioCtx.currentTime;
    tone(audioCtx, 520, now, 0.1);
    tone(audioCtx, 780, now + 0.07, 0.1);
    tone(audioCtx, 1040, now + 0.14, 0.18);
  } catch {
    // Web Audio unavailable — sound is a nice-to-have, never block the action
  }
}
