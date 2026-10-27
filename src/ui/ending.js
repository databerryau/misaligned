// Ending screen: the presence in the ending's tone, the ending title and text,
// then on to the result card.

import { h, fmt } from './dom.js';

const TONE_WORD = { good: 'good ending', mixed: 'mixed ending', bad: 'bad ending' };

export function endingScreen(app, { game, ending }) {
  const { stage, audio } = app;
  stage.setView('ending', { tone: ending.tone });
  stage.setDebt(game.run.debt);
  audio.ending(ending.tone);

  const sm = game.summary();
  const meter = ending.meterZero ? game.seat.meters.find((m) => m.id === ending.meterZero) : null;
  const kicker = meter ? `${meter.label} hit zero · ${TONE_WORD[ending.tone] || 'ending'}` : (TONE_WORD[ending.tone] || 'ending');
  const paras = String(ending.text || '').split(/\n\s*\n/).filter(Boolean);

  const toCard = h('button', {
    class: 'btn primary', type: 'button',
    onClick: () => { audio.confirm(); app.show('card', { game, ending }); },
  }, 'See your result card');

  const el = h('section', { class: `screen ending-screen tone-${ending.tone}` },
    h('div', { class: 'ending-block' },
      h('div', { class: 'kicker', text: kicker }),
      h('h1', { class: 'ending-title', text: ending.title }),
      h('div', { class: 'ending-text' }, paras.map((p, i) => h('p', { style: { '--i': i }, text: p }))),
      h('div', { class: 'ending-meta' },
        h('span', { text: `score ${fmt(sm.score)}` }),
        h('span', { text: `${sm.avoided}/${sm.dangersTotal} dangers ${sm.avoidedLabel}` }),
        h('span', { text: `${sm.endingsFound} of ${sm.endingsTotal} endings found` })),
      h('div', { class: 'ending-actions' },
        toCard,
        h('button', { class: 'btn ghost', type: 'button', onClick: () => { audio.click(); app.openOverlay('codex'); } }, 'Danger Codex')),
      game.demo ? h('p', { class: 'demo-note', text: 'You played the demo story. The full safety researcher campaign is on its way.' }) : null,
    ));

  const autoTimer = app.params.auto ? setTimeout(() => toCard.click(), 2500) : 0;

  return {
    el,
    unmount() { clearTimeout(autoTimer); },
    onKey(e) {
      if ((e.key === 'Enter' || e.key === ' ') && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) {
        e.preventDefault();
        toCard.click();
      }
    },
  };
}
