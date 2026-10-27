// Plays a story with a few scripted player strategies and prints where each ends.
// Usage: node tools/policies.mjs [story=researcher]
import { createRun, availableChoices, applyChoice, selectEnding, sceneType } from '../src/engine/run.js';
import { evalCond } from '../src/engine/cond.js';
import { SEATS } from '../content/seats.js';
import { CODEX } from '../content/codex.js';

const name = process.argv[2] || 'researcher';
const story = (await import(`../content/stories/${name}.js`)).default;
const seat = SEATS.find((s) => s.id === story.seat);

const outcomeOf = (ch) => (ch.dangers || []).map((d) => d.outcome);
const sev = (ch) => Math.max(0, ...(ch.dangers || []).map((d) => d.debt ?? 12));
const caught = (ch) => outcomeOf(ch).length > 0 && outcomeOf(ch).every((o) => o === 'caught');
const cost = (ch) => -((ch.effects?.meters?.compute || 0) + (ch.effects?.meters?.credibility || 0));

function play(policy, term) {
  let run = createRun({ seat, story });
  let target = story.start;
  const picks = [];
  for (let step = 0; step < 200; step++) {
    let id = target;
    for (let hop = 0; hop < 64; hop++) {
      const sc = story.scenes[id];
      if (sceneType(sc) !== 'branch') break;
      id = sc.routes.find((r) => evalCond(r.if, run)).next;
    }
    const scene = story.scenes[id];
    const type = sceneType(scene);
    if (type === 'ending') return { ending: selectEnding(story, run).id, run, picks };
    if (type === 'debrief' || !scene.choices || !scene.choices.length) { target = scene.next; continue; }
    run = { ...run, scene: id };
    const avail = availableChoices(scene, run);
    const pick = id === 'e1-call' ? avail[term].choice : policy(avail.map((a) => a.choice), run, id);
    const idx = avail.find((a) => a.choice === pick).index;
    picks.push(pick.label);
    const { run: after, result } = applyChoice(run, story, idx, { codex: CODEX });
    if (result.ending) return { ending: result.ending.id, run: after, picks };
    run = after;
    target = result.next;
  }
}

const finale = (cs, run) => {
  const contain = cs.find((c) => /Contain/.test(c.label));
  const pause = cs.find((c) => /pause/.test(c.label));
  if (run.flags['see-inside'] && run.meters.compute >= 20) return contain;
  return run.meters.credibility >= 40 || run.flags['world-alerted'] ? pause : contain;
};
const POLICIES = {
  'always thorough': (cs, run, id) => (id === 'e5-finale' ? finale(cs, run) : cs.find(caught) || cs[0]),
  'always fast (CEO)': (cs, run, id) => (id === 'e5-finale' ? finale(cs, run) : [...cs].sort((a, b) => cost(a) - cost(b))[0]),
  'cheapest catch, else cheapest': (cs, run, id) => {
    if (id === 'e5-finale') return finale(cs, run);
    const c = cs.filter(caught).sort((a, b) => cost(a) - cost(b));
    return c[0] || [...cs].sort((a, b) => cost(a) - cost(b))[0];
  },
  'smart triage (pay for severe)': (cs, run, id) => {
    if (id === 'e5-finale') return finale(cs, run);
    const severe = Math.max(...cs.map(sev));
    const c = cs.filter(caught).sort((a, b) => cost(a) - cost(b));
    if (severe >= 12 && c[0] && run.meters.compute - (-(c[0].effects?.meters?.compute || 0)) >= 15 && run.meters.credibility - (-(c[0].effects?.meters?.credibility || 0)) >= 15) return c[0];
    const cheapCatch = c.find((x) => cost(x) <= 10);
    return cheapCatch || [...cs].sort((a, b) => cost(a) - cost(b))[0];
  },
};

for (const [pname, pol] of Object.entries(POLICIES)) {
  for (const term of [0, 1]) {
    const r = play(pol, term);
    console.log(`${pname.padEnd(32)} ${term ? 'publish' : 'compute'}  → ${r.ending.padEnd(18)} score ${String(r.run.score).padStart(5)}  debt ${String(r.run.debt).padStart(3)}  ${JSON.stringify(r.run.meters)}`);
  }
}

// A hand-worked "smart triage" route: let the low-severity dangers go, pay for the severe ones.
const ROUTE = {
  'e1-flatter': /^Ship now/, 'e1-coder': /^Lock the tests/, 'e2-keys': /^Publish it/,
  'e2-score': /^(Look inside|Publish the trend)/, 'e3-research': /^Trust them/, 'e3-faking': /^Pause it/,
  'e3-spread': /^Screen every/, 'e4-aware': /^It’s being honest/, 'e4-spike': /^These spike/,
  'e4-copy': /^(Trace why|Alert every)/, 'e4-leverage': /^Tell the board/, 'e5-successor': /^Only at human speed/,
};
const routed = (cs, run, id) => (id === 'e5-finale' ? finale(cs, run) : (ROUTE[id] && cs.find((c) => ROUTE[id].test(c.label))) || cs[0]);
for (const term of [0, 1]) {
  const r = play(routed, term);
  console.log(`${'hand-worked triage route'.padEnd(32)} ${term ? 'publish' : 'compute'}  → ${r.ending.padEnd(18)} score ${String(r.run.score).padStart(5)}  debt ${String(r.run.debt).padStart(3)}  ${JSON.stringify(r.run.meters)}`);
}
