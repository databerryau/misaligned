// Balance report for a story: plays every path (memoised on the full run state)
// and prints how often each ending is reached under uniform random play, how
// many distinct decision paths lead to each ending, and a few example winning
// paths. Usage: node tools/balance.mjs [story=researcher]
import { createRun, availableChoices, applyChoice, selectEnding, sceneType } from '../src/engine/run.js';
import { evalCond } from '../src/engine/cond.js';
import { SEATS } from '../content/seats.js';
import { CODEX } from '../content/codex.js';

const name = process.argv[2] || 'researcher';
const story = (await import(`../content/stories/${name}.js`)).default;
const seat = SEATS.find((s) => s.id === story.seat);

const memo = new Map();
const keyOf = (id, run) => `${id}|${JSON.stringify(run.meters)}|${run.debt}|${Object.keys(run.flags).sort().join(',')}`;

// Returns { prob: {ending: p}, paths: {ending: n}, example: {ending: [labels]} }.
function walk(target, run) {
  let id = target;
  for (let hop = 0; hop < 64; hop++) {
    const sc = story.scenes[id];
    if (sceneType(sc) !== 'branch') break;
    id = sc.routes.find((r) => evalCond(r.if, run)).next;
  }
  const scene = story.scenes[id];
  const type = sceneType(scene);
  if (type === 'ending') {
    const en = selectEnding(story, run).id;
    return { prob: { [en]: 1 }, paths: { [en]: 1 }, example: { [en]: [] }, score: { [en]: [run.score, run.score] } };
  }
  if (type === 'debrief' || !scene.choices || !scene.choices.length) return walk(scene.next, run);
  const key = keyOf(id, run);
  if (memo.has(key)) return memo.get(key);
  const here = { ...run, scene: id, log: [], path: [], discovered: [] };
  const avail = availableChoices(scene, here);
  const out = { prob: {}, paths: {}, example: {}, score: {} };
  for (const { index, choice } of avail) {
    const { run: after, result } = applyChoice(here, story, index, { codex: CODEX });
    const sub = result.ending
      ? { prob: { [result.ending.id]: 1 }, paths: { [result.ending.id]: 1 }, example: { [result.ending.id]: [] }, score: { [result.ending.id]: [after.score, after.score] } }
      : walk(result.next, after);
    for (const [en, p] of Object.entries(sub.prob)) out.prob[en] = (out.prob[en] || 0) + p / avail.length;
    for (const [en, n] of Object.entries(sub.paths)) out.paths[en] = (out.paths[en] || 0) + n;
    for (const [en, ex] of Object.entries(sub.example)) if (!out.example[en]) out.example[en] = [`${id}: ${choice.label}`, ...ex];
    for (const [en, [lo, hi]] of Object.entries(sub.score)) {
      const cur = out.score[en];
      out.score[en] = cur ? [Math.min(cur[0], lo), Math.max(cur[1], hi)] : [lo, hi];
    }
  }
  memo.set(key, out);
  return out;
}

const t0 = Date.now();
const res = walk(story.start, createRun({ seat, story }));
const totalPaths = Object.values(res.paths).reduce((a, b) => a + b, 0);
console.log(`${name}: ${totalPaths.toLocaleString()} decision paths, ${memo.size.toLocaleString()} distinct states, ${Date.now() - t0} ms\n`);
console.log('ending'.padEnd(20), 'random play'.padStart(12), 'share of paths'.padStart(15), '  score range');
for (const [en, p] of Object.entries(res.prob).sort((a, b) => b[1] - a[1])) {
  const share = res.paths[en] / totalPaths;
  console.log(en.padEnd(20), `${(100 * p).toFixed(2)}%`.padStart(12), `${(100 * share).toFixed(2)}%`.padStart(15), `  ${res.score[en][0]}–${res.score[en][1]}`);
}
for (const en of story.endings.map((e) => e.id)) if (!res.prob[en]) console.log(en.padEnd(20), 'UNREACHABLE');
if (process.argv.includes('--examples')) {
  for (const [en, ex] of Object.entries(res.example)) console.log(`\nexample path to ${en}:\n  ` + ex.join('\n  '));
}
