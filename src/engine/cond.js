// Cond evaluation (content/README.md § Cond). Pure, no DOM.
// All present keys must hold. Unknown keys are ignored here and reported by the validator.

export const COND_KEYS = Object.freeze([
  'flags', 'notFlags', 'debtAtLeast', 'debtBelow',
  'meterAtLeast', 'meterBelow', 'caught', 'missed',
]);

/** True when `cond` holds for `run` (a missing cond always holds). */
export function evalCond(cond, run) {
  if (cond == null) return true;
  const flags = run.flags || {};
  const meters = run.meters || {};
  const debt = run.debt || 0;

  if (cond.flags && !cond.flags.every((f) => flags[f])) return false;
  if (cond.notFlags && cond.notFlags.some((f) => flags[f])) return false;
  if (cond.debtAtLeast != null && !(debt >= cond.debtAtLeast)) return false;
  if (cond.debtBelow != null && !(debt < cond.debtBelow)) return false;
  if (cond.meterAtLeast) {
    for (const [id, v] of Object.entries(cond.meterAtLeast)) if (!((meters[id] ?? 0) >= v)) return false;
  }
  if (cond.meterBelow) {
    for (const [id, v] of Object.entries(cond.meterBelow)) if (!((meters[id] ?? 0) < v)) return false;
  }
  if (cond.caught && !cond.caught.every((id) => flags['caught:' + id])) return false;
  if (cond.missed && !cond.missed.every((id) => flags['missed:' + id])) return false;
  return true;
}

/** Every flag name a Cond can read (used to keep the validator's state search small). */
export function condFlags(cond) {
  if (!cond) return [];
  return [
    ...(cond.flags || []),
    ...(cond.notFlags || []),
    ...(cond.caught || []).map((id) => 'caught:' + id),
    ...(cond.missed || []).map((id) => 'missed:' + id),
  ];
}

/** Every meter id a Cond can read. */
export function condMeters(cond) {
  if (!cond) return [];
  return [...Object.keys(cond.meterAtLeast || {}), ...Object.keys(cond.meterBelow || {})];
}

/** True when a Cond reads risk debt. */
export function condUsesDebt(cond) {
  return !!cond && (cond.debtAtLeast != null || cond.debtBelow != null);
}
