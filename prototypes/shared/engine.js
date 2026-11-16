// Shared calculation layer for the design prototypes. It reads the production
// catalogue and model so every prototype shows the same figures as the calculator.
import { groups } from '../../dist/data/catalogue.js';
import { itemEntries, replacementPools, replacementGroup, itemName, defaultChoice, validCatalogueChoice } from '../../dist/entries.js';
import {
  comparisonMetrics, metrics, periods, horizonUnits, defaultHorizon, validHorizon, horizonLabel,
  occurrencesFor, validAmount, metricForOption, withGridCarbon, canEstimateGridCarbon, estimateComparison, number, raw
} from '../../dist/model.js';
import { defaultUsage } from '../../dist/defaults.js';
import { choiceCoverage } from '../../dist/coverage.js';

export { comparisonMetrics, periods, horizonUnits, horizonLabel, validHorizon, validAmount, number, raw, occurrencesFor };

const byId = new Map(groups.map(group => [group.id, group]));
const gridGroup = byId.get('au-grid-electricity');
export const grids = gridGroup.options.map(item => ({ id: item.id, label: item.label }));

const storageKey = 'everyday-impact-prototypes-v1';
let nextUid = 1;

function choice(group, before, overrides = {}) {
  const groupRecord = byId.get(group);
  const item = groupRecord.options.find(option => option.id === before);
  return { ...defaultChoice(groupRecord, item), ...overrides };
}

export const examples = [
  { id: 'mixed', label: 'Flight, beef, commute, phone and AI prompts', choices: () => [
    choice('return-flight', 'paris-new-york-return'),
    choice('food-products', 'beef-steak', { kind: 'swap', after: 'tofu', afterGroup: 'food-products' }),
    choice('surface-travel', 'petrol-car-solo', { kind: 'swap', after: 'national-rail', afterGroup: 'surface-travel' }),
    choice('digital-devices', 'generic-smartphone'),
    choice('ai-request', 'gemini-text-2025')] },
  { id: 'flight-diet', label: 'Flight and diet', choices: () => [
    choice('return-flight', 'paris-new-york-return', { kind: 'skip' }),
    choice('uk-diets', 'low-meat', { kind: 'swap', after: 'vegan', afterGroup: 'uk-diets' })] },
  { id: 'image-light', label: 'Generate an image and light an LED bulb', grid: 'national', choices: () => [
    choice('ai-image-generation', 'luccioni-2024-image-generation'),
    choice('everyday-electricity', 'led-hour'),
    choice('everyday-electricity', 'kettle-three-minutes')] },
  { id: 'household-water', label: 'Showering and laundry', metric: 'water', choices: () => [
    choice('shower', 'higher-9l', { kind: 'swap', after: 'efficient-6l', afterGroup: 'shower' }),
    choice('laundry-load', 'washer-6kg-3star', { kind: 'swap', after: 'washer-6kg-4star', afterGroup: 'laundry-load' }),
    choice('toilet-flush', byId.get('toilet-flush').options[0].id)] },
  { id: 'meals', label: 'Beef, chicken, tofu and lentils', choices: () => [
    choice('food-products', 'beef-steak'),
    choice('food-products', 'poultry-meat'),
    choice('food-products', 'tofu'),
    choice('food-products', 'other-pulses')] }
];

function exampleState(example) {
  return {
    horizon: { ...defaultHorizon },
    metric: example.metric || 'carbon',
    grid: example.grid || '',
    choices: example.choices().map(item => ({ ...item, uid: nextUid++ }))
  };
}

function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved || !Array.isArray(saved.choices) || !validHorizon(saved.horizon)) return null;
    const choices = saved.choices.filter(validCatalogueChoice).map(item => ({ ...item, uid: nextUid++ }));
    if (!choices.length) return null;
    return {
      horizon: saved.horizon,
      metric: Object.hasOwn(comparisonMetrics, saved.metric) ? saved.metric : 'carbon',
      grid: grids.some(grid => grid.id === saved.grid) ? saved.grid : '',
      choices
    };
  } catch {
    return null;
  }
}

// One comparison is shared by every prototype, so switching design keeps the data.
export function createStore() {
  let state = restore() || exampleState(examples[0]);
  const listeners = new Set();
  const save = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ ...state, choices: state.choices.map(({ uid, ...rest }) => rest) }));
    } catch {
      // Storage can be unavailable in private windows; the page still works.
    }
  };
  const store = {
    get state() { return state; },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    update(change) {
      const next = change(state);
      if (!next) return;
      state = next;
      if (!metricKeys(state).includes(state.metric)) state = { ...state, metric: metricKeys(state)[0] || 'carbon' };
      save();
      for (const listener of listeners) listener(state);
    },
    setHorizon(horizon) { if (validHorizon(horizon)) store.update(current => ({ ...current, horizon: { ...horizon } })); },
    setMetric(metric) { store.update(current => ({ ...current, metric })); },
    setGrid(grid) { store.update(current => ({ ...current, grid })); },
    loadExample(id) {
      const example = examples.find(item => item.id === id);
      if (example) store.update(() => exampleState(example));
    },
    add(entryChoice) {
      const uid = nextUid++;
      store.update(current => ({ ...current, choices: [...current.choices, { ...entryChoice, uid }] }));
      return uid;
    },
    moveFirst(uid) {
      store.update(current => ({ ...current, choices: [...current.choices].sort((a, b) => (b.uid === uid) - (a.uid === uid)) }));
    },
    remove(uid) { store.update(current => ({ ...current, choices: current.choices.filter(item => item.uid !== uid) })); },
    patch(uid, changes) {
      store.update(current => {
        const choices = current.choices.map(item => {
          if (item.uid !== uid) return item;
          const next = { ...item, ...changes };
          if (next.period === 'once') next.times = 1;
          return validCatalogueChoice(next) ? next : item;
        });
        return { ...current, choices };
      });
    },
    // Changing the activity keeps the schedule only when the unit still means the same thing.
    replaceActivity(uid, entryChoice) {
      store.update(current => ({ ...current, choices: current.choices.map(item => {
        if (item.uid !== uid) return item;
        const sameUnit = byId.get(item.group).singular === byId.get(entryChoice.group).singular && item.group === entryChoice.group;
        return sameUnit && item.kind === 'footprint'
          ? { ...item, group: entryChoice.group, before: entryChoice.before }
          : { ...entryChoice, uid };
      }) }));
    },
    setAlternative(uid, kind, entryChoice = null) {
      store.update(current => ({ ...current, choices: current.choices.map(item => {
        if (item.uid !== uid) return item;
        const { afterGroup, ...base } = item;
        if (kind === 'swap' && entryChoice) return { ...base, kind, after: entryChoice.before, afterGroup: entryChoice.group };
        return { ...base, kind: kind === 'skip' ? 'skip' : 'footprint', after: null };
      }) }));
    }
  };
  return store;
}

export function resolve(item, state) {
  const group = byId.get(item.group);
  const grid = gridGroup.options.find(option => option.id === state.grid);
  const before = group.options.find(option => option.id === item.before);
  const afterGroup = item.afterGroup ? byId.get(item.afterGroup) : group;
  const after = item.kind === 'swap' && item.after ? afterGroup.options.find(option => option.id === item.after) : null;
  return {
    group, afterGroup,
    before: withGridCarbon(before, grid),
    after: after ? withGridCarbon(after, grid) : null,
    name: itemName(group, before),
    alternativeName: item.kind === 'skip' ? 'Skip this activity' : after ? itemName(afterGroup, after) : ''
  };
}

export function estimate(item, key, state) {
  const { before, after } = resolve(item, state);
  return estimateComparison(before, after, item, key, state.horizon);
}

// The figure that counts toward a total once alternatives are applied.
export function applied(result) {
  return result.alternative === null ? result.current : result.alternative;
}

export function hasAlternative(item) {
  return item.kind === 'swap' || item.kind === 'skip';
}

export function metricKeys(state) {
  const counts = new Map(Object.keys(comparisonMetrics).map(key => [key, 0]));
  for (const item of state.choices) {
    const { before } = resolve(item, state);
    for (const key of choiceCoverage({ choice: item, before, after: null })) counts.set(key, counts.get(key) + 1);
  }
  return [...counts].filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]).map(([key]) => key);
}

export function needsGrid(state) {
  return state.choices.some(item => {
    const group = byId.get(item.group);
    return canEstimateGridCarbon(group.options.find(option => option.id === item.before));
  });
}

// Water rows combine several source scopes; this names the one behind a figure.
export function scopeLabel(item, key, state) {
  if (key !== 'water') return '';
  const source = metricForOption(resolve(item, state).before, key);
  return source ? metrics[source].label : '';
}

export function parts(value, key) {
  if (value === null || value === undefined || !Number.isFinite(value)) return { text: '–', unit: '' };
  const magnitude = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  const unit = comparisonMetrics[key].unit;
  if (key === 'carbon') {
    if (magnitude >= 1000) return { text: sign + number(magnitude / 1000), unit: 't CO₂e' };
    if (magnitude > 0 && magnitude < 0.1) return { text: sign + number(magnitude * 1000), unit: 'g CO₂e' };
  }
  if (key === 'energy') {
    if (magnitude >= 1000) return { text: sign + number(magnitude / 1000), unit: 'MWh' };
    if (magnitude > 0 && magnitude < 0.1) return { text: sign + number(magnitude * 1000), unit: 'Wh' };
  }
  if (key === 'water') {
    if (magnitude >= 1000000) return { text: sign + number(magnitude / 1000000), unit: 'ML' };
    if (magnitude >= 10000) return { text: sign + number(magnitude / 1000), unit: 'kL' };
    if (magnitude > 0 && magnitude < 1) return { text: sign + number(magnitude * 1000), unit: 'mL' };
  }
  return { text: sign + number(magnitude), unit };
}

export function format(value, key) {
  const { text, unit } = parts(value, key);
  return unit ? text + ' ' + unit : text;
}

export function ratioText(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return '';
  if (ratio >= 100) return number(Math.round(ratio)) + '×';
  if (ratio >= 10) return number(Math.round(ratio * 10) / 10) + '×';
  return number(Math.round(ratio * 100) / 100) + '×';
}

export function amountUnit(item) {
  const group = byId.get(item.group);
  if (group.singular === 'kg') return { scale: 1000, label: 'g', singular: 'g' };
  return { scale: 1, label: group.plural, singular: group.singular };
}

export function amountText(item) {
  const unit = amountUnit(item);
  const shown = Number((item.amount * unit.scale).toPrecision(12));
  return raw(shown) + ' ' + (shown === 1 ? unit.singular : unit.label);
}

const cadence = { daily: 'day', weekly: 'week', monthly: 'month' };
const counts = ['', 'once', 'twice'];
export function frequencyText(item) {
  if (item.period === 'once') return 'once';
  const times = item.times <= 2 && Number.isInteger(item.times) ? counts[item.times] : raw(item.times) + ' times';
  return times + ' a ' + cadence[item.period];
}

export function usageText(item) {
  return amountText(item) + ', ' + frequencyText(item);
}

export function occurrences(item, state) {
  return item.period === 'once' ? 1 : occurrencesFor(item.period, state.horizon) * item.times;
}

// The arithmetic behind one figure, written so it can be checked by hand.
export function calculation(item, key, state, side = 'current') {
  const { before, after, group, afterGroup } = resolve(item, state);
  const option = side === 'alternative' ? after : before;
  if (!option) return null;
  const source = metricForOption(option, key);
  if (source === null) return null;
  const factor = option.values[source];
  const unitGroup = side === 'alternative' ? afterGroup : group;
  const count = occurrences(item, state);
  return {
    factor, count,
    factorText: raw(Number(factor.toPrecision(6))) + ' ' + metrics[source].unit + ' per ' + unitGroup.singular,
    amountText: raw(item.amount) + ' ' + (item.amount === 1 ? unitGroup.singular : unitGroup.plural),
    countText: item.period === 'once' ? 'once' : raw(Number(count.toPrecision(6))) + ' occurrences in ' + horizonLabel(state.horizon),
    total: factor * item.amount * count,
    gridEstimate: key === 'carbon' && option.gridEstimate ? option.gridEstimate.label : ''
  };
}

export function evidence(item, state) {
  const { group, before, after, afterGroup } = resolve(item, state);
  const describe = (groupRecord, option) => ({
    name: itemName(groupRecord, option),
    note: option.note || '',
    reasoning: option.reasoning || '',
    evidenceLabel: option.evidenceLabel || '',
    assumption: defaultUsage(groupRecord, option).description,
    sourceNote: groupRecord.sourceNote || '',
    sources: [...new Map([...(option.sources || []), ...(groupRecord.sources || [])].map(source => [source.url, source])).values()]
  });
  return { current: describe(group, before), alternative: after ? describe(afterGroup, after) : null };
}

const titleCase = text => text.charAt(0).toUpperCase() + text.slice(1);
const general = entry => entry.generic || entry.categoryLabel === 'Digital' || entry.choice.group === 'everyday-electricity';

export const entries = itemEntries;
export const generalEntries = itemEntries.filter(general);
export const categories = [...new Set(itemEntries.map(entry => entry.categoryLabel))];

function words(text) {
  return String(text || '').toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').match(/[a-z0-9]+/g) || [];
}

const indexes = new WeakMap();
function indexFor(pool) {
  if (!indexes.has(pool)) {
    indexes.set(pool, pool.map((entry, position) => {
      const title = words(entry.label);
      return { entry, position, title, all: [...title, ...words(entry.groupLabel), ...words(entry.categoryLabel), ...words((entry.categoryPath || []).join(' ')), ...words(entry.aliases)] };
    }));
  }
  return indexes.get(pool);
}

export function search(query, pool = itemEntries, limit = 40) {
  const terms = words(query);
  if (!terms.length) return [];
  const ranked = [];
  for (const item of indexFor(pool)) {
    if (!terms.every(term => item.all.some(word => word.startsWith(term)))) continue;
    const exact = item.title.join(' ') === terms.join(' ');
    const score = (exact ? 100 : 0) + (general(item.entry) ? 4 : 0) + terms.reduce((sum, term) => sum +
      (item.title.includes(term) ? 10 : item.title.some(word => word.startsWith(term)) ? 6 : item.all.includes(term) ? 3 : 1), 0);
    ranked.push({ item, score });
  }
  ranked.sort((a, b) => b.score - a.score || a.item.position - b.item.position);
  return ranked.slice(0, limit).map(result => result.item.entry);
}

export function browse(pool = itemEntries, category = '') {
  const listed = pool.filter(entry => (!category || entry.categoryLabel === category));
  const common = listed.filter(general);
  return common.length ? common : listed.slice(0, 60);
}

export function alternativePool(item) {
  const group = byId.get(item.group);
  const before = group.options.find(option => option.id === item.before);
  const pool = replacementPools.get(replacementGroup(group, before)) || [];
  return pool.filter(entry => byId.get(entry.choice.group).singular === group.singular &&
    !(entry.choice.group === item.group && entry.choice.before === item.before));
}

// A catalogue entry scheduled at its illustrative default, for context marks.
export function entryTotal(entry, key, state) {
  return estimate({ ...entry.choice, kind: 'footprint', after: null }, key, state).current;
}

export function entryId(entry) {
  return entry.choice.group + '/' + entry.choice.before;
}

export function categoryOf(item) {
  return titleCase(byId.get(item.group).category);
}
