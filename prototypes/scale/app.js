import {
  createStore, resolve, estimate, hasAlternative, format, usageText, ratioText, generalEntries, entryTotal, entryId, horizonLabel
} from '../shared/engine.js';
import { h, svg, fill, harness, settings, pickActivity, openSheet } from '../shared/widgets.js';

const store = createStore();
harness('scale', store);

const view = id => document.getElementById(id);
const ladder = view('ladder');
const plot = view('plot');
const tip = view('tip');
const controls = settings(store);
view('frame').append(controls.metric, h('span', { text: 'over' }), controls.amount, controls.unit, controls.gridField);

let context = [];
let position = () => 0;
let pinned = null;

// Keeps labels readable when several marks sit close together on the scale.
function spread(labels, top, bottom, gap) {
  const placed = [...labels].sort((a, b) => a.y - b.y);
  let edge = top;
  for (const label of placed) {
    label.top = Math.max(label.y - label.height / 2, edge);
    edge = label.top + label.height + gap;
  }
  edge = bottom;
  for (const label of [...placed].reverse()) {
    label.top = Math.min(label.top, edge - label.height);
    edge = label.top - gap;
  }
  return placed;
}

// Nudges exact powers of ten off a unit boundary so 0.1 kg reads as 100 g.
function decadeLabel(power, key) {
  return format(10 ** power * (power < 0 ? 1 - 1e-9 : 1 + 1e-9), key);
}

function showTip(entry, isPinned) {
  if (!entry) { tip.hidden = true; return; }
  tip.hidden = false;
  tip.classList.toggle('pinned', isPinned);
  tip.style.top = position(entry.value) + 'px';
  fill(tip,
    h('span', { class: 'tip-name', text: entry.entry.label }),
    h('span', { class: 'tip-value', text: format(entry.value, store.state.metric) }),
    h('span', { class: 'tip-usage', text: usageText(entry.entry.choice) + ' · ' + entry.entry.categoryLabel }),
    isPinned ? h('button', { type: 'button', text: 'Add to comparison', onclick: () => { pinned = null; store.add(entry.entry.choice); } }) : null);
}

function nearest(y) {
  let best = null;
  for (const entry of context) {
    const distance = Math.abs(position(entry.value) - y);
    if (distance < 14 && (!best || distance < best.distance)) best = { entry, distance };
  }
  return best?.entry || null;
}

function render() {
  const state = store.state;
  const key = state.metric;
  controls.sync();
  const rows = state.choices.map(item => ({ item, names: resolve(item, state), result: estimate(item, key, state) }));
  const drawn = rows.filter(row => row.result.current > 0);
  const missing = rows.filter(row => !drawn.includes(row));
  const chosen = new Set(state.choices.map(item => item.group + '/' + item.before));
  context = view('context').checked ? generalEntries.filter(entry => !chosen.has(entryId(entry)))
    .map(entry => ({ entry, value: entryTotal(entry, key, state) })).filter(entry => entry.value > 0) : [];

  const values = [...drawn.flatMap(row => [row.result.current, row.result.alternative]).filter(value => value > 0), ...context.map(entry => entry.value)];
  const narrow = ladder.clientWidth < 620;
  const axis = narrow ? 104 : 300;
  const high = values.length ? Math.ceil(Math.log10(Math.max(...values)) + 0.15) : 1;
  const low = values.length ? Math.min(Math.floor(Math.log10(Math.min(...values)) - 0.15), high - 3) : -2;
  const decades = high - low;
  const step = Math.max(58, Math.min(108, (window.innerHeight - 250) / decades));
  const top = 28;
  const height = top + decades * step + 36;
  const width = ladder.clientWidth;
  position = value => top + (high - Math.log10(value)) * step;

  const labels = spread(drawn.map(row => ({
    row, y: position(row.result.current), height: hasAlternative(row.item) && row.result.alternative !== null ? 64 : 46
  })), 4, height - 4, 6);

  ladder.style.height = height + 'px';
  plot.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  plot.setAttribute('width', width);
  plot.setAttribute('height', height);
  fill(plot,
    Array.from({ length: decades + 1 }, (unused, index) => {
      const y = top + index * step;
      return [
        svg('line', { class: 'grid', x1: narrow ? 0 : 84, x2: width, y1: y, y2: y }),
        svg('text', { class: 'decade', x: narrow ? 0 : 72, y: narrow ? y - 6 : y + 4, 'text-anchor': narrow ? 'start' : 'end', text: decadeLabel(high - index, key) })
      ];
    }),
    context.map(entry => svg('line', { class: 'tick', x1: axis - 22, x2: axis - 5, y1: position(entry.value), y2: position(entry.value), 'data-id': entryId(entry.entry) })),
    svg('line', { class: 'axis', x1: axis, x2: axis, y1: top - 14, y2: height - 22 }),
    labels.map(({ row, y, top: labelTop, height: labelHeight }) => {
      const centre = labelTop + Math.min(labelHeight / 2, 22);
      const alternative = row.result.alternative > 0 ? position(row.result.alternative) : null;
      return [
        alternative === null ? null : [
          svg('line', { class: 'change', x1: axis, x2: axis, y1: y, y2: alternative }),
          svg('circle', { class: 'dot alternative', cx: axis, cy: alternative, r: 5 })
        ],
        svg('polyline', { class: 'leader', points: [axis + 8, y, axis + 26, y, axis + 44, centre, axis + 54, centre].join(' ') }),
        svg('circle', { class: 'dot', cx: axis, cy: y, r: 6 })
      ];
    }),
    svg('rect', { class: 'hit', x: axis - 44, y: 0, width: 44, height }));

  fill(view('marks'), labels.map(({ row, top: labelTop, height: labelHeight }) => {
    const { item, names, result } = row;
    const share = result.difference !== null && result.current ? Math.round(result.difference / result.current * 100) : null;
    return h('button', { type: 'button', class: 'mark', style: 'top:' + labelTop + 'px;left:' + (axis + 60) + 'px;height:' + labelHeight + 'px', onclick: () => openSheet({ item, store }) },
      h('span', { class: 'name', text: names.name }),
      h('span', { class: 'value' }, format(result.current, key), h('span', { class: 'usage', text: usageText(item) })),
      hasAlternative(item) && result.alternative !== null ? h('span', { class: 'swap' },
        h('span', { class: 'ring' }), (item.kind === 'skip' ? 'Skipped' : names.alternativeName) + ' · ' + format(result.alternative, key),
        share ? ' · ' + (share > 0 ? '−' : '+') + Math.abs(share) + '%' : '') : null);
  }));

  const ordered = drawn.map(row => row.result.current).sort((a, b) => b - a);
  view('range').textContent = ordered.length > 1 && ordered[0] / ordered[ordered.length - 1] >= 1.05
    ? 'The largest is ' + ratioText(ordered[0] / ordered[ordered.length - 1]).replace('×', '') + ' times the smallest, over ' + horizonLabel(state.horizon) + '.' : '';
  view('missing').hidden = !missing.length;
  fill(view('missing'), 'Not on this scale: ',
    missing.map((row, index) => [index ? ', ' : '', h('button', { type: 'button', text: row.names.name, onclick: () => openSheet({ item: row.item, store }) })]));
  pinned = null;
  showTip(null);
}

function highlight(entry) {
  plot.querySelector('.tick.on')?.classList.remove('on');
  if (entry) plot.querySelector('.tick[data-id="' + CSS.escape(entryId(entry.entry)) + '"]')?.classList.add('on');
}

plot.addEventListener('pointermove', event => {
  if (pinned || !event.target.classList.contains('hit')) return;
  const entry = nearest(event.clientY - plot.getBoundingClientRect().top);
  highlight(entry);
  showTip(entry, false);
});
plot.addEventListener('pointerleave', () => { if (!pinned) { highlight(null); showTip(null); } });
plot.addEventListener('click', event => {
  pinned = event.target.classList.contains('hit') ? nearest(event.clientY - plot.getBoundingClientRect().top) : null;
  highlight(pinned);
  showTip(pinned, true);
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && pinned) { pinned = null; highlight(null); showTip(null); } });

view('context').addEventListener('change', render);
view('add').addEventListener('click', () => pickActivity({ title: 'Add activity', store, onPick: entry => store.add(entry) }));
store.subscribe(render);
window.addEventListener('resize', render);
render();
