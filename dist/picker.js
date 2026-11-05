import { el, evidenceBadge } from './dom.js';

const pageSize = 12;

// Word prefixes keep searches such as "AI" separate from unrelated words like "rail".
function words(text) {
  return String(text || '').toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').match(/[a-z0-9]+/g) || [];
}

function pathFor(entry) {
  const supplied = Array.isArray(entry.categoryPath) && entry.categoryPath.length
    ? entry.categoryPath : [entry.categoryLabel || 'Activities', entry.groupLabel || entry.choice?.group || 'Items'];
  return supplied.filter(name => typeof name === 'string' && name.trim()).map(name => name.trim())
    .filter((name, index, names) => !index || name.toLowerCase() !== names[index - 1].toLowerCase());
}

// Entry arrays are immutable catalogue snapshots; cards share a lazy search index.
const searchIndexes = new WeakMap();
function indexFor(entries) {
  const cached = searchIndexes.get(entries);
  if (cached) return cached;
  const indexed = entries.map((entry, index) => {
    const title = words(entry.label);
    const categoryPath = pathFor(entry);
    return { entry, index, title, path: categoryPath, all: [...title, ...words(categoryPath.join(' ')), ...words(entry.groupLabel), ...words(entry.categoryLabel), ...words(entry.aliases)] };
  });
  searchIndexes.set(entries, indexed);
  return indexed;
}

function rankedMatches(indexed, query) {
  const terms = words(query);
  return indexed.map(item => {
    const { index, title, all } = item;
    if (!terms.every(term => all.some(word => word.startsWith(term)))) return null;
    const exactTitle = title.join(' ') === terms.join(' ');
    const score = (exactTitle ? 100 : 0) + (item.entry.generic ? 4 : 0) + terms.reduce((sum, term) => sum +
      (title.includes(term) ? 10 : title.some(word => word.startsWith(term)) ? 6 : all.includes(term) ? 3 : 1), 0);
    return { item, index, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.index - b.index).map(result => result.item);
}

function sizeOpenPicker() {
  const panel = document.querySelector('.picker-panel[open]');
  const viewport = window.visualViewport;
  if (!panel || !viewport) return;
  panel.style.setProperty('--picker-height', viewport.height + 'px');
  panel.style.setProperty('--picker-width', viewport.width + 'px');
  panel.style.setProperty('--picker-top', viewport.offsetTop + 'px');
  panel.style.setProperty('--picker-left', viewport.offsetLeft + 'px');
}

window.visualViewport?.addEventListener('resize', sizeOpenPicker);
window.visualViewport?.addEventListener('scroll', sizeOpenPicker);

export function activityPicker(entries, current, letter, onSelect, options = {}) {
  const wrapper = el('div', 'picker');
  const labelText = options.label || 'Choice ' + letter;
  const suffix = String(letter).replace(/[^a-zA-Z0-9_-]/g, '-');
  const label = el('label', '', labelText);
  label.htmlFor = 'activity-' + suffix;
  label.id = 'label-' + suffix;
  const trigger = el('button', 'picker-trigger');
  trigger.type = 'button';
  trigger.id = label.htmlFor;
  const value = el('span', '', current || 'Search or browse');
  value.id = 'selected-' + suffix;
  trigger.append(value);
  trigger.setAttribute('aria-labelledby', label.id + ' ' + value.id);
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  const panel = el('dialog', 'picker-panel');
  panel.id = 'picker-' + suffix;
  panel.setAttribute('aria-label', labelText);
  trigger.setAttribute('aria-controls', panel.id);
  const input = el('input');
  input.type = 'search';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.placeholder = 'Search activities';
  input.setAttribute('aria-label', input.placeholder);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'true');
  const toolbar = el('div', 'picker-toolbar');
  const navigation = el('div', 'picker-navigation');
  const back = el('button', 'picker-back', 'Back');
  back.type = 'button';
  back.hidden = true;
  const breadcrumb = el('nav', 'picker-breadcrumb');
  breadcrumb.setAttribute('aria-label', 'Activity categories');
  const close = el('button', 'picker-close', 'Close');
  close.type = 'button';
  close.autofocus = true;
  const status = el('p', 'picker-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const list = el('div', 'picker-list');
  list.id = 'options-' + suffix;
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Browse categories for choice ' + letter);
  input.setAttribute('aria-controls', list.id);
  toolbar.append(input, close);
  navigation.append(back, breadcrumb);
  const more = el('button', 'picker-more', 'Show more');
  more.type = 'button';
  more.hidden = true;
  const coverageFilter = el('label', 'picker-coverage-filter');
  const coverageCheckbox = el('input');
  coverageCheckbox.type = 'checkbox';
  coverageFilter.append(coverageCheckbox, 'Only items with a shared measure');
  coverageFilter.hidden = typeof options.coverage !== 'function';
  coverageCheckbox.addEventListener('change', () => render());
  const results = el('div', 'picker-results');
  if (options.onSkip) {
    const skip = el('button', 'picker-skip', 'Skip this activity');
    skip.type = 'button';
    skip.addEventListener('click', () => {
      panel.close();
      options.onSkip();
    });
    results.append(skip);
  }
  results.append(navigation, coverageFilter, status, list, more);
  panel.append(toolbar, results);
  wrapper.append(label, trigger, panel);

  let path = [];
  let specifics = false;
  let visible = [];
  let active = -1;
  let limit = pageSize;
  function focusForBrowsing() {
    const target = window.matchMedia('(pointer: coarse)').matches ? close : input;
    target.focus({ preventScroll: true });
  }
  function highlight(index) {
    active = index;
    Array.from(list.children).forEach((option, i) => option.setAttribute('aria-selected', String(i === active)));
    const option = list.children[active];
    if (option) {
      input.setAttribute('aria-activedescendant', option.id);
      option.scrollIntoView({ block: 'nearest' });
    }
  }
  function navigate(nextPath) {
    path = nextPath;
    specifics = false;
    input.value = '';
    render();
    focusForBrowsing();
  }
  function crumb(text, action, isCurrent = false) {
    if (isCurrent) {
      const name = el('span', '', text);
      name.setAttribute('aria-current', 'location');
      return name;
    }
    const button = el('button', '', text);
    button.type = 'button';
    button.addEventListener('click', action);
    return button;
  }
  function activate(row) {
    if (row.type === 'branch') navigate([...path, row.label]);
    else if (row.type === 'specifics') {
      specifics = true;
      input.value = '';
      render();
      focusForBrowsing();
    }
    else {
      panel.close();
      onSelect(row.entry);
    }
  }
  function render(keepPosition = false) {
    const scrollTop = keepPosition ? results.scrollTop : 0;
    if (!keepPosition) limit = pageSize;
    const coverage = options.coverage?.();
    coverageFilter.hidden = !coverage?.hasPeers;
    if (coverageFilter.hidden) coverageCheckbox.checked = false;
    const query = input.value.trim();
    const searching = words(query).length > 0;
    back.hidden = !path.length && !specifics && !searching;
    breadcrumb.replaceChildren(crumb('All categories', () => navigate([]), !path.length && !searching));
    if (searching) breadcrumb.append(crumb('Search results', null, true));
    else {
      path.forEach((name, index) => breadcrumb.append(crumb(name, () => navigate(path.slice(0, index + 1)), !specifics && index === path.length - 1)));
      if (specifics) breadcrumb.append(crumb('Specific items', null, true));
    }
    const indexed = coverageCheckbox.checked ? indexFor(entries).filter(item => coverage.describe(item.entry).keys.length) : indexFor(entries);
    const scoped = indexed.filter(item => path.every((name, index) => item.path[index] === name));
    const itemRow = item => ({ type: 'item', label: item.entry.label, detail: [item.entry.generic ? item.entry.genericHint : '', searching ? item.path.join(' · ') : '', item.entry.qualityLabel].filter(Boolean).join(' · '), entry: item.entry });
    if (searching) {
      visible = rankedMatches(indexed, query).map(itemRow);
    } else {
      const direct = scoped.filter(item => item.path.length === path.length);
      const generic = direct.filter(item => item.entry.generic);
      const originals = direct.filter(item => !item.entry.generic);
      const branches = [...new Set(scoped.filter(item => item.path.length > path.length).map(item => item.path[path.length]))].sort((a, b) => a.localeCompare(b));
      const branchRows = branches.map(name => {
        const descendants = scoped.filter(item => item.path[path.length] === name);
        const subgroups = new Set(descendants.filter(item => item.path.length > path.length + 1).map(item => item.path[path.length + 1]));
        const count = subgroups.size || descendants.length;
        const kind = subgroups.size ? 'group' : 'item';
        return { type: 'branch', label: name, detail: count + ' ' + kind + (count === 1 ? '' : 's') };
      });
      if (specifics) visible = originals.map(itemRow);
      else {
        visible = [...generic.map(itemRow), ...branchRows];
        if (generic.length && originals.length) visible.push({ type: 'specifics', label: 'Specific items', detail: originals.length + (originals.length === 1 ? ' item' : ' items') });
        else visible.push(...originals.map(itemRow));
      }
    }
    active = -1;
    input.removeAttribute('aria-activedescendant');
    const kind = visible.some(row => row.type !== 'item') ? 'options' : 'items';
    status.textContent = visible.length ? (visible.length > limit ? limit + ' of ' : '') + visible.length + ' ' + kind : 'No matching items';
    more.hidden = visible.length <= limit;
    more.textContent = 'Show ' + Math.max(0, Math.min(pageSize, visible.length - limit)) + ' more';
    list.setAttribute('aria-label', searching ? 'Search results · ' + labelText : (specifics ? 'Specific items' : path.at(-1) || 'Categories') + ' · ' + labelText);
    list.replaceChildren(...visible.slice(0, limit).map((row, index) => {
      const option = el('button', 'picker-option');
      option.type = 'button';
      option.id = list.id + '-' + index;
      option.tabIndex = -1;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      if (row.type !== 'item') option.setAttribute('aria-label', row.label + ', browse, ' + row.detail);
      option.append(el('strong', '', row.label));
      if (row.detail) option.append(el('small', '', row.detail));
      if (row.entry?.evidenceLabel) option.append(evidenceBadge(row.entry.evidenceLabel));
      if (row.entry && coverage) {
        const hint = coverage.describe(row.entry);
        const count = hint.keys.length + (coverage.hasPeers ? ' shared ' : ' available ') + (hint.keys.length === 1 ? 'measure' : 'measures');
        option.append(el('small', 'picker-coverage', count + (hint.labels.length ? ' · ' + hint.labels.join(' · ') : '')));
        if (hint.note) option.append(el('small', 'picker-coverage-note', hint.note));
      }
      if (row.type !== 'item') option.append(el('span', 'picker-chevron', '›'));
      option.addEventListener('mousedown', event => event.preventDefault());
      option.addEventListener('click', () => activate(row));
      return option;
    }));
    results.scrollTop = scrollTop;
    breadcrumb.scrollLeft = breadcrumb.scrollWidth;
  }
  function show(query = '') {
    path = [];
    specifics = false;
    input.value = query;
    render();
    panel.showModal();
    sizeOpenPicker();
    trigger.setAttribute('aria-expanded', 'true');
    if (query) input.focus();
    else focusForBrowsing();
  }
  trigger.addEventListener('click', () => show());
  trigger.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    const text = event.key.length === 1 && event.key !== ' ';
    if (!text && event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    show(text ? event.key : '');
    input.focus();
    if (!text && visible.length) highlight(0);
  });
  close.addEventListener('click', () => panel.close());
  panel.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', String(panel.open));
    if (!panel.open && trigger.isConnected) trigger.focus({ preventScroll: true });
  });
  panel.addEventListener('click', event => {
    if (event.target !== panel) return;
    const rect = panel.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) panel.close();
  });
  back.addEventListener('click', () => {
    if (input.value) {
      input.value = '';
      render();
      focusForBrowsing();
    } else navigate(specifics ? path : path.slice(0, -1));
  });
  more.addEventListener('click', () => {
    const next = limit;
    focusForBrowsing();
    limit += pageSize;
    render(true);
    highlight(Math.min(next, visible.length - 1));
  });
  input.addEventListener('input', () => render());
  input.addEventListener('keydown', event => {
    const arrow = event.key === 'ArrowDown' || event.key === 'ArrowUp';
    const boundary = (event.key === 'Home' || event.key === 'End') && !input.value;
    if (arrow || boundary) {
      event.preventDefault();
      if (visible.length) {
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1 : event.key === 'ArrowDown' ? Math.min(active + 1, visible.length - 1) : Math.max(active - 1, 0);
        if (next >= limit) {
          limit = Math.ceil((next + 1) / pageSize) * pageSize;
          render(true);
        }
        highlight(next);
      }
    } else if ((event.key === 'Enter' || event.key === 'ArrowRight') && visible.length) {
      if (event.key === 'ArrowRight' && (input.value || visible[Math.max(0, active)].type === 'item')) return;
      event.preventDefault();
      activate(visible[Math.max(0, active)]);
    } else if (event.key === 'ArrowLeft' && !input.value && (path.length || specifics)) {
      event.preventDefault();
      navigate(specifics ? path : path.slice(0, -1));
    }
  });
  return wrapper;
}
