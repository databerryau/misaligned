# Content format (the contract between stories and the engine)

Everything the player reads lives in `content/` as plain ES modules. The engine (`src/`) never contains story text. Change this file first when the format needs to change. Stories, the engine and the validator test all follow it.

## Files

| File | Exports |
|------|---------|
| `content/eras.js` | `ERAS`: the five eras |
| `content/seats.js` | `SEATS`: the eight playable seats |
| `content/codex.js` | `CODEX`: the Danger Codex entries |
| `content/stories/<seat>.js` | `default`: one campaign per seat |

## Eras

```js
export const ERAS = [
  { n: 1, name: 'Today', year: '2026', palette: { a: '#7fdcff', b: '#2f6bff' } },
  // 2 Agents 2027 amber, 3 Automated R&D 2028 orange-red, 4 AGI 2029–30 crimson, 5 ASI 2031+ violet/white
];
```

## Seats

```js
export const SEATS = [
  {
    id: 'researcher', name: 'Safety researcher', kind: 'hero',      // hero | villain | everyday
    color: '#7fdcff', emblem: 'lens',
    tagline: 'Find the problems before they find you.',
    meters: [ { id: 'credibility', label: 'credibility', start: 60 }, /* 3 meters, 0–100 */ ],
    story: 'researcher',                                             // content/stories/<story>.js, or null = coming soon
  },
];
```

## Codex

```js
export const CODEX = [
  {
    id: 'spec-gaming', name: 'Specification gaming', group: 'technical', // technical | control | society | asi
    short: 'One sentence: what it is.',                // also used as the default field note
    why: 'One or two sentences: why it matters.',
    seats: ['researcher', 'ai'],
    speculative: false,
    precedent: { year: '2025', text: 'What happened, one or two sentences.', source: 'Who published it', url: 'https://…' } | null,
    points: 300, debt: 12,                            // optional overrides of the scoring defaults
  },
];
```

A `debrief` may only cite an entry whose `precedent` is not null. Every precedent is fact-checked with a working URL before it ships.

## Stories

```js
export default {
  seat: 'researcher',
  start: 'e1-open',
  cast: {
    priya:    { name: 'Priya Raman', role: 'eval lead', color: '#7fdcff', emblem: 'clipboard' },
    meridian: { name: 'MERIDIAN-3',  role: 'model',     color: '#ff3d8b', emblem: 'eye', ai: true },
  },
  headlines: { 1: ['Lumen raises $12 billion…', /* … */], 2: [/* … */] }, // optional: news lines typed out on each era card (≤ 90 chars each)
  scenes: { /* id: Scene */ },
  endings: [ /* Ending, checked in order */ ],
};
```

Other optional story fields are `title` (the campaign's name) and `demo: true` (shows a "demo story" badge).

### Scene types

**`scene`** (the default when `type` is omitted) is one beat.

```js
{
  era: 1,                          // 1–5
  mode: 'cinematic',               // cinematic | hud
  art: { /* optional cues, see below */ },
  speaker: 'priya',                // a cast id, or null for narration
  text: 'Paragraphs separated by \n\n. Two to four sentences per beat.',
  textIf: [ { if: Cond, text: '…' } ], // optional: the first match replaces `text`
  choices: [ /* Choice */ ],       // at most 3 shown at once; when there are none, `next` is required and the player gets a Continue button
  next: 'scene-id',
}
```

**Choice variants.** A scene may list more than three choices as long as at most three are visible in any reachable state. The validator checks this. Use it for:
- *variants*: the same label with different effects under exclusive `if`s, e.g. an option that costs more because you missed something earlier;
- *unlocks*: an extra option that only some players have, e.g. one opened by an era 1 term.

**`branch`** is an invisible router: `{ type: 'branch', routes: [ { if: Cond, next: 'a' }, { next: 'b' } ] }`. The first match wins, and the last route has no `if`.

**`debrief`** ends an era: `{ type: 'debrief', era: 1, happened: ['sycophancy', 'spec-gaming'], next: 'e2-open' }`. `happened` is a codex id or a list of them. The screen shows:
- the dangers met this era (from the run log) with their outcomes
- the era score
- the risk debt gauge (the only place debt is revealed)
- a *This happened* card for each `happened` entry (several cards get a pager)

**`ending`** is `{ type: 'ending' }`. It shows the first entry in `endings` whose `if` holds, then the result card.

### Choice

```js
{
  label: 'Sign off. The board meets at 9.',        // ≤ 40 characters, plain language, no jargon
  if: Cond,                                         // optional: only offered when true
  effects: {
    score: 0,                                       // extra points on top of danger scoring
    meters: { credibility: -10 },                   // deltas; meters clamp to 0–100
    debt: 0,                                        // extra risk debt; debt clamps to 0–100
    set: ['flag'], clear: ['flag'],
  },
  dangers: [ { id: 'eval-awareness', outcome: 'missed', returnsIn: 3 } ],
  note: 'eval-awareness',                           // field note: a codex id (shows its `short`) or { title, text }
  reply: 'Optional one or two lines of consequence, shown before moving on.',
  next: 'scene-id',
}
```

Danger outcomes:
- `caught`: you spotted and handled it.
- `missed`: it got past you. Add `returnsIn: <era>` when a later era brings it back.
- `over`: over-caution or a false alarm.
- `exploited`: villain seats used the danger.
- `blocked`: a safeguard caught the villain.

### Cond

All present keys must hold:

```js
{ flags: ['a'], notFlags: ['b'], debtAtLeast: 40, debtBelow: 20,
  meterAtLeast: { credibility: 50 }, meterBelow: { compute: 20 },
  caught: ['danger-id'], missed: ['danger-id'],
  overAtLeast: 3 }                                  // at least this many overcautious outcomes so far
```

### Ending

```js
{ id: 'verified-mind', title: 'The Verified Mind', tone: 'good', if: Cond, text: '…' } // tone: good | mixed | bad
```

The last ending has no `if` (the fallback) and no `meterZero`. An ending with `meterZero: '<meterId>'` is where the run goes as soon as a choice brings that meter to 0. In the normal ending check it only matches while that meter is at 0.

### Art cues

- **Cinematic:**
  - `alarm: true` makes the AI "look back" on this beat (light swells, a pupil forms, the camera pushes in).
  - `orb: 0–1` sets the presence intensity, default 0.6.
  - `figure: 'back' | 'none'` controls the player's back-lit silhouette, default `'back'`.
- **HUD:**
  - `title: 'inspection · meridian-3'`
  - `stat: { label: 'behavioral evals', value: '48/48', unit: 'pass' }`
  - `feature: { id: '2291', label: 'am I being tested?' }`
  - `anomaly: true`
  - `log: ['eval 7731 · pass', …]`

## Scoring defaults (engine)

| Outcome | Points | Risk debt |
|---------|--------|-----------|
| caught | +300 | 0 |
| missed | 0 | +12 |
| over | −120 | 0 |
| exploited | +300 | 0 |
| blocked | 0 | 0 |

A codex entry's `points` and `debt` override these defaults, and so does the danger object in a choice. The engine also does three things automatically:
- sets the flags `caught:<id>`, `missed:<id>` and `over:<id>`
- logs every danger for the era debrief and the result card
- marks the entry discovered in the persistent codex (`localStorage`)
