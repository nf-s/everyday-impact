import {
  createStore, resolve, estimate, hasAlternative, format, parts, usageText, number, generalEntries, entryTotal, entryId
} from '../shared/engine.js';
import { h, svg, fill, harness, settings, pickActivity, pickAlternative, editSchedule, showDetails } from '../shared/widgets.js';
import { mountLedger } from '../shared/ledger-view.js';

const store = createStore();
harness('combined', store);

const view = id => document.getElementById(id);
const rail = view('rail');
const plot = view('plot');
const tip = view('tip');
const rowsList = view('rows');
const controls = settings(store);
view('frame').append(controls.metric, h('span', { text: 'over' }), controls.amount, controls.unit, controls.gridField);

const open = new Set();
let context = [];
let position = () => 0;
let pinned = null;

// An editable phrase inside running text. A span wraps across lines; a button cannot.
function token(content, className, action) {
  return h('span', {
    class: 'token ' + className, role: 'button', tabindex: '0',
    onclick: event => action(event.currentTarget),
    onkeydown: event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      action(event.currentTarget);
    }
  }, content);
}

// The dash stays with the phrase before it, so a line never starts with one.
const dash = () => h('span', { class: 'dash', text: '\u00a0— ' });

const lowered = '₀₁₂₃₄₅₆₇₈₉';
// Unit glyphs such as ₂ are missing from the serif, so they are set as real sub and superscripts.
function typeset(text) {
  return text.split(/([₀-₉⁺])/).map(piece =>
    piece === '⁺' ? h('sup', { text: '+' }) : lowered.includes(piece) && piece ? h('sub', { text: String(lowered.indexOf(piece)) }) : piece);
}

function swapLine(item, names, result, key) {
  if (!hasAlternative(item)) return null;
  const share = result.current ? Math.round(Math.abs(result.difference) / Math.abs(result.current) * 100) : null;
  const direction = result.difference > 0 ? 'lower' : result.difference < 0 ? 'higher' : '';
  const change = () => pickAlternative({ item, store });
  return h('p', { class: 'swap' },
    item.kind === 'skip' ? ['If you ', token('skip it', 'name', change), ', '] : ['With ', token(names.alternativeName, 'name', change), ' instead, '],
    result.alternative === null ? 'there is no estimate for this measure.' : [
      h('strong', {}, typeset(format(result.alternative, key))),
      direction && share !== null ? [', ', h('span', { class: direction, text: share + '% ' + direction }), '.'] : '.'
    ]);
}

function actions(item, isReference) {
  return h('p', { class: 'actions' },
    hasAlternative(item)
      ? h('button', { type: 'button', text: 'Remove the alternative', onclick: () => store.setAlternative(item.uid, 'footprint') })
      : h('button', { type: 'button', text: 'Try an alternative', onclick: () => pickAlternative({ item, store }) }),
    isReference ? null : h('button', { type: 'button', text: 'Compare everything with this', onclick: () => store.moveFirst(item.uid) }),
    h('button', { type: 'button', text: 'Calculation and sources', onclick: () => showDetails({ item, store }) }),
    h('button', { type: 'button', text: 'Remove', onclick: () => store.remove(item.uid) }));
}

function ratio(value, base) {
  if (value === null || base === null || base <= 0 || value < 0) return null;
  if (value === 0) return { figure: '0', label: 'none' };
  const share = value / base;
  if (share > 0.95 && share < 1.05) return { figure: '≈', label: 'the same' };
  const times = share >= 1 ? share : 1 / share;
  return { figure: number(times >= 100 ? Math.round(times) : Math.round(times * 10) / 10) + '×', label: share >= 1 ? 'as much' : 'less' };
}

function sorted(state) {
  const key = state.metric;
  return state.choices.map((item, index) => ({ item, isReference: index === 0, names: resolve(item, state), result: estimate(item, key, state) }))
    .sort((a, b) => (b.result.current ?? -Infinity) - (a.result.current ?? -Infinity));
}

function renderRows() {
  const state = store.state;
  const key = state.metric;
  controls.sync();
  const base = state.choices.length ? estimate(state.choices[0], key, state).current : null;
  fill(rowsList, sorted(state).map(({ item, isReference, names, result }) => {
    const compared = isReference ? null : ratio(result.current, base);
    const expanded = open.has(item.uid);
    const row = h('li', { class: 'row' + (isReference ? ' reference' : ''), dataset: { uid: String(item.uid) } },
      h('div', { class: 'text' },
        h('p', { class: 'statement' },
          token(names.name, 'name', () => pickActivity({ title: 'Change activity', store, onPick: entry => store.replaceActivity(item.uid, entry) })),
          dash(), token(usageText(item), 'usage', anchor => editSchedule({ item, store, anchor })),
          result.current === null ? [dash(), h('span', { class: 'none', text: 'no estimate for this measure' })] : [
            dash(), isReference ? 'comes to ' : null,
            token(typeset(format(result.current, key)), 'value', () => showDetails({ item, store, key })), isReference ? '.' : null
          ]),
        swapLine(item, names, result, key),
        expanded ? actions(item, isReference) : null),
      h('div', { class: 'aside' },
        isReference ? h('p', { class: 'ratio' }, h('span', { text: 'Reference' })) :
          compared ? h('p', { class: 'ratio' }, h('strong', { text: compared.figure }), h('span', { text: compared.label })) : null,
        h('button', { type: 'button', class: 'more', 'aria-expanded': String(expanded), 'aria-label': (expanded ? 'Less for ' : 'More for ') + names.name,
          onclick: () => { if (expanded) open.delete(item.uid); else open.add(item.uid); renderRows(); } }, expanded ? 'Less' : 'More')));
    row.addEventListener('pointerenter', () => plot.querySelector('.mark[data-uid="' + item.uid + '"]')?.classList.add('on'));
    row.addEventListener('pointerleave', () => plot.querySelector('.mark[data-uid="' + item.uid + '"]')?.classList.remove('on'));
    return row;
  }), state.choices.length ? null : h('li', { class: 'row empty', text: 'No activities yet. Add one to start a comparison.' }));
  drawRail();
}

// Decade labels drop the long unit suffix; the measure is named in the controls.
function decadeLabel(power, key) {
  const label = parts(10 ** power * (power < 0 ? 1 - 1e-9 : 1 + 1e-9), key);
  return label.text + ' ' + label.unit.split(' ')[0];
}

function drawRail() {
  if (view('sentence-view').hidden) return;
  const state = store.state;
  const key = state.metric;
  const rows = sorted(state).filter(row => row.result.current > 0);
  const chosen = new Set(state.choices.map(item => item.group + '/' + item.before));
  context = generalEntries.filter(entry => !chosen.has(entryId(entry)))
    .map(entry => ({ entry, value: entryTotal(entry, key, state) })).filter(entry => entry.value > 0);

  const narrow = window.matchMedia('(max-width: 720px)').matches;
  const width = rail.clientWidth;
  const axis = narrow ? width - 18 : width - 78;
  const height = Math.max(rowsList.offsetHeight, narrow ? 420 : 540);
  const values = [...rows.flatMap(row => [row.result.current, row.result.alternative]).filter(value => value > 0), ...context.map(entry => entry.value)];
  const high = values.length ? Math.ceil(Math.log10(Math.max(...values)) + 0.1) : 1;
  const low = values.length ? Math.min(Math.floor(Math.log10(Math.min(...values)) - 0.1), high - 3) : -2;
  const decades = high - low;
  const top = 14;
  const step = (height - top * 2) / decades;
  position = value => top + (high - Math.log10(value)) * step;
  const origin = rail.getBoundingClientRect().top;

  rail.style.height = height + 'px';
  plot.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  plot.setAttribute('width', width);
  plot.setAttribute('height', height);
  fill(plot,
    Array.from({ length: decades + 1 }, (unused, index) => {
      const y = top + index * step;
      return [
        svg('line', { class: 'decade-mark', x1: axis - (narrow ? 8 : 24), x2: axis, y1: y, y2: y }),
        svg('text', { class: 'decade', x: axis - (narrow ? 11 : 30), y: y + 4, 'text-anchor': 'end', text: decadeLabel(high - index, key) })
      ];
    }),
    context.map(entry => svg('line', { class: 'tick', x1: axis - (narrow ? 7 : 20), x2: axis - 3, y1: position(entry.value), y2: position(entry.value), 'data-id': entryId(entry.entry) })),
    svg('line', { class: 'axis', x1: axis, x2: axis, y1: top - 8, y2: height - top + 8 }),
    rows.map(({ item, isReference, result }) => {
      const y = position(result.current);
      const statement = rowsList.querySelector('.row[data-uid="' + item.uid + '"] .statement');
      const target = statement.getBoundingClientRect().top - origin + parseFloat(getComputedStyle(statement).lineHeight) / 2;
      const alternative = result.alternative > 0 ? position(result.alternative) : null;
      const leader = narrow ? [axis + 6, y, width, target] : [axis + 8, y, axis + 20, y, width - 18, target, width, target];
      return svg('g', { class: 'mark' + (isReference ? ' reference' : ''), 'data-uid': item.uid },
        alternative === null ? null : [
          svg('line', { class: 'change', x1: axis, x2: axis, y1: y, y2: alternative }),
          svg('circle', { class: 'dot alternative', cx: axis, cy: alternative, r: 4 })
        ],
        svg('polyline', { class: 'leader', points: leader.join(' ') }),
        svg('circle', { class: 'dot', cx: axis, cy: y, r: isReference ? 6 : 4.5 }));
    }),
    svg('rect', { class: 'hit', x: Math.max(axis - 44, 0), y: 0, width: Math.min(44, axis), height }));
  tip.style.left = (narrow ? width + 4 : axis + 14) + 'px';
  setPinned(null);
}

function showTip(entry, isPinned) {
  plot.querySelector('.tick.on')?.classList.remove('on');
  if (!entry) { tip.hidden = true; return; }
  plot.querySelector('.tick[data-id="' + CSS.escape(entryId(entry.entry)) + '"]')?.classList.add('on');
  tip.hidden = false;
  tip.classList.toggle('pinned', isPinned);
  tip.style.top = position(entry.value) + 'px';
  fill(tip,
    h('span', { class: 'tip-name', text: entry.entry.label }),
    h('span', { class: 'tip-value' }, typeset(format(entry.value, store.state.metric))),
    h('span', { class: 'tip-usage', text: usageText(entry.entry.choice) }),
    isPinned ? h('button', { type: 'button', text: 'Add to comparison', onclick: () => store.add(entry.entry.choice) }) : null);
}

function setPinned(entry) {
  pinned = entry;
  showTip(entry, true);
}

function nearest(event) {
  const y = event.clientY - plot.getBoundingClientRect().top;
  let best = null;
  for (const entry of context) {
    const distance = Math.abs(position(entry.value) - y);
    if (distance < 14 && (!best || distance < best.distance)) best = { entry, distance };
  }
  return best?.entry || null;
}

plot.addEventListener('pointermove', event => { if (!pinned && event.target.classList.contains('hit')) showTip(nearest(event), false); });
plot.addEventListener('pointerleave', () => { if (!pinned) showTip(null); });
plot.addEventListener('click', event => setPinned(event.target.classList.contains('hit') ? nearest(event) : null));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && pinned) setPinned(null); });
document.addEventListener('click', event => { if (pinned && !rail.contains(event.target)) setPinned(null); });

function showView() {
  const ledger = location.hash === '#ledger';
  view('sentence-view').hidden = ledger;
  view('ledger-view').hidden = !ledger;
  for (const button of document.querySelectorAll('.views button')) button.setAttribute('aria-pressed', String((button.dataset.view === 'ledger') === ledger));
  if (!ledger) renderRows();
}
for (const button of document.querySelectorAll('.views button')) {
  button.addEventListener('click', () => { location.hash = button.dataset.view === 'ledger' ? 'ledger' : ''; });
}
window.addEventListener('hashchange', showView);

view('add').addEventListener('click', () => pickActivity({ title: 'Add an activity', store, onPick: entry => store.add(entry) }));
mountLedger({ table: view('ledger-table'), notes: view('notes'), store });
store.subscribe(renderRows);
new ResizeObserver(() => requestAnimationFrame(drawRail)).observe(rowsList);
document.fonts.ready.then(drawRail);
showView();
