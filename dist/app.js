import { defaultChoice, validCatalogueChoice, itemName, replacementGroup, replacementPools, searchEntries } from './entries.js';
import { groups } from './data/catalogue.js';
import { labourEvidence } from './data/goods.js';
import { metrics, comparisonMetrics, periods, defaultHorizon, validHorizon, horizonLabel, occurrencesFor, validAmount, metricForOption, canEstimateGridCarbon, withGridCarbon, estimateComparison, formatEstimate, formatDifference, number, raw } from './model.js';
import { defaultUsage } from './defaults.js';
import { activityPicker } from './picker.js';
import { el, sourceLinks, evidenceBadge } from './dom.js';
import { showMeasureDetails } from './measure-dialog.js';
import { setupQuestionForm } from './question.js';
import { comparisonFromURL } from './share-state.js';
import { setupSharing } from './share.js';
import { choiceCoverage, sharedCoverage, coverageLabels, sharedWaterNote } from './coverage.js';

const byId = new Map(groups.map(group => [group.id, group]));
const categories = [...new Set(groups.map(group => group.category))];
const view = id => document.getElementById(id);
const titleCase = text => text.charAt(0).toUpperCase() + text.slice(1);
const pick = (group, before, after, amount = 1, period = 'once') => ({ group, before, after, amount, period, times: 1 });
const presets = [
  { id: 'ai-beef', label: 'AI prompts and beef', mode: 'footprints', choices: [
    defaultChoice(byId.get('ai-request'), byId.get('ai-request').options[0]),
    defaultChoice(byId.get('us-beef'), byId.get('us-beef').options[0])] },
  { id: 'web-app-kettle', label: 'Build a web app and run a kettle', mode: 'footprints', choices: [
    pick('ai-web-app-development', 'prototype-qwen3-coder-480b-fp8-b200', null),
    pick('everyday-electricity', 'kettle-three-minutes', null)] },
  { id: 'bug-fix-microwave', label: 'Attempt a bug fix and use a microwave', mode: 'footprints', choices: [
    pick('ai-coding-agent-bug-fix', 'autocoderover-qwen3-1-7b-attempt', null),
    pick('everyday-electricity', 'microwave-three-minutes', null)] },
  { id: 'image-light', label: 'Generate an image and light an LED bulb', mode: 'footprints', choices: [
    pick('ai-image-generation', 'luccioni-2024-image-generation', null),
    pick('everyday-electricity', 'led-hour', null)] },
  { id: 'video-laptop', label: 'Generate a video clip and use a laptop', mode: 'footprints', choices: [
    pick('ai-video-generation', 'video-2025-cogvideox-5b', null),
    pick('everyday-electricity', 'laptop-hour', null)] },
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
let sharing;
let comparisonHorizon = { ...defaultHorizon };
const gridGroup = byId.get('au-grid-electricity');
const gridOptions = new Map(gridGroup.options.map(item => [item.id, item]));
const gridSelect = view('estimate-grid');
options(gridSelect, [['', 'Use source figures only'], ...gridGroup.options.map(item => [item.id, item.label])], '');
gridSelect.addEventListener('change', () => renderAll(openAdvancedCards()));
const addChoiceButton = view('add-choice');

export function setComparisonHorizon(horizon) {
  if (!validHorizon(horizon)) return false;
  const changed = horizon.amount !== comparisonHorizon.amount || horizon.unit !== comparisonHorizon.unit;
  comparisonHorizon = { amount: horizon.amount, unit: horizon.unit };
  view('horizon-amount').value = String(horizon.amount);
  view('horizon-unit').value = horizon.unit;
  view('horizon-amount').setAttribute('aria-invalid', 'false');
  view('horizon-error').hidden = true;
  if (changed) renderResults();
  return true;
}

function updateComparisonHorizon() {
  const amount = view('horizon-amount').valueAsNumber;
  const unit = view('horizon-unit').value;
  if (setComparisonHorizon({ amount, unit })) return;
  view('horizon-amount').setAttribute('aria-invalid', 'true');
  view('horizon-error').textContent = 'Enter a whole number from 1 to 1,000. Results still use ' + horizonLabel(comparisonHorizon) + '.';
  view('horizon-error').hidden = false;
}

view('comparison-horizon').addEventListener('input', updateComparisonHorizon);
view('comparison-horizon').addEventListener('change', updateComparisonHorizon);
view('comparison-horizon').addEventListener('submit', event => {
  event.preventDefault();
  updateComparisonHorizon();
});

// Keep the labels alphabetical after Z (AA, AB, …).
function choiceLetter(index) {
  let label = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    label = String.fromCharCode(65 + (n - 1) % 26) + label;
  }
  return label;
}
function selections(choice) {
  const group = byId.get(choice.group);
  const before = group.options.find(option => option.id === choice.before);
  const afterGroup = choice.afterGroup ? byId.get(choice.afterGroup) : group;
  const after = choice.kind === 'swap' && choice.after ? afterGroup.options.find(option => option.id === choice.after) : null;
  const grid = gridOptions.get(gridSelect.value);
  return { group, before: withGridCarbon(before, grid), afterGroup, after: withGridCarbon(after, grid) };
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

function choiceTitle(choice) {
  const { group, before } = selections(choice);
  return itemName(group, before);
}

function portionUnit(group) {
  if (group.singular === 'kg') return { scale: 1000, label: 'g' };
  return { scale: 1, label: group.plural };
}

function usageText(choice) {
  const group = byId.get(choice.group);
  if (!validAmount(choice.amount) || !validAmount(choice.times)) return 'Check quantity and frequency';
  const portion = portionUnit(group);
  const unit = portion.scale === 1 && choice.amount === 1 ? group.singular : portion.label;
  const cadence = { daily: 'day', weekly: 'week', monthly: 'month' };
  const schedule = choice.times === 1 ? { once: 'once', daily: 'daily', weekly: 'weekly', monthly: 'monthly' }[choice.period] :
    raw(choice.times) + ' times per ' + cadence[choice.period];
  return raw(choice.amount * portion.scale) + ' ' + unit + ' · ' + schedule;
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

function coverageEntry(choice) { return { choice, ...selections(choice) }; }

function pickerCoverage(index, replacing = false) {
  const peers = choices.flatMap((choice, peer) => choice && peer !== index ? [coverageEntry(choice)] : []);
  const peerKeys = sharedCoverage(peers);
  const cache = new Map();
  return {
    hasPeers: peers.length > 0,
    describe(entry) {
      if (cache.has(entry)) return cache.get(entry);
      const choice = replacing ? { ...choices[index], kind: 'swap', after: entry.choice.before, afterGroup: entry.choice.group } :
        selectActivity(choices[index], entry.choice);
      const candidate = coverageEntry(choice);
      const available = choiceCoverage(candidate);
      const keys = peers.length ? peerKeys.filter(key => available.includes(key)) : available;
      const hint = { keys, labels: coverageLabels(keys), note: sharedWaterNote([candidate, ...peers], keys) };
      cache.set(entry, hint);
      return hint;
    }
  };
}

function selectActivity(current, selection) {
  if (!current || current.kind === 'footprint' || selection.kind !== 'footprint') return { ...selection };
  const original = selections(current);
  const next = selections(selection);
  if (original.group.singular !== next.group.singular ||
      replacementGroup(original.group, original.before) !== replacementGroup(next.group, next.before)) return { ...selection };
  return { ...current, group: selection.group, before: selection.before, ...(original.after ? { afterGroup: original.afterGroup.id } : {}) };
}

function setAlternative(index, kind, entry) {
  const choice = choices[index];
  choice.kind = kind;
  choice.after = entry?.choice.before ?? null;
  if (entry) choice.afterGroup = entry.choice.group;
  else delete choice.afterGroup;
  setCustom();
  refreshChoice(index, kind === 'footprint' ? 'toggle-alternative' : 'replacement');
}

function pickerTotal(control, className) {
  const row = el('div', 'activity-with-total');
  control.before(row);
  row.append(control, el('strong', className));
}

function showEvidence(picker, item) {
  if (item?.evidenceLabel) picker.append(evidenceBadge(item.evidenceLabel));
  if (item?.qualityWarning) picker.append(el('p', 'choice-context', item.qualityWarning));
}

function alternativePicker(index, letter, group, before, afterGroup, after) {
  const choice = choices[index];
  const entries = replacementPools.get(replacementGroup(group, before))
    .filter(entry => byId.get(entry.choice.group).singular === group.singular);
  const id = 'activity-' + letter + '-replacement';
  let picker;
  if (entries.length <= 12) {
    picker = el('div', 'picker');
    const label = el('label', '', 'Alternative');
    label.htmlFor = id;
    const select = el('select');
    select.id = id;
    const prompt = new Option('Choose an alternative', '');
    prompt.disabled = true;
    select.append(prompt, new Option('Skip this activity', 'skip'));
    for (const [i, entry] of entries.entries()) select.append(new Option(entry.label, String(i)));
    const selected = entries.findIndex(entry => entry.choice.group === afterGroup.id && entry.choice.before === choice.after);
    select.value = choice.kind === 'skip' ? 'skip' : selected === -1 ? '' : String(selected);
    select.addEventListener('change', () => {
      if (select.value === 'skip') setAlternative(index, 'skip');
      else setAlternative(index, 'swap', entries[Number(select.value)]);
    });
    // Native selects clip long names. The visible label can wrap while the select handles input.
    const control = el('div', 'picker-trigger compact-alternative');
    const selectedName = el('span', '', select.selectedOptions[0].text);
    selectedName.setAttribute('aria-hidden', 'true');
    control.append(selectedName, select);
    picker.append(label, control);
    pickerTotal(control, 'card-alternative-total');
  } else {
    const name = choice.kind === 'skip' ? 'Skip this activity' : after ? itemName(afterGroup, after) : 'Choose an alternative';
    picker = activityPicker(entries, name, letter + '-replacement', entry => setAlternative(index, 'swap', entry), {
      label: 'Alternative', coverage: () => pickerCoverage(index, true), onSkip: () => setAlternative(index, 'skip')
    });
    pickerTotal(picker.querySelector('.picker-trigger'), 'card-alternative-total');
  }
  picker.classList.add('alternative-picker');
  showEvidence(picker, after);
  return picker;
}

function updateSchedule(card, choice) {
  card.querySelector('.schedule-value').textContent = usageText(choice);
  const { group, before } = selections(choice);
  const suggested = defaultUsage(group, before);
  const assumption = card.querySelector('.schedule-assumption');
  assumption.textContent = ['amount', 'period', 'times'].every(key => choice[key] === suggested[key]) ? suggested.description : '';
  assumption.hidden = !assumption.textContent;
}

function renderCard(index, keepOpen = false) {
  const choice = choices[index];
  const letter = choiceLetter(index);
  const card = el('article', 'choice');
  card.dataset.index = index;
  card.setAttribute('aria-label', 'Activity ' + letter);
  const picker = activityPicker(searchEntries, choice ? choiceTitle(choice) : '', letter, entry => {
    choices[index] = selectActivity(choice, entry.choice);
    setCustom();
    refreshChoice(index, 'picker');
  }, { label: 'Activity ' + letter, coverage: () => pickerCoverage(index) });
  if (choices.length > 1) {
    const remove = el('button', 'remove-choice', '×');
    remove.type = 'button';
    remove.title = 'Remove activity ' + letter;
    remove.setAttribute('aria-label', remove.title);
    remove.addEventListener('click', () => removeChoice(index));
    picker.append(remove);
  }
  card.append(picker);
  if (!choice) return card;
  const { group, before, afterGroup, after } = selections(choice);
  const label = picker.querySelector('label');
  const heading = el('div', 'activity-heading');
  label.before(heading);
  heading.append(label, el('small', 'card-impact-summary'));
  pickerTotal(picker.querySelector('.picker-trigger'), 'card-current-total');
  showEvidence(picker, before);
  const advanced = el('details', 'advanced');
  advanced.open = keepOpen;
  const summary = el('summary');
  summary.append(el('span', 'schedule-value'), el('span', 'edit-schedule', 'Edit schedule'));
  advanced.append(summary);
  const fields = el('div', 'fields');
  const pair = el('div', 'pair');
  const portion = portionUnit(group);
  pair.append(numericField('Quantity (' + portion.label + ')', 'amount', choice.amount, portion.scale), selectField('Frequency', 'period',
    Object.entries(periods).map(([key, item]) => [key, item.label]), choice.period));
  fields.append(pair);
  if (choice.period !== 'once') fields.append(numericField('Times per ' + { daily: 'day', weekly: 'week', monthly: 'month' }[choice.period], 'times', choice.times));
  fields.append(el('p', 'schedule-assumption input-hint'));
  advanced.append(fields);
  card.append(advanced);
  updateSchedule(card, choice);
  const hasAlternative = choice.kind !== 'footprint';
  if (hasAlternative) {
    const alternative = alternativePicker(index, letter, group, before, afterGroup, after);
    alternative.id = 'alternative-' + letter;
    card.append(alternative);
  }
  const footer = el('div', 'alternative-actions');
  const toggle = el('button', 'alternative-toggle', hasAlternative ? 'Remove alternative' : 'Try an alternative');
  toggle.type = 'button';
  toggle.dataset.field = 'toggle-alternative';
  toggle.setAttribute('aria-expanded', String(hasAlternative));
  if (hasAlternative) toggle.setAttribute('aria-controls', 'alternative-' + letter);
  toggle.addEventListener('click', () => setAlternative(index, hasAlternative ? 'footprint' : 'swap'));
  footer.append(el('span', 'card-difference'), toggle);
  card.append(footer);
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

function measureRows(entries) {
  return Object.entries(comparisonMetrics).map(([key, metric]) => {
    const measures = entries.map(entry => ({
      ...entry, ...estimateComparison(entry.before, entry.after, entry.choice, key, comparisonHorizon)
    }));
    const totals = measures.flatMap(({ current, alternative }) => [current, alternative]).filter(value => value !== null);
    const largest = totals.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
    const unitBasis = measures.reduce((max, entry) => Math.max(max, Math.abs(entry.current ?? 0)), 0) || largest;
    const waterScopesDiffer = key === 'water' && new Set(measures.flatMap(({ before, after }) =>
      [before, after].map(item => metricForOption(item, key)).filter(Boolean))).size > 1;
    return {
      key, metric, measures, count: measures.filter(entry => entry.current !== null || entry.alternative !== null).length,
      unit: key === 'energy' && unitBasis > 0 && unitBasis < 1 ? 'Wh' : metric.unit,
      barScale: waterScopesDiffer || totals.some(value => value < 0) ? 0 : largest
    };
  });
}

function differenceText(entry, key, unit) {
  if (entry.difference !== null) return formatDifference(entry.difference, key, unit);
  if (entry.current !== null && entry.alternative !== null && key === 'water') return 'Different water measures';
  return '';
}

function totalText(value, key, unit) {
  return value === null ? 'No estimate' : formatEstimate(value, key, 'footprint', unit);
}

function totalScope(key, item, group) {
  if (!item) return '';
  if (key === 'water') return metrics[metricForOption(item, key)]?.label || '';
  if (key === 'carbon' && item.gridEstimate) return 'Grid estimate · electricity only';
  if (key === 'energy') return item.energyScope || group.energyScope || '';
  return '';
}

function updateCardTotals(rows, entries, horizonText) {
  // Keep the featured measure tied to the original activities as alternatives are edited.
  const common = rows.find(row => entries.every(entry => metricForOption(entry.before, row.key) !== null));
  entries.forEach((entry, column) => {
    const card = view('choices').children[entry.index];
    if (!card) return;
    const featured = common || rows.find(row => metricForOption(entry.before, row.key) !== null);
    if (!featured) return;
    const { key, unit, metric } = featured;
    const measure = featured.measures[column];
    const scope = totalScope(key, entry.before, entry.group);
    const otherWaterScope = key === 'water' && entry.after && totalScope(key, entry.after, entry.afterGroup);
    const label = key === 'water' && scope && (!otherWaterScope || scope === otherWaterScope) ? scope : metric.label;
    card.querySelector('.card-impact-summary').textContent = label + ' over ' + horizonText;
    function showTotal(selector, value, item, group) {
      const slot = card.querySelector(selector);
      if (!slot) return;
      slot.textContent = totalText(value, key, unit);
      const qualifier = totalScope(key, item, group);
      if (value !== null && qualifier && key !== 'energy' && qualifier !== label) slot.append(el('small', 'total-scope', qualifier));
    }
    showTotal('.card-current-total', measure.current, entry.before, entry.group);
    if (entry.choice.kind === 'skip' || entry.after) {
      showTotal('.card-alternative-total', measure.alternative, entry.after, entry.afterGroup);
    }
    card.querySelector('.card-difference').textContent = differenceText(measure, key, unit);
  });
}

function resultCell(row, entry, measure) {
  const cell = row.insertCell();
  const { key, unit, barScale } = measure;
  const hasAlternative = entry.choice.kind === 'skip' || Boolean(entry.after);
  function appendTotal(value, item, group, label) {
    if (label) cell.append(el('small', 'total-label', label));
    cell.append(el('span', value === null ? 'metric-detail' : 'metric-value', totalText(value, key, unit)));
    if (value === null) return;
    if (barScale) {
      const bar = el('div', 'metric-bar');
      bar.setAttribute('aria-hidden', 'true');
      const fill = el('div', value === 0 ? 'metric-fill' : 'metric-fill has-value');
      fill.style.width = (value / barScale * 100) + '%';
      bar.append(fill);
      cell.append(bar);
    }
    const scope = totalScope(key, item, group);
    if (scope) cell.append(el('small', 'total-scope', scope));
  }
  appendTotal(entry.current, entry.before, entry.group, hasAlternative ? 'Current' : '');
  if (hasAlternative) {
    appendTotal(entry.alternative, entry.after, entry.afterGroup, 'Alternative');
    const difference = differenceText(entry, key, unit);
    if (difference) cell.append(el('small', 'metric-difference', difference));
  }
}

function renderResults() {
  sharing?.invalidate();
  const horizonText = horizonLabel(comparisonHorizon);
  view('results-title').textContent = 'Estimated impact over ' + horizonText;
  const entries = choices.flatMap((choice, index) => choice ? [{
    choice, index, letter: choiceLetter(index), title: choiceTitle(choice), ...selections(choice)
  }] : []);
  view('grid-scenario').hidden = !gridSelect.value && !entries.some(({ before, after }) =>
    canEstimateGridCarbon(before) || canEstimateGridCarbon(after));
  const notes = [];
  const rows = measureRows(entries);
  updateCardTotals(rows, entries, horizonText);
  const shared = sharedCoverage(entries);
  const coverageSummary = view('coverage-summary');
  coverageSummary.replaceChildren();
  if (entries.length > 1) {
    if (!shared.length) {
      coverageSummary.append(el('p', '', 'No shared measures across these activities.'));
      const removable = entries.findLast(entry => sharedCoverage(entries.filter(other => other !== entry)).length);
      if (removable) {
        const change = el('button', 'coverage-action', 'Change activity ' + removable.letter);
        change.type = 'button';
        change.addEventListener('click', () => {
          const input = view('activity-' + removable.letter);
          input.focus();
          input.click();
        });
        coverageSummary.append(change);
      } else if (entries.length > 2) {
        coverageSummary.append(el('p', '', 'Remove a choice to compare a smaller group.'));
      }
      const average = gridOptions.get('national');
      if (!gridSelect.value && sharedCoverage(entries.map(entry => ({
        ...entry, before: withGridCarbon(entry.before, average), after: withGridCarbon(entry.after, average)
      }))).includes('carbon')) {
        const bridge = el('button', 'coverage-action', 'Estimate electricity emissions using the Australian average');
        bridge.type = 'button';
        bridge.addEventListener('click', () => {
          gridSelect.value = average.id;
          gridSelect.dispatchEvent(new Event('change', { bubbles: true }));
          gridSelect.focus({ preventScroll: true });
        });
        coverageSummary.append(bridge);
      }
    }
    const waterNote = sharedWaterNote(entries, shared);
    if (waterNote) coverageSummary.append(el('p', '', waterNote));
    if (!shared.length && view('shared-only').checked) {
      const show = el('button', 'coverage-action', 'Show available measures');
      show.type = 'button';
      show.addEventListener('click', () => { view('shared-only').checked = false; renderResults(); view('shared-only').focus(); });
      coverageSummary.append(show);
    }
  }
  coverageSummary.hidden = !coverageSummary.childElementCount;
  const table = el('table', 'comparison-table');
  table.setAttribute('aria-labelledby', 'results-title');
  table.style.setProperty('--choice-count', entries.length);
  const headingRow = table.createTHead().insertRow();
  const measureHeading = el('th', '', 'Measure');
  measureHeading.scope = 'col';
  headingRow.append(measureHeading);
  for (const { letter, title, choice, group, after, afterGroup } of entries) {
    const header = el('th');
    header.scope = 'col';
    header.append(el('small', 'column-letter', 'Activity ' + letter), title);
    if (after || choice.kind === 'skip') {
      header.append(el('small', 'column-alternative', 'Alternative · ' + (after ? itemName(afterGroup, after) : 'Skip this activity')));
    }
    if (validAmount(choice.amount) && validAmount(choice.times)) {
      const occurrences = occurrencesFor(choice.period, comparisonHorizon);
      const quantity = choice.amount * choice.times * occurrences;
      const unit = quantity === 1 ? group.singular : group.plural;
      const quantityText = Number.isInteger(occurrences) ? raw(quantity) : '≈ ' + number(quantity);
      const summary = el('small', 'column-quantity');
      summary.append(el('span', 'number', quantityText), ' ' + unit);
      header.append(summary);
    }
    headingRow.append(header);
  }

  const body = table.createTBody();
  const sharedOnly = view('shared-only').checked;
  rows.sort((a, b) => b.count - a.count);
  for (const measure of rows) {
    const { key, metric, measures, count, unit } = measure;
    if (!count || (sharedOnly && !shared.includes(key))) continue;
    const row = body.insertRow();
    const label = el('th', 'measure-text');
    label.scope = 'row';
    const details = el('button', 'measure-details');
    details.type = 'button';
    const eye = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    eye.setAttribute('viewBox', '0 0 24 24');
    eye.setAttribute('aria-hidden', 'true');
    eye.setAttribute('focusable', 'false');
    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    outline.setAttribute('d', 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z');
    const pupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pupil.setAttribute('cx', '12');
    pupil.setAttribute('cy', '12');
    pupil.setAttribute('r', '3');
    eye.append(outline, pupil);
    details.append(eye, el('span', 'measure-details-text', 'Details'));
    details.setAttribute('aria-label', metric.label + ' calculation details');
    details.setAttribute('aria-haspopup', 'dialog');
    details.addEventListener('click', () => showMeasureDetails(key, measures, details, unit, comparisonHorizon));
    const controls = el('div', 'measure-controls');
    controls.append(el('span', 'measure-label', metric.label), details);
    label.append(controls);
    row.append(label);
    for (const entry of measures) resultCell(row, entry, measure);
  }
  view('result-rows').replaceChildren(...(body.rows.length ? [table] : []));
  if (!entries.length) notes.push('Choose an activity to see its estimates.');
  else if (entries.some(({ choice }) => !validAmount(choice.amount) || !validAmount(choice.times))) notes.push('Enter a positive quantity and frequency in Edit schedule.');
  else if (!body.rows.length && entries.length === 1 && sharedOnly) notes.push('Clear “Shared measures only” to see individual estimates.');
  else if (!body.rows.length && !sharedOnly) notes.push('No estimates for these activities.');
  view('electronics-credit').hidden = !entries.some(entry => entry.group.id === 'digital-devices' || entry.afterGroup.id === 'digital-devices');
  view('measure-note').textContent = notes.join(' ');
  view('measure-note').hidden = !notes.length;
}

function openAdvancedCards() {
  return Array.from(view('choices').querySelectorAll('.choice'), card => Boolean(card.querySelector('.advanced')?.open));
}

function renderAll(open = []) {
  const cards = choices.map((_, index) => renderCard(index, open[index]));
  view('choices').replaceChildren(...cards);
  renderResults();
}

addChoiceButton.addEventListener('click', () => {
  const open = openAdvancedCards();
  choices.push(null);
  setCustom();
  renderAll(open);
  const trigger = view('activity-' + choiceLetter(choices.length - 1));
  trigger.focus();
  trigger.click();
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
  questionForm.invalidate();
  choices = preset.choices.map(item => ({ ...item, kind: preset.mode === 'footprints' ? 'footprint' : item.after ? 'swap' : 'skip' }));
  view('examples').value = id;
  renderAll();
  view('result-rows').scrollLeft = 0;
}

function setCustom() {
  questionForm.invalidate();
  view('examples').value = 'custom';
}

const questionForm = setupQuestionForm(({ choices: plan, horizon }) => {
  if (!plan.every(validCatalogueChoice) || (horizon !== undefined && !validHorizon(horizon))) {
    throw new Error('The suggested choices could not be applied.');
  }
  if (horizon) setComparisonHorizon(horizon);
  choices = plan.map(choice => ({ ...choice }));
  view('examples').value = 'custom';
  renderAll();
  view('result-rows').scrollLeft = 0;
});
const shareGridIds = [...gridOptions.keys()];
sharing = setupSharing(() => ({
  choices, horizon: comparisonHorizon, sharedOnly: view('shared-only').checked,
  grid: gridSelect.value
}), validCatalogueChoice, shareGridIds);

view('comparison-horizon').addEventListener('input', questionForm.invalidate);
view('comparison-horizon').addEventListener('change', questionForm.invalidate);

view('result-rows').addEventListener('keydown', event => {
  const region = event.currentTarget;
  if (event.target !== region || region.scrollWidth <= region.clientWidth || event.metaKey || event.altKey || event.ctrlKey) return;
  const distance = { ArrowLeft: -48, ArrowRight: 48, Home: -region.scrollWidth, End: region.scrollWidth }[event.key];
  if (!distance) return;
  event.preventDefault();
  region.scrollLeft += distance;
});

view('choices').addEventListener('input', event => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !['amount', 'times'].includes(input.dataset.field)) return;
  const card = input.closest('.choice');
  const choice = choices[Number(card.dataset.index)];
  const scale = input.dataset.field === 'amount' ? portionUnit(byId.get(choice.group)).scale : 1;
  choice[input.dataset.field] = input.valueAsNumber / scale;
  input.setAttribute('aria-invalid', String(!validAmount(choice[input.dataset.field])));
  updateSchedule(card, choice);
  setCustom();
  renderResults();
});
view('choices').addEventListener('change', event => {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement) || select.dataset.field !== 'period') return;
  const index = Number(select.closest('.choice').dataset.index);
  const choice = choices[index];
  choice.period = select.value;
  if (choice.period === 'once') choice.times = 1;
  setCustom();
  refreshChoice(index, 'period');
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
  if (item.evidenceLabel) record.append(evidenceBadge(item.evidenceLabel));
  if (item.reasoning) record.append(el('p', '', item.reasoning));
  for (const [key, value] of Object.entries(item.values)) {
    const factor = el('p', '', metrics[key].label + ' · ');
    factor.append(el('span', 'number', raw(value)), ' ' + metrics[key].unit);
    record.append(factor);
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
const example = new URLSearchParams(location.search).get('example');
let sharedComparison;
try {
  sharedComparison = comparisonFromURL(location.href, validCatalogueChoice, shareGridIds);
} catch {
  sharing.showError('This comparison link could not be restored. The selected example is shown instead.');
}
if (sharedComparison) {
  choices = sharedComparison.choices;
  view('shared-only').checked = sharedComparison.sharedOnly;
  gridSelect.value = sharedComparison.grid;
  setComparisonHorizon(sharedComparison.horizon);
  view('examples').value = 'custom';
  renderAll();
} else {
  loadPreset(presets.some(preset => preset.id === example) ? example : 'ai-beef');
}
navigate();
