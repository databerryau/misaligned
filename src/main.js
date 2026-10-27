// Entry point: wires content, stage, audio, storage and the app shell, then
// runs one animation loop (paused while the tab is hidden).

import * as content from './content.js';
import { parseParams } from './params.js';
import { createClock } from './clock.js';
import { createStore } from './storage.js';
import { Stage } from './render/stage.js';
import { AudioEngine } from './audio.js';
import { App } from './ui/app.js';
import { tickCanvases } from './ui/canvases.js';
import { ensureFonts } from './share.js';

const params = parseParams(location.search);
const root = document.documentElement;
const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reduced = params.motion === 'reduced' || (params.motion !== 'full' && prefersReduced);
root.classList.toggle('reduced', reduced);
if (params.t != null) root.classList.add('frozen');

const clock = createClock(params.t);
const store = createStore({ revealAll: params.reveal ? content.CODEX.map((c) => c.id) : null });
const stage = new Stage(document.getElementById('art'), { clock, reduced });
stage.setPalette(content.ERAS[0].palette, { instant: true });
const audio = new AudioEngine({ muted: params.mute || store.muted });

const app = new App({
  ui: document.getElementById('ui'),
  overlayRoot: document.getElementById('overlay'),
  stage, audio, store, clock, params, content, reduced,
});

// Audio may only start after a user gesture.
const unlock = () => audio.unlock();
window.addEventListener('pointerdown', unlock, { capture: true });
window.addEventListener('keydown', unlock, { capture: true });

let raf = 0;
function loop() {
  raf = 0;
  if (document.hidden) return;
  const t = clock.time();
  stage.frame();
  tickCanvases(t);
  app.tick(t);
  raf = requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clock.pause();
    audio.suspend();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  } else {
    clock.resume();
    audio.resume();
    if (!raf) raf = requestAnimationFrame(loop);
  }
});
raf = requestAnimationFrame(loop);

// Canvas text (logo, share card) wants the webfonts; don't wait long for them.
ensureFonts(1500)
  .then(() => app.boot())
  .catch((err) => {
    console.error(err);
    document.getElementById('ui').textContent = 'Something went wrong while starting the game. Please reload.';
  });
