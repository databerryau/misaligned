// Plausible fake run state for screenshot URLs (?screen=debrief|ending|card).
// Uses the real engine so scores, debt and flags stay consistent.

import { createRun, applyDangers, applyEffects } from './engine/index.js';

const HERO = [
  ['caught', 'caught', 'missed', 'over'],
  ['caught', 'over', 'caught'],
  ['caught', 'missed', 'caught'],
  ['caught', 'caught', 'caught'],
  ['caught', 'caught', 'missed'],
];
const VILLAIN = [
  ['exploited', 'exploited', 'blocked'],
  ['exploited', 'blocked', 'exploited'],
  ['exploited', 'exploited', 'over'],
  ['blocked', 'exploited', 'exploited'],
  ['exploited', 'exploited', 'exploited'],
];

/** The distinct danger ids a story's choices raise in one era, in order. */
function storyDangers(story, era) {
  const out = [];
  for (const sc of Object.values(story.scenes || {})) {
    if (sc.era !== era) continue;
    for (const ch of sc.choices || []) for (const d of ch.dangers || []) if (!out.includes(d.id)) out.push(d.id);
  }
  return out;
}

/** A run that has played eras 1..`upTo` with a mix of outcomes. */
export function fakeRun({ seat, story, storyId, codex, upTo = 5 }) {
  let run = createRun({ seat, story, storyId });
  const pool = codex.filter((c) => c.seats.includes(seat.id) && c.group !== 'asi');
  const late = codex.filter((c) => c.seats.includes(seat.id) && c.group === 'asi');
  const ids = pool.length ? pool : codex;
  const patterns = seat.kind === 'villain' ? VILLAIN : HERO;
  let j = 0;
  for (let era = 1; era <= upTo; era++) {
    // Prefer the dangers this story actually raises in this era, so a debrief screenshot looks like real play.
    const own = storyDangers(story, era);
    const outcomes = own.length ? own.map((_, i) => patterns[era - 1][i % patterns[era - 1].length]) : patterns[era - 1];
    for (const [k, outcome] of outcomes.entries()) {
      const list = era >= 5 && late.length ? late : ids;
      const id = own.length ? own[k] : list[j++ % list.length].id;
      const danger = { id, outcome };
      if (outcome === 'missed' && era < 5) danger.returnsIn = Math.min(5, era + 2);
      if (outcome === 'over') {
        // Over-caution usually costs a meter: show it on the debrief row.
        const m = seat.meters[2].id;
        const fx = applyEffects(run, { meters: { [m]: -10 } }, era);
        run = applyDangers(fx.run, [danger], { era, codex }).run;
        run.log[run.log.length - 1].meters = fx.meterDeltas;
      } else {
        run = applyDangers(run, [danger], { era, codex }).run;
      }
    }
  }
  run.scene = null;
  return run;
}
