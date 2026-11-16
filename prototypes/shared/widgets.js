// Dialogs shared by the prototypes: the activity picker, the schedule editor and
// the evidence view. Each prototype themes them through the --w-* properties.
import {
  comparisonMetrics, periods, examples, search, browse, entries, alternativePool, resolve, estimate, format, grids, needsGrid,
  usageText, amountUnit, calculation, evidence, metricKeys, scopeLabel, horizonLabel, horizonUnits, entryTotal, raw, validAmount
} from './engine.js';

const present = children => children.flat(Infinity).filter(child => child !== null && child !== undefined && child !== false);

// Replaces a node's children, skipping empty values and flattening nested lists.
export function fill(node, ...children) {
  node.replaceChildren(...present(children));
  return node;
}

export function h(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === false || value === null || value === undefined) continue;
    if (name === 'class') node.className = value;
    else if (name === 'text') node.textContent = value;
    else if (name.startsWith('on')) node.addEventListener(name.slice(2), value);
    else if (name === 'dataset') Object.assign(node.dataset, value);
    else node.setAttribute(name, value === true ? '' : value);
  }
  node.append(...present(children));
  return node;
}

export function svg(tag, attributes = {}, ...children) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === false || value === null || value === undefined) continue;
    if (name === 'text') node.textContent = value;
    else if (name.startsWith('on')) node.addEventListener(name.slice(2), value);
    else node.setAttribute(name, value);
  }
  node.append(...present(children));
  return node;
}

const designs = [
  ['combined', 'Sentence + Ledger'], ['sentence', 'Sentence'], ['bars', 'Bars'], ['true-scale', 'True scale'], ['scale', 'Scale'], ['ledger', 'Ledger']
];

// The strip above each prototype. It belongs to the review harness, not to the design.
export function harness(current, store) {
  const select = h('select', { 'aria-label': 'Example data', onchange: event => {
    if (event.target.value) store.loadExample(event.target.value);
    event.target.value = '';
  } }, h('option', { value: '', text: 'Load example data' }), examples.map(example => h('option', { value: example.id, text: example.label })));
  const bar = h('nav', { class: 'proto-bar', 'aria-label': 'Design prototypes' },
    h('a', { class: 'proto-home', href: '../', text: 'Prototypes' }),
    h('ol', {}, designs.map(([id, label], index) => h('li', {},
      h('a', { href: '../' + id + '/', 'aria-current': id === current ? 'page' : null }, h('span', { text: String(index + 1) }), label)))),
    select);
  document.body.prepend(bar);
}

function dialog(className, label) {
  const node = h('dialog', { class: 'pw-dialog ' + className, 'aria-label': label });
  node.addEventListener('click', event => { if (event.target === node) node.close(); });
  node.addEventListener('close', () => node.remove());
  document.body.append(node);
  return node;
}

function closeButton(node) {
  return h('button', { type: 'button', class: 'pw-close', 'aria-label': 'Close', onclick: () => node.close() }, '×');
}

// pool: catalogue entries to choose from. pinned: fixed rows such as “Skip this activity”.
export function pickActivity({ title, store, pool = entries, pinned = [], onPick }) {
  const node = dialog('pw-picker', title);
  const state = store.state;
  const input = h('input', { type: 'search', placeholder: 'Search ' + raw(pool.length) + ' activities', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Search activities' });
  const poolCategories = [...new Set(pool.map(entry => entry.categoryLabel))];
  let category = '';
  const chips = h('div', { class: 'pw-chips', role: 'group', 'aria-label': 'Category' });
  const list = h('div', { class: 'pw-list' });
  const choose = action => { node.close(); action(); };

  function row(label, meta, value, action) {
    return h('button', { type: 'button', class: 'pw-row', onclick: () => choose(action) },
      h('span', { class: 'pw-row-main' }, h('span', { class: 'pw-row-label', text: label }), meta ? h('span', { class: 'pw-row-meta', text: meta }) : null),
      value ? h('span', { class: 'pw-row-value', text: value }) : null);
  }

  function entryRow(entry) {
    const total = entryTotal(entry, state.metric, state);
    const meta = [entry.groupLabel, entry.evidenceLabel, entry.qualityLabel].filter(Boolean).join(' · ');
    return row(entry.label, meta, total === null ? '' : format(total, state.metric), () => onPick(entry.choice));
  }

  function renderChips() {
    if (poolCategories.length < 2) { chips.hidden = true; return; }
    chips.replaceChildren(...['', ...poolCategories].map(name => h('button', {
      type: 'button', class: 'pw-chip', 'aria-pressed': String(category === name), text: name || 'All',
      onclick: () => { category = name; renderChips(); renderList(); }
    })));
  }

  function renderList() {
    const query = input.value.trim();
    const found = query ? search(query, pool, 60).filter(entry => !category || entry.categoryLabel === category) : browse(pool, category);
    const heading = query ? raw(found.length) + (found.length === 60 ? '+' : '') + ' matches' : 'General choices · illustrative ' + horizonLabel(state.horizon) + ' totals';
    list.replaceChildren(
      ...(query ? [] : pinned.map(item => row(item.label, item.meta, '', item.onPick))),
      h('p', { class: 'pw-list-heading', text: heading }),
      ...found.map(entryRow),
      found.length ? null : h('p', { class: 'pw-empty', text: 'No activities match. Try a broader term.' }));
    list.scrollTop = 0;
  }

  input.addEventListener('input', renderList);
  node.append(h('header', { class: 'pw-head' }, h('h2', { text: title }), closeButton(node)), h('div', { class: 'pw-search' }, input), chips, list);
  renderChips();
  renderList();
  node.showModal();
  input.focus();
}

export function pickAlternative({ item, store }) {
  const current = resolve(item, store.state);
  pickActivity({
    title: 'Alternative to ' + current.name,
    store,
    pool: alternativePool(item),
    pinned: [
      { label: 'Skip this activity', meta: 'Compare with not doing it', onPick: () => store.setAlternative(item.uid, 'skip') },
      ...(item.kind === 'footprint' ? [] : [{ label: 'Remove the alternative', meta: '', onPick: () => store.setAlternative(item.uid, 'footprint') }])
    ],
    onPick: entryChoice => store.setAlternative(item.uid, 'swap', entryChoice)
  });
}

export function editSchedule({ item, store, anchor }) {
  const node = dialog('pw-schedule', 'Edit schedule');
  const unit = amountUnit(item);
  const live = () => store.state.choices.find(candidate => candidate.uid === item.uid) || item;
  const amount = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', value: String(Number((item.amount * unit.scale).toPrecision(12))) });
  const times = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', value: String(item.times) });
  const period = h('select', {}, Object.entries(periods).map(([id, record]) => h('option', { value: id, text: record.label, selected: id === item.period })));
  const timesField = h('label', { class: 'pw-field' }, h('span', { text: 'Times each period' }), times);
  const summary = h('p', { class: 'pw-summary' });

  function apply() {
    const nextAmount = amount.valueAsNumber / unit.scale;
    const nextTimes = period.value === 'once' ? 1 : times.valueAsNumber;
    timesField.hidden = period.value === 'once';
    const valid = validAmount(nextAmount) && validAmount(nextTimes);
    amount.setAttribute('aria-invalid', String(!validAmount(nextAmount)));
    times.setAttribute('aria-invalid', String(!validAmount(nextTimes)));
    if (valid) store.patch(item.uid, { amount: nextAmount, times: nextTimes, period: period.value });
    const now = live();
    summary.textContent = usageText(now) + ' · ' + format(estimate(now, store.state.metric, store.state).current, store.state.metric) + ' over ' + horizonLabel(store.state.horizon);
  }

  for (const control of [amount, times, period]) control.addEventListener('input', apply);
  node.append(
    h('header', { class: 'pw-head' }, h('h2', { text: resolve(item, store.state).name }), closeButton(node)),
    h('form', { method: 'dialog', class: 'pw-form' },
      h('label', { class: 'pw-field' }, h('span', { text: 'Quantity (' + unit.label + ')' }), amount),
      h('label', { class: 'pw-field' }, h('span', { text: 'Frequency' }), period),
      timesField,
      summary,
      h('p', { class: 'pw-note', text: evidence(item, store.state).current.assumption + ' This starting schedule is illustrative.' }),
      h('button', { type: 'submit', class: 'pw-primary', text: 'Done' })));
  apply();
  node.showModal();
  if (anchor && window.matchMedia('(min-width: 720px)').matches) {
    const box = anchor.getBoundingClientRect();
    const width = node.offsetWidth;
    const height = node.offsetHeight;
    node.style.margin = '0';
    node.style.left = Math.max(12, Math.min(window.innerWidth - width - 12, box.left)) + 'px';
    node.style.top = Math.max(12, Math.min(window.innerHeight - height - 12, box.bottom + 8)) + 'px';
  }
  amount.select();
}

function calculationRow(label, detail) {
  if (!detail) return null;
  return h('div', { class: 'pw-calc' },
    h('dt', { text: label }),
    h('dd', {},
      h('span', { class: 'pw-calc-line', text: detail.amountText + ' × ' + detail.countText + ' × ' + detail.factorText }),
      detail.gridEstimate ? h('span', { class: 'pw-calc-note', text: 'Greenhouse gases estimated from electricity on the ' + detail.gridEstimate + ' grid.' }) : null));
}

export function showDetails({ item, store, key = store.state.metric }) {
  const state = store.state;
  const names = resolve(item, state);
  const proof = evidence(item, state);
  const node = dialog('pw-details', 'Details for ' + names.name);
  const result = estimate(item, key, state);
  const scope = scopeLabel(item, key, state);
  const measures = metricKeys({ ...state, choices: [item] });

  const section = (heading, ...children) => h('section', {}, h('h3', { text: heading }), ...children);
  const record = (title, details) => h('div', { class: 'pw-record' },
    h('p', { class: 'pw-record-name' }, title, details.evidenceLabel ? h('span', { class: 'pw-tag', text: details.evidenceLabel }) : null),
    details.note ? h('p', { text: details.note }) : null,
    details.reasoning ? h('p', { text: details.reasoning }) : null);

  node.append(
    h('header', { class: 'pw-head' },
      h('div', {}, h('h2', { text: names.name }), h('p', { class: 'pw-sub', text: usageText(item) + ' · ' + horizonLabel(state.horizon) })),
      closeButton(node)),
    h('div', { class: 'pw-body' },
      section(comparisonMetrics[key].label + (scope ? ' · ' + scope : ''),
        h('p', { class: 'pw-total' }, format(result.current, key),
          result.alternative !== null ? h('span', { text: ' → ' + format(result.alternative, key) + ' with ' + names.alternativeName.toLowerCase() }) : null),
        h('dl', {},
          calculationRow('Calculation', calculation(item, key, state)),
          item.kind === 'swap' ? calculationRow('Alternative', calculation(item, key, state, 'alternative')) : null),
        h('p', { class: 'pw-note', text: comparisonMetrics[key].note })),
      section('Evidence',
        record(names.name, proof.current),
        proof.alternative ? record(names.alternativeName, proof.alternative) : null),
      section('All measures',
        h('table', {}, h('tbody', {}, measures.map(measure => {
          const row = estimate(item, measure, state);
          return h('tr', {},
            h('th', { scope: 'row', text: comparisonMetrics[measure].label }),
            h('td', { text: format(row.current, measure) }),
            h('td', { text: row.alternative === null ? '' : '→ ' + format(row.alternative, measure) }));
        })))),
      h('details', {}, h('summary', { text: 'Source context and assumptions' }), h('p', { text: proof.current.sourceNote })),
      section('Sources',
        h('ul', { class: 'pw-sources' }, proof.current.sources.map(source =>
          h('li', {}, h('a', { href: source.url, target: '_blank', rel: 'noopener noreferrer', text: source.label })))))));
  node.showModal();
}

// Native controls for the measure, period and electricity grid. Each prototype
// places and styles them; sync() refreshes them after the comparison changes.
export function settings(store) {
  const metric = h('select', { 'aria-label': 'Measure', onchange: event => store.setMetric(event.target.value) });
  const amount = h('input', { type: 'number', min: '1', max: '1000', step: '1', inputmode: 'numeric', 'aria-label': 'Period length' });
  const unit = h('select', { 'aria-label': 'Period unit' }, Object.entries(horizonUnits).map(([id, record]) => h('option', { value: id, text: record.label.toLowerCase() })));
  const grid = h('select', { 'aria-label': 'Electricity grid for estimated emissions', onchange: event => store.setGrid(event.target.value) },
    h('option', { value: '', text: 'Source figures only' }), grids.map(item => h('option', { value: item.id, text: item.label })));
  const gridField = h('label', { class: 'grid-field' }, h('span', { text: 'Electricity grid' }), grid);
  const commit = () => {
    store.setHorizon({ amount: amount.valueAsNumber, unit: unit.value });
    amount.value = String(store.state.horizon.amount);
  };
  amount.addEventListener('change', commit);
  unit.addEventListener('change', commit);
  function sync() {
    const state = store.state;
    metric.replaceChildren(...metricKeys(state).map(key => h('option', { value: key, text: comparisonMetrics[key].label, selected: key === state.metric })));
    if (document.activeElement !== amount) amount.value = String(state.horizon.amount);
    unit.value = state.horizon.unit;
    grid.value = state.grid;
    gridField.hidden = !needsGrid(state);
  }
  sync();
  return { metric, amount, unit, gridField, sync };
}

// A short sheet for one activity: the figure, then the ways to dig further.
export function openSheet({ item, store }) {
  const state = store.state;
  const names = resolve(item, state);
  const result = estimate(item, state.metric, state);
  const node = dialog('pw-sheet', names.name);
  const then = action => event => { const anchor = event.currentTarget; node.close(); action(anchor); };
  const line = (label, value, action, onclick) => h('div', { class: 'pw-line' },
    h('span', { class: 'pw-line-label', text: label }), h('span', { text: value }), h('button', { type: 'button', text: action, onclick }));
  const alternative = item.kind === 'footprint' ? 'None' : names.alternativeName +
    (result.alternative === null ? '' : ' · ' + format(result.alternative, state.metric));
  node.append(
    h('header', { class: 'pw-head' },
      h('div', {}, h('h2', { text: names.name }), h('p', { class: 'pw-sub', text: comparisonMetrics[state.metric].label + ' over ' + horizonLabel(state.horizon) })),
      closeButton(node)),
    h('div', { class: 'pw-body' },
      h('p', { class: 'pw-total', text: result.current === null ? 'No estimate for this measure' : format(result.current, state.metric) }),
      h('div', {},
        line('Schedule', usageText(item), 'Edit', then(() => editSchedule({ item, store }))),
        line('Alternative', alternative, item.kind === 'footprint' ? 'Try one' : 'Change', then(() => pickAlternative({ item, store })))),
      h('div', { class: 'pw-actions' },
        h('button', { type: 'button', text: 'Calculation and sources', onclick: then(() => showDetails({ item, store })) }),
        h('button', { type: 'button', text: 'Change activity', onclick: then(() => pickActivity({ title: 'Change activity', store, onPick: entry => store.replaceActivity(item.uid, entry) })) }),
        h('button', { type: 'button', class: 'pw-danger', text: 'Remove', onclick: then(() => store.remove(item.uid)) }))));
  node.showModal();
}
