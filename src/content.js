// Loads content modules. Stories load on demand; a missing seat story falls
// back to the demo story (shown with a "demo" badge) so the game stays
// playable while a campaign is being written.

export { ERAS } from '../content/eras.js';
export { SEATS } from '../content/seats.js';
export { CODEX, CODEX_GROUPS } from '../content/codex.js';

/**
 * @param {string} name  story module name in content/stories/
 * @returns {Promise<{ id: string, story: object, demo: boolean, fallbackFrom?: string }>}
 */
export async function loadStory(name) {
  try {
    const mod = await import(`../content/stories/${name}.js`);
    return { id: name, story: mod.default, demo: !!mod.default.demo };
  } catch (err) {
    if (name === 'demo') throw err;
    console.info(`[misaligned] story "${name}" is not available yet (${err && err.message}); playing the demo story.`);
    const mod = await import('../content/stories/demo.js');
    return { id: 'demo', story: mod.default, demo: true, fallbackFrom: name };
  }
}
