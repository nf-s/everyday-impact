import { createStore, comparisonMetrics, metricKeys, resolve, estimate, hasAlternative, format, usageText } from '../shared/engine.js';
import { h, fill, harness, settings, pickActivity, pickAlternative, editSchedule, showDetails } from '../shared/widgets.js';

const store = createStore();
harness('bars', store);

const view = id => document.getElementById(id);
const controls = settings(store);
view('frame').append(controls.metric, h('span', { text: 'over' }), controls.amount, controls.unit, controls.gridField);

const open = new Set();

function share(value, max) {
  return max > 0 && value > 0 ? 'width:max(3px,' + (value / max * 100).toFixed(3) + '%)' : 'width:0';
}

function panel(item, names, state) {
  const others = metricKeys({ ...state, choices: [item] }).filter(key => key !== state.metric);
  const line = (label, value, action, onclick) => h('div', { class: 'detail' },
    h('span', { class: 'detail-label', text: label }), h('span', { class: 'detail-value', text: value }),
    h('button', { type: 'button', text: action, onclick }));
  return h('div', { class: 'panel' },
    line('Schedule', usageText(item), 'Edit', event => editSchedule({ item, store, anchor: event.currentTarget })),
    line('Alternative', hasAlternative(item) ? names.alternativeName : 'None', hasAlternative(item) ? 'Change' : 'Try one', () => pickAlternative({ item, store })),
    others.length ? h('dl', { class: 'measures' }, others.map(key => {
      const result = estimate(item, key, state);
      return h('div', {},
        h('dt', { text: comparisonMetrics[key].label }),
        h('dd', { text: format(result.current, key) + (result.alternative === null ? '' : ' → ' + format(result.alternative, key)) }));
    })) : null,
    h('div', { class: 'panel-actions' },
      h('button', { type: 'button', text: 'Calculation and sources', onclick: () => showDetails({ item, store }) }),
      h('button', { type: 'button', text: 'Change activity', onclick: () => pickActivity({ title: 'Change activity', store, onPick: entry => store.replaceActivity(item.uid, entry) }) }),
      h('button', { type: 'button', class: 'danger', text: 'Remove', onclick: () => store.remove(item.uid) })));
}

function render() {
  const state = store.state;
  const key = state.metric;
  controls.sync();
  const rows = state.choices.map(item => ({ item, names: resolve(item, state), result: estimate(item, key, state) }))
    .sort((a, b) => (b.result.current ?? -Infinity) - (a.result.current ?? -Infinity));
  const max = Math.max(0, ...rows.flatMap(row => [row.result.current, row.result.alternative]).filter(value => value !== null));

  fill(view('rows'), rows.map(({ item, names, result }) => {
    const expanded = open.has(item.uid);
    const lower = result.difference !== null && result.current ? Math.round(result.difference / result.current * 100) : null;
    const summary = h('button', {
      type: 'button', class: 'summary', 'aria-expanded': String(expanded),
      onclick: () => { if (expanded) open.delete(item.uid); else open.add(item.uid); render(); }
    },
      h('span', { class: 'name', text: names.name }),
      h('span', { class: 'value', text: result.current === null ? 'No estimate' : format(result.current, key) }),
      h('span', { class: 'usage', text: usageText(item) }),
      h('span', { class: 'chevron', 'aria-hidden': 'true' }),
      result.current === null ? null : h('span', { class: 'track' }, h('span', { class: 'bar', style: share(result.current, max) })),
      hasAlternative(item) && result.alternative !== null ? [
        h('span', { class: 'alt-name', text: item.kind === 'skip' ? 'If skipped' : 'With ' + names.alternativeName }),
        h('span', { class: 'alt-value' }, format(result.alternative, key),
          lower === null || lower === 0 ? null : h('span', { class: lower > 0 ? 'lower' : 'higher', text: (lower > 0 ? '−' : '+') + Math.abs(lower) + '%' })),
        h('span', { class: 'track' }, h('span', { class: 'bar alt', style: share(result.alternative, max) }))
      ] : null);
    return h('li', { class: 'row' + (expanded ? ' open' : '') }, summary, expanded ? panel(item, names, state) : null);
  }));
}

view('add').addEventListener('click', () => pickActivity({ title: 'Add activity', store, onPick: entry => store.add(entry) }));
store.subscribe(render);
render();
