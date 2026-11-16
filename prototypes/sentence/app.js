import { createStore, resolve, estimate, hasAlternative, format, usageText, number } from '../shared/engine.js';
import { h, fill, harness, settings, pickActivity, pickAlternative, editSchedule, showDetails } from '../shared/widgets.js';

const store = createStore();
harness('sentence', store);

const view = id => document.getElementById(id);
const controls = settings(store);
view('frame').append(
  h('span', { class: 'frame-line' }, controls.metric, h('span', { text: 'over' }), controls.amount, controls.unit),
  controls.gridField);

const open = new Set();

// An editable phrase inside running text. A span wraps across lines; a button cannot.
function token(text, className, action) {
  return h('span', {
    class: 'token ' + className, role: 'button', tabindex: '0', text,
    onclick: event => action(event.currentTarget),
    onkeydown: event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      action(event.currentTarget);
    }
  });
}

function nameToken(item, names) {
  return token(names.name, 'name', () => pickActivity({ title: 'Change activity', store, onPick: entry => store.replaceActivity(item.uid, entry) }));
}

function usageToken(item) {
  return token(usageText(item), 'usage', anchor => editSchedule({ item, store, anchor }));
}

function valueToken(item, value, key) {
  return token(format(value, key), 'value', () => showDetails({ item, store, key }));
}

function swapLine(item, names, result, key) {
  if (!hasAlternative(item)) return null;
  const share = result.current ? Math.round(Math.abs(result.difference) / Math.abs(result.current) * 100) : null;
  const direction = result.difference > 0 ? 'lower' : result.difference < 0 ? 'higher' : '';
  return h('p', { class: 'swap' },
    item.kind === 'skip' ? ['If you ', token('skip it', 'name', () => pickAlternative({ item, store })), ', '] :
      ['With ', token(names.alternativeName, 'name', () => pickAlternative({ item, store })), ' instead, '],
    result.alternative === null ? 'there is no estimate for this measure.' : [
      h('strong', { text: format(result.alternative, key) }),
      direction && share !== null ? [' — ', h('span', { class: direction, text: share + '% ' + direction }), '.'] : '.'
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
  if (value === null || base === null || base <= 0 || value < 0) return { figure: '–', label: 'no estimate' };
  if (value === 0) return { figure: '0', label: 'none' };
  const share = value / base;
  if (share > 0.95 && share < 1.05) return { figure: '≈', label: 'about the same' };
  const times = share >= 1 ? share : 1 / share;
  const figure = number(times >= 100 ? Math.round(times) : Math.round(times * 10) / 10) + '×';
  return { figure, label: share >= 1 ? 'as much' : 'less' };
}

function render() {
  const state = store.state;
  const key = state.metric;
  controls.sync();
  const [reference, ...rest] = state.choices;
  if (!reference) {
    view('reference').replaceChildren(h('p', { class: 'statement', text: 'No activities yet.' }));
    view('others').replaceChildren();
    return;
  }
  const names = resolve(reference, state);
  const result = estimate(reference, key, state);
  fill(view('reference'),
    h('p', { class: 'statement' },
      nameToken(reference, names), ' — ', usageToken(reference), ' — ',
      result.current === null ? 'has no estimate for this measure.' : ['comes to ', valueToken(reference, result.current, key), '.']),
    swapLine(reference, names, result, key),
    actions(reference, true));

  const lines = rest.map(item => ({ item, names: resolve(item, state), result: estimate(item, key, state) }))
    .sort((a, b) => (b.result.current ?? -Infinity) - (a.result.current ?? -Infinity));
  view('others-title').hidden = !lines.length;
  view('others').replaceChildren(...lines.map(({ item, names: lineNames, result: line }) => {
    const compared = ratio(line.current, result.current);
    const expanded = open.has(item.uid);
    return h('li', {},
      h('p', { class: 'ratio' }, h('strong', { text: compared.figure }), h('span', { text: compared.label })),
      h('div', { class: 'body' },
        h('p', { class: 'line' }, nameToken(item, lineNames), ' — ', usageToken(item),
          line.current === null ? null : [' — ', valueToken(item, line.current, key)]),
        swapLine(item, lineNames, line, key),
        expanded ? actions(item, false) : null),
      h('button', { type: 'button', class: 'more', 'aria-expanded': String(expanded), 'aria-label': 'More for ' + lineNames.name,
        onclick: () => { if (expanded) open.delete(item.uid); else open.add(item.uid); render(); } }, expanded ? 'Less' : 'More'));
  }));
}

view('add').addEventListener('click', () => pickActivity({ title: 'Add an activity', store, onPick: entry => store.add(entry) }));
store.subscribe(render);
render();
