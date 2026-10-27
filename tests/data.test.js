// Data checks on eras, seats and the codex.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validateData } from '../src/engine/validate.js';
import { ERAS } from '../content/eras.js';
import { SEATS } from '../content/seats.js';
import { CODEX, CODEX_GROUPS } from '../content/codex.js';
import { EMBLEM_NAMES, SEAT_EMBLEMS } from '../src/render/emblem-names.js';

test('eras, seats and codex pass validateData', () => {
  const res = validateData({ eras: ERAS, seats: SEATS, codex: CODEX, emblems: EMBLEM_NAMES });
  assert.deepEqual(res.errors, []);
});

test('five eras in order', () => {
  assert.deepEqual(ERAS.map((e) => e.n), [1, 2, 3, 4, 5]);
});

test('eight seats with unique ids and the roster emblems', () => {
  assert.equal(SEATS.length, 8);
  assert.equal(new Set(SEATS.map((s) => s.id)).size, 8);
  assert.deepEqual(SEATS.map((s) => s.emblem), [...SEAT_EMBLEMS]);
  assert.equal(SEATS.find((s) => s.id === 'researcher').story, 'researcher');
  assert.equal(SEATS.filter((s) => s.story === null).length, 7);
});

test('codex has 34 entries, unique ids, every group used, no precedents invented', () => {
  assert.equal(CODEX.length, 34);
  assert.equal(new Set(CODEX.map((c) => c.id)).size, 34);
  for (const g of CODEX_GROUPS) assert.ok(CODEX.some((c) => c.group === g.id), g.id);
  for (const c of CODEX) assert.equal(c.precedent, null, `${c.id} precedent is left to the lead`);
  for (const c of CODEX.filter((c) => c.group === 'asi')) assert.equal(c.speculative, true, c.id);
});

test('validateData catches duplicates and bad fields', () => {
  const res = validateData({
    eras: [{ n: 2, name: '', year: '2026', palette: { a: 'red', b: '#000000' } }],
    seats: [SEATS[0], SEATS[0]],
    codex: [{ ...CODEX[0], id: 'Bad Id', group: 'misc' }],
    emblems: EMBLEM_NAMES,
  });
  const text = res.errors.join('\n');
  for (const p of [/n must be 1/, /name is required/, /palette/, /duplicate id/, /kebab-case/, /group must be/]) assert.match(text, p);
});
