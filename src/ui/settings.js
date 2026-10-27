// Settings (sound, progress reset) and the small corner menu.

import { h, icon } from './dom.js';

export function settingsOverlay(app, _props, close) {
  const { audio, store } = app;
  const sw = h('button', { class: 'switch', type: 'button', role: 'switch' }, h('i'));
  const sync = () => sw.setAttribute('aria-checked', String(!audio.muted));
  sw.addEventListener('click', () => { app.toggleMute(); sync(); });
  sync();

  const reset = h('button', { class: 'btn small danger', type: 'button' }, 'Reset progress');
  reset.addEventListener('click', () => {
    if (window.confirm('Forget your codex, best scores and endings on this device?')) {
      store.reset();
      app.notify('Progress reset');
      close();
      if (app.screenName === 'title' || app.screenName === 'select') app.show(app.screenName);
    }
  });

  const motion = app.reduced ? 'Reduced (following your system setting)' : 'Full';
  const el = h('div', { class: 'overlay modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Settings' },
    h('div', { class: 'scrim', onClick: close }),
    h('div', { class: 'modal-card glass' },
      h('header', { class: 'modal-head' }, h('h2', {}, 'Settings'),
        h('button', { class: 'icon-btn glass', type: 'button', 'aria-label': 'Close settings', onClick: close }, icon('close'))),
      h('label', { class: 'set-row' }, h('span', {}, h('b', {}, 'Sound'), h('small', {}, 'Ambient drone and interface sounds, all generated live.')), sw),
      h('div', { class: 'set-row' }, h('span', {}, h('b', {}, 'Motion'), h('small', { text: motion }))),
      h('div', { class: 'set-row' }, h('span', {}, h('b', {}, 'Progress'), h('small', {}, 'Your codex, best scores and endings are saved in this browser only.')), reset),
      h('p', { class: 'about' }, 'MISALIGNED is a game about the alignment and control problems on the road from today’s AI to superintelligence. Fiction in play; real precedents on the cards.')));

  return { el, focus: () => sw.focus({ preventScroll: true }) };
}

export function menuOverlay(app, _props, close) {
  const item = (ic, label, fn) => h('button', { class: 'menu-item', type: 'button', onClick: () => { app.audio.click(); close(); fn(); } }, icon(ic), h('span', { text: label }));
  const inRun = ['play', 'debrief'].includes(app.screenName);
  const leave = (fn) => () => {
    if (inRun && !app.frozen && !window.confirm('Leave this run? Its progress will be lost.')) return;
    fn();
  };
  const items = [
    item('codex', 'Danger Codex', () => app.openOverlay('codex')),
    item('settings', 'Settings', () => app.openOverlay('settings')),
    app.screenName !== 'select' ? item('seats', inRun ? 'Leave run · choose a seat' : 'Choose a seat', leave(() => { app.game = null; app.show('select'); })) : null,
    app.screenName !== 'title' ? item('back', inRun ? 'Leave run · title' : 'Title screen', leave(() => app.quit())) : null,
  ];
  const panel = h('nav', { class: 'menu glass', 'aria-label': 'Menu' }, items);
  const el = h('div', { class: 'overlay menu-overlay' }, h('div', { class: 'scrim clear', onClick: close }), panel);
  return { el, focus: () => { const b = panel.querySelector('button'); if (b) b.focus({ preventScroll: true }); } };
}
