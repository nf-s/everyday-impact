import { comparisonMetrics, metrics, defaultHorizon, horizonLabel, horizonExplanation, occurrencesFor, metricForOption, validAmount, formatEstimate, raw } from './model.js';
import { el, sourceLinks, evidenceBadge } from './dom.js';

let dialog;
let opener;

function getDialog() {
  if (dialog) return dialog;
  dialog = el('dialog', 'measure-dialog');
  dialog.setAttribute('aria-labelledby', 'measure-dialog-title');
  dialog.setAttribute('aria-describedby', 'measure-dialog-description');
  dialog.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  });
  document.body.append(dialog);
  return dialog;
}

function missingReason({ choice, before, after }, key) {
  if (choice.kind === 'swap' && !after) return 'Choose a replacement in Advanced to calculate the change.';
  if (!validAmount(choice.amount) || !validAmount(choice.times)) {
    return 'Enter a positive quantity and frequency in Advanced to calculate this estimate.';
  }
  const missing = [before, after].filter(item => item && metricForOption(item, key) === null);
  if (missing.length) return 'The sources have no figure for ' + missing.map(item => item.label).join(' or ') + ' on this measure.';
  return 'The original and replacement activities use different water definitions, so the sources do not support a difference.';
}

function formula({ choice, group, before, after, value }, metricKey, horizon) {
  const from = raw(before.values[metricKey]);
  const unit = metrics[metricKey].unit;
  const factor = after ? '(' + from + ' − ' + raw(after.values[metricKey]) + ')' : from;
  const quantityUnit = choice.amount === 1 ? group.singular : group.plural;
  let calculation = factor + ' ' + unit + ' per ' + group.singular + ' × ' + raw(choice.amount) + ' ' + quantityUnit;
  if (choice.times !== 1) calculation += ' × ' + raw(choice.times) + ' times';
  if (choice.period !== 'once') {
    const cadence = { daily: 'day', weekly: 'week', monthly: 'month' }[choice.period];
    const occurrences = occurrencesFor(choice.period, horizon);
    calculation += ' per ' + cadence + ' × ' + raw(occurrences) + ' ' + cadence + (occurrences === 1 ? '' : 's');
  }
  return calculation + ' = ' + raw(value) + ' ' + unit;
}

function showGenericBasis(section, group, item, key) {
  const evidence = item?.genericEvidence;
  const metricKey = metricForOption(item, key);
  if (!evidence || !metricKey) return;
  const unit = metrics[metricKey].unit + ' per ' + group.singular;
  if (evidence.method === 'representative') {
    section.append(el('p', 'measure-dialog-scope', item.label + ' uses ' + evidence.contributors[0].label + ' as its reference.'));
    return;
  }
  const sorted = [...evidence.contributors].sort((a, b) => a.values[metricKey] - b.values[metricKey]);
  const mid = Math.floor(sorted.length / 2);
  const middle = sorted.length % 2 ? raw(sorted[mid].values[metricKey]) :
    '(' + raw(sorted[mid - 1].values[metricKey]) + ' + ' + raw(sorted[mid].values[metricKey]) + ') ÷ 2';
  section.append(el('p', 'measure-dialog-scope', item.label + ' uses the median of ' + sorted.length +
    ' source values. The middle ' + (sorted.length % 2 ? 'value is ' : 'pair gives ') + middle + ' ' + unit + '.'));
  const details = el('details', 'measure-dialog-scope');
  details.append(el('summary', '', 'Source values for ' + item.label), el('p', '', evidence.selection));
  const list = el('ol', 'source-values');
  for (const member of sorted) {
    const name = member.id ? member.label + ' (' + member.id + ')' : member.label;
    const row = el('li', '', name + ' · ' + raw(member.values[metricKey]) + ' ' + unit);
    list.append(row);
  }
  details.append(list);
  section.append(details);
}

function renderEntry(entry, key, unit, horizon) {
  const { letter, title, choice, group, before, after, afterGroup, value } = entry;
  const section = el('section', 'measure-dialog-entry');
  section.append(el('h3', '', 'Choice ' + letter + ' · ' + title));
  if (value === null) {
    section.append(el('p', 'measure-dialog-result', 'No estimate'), el('p', 'measure-dialog-scope', missingReason(entry, key)));
  } else {
    const metricKey = metricForOption(before, key);
    const label = (choice.kind === 'footprint' ? 'Footprint' : 'Change') + ' over ' + horizonLabel(horizon);
    section.append(el('p', 'measure-dialog-result', label + ' · ' + formatEstimate(value, key, choice.kind, unit)));
    section.append(el('p', 'measure-dialog-formula', formula(entry, metricKey, horizon)));
    showGenericBasis(section, group, before, key);
    if (after && after !== before) showGenericBasis(section, afterGroup, after, key);
    if (after) section.append(el('p', 'measure-dialog-scope', 'The change is the original factor minus the replacement factor. A negative result means an increase.'));
    if (choice.kind === 'skip') section.append(el('p', 'measure-dialog-scope', 'Skipping assumes no replacement activity or purchase.'));
    if (key === 'water') section.append(el('p', 'measure-dialog-scope', metrics[metricKey].label + '. ' + metrics[metricKey].note));
  }

  for (const item of new Set([before, after])) {
    if (!item?.evidenceLabel || !metricForOption(item, key)) continue;
    const evidence = el('div', 'measure-evidence');
    if (after) evidence.append(el('strong', '', item.label + ' '));
    evidence.append(evidenceBadge(item.evidenceLabel));
    if (item.reasoning) evidence.append(el('p', '', item.reasoning));
    section.append(evidence);
  }
  const context = el('details', 'measure-dialog-scope');
  context.append(el('summary', '', 'Source context and assumptions'), el('p', '', group.sourceNote));
  for (const item of [before, after]) {
    if (item?.note) context.append(el('p', '', item.label + ' · ' + item.note));
  }
  const sources = [...(before.sources || []), ...(after?.sources || []), ...group.sources];
  if (after && afterGroup !== group) {
    if (afterGroup.sourceNote !== group.sourceNote) context.append(el('p', '', afterGroup.sourceNote));
    sources.push(...afterGroup.sources);
  }
  section.append(context, sourceLinks(sources.filter(source => !source.measure || source.measure === key)));
  if (group.id === 'apparel') {
    const labour = el('a', '', 'Labour evidence for Uniqlo');
    labour.href = '#labour';
    labour.addEventListener('click', () => dialog.close());
    section.append(labour);
  }
  return section;
}

export function showMeasureDetails(key, entries, trigger, unit, horizon = defaultHorizon) {
  const modal = getDialog();
  opener = trigger;
  const header = el('div', 'dialog-header');
  const metric = comparisonMetrics[key];
  const title = el('h2', '', metric.label + ' · calculation details');
  title.id = 'measure-dialog-title';
  const close = el('button', 'dialog-close', 'Close');
  close.type = 'button';
  close.addEventListener('click', () => modal.close());
  header.append(title, close);
  const intro = el('p', 'measure-dialog-intro', metric.note + ' ' + horizonExplanation(horizon));
  intro.id = 'measure-dialog-description';
  modal.replaceChildren(header, intro, ...entries.map(entry => renderEntry(entry, key, unit, horizon)));
  modal.showModal();
  modal.scrollTop = 0;
  close.focus({ preventScroll: true });
}
