// Cinematic glow mode: deep night, the AI as a living light with orbiting
// particles and an anamorphic flare, dust motes, a back-lit silhouette of the
// player, vignette. Primitives are ported from design/look-samples-source.html;
// views compose them for the title, story beats, endings and backdrops.
//
// Every view draws into a frame W×H in "units": W is 640 in landscape (H
// follows the aspect ratio, 360 at 16:9) and 360 in portrait.

import { TAU, K, clamp, ha, mix, glow, hash } from './util.js';

// ── Primitives ─────────────────────────────────────────────────────────

export function bgDark(c, W, H, cx, cy, tint) {
  const g = c.createRadialGradient(cx, cy, 10, cx, cy, Math.max(W, H) * 0.9);
  g.addColorStop(0, tint ? mix('#121830', tint, 0.06) : '#121830');
  g.addColorStop(1, '#020309');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}

export function gridLines(c, W, H, a, step = 20) {
  c.strokeStyle = `rgba(255,255,255,${a})`;
  c.lineWidth = 0.5;
  c.beginPath();
  for (let x = 0; x <= W; x += step) { c.moveTo(x, 0); c.lineTo(x, H); }
  for (let y = 0; y <= H; y += step) { c.moveTo(0, y); c.lineTo(W, y); }
  c.stroke();
}

export function vignette(c, W, H, a) {
  const g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.47);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${a})`);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}

export function floorGlow(c, W, H, col, a = 0.14) {
  const g = c.createLinearGradient(0, H * 0.667, 0, H);
  g.addColorStop(0, ha(col, 0));
  g.addColorStop(1, ha(col, a));
  c.fillStyle = g;
  c.fillRect(0, H * 0.667, W, H * 0.34);
}

/** Dust motes in normalised coordinates, deterministic. */
export function makeDust(n) {
  return Array.from({ length: n }, (_, i) => ({ x: hash(i * 3.1), y: hash(i * 7.7 + 1), z: 0.3 + hash(i * 1.3 + 2) * 0.7 }));
}

export function motes(c, W, H, t, ox, oy, col, reach, dust) {
  c.globalCompositeOperation = 'lighter';
  for (const d of dust) {
    const x = (d.x * W + t * 6 * d.z) % W;
    const y = (((d.y * H - t * 4 * d.z) % H) + H) % H;
    const b = clamp(1 - Math.hypot(x - ox, y - oy) / reach, 0, 1);
    if (b <= 0) continue;
    c.fillStyle = ha(col, b * 0.8 * d.z);
    c.beginPath();
    c.arc(x, y, d.z * 1.5, 0, TAU);
    c.fill();
  }
  c.globalCompositeOperation = 'source-over';
}

/**
 * The AI presence. `al` (0–1) is the "looks back" amount: the light swells,
 * particles speed up and a pupil forms. `era` adds orbiting structure.
 */
export function orb(c, ox, oy, s, t, a, b, al, { era = 1, intensity = 0.6, reduced = false } = {}) {
  const pu = 1 + Math.sin(t * 2) * 0.04 + al * 0.3;
  const k = 0.55 + intensity * 0.75; // glow strength from the `orb` cue
  c.globalCompositeOperation = 'lighter';
  glow(c, ox, oy, 360 * s * pu, b, 0.2 * k);
  glow(c, ox, oy, 120 * s * pu, a, 0.28 * k);
  glow(c, ox, oy, 55 * s * pu, a, Math.min(0.9, 0.55 * k));
  glow(c, ox, oy, 20 * s * pu, '#ffffff', 0.95);
  if (era >= 5) { // chromatic split at the core
    glow(c, ox - 4 * s, oy, 26 * s, K.mag, 0.25);
    glow(c, ox + 4 * s, oy, 26 * s, K.cyan, 0.25);
  }
  // anamorphic flare
  c.save(); c.translate(ox, oy); c.scale(9, 0.16); glow(c, 0, 0, 38 * s * pu, a, 0.5 * Math.min(1.2, k)); c.restore();

  aiGlyph(c, ox, oy, s, t, era, a, b, al);

  const n = Math.round((60 + (era - 1) * 28) * (reduced ? 0.5 : 1));
  for (let i = 0; i < n; i++) {
    const r = (50 + ((i * 37) % 100) + (era - 1) * ((i * 11) % 18)) * s;
    const sp = (0.25 + ((i * 13) % 10) / 25) * (i % 2 ? 1 : -1) * (1 + al * 2);
    const an = t * sp + i;
    const tl = 0.28 + (i % 5) * 0.06 + (era >= 4 ? ((i * 7) % 3) * 0.12 : 0);
    const front = Math.sin(an) > 0;
    c.fillStyle = ha(i % 3 ? a : '#ffffff', front ? 0.85 : 0.3);
    c.beginPath();
    c.arc(ox + Math.cos(an) * r, oy + Math.sin(an) * r * tl, front ? 1.5 : 1, 0, TAU);
    c.fill();
  }
  c.globalCompositeOperation = 'source-over';
  if (al > 0) {
    c.fillStyle = `rgba(4,4,12,${al * 0.9})`;
    c.beginPath();
    c.ellipse(ox, oy, 3.5 * s, 15 * s * al, 0, 0, TAU);
    c.fill();
  }
}

/** Structure around the light that grows more complex (and less readable) each era. */
function aiGlyph(c, ox, oy, s, t, era, a, b, al) {
  if (era < 2) return;
  c.save();
  c.translate(ox, oy);
  c.lineWidth = 0.8;
  // Era 2: a tilted orbit ring with a travelling dash.
  c.save();
  c.rotate(-0.22);
  c.scale(1, 0.24);
  c.strokeStyle = ha(a, 0.32);
  c.setLineDash([60 * s, 14 * s]);
  c.lineDashOffset = -t * 30 * s;
  c.beginPath(); c.arc(0, 0, 78 * s, 0, TAU); c.stroke();
  c.restore();
  c.setLineDash([]);
  if (era >= 3) {
    // Era 3: rotating hexagon and a tick ring.
    polygon(c, 6, 44 * s, t * 0.25, ha(a, 0.28));
    c.strokeStyle = ha(a, 0.3);
    c.beginPath();
    for (let i = 0; i < 36; i++) {
      const an = (i / 36) * TAU + t * 0.1, r1 = 64 * s, r2 = r1 + (i % 3 ? 2 : 5) * s;
      c.moveTo(Math.cos(an) * r1, Math.sin(an) * r1);
      c.lineTo(Math.cos(an) * r2, Math.sin(an) * r2);
    }
    c.stroke();
  }
  if (era >= 4) {
    // Era 4: counter-rotating hexagram that flickers.
    const fl = 0.18 + 0.14 * Math.max(0, Math.sin(t * 7.3) * Math.sin(t * 3.1));
    polygon(c, 3, 58 * s, -t * 0.4, ha(b, fl + 0.1));
    polygon(c, 3, 58 * s, -t * 0.4 + Math.PI, ha(b, fl + 0.1));
    polygon(c, 8, 92 * s, t * 0.12, ha(a, 0.12));
  }
  if (era >= 5) {
    // Era 5: nested lattice with radial spokes.
    [5, 7, 9].forEach((n, i) => polygon(c, n, (30 + i * 22) * s, t * (0.3 - i * 0.17), ha(i % 2 ? '#ffffff' : a, 0.16)));
    c.strokeStyle = ha('#ffffff', 0.08);
    c.beginPath();
    for (let i = 0; i < 18; i++) {
      const an = (i / 18) * TAU - t * 0.05;
      c.moveTo(Math.cos(an) * 24 * s, Math.sin(an) * 24 * s);
      c.lineTo(Math.cos(an) * 120 * s, Math.sin(an) * 120 * s);
    }
    c.stroke();
  }
  c.restore();
}

function polygon(c, n, r, rot, style) {
  c.strokeStyle = style;
  c.beginPath();
  for (let i = 0; i <= n; i++) {
    const an = rot + (i / n) * TAU;
    const x = Math.cos(an) * r, y = Math.sin(an) * r;
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.stroke();
}

/**
 * Back-lit silhouette of the player (head and shoulders), rim-lit from the
 * right. (hx0, hy0) is the head centre; k scales it; blur sizes the rim glow.
 */
export function silhouette(c, W, H, t, al, col, hx0, hy0, k, blur = 1) {
  const bottom = (H - hy0) / k + 4;
  const br = Math.sin(t * 1.4) * 1.5, hx = al * 5, hy = br - al * 3, sy = 44;
  c.save();
  c.translate(hx0, hy0);
  c.scale(k, k);
  c.fillStyle = '#010207';
  c.beginPath();
  c.moveTo(-150, bottom);
  c.bezierCurveTo(-130, sy + 18, -80, sy + 4, -30, sy + br);
  c.lineTo(30, sy + br);
  c.bezierCurveTo(80, sy + 4, 130, sy + 18, 150, bottom);
  c.closePath();
  c.fill();
  c.beginPath(); c.ellipse(hx, hy, 30, 36, al * 0.12, 0, TAU); c.fill();
  c.fillRect(-20, 10 + br, 40, 40);
  c.shadowColor = col;
  c.shadowBlur = 14 * blur;
  c.strokeStyle = ha(col, 0.85);
  c.lineWidth = 1.6;
  c.beginPath(); c.ellipse(hx, hy, 30, 36, al * 0.12, -1.25, 0.35); c.stroke();
  c.beginPath(); c.moveTo(35, sy + 1 + br); c.bezierCurveTo(80, sy + 5, 125, sy + 18, 142, sy + 58); c.stroke();
  c.restore();
}

// ── Views ──────────────────────────────────────────────────────────────

const unit = (W, H) => Math.min(W / 640, H / 360);

export const titleView = {
  focus: (W, H) => [W / 2, H * (W < H ? 0.3 : 0.39)],
  draw(c, W, H, t, st) {
    const [ox, oy] = this.focus(W, H);
    const s = W < H ? W / 360 : unit(W, H);
    bgDark(c, W, H, ox, oy, st.pal.b);
    orb(c, ox, oy, s, t, st.pal.a, st.pal.b, st.alarm, { era: 1, intensity: 0.65, reduced: st.reduced });
    motes(c, W, H, t, ox, oy, st.pal.a, 380 * s, st.dust);
    vignette(c, W, H, 0.65);
  },
};

export const cinematicView = {
  focus(W, H, st) {
    return st.layout === 'tall' ? [W * 0.66, H * 0.4] : [W * 0.703, H * 0.356];
  },
  draw(c, W, H, t, st) {
    const cues = st.cues || {};
    const [ox, oy] = this.focus(W, H, st);
    const u = unit(W, H);
    const al = st.alarm;
    bgDark(c, W, H, ox, oy, st.pal.b);
    floorGlow(c, W, H, st.pal.b);
    orb(c, ox, oy, 0.85 * u, t, st.pal.a, st.pal.b, al, { era: st.era, intensity: cues.orb ?? 0.6, reduced: st.reduced });
    motes(c, W, H, t, ox, oy, st.pal.a, 400 * u, st.dust);
    if (cues.figure !== 'none') {
      const tall = st.layout === 'tall';
      silhouette(c, W, H, t, al, st.pal.a, W * (tall ? 0.22 : 0.234), H * (tall ? 0.56 : 0.489), u, st.blur);
    }
    vignette(c, W, H, 0.6);
  },
};

const TONE_PALETTES = {
  good: { a: '#bff1ff', b: '#3d7bff' },
  mixed: { a: '#ffd59a', b: '#d9822b' },
  bad: { a: '#ff5d78', b: '#8c0f2a' },
};

export const endingView = {
  focus: (W, H) => [W / 2, H * (W < H ? 0.2 : 0.25)],
  draw(c, W, H, t, st) {
    const tone = TONE_PALETTES[st.tone] ? st.tone : 'mixed';
    const p = TONE_PALETTES[tone];
    const k = tone === 'bad' ? 0.85 : 0.6; // bad endings lean hard into crimson
    const a = mix(st.pal.a, p.a, k), b = mix(st.pal.b, p.b, k);
    const [ox, oy] = this.focus(W, H);
    const s = W < H ? W / 360 : unit(W, H);
    const al = tone === 'bad' ? 0.75 + 0.25 * Math.sin(t * 0.9) : st.alarm;
    bgDark(c, W, H, ox, oy, b);
    orb(c, ox, oy, s * (tone === 'good' ? 1.05 : 0.95), t * (tone === 'good' ? 0.6 : 1), a, b, al, { era: st.era, intensity: tone === 'good' ? 0.8 : 0.6, reduced: st.reduced });
    motes(c, W, H, t, ox, oy, a, 420 * s, st.dust);
    vignette(c, W, H, 0.7);
  },
};

/** Quiet backdrop for select, debrief and codex screens. */
export const backdropView = {
  focus: (W, H) => [W / 2, H * 0.3],
  draw(c, W, H, t, st) {
    const [ox, oy] = [W * 0.5, H * 0.3];
    bgDark(c, W, H, ox, oy, st.pal.b);
    gridLines(c, W, H, 0.035);
    c.globalCompositeOperation = 'lighter';
    glow(c, W * 0.82, H * 0.08, 220, st.pal.b, 0.08);
    glow(c, W * 0.12, H * 0.95, 200, st.pal.a, 0.05);
    c.globalCompositeOperation = 'source-over';
    motes(c, W, H, t, W * 0.6, H * 0.4, st.pal.a, Math.max(W, H) * 0.7, st.dust);
    vignette(c, W, H, 0.55);
  },
};
