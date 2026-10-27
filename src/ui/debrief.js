// Era debrief: what you caught, missed (and when it returns) and where you
// were overcautious, the era score, the risk debt gauge (the only place debt
// is shown) and a "This happened" card from the codex.

import { h, signed, fmt, colorVars, ICONS } from './dom.js';
import { liveCanvas } from './canvases.js';
import { eraLog, resolve, sceneType } from '../engine/index.js';
import { drawGauge } from '../render/hud.js';
import { OUTCOME_COLORS, ease } from '../render/util.js';

const OUTCOME_LABEL = {
  caught: 'caught', missed: 'missed', over: 'overcautious', exploited: 'exploited', blocked: 'caught by a safeguard',
};
const ROW_START = 0.4, ROW_STEP = 0.35; // seconds, matches the CSS animation delays
const GAUGE_START = 1.8, GAUGE_DUR = 1.4;

export function debriefScreen(app, { game, scene }) {
  const { stage, audio, content } = app;
  const era = app.era(scene.era);
  stage.setView('backdrop');
  stage.setEra(scene.era);
  stage.setPalette(era.palette);
  stage.setDebt(game.run.debt);
  audio.setEra(scene.era);

  const byId = new Map(content.CODEX.map((c) => [c.id, c]));
  const meterLabel = Object.fromEntries(game.seat.meters.map((m) => [m.id, m.label]));
  const entries = eraLog(game.run, scene.era);
  const t0 = app.clock.time();
  const frozen = app.frozen;

  const rows = entries.length
    ? entries.map((e, i) => {
      const entry = byId.get(e.id);
      const sub = [OUTCOME_LABEL[e.outcome] || e.outcome];
      if (e.outcome === 'missed' && e.returnsIn) sub.push(`returns in era ${e.returnsIn}`);
      if (e.outcome === 'over' && e.meters) {
        for (const [m, d] of Object.entries(e.meters)) if (d < 0) sub.push(`${meterLabel[m] || m} down`);
      }
      return h('li', { class: `row glass out-${e.outcome}`, style: { '--i': i, ...colorVars(OUTCOME_COLORS[e.outcome] || '#e8eeff') } },
        h('span', { class: 'row-ic', html: ICONS[e.outcome] || '' }),
        h('div', { class: 'row-body' },
          h('div', { class: 'row-name', text: entry ? entry.name : e.id }),
          h('div', { class: 'row-sub', text: sub.join(' · ') })),
        h('span', { class: 'row-pts', text: signed(e.points) }));
    })
    : [h('li', { class: 'row glass empty', style: { '--i': 0 } }, 'No dangers surfaced this era.')];

  const eraScore = game.run.eraScore[scene.era] || 0;
  const scoreVal = h('div', { class: 'es-val', text: signed(frozen ? eraScore : 0) });
  const eraScoreBlock = h('div', { class: 'era-score' },
    h('div', { class: 'kicker', text: 'era score' }),
    scoreVal,
    h('div', { class: 'es-total', text: `Total ${fmt(game.run.score)} · Codex ${game.codexFound()}/${content.CODEX.length}` }));

  // Gauge: drawn on canvas, number in the DOM.
  const debt = game.run.debt;
  const gaugeLevel = (t) => (frozen ? debt / 100 : (debt / 100) * ease((t - t0 - GAUGE_START) / GAUGE_DUR));
  const gaugeNum = h('div', { class: 'gauge-num', text: String(frozen ? debt : 0) });
  const gauge = h('div', { class: 'gauge-block' },
    h('div', { class: 'gauge-wrap' },
      liveCanvas((c, w, hh, t, dpr) => drawGauge(c, w, hh, gaugeLevel(t), dpr), { className: 'gauge-canvas' }),
      gaugeNum,
      h('div', { class: 'gauge-lbl', text: 'risk debt' })),
    h('p', { class: 'gauge-cap', text: debt > 0 ? 'Missed dangers compound in later eras.' : 'No hidden debt. For now.' }));

  const happened = happenedStack(app, game, [].concat(scene.happened || []).map((id) => byId.get(id)).filter(Boolean));

  let nextLabel = 'Continue';
  let nextEra = null;
  try {
    if (scene.next) {
      const peek = resolve(game.story, scene.next, game.run);
      if (sceneType(peek.scene) === 'ending') nextLabel = 'See how it ends';
      else if (peek.scene.era) { nextEra = peek.scene.era; nextLabel = `Continue to era ${nextEra}`; }
    }
  } catch { /* the validator catches broken links */ }
  const cont = h('button', {
    class: 'btn primary continue', type: 'button', disabled: !scene.next,
    onClick: () => { audio.click(); if (scene.next) game.go(scene.next); },
  }, nextLabel, h('kbd', { 'aria-hidden': 'true' }, '↵'));

  const el = h('section', { class: 'screen debrief', style: { '--era-a': era.palette.a, '--era-b': era.palette.b } },
    h('div', { class: 'col col-left' },
      h('header', { class: 'debrief-head' },
        h('div', { class: 'kicker', text: `era ${era.n} complete · ${era.name.toLowerCase()} · ${era.year}` }),
        h('h1', {}, 'Debrief')),
      h('ul', { class: 'rows', 'aria-label': 'Dangers this era' }, rows),
      eraScoreBlock),
    h('div', { class: 'col col-right' }, gauge, happened),
    h('footer', { class: 'debrief-foot' }, cont),
  );

  const autoTimer = app.params.auto ? setTimeout(() => cont.click(), 4500) : 0;

  // Reveal sounds, timed with the row animations.
  const timers = [];
  if (!frozen) {
    rows.forEach((r, i) => {
      const good = !r.classList.contains('out-missed') && !r.classList.contains('out-over') && !r.classList.contains('out-blocked');
      timers.push(setTimeout(() => audio.reveal(i, good), (ROW_START + i * ROW_STEP) * 1000 + 150));
    });
  }

  return {
    el,
    tick(t) {
      if (frozen) return;
      gaugeNum.textContent = String(Math.round(gaugeLevel(t) * 100));
      const u = ease((t - t0 - 2.4) / 0.6);
      scoreVal.textContent = signed(Math.round(eraScore * u));
    },
    onKey(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const a = document.activeElement;
        if (a && (a.tagName === 'BUTTON' || a.tagName === 'A')) return;
        e.preventDefault();
        cont.click();
      }
    },
    unmount() { timers.forEach(clearTimeout); clearTimeout(autoTimer); },
  };
}

/** One "This happened" card, or several with a pager (story debriefs may cite a list). */
function happenedStack(app, game, entries) {
  const cards = entries.map((e) => happenedCard(app, game, e));
  if (cards.length <= 1) return cards[0] || null;
  let i = 0;
  const count = h('span', { class: 'h-count' });
  const show = (k) => {
    i = (k + cards.length) % cards.length;
    cards.forEach((c, j) => { c.hidden = j !== i; });
    count.textContent = `${i + 1} / ${cards.length}`;
  };
  const pager = h('div', { class: 'h-pager' },
    h('button', { type: 'button', 'aria-label': 'Previous story', onClick: () => { app.audio.click(); show(i - 1); } }, '‹'),
    count,
    h('button', { type: 'button', 'aria-label': 'Next story', onClick: () => { app.audio.click(); show(i + 1); } }, '›'));
  show(0);
  return h('div', { class: 'happened-stack' }, ...cards, pager);
}

/** The "This happened" card, or the codex entry itself while its precedent is unverified. */
export function happenedCard(app, game, entry) {
  if (!entry) return null;
  const chip = h('button', {
    class: 'codex-chip', type: 'button',
    onClick: () => app.openOverlay('codex', { focus: entry.id }),
  }, `${game && game.isNew(entry.id) ? 'codex +1' : 'in your codex'} · ${entry.name.toLowerCase()}`);
  const p = entry.precedent;
  if (p) {
    return h('article', { class: 'happened glass' },
      h('div', { class: 'h-kicker', text: `this happened · ${p.year}` }),
      h('p', { class: 'h-text', text: p.text }),
      h('p', { class: 'h-src' }, 'Source: ', h('a', { href: p.url, target: '_blank', rel: 'noopener noreferrer', text: p.source })),
      chip);
  }
  return h('article', { class: 'happened glass pending' },
    h('div', { class: 'h-kicker', text: entry.speculative ? 'from the codex · speculative' : 'from the codex' }),
    h('h3', { class: 'h-name', text: entry.name }),
    h('p', { class: 'h-text', text: entry.short }),
    h('p', { class: 'h-why', text: entry.why }),
    h('p', { class: 'h-src', text: entry.speculative ? 'No real-world precedent yet. Researchers take this risk seriously for future systems.' : 'Real-world precedent: being verified.' }),
    chip);
}
