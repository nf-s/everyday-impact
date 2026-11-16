// The factor library and labour evidence pages.
import { groups } from './data/catalogue.js';
import { labourEvidence } from './data/goods.js';
import { metrics, raw } from './model.js';
import { defaultChoice } from './entries.js';
import { el, sourceLinks, evidenceBadge } from './dom.js';

const categories = [...new Set(groups.map(group => group.category))];
const titleCase = text => text.charAt(0).toUpperCase() + text.slice(1);

// onUse receives a catalogue choice at its illustrative schedule.
export function mountLibrary({ search, category, list, count, onUse }) {
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
    const button = el('button', '', 'Add to comparison');
    button.type = 'button';
    button.setAttribute('aria-label', 'Add ' + item.label + ' to comparison');
    button.addEventListener('click', () => onUse(defaultChoice(group, item)));
    actions.append(button);
    record.append(actions);
    return record;
  }

  function render() {
    const text = search.value.trim().toLocaleLowerCase();
    list.replaceChildren();
    let total = 0;
    for (const group of groups) {
      if (category.value && category.value !== group.category) continue;
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
    count.textContent = raw(total) + (total === 1 ? ' example. ' : ' examples. ') + 'Each estimate includes its unit, scope and source.';
    if (!total) list.append(el('p', '', 'No matches. Try another term or category.'));
  }

  category.replaceChildren(new Option('All categories', ''), ...categories.map(name => new Option(titleCase(name), name)));
  search.addEventListener('input', render);
  category.addEventListener('change', render);
  return render;
}

export function mountLabour(list) {
  for (const item of labourEvidence) {
    const article = el('article', 'record');
    article.append(el('p', 'scope', item.brand), el('h2', '', item.title), el('p', '', item.detail), el('p', '', item.scope), sourceLinks(item.sources));
    list.append(article);
  }
}
