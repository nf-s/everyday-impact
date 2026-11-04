import { comparisonMetrics, metricForOption, validAmount } from './model.js';

// Resolve effective options before calling these helpers (including any explicit scenarios).
export function choiceCoverage({ choice, before, after }) {
  if (!before || !validAmount(choice.amount) || !validAmount(choice.times) || (choice.kind === 'swap' && !after)) return [];
  return Object.keys(comparisonMetrics).filter(key => {
    const source = metricForOption(before, key);
    return source !== null && (choice.kind !== 'swap' || metricForOption(after, key) === source);
  });
}

export function sharedCoverage(entries) {
  if (!entries.length) return [];
  const coverages = entries.map(choiceCoverage);
  return Object.keys(comparisonMetrics).filter(key => coverages.every(keys => keys.includes(key)));
}

export function coverageLabels(keys) {
  return keys.map(key => comparisonMetrics[key].label);
}

export function sharedWaterNote(entries, keys = sharedCoverage(entries)) {
  if (!keys.includes('water')) return '';
  const scopes = new Set(entries.map(entry => metricForOption(entry.before, 'water')));
  return scopes.size > 1 ? 'Water volumes have different source scopes. Check the label beside each value.' : '';
}
