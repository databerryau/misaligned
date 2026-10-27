// Run state and story stepping. Pure functions, no DOM: every function that
// changes a run returns a new run and leaves its input untouched.
//
// Run shape:
//   { seat, story, scene, score, debt, meters: {id: 0–100}, flags: {name: true},
//     log: [{ era, id, outcome, points, debt, returnsIn?, meters?, scene }],
//     eraScore: {era: points}, discovered: [codexId], path: ['scene#choice'], ending: id|null }

import { evalCond } from './cond.js';
import { dangerValue } from './scoring.js';

export const MAX_METER = 100;
export const MAX_DEBT = 100;
const MAX_HOPS = 64;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const copy = (run) => structuredClone(run);

/** Map codex id → entry (accepts an array or an existing Map). */
export function indexCodex(codex) {
  if (codex instanceof Map) return codex;
  return new Map((codex || []).map((e) => [e.id, e]));
}

/** A fresh run for `seat` playing `story`. */
export function createRun({ seat, story, storyId = null }) {
  const meters = {};
  for (const m of seat.meters) meters[m.id] = clamp(m.start ?? 50, 0, MAX_METER);
  return {
    seat: seat.id,
    story: storyId ?? story.seat ?? null,
    scene: story.start,
    score: 0,
    debt: 0,
    meters,
    flags: {},
    log: [],
    eraScore: {},
    discovered: [],
    path: [],
    ending: null,
  };
}

// ── Low-level mutators (operate on a copy the caller owns) ───────────────

function addScore(run, era, n) {
  if (!n) return;
  run.score += n;
  run.eraScore[era] = (run.eraScore[era] || 0) + n;
}

function discover(run, id) {
  if (id && !run.discovered.includes(id)) run.discovered.push(id);
}

/** Applies a choice's `effects` in place. Returns the actual meter deltas after clamping. */
function applyEffectsInPlace(run, effects, era) {
  const deltas = {};
  if (!effects) return deltas;
  addScore(run, era, effects.score || 0);
  for (const [id, d] of Object.entries(effects.meters || {})) {
    if (!(id in run.meters)) continue; // the validator reports unknown meters
    const before = run.meters[id];
    run.meters[id] = clamp(before + d, 0, MAX_METER);
    if (run.meters[id] !== before) deltas[id] = run.meters[id] - before;
  }
  if (effects.debt) run.debt = clamp(run.debt + effects.debt, 0, MAX_DEBT);
  for (const f of effects.set || []) run.flags[f] = true;
  for (const f of effects.clear || []) delete run.flags[f];
  return deltas;
}

/** Scores, logs and flags each danger in place. Returns the new log entries. */
function applyDangersInPlace(run, dangers, { era, scene, codexById, meterDeltas }) {
  const out = [];
  for (const d of dangers || []) {
    const { points, debt } = dangerValue(d, codexById.get(d.id));
    addScore(run, era, points);
    run.debt = clamp(run.debt + debt, 0, MAX_DEBT);
    run.flags[`${d.outcome}:${d.id}`] = true;
    const entry = { era, id: d.id, outcome: d.outcome, points, debt, scene };
    if (d.returnsIn != null) entry.returnsIn = d.returnsIn;
    if (meterDeltas && Object.keys(meterDeltas).length) entry.meters = { ...meterDeltas };
    run.log.push(entry);
    discover(run, d.id);
    out.push(entry);
  }
  return out;
}

// ── Public API ───────────────────────────────────────────────────────────

/** Returns a new run with `effects` applied (score/meters/debt/flags, clamped). */
export function applyEffects(run, effects, era = 0) {
  const next = copy(run);
  const meterDeltas = applyEffectsInPlace(next, effects, era);
  return { run: next, meterDeltas };
}

/** Returns a new run with `dangers` scored and logged. */
export function applyDangers(run, dangers, { era = 0, scene = null, codex = [] } = {}) {
  const next = copy(run);
  const entries = applyDangersInPlace(next, dangers, { era, scene, codexById: indexCodex(codex) });
  return { run: next, entries };
}

/** Looks up a scene or throws. */
export function getScene(story, id) {
  const scene = story.scenes[id];
  if (!scene) throw new Error(`Unknown scene "${id}"`);
  return scene;
}

export const sceneType = (scene) => scene.type || 'scene';

/** Follows branch scenes from `id` until a non-branch scene. Returns { id, scene }. */
export function resolve(story, id, run) {
  let cur = id;
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const scene = getScene(story, cur);
    if (sceneType(scene) !== 'branch') return { id: cur, scene };
    const route = scene.routes.find((r) => evalCond(r.if, run));
    if (!route) throw new Error(`Branch "${cur}" has no matching route`);
    cur = route.next;
  }
  throw new Error(`Branch loop starting at "${id}"`);
}

/** The text to show for a scene (the first matching `textIf` wins). */
export function sceneText(scene, run) {
  for (const alt of scene.textIf || []) if (evalCond(alt.if, run)) return alt.text;
  return scene.text || '';
}

/** Choices offered right now, each with its index in `scene.choices`. */
export function availableChoices(scene, run) {
  return (scene.choices || [])
    .map((choice, index) => ({ choice, index }))
    .filter(({ choice }) => evalCond(choice.if, run));
}

/** The first ending whose meter is at 0 and that has `meterZero` for it, or null. */
export function meterZeroEnding(story, run) {
  for (const e of story.endings || []) {
    if (e.meterZero && (run.meters[e.meterZero] ?? 1) <= 0 && evalCond(e.if, run)) return e;
  }
  return null;
}

/**
 * The ending for an `ending` scene: the first entry whose `if` holds.
 * Endings with `meterZero` only match while that meter is at 0.
 */
export function selectEnding(story, run) {
  const list = story.endings || [];
  for (const e of list) {
    if (e.meterZero && (run.meters[e.meterZero] ?? 1) > 0) continue;
    if (evalCond(e.if, run)) return e;
  }
  return list[list.length - 1] || null;
}

/** Finds an ending by id. */
export function getEnding(story, id) {
  return (story.endings || []).find((e) => e.id === id) || null;
}

/**
 * Moves the run to scene `id`, following branches. A debrief marks its
 * `happened` entry discovered; an ending scene picks the ending.
 * Returns { run, id, scene, ending }.
 */
export function enter(run, story, id) {
  const next = copy(run);
  const { id: sid, scene } = resolve(story, id, next);
  next.scene = sid;
  let ending = null;
  const type = sceneType(scene);
  if (type === 'debrief') discover(next, scene.happened);
  if (type === 'ending') {
    ending = selectEnding(story, next);
    next.ending = ending ? ending.id : null;
  }
  return { run: next, id: sid, scene, ending };
}

/** Resolves a choice note to { title, text, codexId? } or null. */
export function resolveNote(note, codex) {
  if (!note) return null;
  if (typeof note === 'string') {
    const entry = indexCodex(codex).get(note);
    if (!entry) return { title: note, text: '', codexId: note };
    return { title: entry.name, text: entry.short, codexId: entry.id };
  }
  return { title: note.title || '', text: note.text || '' };
}

/**
 * Applies choice `index` of the current scene. Returns
 * { run, result: { choice, era, dangers, note, reply, next, meterDeltas, ending } }
 * where `ending` is set when a meter hit 0 and a `meterZero` ending catches it.
 * The run's scene is not advanced: call `enter(run, story, result.next)` after.
 */
export function applyChoice(run, story, index, { codex = [] } = {}) {
  const scene = getScene(story, run.scene);
  if (sceneType(scene) !== 'scene') throw new Error(`Scene "${run.scene}" has no choices`);
  const choice = (scene.choices || [])[index];
  if (!choice) throw new Error(`Scene "${run.scene}" has no choice ${index}`);
  if (!evalCond(choice.if, run)) throw new Error(`Choice ${index} of "${run.scene}" is not available`);

  const codexById = indexCodex(codex);
  const next = copy(run);
  const era = scene.era;
  const meterDeltas = applyEffectsInPlace(next, choice.effects, era);
  const dangers = applyDangersInPlace(next, choice.dangers, { era, scene: run.scene, codexById, meterDeltas });
  const note = resolveNote(choice.note, codexById);
  if (note && note.codexId) discover(next, note.codexId);
  next.path.push(`${run.scene}#${index}`);

  const ending = meterZeroEnding(story, next);
  if (ending) next.ending = ending.id;

  return {
    run: next,
    result: {
      choice, era, dangers, note, meterDeltas, ending,
      reply: choice.reply || null,
      next: choice.next ?? scene.next ?? null,
    },
  };
}

/** For a scene without choices: where Continue goes. */
export function continueTarget(story, run) {
  return getScene(story, run.scene).next ?? null;
}

/** The log entries for one era. */
export const eraLog = (run, era) => run.log.filter((e) => e.era === era);

/** Score banked before the current era: what the HUD shows during play. */
export function bankedScore(run, era) {
  return run.score - (run.eraScore[era] || 0);
}
