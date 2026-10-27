// Procedural WebAudio (no files). Deliberately quiet and sparse (owner feedback
// 2026-10-27: "much more infrequent and background"): a soft hum that darkens
// each era, plus a handful of gentle one-shots (choice, era change, the AI
// looking back, debrief, ending). Buttons don't click. Starts on the first user gesture.

const MASTER = 0.35;       // overall level
const DRONE = 0.018;       // background hum
const AIR = 0.004;         // breath of noise under the hum
const ALARM_GAP = 20;      // seconds: the "AI looks back" sting plays at most this often

const ERA_ROOT = [110, 98, 87.31, 77.78, 65.41]; // A2 → C2: lower every era
const ERA_CUTOFF = [520, 440, 380, 320, 280];
const ERA_TENSION = [0, 0.08, 0.16, 0.24, 0.32]; // a tritone creeps in, quietly

export class AudioEngine {
  constructor({ muted = false } = {}) {
    this.muted = muted;
    this.ctx = null;
    this.era = 1;
  }

  /** Call from a user gesture. Safe to call repeatedly. */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { this.ctx = new AC(); } catch { return; }
    const ctx = this.ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.connect(ctx.destination);
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : MASTER;
    this.master.connect(comp);
    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.4;
    this.sfx.connect(this.master);
    this.startDrone();
  }

  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {}); }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); }

  setMuted(m) {
    this.muted = !!m;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : MASTER, this.ctx.currentTime, 0.08);
  }

  get now() { return this.ctx.currentTime; }

  startDrone() {
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.setTargetAtTime(DRONE, ctx.currentTime, 6);
    out.connect(this.master);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = ERA_CUTOFF[0];
    filter.Q.value = 0.8;
    filter.connect(out);
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 60;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    const voice = (type, ratio, gain) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = ERA_ROOT[0] * ratio;
      g.gain.value = gain;
      o.connect(g).connect(filter);
      o.start();
      return { o, g, ratio };
    };
    this.voices = [voice('triangle', 1, 0.3), voice('sine', 1.006, 0.25), voice('sine', 0.5, 0.9), voice('sine', 1.5, 0.08)];
    this.tension = voice('sine', Math.SQRT2, 0);
    this.filter = filter;

    // Air: looped noise through a wandering band-pass.
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 600;
    bp.Q.value = 0.5;
    const ng = ctx.createGain();
    ng.gain.value = AIR;
    const wob = ctx.createOscillator();
    const wobGain = ctx.createGain();
    wob.frequency.value = 0.05;
    wobGain.gain.value = 250;
    wob.connect(wobGain).connect(bp.frequency);
    wob.start();
    noise.connect(bp).connect(ng).connect(this.master);
    noise.start();
    this.noiseBuf = buf;
    this.setEra(this.era, true);
  }

  /** Retunes the drone lower and darker for era n. */
  setEra(n, instant = false) {
    this.era = n;
    if (!this.ctx || !this.voices) return;
    const i = Math.max(0, Math.min(4, n - 1));
    const tc = instant ? 0.01 : 2;
    const t = this.now;
    for (const v of this.voices) v.o.frequency.setTargetAtTime(ERA_ROOT[i] * v.ratio, t, tc);
    this.tension.o.frequency.setTargetAtTime(ERA_ROOT[i] * Math.SQRT2, t, tc);
    this.tension.g.gain.setTargetAtTime(ERA_TENSION[i], t, tc);
    this.filter.frequency.setTargetAtTime(ERA_CUTOFF[i], t, tc);
  }

  // ── One-shots ──────────────────────────────────────────────────────

  tone(freq, { type = 'sine', at = 0, attack = 0.005, decay = 0.2, gain = 0.06, to = null, dest = null } = {}) {
    if (!this.ctx) return;
    const t = this.now + at;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + attack + decay);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    o.connect(g).connect(dest || this.sfx);
    o.start(t);
    o.stop(t + attack + decay + 0.05);
  }

  noiseBurst({ at = 0, dur = 0.8, from = 200, to = 2000, gain = 0.08, q = 1.2 } = {}) {
    if (!this.ctx || !this.noiseBuf) return;
    const t = this.now + at;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = q;
    bp.frequency.setValueAtTime(from, t);
    bp.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(this.sfx);
    src.start(t, Math.random());
    src.stop(t + dur + 0.05);
  }

  /** Buttons are silent; kept so callers don't need to change. */
  click() {}

  /** Choosing an option: one soft note. */
  confirm() { this.tone(660, { attack: 0.02, decay: 0.5, gain: 0.018 }); }

  /** The AI looks back. */
  alarm() {
    if (!this.ctx || this.now - (this.lastAlarm ?? -Infinity) < ALARM_GAP) return;
    this.lastAlarm = this.now;
    this.tone(70, { to: 52, attack: 0.6, decay: 2.2, gain: 0.07 });
    this.tone(207.65, { attack: 0.8, decay: 1.8, gain: 0.01 });
    this.noiseBurst({ dur: 2.0, from: 900, to: 250, gain: 0.01 });
  }

  /** Debrief rows: rising chimes. */
  reveal(i = 0, good = true) {
    if (i !== 0) return; // one quiet chime per debrief, not one per row
    this.tone(good ? 523.25 : 440, { attack: 0.02, decay: 1.2, gain: 0.015 });
  }

  /** Era transition. */
  whoosh() { this.noiseBurst({ dur: 1.6, from: 180, to: 1400, gain: 0.015, q: 0.8 }); }

  ending(tone) {
    const chords = {
      good: [261.63, 329.63, 392, 493.88],
      mixed: [261.63, 349.23, 392, 466.16],
      bad: [130.81, 155.56, 185, 246.94],
    };
    (chords[tone] || chords.mixed).forEach((f, i) => this.tone(f, { type: 'sine', at: i * 0.12, attack: 1.5, decay: 3.5, gain: 0.012 }));
  }
}
