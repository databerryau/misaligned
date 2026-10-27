// Names in the emblem library (src/render/emblems.js). Kept in its own pure
// module so the validator and tests can import it from Node.

/** The eight seat emblems, in roster order. */
export const SEAT_EMBLEMS = Object.freeze(['lens', 'bars', 'scales', 'eye', 'chevrons', 'windows', 'waves', 'crowd']);

/** Supporting-cast emblems (`eye` is shared with the AI seat). */
export const CAST_EMBLEMS = Object.freeze([
  'clipboard', 'shield', 'gavel', 'chat', 'coin', 'globe', 'flask', 'badge', 'eye',
  'chip', 'key', 'doc', 'mic',
]);

export const EMBLEM_NAMES = Object.freeze([...new Set([...SEAT_EMBLEMS, ...CAST_EMBLEMS])]);
