// Title screen: the presence, the logo with the misaligned G, a tagline,
// Begin, and the era rail from today to ASI.

import { h } from './dom.js';
import { liveCanvas } from './canvases.js';
import { drawLogo, logoWidth } from '../render/logo.js';

export function titleScreen(app) {
  const { stage, content } = app;
  stage.setView('title');
  stage.setPalette(app.era(1).palette);
  stage.setEra(1);
  stage.setDebt(0);
  app.audio.setEra(1);

  const logo = liveCanvas((c, w, hh, t) => {
    const size = Math.min((100 * w * 0.94) / logoWidth(c, 100), hh / 1.3);
    drawLogo(c, w / 2, hh * 0.74, size, t);
  }, { className: 'logo-canvas' });

  const begin = h('button', {
    class: 'btn primary begin', type: 'button',
    onClick: () => { app.audio.unlock(); app.audio.confirm(); app.show('select'); },
  }, 'Begin');

  const found = app.store.discovered().size;
  const codexBtn = h('button', {
    class: 'btn ghost', type: 'button',
    onClick: () => { app.audio.click(); app.openOverlay('codex'); },
  }, found ? `Danger Codex · ${found}/${content.CODEX.length}` : 'Danger Codex');

  const stops = content.ERAS.map((e) => h('div', { class: 'rail-stop' }, h('i'), h('span', { text: e.name.toLowerCase() })));
  const head = h('b', { class: 'rail-head' });
  const rail = h('div', { class: 'era-rail', 'aria-hidden': 'true' }, h('div', { class: 'rail-line' }), head, ...stops);

  const el = h('section', { class: 'screen title-screen' },
    h('h1', { class: 'sr-only' }, 'Misaligned'),
    h('div', { class: 'title-block' },
      logo,
      h('p', { class: 'tagline' }, 'Every choice between today’s chatbots and superintelligence.'),
      h('div', { class: 'title-actions' }, begin, codexBtn),
      rail,
    ),
  );

  return {
    el,
    tick(t) {
      // The head sweeps the rail every 8.5 s and lights each era as it passes.
      const f = ((t * 40) % 340) / 340;
      head.style.left = `${f * 100}%`;
      stops.forEach((s, i) => s.classList.toggle('lit', f >= i / (stops.length - 1) - 0.001));
    },
    onKey(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
        e.preventDefault();
        begin.click();
      }
    },
  };
}
