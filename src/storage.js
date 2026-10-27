// Persistent progress in localStorage. Every access is wrapped in try/catch:
// private windows and blocked storage simply fall back to memory.

const KEY = 'misaligned.v1';
const blank = () => ({ discovered: [], best: {}, endings: {}, muted: false });

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const data = JSON.parse(raw);
    return {
      discovered: Array.isArray(data.discovered) ? data.discovered.filter((x) => typeof x === 'string') : [],
      best: data.best && typeof data.best === 'object' ? data.best : {},
      endings: data.endings && typeof data.endings === 'object' ? data.endings : {},
      muted: !!data.muted,
    };
  } catch {
    return blank();
  }
}

/**
 * @param {object} [o]
 * @param {string[]|null} [o.revealAll] debug: treat these codex ids as discovered (not saved)
 */
export function createStore({ revealAll = null } = {}) {
  let data = read();
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage unavailable */ }
  };

  return {
    get muted() { return data.muted; },
    setMuted(m) { data.muted = !!m; save(); },

    /** Set of discovered codex ids. */
    discovered() { return new Set(revealAll || data.discovered); },

    /** Marks ids discovered; returns the ones that are new. */
    discover(ids) {
      const known = new Set(data.discovered);
      const fresh = (ids || []).filter((id) => id && !known.has(id));
      if (fresh.length) { data.discovered = [...data.discovered, ...fresh]; save(); }
      return fresh;
    },

    best(seat) { return data.best[seat] ?? null; },
    endings(seat) { return Array.isArray(data.endings[seat]) ? [...data.endings[seat]] : []; },

    /** Records a finished run. Returns { newBest, newEnding }. */
    recordResult(seat, score, endingId) {
      const prev = data.best[seat];
      const newBest = prev == null || score > prev;
      if (newBest) data.best[seat] = score;
      const list = Array.isArray(data.endings[seat]) ? data.endings[seat] : [];
      const newEnding = !!endingId && !list.includes(endingId);
      if (newEnding) data.endings[seat] = [...list, endingId];
      save();
      return { newBest, newEnding };
    },

    /** Forgets all progress (keeps the mute setting). */
    reset() {
      const muted = data.muted;
      data = blank();
      data.muted = muted;
      save();
    },
  };
}
