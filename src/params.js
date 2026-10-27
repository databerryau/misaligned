// URL parameters for debugging and headless screenshots (see src/README.md).

const SCREENS = ['title', 'select', 'debrief', 'ending', 'card', 'codex', 'settings', 'era', 'howto'];

export function parseParams(search = '') {
  const p = new URLSearchParams(search);
  const str = (k) => (p.has(k) && p.get(k) !== '' ? p.get(k) : null);
  const num = (k) => {
    const v = str(k);
    return v != null && Number.isFinite(Number(v)) ? Number(v) : null;
  };
  const screen = str('screen');
  return {
    seat: str('seat'),
    scene: str('scene'),
    screen: SCREENS.includes(screen) ? screen : null,
    story: str('story'),
    t: num('t'),
    era: num('era'),
    ending: str('ending'),
    debt: num('debt'),
    flags: (str('flags') || '').split(',').map((s) => s.trim()).filter(Boolean),
    pick: num('pick'),
    reveal: p.has('reveal'),
    mute: p.get('mute') === '1',
    motion: str('motion'),
    layout: ['wide', 'tall'].includes(str('layout')) ? str('layout') : null,
    auto: /^[1-3]+$/.test(str('auto') || '') ? str('auto') : null,
    entry: str('entry'),
  };
}

/** For ?auto=<digits>: which visible choice (1-based) to take on the n-th decision. */
export function autoPick(params, n) {
  const s = params.auto;
  return s ? Number(s[n % s.length]) : null;
}

/** True when any parameter asks for a debug jump (progress is then not saved). */
export function isDebug(params) {
  return !!(params.seat || params.scene || params.screen || params.story || params.t != null || params.reveal || params.auto);
}
