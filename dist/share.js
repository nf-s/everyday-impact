import { comparisonURL, portableShareBase, ShareLimitError } from './share-state.js';

export function setupSharing(getState, validateChoice, gridIds, options = {}) {
  const page = options.document || globalThis.document;
  const button = page.getElementById('share-comparison');
  const status = page.getElementById('share-status');
  const fallback = page.getElementById('share-fallback');
  const input = page.getElementById('share-url');
  const clipboard = options.clipboard ?? globalThis.navigator?.clipboard;
  const href = options.href || (() => globalThis.location.href);
  const canonical = options.canonical || page.querySelector?.('link[rel="canonical"]')?.href;
  let generation = 0;
  let hasLink = false;
  function showError(message) {
    status.textContent = message;
    status.dataset.error = 'true';
  }
  button.addEventListener('click', async () => {
    const current = ++generation;
    fallback.hidden = true;
    input.value = '';
    hasLink = false;
    status.textContent = '';
    status.dataset.error = 'false';
    let url;
    try {
      url = comparisonURL(portableShareBase(href(), canonical), getState(), validateChoice, gridIds);
    } catch (error) {
      showError(error instanceof ShareLimitError ? error.message : 'Complete valid choices and replacement selections before sharing.');
      return;
    }
    hasLink = true;
    try {
      if (!clipboard?.writeText) throw new Error('Clipboard unavailable');
      await clipboard.writeText(url);
      if (current === generation) status.textContent = 'Comparison link copied.';
    } catch {
      if (current !== generation) return;
      input.value = url;
      fallback.hidden = false;
      status.textContent = 'Copy the comparison link below.';
      input.focus();
      input.select();
    }
  });
  return { showError, invalidate() {
    generation += 1;
    if (!hasLink) return;
    hasLink = false;
    status.textContent = '';
    fallback.hidden = true;
    input.value = '';
  } };

}
