// Era transition card: era number, name and year over a palette crossfade.
// Resolves when it closes (auto after a few seconds, or on click / key).

import { h } from './dom.js';

const HEADLINE_START = 1.1, HEADLINE_STEP = 1.5; // seconds, matches the CSS animation delays

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
      headlines && headlines.length ? h('div', { class: 'era-hint', text: 'tap to continue' }) : null,
    ));

    let closed = false;
    let timer = 0;
    const close = () => {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey, true);
      card.classList.add('out');
      setTimeout(() => { card.remove(); resolve(); }, 520);
    };
    const onKey = (e) => {
      if (['Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); close(); }
    };
    card.addEventListener('click', close);
    window.addEventListener('keydown', onKey, true);
    document.body.append(card);
    const hold = headlines && headlines.length ? (HEADLINE_START + headlines.length * HEADLINE_STEP + 3.2) * 1000 : 3400;
    if (!app.frozen) timer = setTimeout(close, hold);
  });
}
