/**
 * SFX — fully synthesized arcade fighting-game sound effects via the
 * Web Audio API. No external audio files: everything is generated on the
 * fly with oscillators + filtered noise, so there is zero load time or
 * network dependency (important mid real-time match).
 */
const SFX = (() => {
  let ctx = null;
  let unlocked = false;
  let muted = false;

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    return ctx;
  }

  // Must be called from within a user-gesture handler (click/tap) to
  // satisfy browser autoplay policies.
  function unlock() {
    const c = getCtx();
    if (!c) return;
    if (c.state === "suspended") c.resume();
    unlocked = true;
  }

  function toggleMute() {
    muted = !muted;
    return muted;
  }

  function master() {
    const c = getCtx();
    if (!c) return null;
    const g = c.createGain();
    g.gain.value = 0.55;
    g.connect(c.destination);
    return g;
  }

  // --- low-level building blocks -------------------------------------
  function tone(freq, { type = "sine", start = 0, dur = 0.15, vol = 0.3, slideTo = null, out = null } = {}) {
    const c = getCtx();
    if (!c || muted) return;
    const t0 = c.currentTime + start;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo != null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(out || master());
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noiseBurst({ start = 0, dur = 0.12, vol = 0.3, filterFreq = 1800, filterType = "bandpass", out = null } = {}) {
    const c = getCtx();
    if (!c || muted) return;
    const t0 = c.currentTime + start;
    const bufSize = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = filterType;
    filt.frequency.value = filterFreq;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt);
    filt.connect(g);
    g.connect(out || master());
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  // --- game sound effects ----------------------------------------------
  function click() {
    tone(620, { type: "square", dur: 0.05, vol: 0.18 });
  }

  function matchFound() {
    tone(440, { type: "triangle", dur: 0.1, vol: 0.25 });
    tone(660, { type: "triangle", dur: 0.14, start: 0.08, vol: 0.25 });
    tone(880, { type: "triangle", dur: 0.22, start: 0.17, vol: 0.28 });
  }

  function countdownBeep(isLast) {
    tone(isLast ? 880 : 520, { type: "square", dur: isLast ? 0.28 : 0.1, vol: 0.3 });
  }

  const ATTACK_SOUND = {
    jab: () => {
      noiseBurst({ dur: 0.07, vol: 0.35, filterFreq: 1200, filterType: "lowpass" });
      tone(180, { type: "sine", dur: 0.09, vol: 0.4, slideTo: 60 });
    },
    roundhouse: () => {
      noiseBurst({ dur: 0.22, vol: 0.22, filterFreq: 2600, filterType: "bandpass" });
      tone(240, { type: "sawtooth", dur: 0.2, vol: 0.22, slideTo: 90, start: 0.08 });
    },
    slash: () => {
      noiseBurst({ dur: 0.14, vol: 0.28, filterFreq: 4200, filterType: "highpass" });
      tone(1400, { type: "sine", dur: 0.16, vol: 0.18, slideTo: 2200 });
    },
    flamepunch: () => {
      noiseBurst({ dur: 0.3, vol: 0.3, filterFreq: 900, filterType: "lowpass" });
      tone(140, { type: "sawtooth", dur: 0.28, vol: 0.32, slideTo: 40 });
      tone(90, { type: "square", dur: 0.22, vol: 0.2, start: 0.05 });
    },
  };

  function attack(kind) {
    (ATTACK_SOUND[kind] || ATTACK_SOUND.jab)();
  }

  function hitImpact(damage) {
    const intensity = Math.min(1, 0.4 + (damage || 10) / 30);
    noiseBurst({ dur: 0.08, vol: 0.4 * intensity, filterFreq: 1500, filterType: "lowpass" });
    tone(110, { type: "square", dur: 0.12, vol: 0.45 * intensity, slideTo: 45 });
  }

  function ko() {
    tone(260, { type: "sawtooth", dur: 0.5, vol: 0.35, slideTo: 40 });
    noiseBurst({ dur: 0.4, vol: 0.35, filterFreq: 600, filterType: "lowpass", start: 0.05 });
    tone(880, { type: "square", dur: 0.08, vol: 0.2, start: 0.02 });
  }

  function victory() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C (major arpeggio)
    notes.forEach((f, i) => tone(f, { type: "triangle", dur: 0.28, start: i * 0.12, vol: 0.3 }));
  }

  function defeat() {
    const notes = [392, 349.23, 293.66, 220]; // descending minor-ish
    notes.forEach((f, i) => tone(f, { type: "sawtooth", dur: 0.3, start: i * 0.14, vol: 0.22 }));
  }

  return { unlock, toggleMute, click, matchFound, countdownBeep, attack, hitImpact, ko, victory, defeat };
})();
