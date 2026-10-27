// Animated emblem library: the 8 seat emblems (ported from the approved look
// samples) and supporting-cast emblems in the same style. Each draws centred
// on (0,0) inside roughly ±24 units, in one colour, with a soft glow.

import { TAU, K, glow, rr, ease } from './util.js';
import { EMBLEM_NAMES } from './emblem-names.js';

const D = {
  // ── Seats (from design/look-samples-source.html) ──────────────────────
  lens(c, t, col) {
    const a = t * 1.2, lx = Math.cos(a) * 5, ly = Math.sin(a) * 3;
    [[-12, -6], [8, -10], [-4, 10], [12, 6], [0, -2]].forEach((p, k) => {
      const bad = k === 4;
      c.globalAlpha = bad ? 1 : 0.45;
      c.fillStyle = bad ? K.red : col;
      c.beginPath();
      c.arc(p[0], p[1], bad ? 2 + Math.sin(t * 5) * 0.6 : 1.6, 0, TAU);
      c.fill();
    });
    c.globalAlpha = 1;
    c.beginPath(); c.arc(lx, ly, 11, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(lx + 8, ly + 8); c.lineTo(lx + 16, ly + 16); c.stroke();
  },
  bars(c, t) {
    for (let k = 0; k < 4; k++) {
      const h = 8 + k * 5 + Math.sin(t * 2 + k) * 2;
      c.globalAlpha = 0.5 + k * 0.15;
      c.fillRect(-14 + k * 8, 12 - h, 5, h);
    }
    c.globalAlpha = 1;
    c.beginPath(); c.moveTo(-16, 6); c.quadraticCurveTo(0, 4, 14, -14); c.stroke();
    c.beginPath(); c.moveTo(8, -14); c.lineTo(14, -14); c.lineTo(14, -8); c.stroke();
  },
  scales(c, t) {
    const a = Math.sin(t * 1.1) * 0.18;
    c.beginPath(); c.moveTo(-5, 14); c.lineTo(0, 4); c.lineTo(5, 14); c.closePath(); c.stroke();
    c.save(); c.translate(0, 4); c.rotate(a);
    c.beginPath(); c.moveTo(-17, 0); c.lineTo(17, 0); c.stroke();
    c.beginPath(); c.arc(-15, -6, 5, 0, TAU); c.stroke();
    c.beginPath(); c.arc(15, -6, 5, 0, TAU); c.fill();
    c.restore();
  },
  eye(c, t) {
    const T = t % 4, o = T > 3.6 ? Math.abs(T - 3.8) / 0.2 : 1, ix = Math.sin(t * 0.9) * 5;
    const lid = () => { c.beginPath(); c.moveTo(-18, 0); c.quadraticCurveTo(0, -14 * o, 18, 0); c.quadraticCurveTo(0, 14 * o, -18, 0); };
    lid(); c.stroke();
    c.save(); lid(); c.clip();
    c.beginPath(); c.arc(ix, 0, 6.5, 0, TAU); c.fill();
    c.fillStyle = '#120612'; c.beginPath(); c.ellipse(ix, 0, 1.6, 4.5, 0, 0, TAU); c.fill();
    c.restore();
    c.save(); c.rotate(t * 0.6); c.setLineDash([3, 5]); c.beginPath(); c.arc(0, 0, 23, 0, TAU); c.stroke(); c.restore();
  },
  chevrons(c, t) {
    for (let k = 0; k < 3; k++) {
      const ph = (t * 1.6 + k / 3) % 1, x = -16 + ph * 30;
      c.globalAlpha = Math.sin(ph * Math.PI);
      c.beginPath(); c.moveTo(x - 6, -9); c.lineTo(x + 2, 0); c.lineTo(x - 6, 9); c.stroke();
    }
    c.globalAlpha = 0.5;
    [-15, 15].forEach((yy, k) => {
      const l = (t * 40 + k * 11) % 26;
      c.beginPath(); c.moveTo(-22 + l, yy); c.lineTo(-16 + l, yy); c.stroke();
    });
    c.globalAlpha = 1;
  },
  windows(c, t) {
    [[-10, -10], [-4, -4], [2, 2]].forEach((p, k) => {
      c.globalAlpha = 0.4 + k * 0.25;
      rr(c, p[0] - 6, p[1] - 4, 20, 15, 2); c.stroke();
    });
    c.globalAlpha = 1;
    const px = 10 + Math.sin(t * 1.7) * 4, py = 12 + Math.cos(t * 1.3) * 3;
    c.beginPath(); c.moveTo(px, py); c.lineTo(px, py + 9); c.lineTo(px + 2.5, py + 6.5); c.lineTo(px + 6, py + 6); c.closePath(); c.fill();
  },
  waves(c, t) {
    c.beginPath(); c.arc(-10, 6, 2.5, 0, TAU); c.fill();
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.8 + k / 3) % 1;
      c.globalAlpha = 1 - ph;
      c.beginPath(); c.arc(-10, 6, 6 + ph * 20, -1.1, 0.1); c.stroke();
    }
    c.globalAlpha = 1;
  },
  crowd(c, t) {
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) {
      const me = r === 2 && k === 3, w = Math.sin(t * 2 - k * 0.6 - r * 0.4);
      c.globalAlpha = me ? 1 : 0.18 + 0.25 * Math.max(0, w);
      c.beginPath(); c.arc(-15 + k * 6, -9 + r * 6, me ? 2 : 1.4, 0, TAU); c.fill();
    }
    c.globalAlpha = 1;
  },

  // ── Supporting cast ─────────────────────────────────────────────────
  clipboard(c, t) {
    rr(c, -11, -13, 22, 28, 3); c.stroke();
    rr(c, -5, -16, 10, 6, 2); c.fill();
    const step = (t * 0.9) % 4; // ticks fill in one by one, then reset
    for (let k = 0; k < 3; k++) {
      const y = -4 + k * 7, on = step > k + 0.6;
      c.globalAlpha = 0.45;
      c.beginPath(); c.moveTo(-1, y); c.lineTo(7, y); c.stroke();
      c.globalAlpha = 1;
      if (on) { c.beginPath(); c.moveTo(-7, y); c.lineTo(-5, y + 2); c.lineTo(-2.5, y - 2.5); c.stroke(); }
      else { c.globalAlpha = 0.5; c.strokeRect(-7, y - 2, 4, 4); c.globalAlpha = 1; }
    }
  },
  shield(c, t) {
    const path = () => {
      c.beginPath(); c.moveTo(0, -16); c.lineTo(13, -10); c.lineTo(13, 1);
      c.quadraticCurveTo(13, 12, 0, 17); c.quadraticCurveTo(-13, 12, -13, 1); c.lineTo(-13, -10); c.closePath();
    };
    path(); c.stroke();
    c.save(); path(); c.clip();
    const y = -16 + ((t * 0.7) % 1) * 34;
    const g = c.createLinearGradient(0, y - 8, 0, y);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, c.strokeStyle);
    c.globalAlpha = 0.35; c.fillStyle = g; c.fillRect(-14, y - 8, 28, 8);
    c.globalAlpha = 1; c.fillStyle = c.strokeStyle;
    c.restore();
    c.beginPath(); c.moveTo(-5, 0); c.lineTo(-1, 4); c.lineTo(6, -4); c.stroke();
  },
  gavel(c, t) {
    const T = t % 1.8;
    const a = T < 0.9 ? 0.75 * ease(T / 0.9) : T < 1.0 ? 0.75 * (1 - (T - 0.9) / 0.1) : 0;
    c.globalAlpha = 0.7; c.fillRect(-17, 13, 18, 3); c.globalAlpha = 1;
    if (T > 1.0 && T < 1.4) {
      c.globalAlpha = 1 - (T - 1.0) / 0.4;
      [[-14, 6, -18, 2], [-8, 4, -8, -1], [-2, 6, 2, 2]].forEach((l) => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); });
      c.globalAlpha = 1;
    }
    c.save(); c.translate(14, 10); c.rotate(a);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-18, -4); c.stroke();
    c.save(); c.translate(-20, -4.5); c.rotate(-0.22); rr(c, -4, -8, 8, 16, 2); c.fill(); c.restore();
    c.restore();
  },
  chat(c, t) {
    rr(c, -15, -12, 30, 20, 6); c.stroke();
    c.beginPath(); c.moveTo(-8, 8); c.lineTo(-11, 15); c.lineTo(-2, 8); c.stroke();
    for (let k = 0; k < 3; k++) {
      const y = -2 - 2.5 * Math.max(0, Math.sin(t * 6 - k * 0.8));
      c.beginPath(); c.arc(-6 + k * 6, y, 1.8, 0, TAU); c.fill();
    }
  },
  coin(c, t) {
    const cs = Math.cos(t * 1.6), w = Math.max(1.5, Math.abs(cs) * 13);
    c.globalAlpha = 0.4; c.beginPath(); c.ellipse(cs > 0 ? -1.5 : 1.5, 0, w, 13, 0, 0, TAU); c.stroke();
    c.globalAlpha = 1; c.beginPath(); c.ellipse(0, 0, w, 13, 0, 0, TAU); c.stroke();
    if (w > 5) {
      c.globalAlpha = 0.6; c.beginPath(); c.ellipse(0, 0, w * 0.62, 8, 0, 0, TAU); c.stroke();
      c.globalAlpha = Math.abs(cs); c.beginPath(); c.moveTo(0, -5); c.lineTo(0, 5); c.stroke();
    }
    const sp = (t * 0.7) % 1;
    if (sp < 0.25) { c.globalAlpha = Math.sin(sp / 0.25 * Math.PI); c.beginPath(); c.moveTo(14, -16); c.lineTo(14, -8); c.moveTo(10, -12); c.lineTo(18, -12); c.stroke(); }
    c.globalAlpha = 1;
  },
  globe(c, t) {
    c.beginPath(); c.arc(0, 0, 14, 0, TAU); c.stroke();
    c.globalAlpha = 0.5;
    c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.stroke();
    [-7, 7].forEach((y) => { const hw = Math.sqrt(196 - y * y); c.beginPath(); c.moveTo(-hw, y); c.lineTo(hw, y); c.stroke(); });
    for (let k = 0; k < 3; k++) {
      const ph = t * 0.8 + (k * Math.PI) / 3, w = Math.cos(ph) * 14;
      c.globalAlpha = Math.sin(ph) > 0 ? 0.9 : 0.25;
      c.beginPath(); c.ellipse(0, 0, Math.abs(w), 14, 0, 0, TAU); c.stroke();
    }
    c.globalAlpha = 1;
  },
  flask(c, t, col) {
    const path = () => {
      c.beginPath(); c.moveTo(-4, -15); c.lineTo(-4, -5); c.lineTo(-13, 13); c.lineTo(13, 13); c.lineTo(4, -5); c.lineTo(4, -15);
    };
    c.save(); path(); c.closePath(); c.clip();
    c.globalAlpha = 0.3;
    c.beginPath(); c.moveTo(-16, 15);
    for (let x = -16; x <= 16; x += 2) c.lineTo(x, 4 + Math.sin(x * 0.4 + t * 3) * 1.2);
    c.lineTo(16, 15); c.closePath(); c.fill();
    c.globalAlpha = 1;
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.6 + k / 3) % 1, y = 11 - ph * 22, x = (k - 1) * 4 + Math.sin(t * 3 + k) * 1.5;
      c.globalAlpha = Math.sin(ph * Math.PI);
      c.beginPath(); c.arc(x, y, 1.3 + k * 0.3, 0, TAU); c.stroke();
    }
    c.restore();
    c.globalAlpha = 1; c.strokeStyle = col;
    path(); c.stroke();
    c.beginPath(); c.moveTo(-7, -15); c.lineTo(7, -15); c.stroke();
  },
  badge(c, t) {
    c.beginPath(); c.moveTo(-6, 8); c.lineTo(-9, 19); c.lineTo(-4, 16); c.lineTo(-1, 20); c.lineTo(-1, 10); c.stroke();
    c.beginPath(); c.moveTo(6, 8); c.lineTo(9, 19); c.lineTo(4, 16); c.lineTo(1, 20); c.lineTo(1, 10); c.stroke();
    c.beginPath(); c.arc(0, -3, 12, 0, TAU); c.stroke();
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 2.8 : 6.5, a = -Math.PI / 2 + (i * Math.PI) / 5;
      c.lineTo(Math.cos(a) * r, -3 + Math.sin(a) * r);
    }
    c.closePath(); c.fill();
    const g = (t * 0.5) % 1;
    if (g < 0.35) {
      c.save(); c.beginPath(); c.arc(0, -3, 12, 0, TAU); c.clip();
      const x = -18 + (g / 0.35) * 36;
      c.globalAlpha = 0.55; c.lineWidth = 3; c.strokeStyle = '#ffffff';
      c.beginPath(); c.moveTo(x - 6, 9); c.lineTo(x + 6, -15); c.stroke();
      c.restore();
    }
  },
  chip(c, t) {
    rr(c, -10, -10, 20, 20, 3); c.stroke();
    for (let k = 0; k < 4; k++) {
      const o = -6 + k * 4;
      c.beginPath();
      c.moveTo(o, -10); c.lineTo(o, -15); c.moveTo(o, 10); c.lineTo(o, 15);
      c.moveTo(-10, o); c.lineTo(-15, o); c.moveTo(10, o); c.lineTo(15, o);
      c.stroke();
    }
    c.globalAlpha = 0.45 + 0.45 * Math.sin(t * 3);
    c.fillRect(-4, -4, 8, 8);
    c.globalAlpha = 1;
    const p = (t * 1.3) % 1, k = Math.floor(t * 1.3) % 4, o = -6 + k * 4, d = 10 + p * 8;
    c.globalAlpha = 1 - p;
    [[o, -d], [d, o], [-o, d], [-d, -o]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 1.3, 0, TAU); c.fill(); });
    c.globalAlpha = 1;
  },
  key(c, t) {
    c.save(); c.rotate(Math.sin(t * 1.2) * 0.12);
    c.beginPath(); c.arc(-8, 0, 7, 0, TAU); c.stroke();
    c.beginPath(); c.arc(-8, 0, 2.2, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(-1, 0); c.lineTo(16, 0); c.moveTo(10, 0); c.lineTo(10, 5); c.moveTo(14, 0); c.lineTo(14, 4); c.stroke();
    const g = (t * 0.6) % 1;
    if (g < 0.3) { c.globalAlpha = Math.sin((g / 0.3) * Math.PI); c.beginPath(); c.arc(-8 + Math.cos(t * 4) * 7, Math.sin(t * 4) * 7, 1.6, 0, TAU); c.fill(); }
    c.restore();
  },
  doc(c, t) {
    c.beginPath(); c.moveTo(-11, -14); c.lineTo(5, -14); c.lineTo(11, -8); c.lineTo(11, 14); c.lineTo(-11, 14); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(5, -14); c.lineTo(5, -8); c.lineTo(11, -8); c.stroke();
    const widths = [12, 16, 10, 15, 8];
    c.globalAlpha = 0.55;
    widths.forEach((w, k) => { const y = -6 + k * 4.5; c.beginPath(); c.moveTo(-7, y); c.lineTo(-7 + w, y); c.stroke(); });
    c.globalAlpha = 1;
    const y = -10 + ((t * 0.55) % 1) * 24;
    c.globalAlpha = 0.25; c.fillRect(-10, y - 2, 20, 4); c.globalAlpha = 1;
  },
  mic(c, t) {
    rr(c, -5, -16, 10, 18, 5); c.stroke();
    c.beginPath(); c.arc(0, -3, 9, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke();
    c.beginPath(); c.moveTo(0, 6); c.lineTo(0, 13); c.moveTo(-6, 13); c.lineTo(6, 13); c.stroke();
    for (let k = 0; k < 2; k++) {
      const ph = (t * 0.9 + k / 2) % 1;
      c.globalAlpha = (1 - ph) * 0.8;
      c.beginPath(); c.arc(0, -7, 11 + ph * 9, -0.5, 0.5); c.stroke();
      c.beginPath(); c.arc(0, -7, 11 + ph * 9, Math.PI - 0.5, Math.PI + 0.5); c.stroke();
    }
    c.globalAlpha = 1;
  },
};

export const EMBLEMS = D;

for (const n of EMBLEM_NAMES) if (!D[n]) throw new Error(`emblem "${n}" has no drawing`);

/**
 * Draws emblem `name` centred at (x, y).
 * @param {number} s     scale (1 ≈ 48 units across)
 * @param {object} o     { glow: halo on/off, blur: device pixels per unit ÷ 2 for shadow sizing }
 */
export function drawEmblem(c, name, x, y, t, col, s = 1, o = {}) {
  const draw = D[name] || D.eye;
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  if (o.glow !== false) {
    c.globalCompositeOperation = 'lighter';
    glow(c, 0, 0, 30, col, o.glowAlpha ?? 0.35);
    c.globalCompositeOperation = 'source-over';
  }
  c.strokeStyle = col;
  c.fillStyle = col;
  c.lineWidth = o.lineWidth || 1.6;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.shadowColor = col;
  c.shadowBlur = 8 * (o.blur ?? 1);
  draw(c, t, col);
  c.restore();
}
