// The result card: a 1080×1350 PNG in the approved share-card style, shared
// through the Web Share API with files when available, else downloaded.

import { K, FONT, OUTCOME_COLORS, ha, font, glass, rr } from './render/util.js';
import { bgDark, orb, motes, vignette, makeDust } from './render/cinematic.js';
import { drawLogo } from './render/logo.js';
import { drawEmblem } from './render/emblems.js';

export const CARD_W = 1080;
export const CARD_H = 1350;
const U = 360; // design units across; the card is drawn at 360×450 and scaled ×3
const FONTS = [
  '700 40px "Space Grotesk"', '400 30px Inter', '500 30px "JetBrains Mono"',
  'italic 400 60px Fraunces', '400 30px Fraunces',
];
const dust = makeDust(90);

/** Waits (briefly) for the webfonts the card uses. */
export async function ensureFonts(timeout = 2500) {
  if (!document.fonts || !document.fonts.load) return;
  const all = Promise.all(FONTS.map((f) => document.fonts.load(f).catch(() => null)));
  await Promise.race([all, new Promise((r) => setTimeout(r, timeout))]);
}

const TONE_WORD = { good: 'Good ending', mixed: 'Mixed ending', bad: 'Bad ending' };
const fmt = (n) => (n < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString('en-US');

/** Draws the card for summary `sm` onto canvas `cv` (any size with a 4:5 ratio). */
export function drawCard(cv, sm, t = 4) {
  const c = cv.getContext('2d');
  const k = cv.width / U;
  const W = U, H = (U * cv.height) / cv.width;
  const pal = { a: sm.seat.color, b: K.blue };
  c.setTransform(k, 0, 0, k, 0, 0);
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';

  // Backdrop: the presence behind the seat emblem, as on the approved sample.
  const oy = 22 + 98;
  bgDark(c, W, H, W / 2, oy + 30, pal.b);
  orb(c, W / 2, oy, 0.62, t, pal.a, pal.b, 0, { era: 1, intensity: 0.6 });
  motes(c, W, H, t, W / 2, oy, pal.a, 330, dust);
  vignette(c, W, H, 0.55);

  // Frosted card: blur the backdrop inside the panel.
  const x = 22, y = 22, w = W - 44, h = H - 44;
  const copy = document.createElement('canvas');
  copy.width = cv.width; copy.height = cv.height;
  copy.getContext('2d').drawImage(cv, 0, 0);
  c.save();
  rr(c, x, y, w, h, 20);
  c.clip();
  c.setTransform(1, 0, 0, 1, 0, 0);
  if ('filter' in c) c.filter = `blur(${Math.round(12 * k)}px)`;
  c.drawImage(copy, 0, 0);
  c.filter = 'none';
  c.restore();
  c.setTransform(k, 0, 0, k, 0, 0);
  glass(c, x, y, w, h, 20, { tint: 'rgba(8,12,28,.5)', edge: 'rgba(255,255,255,.18)' });

  const cx = W / 2;
  c.textBaseline = 'alphabetic';
  drawLogo(c, cx, y + 46, 19, 0);

  if (sm.demo) {
    font(c, '500', 8.5, FONT.mono);
    c.textAlign = 'right';
    c.fillStyle = ha(K.amber, 0.8);
    c.fillText('demo story', x + w - 14, y + 18);
  }

  drawEmblem(c, sm.seat.emblem, cx, y + 98, t, sm.seat.color, 1.35, { blur: (k * 1.35) / 2 });

  c.textAlign = 'center';
  font(c, '500', 11, FONT.mono);
  c.fillStyle = ha(sm.seat.color, 0.85);
  c.fillText(sm.seat.name.toLowerCase(), cx, y + 146);

  const title = sm.ending ? sm.ending.title : 'Run complete';
  let size = 24;
  font(c, 'italic 400', size, FONT.ser);
  while (c.measureText(title).width > w - 36 && size > 15) { size -= 1; font(c, 'italic 400', size, FONT.ser); }
  c.fillStyle = K.ink;
  c.fillText(title, cx, y + 176);

  font(c, '400', 11.5, FONT.ui);
  c.fillStyle = 'rgba(226,232,255,.6)';
  const tone = sm.ending ? `${TONE_WORD[sm.ending.tone] || 'Ending'} · ${sm.endingsFound} of ${sm.endingsTotal} found` : '';
  c.fillText(tone, cx, y + 196);

  const stats = [
    [fmt(sm.score), 'score'],
    [`${sm.avoided}/${sm.dangersTotal}`, sm.avoidedLabel],
    [`${sm.codexFound}/${sm.codexTotal}`, 'codex'],
  ];
  stats.forEach(([v, l], i) => {
    const sx = cx + (i - 1) * 82;
    font(c, '700', 20, FONT.logo);
    c.fillStyle = K.ink;
    c.fillText(v, sx, y + 236);
    font(c, '400', 10.5, FONT.mono);
    c.fillStyle = 'rgba(226,232,255,.55)';
    c.fillText(l, sx, y + 252);
  });

  // Per-era strip: one square per danger, coloured by outcome.
  sm.eras.forEach((list, i) => {
    const gx = cx + (i - 2) * 58;
    const n = Math.max(1, list.length);
    const sq = Math.min(10, (50 - (n - 1) * 3) / n);
    const total = n * sq + (n - 1) * 3;
    for (let j = 0; j < n; j++) {
      const out = list[j];
      rr(c, gx - total / 2 + j * (sq + 3), y + 272, sq, sq, 2);
      c.fillStyle = out ? ha(OUTCOME_COLORS[out] || K.ink, 0.9) : 'rgba(255,255,255,.07)';
      c.fill();
    }
    font(c, '400', 10.5, FONT.mono);
    c.fillStyle = 'rgba(226,232,255,.45)';
    c.fillText(`era ${i + 1}`, gx, y + 300);
  });

  if (sm.teaser) {
    font(c, 'italic 400', 14, FONT.ser);
    c.fillStyle = ha(sm.teaser.color, 0.9);
    c.fillText(`Could you do better as ${sm.teaser.phrase}?`, cx, y + 338);
  }

  font(c, '400', 11, FONT.mono);
  c.fillStyle = 'rgba(226,232,255,.6)';
  c.fillText(sm.url.replace(/^https?:\/\//, '').replace(/\/$/, ''), cx, y + h - 22);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

/** Renders a full-size card canvas (after fonts are ready). */
export async function renderCard(sm) {
  await ensureFonts();
  const cv = document.createElement('canvas');
  cv.width = CARD_W;
  cv.height = CARD_H;
  drawCard(cv, sm);
  return cv;
}

const toBlob = (cv) => new Promise((res) => cv.toBlob(res, 'image/png'));
export const cardFilename = (sm) => `misaligned-${sm.seat.id}${sm.ending ? '-' + sm.ending.id : ''}.png`;

export function shareText(sm) {
  const what = sm.ending ? `“${sm.ending.title}”` : 'an ending';
  const role = sm.seat.name.replace(/^the\s+/i, '');
  const r = role === role.toUpperCase() ? role : role.toLowerCase().replace(/\bceo\b/, 'CEO');
  return `I reached ${what} as the ${r} in MISALIGNED.`;
}

/** Shares the PNG (Web Share with files) or downloads it. Returns 'shared' | 'downloaded' | 'cancelled'. */
export async function shareCard(cv, sm) {
  const blob = await toBlob(cv);
  if (!blob) return 'cancelled';
  const file = new File([blob], cardFilename(sm), { type: 'image/png' });
  if (navigator.canShare && navigator.share) {
    let ok = false;
    try { ok = navigator.canShare({ files: [file] }); } catch { ok = false; }
    if (ok) {
      try {
        await navigator.share({ files: [file], title: 'Misaligned', text: `${shareText(sm)} ${sm.url}` });
        return 'shared';
      } catch (e) {
        if (e && e.name === 'AbortError') return 'cancelled';
      }
    }
  }
  downloadBlob(blob, cardFilename(sm));
  return 'downloaded';
}

export async function downloadCard(cv, sm) {
  const blob = await toBlob(cv);
  if (blob) downloadBlob(blob, cardFilename(sm));
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Copies text to the clipboard. Returns true on success. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
