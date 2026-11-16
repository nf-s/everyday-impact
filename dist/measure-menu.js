// The measure menu: a button that opens the list of measures, each with the number of
// activities that have a figure for it.
import { comparisonMetrics } from './model.js';
import { h, fill } from './dom.js';
import { metricCoverage } from './comparison.js';

export function mountMeasureMenu({ button, label, panel, list, store }) {
  const options = () => [...list.querySelectorAll('[role="option"]')];

  function choose(key) {
    panel.hidePopover();
    button.focus({ preventScroll: true });
    store.setMetric(key);
  }

  function render(state) {
    const total = state.choices.length;
    const coverage = metricCoverage(state);
    label.textContent = comparisonMetrics[state.metric].label;
    button.disabled = !coverage.length;
    fill(list, coverage.map(({ key, count }) => {
      const name = comparisonMetrics[key].label;
      return h('button', {
        type: 'button', role: 'option', tabindex: '-1', class: 'measure-option' + (count === total ? ' full' : ''),
        'aria-selected': String(key === state.metric), 'aria-label': name + ', ' + count + ' of ' + total + (total === 1 ? ' activity' : ' activities'),
        onclick: () => choose(key)
      },
        h('span', { class: 'measure-name', text: name }),
        h('span', { class: 'measure-count' },
          h('span', { class: 'measure-track' }, h('span', { style: 'width:' + count / total * 100 + '%' })),
          count + ' of ' + total));
    }));
  }

  // Opens under the button, or above it when only that side has room; scrolls on the roomier side when neither does.
  function place() {
    panel.style.maxHeight = '';
    const box = button.getBoundingClientRect();
    const below = window.innerHeight - box.bottom - 18;
    const above = box.top - 18;
    const height = panel.offsetHeight;
    const under = height <= below || below >= above;
    if (height > Math.max(below, above)) panel.style.maxHeight = Math.max(below, above) + 'px';
    panel.style.left = Math.max(12, Math.min(box.left, window.innerWidth - panel.offsetWidth - 12)) + 'px';
    panel.style.top = (under ? box.bottom + 6 : box.top - 6 - panel.offsetHeight) + 'px';
  }

  panel.addEventListener('toggle', event => {
    const open = event.newState === 'open';
    button.setAttribute('aria-expanded', String(open));
    if (!open) return;
    place();
    (list.querySelector('[aria-selected="true"]') || options()[0])?.focus({ preventScroll: true });
  });
  panel.addEventListener('focusout', event => {
    if (event.relatedTarget && !panel.contains(event.relatedTarget) && event.relatedTarget !== button) panel.hidePopover();
  });
  list.addEventListener('keydown', event => {
    const items = options();
    const index = items.indexOf(document.activeElement);
    const next = { ArrowDown: Math.min(index + 1, items.length - 1), ArrowUp: Math.max(index - 1, 0), Home: 0, End: items.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    items[next].focus();
  });
  button.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    panel.showPopover();
  });
  window.addEventListener('resize', () => { if (panel.matches(':popover-open')) place(); });
  window.addEventListener('scroll', () => { if (panel.matches(':popover-open')) panel.hidePopover(); }, { passive: true });

  store.subscribe(render);
  render(store.state);
}
