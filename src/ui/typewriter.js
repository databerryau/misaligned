// Typewriter text. Paragraphs split on blank lines. The unrevealed rest stays
// in the layout (invisible) so the panel never jumps. finish() completes it.

const PAUSE_LONG = /[.!?…]/;
const PAUSE_SHORT = /[,;:—–]/;

export function typewriter(el, text, { cps = 75, instant = false, onDone = null } = {}) {
  const paras = String(text).split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  el.textContent = '';
  const parts = paras.map((p) => {
    const pe = document.createElement('p');
    const vis = document.createElement('span');
    const rest = document.createElement('span');
    rest.className = 'tw-rest';
    rest.textContent = p;
    pe.append(vis, rest);
    el.append(pe);
    return { vis, rest, text: p };
  });
  const flat = paras.join('');
  const total = flat.length;
  const breaks = new Set();
  paras.reduce((n, p) => { breaks.add(n + p.length); return n + p.length; }, 0);
  let shown = 0;
  let timer = null;
  let done = false;

  const render = () => {
    let left = shown;
    for (const p of parts) {
      const n = Math.max(0, Math.min(p.text.length, left));
      p.vis.textContent = p.text.slice(0, n);
      p.rest.textContent = p.text.slice(n);
      left -= p.text.length;
    }
  };
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    shown = total;
    render();
    if (onDone) onDone();
  };
  const step = () => {
    if (done) return;
    shown = Math.min(total, shown + 1);
    render();
    if (shown >= total) return finish();
    const ch = flat[shown - 1];
    const next = flat[shown];
    const delay = breaks.has(shown) ? 420
      : PAUSE_LONG.test(ch) && next === ' ' ? 260
      : PAUSE_SHORT.test(ch) ? 90
      : 1000 / cps;
    timer = setTimeout(step, delay);
  };

  if (instant || total === 0) finish();
  else timer = setTimeout(step, 140);

  return {
    finish,
    cancel() { done = true; clearTimeout(timer); },
    get done() { return done; },
  };
}
