// Synthesized Game Sound Effects Engine using browser's native Web Audio API
// This avoids needing local file assets and plays immediately.

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume context if suspended (browser security autoplay policies)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playClick = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.warn("Audio playing blocked or unsupported:", e);
  }
};

export const playSuccess = () => {
  try {
    const ctx = getAudioContext();
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (C Major Triad)
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  } catch (e) {
    console.warn("Audio playing blocked or unsupported:", e);
  }
};

export const playFailure = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play two slightly detuned oscillators to make a retro buzz sound
    [130, 133].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.35);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(now + 0.4);
    });
  } catch (e) {
    console.warn("Audio playing blocked or unsupported:", e);
  }
};

export const playCoin = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Mario-like double-tone chime (B5 -> E6)
    const t1 = now;
    const t2 = now + 0.08;

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(987.77, t1); // B5
    gain1.gain.setValueAtTime(0.12, t1);
    gain1.gain.exponentialRampToValueAtTime(0.01, t1 + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t1);
    osc1.stop(t1 + 0.32);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, t2); // E6
    gain2.gain.setValueAtTime(0.12, t2);
    gain2.gain.exponentialRampToValueAtTime(0.01, t2 + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t2);
    osc2.stop(t2 + 0.38);
  } catch (e) {
    console.warn("Audio playing blocked or unsupported:", e);
  }
};

export const playPlant = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.25);

    // Add noise simulation
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch (e) {
    console.warn("Audio playing blocked or unsupported:", e);
  }
};

export const playLevelUp = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Ascending arpeggio sweep in C Major: C4, G4, C5, E5, G5, C6
    const freqs = [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  } catch (e) {
    console.warn("Audio playing blocked or unsupported:", e);
  }
};
