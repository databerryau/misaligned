// The stage: one canvas behind the DOM UI that draws the current art view,
// crossfades between views, shifts palette per era, plays the "AI looks back"
// beat (light swell + camera push-in), adds risk-debt glitches, film grain and
// vignette. On a phone in portrait the play screen moves the canvas into a
// 16:9 slot above the dialogue (see attach()).

import { ease, clamp, mix, hash, grainSource } from './util.js';
import { titleView, cinematicView, endingView, backdropView, makeDust } from './cinematic.js';
import { hudView } from './hud.js';

const VIEWS = {
  title: titleView,
  cinematic: cinematicView,
  hud: hudView,
  ending: endingView,
  backdrop: backdropView,
};

const FADE = 0.7;      // view crossfade, seconds
const PALETTE = 1.6;   // era palette crossfade, seconds

export class Stage {
  constructor(canvas, { clock, reduced = false } = {}) {
    this.canvas = canvas;
    this.c = canvas.getContext('2d');
    this.clock = clock;
    this.reduced = reduced;
    this.home = canvas.parentNode;
    this.view = 'title';
    this.viewKey = 'title';
    this.cues = {};
    this.tone = null;
    this.era = 1;
    this.layout = 'wide';
    this.debt = 0;
    this.sceneAt = 0;
    this.alarmAt = -1e9;
    this.palFrom = { a: '#7fdcff', b: '#2f6bff' };
    this.palTo = this.palFrom;
    this.palAt = -1e9;
    this.fadeAt = -1e9;
    this.dust = makeDust(reduced ? 55 : 110);
    this.snap = document.createElement('canvas');
    this.W = 640; this.H = 360; this.scale = 1; this.dpr = 1;
    this.resize();
    if ('ResizeObserver' in window) new ResizeObserver(() => this.resize()).observe(canvas);
    window.addEventListener('resize', () => this.resize());
  }

  get t() { return this.clock.time(); }
  get frozen() { return this.clock.frozen; }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w; this.canvas.height = h;
      this.snap.width = w; this.snap.height = h;
      this.fadeAt = -1e9; // a stale snapshot would be the wrong size
    }
    this.dpr = dpr;
    this.W = r.width >= r.height ? 640 : 360;
    this.H = (this.W * r.height) / r.width;
    this.scale = r.width / this.W;
  }

  /** Moves the canvas into `slot` (tall play layout), or back to full-screen with null. */
  attach(slot) {
    const target = slot || this.home;
    if (this.canvas.parentNode === target) return;
    this.snapshot();
    if (slot) { slot.appendChild(this.canvas); this.canvas.classList.add('in-slot'); }
    else { this.home.insertBefore(this.canvas, this.home.firstChild); this.canvas.classList.remove('in-slot'); }
    this.resize();
    this.fadeAt = -1e9;
  }

  setLayout(layout) { this.layout = layout; }

  /** Switches the art view. Same view + same cues is a no-op. */
  setView(view, { cues = {}, tone = null, cut = false } = {}) {
    const key = `${view}|${tone}|${JSON.stringify(cues)}`;
    if (key === this.viewKey) return;
    if (!cut) this.snapshot();
    this.viewKey = key;
    this.view = VIEWS[view] ? view : 'backdrop';
    this.cues = cues || {};
    this.tone = tone;
    this.sceneAt = this.t;
    this.alarmAt = -1e9;
  }

  snapshot() {
    if (this.frozen || !this.canvas.width) return;
    const s = this.snap.getContext('2d');
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.clearRect(0, 0, this.snap.width, this.snap.height);
    s.drawImage(this.canvas, 0, 0);
    this.fadeAt = this.t;
  }

  /** Crossfades to palette {a, b}. */
  setPalette(pal, { instant = false } = {}) {
    if (pal.a === this.palTo.a && pal.b === this.palTo.b) return;
    this.palFrom = instant ? pal : this.palette();
    this.palTo = pal;
    this.palAt = instant || this.frozen ? -1e9 : this.t;
  }

  palette() {
    const u = ease((this.t - this.palAt) / PALETTE);
    if (u >= 1) return this.palTo;
    return { a: mix(this.palFrom.a, this.palTo.a, u), b: mix(this.palFrom.b, this.palTo.b, u) };
  }

  setEra(n) { this.era = n; }
  setDebt(d) { this.debt = d; }

  /** The AI looks back: light swells, a pupil forms, the camera pushes in. */
  alarm() { this.alarmAt = this.frozen ? this.t - 1.0 : this.t; }

  alarmLevel(t = this.t) {
    const d = t - this.alarmAt;
    if (d < 0 || d > 3.8) return 0;
    if (d < 0.45) return ease(d / 0.45);
    if (d < 3.0) return 1;
    return 1 - ease((d - 3.0) / 0.8);
  }

  /** HUD anomaly: ramps in after the scene starts, with a faint flicker. */
  anomalyLevel(t = this.t) {
    if (!this.cues.anomaly) return 0;
    if (this.frozen) return 1;
    const u = ease((t - this.sceneAt - 0.8) / 1.2);
    return u * (0.9 + 0.1 * Math.sin(t * 23) * Math.sin(t * 7));
  }

  frame() {
    const { c, canvas } = this;
    if (!canvas.width || !canvas.height) return;
    const t = this.t;
    const view = VIEWS[this.view];
    const ps = this.dpr * this.scale; // device pixels per unit
    const st = {
      pal: this.palette(), era: this.era, cues: this.cues, tone: this.tone,
      alarm: this.alarmLevel(t), anomaly: this.anomalyLevel(t),
      reduced: this.reduced, layout: this.layout, dust: this.dust, blur: ps / 2,
    };

    reset(c);
    c.setTransform(ps, 0, 0, ps, 0, 0);
    if (view.focus && !this.reduced && this.view === 'cinematic') {
      // Slow drift in, plus the push-in when the AI looks back.
      const [fx, fy] = view.focus(this.W, this.H, st);
      const drift = this.frozen ? 0 : 0.012 * ease((t - this.sceneAt) / 12);
      const z = 1 + drift + 0.07 * ease(st.alarm);
      const d = t - this.alarmAt;
      const shake = d > 0 && d < 0.35 ? (1 - d / 0.35) * 1.4 : 0;
      c.translate(fx + Math.sin(t * 90) * shake, fy + Math.cos(t * 77) * shake);
      c.scale(z, z);
      c.translate(-fx, -fy);
    }
    view.draw(c, this.W, this.H, t, st);
    reset(c);

    if (!this.reduced) this.glitch(t);
    this.grain(t);

    const fd = (t - this.fadeAt) / FADE;
    if (fd >= 0 && fd < 1 && this.snap.width === canvas.width) {
      c.globalAlpha = 1 - ease(fd);
      c.drawImage(this.snap, 0, 0);
      c.globalAlpha = 1;
    }
  }

  /** Horizontal tearing that grows with hidden risk debt (and on bad endings). */
  glitch(t) {
    let g = clamp((this.debt - 15) / 85, 0, 1);
    if (this.view === 'ending' && this.tone === 'bad') g = Math.max(g, 0.6);
    if (g <= 0) return;
    const seed = Math.floor(t * 14);
    if (hash(seed) > 0.04 + g * 0.22) return;
    const { c, canvas } = this;
    const n = 1 + Math.floor(hash(seed + 1) * 3 * g + 0.5);
    for (let k = 0; k < n; k++) {
      const y = Math.floor(hash(seed * 3 + k) * canvas.height);
      const h = Math.max(2, Math.floor((2 + hash(seed * 5 + k) * 14 * g) * this.dpr));
      const dx = Math.round((hash(seed * 7 + k) - 0.5) * 30 * g * this.dpr);
      c.drawImage(canvas, 0, y, canvas.width, h, dx, y, canvas.width, h);
    }
  }

  grain(t) {
    const { c, canvas } = this;
    if (!this.pattern) this.pattern = c.createPattern(grainSource(), 'repeat');
    const seed = this.frozen ? 1 : Math.floor(t * 24);
    const rx = Math.floor(hash(seed) * 256), ry = Math.floor(hash(seed + 9) * 256);
    c.globalCompositeOperation = 'overlay';
    c.globalAlpha = 0.07;
    c.setTransform(this.dpr, 0, 0, this.dpr, rx, ry);
    c.fillStyle = this.pattern;
    c.fillRect(-rx / this.dpr, -ry / this.dpr, canvas.width / this.dpr, canvas.height / this.dpr);
    reset(c);
  }
}

function reset(c) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';
  c.shadowBlur = 0;
  c.setLineDash([]);
}
