// The comparison being edited: its activities, period, measure and assumed grid,
// with the figures the views derive from it. Nothing here touches the page.
import { groups } from './data/catalogue.js';
import { itemEntries, replacementPools, replacementGroup, itemName, validCatalogueChoice } from './entries.js';
import {
  comparisonMetrics, metrics, defaultHorizon, validHorizon, metricForOption, withGridCarbon,
  canEstimateGridCarbon, estimateComparison, displayImpact, raw
} from './model.js';
import { choiceCoverage, sharedCoverage, coverageLabels, sharedWaterNote } from './coverage.js';

const byId = new Map(groups.map(group => [group.id, group]));
const gridGroup = byId.get('au-grid-electricity');
export const grids = gridGroup.options.map(item => ({ id: item.id, label: item.label }));
export const averageGrid = 'national';

let nextUid = 1;
const withUid = choice => ({ ...choice, uid: nextUid++ });

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

const coverageEntry = (item, state) => ({ choice: item, ...resolve(item, state) });

// How many activities have an estimate for each measure, the most widely available first.
export function metricCoverage(state) {
  const counts = new Map(Object.keys(comparisonMetrics).map(key => [key, 0]));
  for (const item of state.choices) {
    const { before } = resolve(item, state);
    for (const key of choiceCoverage({ choice: item, before, after: null })) counts.set(key, counts.get(key) + 1);
  }
  return [...counts].filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]).map(([key, count]) => ({ key, count }));
}

export function metricKeys(state) {
  return metricCoverage(state).map(({ key }) => key);
}

export function sharedKeys(state) {
  return sharedCoverage(state.choices.map(item => coverageEntry(item, state)));
}

export function needsGrid(state) {
  return Boolean(state.grid) || state.choices.some(item => {
    const { before, after } = resolve(item, { ...state, grid: '' });
    return canEstimateGridCarbon(before) || canEstimateGridCarbon(after);
  });
}

// True when assuming a grid would give every activity a greenhouse gas figure.
export function gridCompletesCarbon(state) {
  return !state.grid && !sharedKeys(state).includes('carbon') && sharedKeys({ ...state, grid: averageGrid }).includes('carbon');
}

// Names what a figure counts when the measure combines several source scopes.
export function scopeLabel(option, group, key) {
  if (!option) return '';
  if (key === 'water') return metrics[metricForOption(option, key)]?.label || '';
  if (key === 'carbon' && option.gridEstimate) return 'Grid estimate · electricity only';
  if (key === 'energy') return option.energyScope || group.energyScope || '';
  return '';
}

export function waterScopesDiffer(state) {
  const scopes = state.choices.flatMap(item => {
    const { before, after } = resolve(item, state);
    return [before, after].map(option => metricForOption(option, 'water')).filter(Boolean);
  });
  return new Set(scopes).size > 1;
}

export const format = displayImpact;

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

// The record the calculation dialog expects for one activity and measure.
export function measureEntry(item, key, state, letter) {
  const selection = resolve(item, state);
  return { letter, title: selection.name, choice: item, ...selection, ...estimateComparison(selection.before, selection.after, item, key, state.horizon) };
}

export function measureUnit(entry, key) {
  const basis = Math.abs(entry.current ?? 0) || Math.abs(entry.alternative ?? 0);
  return key === 'energy' && basis > 0 && basis < 1 ? 'Wh' : comparisonMetrics[key].unit;
}

export function alternativePool(item) {
  const group = byId.get(item.group);
  const before = group.options.find(option => option.id === item.before);
  return (replacementPools.get(replacementGroup(group, before)) || []).filter(entry =>
    byId.get(entry.choice.group).singular === group.singular && !(entry.choice.group === item.group && entry.choice.before === item.before));
}

// Changing the activity keeps an alternative only while it still replaces like with like.
export function selectActivity(current, selection) {
  if (!current || current.kind === 'footprint' || selection.kind !== 'footprint') return { ...selection };
  const original = resolve(current, { grid: '' });
  const next = resolve(selection, { grid: '' });
  if (original.group.singular !== next.group.singular ||
      replacementGroup(original.group, original.before) !== replacementGroup(next.group, next.before)) return { ...selection };
  const { uid, ...kept } = current;
  return { ...kept, group: selection.group, before: selection.before, ...(original.after ? { afterGroup: original.afterGroup.id } : {}) };
}

// Describes which measures a picker candidate would share with the other activities.
export function pickerCoverage(state, uid, replacing = false) {
  const current = state.choices.find(item => item.uid === uid);
  const peers = state.choices.filter(item => item.uid !== uid).map(item => coverageEntry(item, state));
  const peerKeys = sharedCoverage(peers);
  const cache = new Map();
  return {
    hasPeers: peers.length > 0,
    describe(entry) {
      if (cache.has(entry)) return cache.get(entry);
      const choice = replacing ? { ...current, kind: 'swap', after: entry.choice.before, afterGroup: entry.choice.group } :
        selectActivity(current, entry.choice);
      const candidate = coverageEntry(choice, state);
      const available = choiceCoverage(candidate);
      const keys = peers.length ? peerKeys.filter(key => available.includes(key)) : available;
      const hint = { keys, labels: coverageLabels(keys), note: sharedWaterNote([candidate, ...peers], keys) };
      cache.set(entry, hint);
      return hint;
    }
  };
}

// Everyday reference points for the scale: general records rather than every product variant.
export const generalEntries = itemEntries.filter(entry =>
  entry.generic || entry.categoryLabel === 'Digital' || entry.choice.group === 'everyday-electricity');

export function entryId(entry) {
  return entry.choice.group + '/' + entry.choice.before;
}

// A catalogue entry at its illustrative schedule.
export function entryTotal(entry, key, state) {
  return estimate({ ...entry.choice, kind: 'footprint', after: null }, key, state).current;
}

export function usesGroup(state, groupId) {
  return state.choices.some(item => item.group === groupId || (item.kind === 'swap' && (item.afterGroup || item.group) === groupId));
}

export function shareState(state) {
  return {
    choices: state.choices.map(({ uid, ...choice }) => choice),
    horizon: state.horizon, sharedOnly: state.sharedOnly, grid: state.grid, metric: state.metric
  };
}

export function createStore() {
  let state = { horizon: { ...defaultHorizon }, metric: 'carbon', grid: '', sharedOnly: false, choices: [] };
  const listeners = new Set();
  const store = {
    get state() { return state; },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    update(change) {
      const next = change(state);
      if (!next || next === state) return;
      const keys = metricKeys(next);
      state = keys.length && !keys.includes(next.metric) ? { ...next, metric: keys[0] } : next;
      for (const listener of listeners) listener(state);
    },
    // Replaces the activities. Settings left out keep their current value, except the measure,
    // which falls back to the most widely available one.
    load({ choices, horizon, metric, grid, sharedOnly }) {
      store.update(current => {
        const next = {
          horizon: horizon ? { amount: horizon.amount, unit: horizon.unit } : current.horizon,
          grid: grid ?? current.grid,
          sharedOnly: sharedOnly ?? current.sharedOnly,
          choices: choices.filter(validCatalogueChoice).map(withUid)
        };
        const keys = metricKeys(next);
        return { ...next, metric: keys.includes(metric) ? metric : keys[0] || 'carbon' };
      });
    },
    setHorizon(horizon) {
      if (!validHorizon(horizon)) return false;
      if (horizon.amount !== state.horizon.amount || horizon.unit !== state.horizon.unit) {
        store.update(current => ({ ...current, horizon: { amount: horizon.amount, unit: horizon.unit } }));
      }
      return true;
    },
    setMetric(metric) { if (metric !== state.metric) store.update(current => ({ ...current, metric })); },
    setGrid(grid) { if (grid !== state.grid) store.update(current => ({ ...current, grid })); },
    setSharedOnly(sharedOnly) { if (sharedOnly !== state.sharedOnly) store.update(current => ({ ...current, sharedOnly })); },
    add(choice) {
      const item = withUid(choice);
      store.update(current => ({ ...current, choices: [...current.choices, item] }));
      return item.uid;
    },
    moveFirst(uid) {
      store.update(current => ({ ...current, choices: [...current.choices].sort((a, b) => (b.uid === uid) - (a.uid === uid)) }));
    },
    remove(uid) { store.update(current => ({ ...current, choices: current.choices.filter(item => item.uid !== uid) })); },
    patch(uid, changes) {
      store.update(current => ({ ...current, choices: current.choices.map(item => {
        if (item.uid !== uid) return item;
        const { uid: kept, ...next } = { ...item, ...changes };
        if (next.period === 'once') next.times = 1;
        return validCatalogueChoice(next) ? { ...next, uid } : item;
      }) }));
    },
    replaceActivity(uid, choice) {
      store.update(current => ({ ...current, choices: current.choices.map(item =>
        item.uid === uid ? { ...selectActivity(item, choice), uid } : item) }));
    },
    setAlternative(uid, kind, choice = null) {
      store.update(current => ({ ...current, choices: current.choices.map(item => {
        if (item.uid !== uid) return item;
        const { afterGroup, ...base } = item;
        if (kind === 'swap' && choice) return { ...base, kind, after: choice.before, afterGroup: choice.group };
        return { ...base, kind: kind === 'skip' ? 'skip' : 'footprint', after: null };
      }) }));
    }
  };
  return store;
}
