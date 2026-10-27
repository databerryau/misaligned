// The Danger Codex overlay: every entry grouped, discovered vs locked, and a
// detail view with the short definition, why it matters, the precedent (or a
// speculative / being-verified label) and the seats that can meet it.

import { h, colorVars, icon } from './dom.js';
import { emblemCanvas } from './canvases.js';

export function codexOverlay(app, { focus = null } = {}, close) {
  const { content, store, audio } = app;
  const found = store.discovered();
  if (app.game) app.game.run.discovered.forEach((id) => found.add(id));
  const total = content.CODEX.length;
  const n = content.CODEX.filter((c) => found.has(c.id)).length;
  const groupName = Object.fromEntries(content.CODEX_GROUPS.map((g) => [g.id, g.name]));

  const detailRoot = h('div', { class: 'codex-detail-root' });
  let detailOpen = false;
  let lastTrigger = null;

  const closeDetail = () => {
    detailRoot.textContent = '';
    detailOpen = false;
    if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus({ preventScroll: true });
  };

  const openDetail = (entry, trigger = null) => {
    audio.click();
    lastTrigger = trigger;
    detailRoot.textContent = '';
    const seats = entry.seats.map((id) => app.seat(id)).filter(Boolean);
    const p = entry.precedent;
    const precedent = p
      ? h('div', { class: 'happened glass' },
        h('div', { class: 'h-kicker', text: `this happened · ${p.year}` }),
        h('p', { class: 'h-text', text: p.text }),
        h('p', { class: 'h-src' }, 'Source: ', h('a', { href: p.url, target: '_blank', rel: 'noopener noreferrer', text: p.source })))
      : h('p', { class: `d-note${entry.speculative ? ' spec' : ''}`, text: entry.speculative
        ? 'Speculative: this hasn’t happened. Researchers take it seriously as a risk for future, more capable systems.'
        : 'Real-world precedent: being verified. A sourced example will appear here.' });
    const closeBtn = h('button', { class: 'icon-btn glass d-close', type: 'button', 'aria-label': 'Back to the codex', onClick: closeDetail }, icon('close'));
    const card = h('article', { class: 'codex-detail glass', role: 'dialog', 'aria-modal': 'true', 'aria-label': entry.name, tabindex: '-1' },
      closeBtn,
      h('div', { class: 'kicker', text: groupName[entry.group] || entry.group }),
      h('h2', { class: 'd-name', text: entry.name }),
      entry.speculative ? h('span', { class: 'spec-tag', text: 'speculative' }) : null,
      h('p', { class: 'd-short', text: entry.short }),
      h('div', { class: 'kicker', text: 'why it matters' }),
      h('p', { class: 'd-why', text: entry.why }),
      precedent,
      seats.length ? h('div', { class: 'd-seats' },
        h('div', { class: 'kicker', text: 'seats that meet it' }),
        h('div', { class: 'seat-chips' }, seats.map((s) => h('span', { class: 'seat-chip', style: colorVars(s.color) },
          emblemCanvas(s.emblem, s.color, { className: 'chip-emblem' }), h('span', { text: s.name }))))) : null);
    detailRoot.append(h('div', { class: 'detail-scrim', onClick: closeDetail }), card);
    detailOpen = true;
    requestAnimationFrame(() => card.focus({ preventScroll: true }));
  };

  const entryCard = (entry) => {
    if (!found.has(entry.id)) {
      return h('div', { class: 'entry locked', role: 'note', 'aria-label': `${entry.name}, undiscovered` },
        h('div', { class: 'e-name' }, icon('lock'), h('span', { text: entry.name })));
    }
    const btn = h('button', { class: 'entry glass', type: 'button' },
      h('div', { class: 'e-name' }, h('span', { text: entry.name }), entry.speculative ? h('span', { class: 'spec-tag', text: 'speculative' }) : null),
      h('div', { class: 'e-short', text: entry.short }));
    btn.addEventListener('click', () => openDetail(entry, btn));
    return btn;
  };

  const closeBtn = h('button', { class: 'icon-btn glass', type: 'button', 'aria-label': 'Close the codex', onClick: () => { audio.click(); close(); } }, icon('close'));

  const el = h('div', { class: 'overlay codex', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Danger Codex' },
    h('div', { class: 'codex-inner' },
      h('header', { class: 'codex-head' },
        h('div', { class: 'codex-title' },
          h('h1', {}, 'Danger Codex'),
          h('p', {}, 'Every danger you meet, in any seat, is recorded here.',
            n < total ? h('small', { text: 'Locked entries open when you meet them in a run.' }) : null)),
        h('div', { class: 'codex-progress' },
          h('div', { class: 'cp-num' }, h('b', { text: `${n}/${total}` }), ' discovered'),
          h('div', { class: 'cp-bar' }, h('i', { style: { width: `${(n / total) * 100}%` } }))),
        closeBtn),
      content.CODEX_GROUPS.map((g) => h('section', { class: 'codex-group' },
        h('h2', { text: g.id === 'asi' ? `${g.name} · speculative` : g.name }),
        h('div', { class: 'entries' }, content.CODEX.filter((c) => c.group === g.id).map(entryCard))))),
    detailRoot);

  if (focus) {
    const entry = content.CODEX.find((c) => c.id === focus);
    if (entry && found.has(entry.id)) requestAnimationFrame(() => openDetail(entry));
  }

  return {
    el,
    focus: () => { if (!detailOpen) closeBtn.focus({ preventScroll: true }); },
    onEscape: () => { if (detailOpen) { closeDetail(); return true; } return false; },
  };
}
