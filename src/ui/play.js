// The play screen: HUD bar (era, hidden risk debt, banked score, seat meters),
// the art (full-screen behind, or a 16:9 slot on a phone), HUD readouts in
// inspection scenes, field-note toasts and the frosted dialogue panel with
// the speaker's emblem, typewriter text and numbered choices.

import { h, fmt, signed, colorVars } from './dom.js';
import { emblemCanvas, liveCanvas } from './canvases.js';
import { typewriter } from './typewriter.js';
import { sceneText, availableChoices, bankedScore } from '../engine/index.js';
import { drawFeatureMap, drawWave } from '../render/hud.js';
import { autoPick } from '../params.js';

export function playScreen(app, { game, step }) {
  const { stage, audio } = app;
  const { seat, story } = game;
  const frozen = app.frozen;
  const instantText = frozen || app.reduced;
  const auto = !!app.params.auto;
  // Debug: ?era=N previews the art and palette of another era on any scene.
  const artEraOverride = app.debug && app.params.era ? Math.max(1, Math.min(5, app.params.era)) : null;

  // ── HUD bar ──────────────────────────────────────────────────────
  const eraChip = h('div', { class: 'chip glass era-chip' });
  const riskChip = h('div', { class: 'chip glass risk-chip', title: 'Missed dangers add hidden risk debt. It is revealed at each era debrief.' }, 'risk debt · hidden');
  const demoChip = game.demo
    ? h('div', { class: 'chip demo-chip', title: 'The full safety researcher campaign is still being written. This is a short demo story.' }, 'demo story')
    : null;
  const scoreVal = h('span', { class: 'score-val' });
  const meterEls = {};
  const meterList = h('ul', { class: 'meters' }, seat.meters.map((m) => {
    const fill = h('i');
    const bar = h('span', { class: 'bar', role: 'meter', 'aria-label': m.label, 'aria-valuemin': 0, 'aria-valuemax': 100 }, fill);
    const li = h('li', { class: 'meter' }, h('span', { class: 'm-label', text: m.label }), bar);
    meterEls[m.id] = { li, fill, bar };
    return li;
  }));
  const scorePanel = h('div', { class: 'score-panel glass' },
    h('div', { class: 'score' }, h('span', { class: 'lbl', text: 'score' }), scoreVal),
    meterList);
  const hudbar = h('header', { class: 'hudbar' },
    h('div', { class: 'hud-left' }, h('div', { class: 'hud-row' }, eraChip, demoChip), riskChip),
    scorePanel);

  // ── Art slot, banner, toasts, readouts ───────────────────────────
  const banner = h('div', { class: 'anomaly-banner', hidden: true }, 'anomaly detected');
  const toastSlot = h('div', { class: 'toast-slot', 'aria-live': 'polite' });
  const slot = h('div', { class: 'art-slot' }, banner, toastSlot);
  const readouts = h('aside', { class: 'readouts glass', hidden: true, 'aria-label': 'Inspection readouts' });

  // ── Dialogue ─────────────────────────────────────────────────────
  const avatarWrap = h('span', { class: 'avatar' });
  const who = h('span', { class: 'who' });
  const speakerRow = h('div', { class: 'speaker' }, avatarWrap, who);
  const chosenEl = h('div', { class: 'chosen', hidden: true });
  const textEl = h('div', { class: 'text', 'aria-hidden': 'true' });
  const srText = h('div', { class: 'sr-only', 'aria-live': 'polite' });
  const speech = h('div', { class: 'speech' }, speakerRow, chosenEl, textEl, srText);
  const actions = h('div', { class: 'actions' });
  const dialogue = h('section', { class: 'dialogue glass', 'aria-label': 'Story' }, speech, actions);
  speech.addEventListener('click', () => { if (tw && !tw.done) tw.finish(); });

  const el = h('section', { class: 'screen play', style: colorVars(seat.color, 'seat') }, hudbar, slot, readouts, dialogue);

  let tw = null;
  let phase = 'idle';
  let current = null;
  let lastSpeaker = undefined;
  let autoPicked = false;
  let toastTimer = 0;
  const timers = new Set();
  const later = (fn, ms) => {
    const id = setTimeout(() => { timers.delete(id); fn(); }, frozen ? 0 : ms);
    timers.add(id);
    return id;
  };
  const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };

  // ── Rendering ────────────────────────────────────────────────────
  function updateHud(era, deltas = {}) {
    const e = app.era(artEraOverride || era);
    eraChip.textContent = `era ${e.n} · ${e.name.toLowerCase()} · ${e.year}`;
    scoreVal.textContent = fmt(bankedScore(game.run, era));
    for (const m of seat.meters) {
      const v = game.run.meters[m.id];
      const { li, fill, bar } = meterEls[m.id];
      fill.style.width = `${v}%`;
      bar.setAttribute('aria-valuenow', v);
      li.classList.toggle('low', v <= 20);
      const d = deltas[m.id];
      if (d) {
        const tag = h('span', { class: `delta ${d > 0 ? 'up' : 'down'}`, text: signed(d) });
        li.append(tag);
        li.classList.remove('pulse');
        void li.offsetWidth;
        li.classList.add('pulse');
        later(() => tag.remove(), 2200);
      }
    }
  }

  function renderSpeaker(id) {
    const cast = id ? story.cast[id] : null;
    speakerRow.hidden = !cast;
    textEl.classList.toggle('ai', !!(cast && cast.ai));
    if (!cast || id === lastSpeaker) { lastSpeaker = id; return; }
    lastSpeaker = id;
    avatarWrap.textContent = '';
    avatarWrap.append(emblemCanvas(cast.emblem, cast.color, { className: 'avatar-emblem' }));
    Object.entries(colorVars(cast.color, 'spk')).forEach(([k, v]) => dialogue.style.setProperty(k, v));
    who.textContent = cast.role ? `${cast.name} · ${cast.role}` : cast.name;
  }

  function renderReadouts(scene) {
    const cues = scene.art || {};
    const hud = scene.mode === 'hud';
    banner.hidden = !(hud && cues.anomaly);
    readouts.classList.remove('anomaly');
    readouts.textContent = '';
    const show = hud && !!(cues.title || cues.stat || cues.feature || cues.log);
    readouts.hidden = !show;
    if (!show) return;
    if (cues.anomaly) later(() => readouts.classList.add('anomaly'), 1300);
    if (cues.title) readouts.append(h('div', { class: 'ro-title' }, h('span', { class: 'live-dot' }), h('span', { text: cues.title })));
    if (cues.stat) {
      readouts.append(h('div', { class: 'ro-stat' },
        h('div', { class: 'ro-label', text: cues.stat.label }),
        h('div', { class: 'ro-value' }, h('span', { text: cues.stat.value }), cues.stat.unit ? h('span', { class: 'ro-unit', text: cues.stat.unit }) : null)));
    }
    const fmap = liveCanvas((c, w, hh, t) => drawFeatureMap(c, w, hh, t, stage.palette(), stage.anomalyLevel(t), !!cues.feature), { className: 'ro-fmap' });
    const mapBlock = h('div', { class: 'ro-map' }, h('div', { class: 'ro-label', text: 'feature map' }), fmap);
    if (cues.feature) {
      mapBlock.append(
        h('div', { class: 'ro-fid', text: `feature ${cues.feature.id}` }),
        h('div', { class: 'ro-flabel', text: `“${cues.feature.label}”` }),
        liveCanvas((c, w, hh, t) => drawWave(c, w, hh, t), { className: 'ro-wave' }),
      );
    }
    readouts.append(mapBlock);
    if (cues.log && cues.log.length) {
      readouts.append(h('ul', { class: 'ro-log' }, cues.log.map((line, i) => h('li', { style: { '--i': i }, text: line }))));
    }
  }

  function continueButton(onClick, label = 'Continue') {
    return h('button', { class: 'btn primary continue', type: 'button', onClick }, label, h('kbd', { 'aria-hidden': 'true' }, '↵'));
  }

  function showActions(stp) {
    if (current !== stp) return;
    const scene = stp.scene;
    actions.textContent = '';
    if (!scene.choices || scene.choices.length === 0) {
      phase = 'continue';
      const cont = continueButton(() => go(scene.next));
      actions.append(cont);
      if (auto) later(() => cont.click(), 500);
      return;
    }
    phase = 'choosing';
    const avail = availableChoices(scene, game.run);
    actions.append(h('ol', { class: 'choices' }, avail.map(({ choice, index }, k) =>
      h('li', { style: { '--i': k } },
        h('button', { class: 'choice', type: 'button', onClick: () => choose(index, k) },
          h('span', { class: 'num', text: String(k + 1) }),
          h('span', { class: 'label', text: choice.label }))))));
    if (auto) {
      const n = game.autoN || 0;
      game.autoN = n + 1;
      const k = Math.min(avail.length, autoPick(app.params, n)) - 1;
      later(() => choose(avail[k].index, k), 600);
    } else if (app.params.pick != null && !autoPicked) {
      autoPicked = true;
      const k = app.params.pick - 1;
      if (avail[k]) later(() => choose(avail[k].index, k), 60);
    }
  }

  function showToast(note) {
    toastSlot.textContent = '';
    clearTimeout(toastTimer);
    const isNew = note.codexId && game.isNew(note.codexId);
    const toast = h('div', { class: 'toast glass', role: 'note' },
      h('div', { class: 'toast-title', text: `field note · ${note.title.toLowerCase()}` }),
      note.text ? h('div', { class: 'toast-text', text: note.text }) : null,
      isNew ? h('div', { class: 'toast-new', text: 'codex +1' }) : null);
    const dismiss = () => { toast.classList.add('out'); setTimeout(() => toast.remove(), 450); };
    toast.addEventListener('click', dismiss);
    toastSlot.append(toast);
    if (!frozen) toastTimer = setTimeout(dismiss, 9000);
  }

  // ── Flow ─────────────────────────────────────────────────────────
  async function showScene(stp) {
    current = stp;
    clearTimers();
    if (tw) tw.cancel();
    phase = 'enter';
    const scene = stp.scene;
    const era = scene.era;
    const cues = scene.art || {};
    el.classList.toggle('mode-hud', scene.mode === 'hud');
    el.classList.toggle('mode-cinematic', scene.mode !== 'hud');
    el.classList.remove('alarm');
    const artEra = artEraOverride || era;
    const pal = app.era(artEra).palette;
    el.style.setProperty('--era-a', pal.a);
    el.style.setProperty('--era-b', pal.b);
    stage.setEra(artEra);
    stage.setPalette(pal);
    stage.setDebt(game.run.debt);
    stage.setView(scene.mode === 'hud' ? 'hud' : 'cinematic', { cues });
    audio.setEra(artEra);
    updateHud(era);

    if (game.shownEra !== era) {
      game.shownEra = era;
      if (!frozen) {
        dialogue.classList.add('veiled');
        await app.eraCard(artEra);
        if (current !== stp) return;
        dialogue.classList.remove('veiled');
      }
    }

    renderReadouts(scene);
    renderSpeaker(scene.speaker);
    chosenEl.hidden = true;
    actions.textContent = '';
    dialogue.classList.remove('swap');
    void dialogue.offsetWidth;
    dialogue.classList.add('swap');
    const text = sceneText(scene, game.run);
    srText.textContent = text.replace(/\s*\n+\s*/g, ' ');
    phase = 'typing';
    tw = typewriter(textEl, text, { instant: instantText, onDone: () => showActions(stp) });
    if (cues.alarm && scene.mode !== 'hud') {
      later(() => { stage.alarm(); audio.alarm(); el.classList.add('alarm'); }, 900);
    }
  }

  function choose(index, k) {
    if (phase !== 'choosing') return;
    phase = 'busy';
    audio.confirm();
    const scene = current.scene;
    const buttons = [...actions.querySelectorAll('.choice')];
    buttons.forEach((b, j) => {
      b.disabled = true;
      b.classList.toggle('picked', j === k);
      b.classList.toggle('dropped', j !== k);
    });
    const result = game.choose(index);
    stage.setDebt(game.run.debt);
    updateHud(scene.era, result.meterDeltas);
    if (result.note) showToast(result.note);
    const proceed = () => (result.ending ? leave(() => game.finish(result.ending)) : go(result.next));
    if (!result.reply) { later(proceed, 750); return; }
    later(() => {
      phase = 'reply';
      buttons.forEach((b, j) => { if (j !== k) b.closest('li').remove(); });
      speakerRow.hidden = true;
      textEl.classList.remove('ai');
      chosenEl.hidden = false;
      chosenEl.textContent = scene.choices[index].label;
      srText.textContent = result.reply;
      tw = typewriter(textEl, result.reply, {
        instant: instantText,
        onDone: () => {
          phase = 'continue';
          const cont = continueButton(proceed);
          actions.append(cont);
          if (auto) later(() => cont.click(), 500);
        },
      });
    }, 480);
  }

  function leave(fn) {
    if (phase === 'leaving') return;
    phase = 'leaving';
    audio.click();
    dialogue.classList.add('leaving');
    later(() => { dialogue.classList.remove('leaving'); fn(); }, 240);
  }

  const go = (next) => leave(() => game.go(next));

  // ── Layout ───────────────────────────────────────────────────────
  const applyLayout = () => stage.attach(app.layout === 'tall' ? slot : null);
  const ro = 'ResizeObserver' in window
    ? new ResizeObserver(() => el.style.setProperty('--dlg-h', `${dialogue.offsetHeight}px`))
    : null;
  if (ro) ro.observe(dialogue);
  queueMicrotask(applyLayout);
  if (step) queueMicrotask(() => showScene(step));

  return {
    el,
    game,
    showScene,
    onLayout: applyLayout,
    onKey(e) {
      if (/^[1-9]$/.test(e.key)) {
        if (phase !== 'choosing') return;
        const b = [...actions.querySelectorAll('.choice:not([disabled])')][Number(e.key) - 1];
        if (b) { e.preventDefault(); b.click(); }
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        const a = document.activeElement;
        if (a && a.tagName === 'BUTTON' && !a.disabled) return; // the focused button handles it
        e.preventDefault();
        if (tw && !tw.done) { tw.finish(); return; }
        const cont = actions.querySelector('.continue');
        if (cont) cont.click();
      }
    },
    unmount() {
      clearTimers();
      clearTimeout(toastTimer);
      if (tw) tw.cancel();
      if (ro) ro.disconnect();
      stage.attach(null);
    },
  };
}
