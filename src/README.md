# src: engine, renderer and UI

Plain ES modules, no build step, no dependencies. `index.html` loads `src/main.js`; the only external request is Google Fonts.

## Run it

```sh
py -m http.server 8765        # from the project root (ES modules don't load over file://)
# open http://localhost:8765/
node --test                   # engine, story and data tests (well under a second)
```

## Layout

```
index.html               page shell, meta/OG tags, loads src/ui/styles.css and src/main.js
src/
  main.js                wiring: params, clock, storage, stage, audio, app; one rAF loop (paused while hidden)
  content.js             re-exports ERAS/SEATS/CODEX; loadStory() with the demo fallback
  game.js                glue between the engine and the screens (owns the current run)
  audio.js               procedural WebAudio: era drone, click, confirm, alarm sting, reveal, ending chord
  share.js               1080×1350 result card PNG, Web Share with files / download, copy link
  storage.js             localStorage (try/catch everywhere): codex, best score + endings per seat, mute
  params.js              debug URL parameters (below)
  clock.js               animation clock (pauses when hidden, can be frozen)
  debug.js               plausible fake run state for ?screen=debrief|ending|card
  engine/                PURE logic, no DOM, importable from Node
    cond.js              Cond evaluation
    scoring.js           outcome defaults and overrides
    run.js               run state, effects, dangers, choices, branches, endings, meterZero
    summary.js           result-card summary, teaser seat
    validate.js          validateStory(), searchStory(), validateData()
    index.js             re-exports
  render/                canvas art (ported from design/look-samples-source.html)
    util.js              colours, glow, rounded rects, glass, grain
    cinematic.js         orb + flare + era glyphs, dust, back-lit silhouette, vignette; title/cinematic/ending/backdrop views
    hud.js               particle sphere, rings, ticks, radar; feature map, wave, debrief gauge
    emblems.js           animated emblem library (8 seats + supporting cast)
    emblem-names.js      the emblem names (pure, used by the validator)
    logo.js              MISALIGNED with the dropped, colour-split G
    stage.js             the full-screen canvas: views, crossfades, era palette, alarm push-in, debt glitches, grain
  ui/                    DOM screens over the canvas
    app.js               router, overlays, corner controls, keyboard, layout, debug boot
    title.js select.js play.js era.js debrief.js ending.js card.js codex.js settings.js
    canvases.js          ticker for small DOM canvases (emblems, logo, feature map, gauge)
    typewriter.js dom.js styles.css
tests/                   node --test
```

**Layouts.** `html.layout-wide` (desktop / landscape: full-screen art, glass panels over it) or `html.layout-tall` (portrait: in the play screen the canvas moves into a 16:9 slot above the dialogue; other screens scroll over a fixed backdrop). Wide means at least 760 px wide and an aspect ratio of at least 1.1.

**Art frame.** Views draw in units: the frame is 640 wide in landscape (360 tall at 16:9) and 360 wide in portrait, so compositions match the approved samples at 16:9 and adapt elsewhere. Device pixel ratio is capped at 2.

## Engine notes (decisions inside the contract)

- **Scoring overrides.** A codex entry's `points` replaces the reward for `caught`/`exploited`; its `debt` replaces the debt for `missed`; the `over` penalty is not affected. A danger object's own `points`/`debt` override everything for that instance.
- **Auto-flags.** The engine sets `<outcome>:<id>` for every outcome, so `exploited:` and `blocked:` exist too (the contract lists caught/missed/over).
- **meterZero.** After each choice, if a meter is at 0 and an ending has `meterZero` for it, the run ends there (after the reply, if any). Without such an ending play continues. In the normal ending check, `meterZero` endings only match while their meter is at 0.
- **Score in the HUD** is the score banked before the current era; the era's points are revealed at its debrief (failures hide). Meters move immediately.
- **Discovery.** Dangers met, codex field notes and each debrief's `happened` entry are marked discovered.
- **Debriefs citing a null precedent** show the codex entry itself (short, why, "precedent being verified" or "speculative"). The validator warns about this; `validateStory(story, { …, strict: true })` makes it an error for shipping.

## Validator

```js
import { validateStory } from './src/engine/validate.js';
import { SEATS } from './content/seats.js';
import { CODEX } from './content/codex.js';
import { ERAS } from './content/eras.js';
import { EMBLEM_NAMES } from './src/render/emblem-names.js';
import story from './content/stories/researcher.js';

const { ok, errors, warnings, stats } = validateStory(story, { seats: SEATS, codex: CODEX, eras: ERAS, emblems: EMBLEM_NAMES });
```

It checks the contract structurally, then plays every available choice from `start` (merging states no Cond can tell apart) to prove every scene and ending is reachable, debriefs run in era order and no state soft-locks. `tests/stories.test.js` runs it on every file in `content/stories/`.

## Debug URL parameters

Any of `seat`, `story`, `scene`, `screen`, `t`, `reveal` or `auto` turns off saving progress (and the mute setting) for that page load.

| Param | Effect |
|---|---|
| `seat=<id>` | start a run for that seat (default story for the seat) |
| `story=<name>` | load `content/stories/<name>.js` (e.g. `story=demo`) |
| `scene=<id>` | jump straight to a scene (branches are followed) |
| `debt=<n>`, `flags=a,b` | preset risk debt / flags for the jump |
| `pick=<n>` | auto-choose visible choice n on the first scene (shows reply + field note) |
| `auto=<digits>` | auto-play the whole run, cycling through the digits as choice numbers (`auto=1`, `auto=231`); clicks Continue through debriefs and the ending to the card |
| `screen=title\|select\|codex\|settings` | open that screen |
| `screen=debrief\|ending\|card` | that screen with a fake run (`era=<n>` for the debrief, `ending=<id>`) |
| `screen=era&era=<n>` | the era transition card |
| `era=<n>` | on a play scene: preview the art and palette of era n |
| `entry=<codex-id>` | with `screen=codex`: open that entry (needs `reveal` or a discovered entry) |
| `reveal` | treat every codex entry as discovered (not saved) |
| `t=<seconds>` | freeze animation time, finish the typewriter, skip era cards, show alarms at their peak |
| `mute=1` | start muted |
| `motion=reduced\|full` | force reduced / full motion |
| `layout=wide\|tall` | force a layout |

Examples (headless screenshots):

```
/?screen=title&t=3
/?seat=researcher&scene=e1-open&t=3
/?seat=researcher&scene=e1-inspect&t=3          (hud + anomaly)
/?seat=researcher&scene=e1-ask&t=3              (alarm: the AI looks back)
/?seat=researcher&scene=e1-patch&t=3&pick=2     (reply + field note)
/?screen=debrief&era=1&debt=38&t=6
/?screen=card&t=6
/?screen=codex&reveal&entry=eval-awareness&t=3
```

Headless Edge needs a window of at least ~500 px wide; for a true 390 px phone viewport, load the page inside a 390×844 iframe.
