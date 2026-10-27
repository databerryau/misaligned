// Story and data validator. Pure, no DOM: run it from Node or the browser.
//
//   import { validateStory } from './src/engine/validate.js';
//   const { ok, errors, warnings, stats } = validateStory(story, { seats, codex, eras, emblems });
//
// Structural checks follow content/README.md. Then a bounded state search plays
// every choice from `start` (merging states that no Cond can tell apart) to prove
// every scene and every ending is reachable and that no state soft-locks.

import { COND_KEYS, evalCond, condFlags, condMeters, condUsesDebt } from './cond.js';
import { OUTCOMES } from './scoring.js';
import { createRun, availableChoices, applyChoice, selectEnding, sceneType } from './run.js';

export const MAX_LABEL = 40;
const SCENE_TYPES = ['scene', 'branch', 'debrief', 'ending'];
const MODES = ['cinematic', 'hud'];
const TONES = ['good', 'mixed', 'bad'];
const KINDS = ['hero', 'villain', 'everyday'];
const GROUPS = ['technical', 'control', 'society', 'asi'];
const KEYS = {
  scene: ['type', 'era', 'mode', 'art', 'speaker', 'text', 'textIf', 'choices', 'next'],
  branch: ['type', 'routes'],
  debrief: ['type', 'era', 'happened', 'next'],
  ending: ['type'],
  choice: ['label', 'if', 'effects', 'dangers', 'note', 'reply', 'next'],
  effects: ['score', 'meters', 'debt', 'set', 'clear'],
  danger: ['id', 'outcome', 'returnsIn', 'points', 'debt'],
  endingEntry: ['id', 'title', 'tone', 'if', 'text', 'meterZero'],
  cast: ['name', 'role', 'color', 'emblem', 'ai'],
  story: ['seat', 'start', 'cast', 'scenes', 'endings', 'demo', 'title'],
};
const ART_KEYS = { cinematic: ['alarm', 'orb', 'figure'], hud: ['title', 'stat', 'feature', 'anomaly', 'log'] };
const HEX = /^#[0-9a-f]{6}$/i;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const isObj = (v) => v != null && typeof v === 'object' && !Array.isArray(v);
const isStrArr = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string');
const isInt = (v) => Number.isInteger(v);
const len = (s) => [...s].length;

function unknownKeys(obj, allowed, where, warn) {
  for (const k of Object.keys(obj)) if (!allowed.includes(k)) warn(`${where}: unknown key "${k}"`);
}

/**
 * Validates one story module (its default export).
 * @param {object} story
 * @param {object} o
 * @param {object[]} o.seats   SEATS
 * @param {object[]} o.codex   CODEX
 * @param {object[]} [o.eras]  ERAS
 * @param {string[]} [o.emblems] known emblem names (cast emblems are checked when given)
 * @param {boolean} [o.strict] treat warnings that block shipping (a debrief citing a codex
 *                             entry without a precedent) as errors
 * @param {number} [o.maxStates] cap for the state search
 * @returns {{ ok: boolean, errors: string[], warnings: string[], stats: object }}
 */
export function validateStory(story, { seats = [], codex = [], eras = [], emblems = null, strict = false, maxStates = 200000 } = {}) {
  const errors = [];
  const warnings = [];
  const E = (m) => errors.push(m);
  const W = (m) => warnings.push(m);
  const stats = {};

  if (!isObj(story)) return { ok: false, errors: ['story is not an object'], warnings, stats };
  unknownKeys(story, KEYS.story, 'story', W);

  const seat = seats.find((s) => s.id === story.seat);
  if (!seat) E(`story.seat "${story.seat}" is not a seat id`);
  const meterIds = new Set(seat ? seat.meters.map((m) => m.id) : []);
  const codexById = new Map(codex.map((c) => [c.id, c]));
  const maxEra = eras.length || 5;
  const scenes = isObj(story.scenes) ? story.scenes : null;
  if (!scenes) {
    E('story.scenes must be an object of id → scene');
    return { ok: false, errors, warnings, stats };
  }
  const ids = Object.keys(scenes);
  const has = (id) => typeof id === 'string' && Object.prototype.hasOwnProperty.call(scenes, id);
  if (!has(story.start)) E(`story.start "${story.start}" is not a scene`);

  // ── Cast ──
  const cast = isObj(story.cast) ? story.cast : {};
  if (!isObj(story.cast)) E('story.cast must be an object of id → cast member');
  for (const [cid, c] of Object.entries(cast)) {
    const at = `cast "${cid}"`;
    if (!isObj(c)) { E(`${at}: must be an object`); continue; }
    unknownKeys(c, KEYS.cast, at, W);
    if (typeof c.name !== 'string' || !c.name) E(`${at}: name is required`);
    if (typeof c.role !== 'string') E(`${at}: role is required`);
    if (!HEX.test(c.color || '')) E(`${at}: color must be a #rrggbb hex`);
    if (typeof c.emblem !== 'string') E(`${at}: emblem is required`);
    else if (emblems && !emblems.includes(c.emblem)) E(`${at}: emblem "${c.emblem}" is not in the emblem library (${emblems.join(', ')})`);
  }

  // ── Conditions ──
  const checkCond = (cond, where) => {
    if (cond == null) return;
    if (!isObj(cond)) { E(`${where}: condition must be an object`); return; }
    for (const k of Object.keys(cond)) if (!COND_KEYS.includes(k)) E(`${where}: unknown condition key "${k}"`);
    for (const k of ['flags', 'notFlags', 'caught', 'missed']) {
      if (cond[k] != null && !isStrArr(cond[k])) E(`${where}: ${k} must be an array of strings`);
    }
    for (const k of ['caught', 'missed']) {
      for (const id of isStrArr(cond[k]) ? cond[k] : []) if (!codexById.has(id)) E(`${where}: ${k} "${id}" is not a codex id`);
    }
    for (const k of ['debtAtLeast', 'debtBelow']) {
      if (cond[k] != null && typeof cond[k] !== 'number') E(`${where}: ${k} must be a number`);
    }
    for (const k of ['meterAtLeast', 'meterBelow']) {
      if (cond[k] == null) continue;
      if (!isObj(cond[k])) { E(`${where}: ${k} must be an object`); continue; }
      for (const [m, v] of Object.entries(cond[k])) {
        if (!meterIds.has(m)) E(`${where}: ${k} meter "${m}" is not a meter of seat "${story.seat}"`);
        if (typeof v !== 'number') E(`${where}: ${k}.${m} must be a number`);
      }
    }
  };
  const checkTarget = (id, where) => {
    if (id == null) E(`${where}: has no next scene`);
    else if (!has(id)) E(`${where}: next "${id}" is not a scene`);
  };

  // ── Scenes ──
  for (const id of ids) {
    const sc = scenes[id];
    const at = `scene "${id}"`;
    if (!isObj(sc)) { E(`${at}: must be an object`); continue; }
    const type = sc.type || 'scene';
    if (!SCENE_TYPES.includes(type)) { E(`${at}: unknown type "${sc.type}"`); continue; }
    unknownKeys(sc, KEYS[type], at, W);

    if (type === 'scene') {
      if (!isInt(sc.era) || sc.era < 1 || sc.era > maxEra) E(`${at}: era must be 1–${maxEra}`);
      if (!MODES.includes(sc.mode)) E(`${at}: mode must be cinematic or hud`);
      if (sc.speaker != null && !Object.prototype.hasOwnProperty.call(cast, sc.speaker)) E(`${at}: speaker "${sc.speaker}" is not a cast id`);
      if (typeof sc.text !== 'string' || !sc.text.trim()) E(`${at}: text is required`);
      else if (sc.text.length > 600) W(`${at}: text is ${sc.text.length} characters (aim for 2–4 sentences)`);
      if (sc.textIf != null) {
        if (!Array.isArray(sc.textIf)) E(`${at}: textIf must be an array`);
        else sc.textIf.forEach((alt, i) => {
          if (!isObj(alt)) return E(`${at}: textIf[${i}] must be an object`);
          checkCond(alt.if, `${at} textIf[${i}]`);
          if (typeof alt.text !== 'string' || !alt.text.trim()) E(`${at}: textIf[${i}] needs text`);
        });
      }
      if (sc.art != null) {
        if (!isObj(sc.art)) E(`${at}: art must be an object`);
        else {
          const all = [...ART_KEYS.cinematic, ...ART_KEYS.hud];
          for (const k of Object.keys(sc.art)) {
            if (!all.includes(k)) W(`${at}: unknown art cue "${k}"`);
            else if (MODES.includes(sc.mode) && !ART_KEYS[sc.mode].includes(k)) W(`${at}: art cue "${k}" has no effect in ${sc.mode} mode`);
          }
          if (sc.art.orb != null && !(typeof sc.art.orb === 'number' && sc.art.orb >= 0 && sc.art.orb <= 1)) E(`${at}: art.orb must be 0–1`);
          if (sc.art.figure != null && !['back', 'none'].includes(sc.art.figure)) E(`${at}: art.figure must be 'back' or 'none'`);
          if (sc.art.log != null && !isStrArr(sc.art.log)) E(`${at}: art.log must be an array of strings`);
        }
      }
      const choices = sc.choices;
      if (choices != null && !Array.isArray(choices)) E(`${at}: choices must be an array`);
      else if (!choices || choices.length === 0) checkTarget(sc.next, `${at} (no choices)`);
      else {
        if (choices.length > 3) E(`${at}: has ${choices.length} choices (max 3)`);
        choices.forEach((ch, i) => checkChoice(ch, `${at} choice ${i + 1}`, sc));
      }
    } else if (type === 'branch') {
      if (!Array.isArray(sc.routes) || sc.routes.length === 0) E(`${at}: routes must be a non-empty array`);
      else {
        sc.routes.forEach((r, i) => {
          if (!isObj(r)) return E(`${at}: route ${i + 1} must be an object`);
          checkCond(r.if, `${at} route ${i + 1}`);
          checkTarget(r.next, `${at} route ${i + 1}`);
          if (r.if == null && i < sc.routes.length - 1) W(`${at}: route ${i + 1} has no condition, so later routes never run`);
        });
        if (sc.routes[sc.routes.length - 1]?.if != null) E(`${at}: the last route must have no "if"`);
      }
    } else if (type === 'debrief') {
      if (!isInt(sc.era) || sc.era < 1 || sc.era > maxEra) E(`${at}: era must be 1–${maxEra}`);
      const entry = codexById.get(sc.happened);
      if (!entry) E(`${at}: happened "${sc.happened}" is not a codex id`);
      else if (!entry.precedent) (strict ? E : W)(`${at}: happened "${sc.happened}" has no precedent yet (debriefs may only cite entries with a precedent)`);
      checkTarget(sc.next, at);
    }
  }

  function checkChoice(ch, at, sc) {
    if (!isObj(ch)) return E(`${at}: must be an object`);
    unknownKeys(ch, KEYS.choice, at, W);
    if (typeof ch.label !== 'string' || !ch.label.trim()) E(`${at}: label is required`);
    else if (len(ch.label) > MAX_LABEL) E(`${at}: label "${ch.label}" is ${len(ch.label)} characters (max ${MAX_LABEL})`);
    checkCond(ch.if, at);
    if (ch.effects != null) {
      const fx = ch.effects;
      if (!isObj(fx)) E(`${at}: effects must be an object`);
      else {
        unknownKeys(fx, KEYS.effects, `${at} effects`, W);
        if (fx.score != null && typeof fx.score !== 'number') E(`${at}: effects.score must be a number`);
        if (fx.debt != null && typeof fx.debt !== 'number') E(`${at}: effects.debt must be a number`);
        if (fx.meters != null) {
          if (!isObj(fx.meters)) E(`${at}: effects.meters must be an object`);
          else for (const [m, v] of Object.entries(fx.meters)) {
            if (!meterIds.has(m)) E(`${at}: meter "${m}" is not a meter of seat "${story.seat}"`);
            if (typeof v !== 'number') E(`${at}: effects.meters.${m} must be a number`);
          }
        }
        for (const k of ['set', 'clear']) if (fx[k] != null && !isStrArr(fx[k])) E(`${at}: effects.${k} must be an array of strings`);
      }
    }
    if (ch.dangers != null) {
      if (!Array.isArray(ch.dangers)) E(`${at}: dangers must be an array`);
      else ch.dangers.forEach((d, j) => {
        const dat = `${at} danger ${j + 1}`;
        if (!isObj(d)) return E(`${dat}: must be an object`);
        unknownKeys(d, KEYS.danger, dat, W);
        if (!codexById.has(d.id)) E(`${dat}: "${d.id}" is not a codex id`);
        if (!OUTCOMES.includes(d.outcome)) E(`${dat}: outcome must be one of ${OUTCOMES.join(', ')}`);
        if (d.returnsIn != null) {
          if (!isInt(d.returnsIn) || d.returnsIn < 1 || d.returnsIn > maxEra) E(`${dat}: returnsIn must be an era 1–${maxEra}`);
          else if (isInt(sc.era) && d.returnsIn <= sc.era) E(`${dat}: returnsIn ${d.returnsIn} is not after era ${sc.era}`);
          if (d.outcome !== 'missed') W(`${dat}: returnsIn only makes sense for a missed danger`);
        }
        for (const k of ['points', 'debt']) if (d[k] != null && typeof d[k] !== 'number') E(`${dat}: ${k} must be a number`);
      });
    }
    if (ch.note != null) {
      if (typeof ch.note === 'string') { if (!codexById.has(ch.note)) E(`${at}: note "${ch.note}" is not a codex id`); }
      else if (!isObj(ch.note) || typeof ch.note.title !== 'string' || typeof ch.note.text !== 'string') E(`${at}: note must be a codex id or { title, text }`);
    }
    if (ch.reply != null && typeof ch.reply !== 'string') E(`${at}: reply must be a string`);
    checkTarget(ch.next ?? sc.next, at);
  }

  // ── Endings ──
  const endings = story.endings;
  if (!Array.isArray(endings) || endings.length === 0) E('story.endings must be a non-empty array');
  else {
    const seen = new Set();
    endings.forEach((en, i) => {
      const at = `ending "${en?.id ?? i}"`;
      if (!isObj(en)) return E(`${at}: must be an object`);
      unknownKeys(en, KEYS.endingEntry, at, W);
      if (typeof en.id !== 'string' || !en.id) E(`${at}: id is required`);
      else if (seen.has(en.id)) E(`${at}: duplicate ending id`);
      seen.add(en.id);
      if (typeof en.title !== 'string' || !en.title) E(`${at}: title is required`);
      if (!TONES.includes(en.tone)) E(`${at}: tone must be good, mixed or bad`);
      if (typeof en.text !== 'string' || !en.text.trim()) E(`${at}: text is required`);
      checkCond(en.if, at);
      if (en.meterZero != null && !meterIds.has(en.meterZero)) E(`${at}: meterZero "${en.meterZero}" is not a meter of seat "${story.seat}"`);
    });
    const last = endings[endings.length - 1];
    if (isObj(last) && last.if != null) E(`ending "${last.id}": the last ending is the fallback and must have no "if"`);
    if (isObj(last) && last.meterZero != null) E(`ending "${last.id}": the last ending is the fallback and must not use meterZero`);
  }
  if (!ids.some((id) => isObj(scenes[id]) && scenes[id].type === 'ending')) E('story has no scene of type "ending"');

  // ── Structural reachability (ignores conditions) ──
  const edges = (sc) => {
    const type = sc.type || 'scene';
    if (type === 'branch') return (sc.routes || []).map((r) => r?.next);
    if (type === 'debrief') return [sc.next];
    if (type === 'ending') return [];
    const cs = Array.isArray(sc.choices) ? sc.choices : [];
    return cs.length ? cs.map((c) => c?.next ?? sc.next) : [sc.next];
  };
  const reach = new Set();
  if (has(story.start)) {
    const stack = [story.start];
    while (stack.length) {
      const id = stack.pop();
      if (reach.has(id) || !has(id) || !isObj(scenes[id])) continue;
      reach.add(id);
      for (const n of edges(scenes[id])) if (has(n)) stack.push(n);
    }
  }
  for (const id of ids) if (!reach.has(id)) E(`scene "${id}" is not reachable from start`);

  // ── State search (only on a structurally sound story) ──
  if (errors.length === 0 && seat) {
    const s = searchStory(story, { seat, codex, maxStates });
    stats.states = s.states;
    stats.truncated = s.truncated;
    stats.endingsReached = [...s.endings];
    stats.scenesVisited = s.visited.size;
    s.problems.forEach(E);
    s.warnings.forEach(W);
    const miss = (m) => (s.truncated ? W : E)(m + (s.truncated ? ' (search truncated)' : ''));
    for (const id of ids) if (!s.visited.has(id)) miss(`scene "${id}" is never reached in play (its conditions never hold)`);
    for (const en of endings) if (!s.endings.has(en.id)) miss(`ending "${en.id}" is never reached in play`);
    if (s.truncated) W(`state search stopped after ${maxStates} states`);
  }

  stats.scenes = ids.length;
  return { ok: errors.length === 0, errors, warnings, stats };
}

/**
 * Plays every available choice from `start`, merging states that no Cond in the
 * story can tell apart (only flags, meters and debt that some Cond reads, plus
 * the last debrief era, are kept in the state key).
 */
export function searchStory(story, { seat, codex = [], maxStates = 200000 }) {
  const relFlags = new Set();
  const relMeters = new Set();
  let usesDebt = false;
  const readCond = (c) => {
    condFlags(c).forEach((f) => relFlags.add(f));
    condMeters(c).forEach((m) => relMeters.add(m));
    if (condUsesDebt(c)) usesDebt = true;
  };
  for (const sc of Object.values(story.scenes)) {
    for (const ch of sc.choices || []) readCond(ch.if);
    for (const r of sc.routes || []) readCond(r.if);
  }
  for (const en of story.endings || []) {
    readCond(en.if);
    if (en.meterZero) relMeters.add(en.meterZero);
  }
  const flagList = [...relFlags];
  const meterList = [...relMeters];
  const keyOf = (target, run, lastDebrief) =>
    `${target}|${lastDebrief}|${flagList.filter((f) => run.flags[f]).join(',')}|${meterList.map((m) => run.meters[m]).join(',')}|${usesDebt ? run.debt : ''}`;
  const lean = (run) => ({ ...run, log: [], path: [], discovered: [] });

  const visited = new Set();
  const endings = new Set();
  const problems = [];
  const warnings = [];
  const once = new Set();
  const report = (list, m) => { if (!once.has(m)) { once.add(m); list.push(m); } };
  const seen = new Set();
  const queue = [{ target: story.start, run: lean(createRun({ seat, story })), lastDebrief: 0, prevEra: null }];
  let head = 0;
  let states = 0;
  let truncated = false;

  while (head < queue.length) {
    const item = queue[head++];
    const key = keyOf(item.target, item.run, item.lastDebrief);
    if (seen.has(key)) continue;
    seen.add(key);
    if (++states > maxStates) { truncated = true; break; }

    // Follow branches, recording each one visited.
    let id = item.target;
    let scene = null;
    let stuck = false;
    for (let hop = 0; hop < 64 && !scene && !stuck; hop++) {
      const sc = story.scenes[id];
      visited.add(id);
      if (sceneType(sc) !== 'branch') { scene = sc; break; }
      const route = sc.routes.find((r) => evalCond(r.if, item.run));
      if (!route) { report(problems, `branch "${id}": no route matches in some reachable state`); stuck = true; break; }
      id = route.next;
    }
    if (!scene) { if (!stuck) report(problems, `branch loop through "${id}"`); continue; }
    const type = sceneType(scene);

    if (type === 'ending') {
      const en = selectEnding(story, item.run);
      if (en) endings.add(en.id);
      continue;
    }
    if (type === 'debrief') {
      if (scene.era <= item.lastDebrief) report(problems, `debrief "${id}" (era ${scene.era}) can follow the era ${item.lastDebrief} debrief; debriefs must run in era order`);
      if (item.prevEra != null && item.prevEra !== scene.era) report(warnings, `debrief "${id}" (era ${scene.era}) follows an era ${item.prevEra} scene`);
      queue.push({ target: scene.next, run: item.run, lastDebrief: scene.era, prevEra: scene.era });
      continue;
    }

    if (scene.era <= item.lastDebrief) report(problems, `scene "${id}" (era ${scene.era}) can be played after the era ${item.lastDebrief} debrief`);
    const run = { ...item.run, scene: id };
    if (!scene.choices || scene.choices.length === 0) {
      queue.push({ target: scene.next, run, lastDebrief: item.lastDebrief, prevEra: scene.era });
      continue;
    }
    const avail = availableChoices(scene, run);
    if (avail.length === 0) { report(problems, `scene "${id}" can be reached with none of its choices available`); continue; }
    for (const { index } of avail) {
      const { run: after, result } = applyChoice(run, story, index, { codex });
      if (result.ending) { endings.add(result.ending.id); continue; }
      queue.push({ target: result.next, run: lean(after), lastDebrief: item.lastDebrief, prevEra: scene.era });
    }
  }
  return { visited, endings, problems, warnings, truncated, states };
}

/**
 * Validates ERAS, SEATS and CODEX.
 * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
 */
export function validateData({ eras = [], seats = [], codex = [], emblems = null } = {}) {
  const errors = [];
  const warnings = [];
  const E = (m) => errors.push(m);

  eras.forEach((e, i) => {
    const at = `era ${i + 1}`;
    if (e.n !== i + 1) E(`${at}: n must be ${i + 1}`);
    if (typeof e.name !== 'string' || !e.name) E(`${at}: name is required`);
    if (typeof e.year !== 'string' || !e.year) E(`${at}: year is required`);
    if (!isObj(e.palette) || !HEX.test(e.palette.a || '') || !HEX.test(e.palette.b || '')) E(`${at}: palette needs hex colours a and b`);
  });

  const seatIds = new Set();
  seats.forEach((s, i) => {
    const at = `seat "${s.id ?? i}"`;
    if (typeof s.id !== 'string' || !s.id) E(`${at}: id is required`);
    else if (seatIds.has(s.id)) E(`${at}: duplicate id`);
    seatIds.add(s.id);
    if (typeof s.name !== 'string' || !s.name) E(`${at}: name is required`);
    if (!KINDS.includes(s.kind)) E(`${at}: kind must be hero, villain or everyday`);
    if (!HEX.test(s.color || '')) E(`${at}: color must be a hex colour`);
    if (typeof s.emblem !== 'string') E(`${at}: emblem is required`);
    else if (emblems && !emblems.includes(s.emblem)) E(`${at}: emblem "${s.emblem}" is not in the emblem library`);
    if (typeof s.tagline !== 'string' || !s.tagline) E(`${at}: tagline is required`);
    if (!Array.isArray(s.meters) || s.meters.length !== 3) E(`${at}: needs exactly 3 meters`);
    else {
      const mids = new Set();
      s.meters.forEach((m) => {
        if (typeof m.id !== 'string' || !m.id) E(`${at}: meter id is required`);
        else if (mids.has(m.id)) E(`${at}: duplicate meter "${m.id}"`);
        mids.add(m.id);
        if (typeof m.label !== 'string' || !m.label) E(`${at}: meter "${m.id}" needs a label`);
        if (typeof m.start !== 'number' || m.start <= 0 || m.start > 100) E(`${at}: meter "${m.id}" start must be 1–100`);
      });
    }
    if (s.story !== null && (typeof s.story !== 'string' || !s.story)) E(`${at}: story must be a story name or null`);
  });

  const codexIds = new Set();
  codex.forEach((c, i) => {
    const at = `codex "${c.id ?? i}"`;
    if (typeof c.id !== 'string' || !KEBAB.test(c.id)) E(`${at}: id must be kebab-case`);
    else if (codexIds.has(c.id)) E(`${at}: duplicate id`);
    codexIds.add(c.id);
    if (typeof c.name !== 'string' || !c.name) E(`${at}: name is required`);
    if (!GROUPS.includes(c.group)) E(`${at}: group must be one of ${GROUPS.join(', ')}`);
    if (typeof c.short !== 'string' || !c.short) E(`${at}: short is required`);
    if (typeof c.why !== 'string' || !c.why) E(`${at}: why is required`);
    if (!isStrArr(c.seats) || c.seats.length === 0) E(`${at}: seats must list at least one seat`);
    else for (const s of c.seats) if (seats.length && !seatIds.has(s)) E(`${at}: seat "${s}" is not a seat id`);
    if (typeof c.speculative !== 'boolean') E(`${at}: speculative must be true or false`);
    if (c.precedent != null) {
      const p = c.precedent;
      if (!isObj(p) || typeof p.year !== 'string' || typeof p.text !== 'string' || typeof p.source !== 'string' || !/^https:\/\//.test(p.url || '')) {
        E(`${at}: precedent must be null or { year, text, source, url (https) }`);
      }
      if (c.speculative) warnings.push(`${at}: is speculative but has a precedent`);
    }
    for (const k of ['points', 'debt']) if (c[k] != null && typeof c[k] !== 'number') E(`${at}: ${k} must be a number`);
  });

  return { ok: errors.length === 0, errors, warnings };
}
