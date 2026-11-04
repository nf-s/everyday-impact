import { groups } from './data/catalogue.js';
import { goodsGroups, labourEvidence } from './data/goods.js';
import { metrics, comparisonMetrics, periods, validAmount, metricForOption, estimateChoice, formatEstimate, raw } from './model.js';
import { defaultUsage } from './defaults.js';
import { activityPicker } from './picker.js';
import { el, sourceLinks } from './dom.js';
import { showMeasureDetails } from './measure-dialog.js';

const byId = new Map(groups.map(group => [group.id, group]));
const categories = [...new Set(groups.map(group => group.category))];
const view = id => document.getElementById(id);
const titleCase = text => text.charAt(0).toUpperCase() + text.slice(1);
const pick = (group, before, after, amount = 1, period = 'once') => ({ group, before, after, amount, period, times: 1 });
const presets = [
  { id: 'ai-beef', label: 'AI prompts and beef', mode: 'footprints', choices: [
    defaultChoice(byId.get('ai-request'), byId.get('ai-request').options[0]),
    defaultChoice(byId.get('us-beef'), byId.get('us-beef').options[0])] },
  { id: 'flight-diet', label: 'Flight and diet', mode: 'changes', choices: [
    pick('return-flight', 'paris-new-york-return', null), pick('uk-diets', 'low-meat', 'vegan', 1, 'daily')] },
  { id: 'food-water', label: 'Beef and tofu', mode: 'footprints', choices: [
    pick('food-products', 'beef-steak', null, 0.15), pick('food-products', 'tofu', null, 0.15)] },
  { id: 'household-water', label: 'Showering and laundry', mode: 'changes', choices: [
    pick('shower', 'higher-9l', 'efficient-6l', 4, 'daily'), pick('laundry-load', 'washer-6kg-3star', 'washer-6kg-4star', 4, 'weekly')] },
  { id: 'hobart', label: 'Hobart flights and meals', mode: 'changes', choices: [
    pick('australian-flight-routes', 'hobart-melbourne-economy', null, 2), pick('french-meals', 'beef', 'vegan', 1, 'weekly')] },
  { id: 'travel-meals', label: 'Commuting and meals', mode: 'changes', choices: [
    pick('surface-travel', 'petrol-car-solo', 'national-rail', 50, 'weekly'), pick('french-meals', 'beef', 'vegan', 3, 'weekly')] },
  { id: 'ai', label: 'AI use and a return flight', mode: 'footprints', choices: [
    pick('ai-request', 'gemini-text-2025', null, 20, 'daily'), pick('return-flight', 'paris-new-york-return', null)] },
  { id: 'goods', label: 'A T-shirt and a smartphone', mode: 'footprints', choices: [
    pick('apparel', 'cotton-tshirt', null), pick('digital-devices', 'smartphone', null)] },
  { id: 'dishwashers', label: 'Two 14-place dishwashers', mode: 'footprints', choices: [
    pick('dishwasher-cycles', 'adw1264', null, 1, 'daily'), pick('dishwasher-cycles', 'adw1142', null, 1, 'daily')] },
  { id: 'tomato-season', label: 'In-season and out-of-season tomatoes', mode: 'footprints', choices: [
    pick('agb-plants', 'agb-20047_2', null, 1), pick('agb-plants', 'agb-20047_3', null, 1)] },
  { id: 'materials', label: 'New and second-hand clothing', mode: 'footprints', choices: [
    pick('clothing-material', 'clothing-primary', null, 0.2), pick('clothing-material', 'clothing-reused', null, 0.2)] },
  { id: 'grids', label: 'Electricity in Tasmania and Victoria', mode: 'footprints', choices: [
    pick('au-grid-electricity', 'tasmania', null, 10, 'daily'), pick('au-grid-electricity', 'victoria', null, 10, 'daily')] }
];

let choices = [];
const addChoiceButton = view('add-choice');

// Keep the labels alphabetical after Z (AA, AB, …).
function choiceLetter(index) {
  let label = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    label = String.fromCharCode(65 + (n - 1) % 26) + label;
  }
  return label;
}
function defaultChoice(group, item) {
  const { amount, period, times } = defaultUsage(group, item);
  return { group: group.id, before: item.id, after: null, kind: 'footprint', amount, period, times };
}

function selections(choice) {
  const group = byId.get(choice.group);
  const before = group.options.find(option => option.id === choice.before);
  const afterGroup = choice.afterGroup ? byId.get(choice.afterGroup) : group;
  const after = choice.kind === 'swap' && choice.after ? afterGroup.options.find(option => option.id === choice.after) : null;
  return { group, before, afterGroup, after };
}

function options(select, items, value) {
  select.replaceChildren(...items.map(([id, label]) => new Option(label, id)));
  select.value = value;
}

function selectField(text, name, values, selected) {
  const label = el('label', '', text);
  const select = el('select');
  select.dataset.field = name;
  options(select, values, selected);
  label.append(select);
  return label;
}

function itemName(group, item) {
  if (group.id === 'ai-request') return 'Gemini text prompt';
  if (group.id === 'uk-diets') return item.label + ' diet';
  if (group.id === 'au-grid-electricity') return 'Grid electricity · ' + item.label;
  if (group.id === 'au-pipeline-gas') return 'Mains gas · ' + item.label;
  return item.label;
}

function choiceTitle(choice) {
  const { group, before, after } = selections(choice);
  const name = itemName(group, before);
  if (choice.kind === 'skip') return 'Skip ' + name;
  if (after) return name + ' → ' + itemName(group, after);
  return name;
}

const foodSynonyms = [
  ['chick pea', 'chickpea chickpeas garbanzo beans'],
  ['sweet pepper', 'capsicum bell pepper'],
  ['eggplant', 'aubergine'],
  ['rolled oats', 'porridge oatmeal']
];

const itemEntries = groups.flatMap(group => group.options.map(item => ({
  label: itemName(group, item), groupLabel: group.label,
  categoryLabel: titleCase(group.category), categoryPath: item.categoryPath,
  aliases: [
    item.sourceCode, item.sourceName, item.sourceFrenchName, group.category, group.id, item.id,
    ...foodSynonyms.filter(([term]) => item.sourceCode && item.label.toLowerCase().includes(term)).map(([, aliases]) => aliases),
    group.id === 'ai-request' ? 'LLM chatbot question' : ''
  ].join(' '),
  qualityLabel: item.qualityWarning ? (item.dqr > 4 ? 'Low data quality' : 'Data quality caution') : '',
  replacementGroup: item.sourceCode ? 'agribalyse' : group.id,
  choice: defaultChoice(group, item)
})));
// The French product groups share a source, system boundary and mass denominator.
const replacementPools = new Map();
for (const entry of itemEntries) {
  if (!replacementPools.has(entry.replacementGroup)) replacementPools.set(entry.replacementGroup, []);
  replacementPools.get(entry.replacementGroup).push(entry);
}
const searchEntries = [...itemEntries];
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

function portionUnit(group) {
  if (group.singular === 'kg') return { scale: 1000, label: 'g' };
  return { scale: 1, label: group.plural };
}

function usageText(choice) {
  const { group, before } = selections(choice);
  if (!validAmount(choice.amount) || !validAmount(choice.times)) return 'Enter a positive quantity and frequency in Advanced.';
  const suggested = defaultUsage(group, before);
  if (['amount', 'times', 'period'].every(key => choice[key] === suggested[key])) return suggested.description;
  const portion = portionUnit(group);
  const unit = portion.scale === 1 && choice.amount === 1 ? group.singular : portion.label;
  const cadence = { daily: 'day', weekly: 'week', monthly: 'month' };
  const schedule = choice.period === 'once' ? 'once' : raw(choice.times) + (choice.times === 1 ? ' time' : ' times') + ' per ' + cadence[choice.period];
  return raw(choice.amount * portion.scale) + ' ' + unit + ', ' + schedule + '.';
}

function numericField(text, field, value, scale = 1) {
  const label = el('label', '', text);
  const input = el('input');
  input.type = 'number';
  input.min = '0';
  input.max = String(1000000 * scale);
  input.step = 'any';
  input.value = validAmount(value) ? String(Number((value * scale).toPrecision(12))) : '';
  input.dataset.field = field;
  label.append(input);
  return label;
}

function renderCard(index, keepOpen = false) {
  const choice = choices[index];
  const letter = choiceLetter(index);
  const card = el('article', 'choice');
  card.dataset.index = index;
  card.setAttribute('aria-label', 'Choice ' + letter);
  const picker = activityPicker(searchEntries, choice ? choiceTitle(choice) : '', letter, entry => {
    choices[index] = { ...entry.choice };
    setCustom();
    refreshChoice(index, 'picker');
  });
  if (choices.length > 1) {
    const remove = el('button', 'remove-choice', '×');
    remove.type = 'button';
    remove.title = 'Remove choice ' + letter;
    remove.setAttribute('aria-label', remove.title);
    remove.addEventListener('click', () => removeChoice(index));
    picker.append(remove);
  }
  card.append(picker);
  if (!choice) return card;
  const { group, before, after } = selections(choice);
  const description = el('p', 'choice-context', usageText(choice));
  picker.append(description);
  for (const item of [before, after]) {
    if (item?.qualityWarning) picker.append(el('p', 'choice-context', item.label + ' · ' + item.qualityWarning));
  }
  const advanced = el('details', 'advanced');
  advanced.open = keepOpen;
  advanced.append(el('summary', '', 'Advanced'));
  const fields = el('div', 'fields');
  const pair = el('div', 'pair');
  const portion = portionUnit(group);
  pair.append(numericField('Quantity (' + portion.label + ')', 'amount', choice.amount, portion.scale), selectField('Frequency', 'period',
    Object.entries(periods).map(([key, item]) => [key, item.label]), choice.period));
  fields.append(pair);
  if (choice.period !== 'once') fields.append(numericField('Times per ' + { daily: 'day', weekly: 'week', monthly: 'month' }[choice.period], 'times', choice.times));
  const alternatives = [['footprint', 'Footprint of this activity'], ['skip', 'Change from skipping this activity']];
  const replacements = replacementPools.get(before.sourceCode ? 'agribalyse' : group.id);
  if (replacements.length > 1) alternatives.push(['swap', 'Change from replacing this activity']);
  fields.append(selectField('Estimate', 'alternative', alternatives, choice.kind));
  if (choice.kind === 'swap') {
    fields.append(activityPicker(replacements, after ? itemName(byId.get(choice.afterGroup || group.id), after) : '', letter + '-replacement', entry => {
      choice.after = entry.choice.before;
      choice.afterGroup = entry.choice.group;
      setCustom();
      refreshChoice(index, 'replacement');
    }, { label: 'Replacement for choice ' + letter }));
  }
  advanced.append(fields);
  card.append(advanced);
  return card;
}

function refreshChoice(index, focusField) {
  const existing = view('choices').children[index];
  const card = renderCard(index, existing.querySelector('details')?.open);
  existing.replaceWith(card);
  const focusId = { picker: 'activity-' + choiceLetter(index), replacement: 'activity-' + choiceLetter(index) + '-replacement' };
  const target = focusId[focusField] ? view(focusId[focusField]) : card.querySelector('[data-field="' + focusField + '"]');
  target?.focus({ preventScroll: true });
  renderResults();
}

function resultCell(row, entry, key, largest) {
  const cell = row.insertCell();
  const { choice, before, value } = entry;
  if (value === null) {
    const valid = validAmount(choice.amount) && validAmount(choice.times);
    const reason = choice.kind === 'swap' && !choice.after ? 'Choose a replacement' : 'No estimate';
    cell.append(el('span', 'metric-detail', valid ? reason : 'Check quantity'));
    return;
  }

  cell.append(el('span', 'metric-value', formatEstimate(value, key, choice.kind)));
  const bar = el('div', 'metric-bar');
  bar.setAttribute('aria-hidden', 'true');
  const fill = el('div', value === 0 ? 'metric-fill' : 'metric-fill has-value');
  fill.style.width = (largest ? Math.abs(value) / largest * 100 : 0) + '%';
  bar.append(fill);
  cell.append(bar);
  if (key === 'water') {
    cell.append(el('small', 'metric-detail water-scope', metrics[metricForOption(before, key)].label));
  }
}

function renderResults() {
  const entries = choices.flatMap((choice, index) => choice ? [{
    choice, letter: choiceLetter(index), title: choiceTitle(choice), ...selections(choice)
  }] : []);
  const notes = [];
  const table = el('table', 'comparison-table');
  table.setAttribute('aria-labelledby', 'results-title');
  table.style.setProperty('--choice-count', entries.length);
  const headingRow = table.createTHead().insertRow();
  const measureHeading = el('th', '', 'Measure');
  measureHeading.scope = 'col';
  headingRow.append(measureHeading);
  for (const { letter, title, choice, group } of entries) {
    const header = el('th');
    header.scope = 'col';
    header.append(el('small', 'column-letter', 'Choice ' + letter), title);
    if (validAmount(choice.amount) && validAmount(choice.times)) {
      const quantity = choice.amount * choice.times * periods[choice.period].count;
      const unit = quantity === 1 ? group.singular : group.plural;
      header.append(el('small', 'column-quantity', raw(quantity) + ' ' + unit + ' in 12 months'));
    }
    headingRow.append(header);
  }

  const body = table.createTBody();
  const sharedOnly = view('shared-only').checked;
  let missing = false;
  const waterScopes = new Set();
  for (const [key, metric] of Object.entries(comparisonMetrics)) {
    const measures = entries.map(entry => {
      const { before, after, choice } = entry;
      const value = choice.kind === 'swap' && !after ? null : estimateChoice(before, after, choice.amount, choice.period, choice.times, key);
      return { ...entry, value };
    });
    const hasMissing = measures.some(entry => entry.value === null);
    if (!measures.length || (sharedOnly && hasMissing)) continue;
    if (hasMissing) missing = true;
    const row = body.insertRow();
    const label = el('th', 'measure-text');
    label.scope = 'row';
    const details = el('button', 'measure-details', 'Details');
    details.type = 'button';
    details.setAttribute('aria-label', metric.label + ' calculation details');
    details.setAttribute('aria-haspopup', 'dialog');
    details.addEventListener('click', () => showMeasureDetails(key, measures, details));
    const controls = el('div', 'measure-controls');
    controls.append(el('span', 'measure-label', metric.label), details);
    label.append(controls);
    row.append(label);
    const largest = measures.reduce((max, entry) => Math.max(max, Math.abs(entry.value ?? 0)), 0);
    for (const entry of measures) {
      resultCell(row, entry, key, largest);
      if (key === 'water' && entry.value !== null) waterScopes.add(metricForOption(entry.before, key));
    }
  }
  view('result-rows').replaceChildren(...(entries.length ? [table] : []));
  view('bar-guide').hidden = !body.rows.length;
  if (!entries.length) notes.push('Choose an activity to see its estimates.');
  else if (entries.some(({ choice }) => !validAmount(choice.amount) || !validAmount(choice.times))) notes.push('Enter a positive quantity and frequency in Advanced.');
  else if (!body.rows.length) notes.push('No shared estimates. Clear the checkbox to see the available figures.');
  else if (missing) notes.push('“No estimate” means a comparable figure is unavailable for that measure.');
  if (waterScopes.size > 1) notes.push('Water volumes cover different uses. The labels show what each source counts.');
  if (entries.some(entry => goodsGroups.includes(entry.group))) notes.push('Goods use the production or lifetime boundary shown in Details.');
  view('electronics-credit').hidden = !entries.some(entry => entry.group.id === 'digital-devices');
  view('measure-note').textContent = notes.join(' ');
  view('measure-note').hidden = !notes.length;
}

function openAdvancedCards() {
  return Array.from(view('choices').querySelectorAll('.choice'), card => Boolean(card.querySelector('.advanced')?.open));
}

function renderAll(open = []) {
  const cards = choices.map((_, index) => renderCard(index, open[index]));
  view('choices').replaceChildren(...cards, addChoiceButton);
  renderResults();
}

addChoiceButton.addEventListener('click', () => {
  const open = openAdvancedCards();
  choices.push(null);
  setCustom();
  renderAll(open);
  view('activity-' + choiceLetter(choices.length - 1)).focus();
});

function removeChoice(index) {
  const open = openAdvancedCards();
  choices.splice(index, 1);
  open.splice(index, 1);
  setCustom();
  renderAll(open);
  view('activity-' + choiceLetter(Math.min(index, choices.length - 1))).focus({ preventScroll: true });
}

function loadPreset(id) {
  const preset = presets.find(item => item.id === id);
  if (!preset) return;
  choices = preset.choices.map(item => ({ ...item, kind: preset.mode === 'footprints' ? 'footprint' : item.after ? 'swap' : 'skip' }));
  view('examples').value = id;
  renderAll();
  view('choices').scrollLeft = 0;
  view('result-rows').scrollLeft = 0;
}

function setCustom() { view('examples').value = 'custom'; }

for (const region of [view('choices'), view('result-rows')]) {
  region.addEventListener('keydown', event => {
    if (event.target !== region || region.scrollWidth <= region.clientWidth || event.metaKey || event.altKey || event.ctrlKey) return;
    const distance = { ArrowLeft: -48, ArrowRight: 48, Home: -region.scrollWidth, End: region.scrollWidth }[event.key];
    if (!distance) return;
    event.preventDefault();
    region.scrollLeft += distance;
  });
}

view('choices').addEventListener('input', event => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !['amount', 'times'].includes(input.dataset.field)) return;
  const card = input.closest('.choice');
  const choice = choices[Number(card.dataset.index)];
  const scale = input.dataset.field === 'amount' ? portionUnit(byId.get(choice.group)).scale : 1;
  choice[input.dataset.field] = input.valueAsNumber / scale;
  input.setAttribute('aria-invalid', String(!validAmount(choice[input.dataset.field])));
  card.querySelector('.choice-context').textContent = usageText(choice);
  setCustom();
  renderResults();
});
view('choices').addEventListener('change', event => {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement)) return;
  const index = Number(select.closest('.choice').dataset.index);
  const choice = choices[index];
  if (select.dataset.field === 'period') {
    choice.period = select.value;
    if (choice.period === 'once') choice.times = 1;
  } else if (select.dataset.field === 'alternative') {
    choice.kind = select.value;
    choice.after = null;
    delete choice.afterGroup;
  }
  setCustom();
  refreshChoice(index, select.dataset.field === 'alternative' && choice.kind === 'swap' ? 'replacement' : select.dataset.field);
});
view('shared-only').addEventListener('change', renderResults);
options(view('examples'), [['custom', 'Custom comparison'], ...presets.map(preset => [preset.id, preset.label])], 'ai-beef');
view('examples').options[0].disabled = true;
view('examples').addEventListener('change', event => loadPreset(event.target.value));

function useFactor(group, item, index) {
  choices[index] = defaultChoice(group, item);
  setCustom();
  renderAll();
  location.hash = 'compare';
}

function factorRecord(group, item) {
  const record = el('article', 'factor');
  record.append(el('h3', '', item.label));
  for (const [key, value] of Object.entries(item.values)) {
    record.append(el('p', '', metrics[key].label + ' · ' + raw(value) + ' ' + metrics[key].unit));
  }
  if (item.note) record.append(el('p', '', item.note));
  if (item.sources?.length) record.append(sourceLinks(item.sources));
  const actions = el('div', 'factor-actions');
  choices.forEach((_, index) => {
    const letter = choiceLetter(index);
    const button = el('button', '', 'Use in ' + letter);
    button.type = 'button';
    button.setAttribute('aria-label', 'Use ' + item.label + ' in choice ' + letter);
    button.addEventListener('click', () => useFactor(group, item, index));
    actions.append(button);
  });
  record.append(actions);
  return record;
}

function renderLibrary() {
  const text = view('search').value.trim().toLocaleLowerCase();
  const category = view('filter-category').value;
  const list = view('library-groups');
  list.replaceChildren();
  let total = 0;
  for (const group of groups) {
    if (category && category !== group.category) continue;
    const items = text ? group.options.filter(item => [
      group.category, group.label, item.label, item.sourceCode, item.sourceFrenchName, ...(item.categoryPath || []),
      ...Object.keys(item.values).map(key => metrics[key].label)
    ].join(' ').toLocaleLowerCase().includes(text)) : group.options;
    if (!items.length) continue;
    const details = el('details', 'library-group');
    details.append(el('summary', '', group.label + ' · ' + items.length));
    details.append(el('p', 'lib-intro', 'Unit · ' + group.unit), el('p', 'lib-intro', group.sourceNote), sourceLinks(group.sources));
    const records = el('div');
    const more = el('button', 'library-more', 'Show more');
    more.type = 'button';
    let shown = 0;
    function showPage() {
      const next = items.slice(shown, shown + 20);
      records.append(...next.map(item => factorRecord(group, item)));
      shown += next.length;
      more.hidden = shown === items.length;
      more.textContent = 'Show ' + Math.min(20, items.length - shown) + ' more';
    }
    details.append(records, more);
    more.addEventListener('click', showPage);
    details.addEventListener('toggle', () => { if (details.open && !shown) showPage(); });
    details.open = Boolean(text);
    list.append(details);
    total += items.length;
  }
  view('library-count').textContent = raw(total) + (total === 1 ? ' example. ' : ' examples. ') + 'Each estimate includes its unit, scope and source.';
  if (!total) list.append(el('p', '', 'No matches. Try another term or category.'));
}

options(view('filter-category'), [['', 'All categories'], ...categories.map(category => [category, titleCase(category)])], '');
view('search').addEventListener('input', renderLibrary);
view('filter-category').addEventListener('change', renderLibrary);
for (const item of labourEvidence) {
  const article = el('article', 'record');
  article.append(el('p', 'scope', item.brand), el('h2', '', item.title), el('p', '', item.detail), el('p', '', item.scope), sourceLinks(item.sources));
  view('labour-records').append(article);
}

function navigate() {
  const hash = location.hash.slice(1);
  const tab = ['library', 'labour'].includes(hash) ? hash : 'compare';
  for (const name of ['compare', 'library', 'labour']) {
    view(name).hidden = name !== tab;
    const link = document.querySelector('nav a[href="#' + name + '"]');
    if (name === tab) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (tab === 'library') renderLibrary();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', navigate);
loadPreset('ai-beef');
navigate();
