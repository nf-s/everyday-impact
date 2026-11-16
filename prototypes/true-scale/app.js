import { createStore, resolve, estimate, hasAlternative, format, number } from '../shared/engine.js';
import { h, fill, harness, settings, pickActivity, openSheet } from '../shared/widgets.js';

const store = createStore();
harness('true-scale', store);

const view = id => document.getElementById(id);
const stage = view('stage');
const controls = settings(store);
view('frame').append(controls.metric, h('span', { text: 'over' }), controls.amount, controls.unit, controls.gridField);

const smallest = 5;

// Area is proportional to the figure, so a side is its square root.
function side(value, largest, full) {
  return Math.sqrt(Math.max(value, 0) / largest) * full;
}

function square(row, largest, full, key) {
  const { item, names, result } = row;
  const current = side(result.current, largest, full);
  const alternative = result.alternative === null ? null : side(result.alternative, largest, full);
  const box = Math.max(current, alternative ?? 0, 2);
  return h('li', { class: 'item' },
    h('button', { type: 'button', class: 'plot', style: 'height:' + full + 'px', 'aria-label': names.name + ', ' + format(result.current, key), onclick: () => openSheet({ item, store }) },
      h('span', { class: 'box', style: 'width:' + box + 'px;height:' + box + 'px' },
        h('span', { class: 'area current', style: 'width:' + Math.max(current, 1.5) + 'px;height:' + Math.max(current, 1.5) + 'px' }),
        alternative === null ? null : h('span', { class: 'area alternative', style: 'width:' + Math.max(alternative, 1.5) + 'px;height:' + Math.max(alternative, 1.5) + 'px' }))),
    h('p', { class: 'label' },
      h('span', { class: 'name', text: names.name }),
      h('span', { class: 'value', text: format(result.current, key) }),
      hasAlternative(item) && result.alternative !== null
        ? h('span', { class: 'swap', text: (item.kind === 'skip' ? 'Skipped: ' : names.alternativeName + ': ') + format(result.alternative, key) }) : null));
}

function render() {
  const state = store.state;
  const key = state.metric;
  controls.sync();
  const rows = state.choices.map(item => ({ item, names: resolve(item, state), result: estimate(item, key, state) }));
  const drawn = rows.filter(row => row.result.current !== null && row.result.current > 0)
    .sort((a, b) => b.result.current - a.result.current);
  const missing = rows.filter(row => !drawn.includes(row));
  const full = Math.max(120, Math.min(300, stage.clientWidth * 0.55));
  const size = row => Math.max(row.result.current, row.result.alternative ?? 0);

  // Each frame is drawn at one scale. Anything too small to see moves to an enlarged frame.
  const frames = [];
  let remaining = drawn;
  while (remaining.length) {
    const largest = Math.max(...remaining.map(size));
    const visible = remaining.filter(row => side(size(row), largest, full) >= smallest);
    frames.push({ largest, rows: visible });
    remaining = remaining.filter(row => !visible.includes(row));
  }

  fill(stage, frames.map((frame, index) => {
    const enlarged = frames[0].largest / frame.largest;
    const hidden = frames.slice(index + 1).reduce((count, later) => count + later.rows.length, 0);
    const dot = hidden ? side(frames[index + 1].largest, frame.largest, full) : 0;
    return h('section', { class: 'frame' },
      index ? h('p', { class: 'frame-note' }, h('strong', { text: 'Enlarged ' + number(Math.round(enlarged)) + ' times' }), ' so the next ' + (frame.rows.length === 1 ? 'square is' : 'squares are') + ' visible') : null,
      h('ol', { class: 'squares' }, frame.rows.map(row => square(row, frame.largest, full, key))),
      hidden ? h('p', { class: 'rest' },
        h('span', { class: 'speck', style: 'width:' + Math.max(dot, 1) + 'px;height:' + Math.max(dot, 1) + 'px' }),
        hidden + ' more at this size. Too small to read, so ' + (hidden === 1 ? 'it is' : 'they are') + ' enlarged below.') : null);
  }));

  view('key').replaceChildren(
    h('span', { class: 'swatch current' }), 'Area shows the total',
    ...(drawn.some(row => row.result.alternative !== null) ? [h('span', { class: 'swatch alternative' }), 'With the alternative'] : []));
  view('key').hidden = !drawn.length;
  view('missing').hidden = !missing.length;
  fill(view('missing'), 'No estimate for this measure: ',
    missing.map((row, index) => [index ? ', ' : '', h('button', { type: 'button', text: row.names.name, onclick: () => openSheet({ item: row.item, store }) })]));
}

view('add').addEventListener('click', () => pickActivity({ title: 'Add activity', store, onPick: entry => store.add(entry) }));
store.subscribe(render);
window.addEventListener('resize', render);
render();
