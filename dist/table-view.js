// The "In numbers" view: every measure as a column, schedules edited in place,
// alternatives as sub-rows and totals underneath.
import { comparisonMetrics, number, validAmount } from './model.js';
import { h, refocus } from './dom.js';
import {
  metricKeys, sharedKeys, resolve, estimate, applied, hasAlternative, amountUnit, usageText, scopeLabel, waterScopesDiffer
} from './comparison.js';

function letter(index) {
  let label = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) label = String.fromCharCode(65 + (n - 1) % 26) + label;
  return label;
}

// One unit per column, chosen from its largest figure, so digits line up down the page.
function columnUnit(key, max) {
  const unit = comparisonMetrics[key].unit;
  if (key === 'carbon') return max >= 10000 ? { factor: 0.001, unit: 't CO₂e' } : max < 1 ? { factor: 1000, unit: 'g CO₂e' } : { factor: 1, unit };
  if (key === 'energy') return max < 1 ? { factor: 1000, unit: 'Wh' } : { factor: 1, unit };
  if (key === 'water') return max < 1 ? { factor: 1000, unit: 'mL' } : max >= 100000 ? { factor: 0.001, unit: 'kL' } : { factor: 1, unit };
  return { factor: 1, unit };
}

function figure(value, column) {
  return value === null ? '' : number(value * column.factor);
}

function change(value, base, column) {
  if (value === null || value === 0) return null;
  const share = base ? Math.round(Math.abs(value) / Math.abs(base) * 100) : null;
  return h('span', { class: 'delta ' + (value > 0 ? 'lower' : 'higher') },
    (value > 0 ? '−' : '+') + number(Math.abs(value) * column.factor) + (share === null ? '' : ' (' + share + '%)'));
}

// table and notes are the elements to fill. Returns the render function.
export function mountTable({ section, table, notes, sharedOnly, store, actions }) {
  function commitSchedule(item, row) {
    const unit = amountUnit(item);
    const amount = row.querySelector('[data-field="amount"]').valueAsNumber / unit.scale;
    const period = row.querySelector('[data-field="period"]').value;
    const times = period === 'once' ? 1 : row.querySelector('[data-field="times"]').valueAsNumber;
    if (validAmount(amount) && validAmount(times)) store.patch(item.uid, { amount, times, period });
    else render();
  }

  function scheduleCells(item) {
    const unit = amountUnit(item);
    const field = (name, value) => h('input', {
      type: 'number', min: '0', step: 'any', inputmode: 'decimal', value: String(value),
      dataset: { field: name, focus: item.uid + ':' + name }, 'aria-label': name === 'amount' ? 'Quantity in ' + unit.label : 'Times each period'
    });
    const period = h('select', { dataset: { field: 'period', focus: item.uid + ':period' }, 'aria-label': 'Frequency' },
      [['once', 'once'], ['daily', 'per day'], ['weekly', 'per week'], ['monthly', 'per month']]
        .map(([id, label]) => h('option', { value: id, text: label, selected: id === item.period })));
    return [
      h('td', { class: 'wide qty' }, field('amount', Number((item.amount * unit.scale).toPrecision(12))), h('span', { class: 'unit', text: item.amount * unit.scale === 1 ? unit.singular : unit.label })),
      h('td', { class: 'wide freq' }, item.period === 'once' ? null : field('times', item.times), period)
    ];
  }

  function render() {
    const state = store.state;
    const focused = section.contains(document.activeElement) ? document.activeElement.dataset.focus : null;
    const shared = sharedKeys(state);
    const keys = state.sharedOnly ? metricKeys(state).filter(key => shared.includes(key)) : metricKeys(state);
    const mixedWater = waterScopesDiffer(state);
    sharedOnly.checked = state.sharedOnly;
    const anyAlternative = state.choices.some(hasAlternative);

    const rows = state.choices.map(item => ({ item, names: resolve(item, state), results: Object.fromEntries(keys.map(key => [key, estimate(item, key, state)])) }));
    const columns = Object.fromEntries(keys.map(key => {
      const max = Math.max(0, ...rows.flatMap(row => [row.results[key].current, row.results[key].alternative]).filter(value => value !== null));
      return [key, { ...columnUnit(key, max), max }];
    }));

    const head = h('thead', {}, h('tr', {},
      h('th', { class: 'letter', scope: 'col' }, h('span', { class: 'sr-only', text: 'Row' })),
      h('th', { class: 'activity', scope: 'col', text: 'Activity' }),
      h('th', { class: 'wide', scope: 'col', text: 'Quantity' }),
      h('th', { class: 'wide', scope: 'col', text: 'Frequency' }),
      keys.map(key => h('th', { class: 'num' + (key === state.metric ? ' focus' : ''), scope: 'col', 'aria-sort': key === state.metric ? 'none' : null },
        h('button', { type: 'button', title: comparisonMetrics[key].note, 'aria-pressed': String(key === state.metric), onclick: () => store.setMetric(key) },
          h('span', { class: 'measure', text: comparisonMetrics[key].label }), h('span', { class: 'col-unit', text: columns[key].unit })))),
      h('th', { class: 'end', scope: 'col' }, h('span', { class: 'sr-only', text: 'Remove' }))));

    const bodies = rows.map(({ item, names, results }, index) => {
      const cell = (key, side) => {
        const result = results[key];
        const value = result[side];
        const column = columns[key];
        const focus = key === state.metric;
        const option = side === 'alternative' ? names.after : names.before;
        const scope = scopeLabel(option, side === 'alternative' ? names.afterGroup : names.group, key);
        if (value === null) return h('td', { class: 'num empty' + (focus ? ' focus' : '') }, side === 'current' ? h('span', { title: 'No estimate from this source', text: '·' }) : null);
        return h('td', { class: 'num' + (focus ? ' focus' : '') },
          h('button', {
            type: 'button', class: 'figure', title: scope || 'Calculation and sources', dataset: { focus: item.uid + ':' + key + ':' + side },
            onclick: event => actions.showDetails(item, key, event.currentTarget, letter(index))
          }, figure(value, column)),
          side === 'alternative' ? change(result.difference, result.current, column) : null,
          scope && (option?.gridEstimate || (key === 'water' && mixedWater)) ? h('span', { class: 'cell-scope', text: scope }) : null,
          focus && column.max > 0 ? h('span', { class: 'bar ' + side, style: 'width:' + Math.max(0.5, value / column.max * 100) + '%' }) : null);
      };
      const current = h('tr', { class: 'current' },
        h('th', { class: 'letter', scope: 'row', text: letter(index) }),
        h('th', { class: 'activity', scope: 'row' },
          h('button', { type: 'button', class: 'name', dataset: { focus: item.uid + ':name' }, onclick: () => actions.changeActivity(item) }, names.name),
          h('button', { type: 'button', class: 'usage narrow', dataset: { focus: item.uid + ':usage' }, onclick: event => actions.editSchedule(item, event.currentTarget) }, usageText(item)),
          hasAlternative(item) ? null : h('button', { type: 'button', class: 'try', dataset: { focus: item.uid + ':alternative' }, onclick: () => actions.chooseAlternative(item) }, 'Try an alternative')),
        scheduleCells(item),
        keys.map(key => cell(key, 'current')),
        h('td', { class: 'end' }, h('button', { type: 'button', class: 'remove', 'aria-label': 'Remove ' + names.name, onclick: () => store.remove(item.uid) }, '×')));
      const alternative = hasAlternative(item) ? h('tr', { class: 'alternative' },
        h('th', { class: 'letter', scope: 'row' }, h('span', { 'aria-hidden': 'true', text: '↳' })),
        h('th', { class: 'activity', scope: 'row' },
          h('button', { type: 'button', class: 'name', dataset: { focus: item.uid + ':alternative' }, onclick: () => actions.chooseAlternative(item) }, names.alternativeName || 'Choose an alternative')),
        h('td', { class: 'wide same', colspan: '2', text: 'Same quantity and frequency' }),
        keys.map(key => cell(key, 'alternative')),
        h('td', { class: 'end' }, h('button', { type: 'button', class: 'remove', 'aria-label': 'Remove alternative', onclick: () => store.setAlternative(item.uid, 'footprint') }, '×'))) : null;
      current.addEventListener('change', event => { if (event.target.dataset.field) commitSchedule(item, current); });
      return h('tbody', {}, current, alternative);
    });

    // A water total is only meaningful when every figure counts the same kind of water.
    const summable = key => key !== 'water' || new Set(rows.filter(row => row.results[key].current !== null).map(row => scopeLabel(row.names.before, row.names.group, key))).size <= 1;
    const sum = (key, pick) => {
      const values = rows.map(row => pick(row.results[key])).filter(value => value !== null);
      return values.length && summable(key) ? values.reduce((total, value) => total + value, 0) : null;
    };
    const totalRow = (label, className, pick, compare) => h('tr', { class: className },
      h('th', { class: 'letter' }), h('th', { class: 'activity', scope: 'row', text: label }), h('td', { class: 'wide', colspan: '2' }),
      keys.map(key => {
        const value = sum(key, pick);
        const covered = rows.filter(row => row.results[key].current !== null).length;
        const base = compare ? sum(key, result => result.current) : null;
        return h('td', { class: 'num' + (key === state.metric ? ' focus' : '') },
          value === null ? h('span', { class: 'empty', title: 'Figures use different scopes', text: '·' }) : h('span', { class: 'figure', text: figure(value, columns[key]) }),
          compare && value !== null && base !== null ? change(base - value, base, columns[key]) : null,
          !compare && covered < rows.length ? h('span', { class: 'cover', text: covered + ' of ' + rows.length }) : null);
      }),
      h('td', { class: 'end' }));
    const foot = h('tfoot', {},
      totalRow('Total', 'total', result => result.current, false),
      anyAlternative ? totalRow('With alternatives', 'with', applied, true) : null);

    table.replaceChildren(head, ...bodies, foot);
    notes.replaceChildren(...[
      ...(rows.length > 1 && !shared.length ? ['No measure covers every activity.'] : []),
      'One-off activities count once. Recurring activities are averaged over the period.',
      'Starting quantities are illustrative. Select a figure for its calculation, assumptions and sources.',
      ...(keys.includes('water') && !summable('water') ? ['Water figures use different source scopes, so they are not totalled.'] : [])
    ].map(text => h('li', { text })));
    if (focused) refocus(focused);
  }

  sharedOnly.addEventListener('change', () => store.setSharedOnly(sharedOnly.checked));
  // Deferring keeps focus on the next field when a change is committed with Tab.
  store.subscribe(() => setTimeout(render, 0));
  render();
  return render;
}
