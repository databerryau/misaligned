// Runs the story validator against every story in content/stories/, plus
// checks that the validator itself catches broken stories.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';

import { validateStory } from '../src/engine/validate.js';
import { SEATS } from '../content/seats.js';
import { CODEX } from '../content/codex.js';
import { ERAS } from '../content/eras.js';
import { EMBLEM_NAMES } from '../src/render/emblem-names.js';

const ctx = { seats: SEATS, codex: CODEX, eras: ERAS, emblems: EMBLEM_NAMES };
const dir = new URL('../content/stories/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.js')).sort();

test('there is at least one story', () => {
  assert.ok(files.includes('demo.js'));
});

for (const file of files) {
  test(`story ${file} passes the validator`, async () => {
    const story = (await import(new URL(file, dir).href)).default;
    const res = validateStory(story, ctx);
    if (res.warnings.length) console.log(`  ${file} warnings:\n    ` + res.warnings.join('\n    '));
    assert.deepEqual(res.errors, [], `${file} has errors`);
    assert.deepEqual([...res.stats.endingsReached].sort(), story.endings.map((e) => e.id).sort());
  });
}

// ── The validator catches problems ─────────────────────────────────────

const base = () => ({
  seat: 'researcher',
  start: 'a',
  cast: { p: { name: 'P', role: 'r', color: '#7fdcff', emblem: 'clipboard' } },
  scenes: {
    a: {
      era: 1, mode: 'cinematic', speaker: 'p', text: 'Text.',
      choices: [
        { label: 'One', dangers: [{ id: 'spec-gaming', outcome: 'caught' }], next: 'd1' },
        { label: 'Two', dangers: [{ id: 'spec-gaming', outcome: 'missed', returnsIn: 2 }], next: 'd1' },
      ],
    },
    d1: { type: 'debrief', era: 1, happened: 'spec-gaming', next: 'b' },
    b: { era: 2, mode: 'hud', text: 'Two.', next: 'end' },
    end: { type: 'ending' },
  },
  endings: [
    { id: 'good', title: 'Good', tone: 'good', if: { caught: ['spec-gaming'] }, text: 'g' },
    { id: 'bad', title: 'Bad', tone: 'bad', text: 'b' },
  ],
});
const errorsOf = (story, opts = {}) => validateStory(story, { ...ctx, ...opts }).errors;
const expectError = (story, pattern) => {
  const errs = errorsOf(story);
  assert.ok(errs.some((e) => pattern.test(e)), `expected ${pattern} in:\n${errs.join('\n')}`);
};

test('a well-formed fixture passes', () => {
  assert.deepEqual(errorsOf(base()), []);
});

test('flags a missing next target', () => {
  const s = base(); s.scenes.a.choices[0].next = 'nowhere';
  expectError(s, /next "nowhere" is not a scene/);
});

test('flags a missing start', () => {
  const s = base(); s.start = 'zzz';
  expectError(s, /start "zzz"/);
});

test('flags unreachable scenes', () => {
  const s = base(); s.scenes.orphan = { era: 1, mode: 'cinematic', text: 'x', next: 'end' };
  expectError(s, /"orphan" is not reachable/);
});

test('flags an ending that no path reaches', () => {
  const s = base(); s.endings[0].if = { caught: ['spec-gaming'], flags: ['never-set'] };
  expectError(s, /ending "good" is never reached/);
});

test('flags a scene whose conditions never hold', () => {
  const s = base();
  s.scenes.a.choices[0].next = 'br';
  s.scenes.br = { type: 'branch', routes: [{ if: { flags: ['never-set'] }, next: 'hidden' }, { next: 'd1' }] };
  s.scenes.hidden = { era: 1, mode: 'cinematic', text: 'x', next: 'd1' };
  expectError(s, /"hidden" is never reached/);
});

test('flags long labels and too many choices', () => {
  const s = base(); s.scenes.a.choices[0].label = 'This label is far too long to fit on one line';
  expectError(s, /max 40/);
  const t = base(); t.scenes.a.choices.push({ label: 'x', next: 'd1' }, { label: 'y', next: 'd1' });
  expectError(t, /max 3/);
});

test('flags unknown speakers, codex ids, meters and outcomes', () => {
  const s = base();
  s.scenes.a.speaker = 'ghost';
  s.scenes.a.choices[0].dangers[0].id = 'not-a-danger';
  s.scenes.a.choices[1].effects = { meters: { mana: 5 } };
  s.scenes.a.choices[1].dangers[0].outcome = 'dodged';
  s.scenes.a.choices[1].note = 'nope';
  const errs = errorsOf(s);
  for (const p of [/speaker "ghost"/, /"not-a-danger" is not a codex id/, /meter "mana"/, /outcome must be/, /note "nope"/]) {
    assert.ok(errs.some((e) => p.test(e)), `expected ${p}`);
  }
});

test('flags unknown condition keys and an `if` on the last ending', () => {
  const s = base(); s.endings[1].if = { flagz: ['x'] };
  const errs = errorsOf(s);
  assert.ok(errs.some((e) => /unknown condition key "flagz"/.test(e)));
  assert.ok(errs.some((e) => /last ending/.test(e)));
});

test('flags debriefs out of era order', () => {
  const s = base();
  s.scenes.d1.next = 'd0';
  s.scenes.d0 = { type: 'debrief', era: 1, happened: 'spec-gaming', next: 'b' };
  expectError(s, /era order/);
});

test('flags a soft-lock where no choice is available', () => {
  const s = base();
  s.scenes.b = { era: 2, mode: 'hud', text: 'x', choices: [{ label: 'Gated', if: { flags: ['never-set'] }, next: 'end' }] };
  expectError(s, /none of its choices available/);
});

test('flags a branch whose last route has a condition', () => {
  const s = base();
  s.scenes.a.choices[0].next = 'br';
  s.scenes.br = { type: 'branch', routes: [{ if: { flags: ['x'] }, next: 'd1' }] };
  expectError(s, /last route/);
});

test('a debrief citing an entry without a precedent warns, and errors in strict mode', () => {
  const cites = () => { const s = base(); s.scenes.d1.happened = 'treacherous-turn'; return s; }; // speculative: no precedent
  const res = validateStory(cites(), ctx);
  assert.ok(res.warnings.some((w) => /no precedent/.test(w)));
  assert.ok(errorsOf(cites(), { strict: true }).some((e) => /no precedent/.test(e)));
});

test('meterZero endings are reachable through the search', () => {
  const s = base();
  s.scenes.a.choices.push({ label: 'Burn it all', effects: { meters: { credibility: -100 } }, next: 'd1' });
  s.endings.unshift({ id: 'fired', title: 'Fired', tone: 'bad', meterZero: 'credibility', text: 'f' });
  const res = validateStory(s, ctx);
  assert.deepEqual(res.errors, []);
  assert.ok(res.stats.endingsReached.includes('fired'));
});
