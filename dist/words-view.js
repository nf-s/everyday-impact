// The "In words" view: one sentence per activity, ranked beside a scale that also
// marks common activities for context.
import { comparisonMetrics, impactParts, number } from './model.js';
import { h, svg, fill, refocus, evidenceBadge } from './dom.js';
import {
  resolve, estimate, hasAlternative, format, usageText, scopeLabel, waterScopesDiffer, sharedKeys,
  gridCompletesCarbon, averageGrid, generalEntries, entryTotal, entryId
} from './comparison.js';

// An editable phrase inside running text. A span wraps across lines; a button cannot.
function token(content, className, focusKey, action) {
  return h('span', {
    class: 'token ' + className, role: 'button', tabindex: '0', dataset: { focus: focusKey },
    onclick: event => action(event.currentTarget),
    onkeydown: event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      action(event.currentTarget);
    }
  }, content);
}

// The dash stays with the phrase before it, so a line never starts with one.
const dash = () => h('span', { class: 'dash', text: ' — ' });

const lowered = '₀₁₂₃₄₅₆₇₈₉';
// Unit glyphs such as ₂ are missing from the serif, so they are set as real sub and superscripts.
function typeset(text) {
  return text.split(/([₀-₉⁺])/).map(piece =>
    piece === '⁺' ? h('sup', { text: '+' }) : piece && lowered.includes(piece) ? h('sub', { text: String(lowered.indexOf(piece)) }) : piece);
}

function ratio(value, base) {
  if (value === null || base === null || base <= 0 || value < 0) return null;
  if (value === 0) return { figure: '0', label: 'none' };
  const share = value / base;
  if (share > 0.95 && share < 1.05) return { figure: '≈', label: 'the same' };
  const times = share >= 1 ? share : 1 / share;
  return { figure: number(times >= 100 ? Math.round(times) : Math.round(times * 10) / 10) + '×', label: share >= 1 ? 'as much' : 'less' };
}

// Decade labels drop the long unit suffix; the measure is named in the controls.
function decadeLabel(power, key) {
  const label = impactParts(10 ** power * (power < 0 ? 1 - 1e-9 : 1 + 1e-9), key);
  return label.text + ' ' + label.unit.split(' ')[0];
}

export function mountWords({ section, rail, plot, tip, list, notes, store, actions }) {
  const open = new Set();
  let context = [];
  let position = () => 0;
  let pinned = null;

  function sorted(state) {
    const key = state.metric;
    return state.choices.map((item, index) => ({ item, isReference: index === 0, names: resolve(item, state), result: estimate(item, key, state) }))
      .sort((a, b) => (b.result.current ?? -Infinity) - (a.result.current ?? -Infinity));
  }

  function swapLine(item, names, result, key) {
    if (!hasAlternative(item)) return null;
    const share = result.current && result.difference !== null ? Math.round(Math.abs(result.difference) / Math.abs(result.current) * 100) : null;
    const direction = result.difference > 0 ? 'lower' : result.difference < 0 ? 'higher' : '';
    const change = () => actions.chooseAlternative(item);
    const outcome = result.alternative === null ? 'there is no published figure for this measure.' :
      result.current !== null && result.difference === null ? [h('strong', {}, typeset(format(result.alternative, key))), ', counted on a different water measure.'] : [
        h('strong', {}, typeset(format(result.alternative, key))),
        direction && share !== null ? [', ', h('span', { class: direction, text: share + '% ' + direction }), '.'] : '.'
      ];
    return h('p', { class: 'swap' },
      item.kind === 'skip' ? ['If you ', token('skip it', 'name', item.uid + ':alternative', change), ', '] :
        names.after ? ['With ', token(names.alternativeName, 'name', item.uid + ':alternative', change), ' instead, '] :
          [token('Choose an alternative', 'name', item.uid + ':alternative', change), '.'],
      item.kind === 'swap' && !names.after ? null : outcome);
  }

  // Evidence grade, data quality caution and what the figure counts.
  function meta(names, key, state) {
    const { before, group } = names;
    const scope = key === 'water' && !waterScopesDiffer(state) ? '' : scopeLabel(before, group, key);
    const parts = [
      before.evidenceLabel ? evidenceBadge(before.evidenceLabel) : null,
      scope ? h('span', { text: scope }) : null,
      before.qualityWarning ? h('span', { text: before.qualityWarning }) : null
    ].filter(Boolean);
    return parts.length ? h('p', { class: 'meta' }, parts) : null;
  }

  function rowActions(item, isReference) {
    const button = (text, name, action) => h('button', { type: 'button', text, dataset: { focus: item.uid + ':' + name }, onclick: action });
    return h('p', { class: 'actions' },
      hasAlternative(item)
        ? button('Remove the alternative', 'toggle', () => store.setAlternative(item.uid, 'footprint'))
        : button('Try an alternative', 'toggle', () => actions.chooseAlternative(item)),
      isReference ? null : button('Compare everything with this', 'reference', () => store.moveFirst(item.uid)),
      button('Calculation and sources', 'details', event => actions.showDetails(item, store.state.metric, event.currentTarget)),
      button('Remove', 'remove', () => store.remove(item.uid)));
  }

  function renderNotes(state, rows) {
    const key = state.metric;
    const label = comparisonMetrics[key].label.toLowerCase();
    const missing = rows.filter(row => row.result.current === null).length;
    const shared = sharedKeys(state);
    const items = [];
    if (missing && rows.length > 1) {
      items.push(h('li', {}, missing + ' of ' + rows.length + ' activities have no published figure for ' + label + '. ',
        shared.length ? h('button', { type: 'button', text: 'Show ' + comparisonMetrics[shared[0]].label.toLowerCase(), dataset: { focus: 'note:shared' }, onclick: () => store.setMetric(shared[0]) }) :
          'No measure covers every activity.'));
    }
    if (gridCompletesCarbon(state) && (missing || !shared.length)) {
      items.push(h('li', {}, h('button', {
        type: 'button', text: 'Estimate electricity emissions using the Australian average', dataset: { focus: 'note:grid' },
        onclick: () => store.update(current => ({ ...current, grid: averageGrid, metric: 'carbon' }))
      })));
    }
    if (key === 'water' && waterScopesDiffer(state)) items.push(h('li', { text: 'Water volumes have different source scopes. Check the label beside each value.' }));
    if (rows.some(row => row.result.current !== null && row.result.current <= 0)) items.push(h('li', { text: 'Figures at or below zero are left off the scale.' }));
    fill(notes, items,
      h('li', { text: 'Each step on the scale is ten times the one below. Faint lines are common activities at an illustrative schedule. Select one to add it.' }));
  }

  function render() {
    const state = store.state;
    const key = state.metric;
    const focused = section.contains(document.activeElement) ? document.activeElement.dataset.focus : null;
    for (const uid of open) if (!state.choices.some(item => item.uid === uid)) open.delete(uid);
    const base = state.choices.length ? estimate(state.choices[0], key, state).current : null;
    const rows = sorted(state);
    fill(list, rows.map(({ item, isReference, names, result }) => {
      const compared = isReference ? null : ratio(result.current, base);
      const expanded = open.has(item.uid);
      const row = h('li', { class: 'row' + (isReference ? ' reference' : ''), dataset: { uid: String(item.uid) } },
        h('div', { class: 'text' },
          h('p', { class: 'statement' },
            token(names.name, 'name', item.uid + ':name', () => actions.changeActivity(item)),
            dash(), token(usageText(item), 'usage', item.uid + ':usage', anchor => actions.editSchedule(item, anchor)),
            result.current === null ? [dash(), h('span', { class: 'none', text: 'no published figure for this measure' })] : [
              dash(), isReference ? 'comes to ' : null,
              token(typeset(format(result.current, key)), 'value', item.uid + ':value', opener => actions.showDetails(item, key, opener)), isReference ? '.' : null
            ]),
          swapLine(item, names, result, key),
          meta(names, key, state),
          expanded ? rowActions(item, isReference) : null),
        h('div', { class: 'aside' },
          isReference ? (rows.length > 1 ? h('p', { class: 'ratio' }, h('span', { text: 'Reference' })) : null) :
            compared ? h('p', { class: 'ratio' }, h('strong', { text: compared.figure }), h('span', { text: compared.label })) : null,
          h('button', {
            type: 'button', class: 'more', 'aria-expanded': String(expanded), 'aria-label': (expanded ? 'Fewer options for ' : 'More options for ') + names.name,
            dataset: { focus: item.uid + ':more' },
            onclick: () => { if (expanded) open.delete(item.uid); else open.add(item.uid); render(); }
          }, expanded ? 'Less' : 'More')));
      row.addEventListener('pointerenter', () => plot.querySelector('.mark[data-uid="' + item.uid + '"]')?.classList.add('on'));
      row.addEventListener('pointerleave', () => plot.querySelector('.mark[data-uid="' + item.uid + '"]')?.classList.remove('on'));
      return row;
    }), rows.length ? null : h('li', { class: 'row empty', text: 'Add an activity to see its estimate.' }));
    renderNotes(state, rows);
    drawRail();
    if (focused) refocus(focused);
  }

  function drawRail() {
    if (section.hidden || section.offsetParent === null) return;
    const state = store.state;
    const key = state.metric;
    const rows = sorted(state).filter(row => row.result.current > 0);
    const chosen = new Set(state.choices.map(item => item.group + '/' + item.before));
    context = generalEntries.filter(entry => !chosen.has(entryId(entry)))
      .map(entry => ({ entry, value: entryTotal(entry, key, state) })).filter(entry => entry.value > 0);

    const narrow = window.matchMedia('(max-width: 720px)').matches;
    const width = rail.clientWidth;
    const axis = narrow ? width - 18 : width - 78;
    const height = Math.max(list.offsetHeight, narrow ? 420 : 540);
    const values = [...rows.flatMap(row => [row.result.current, row.result.alternative]).filter(value => value > 0), ...context.map(entry => entry.value)];
    const high = values.length ? Math.ceil(Math.log10(Math.max(...values)) + 0.1) : 1;
    const low = values.length ? Math.min(Math.floor(Math.log10(Math.min(...values)) - 0.1), high - 3) : -2;
    const decades = high - low;
    const top = 14;
    const step = (height - top * 2) / decades;
    position = value => top + (high - Math.log10(value)) * step;
    const origin = rail.getBoundingClientRect().top;
    // Label every decade while there is room, then every second or third one.
    const every = Math.max(1, Math.ceil(16 / step));

    rail.style.height = height + 'px';
    plot.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    plot.setAttribute('width', width);
    plot.setAttribute('height', height);
    fill(plot,
      Array.from({ length: decades + 1 }, (unused, index) => {
        const y = top + index * step;
        return [
          svg('line', { class: 'decade-mark', x1: axis - (narrow ? 8 : 24), x2: axis, y1: y, y2: y }),
          index % every ? null : svg('text', { class: 'decade', x: axis - (narrow ? 11 : 30), y: y + 4, 'text-anchor': 'end', text: decadeLabel(high - index, key) })
        ];
      }),
      context.map(entry => svg('line', { class: 'tick', x1: axis - (narrow ? 7 : 20), x2: axis - 3, y1: position(entry.value), y2: position(entry.value), 'data-id': entryId(entry.entry) })),
      svg('line', { class: 'axis', x1: axis, x2: axis, y1: top - 8, y2: height - top + 8 }),
      rows.map(({ item, isReference, result }) => {
        const y = position(result.current);
        const statement = list.querySelector('.row[data-uid="' + item.uid + '"] .statement');
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

  store.subscribe(render);
  new ResizeObserver(() => requestAnimationFrame(drawRail)).observe(list);
  document.fonts.ready.then(drawRail);
  return render;
}
