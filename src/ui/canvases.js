// Small animated canvases inside the DOM (emblems, logo, feature map, gauge).
// One shared ticker draws them all from the main animation loop; a canvas
// that leaves the document is dropped automatically.

import { drawEmblem } from '../render/emblems.js';
import { h } from './dom.js';

const items = new Set();

/**
 * Creates a canvas whose `draw(c, w, h, t, dpr)` runs every frame in CSS pixels.
 * Size it with CSS.
 */
export function liveCanvas(draw, { className = '', label = null } = {}) {
  const cv = h('canvas', { class: className, 'aria-hidden': label ? null : 'true', role: label ? 'img' : null, 'aria-label': label });
  items.add({ cv, draw, seen: false, born: performance.now() });
  return cv;
}

export function tickCanvases(t) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  for (const it of items) {
    if (!it.cv.isConnected) {
      if (it.seen || performance.now() - it.born > 10000) items.delete(it);
      continue;
    }
    it.seen = true;
    const w = it.cv.clientWidth, hh = it.cv.clientHeight;
    if (!w || !hh) continue;
    const bw = Math.round(w * dpr), bh = Math.round(hh * dpr);
    if (it.cv.width !== bw || it.cv.height !== bh) { it.cv.width = bw; it.cv.height = bh; }
    const c = it.cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.shadowBlur = 0;
    c.clearRect(0, 0, bw, bh);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    it.draw(c, w, hh, t, dpr);
  }
}

/** An animated emblem in `color`, scaled to fit its CSS box. */
export function emblemCanvas(name, color, { className = 'emblem', glowAlpha, label = null } = {}) {
  return liveCanvas((c, w, hh, t, dpr) => {
    const s = Math.min(w, hh) / 64;
    drawEmblem(c, name, w / 2, hh / 2, t, color, s, { blur: (s * dpr) / 2, glowAlpha });
  }, { className, label });
}
