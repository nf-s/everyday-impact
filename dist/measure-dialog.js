import { comparisonMetrics, metrics, defaultHorizon, horizonLabel, horizonExplanation, occurrencesFor, metricForOption, validAmount, formatEstimate, formatDifference, raw } from './model.js';
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

function formula(item, group, choice, total, metricKey, horizon) {
  const factor = raw(item.values[metricKey]);
  const unit = metrics[metricKey].unit;
  const quantityUnit = choice.amount === 1 ? group.singular : group.plural;
  let calculation = factor + ' ' + unit + ' per ' + group.singular + ' × ' + raw(choice.amount) + ' ' + quantityUnit;
  if (choice.times !== 1) calculation += ' × ' + raw(choice.times) + ' times';
  if (choice.period !== 'once') {
    const cadence = { daily: 'day', weekly: 'week', monthly: 'month' }[choice.period];
    const occurrences = occurrencesFor(choice.period, horizon);
    calculation += ' per ' + cadence + ' × ' + raw(occurrences) + ' ' + cadence + (occurrences === 1 ? '' : 's');
  }
  return calculation + ' = ' + raw(total) + ' ' + unit;
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
  if (evidence.method === 'mean') {
    const factors = evidence.contributors.map(member => raw(member.values[metricKey]));
    section.append(el('p', 'measure-dialog-scope', evidence.selection),
      el('p', 'measure-dialog-formula', '(' + factors.join(' + ') + ') ÷ ' + factors.length + ' = ' + raw(item.values[metricKey]) + ' ' + unit),
      el('p', 'measure-dialog-scope', evidence.contributors.map(member => member.label).join(' · ')));
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

function totalLine(label, total, key, unit) {
  const line = el('p', 'measure-dialog-result', label + ' · ');
  line.append(el('span', 'number', total === null ? 'No estimate' : formatEstimate(total, key, 'footprint', unit)));
  return line;
}

function renderEntry(entry, key, unit, horizon) {
  const { letter, title, choice, group, before, after, afterGroup, current, alternative, difference } = entry;
  const section = el('section', 'measure-dialog-entry');
  section.append(el('h3', '', 'Activity ' + letter + ' · ' + title));
  const currentLabel = choice.kind === 'footprint' ? 'Total' : 'Current · ' + before.label;
  section.append(totalLine(currentLabel, current, key, unit));
  if (after) section.append(totalLine('Alternative · ' + after.label, alternative, key, unit));
  if (choice.kind === 'skip') section.append(totalLine('Skip without replacement', alternative, key, unit));
  if (difference !== null) section.append(el('p', 'measure-dialog-result', formatDifference(difference, key, unit)));
  if (choice.kind === 'swap' && !after) section.append(el('p', 'measure-dialog-scope', 'Choose an alternative to see the difference.'));
  if (!validAmount(choice.amount) || !validAmount(choice.times)) {
    section.append(el('p', 'measure-dialog-scope', 'Enter a positive quantity and frequency.'));
  } else if (after && current !== null && alternative !== null && difference === null && key === 'water') {
    section.append(el('p', 'measure-dialog-scope', 'The sources measure different kinds of water use, so a difference is unavailable.'));
  }

  for (const [item, itemGroup, total] of [[before, group, current], [after, afterGroup, alternative]]) {
    if (!item) continue;
    const metricKey = metricForOption(item, key);
    if (metricKey === null) {
      section.append(el('p', 'measure-dialog-scope', 'No published figure for ' + item.label + ' on this measure.'));
      continue;
    }
    if (total === null) continue;
    const calculation = formula(item, itemGroup, choice, total, metricKey, horizon);
    section.append(el('p', 'measure-dialog-formula', after ? item.label + ' · ' + calculation : calculation));
    if (key === 'water' && (item === before || metricKey !== metricForOption(before, key))) {
      section.append(el('p', 'measure-dialog-scope', metrics[metricKey].label + '. ' + metrics[metricKey].note));
    }
    const grid = key === 'carbon' ? item.gridEstimate : null;
    if (grid) {
      const scope = item.energyScope || itemGroup.energyScope || 'Electricity used by this activity';
      section.append(el('p', 'measure-dialog-scope', 'Grid estimate for ' + item.label + ' · ' + grid.label + '. ' + scope + '.'),
        el('p', 'measure-dialog-formula', raw(item.values.energy) + ' kWh per ' + itemGroup.singular + ' × ' + raw(grid.values.carbon) +
          ' kg CO₂e/kWh = ' + raw(item.values.carbon) + ' kg CO₂e per ' + itemGroup.singular),
        el('p', 'measure-dialog-scope', 'This assumes the selected Australian grid supplies the electricity counted in the activity. Other life-cycle emissions are outside this estimate. ' + grid.note));
    }
    showGenericBasis(section, itemGroup, item, grid ? 'energy' : key);
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
    if (!item) continue;
    const note = [item.genericHint, item.note].filter(Boolean).join(' · ');
    if (note) context.append(el('p', '', item.label + ' · ' + note));
  }
  const sources = [...(before.sources || []), ...(after?.sources || []), ...group.sources];
  if (after && afterGroup !== group) {
    if (afterGroup.sourceNote !== group.sourceNote) context.append(el('p', '', afterGroup.sourceNote));
    sources.push(...afterGroup.sources);
  }
  const relevant = sources.filter(source => !source.measure || source.measure === key);
  if (key === 'carbon') {
    for (const [item, itemGroup] of [[before, group], [after, afterGroup]]) {
      if (item?.gridEstimate) relevant.push(...item.gridEstimate.sources, ...[...itemGroup.sources, ...(item.sources || [])].filter(source => source.measure === 'energy'));
    }
  }
  section.append(context, sourceLinks(relevant));
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
  const title = el('h2', '', metric.label + ' over ' + horizonLabel(horizon));
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
