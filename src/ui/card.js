// Result card screen: the share card preview plus Share / Download / Copy
// link / Play another seat / Codex.

import { h, icon } from './dom.js';
import { renderCard, shareCard, downloadCard, copyText, shareText } from '../share.js';

export function cardScreen(app, { game, ending }) {
  const { stage, audio } = app;
  stage.setView('backdrop');
  stage.setPalette({ a: game.seat.color, b: '#2f6bff' });
  stage.setDebt(0);

  const sm = game.summary();
  let cv = null;
  const holder = h('div', { class: 'card-holder' }, h('div', { class: 'card-skeleton' }));
  renderCard(sm).then((canvas) => {
    cv = canvas;
    canvas.className = 'card-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `${shareText(sm)} Score ${sm.score}, ${sm.avoided} of ${sm.dangersTotal} dangers ${sm.avoidedLabel}, codex ${sm.codexFound} of ${sm.codexTotal}.`);
    holder.textContent = '';
    holder.append(canvas);
  });

  const busy = (btn, fn) => async () => {
    if (!cv || btn.disabled) return;
    audio.click();
    btn.disabled = true;
    try { await fn(); } finally { btn.disabled = false; }
  };

  const shareBtn = h('button', { class: 'btn primary wide', type: 'button' }, icon('share'), 'Share card');
  shareBtn.addEventListener('click', busy(shareBtn, async () => {
    const r = await shareCard(cv, sm);
    if (r === 'downloaded') app.notify('Card saved as PNG');
  }));
  const dlBtn = h('button', { class: 'btn wide', type: 'button' }, icon('download'), 'Download PNG');
  dlBtn.addEventListener('click', busy(dlBtn, () => downloadCard(cv, sm)));
  const linkBtn = h('button', { class: 'btn wide', type: 'button' }, icon('link'), 'Copy link');
  linkBtn.addEventListener('click', async () => {
    audio.click();
    app.notify((await copyText(sm.url)) ? 'Link copied' : sm.url);
  });

  const again = h('button', { class: 'btn ghost wide', type: 'button', onClick: () => { audio.click(); app.startRun(game.seat.id, { storyName: game.storyId }); } }, icon('replay'), `Replay as ${game.seat.name.toLowerCase()}`);
  const other = h('button', { class: 'btn ghost wide', type: 'button', onClick: () => { audio.click(); app.show('select'); } }, icon('seats'), 'Play another seat');
  const codex = h('button', { class: 'btn ghost wide', type: 'button', onClick: () => { audio.click(); app.openOverlay('codex'); } }, icon('codex'), 'Danger Codex');

  const el = h('section', { class: 'screen card-screen' },
    holder,
    h('div', { class: 'card-side' },
      h('div', { class: 'kicker', text: 'your result' }),
      h('h1', { text: ending ? ending.title : 'Run complete' }),
      h('p', { class: 'card-blurb', text: 'Share the card, then try another seat. Each one sees a different side of the same future.' }),
      h('div', { class: 'card-actions' }, shareBtn, dlBtn, linkBtn),
      h('div', { class: 'card-actions secondary' }, other, again, codex)),
  );

  return { el };
}
