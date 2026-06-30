/**
 * Debug Dungeon — Web Audio sound effects (no external files)
 */
const DungeonSounds = (function () {
  let ctx = null;

  function getContext() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, duration, type = "sine", volume = 0.12, startFreq = null) {
    try {
      const ac = getContext();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(startFreq ?? freq, ac.currentTime);
      if (startFreq !== null && startFreq !== freq) {
        osc.frequency.exponentialRampToValueAtTime(freq, ac.currentTime + duration);
      }
      gain.gain.setValueAtTime(volume, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + duration);
    } catch (_) {}
  }

  return {
    correct() {
      tone(523, 0.1, "sine", 0.12);
      setTimeout(() => tone(659, 0.12, "sine", 0.12), 90);
    },
    wrong() {
      tone(180, 0.15, "sawtooth", 0.08);
    },
    hit() {
      tone(880, 0.08, "square", 0.1, 1200);
    },
    defeat() {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => setTimeout(() => tone(f, 0.18, "sine", 0.13), i * 100));
    },
  };
})();
