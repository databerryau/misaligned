// "How this works": the game's rules in one short card. Shown before the first
// decision of a player's first run, and from the corner menu at any time.

import { h, icon } from './dom.js';

export function howtoOverlay(app, { seat = null, onClose = null } = {}, close) {
  const s = seat || (app.game && app.game.seat) || app.content.SEATS[0];
  const done = () => { close(); if (onClose) onClose(); };

  const meters = h('ul', { class: 'howto-meters' }, s.meters.map((m) => h('li', {},
    h('b', { text: m.label }),
    h('span', { text: m.desc || '' }))));

  const point = (ic, title, text) => h('li', { class: 'howto-point' },
    h('span', { class: 'howto-ic', html: icon(ic).outerHTML }),
    h('div', {}, h('b', { text: title }), h('p', { text })));

  const ok = h('button', { class: 'btn primary', type: 'button', onClick: done }, 'Got it');
  const el = h('div', { class: 'overlay modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'How this works' },
    h('div', { class: 'scrim', onClick: done }),
    h('div', { class: 'modal-card glass howto' },
      h('header', { class: 'modal-head' }, h('h2', {}, 'How this works'),
        h('button', { class: 'icon-btn glass', type: 'button', 'aria-label': 'Close', onClick: done }, icon('close'))),
      h('ul', { class: 'howto-points' },
        point('arrow', 'About a dozen decisions, five eras', 'From today’s chatbots to superintelligence. Each decision is a real kind of AI danger, in fictional form.'),
        point('caught', 'Catch a danger, score points', 'Spot the problem and deal with it well. Some plans only partly work.'),
        point('partial', 'You can’t afford everything', 'Thorough fixes cost compute and credibility; quick ones earn them back. Pick your battles: let small dangers go to stop the big ones.'),
        point('missed', 'Miss one, and it comes back', 'Missed dangers add to your hidden risk debt. You only see it at the end of each era, and it makes later crises harder.'),
        point('over', 'Overreacting costs you too', 'Not every alarm is real. Too much caution loses you trust and lets a rival race ahead.'),
        point('codex', 'Real stories behind the fiction', 'Every danger you meet goes into your Danger Codex, with what has actually happened in the real world.')),
      h('div', { class: 'howto-meter-head', text: `Your three meters as ${s.name.toLowerCase()}` }),
      meters,
      h('p', { class: 'howto-zero', text: 'If any meter falls to zero, your run ends early.' }),
      h('footer', { class: 'howto-foot' }, ok)));

  return { el, focus: () => ok.focus({ preventScroll: true }) };
}
