// Holographic HUD mode: the model as a rotating particle sphere with rings,
// ticks and a radar sweep (ported from the look samples), plus the small
// readout canvases (feature map, activation wave) and the debrief gauge.
// When `anomaly` is set the palette turns red and the sphere deforms.

import { TAU, K, clamp, ha, mix, glow, rr } from './util.js';
import { vignette } from './cinematic.js';

const sphereCache = new Map();
function spherePoints(n) {
  let pts = sphereCache.get(n);
  if (!pts) {
    pts = [];
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), th = i * 2.39996;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    sphereCache.set(n, pts);
  }
  return pts;
}

/** The two HUD colours, shifted toward red by the anomaly amount. */
export function hudPalette(pal, an) {
  return [mix(pal.a, K.red, an), mix(pal.b, '#ff8c42', an)];
}

export const hudView = {
  focus(W, H, st) {
    return st.layout === 'tall' ? [W * 0.5, H * 0.5] : [W * 0.64, H * 0.37];
  },
  draw(c, W, H, t, st) {
    const an = st.anomaly;
    const p = hudPalette(st.pal, an);
    const u = Math.min(W / 640, H / 360);
    const tall = st.layout === 'tall';
    const [cx, cy] = this.focus(W, H, st);
    const R = (tall ? 80 : 56) * u;
    const era = st.era || 1;

    const g = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.75);
    g.addColorStop(0, mix('#0a1f33', p[1], 0.12));
    g.addColorStop(1, '#01040a');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.fillStyle = ha(p[0], 0.1);
    for (let x = 10; x < W; x += 20) for (let y = 10; y < H; y += 20) c.fillRect(x, y, 1, 1);

    const ry = t * (0.35 + an * 1.5), cr = Math.cos(ry), sr = Math.sin(ry), ct = Math.cos(0.35), stl = Math.sin(0.35);
    const pr = (x, y, z, scale = 1) => {
      const X = x * cr + z * sr, Z0 = -x * sr + z * cr, Y = y * ct - Z0 * stl, Z = y * stl + Z0 * ct, f = 2.6 / (2.6 + Z);
      return [cx + X * R * scale * f, cy + Y * R * scale * f, Z, f];
    };

    c.globalCompositeOperation = 'lighter';
    glow(c, cx, cy, R * 1.8, p[1], 0.18 + an * 0.15);
    const pts = spherePoints(Math.round((420 + (era - 1) * 100) * (st.reduced ? 0.6 : 1)));
    const amp = 0.04 + an * 0.18;
    for (const q of pts) {
      const d = 1 + amp * Math.sin(6 * q[1] + t * 2 + q[0] * 4) * Math.sin(5 * q[0] - t * 1.5);
      const o = pr(q[0] * d, q[1] * d, q[2] * d);
      const b = (1 - o[2]) / 2;
      c.fillStyle = ha(b > 0.5 ? p[0] : p[1], 0.25 + b * 0.75);
      c.fillRect(o[0] - 0.9 * o[3], o[1] - 0.9 * o[3], 1.8 * o[3], 1.8 * o[3]);
    }
    if (era >= 3) { // an inner, counter-rotating shell
      const inner = spherePoints(160);
      for (const q of inner) {
        const o = pr(q[2], q[1], -q[0], 0.5);
        c.fillStyle = ha(p[1], 0.35);
        c.fillRect(o[0] - 0.6, o[1] - 0.6, 1.2, 1.2);
      }
    }
    c.strokeStyle = ha(p[0], 0.22);
    c.lineWidth = 0.7;
    const lat = era >= 4 ? 3 : 2;
    for (let k = -lat; k <= lat; k++) {
      const yy = k * (0.7 / lat), r2 = Math.sqrt(1 - yy * yy);
      c.beginPath();
      for (let j = 0; j <= 48; j++) {
        const a = (j / 48) * TAU, o = pr(Math.cos(a) * r2, yy, Math.sin(a) * r2);
        j ? c.lineTo(o[0], o[1]) : c.moveTo(o[0], o[1]);
      }
      c.stroke();
    }
    c.globalCompositeOperation = 'source-over';

    c.lineWidth = 1;
    const rings = [[R + 28 * u, 0.2, [40, 8]], [R + 40 * u, -0.13, [2, 6]], [R + 54 * u, 0.07, [90, 20, 10, 20]]];
    if (era >= 2) rings.push([R + 14 * u, -0.3, [6, 10]]);
    if (era >= 4) rings.push([R + 70 * u, 0.05, [3, 3]]);
    rings.forEach(([r, sp, dash], i) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(t * sp * (1 + an * 3));
      c.setLineDash(dash.map((v) => v * u));
      c.strokeStyle = ha(i === 2 ? p[1] : p[0], 0.55);
      c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
      c.restore();
    });
    c.setLineDash([]);
    c.save();
    c.translate(cx, cy);
    c.strokeStyle = ha(p[0], 0.4);
    c.beginPath();
    for (let k = 0; k < 72; k++) {
      const a = (k / 72) * TAU, r1 = R + 64 * u, r2 = r1 + (k % 6 ? 3 : 8) * u;
      c.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      c.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
    }
    c.stroke();
    c.restore();
    if (c.createConicGradient) {
      const cg = c.createConicGradient(t * (1.2 + era * 0.1), cx, cy);
      cg.addColorStop(0, ha(p[0], 0.2));
      cg.addColorStop(0.12, ha(p[0], 0));
      cg.addColorStop(1, ha(p[0], 0));
      c.fillStyle = cg;
      c.beginPath(); c.arc(cx, cy, R + 64 * u, 0, TAU); c.fill();
    }
    vignette(c, W, H, 0.45);
  },
};

/** 10×6 activation grid with one hot feature (readout panel). */
export function drawFeatureMap(c, w, h, t, pal, an, hot = true) {
  const [p0] = hudPalette(pal, an);
  const cols = 10, rows = 6, gap = 2;
  const cw = (w - gap * (cols - 1)) / cols, ch = (h - gap * (rows - 1)) / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const isHot = hot && r >= 2 && r <= 3 && k >= 6 && k <= 7;
    const v = isHot ? 0.7 + 0.3 * Math.sin(t * 6) : 0.5 + 0.5 * Math.sin(t * 2 + k * 1.3 + r * 2.1) * Math.cos(t * 1.3 + k * 0.7);
    c.fillStyle = isHot ? ha(K.amber, 0.35 + 0.6 * v) : ha(p0, 0.06 + v * 0.4);
    rr(c, k * (cw + gap), r * (ch + gap), cw, ch, 2);
    c.fill();
  }
  if (hot) {
    c.save();
    c.strokeStyle = K.amber;
    c.setLineDash([3, 3]);
    c.strokeRect(6 * (cw + gap) - 1.5, 2 * (ch + gap) - 1.5, 2 * cw + gap + 3, 2 * ch + gap + 3);
    c.restore();
  }
}

/** Activation trace for the highlighted feature. */
export function drawWave(c, w, h, t, col = K.amber) {
  c.strokeStyle = ha(col, 0.8);
  c.lineWidth = 1;
  c.beginPath();
  const n = Math.max(20, Math.floor(w / 2));
  for (let k = 0; k <= n; k++) {
    const x = (k / n) * w, kk = (k / n) * 86;
    const y = h - 2 - (h - 4) * 0.5 * Math.max(0, Math.sin(kk * 0.18 - t * 2)) * (kk > 50 ? 1.6 : 0.5);
    k ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.stroke();
}

/** Risk debt gauge: a half ring filling cyan → amber → red. v is 0–1. */
export function drawGauge(c, w, h, v, blur = 1) {
  const r = Math.min(w / 2 - 10, h - 12), cx = w / 2, cy = h - 6;
  c.lineWidth = Math.max(8, r * 0.15);
  c.lineCap = 'round';
  c.strokeStyle = 'rgba(255,255,255,.08)';
  c.beginPath(); c.arc(cx, cy, r, Math.PI, TAU); c.stroke();
  const g = c.createLinearGradient(cx - r, 0, cx + r, 0);
  g.addColorStop(0, K.cyan); g.addColorStop(0.5, K.amber); g.addColorStop(1, K.red);
  c.strokeStyle = g;
  c.shadowColor = v > 0.5 ? K.red : K.amber;
  c.shadowBlur = 12 * blur;
  const vv = clamp(v, 0, 1);
  if (vv > 0.002) { c.beginPath(); c.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * vv); c.stroke(); }
  c.shadowBlur = 0;
  c.lineCap = 'butt';
}
