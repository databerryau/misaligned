// Era transition card: era number, name and year over a palette crossfade.
// Waits for a tap or key (owner: the news must not move on by itself). A tap
// while headlines are still arriving shows them all; the next one closes.

import { h } from './dom.js';

const HEADLINE_START = 0.9, HEADLINE_STEP = 0.7; // seconds, matches the CSS animation delays

export function showEraCard(app, n, headlines = null) {
  return new Promise((resolve) => {
    const era = app.era(n);
    app.stage.setEra(n);
    app.stage.setPalette(era.palette);
    app.audio.setEra(n);
    app.audio.whoosh();

    const card = h('div', {
      class: 'era-card', role: 'dialog', 'aria-label': `Era ${n}: ${era.name}, ${era.year}`,
      style: { '--era-a': era.palette.a, '--era-b': era.palette.b },
    },
    h('div', { class: 'era-inner' },
      h('div', { class: 'era-n', text: `era ${n} of ${app.content.ERAS.length}` }),
      h('div', { class: 'era-name', text: era.name }),
      h('div', { class: 'era-rule' }),
      h('div', { class: 'era-year', text: era.year }),
      era.blurb ? h('p', { class: 'era-blurb', text: era.blurb }) : null,
      headlines && headlines.length
        ? h('ul', { class: 'era-news', 'aria-label': 'Headlines' },
          headlines.map((line, i) => h('li', { style: { '--i': i } },
            h('span', { class: 'news-tag', text: 'news' }), h('span', { text: line }))))
        : null,
      h('div', { class: 'era-hint', style: { '--hint-at': `${headlines && headlines.length ? HEADLINE_START + headlines.length * HEADLINE_STEP : 1.2}s` }, text: 'tap to continue' }),
    ));

    let closed = false;
    let timer = 0;
    const revealAt = performance.now() + (headlines && headlines.length ? (HEADLINE_START + headlines.length * HEADLINE_STEP) * 1000 : 0);
    let revealed = !(headlines && headlines.length);
    const tap = () => {
      if (!revealed && performance.now() < revealAt) { revealed = true; card.classList.add('all'); return; }
      close();
    };
    const close = () => {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey, true);
      card.classList.add('out');
      setTimeout(() => { card.remove(); resolve(); }, 520);
    };
    const onKey = (e) => {
      if (['Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); tap(); }
    };
    card.addEventListener('click', tap);
    window.addEventListener('keydown', onKey, true);
    document.body.append(card);
    // Only the debug auto-player moves on by itself.
    if (app.params.auto && !app.frozen) timer = setTimeout(close, 1500);
  });
}
