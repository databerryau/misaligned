// Glue between the pure engine and the screens: owns the current run, moves
// it through scenes and routes to the right screen. Persists discoveries and
// results unless the run is a debug jump.

import { createRun, enter, applyChoice, sceneType, summarize } from './engine/index.js';

export class Game {
  /**
   * @param {App} app
   * @param {object} o  { seat, story, storyId, demo, persist, run }
   */
  constructor(app, { seat, story, storyId, demo = false, persist = true, run = null }) {
    this.app = app;
    this.seat = seat;
    this.story = story;
    this.storyId = storyId;
    this.demo = demo;
    this.persist = persist;
    this.run = run || createRun({ seat, story, storyId });
    this.knownBefore = app.store.discovered();
    this.shownEra = null;
    this.ending = null;
    this.record = null;
  }

  get codex() { return this.app.content.CODEX; }

  /** True when codex entry `id` was first found during this run. */
  isNew(id) { return !this.knownBefore.has(id); }

  sync() { if (this.persist) this.app.store.discover(this.run.discovered); }

  /** Enters scene `id` (following branches) and shows it. */
  go(id) {
    const step = enter(this.run, this.story, id);
    this.run = step.run;
    this.sync();
    const type = sceneType(step.scene);
    if (type === 'debrief') return this.app.show('debrief', { game: this, scene: step.scene });
    if (type === 'ending') return this.finish(step.ending);
    const screen = this.app.screen;
    if (screen && screen.game === this && screen.showScene) screen.showScene(step);
    else this.app.show('play', { game: this, step });
  }

  /** Applies choice `index` of the current scene; returns the engine result. */
  choose(index) {
    const { run, result } = applyChoice(this.run, this.story, index, { codex: this.codex });
    this.run = run;
    this.sync();
    return result;
  }

  finish(ending) {
    this.ending = ending;
    this.run = { ...this.run, ending: ending ? ending.id : null };
    if (this.persist && ending) this.record = this.app.store.recordResult(this.seat.id, this.run.score, ending.id);
    this.app.show('ending', { game: this, ending });
  }

  /** Codex entries discovered across all runs, including this one. */
  codexFound() {
    return new Set([...this.app.store.discovered(), ...this.run.discovered]).size;
  }

  summary() {
    const { content, store } = this.app;
    return summarize({
      run: this.run, story: this.story, seat: this.seat, seats: content.SEATS, codex: content.CODEX,
      ending: this.ending, codexFound: this.codexFound(), endingsFound: store.endings(this.seat.id),
      eras: content.ERAS.length,
    });
  }
}
