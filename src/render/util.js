// Shared canvas helpers (ported from design/look-samples-source.html).

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const lerp = (a, b, t) => a + (b - a) * t;

/** Approved palette from the look samples. */
export const K = {
  cyan: '#7fdcff', blue: '#2f6bff', mag: '#ff3d8b', amber: '#ffc46b', red: '#ff4d6d',
  teal: '#4dffb0', orange: '#ff7a3d', sky: '#5b8cff', yellow: '#ffe066', lilac: '#c9b8ff', ink: '#e8eeff',
};

/** Colours for danger outcomes (debrief rows and the result strip). */
export const OUTCOME_COLORS = {
  caught: K.cyan, partial: K.sky, missed: K.red, over: K.amber, exploited: K.mag, blocked: K.teal,
};

export const FONT = {
  logo: '"Space Grotesk", sans-serif',
  ui: 'Inter, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  ser: 'Fraunces, Georgia, serif',
};

const rgbCache = new Map();
export function rgb(hex) {
  let v = rgbCache.get(hex);
  if (!v) {
    const n = parseInt(hex.slice(1), 16);
    v = [n >> 16, (n >> 8) & 255, n & 255];
    rgbCache.set(hex, v);
  }
  return v;
}

/** '#rrggbb' + alpha → 'rgba(…)'. */
export function ha(hex, a) {
  const [r, g, b] = rgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** Linear mix of two hex colours. */
export function mix(h1, h2, t) {
  const a = rgb(h1);
  const b = rgb(h2);
  const c = a.map((v, i) => Math.round(lerp(v, b[i], clamp(t, 0, 1))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

/** Deterministic 0..1 noise for index n. */
export function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function font(c, weight, size, family) {
  c.font = `${weight} ${size}px ${family}`;
}

/** Soft radial glow. */
export function glow(c, x, y, r, col, a) {
  if (r <= 0 || a <= 0) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, ha(col, a));
  g.addColorStop(1, ha(col, 0));
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
}

/** Rounded-rect path (with a fallback for older canvases). */
export function rr(c, x, y, w, h, r) {
  c.beginPath();
  if (c.roundRect) { c.roundRect(x, y, w, h, r); return; }
  r = Math.min(r, w / 2, h / 2);
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/** Glass panel tint, edge and top sheen drawn on canvas (used by the share card). */
export function glass(c, x, y, w, h, r, o = {}) {
  rr(c, x, y, w, h, r);
  c.fillStyle = o.tint || 'rgba(14,18,38,.5)';
  c.fill();
  c.strokeStyle = o.edge || 'rgba(255,255,255,.13)';
  c.lineWidth = o.lw || 1;
  c.stroke();
  const g = c.createLinearGradient(x, y, x, y + h * 0.5);
  g.addColorStop(0, 'rgba(255,255,255,.07)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  rr(c, x, y, w, h, r);
  c.fillStyle = g;
  c.fill();
}

/** Word-wraps `s` at max width; returns the y after the last line. */
export function wrapText(c, s, x, y, maxW, lh) {
  let line = '';
  const lines = [];
  for (const word of s.split(' ')) {
    const test = line ? line + ' ' + word : word;
    if (c.measureText(test).width > maxW && line) { lines.push(line); line = word; } else line = test;
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => c.fillText(l, x, y + i * lh));
  return y + (lines.length - 1) * lh;
}

/** A tiling film-grain pattern source (256×256 noise). */
let grainCanvas = null;
export function grainSource() {
  if (grainCanvas) return grainCanvas;
  grainCanvas = document.createElement('canvas');
  grainCanvas.width = grainCanvas.height = 256;
  const g = grainCanvas.getContext('2d');
  const d = g.createImageData(256, 256);
  let seed = 0x9e3779b9;
  for (let i = 0; i < d.data.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; // LCG: fast, no visible pattern
    const v = seed >>> 24;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  return grainCanvas;
}
