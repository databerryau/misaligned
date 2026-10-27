// Animation clock in seconds. Pauses while the tab is hidden so nothing jumps
// on return. With a frozen time (debug `?t=`) it always returns that value.

export function createClock(frozen = null) {
  const now = () => performance.now() / 1000;
  const start = now();
  let offset = 0;
  let pausedAt = null;
  return {
    frozen: frozen != null,
    time() {
      if (frozen != null) return frozen;
      return (pausedAt ?? now()) - start - offset;
    },
    pause() { if (pausedAt == null) pausedAt = now(); },
    resume() {
      if (pausedAt != null) { offset += now() - pausedAt; pausedAt = null; }
    },
  };
}
