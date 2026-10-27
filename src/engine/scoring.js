// Scoring defaults (content/README.md § Scoring defaults). Pure, no DOM.

export const OUTCOMES = Object.freeze(['caught', 'partial', 'missed', 'over', 'exploited', 'blocked']);

export const SCORING = Object.freeze({
  caught: Object.freeze({ points: 300, debt: 0 }),
  partial: Object.freeze({ points: 150, debt: 6 }), // partly caught: half the reward, half the debt
  missed: Object.freeze({ points: 0, debt: 12 }),
  over: Object.freeze({ points: -120, debt: 0 }),
  exploited: Object.freeze({ points: 300, debt: 0 }),
  blocked: Object.freeze({ points: 0, debt: 0 }),
});

/** Outcomes that count as a win for the player on the result card. */
export const GOOD_OUTCOMES = Object.freeze(['caught', 'exploited']);

/**
 * Points and debt for one danger met in a choice.
 * Precedence: the danger object's own `points`/`debt`, then the codex entry's,
 * then the defaults above. A codex entry's `points` replaces the reward for a
 * win (caught/exploited); its `debt` replaces the debt for a miss. The penalty
 * for `over` is not touched by codex overrides.
 */
export function dangerValue(danger, entry) {
  const base = SCORING[danger.outcome];
  if (!base) throw new Error(`Unknown danger outcome "${danger.outcome}"`);
  let { points, debt } = base;
  if (entry) {
    if (entry.points != null && GOOD_OUTCOMES.includes(danger.outcome)) points = entry.points;
    if (entry.debt != null && danger.outcome === 'missed') debt = entry.debt;
  }
  if (danger.points != null) points = danger.points;
  if (danger.debt != null) debt = danger.debt;
  return { points, debt };
}
