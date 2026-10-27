// The MISALIGNED wordmark: the G drops and tilts out of line, with a
// cyan/magenta colour split (ported from the look samples).

import { K, FONT, ha, font } from './util.js';

const LETTERS = [...'MISALIGNED'];
const ODD = 6; // the G

/** Total width of the logo at `size` px. */
export function logoWidth(c, size) {
  font(c, '700', size, FONT.logo);
  const sp = size * 0.14;
  return LETTERS.reduce((w, ch) => w + c.measureText(ch).width, 0) + sp * (LETTERS.length - 1);
}

/** Draws the logo centred on cx with its baseline at y. */
export function drawLogo(c, cx, y, size, t) {
  font(c, '700', size, FONT.logo);
  const sp = size * 0.14;
  const ws = LETTERS.map((ch) => c.measureText(ch).width);
  const total = ws.reduce((a, b) => a + b, 0) + sp * (LETTERS.length - 1);
  let x = cx - total / 2;
  c.textAlign = 'center';
  LETTERS.forEach((ch, i) => {
    const off = i === ODD;
    const dy = off ? size * 0.12 + Math.sin(t * 1.4) * size * 0.03 : 0;
    c.save();
    c.translate(x + ws[i] / 2, y + dy);
    c.rotate(off ? 0.07 : 0);
    if (off) {
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = ha(K.mag, 0.7);
      c.fillText(ch, -size * 0.03, 0);
      c.fillStyle = ha(K.cyan, 0.7);
      c.fillText(ch, size * 0.03, 0);
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = '#ffd0e0';
    } else {
      c.fillStyle = '#f2f5ff';
    }
    c.fillText(ch, 0, 0);
    c.restore();
    x += ws[i] + sp;
  });
  return total;
}
