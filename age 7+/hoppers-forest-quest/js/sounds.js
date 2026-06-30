/**
 * Hopper's Forest Quest — Web Audio sound effects (no external files needed)
 */
const HopperSounds = (function () {
  let ctx = null;
  let muted = false;

  function getContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  function tone(freq, duration, type = "sine", volume = 0.15, startFreq = null) {
    if (muted) return;
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

  function noise(duration, volume = 0.08) {
    if (muted) return;
    try {
      const ac = getContext();
      const bufferSize = ac.sampleRate * duration;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const source = ac.createBufferSource();
      const gain = ac.createGain();
      source.buffer = buffer;
      gain.gain.setValueAtTime(volume, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      source.connect(gain);
      gain.connect(ac.destination);
      source.start();
    } catch (_) {}
  }

  return {
    unlock() {
      getContext();
    },

    setMuted(value) {
      muted = value;
    },

    hop() {
      tone(320, 0.06, "sine", 0.12, 420);
    },

    turn() {
      tone(520, 0.08, "triangle", 0.1, 380);
    },

    wall() {
      noise(0.12, 0.18);
      tone(90, 0.15, "square", 0.1);
    },

    error() {
      tone(220, 0.12, "sawtooth", 0.08);
      setTimeout(() => tone(180, 0.15, "sawtooth", 0.07), 80);
    },

    win() {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        setTimeout(() => tone(freq, 0.18, "sine", 0.14), i * 100);
      });
    },

    levelUp() {
      tone(440, 0.1, "sine", 0.1);
      setTimeout(() => tone(554, 0.1, "sine", 0.1), 90);
      setTimeout(() => tone(659, 0.15, "sine", 0.12), 180);
    },

    click() {
      tone(600, 0.04, "sine", 0.06);
    },
  };
})();
