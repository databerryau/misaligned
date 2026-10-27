// Engine unit tests: conditions, effects, clamping, scoring, auto-flags,
// branch routing, ending selection and meterZero.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  evalCond, dangerValue, SCORING, createRun, applyEffects, applyDangers, applyChoice,
  resolve, enter, sceneText, availableChoices, selectEnding, meterZeroEnding,
  resolveNote, bankedScore, eraLog, summarize, seatPhrase, teaserSeat,
} from '../src/engine/index.js';
import { SEATS } from '../content/seats.js';

const SEAT = {
  id: 'tester', name: 'Tester', kind: 'hero', color: '#7fdcff', emblem: 'lens', tagline: 't',
  meters: [{ id: 'cred', label: 'cred', start: 50 }, { id: 'compute', label: 'compute', start: 90 }, { id: 'trust', label: 'trust', start: 10 }],
  story: 'fixture',
};
const CODEX = [
  { id: 'alpha', name: 'Alpha', group: 'technical', short: 'Alpha short.', why: 'w', seats: ['tester'], speculative: false, precedent: null },
  { id: 'beta', name: 'Beta', group: 'control', short: 'Beta short.', why: 'w', seats: ['tester'], speculative: false, precedent: null, points: 500, debt: 20 },
];

const STORY = {
  seat: 'tester',
  start: 's1',
  cast: { a: { name: 'A', role: 'r', color: '#ffffff', emblem: 'clipboard' } },
  scenes: {
    s1: {
      era: 1, mode: 'cinematic', speaker: 'a', text: 'Base text.',
      textIf: [{ if: { flags: ['x'] }, text: 'X text.' }, { if: { debtAtLeast: 10 }, text: 'Debt text.' }],
      choices: [
        { label: 'Catch', effects: { meters: { cred: 10 } }, dangers: [{ id: 'alpha', outcome: 'caught' }], note: 'alpha', next: 'b1' },
        { label: 'Miss', dangers: [{ id: 'alpha', outcome: 'missed', returnsIn: 2 }], next: 'b1' },
        { label: 'Locked', if: { flags: ['never'] }, next: 'b1' },
      ],
    },
    b1: { type: 'branch', routes: [{ if: { missed: ['alpha'] }, next: 'bad' }, { next: 'good' }] },
    good: { era: 1, mode: 'hud', text: 'Good.', next: 'd1' },
    bad: {
      era: 1, mode: 'cinematic', text: 'Bad.',
      choices: [
        { label: 'Crash', effects: { meters: { cred: -80 } }, next: 'd1' },
        { label: 'Survive', effects: { meters: { trust: -50 } }, next: 'd1' },
      ],
    },
    d1: { type: 'debrief', era: 1, happened: 'beta', next: 'end' },
    end: { type: 'ending' },
  },
  endings: [
    { id: 'fired', title: 'Fired', tone: 'bad', meterZero: 'cred', text: 'f' },
    { id: 'best', title: 'Best', tone: 'good', if: { caught: ['alpha'], debtBelow: 5 }, text: 'b' },
    { id: 'fallback', title: 'Fallback', tone: 'mixed', text: 'm' },
  ],
};

const fresh = () => createRun({ seat: SEAT, story: STORY, storyId: 'fixture' });

test('createRun starts meters, score, debt and scene', () => {
  const run = fresh();
  assert.deepEqual(run.meters, { cred: 50, compute: 90, trust: 10 });
  assert.equal(run.score, 0);
  assert.equal(run.debt, 0);
  assert.equal(run.scene, 's1');
  assert.equal(run.story, 'fixture');
});

test('evalCond: every key, and all present keys must hold', () => {
  const run = { flags: { a: true, 'caught:alpha': true, 'missed:beta': true }, meters: { cred: 40 }, debt: 20 };
  assert.equal(evalCond(undefined, run), true);
  assert.equal(evalCond({}, run), true);
  assert.equal(evalCond({ flags: ['a'] }, run), true);
  assert.equal(evalCond({ flags: ['a', 'b'] }, run), false);
  assert.equal(evalCond({ notFlags: ['b'] }, run), true);
  assert.equal(evalCond({ notFlags: ['a'] }, run), false);
  assert.equal(evalCond({ debtAtLeast: 20 }, run), true);
  assert.equal(evalCond({ debtAtLeast: 21 }, run), false);
  assert.equal(evalCond({ debtBelow: 21 }, run), true);
  assert.equal(evalCond({ debtBelow: 20 }, run), false);
  assert.equal(evalCond({ meterAtLeast: { cred: 40 } }, run), true);
  assert.equal(evalCond({ meterAtLeast: { cred: 41 } }, run), false);
  assert.equal(evalCond({ meterBelow: { cred: 41 } }, run), true);
  assert.equal(evalCond({ meterBelow: { cred: 40 } }, run), false);
  assert.equal(evalCond({ caught: ['alpha'] }, run), true);
  assert.equal(evalCond({ caught: ['beta'] }, run), false);
  assert.equal(evalCond({ missed: ['beta'] }, run), true);
  assert.equal(evalCond({ missed: ['alpha'] }, run), false);
  assert.equal(evalCond({ flags: ['a'], debtBelow: 10 }, run), false, 'AND across keys');
});

test('applyEffects: score, meters and debt clamp to 0–100; flags set and clear', () => {
  let run = fresh();
  run = applyEffects(run, { score: 50, meters: { cred: 70, compute: 30, trust: -40 }, debt: 130, set: ['x', 'y'] }, 1).run;
  assert.equal(run.score, 50);
  assert.equal(run.eraScore[1], 50);
  assert.deepEqual(run.meters, { cred: 100, compute: 100, trust: 0 });
  assert.equal(run.debt, 100);
  assert.ok(run.flags.x && run.flags.y);
  const r2 = applyEffects(run, { debt: -150, clear: ['x'] }, 1);
  assert.equal(r2.run.debt, 0);
  assert.equal(r2.run.flags.x, undefined);
  assert.equal(r2.run.flags.y, true);
  assert.equal(run.flags.x, true, 'input run is not mutated');
});

test('applyEffects reports actual (clamped) meter deltas', () => {
  const { meterDeltas } = applyEffects(fresh(), { meters: { compute: 30, cred: -5 } }, 1);
  assert.deepEqual(meterDeltas, { compute: 10, cred: -5 });
});

test('scoring defaults for every outcome', () => {
  assert.deepEqual(dangerValue({ id: 'alpha', outcome: 'caught' }), { points: 300, debt: 0 });
  assert.deepEqual(dangerValue({ id: 'alpha', outcome: 'missed' }), { points: 0, debt: 12 });
  assert.deepEqual(dangerValue({ id: 'alpha', outcome: 'over' }), { points: -120, debt: 0 });
  assert.deepEqual(dangerValue({ id: 'alpha', outcome: 'exploited' }), { points: 300, debt: 0 });
  assert.deepEqual(dangerValue({ id: 'alpha', outcome: 'blocked' }), { points: 0, debt: 0 });
  assert.equal(Object.keys(SCORING).length, 5);
  assert.throws(() => dangerValue({ id: 'alpha', outcome: 'nope' }));
});

test('codex entry overrides points (wins) and debt (misses); danger object overrides both', () => {
  const beta = CODEX[1];
  assert.deepEqual(dangerValue({ id: 'beta', outcome: 'caught' }, beta), { points: 500, debt: 0 });
  assert.deepEqual(dangerValue({ id: 'beta', outcome: 'exploited' }, beta), { points: 500, debt: 0 });
  assert.deepEqual(dangerValue({ id: 'beta', outcome: 'missed' }, beta), { points: 0, debt: 20 });
  assert.deepEqual(dangerValue({ id: 'beta', outcome: 'over' }, beta), { points: -120, debt: 0 }, 'over keeps its penalty');
  assert.deepEqual(dangerValue({ id: 'beta', outcome: 'caught', points: 50 }, beta), { points: 50, debt: 0 });
  assert.deepEqual(dangerValue({ id: 'beta', outcome: 'missed', debt: 3 }, beta), { points: 0, debt: 3 });
});

test('applyDangers logs, scores, sets auto-flags and discovers', () => {
  const { run, entries } = applyDangers(fresh(), [
    { id: 'alpha', outcome: 'caught' },
    { id: 'beta', outcome: 'missed', returnsIn: 3 },
    { id: 'alpha', outcome: 'over' },
  ], { era: 2, scene: 's1', codex: CODEX });
  assert.equal(entries.length, 3);
  assert.equal(run.score, 300 - 120);
  assert.equal(run.eraScore[2], 180);
  assert.equal(run.debt, 20);
  assert.ok(run.flags['caught:alpha'] && run.flags['missed:beta'] && run.flags['over:alpha']);
  assert.deepEqual(run.log.map((e) => [e.era, e.id, e.outcome]), [[2, 'alpha', 'caught'], [2, 'beta', 'missed'], [2, 'alpha', 'over']]);
  assert.equal(run.log[1].returnsIn, 3);
  assert.deepEqual(run.discovered, ['alpha', 'beta']);
  assert.deepEqual(eraLog(run, 2).length, 3);
});

test('exploited and blocked outcomes set their own flags too', () => {
  const { run } = applyDangers(fresh(), [{ id: 'alpha', outcome: 'exploited' }, { id: 'beta', outcome: 'blocked' }], { era: 1, codex: CODEX });
  assert.ok(run.flags['exploited:alpha'] && run.flags['blocked:beta']);
  assert.equal(run.score, 500 - 200);
});

test('applyChoice applies effects, dangers, note and reports next', () => {
  const { run, result } = applyChoice(fresh(), STORY, 0, { codex: CODEX });
  assert.equal(run.meters.cred, 60);
  assert.equal(run.score, 300);
  assert.equal(result.next, 'b1');
  assert.deepEqual(result.note, { title: 'Alpha', text: 'Alpha short.', codexId: 'alpha' });
  assert.deepEqual(result.meterDeltas, { cred: 10 });
  assert.equal(result.dangers.length, 1);
  assert.equal(result.ending, null);
  assert.deepEqual(run.path, ['s1#0']);
  assert.equal(run.log[0].meters.cred, 10, 'log keeps the choice meter deltas');
});

test('applyChoice refuses a choice whose if does not hold', () => {
  assert.throws(() => applyChoice(fresh(), STORY, 2, { codex: CODEX }), /not available/);
  assert.throws(() => applyChoice(fresh(), STORY, 9, { codex: CODEX }), /no choice/);
});

test('availableChoices filters by if and keeps original indexes', () => {
  const list = availableChoices(STORY.scenes.s1, fresh());
  assert.deepEqual(list.map((c) => c.index), [0, 1]);
  const unlocked = availableChoices(STORY.scenes.s1, { ...fresh(), flags: { never: true } });
  assert.deepEqual(unlocked.map((c) => c.index), [0, 1, 2]);
});

test('sceneText uses the first matching textIf', () => {
  assert.equal(sceneText(STORY.scenes.s1, fresh()), 'Base text.');
  assert.equal(sceneText(STORY.scenes.s1, { ...fresh(), debt: 12 }), 'Debt text.');
  assert.equal(sceneText(STORY.scenes.s1, { ...fresh(), debt: 12, flags: { x: true } }), 'X text.');
});

test('branch routing: first matching route wins, last is the fallback', () => {
  const caught = applyChoice(fresh(), STORY, 0, { codex: CODEX }).run;
  const missed = applyChoice(fresh(), STORY, 1, { codex: CODEX }).run;
  assert.equal(resolve(STORY, 'b1', caught).id, 'good');
  assert.equal(resolve(STORY, 'b1', missed).id, 'bad');
  assert.equal(resolve(STORY, 's1', caught).id, 's1', 'non-branch resolves to itself');
  assert.throws(() => resolve(STORY, 'nope', caught), /Unknown scene/);
  const loop = { scenes: { a: { type: 'branch', routes: [{ next: 'b' }] }, b: { type: 'branch', routes: [{ next: 'a' }] } } };
  assert.throws(() => resolve(loop, 'a', caught), /loop/);
});

test('enter follows branches, discovers debrief entries and picks endings', () => {
  let run = applyChoice(fresh(), STORY, 0, { codex: CODEX }).run;
  let step = enter(run, STORY, 'b1');
  assert.equal(step.id, 'good');
  assert.equal(step.run.scene, 'good');
  step = enter(step.run, STORY, 'd1');
  assert.ok(step.run.discovered.includes('beta'));
  step = enter(step.run, STORY, 'end');
  assert.equal(step.ending.id, 'best');
  assert.equal(step.run.ending, 'best');
});

test('ending selection: in order, fallback last, meterZero endings skipped while meter > 0', () => {
  const base = fresh();
  assert.equal(selectEnding(STORY, { ...base, flags: { 'caught:alpha': true } }).id, 'best');
  assert.equal(selectEnding(STORY, { ...base, flags: { 'caught:alpha': true }, debt: 5 }).id, 'fallback');
  assert.equal(selectEnding(STORY, base).id, 'fallback');
  assert.equal(selectEnding(STORY, { ...base, meters: { ...base.meters, cred: 0 } }).id, 'fired');
});

test('meterZero: a meter hitting 0 ends the run when an ending catches it', () => {
  const missed = enter(applyChoice(fresh(), STORY, 1, { codex: CODEX }).run, STORY, 'b1').run;
  assert.equal(missed.scene, 'bad');
  const crash = applyChoice(missed, STORY, 0, { codex: CODEX });
  assert.equal(crash.run.meters.cred, 0);
  assert.equal(crash.result.ending.id, 'fired');
  assert.equal(crash.run.ending, 'fired');
  // trust hits 0 too, but no ending has meterZero: 'trust', so play continues.
  const survive = applyChoice(missed, STORY, 1, { codex: CODEX });
  assert.equal(survive.run.meters.trust, 0);
  assert.equal(survive.result.ending, null);
  assert.equal(meterZeroEnding(STORY, survive.run), null);
});

test('resolveNote handles codex ids and custom notes', () => {
  assert.deepEqual(resolveNote('alpha', CODEX), { title: 'Alpha', text: 'Alpha short.', codexId: 'alpha' });
  assert.deepEqual(resolveNote({ title: 'T', text: 'X' }, CODEX), { title: 'T', text: 'X' });
  assert.equal(resolveNote(null, CODEX), null);
});

test('bankedScore hides the current era until its debrief', () => {
  let run = applyDangers(fresh(), [{ id: 'alpha', outcome: 'caught' }], { era: 1, codex: CODEX }).run;
  run = applyDangers(run, [{ id: 'alpha', outcome: 'caught' }], { era: 2, codex: CODEX }).run;
  assert.equal(run.score, 600);
  assert.equal(bankedScore(run, 2), 300);
});

test('summarize builds the result card data', () => {
  let run = applyDangers(fresh(), [
    { id: 'alpha', outcome: 'caught' }, { id: 'beta', outcome: 'missed' }, { id: 'alpha', outcome: 'over' },
  ], { era: 1, codex: CODEX }).run;
  run = applyDangers(run, [{ id: 'beta', outcome: 'caught' }], { era: 3, codex: CODEX }).run;
  const seat = SEATS[0];
  const s = summarize({ run, story: STORY, seat, seats: SEATS, codex: CODEX, ending: STORY.endings[1], codexFound: 2, endingsFound: ['fallback'] });
  assert.equal(s.avoided, 2);
  assert.equal(s.dangersTotal, 3, 'over is a false alarm, not a danger');
  assert.deepEqual(s.eras, [['caught', 'missed', 'over'], [], ['caught'], [], []]);
  assert.equal(s.codexFound, 2);
  assert.equal(s.codexTotal, 2);
  assert.equal(s.endingsFound, 2);
  assert.equal(s.endingsTotal, 3);
  assert.equal(s.teaser.id, 'ai');
  assert.equal(s.teaser.phrase, 'the AI');
  assert.equal(s.url, 'https://databerryau.github.io/misaligned/');
});

test('villain summaries count exploited against blocked', () => {
  const run = applyDangers(fresh(), [
    { id: 'alpha', outcome: 'exploited' }, { id: 'beta', outcome: 'blocked' }, { id: 'beta', outcome: 'exploited' },
  ], { era: 1, codex: CODEX }).run;
  const seat = SEATS.find((s) => s.id === 'ai');
  const s = summarize({ run, story: STORY, seat, seats: SEATS, codex: CODEX, ending: null });
  assert.equal(s.avoided, 2);
  assert.equal(s.dangersTotal, 3);
  assert.equal(s.avoidedLabel, 'exploited');
});

test('seat phrases and teasers read naturally', () => {
  const by = Object.fromEntries(SEATS.map((s) => [s.id, s]));
  assert.equal(seatPhrase(by.ai), 'the AI');
  assert.equal(seatPhrase(by.ceo), 'a lab CEO');
  assert.equal(seatPhrase(by.office), 'an office worker');
  assert.equal(seatPhrase(by.accelerationist), 'an accelerationist');
  assert.equal(seatPhrase(by.researcher), 'a safety researcher');
  for (const s of SEATS) assert.notEqual(teaserSeat(s.id, SEATS).id, s.id);
});
