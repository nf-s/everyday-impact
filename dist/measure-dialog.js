import { comparisonMetrics, metrics, periods, metricForOption, validAmount, formatEstimate, raw } from './model.js';
import { el, sourceLinks } from './dom.js';

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
  if (!validAmount(choice.amount) || !validAmount(choice.times)) {
    return 'Enter a positive quantity and frequency in Advanced to calculate this estimate.';
  }
  const missing = [before, after].filter(item => item && metricForOption(item, key) === null);
  if (missing.length) return 'The sources have no figure for ' + missing.map(item => item.label).join(' or ') + ' on this measure.';
  return 'The original and replacement activities use different water definitions, so the sources do not support a difference.';
}

function formula({ choice, group, before, after, value }, metricKey) {
  const from = raw(before.values[metricKey]);
  const unit = metrics[metricKey].unit;
  const factor = after ? '(' + from + ' − ' + raw(after.values[metricKey]) + ')' : from;
  const quantityUnit = choice.amount === 1 ? group.singular : group.plural;
  let calculation = factor + ' ' + unit + ' per ' + group.singular + ' × ' + raw(choice.amount) + ' ' + quantityUnit;
  if (choice.times !== 1) calculation += ' × ' + raw(choice.times) + ' times';
  if (choice.period !== 'once') {
    const cadence = { daily: 'day', weekly: 'week', monthly: 'month' }[choice.period];
    calculation += ' per ' + cadence + ' × ' + periods[choice.period].count + ' ' + cadence + 's';
  }
  return calculation + ' = ' + raw(value) + ' ' + unit;
}

function renderEntry(entry, key) {
  const { letter, title, choice, group, before, after, value } = entry;
  const section = el('section', 'measure-dialog-entry');
  section.append(el('h3', '', 'Choice ' + letter + ' · ' + title));
  if (value === null) {
    section.append(el('p', 'measure-dialog-result', 'No estimate'), el('p', 'measure-dialog-scope', missingReason(entry, key)));
  } else {
    const metricKey = metricForOption(before, key);
    const label = choice.kind === 'footprint' ? 'Annual footprint' : 'Annual change';
    section.append(el('p', 'measure-dialog-result', label + ' · ' + formatEstimate(value, key, choice.kind)));
    section.append(el('p', 'measure-dialog-formula', formula(entry, metricKey)));
    if (after) section.append(el('p', 'measure-dialog-scope', 'The change is the original factor minus the replacement factor. A negative result means an increase.'));
    if (choice.kind === 'skip') section.append(el('p', 'measure-dialog-scope', 'Skipping assumes no replacement activity or purchase.'));
    if (key === 'water') section.append(el('p', 'measure-dialog-scope', metrics[metricKey].label + '. ' + metrics[metricKey].note));
  }

  const context = el('details', 'measure-dialog-scope');
  context.append(el('summary', '', 'Source context and assumptions'), el('p', '', group.sourceNote));
  for (const item of [before, after]) {
    if (item?.note) context.append(el('p', '', item.label + ' · ' + item.note));
  }
  const sources = [...(before.sources || []), ...(after?.sources || []), ...group.sources];
  section.append(context, sourceLinks(sources.filter(source => !source.measure || source.measure === key)));
  if (group.id === 'apparel') {
    const labour = el('a', '', 'Labour evidence for Uniqlo');
    labour.href = '#labour';
    labour.addEventListener('click', () => dialog.close());
    section.append(labour);
  }
  return section;
}

export function showMeasureDetails(key, entries, trigger) {
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
  const intro = el('p', 'measure-dialog-intro', metric.note);
  intro.id = 'measure-dialog-description';
  modal.replaceChildren(header, intro, ...entries.map(entry => renderEntry(entry, key)));
  modal.showModal();
  modal.scrollTop = 0;
  close.focus({ preventScroll: true });
}
