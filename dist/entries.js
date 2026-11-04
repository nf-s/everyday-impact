import { groups } from './data/catalogue.js';
import { defaultUsage } from './defaults.js';
import { periods, validAmount } from './model.js';

const byId = new Map(groups.map(group => [group.id, group]));
const titleCase = text => text.charAt(0).toUpperCase() + text.slice(1);

export function defaultChoice(group, item) {
  const { amount, period, times } = defaultUsage(group, item);
  return { group: group.id, before: item.id, after: null, kind: 'footprint', amount, period, times };
}

export function itemName(group, item) {
  if (item.genericEvidence) return item.label;
  if (group.id === 'ai-request') return 'AI chat · Gemini text prompt';
  if (group.id === 'uk-diets') return item.label + ' diet';
  if (group.id === 'au-grid-electricity') return 'Grid electricity · ' + item.label;
  if (group.id === 'au-pipeline-gas') return 'Mains gas · ' + item.label;
  return item.label;
}

const foodSynonyms = [
  ['chick pea', 'chickpea chickpeas garbanzo beans'],
  ['sweet pepper', 'capsicum bell pepper'],
  ['eggplant', 'aubergine'],
  ['rolled oats', 'porridge oatmeal']
];

export function replacementGroup(group, item) {
  return item.replacementBasis || (item.sourceCode ? 'agribalyse' : group.id);
}

export function validCatalogueChoice(choice) {
  if (!choice || typeof choice !== 'object') return false;
  const group = byId.get(choice.group);
  const before = group?.options.find(item => item.id === choice.before);
  if (!before || !validAmount(choice.amount) || !validAmount(choice.times) ||
      typeof choice.period !== 'string' || !Object.hasOwn(periods, choice.period) || (choice.period === 'once' && choice.times !== 1)) return false;
  if (choice.kind !== 'swap') return ['footprint', 'skip'].includes(choice.kind) && choice.after === null && !choice.afterGroup;
  const afterGroup = byId.get(choice.afterGroup || group.id);
  const after = afterGroup?.options.find(item => item.id === choice.after);
  return Boolean(after) && group.singular === afterGroup.singular &&
    replacementGroup(group, before) === replacementGroup(afterGroup, after);
}

function genericHint(item) {
  if (item.genericHint) return item.genericHint;
  const evidence = item.genericEvidence;
  if (evidence?.method === 'median') return 'Median of ' + evidence.contributors.length + ' records';
  if (evidence?.method === 'representative') return 'Reference example';
  return '';
}

export const itemEntries = groups.flatMap(group => group.options.map(item => ({
  label: itemName(group, item), groupLabel: group.label,
  categoryLabel: titleCase(group.category), categoryPath: item.categoryPath,
  generic: item.generic === true, genericHint: genericHint(item),
  evidenceLabel: item.evidenceLabel,
  aliases: [
    item.sourceCode, item.sourceName, item.sourceFrenchName, item.genericHint, group.category, group.id, item.id,
    ...foodSynonyms.filter(([term]) => group.category === 'food' && item.label.toLowerCase().includes(term)).map(([, aliases]) => aliases),
    item.categoryPath?.includes('Chat responses') ? 'LLM chatbot prompt question' : '',
    group.id === 'ai-web-app-development' ? 'coding agent website create develop programming' : '',
    group.id === 'ai-summarisation' ? 'summarize document summary summarization' : ''
  ].join(' '),
  qualityLabel: item.qualityWarning ? (item.dqr > 4 ? 'Low data quality' : 'Data quality caution') : '',
  replacementGroup: replacementGroup(group, item),
  choice: defaultChoice(group, item)
})));
// The French product groups share a source, system boundary and mass denominator.
export const replacementPools = new Map();
for (const entry of itemEntries) {
  if (!replacementPools.has(entry.replacementGroup)) replacementPools.set(entry.replacementGroup, []);
  replacementPools.get(entry.replacementGroup).push(entry);
}
export const searchEntries = [...itemEntries];
const changes = [
  ['Switch to a vegan diet', 'go vegan plant based lifestyle', 'uk-diets', 'low-meat', 'vegan'],
  ['Replace a beef meal with a vegan meal', 'swap steak dinner', 'french-meals', 'beef', 'vegan'],
  ['Skip a Paris–New York return flight', 'avoid flying air travel', 'return-flight', 'paris-new-york-return', null],
  ['Take the train instead of driving', 'commute car rail', 'surface-travel', 'petrol-car-solo', 'national-rail'],
  ['Switch to an efficient showerhead', 'use less household water', 'shower', 'higher-9l', 'efficient-6l'],
  ['Buy a garment second-hand', 'op shop thrift used clothing clothes', 'clothing-material', 'clothing-primary', 'clothing-reused'],
  ['Switch between two 8 kg dryers', 'replace tumble dryer vented condenser laundry', 'dryer-loads', 'acd0929', 'acd0915']
];
for (const [label, aliases, groupId, beforeId, after] of changes) {
  const group = byId.get(groupId);
  const item = group.options.find(option => option.id === beforeId);
  searchEntries.push({ label, aliases, categoryLabel: 'Lifestyle changes', groupLabel: titleCase(group.category), choice: {
    ...defaultChoice(group, item), kind: after ? 'swap' : 'skip', after
  } });
}
