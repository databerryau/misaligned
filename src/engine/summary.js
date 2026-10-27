// Result summary for the ending screen and the share card. Pure, no DOM.

export const GAME_URL = 'https://databerryau.github.io/misaligned/';

/** "the AI", "a regulator", "an office worker" … for the "Could you do better as …?" teaser. */
export function seatPhrase(seat) {
  const name = seat.name;
  if (/^the\s/i.test(name)) return 'the ' + name.slice(4);
  const lower = name.charAt(0).toLowerCase() + name.slice(1);
  return (/^[aeiou]/i.test(name) ? 'an ' : 'a ') + lower.replace(/\bceo\b/i, 'CEO');
}

/**
 * The seat the result card teases. Deterministic: three seats along the roster,
 * which pairs each seat with a contrasting one (researcher → the AI, CEO →
 * accelerationist …).
 */
export function teaserSeat(seatId, seats) {
  const i = seats.findIndex((s) => s.id === seatId);
  if (i < 0 || seats.length < 2) return null;
  return seats[(i + 3) % seats.length];
}

/**
 * Builds everything the result card shows.
 * @param {object} o
 * @param {object} o.run          finished run
 * @param {object} o.story        story module default export
 * @param {object} o.seat         seat entry
 * @param {object[]} o.seats      all seats (for the teaser)
 * @param {object[]} o.codex      all codex entries
 * @param {object} o.ending       the ending reached
 * @param {number} [o.codexFound] codex entries discovered across all runs
 * @param {string[]} [o.endingsFound] ending ids found for this seat across runs
 * @param {number} [o.eras]       number of eras (5)
 */
export function summarize({ run, story, seat, seats, codex, ending, codexFound, endingsFound, eras = 5 }) {
  const villain = seat.kind === 'villain';
  const win = villain ? 'exploited' : 'caught';
  const lose = villain ? 'blocked' : 'missed';
  // A partly caught danger counts as half avoided (rounded down overall).
  const avoided = Math.floor(run.log.reduce((n, e) => n + (e.outcome === win ? 1 : !villain && e.outcome === 'partial' ? 0.5 : 0), 0));
  const total = run.log.filter((e) => e.outcome === win || e.outcome === lose || e.outcome === 'partial').length;
  const strip = Array.from({ length: eras }, (_, i) => run.log.filter((e) => e.era === i + 1).map((e) => e.outcome));
  const teaser = teaserSeat(seat.id, seats);
  const found = new Set(endingsFound || []);
  if (ending) found.add(ending.id);
  return {
    seat: { id: seat.id, name: seat.name, color: seat.color, emblem: seat.emblem, kind: seat.kind },
    ending: ending ? { id: ending.id, title: ending.title, tone: ending.tone } : null,
    score: run.score,
    avoided,
    dangersTotal: total,
    avoidedLabel: villain ? 'exploited' : 'avoided',
    codexFound: codexFound ?? run.discovered.length,
    codexTotal: codex.length,
    eras: strip,
    endingsFound: found.size,
    endingsTotal: (story.endings || []).length,
    teaser: teaser ? { id: teaser.id, name: teaser.name, color: teaser.color, phrase: seatPhrase(teaser) } : null,
    demo: !!story.demo,
    url: GAME_URL,
  };
}
