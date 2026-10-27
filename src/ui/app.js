// The app shell: screen router, overlays (codex, settings, menu), the corner
// controls, keyboard routing, layout detection and the debug boot routes.

import { h, ICONS } from './dom.js';
import { titleScreen } from './title.js';
import { selectScreen } from './select.js';
import { playScreen } from './play.js';
import { debriefScreen } from './debrief.js';
import { endingScreen } from './ending.js';
import { cardScreen } from './card.js';
import { codexOverlay } from './codex.js';
import { settingsOverlay, menuOverlay } from './settings.js';
import { showEraCard } from './era.js';
import { Game } from '../game.js';
import { loadStory } from '../content.js';
import { fakeRun } from '../debug.js';
import { isDebug } from '../params.js';

const SCREENS = { title: titleScreen, select: selectScreen, play: playScreen, debrief: debriefScreen, ending: endingScreen, card: cardScreen };
const OVERLAYS = { codex: codexOverlay, settings: settingsOverlay, menu: menuOverlay };

export class App {
  constructor({ ui, overlayRoot, stage, audio, store, clock, params, content, reduced }) {
    Object.assign(this, { ui, overlayRoot, stage, audio, store, clock, params, content, reduced });
    this.screen = null;
    this.screenName = null;
    this.overlays = [];
    this.game = null;
    this.debug = isDebug(params);
    this.layout = null;
    this.updateLayout();
    window.addEventListener('resize', () => this.updateLayout());
    window.addEventListener('keydown', (e) => this.onKey(e));
    this.buildCorner();
  }

  get frozen() { return this.clock.frozen; }

  era(n) {
    const eras = this.content.ERAS;
    return eras[Math.max(0, Math.min(eras.length - 1, (n || 1) - 1))];
  }

  seat(id) { return this.content.SEATS.find((s) => s.id === id) || null; }

  updateLayout() {
    const w = window.innerWidth, hgt = window.innerHeight;
    const layout = this.params.layout || (w >= 760 && w / hgt >= 1.1 ? 'wide' : 'tall');
    if (layout === this.layout) return;
    this.layout = layout;
    const root = document.documentElement;
    root.classList.toggle('layout-wide', layout === 'wide');
    root.classList.toggle('layout-tall', layout === 'tall');
    this.stage.setLayout(layout);
    if (this.screen && this.screen.onLayout) this.screen.onLayout(layout);
  }

  /** Called every animation frame. */
  tick(t) {
    if (this.screen && this.screen.tick) this.screen.tick(t);
  }

  show(name, props = {}) {
    this.closeOverlays();
    if (this.screen && this.screen.unmount) this.screen.unmount();
    this.ui.textContent = '';
    const screen = SCREENS[name](this, props);
    this.screen = screen;
    this.screenName = name;
    this.ui.append(screen.el);
    this.ui.scrollTop = 0;
    this.corner.dataset.screen = name;
    return screen;
  }

  openOverlay(name, props = {}) {
    const existing = this.overlays.find((o) => o.name === name);
    if (existing) return existing;
    const close = () => this.closeOverlay(ov);
    const ov = OVERLAYS[name](this, props, close);
    ov.name = name;
    ov.returnFocus = document.activeElement;
    this.overlays.push(ov);
    this.overlayRoot.append(ov.el);
    if (ov.focus) requestAnimationFrame(() => ov.focus());
    return ov;
  }

  closeOverlay(ov) {
    const i = this.overlays.indexOf(ov);
    if (i < 0) return;
    this.overlays.splice(i, 1);
    if (ov.unmount) ov.unmount();
    ov.el.remove();
    if (ov.returnFocus && ov.returnFocus.isConnected) ov.returnFocus.focus({ preventScroll: true });
  }

  closeOverlays() { [...this.overlays].forEach((o) => this.closeOverlay(o)); }

  onKey(e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const top = this.overlays[this.overlays.length - 1];
    if (top) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (!(top.onEscape && top.onEscape())) this.closeOverlay(top);
      } else if (top.onKey) top.onKey(e);
      return;
    }
    if (e.key === 'Escape' && this.screenName !== 'title') { e.preventDefault(); this.openOverlay('menu'); return; }
    if (this.screen && this.screen.onKey) this.screen.onKey(e);
  }

  buildCorner() {
    const sound = h('button', { class: 'icon-btn glass', type: 'button', onClick: () => this.toggleMute() });
    const menu = h('button', { class: 'icon-btn glass', type: 'button', 'aria-label': 'Menu', title: 'Menu', html: ICONS.menu, onClick: () => { this.audio.click(); this.openOverlay('menu'); } });
    this.soundBtn = sound;
    this.corner = h('div', { class: 'corner' }, sound, menu);
    this.overlayRoot.before(this.corner);
    this.syncSound();
  }

  syncSound() {
    const m = this.audio.muted;
    this.soundBtn.innerHTML = m ? ICONS.muted : ICONS.sound;
    this.soundBtn.setAttribute('aria-label', m ? 'Sound off' : 'Sound on');
    this.soundBtn.setAttribute('aria-pressed', String(!m));
    this.soundBtn.title = m ? 'Sound off' : 'Sound on';
  }

  toggleMute(force) {
    const m = typeof force === 'boolean' ? force : !this.audio.muted;
    this.audio.unlock();
    this.audio.setMuted(m);
    if (!this.debug) this.store.setMuted(m);
    this.syncSound();
    if (!m) this.audio.click();
  }

  /** Brief status message (e.g. "Link copied"). */
  notify(text) {
    const n = h('div', { class: 'notice glass', role: 'status', text });
    document.body.append(n);
    setTimeout(() => n.classList.add('out'), 1800);
    setTimeout(() => n.remove(), 2300);
  }

  eraCard(n) { return showEraCard(this, n); }

  // ── Flows ──────────────────────────────────────────────────────────

  async startRun(seatId, { storyName = null, scene = null, debt = null, flags = [], persist = !this.debug } = {}) {
    const seat = this.seat(seatId);
    if (!seat || (!seat.story && !storyName)) return null;
    const loaded = await loadStory(storyName || seat.story);
    const game = new Game(this, { seat, story: loaded.story, storyId: loaded.id, demo: loaded.demo, persist });
    if (debt != null) game.run.debt = Math.max(0, Math.min(100, debt));
    for (const f of flags) game.run.flags[f] = true;
    this.game = game;
    game.go(scene || loaded.story.start);
    return game;
  }

  quit() {
    this.game = null;
    this.show('title');
  }

  /** Initial route, honouring debug URL parameters (see src/README.md). */
  async boot() {
    const p = this.params;
    if (p.screen === 'select') return this.show('select');
    if (p.screen === 'codex' || p.screen === 'settings') {
      this.show('title');
      this.openOverlay(p.screen, p.screen === 'codex' && p.entry ? { focus: p.entry } : {});
      return;
    }
    if (['debrief', 'ending', 'card', 'era'].includes(p.screen)) return this.bootFake(p);
    if (p.seat || p.story || p.scene) {
      return this.startRun(p.seat || 'researcher', { storyName: p.story, scene: p.scene, debt: p.debt, flags: p.flags });
    }
    this.show('title');
  }

  async bootFake(p) {
    const seat = this.seat(p.seat) || this.seat('researcher');
    const loaded = await loadStory(p.story || seat.story || 'demo');
    const story = loaded.story;
    const debriefEra = Math.max(1, Math.min(5, p.era ?? 1));
    const upTo = p.screen === 'debrief' ? debriefEra : 5;
    const run = fakeRun({ seat, story, storyId: loaded.id, codex: this.content.CODEX, upTo });
    if (p.debt != null) run.debt = p.debt;
    const game = new Game(this, { seat, story, storyId: loaded.id, demo: loaded.demo, persist: false, run });
    this.game = game;

    if (p.screen === 'era') {
      this.stage.setView('cinematic', { cues: { figure: 'none', orb: 0.5 }, cut: true });
      this.show('title').el.style.visibility = 'hidden';
      return this.eraCard(Math.max(1, Math.min(5, p.era ?? 2)));
    }
    if (p.screen === 'debrief') {
      const scene = Object.values(story.scenes).find((s) => s.type === 'debrief' && s.era === debriefEra)
        || { type: 'debrief', era: debriefEra, happened: 'spec-gaming', next: null };
      game.shownEra = debriefEra;
      return this.show('debrief', { game, scene });
    }
    const ending = story.endings.find((e) => e.id === p.ending) || story.endings.find((e) => e.tone === 'good') || story.endings[0];
    game.ending = ending;
    game.run.ending = ending.id;
    return this.show(p.screen === 'ending' ? 'ending' : 'card', { game, ending });
  }
}
