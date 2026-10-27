// Seat select: eight cards with animated emblems. Seats without a story are
// shown as "coming soon" and can't be played.

import { h, fmt, colorVars, icon } from './dom.js';
import { emblemCanvas } from './canvases.js';

const KIND_COLOR = { hero: '#7fdcff', villain: '#ff3d8b', everyday: '#c9b8ff' };

export function selectScreen(app) {
  const { stage, content, store } = app;
  stage.setView('backdrop');
  stage.setPalette(app.era(1).palette);
  stage.setDebt(0);

  const seats = content.SEATS;
  const foot = h('p', { class: 'select-foot', 'aria-live': 'polite' });
  let active = Math.max(0, seats.findIndex((s) => s.story));

  const setActive = (i, msg = null) => {
    active = i;
    const s = seats[i];
    cards.forEach((c, k) => c.classList.toggle('active', k === i));
    foot.style.setProperty('--c', s.color);
    foot.textContent = msg || `${s.name} — ${s.tagline}`;
  };

  const pick = (i) => {
    const s = seats[i];
    if (!s.story) {
      app.audio.click();
      const playable = seats.find((x) => x.story);
      setActive(i, `${s.name} — coming soon.${playable ? ` Try the ${playable.name.toLowerCase()} first.` : ''}`);
      cards[i].classList.remove('nope');
      void cards[i].offsetWidth;
      cards[i].classList.add('nope');
      return;
    }
    app.audio.unlock();
    app.audio.confirm();
    cards.forEach((c) => { c.disabled = true; });
    app.startRun(s.id);
  };

  const cards = seats.map((s, i) => {
    const best = store.best(s.id);
    const endings = store.endings(s.id).length;
    const playable = !!s.story;
    const kc = KIND_COLOR[s.kind] || '#ffffff';
    return h('button', {
      class: `seat-card glass${playable ? '' : ' soon'}`,
      type: 'button',
      style: { ...colorVars(s.color), ...colorVars(kc, 'k') },
      'aria-label': `${s.name}, ${s.kind}${playable ? '' : ', coming soon'}`,
      'aria-disabled': playable ? null : 'true',
      onClick: () => pick(i),
      onMouseenter: () => setActive(i),
      onFocus: () => setActive(i),
    },
    emblemCanvas(s.emblem, s.color, { className: 'seat-emblem' }),
    h('span', { class: 'seat-name', text: s.name }),
    h('span', { class: 'kind-tag', text: s.kind }),
    playable
      ? (best != null ? h('span', { class: 'seat-meta', text: `best ${fmt(best)}${endings ? ` · ${endings} ending${endings > 1 ? 's' : ''}` : ''}` }) : null)
      : h('span', { class: 'seat-meta soon-tag', text: 'coming soon' }));
  });

  const back = h('button', { class: 'btn ghost small back', type: 'button', onClick: () => { app.audio.click(); app.show('title'); } }, icon('back'), 'Title');

  const el = h('section', { class: 'screen select-screen' },
    h('header', { class: 'select-head' },
      back,
      h('h1', {}, 'Choose who you are'),
      h('p', {}, 'Eight seats. One future. Every run fills in the danger codex.'),
    ),
    h('div', { class: 'seat-grid' }, cards),
    foot,
  );
  setActive(active);

  const cols = () => (app.layout === 'wide' ? 4 : 2);
  return {
    el,
    onKey(e) {
      const i = cards.indexOf(document.activeElement);
      const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols(), ArrowUp: -cols() }[e.key];
      if (move) {
        e.preventDefault();
        const n = i < 0 ? active : Math.max(0, Math.min(cards.length - 1, i + move));
        cards[n].focus();
      } else if ((e.key === 'Enter' || e.key === ' ') && i < 0) {
        e.preventDefault();
        pick(active);
      }
    },
  };
}
