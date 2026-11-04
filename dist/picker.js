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

let openPicker;

function positionOpenPicker(reanchor = false) {
  if (!openPicker) return;
  const { input, panel, hide } = openPicker;
  if (!input.isConnected) {
    hide();
    return;
  }
  let anchor = input.getBoundingClientRect();
  const strip = input.closest('.choices')?.getBoundingClientRect();
  const viewport = window.visualViewport;
  const left = viewport?.offsetLeft ?? 0;
  const top = viewport?.offsetTop ?? 0;
  const width = viewport?.width ?? document.documentElement.clientWidth;
  const height = viewport?.height ?? window.innerHeight;
  if (strip && (anchor.right <= strip.left || anchor.left >= strip.right)) {
    hide();
    return;
  }
  const gap = 8;
  if (reanchor && (anchor.top < top || anchor.bottom > top + height || Math.max(top + height - anchor.bottom, anchor.top - top) < 224)) {
    window.scrollBy({ top: anchor.top - top - gap, behavior: 'instant' });
    anchor = input.getBoundingClientRect();
  }
  if (anchor.bottom <= top || anchor.top >= top + height) {
    hide();
    return;
  }
  const below = top + height - anchor.bottom - gap * 2;
  const above = anchor.top - top - gap * 2;
  const placeAbove = below < 200 && above > below;
  const panelWidth = Math.min(Math.max(anchor.width, 350), width - gap * 2);
  panel.style.width = panelWidth + 'px';
  panel.style.maxHeight = Math.max(80, placeAbove ? above : below) + 'px';
  panel.style.left = Math.max(left + gap, Math.min(anchor.left, left + width - panelWidth - gap)) + 'px';
  panel.style.top = (placeAbove ? anchor.top - panel.offsetHeight - gap : anchor.bottom + gap) + 'px';
}

window.addEventListener('resize', () => positionOpenPicker(true));
window.visualViewport?.addEventListener('resize', () => positionOpenPicker(true));
window.visualViewport?.addEventListener('scroll', () => positionOpenPicker());
document.addEventListener('scroll', event => {
  if (event.target === document || event.target.id === 'choices') positionOpenPicker();
}, true);
document.addEventListener('pointerdown', event => {
  if (openPicker && !openPicker.wrapper.contains(event.target)) openPicker.hide();
});

export function activityPicker(entries, current, letter, onSelect, options = {}) {
  const wrapper = el('div', 'picker');
  const labelText = options.label || 'Choice ' + letter;
  const suffix = String(letter).replace(/[^a-zA-Z0-9_-]/g, '-');
  const label = el('label', '', labelText);
  label.htmlFor = 'activity-' + suffix;
  const search = el('div', 'picker-search');
  const input = el('input');
  input.type = 'search';
  input.id = label.htmlFor;
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.placeholder = 'Search or browse';
  input.defaultValue = current;
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  const panel = el('div', 'picker-panel');
  panel.popover = 'manual';
  panel.hidden = true;
  const toolbar = el('div', 'picker-toolbar');
  const back = el('button', 'picker-back', 'Back');
  back.type = 'button';
  back.hidden = true;
  const breadcrumb = el('nav', 'picker-breadcrumb');
  breadcrumb.setAttribute('aria-label', 'Activity categories');
  const close = el('button', 'picker-close', 'Close');
  close.type = 'button';
  const status = el('p', 'picker-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const list = el('div', 'picker-list');
  list.id = 'options-' + suffix;
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Browse categories for choice ' + letter);
  input.setAttribute('aria-controls', list.id);
  toolbar.append(back, breadcrumb, close);
  const more = el('button', 'picker-more', 'Show more');
  more.type = 'button';
  more.hidden = true;
  const coverageFilter = el('label', 'picker-coverage-filter');
  const coverageCheckbox = el('input');
  coverageCheckbox.type = 'checkbox';
  coverageFilter.append(coverageCheckbox, 'Only items with a shared measure');
  coverageFilter.hidden = typeof options.coverage !== 'function';
  coverageCheckbox.addEventListener('change', () => render());
  panel.append(toolbar, coverageFilter, status, list, more);
  search.append(input, panel);
  wrapper.append(label, search);

  let path = [];
  let specifics = false;
  let visible = [];
  let active = -1;
  let limit = pageSize;
  function hide() {
    if (panel.isConnected && !panel.hidden) panel.hidePopover?.();
    panel.hidden = true;
    input.value = input.defaultValue;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    if (openPicker?.panel === panel) openPicker = null;
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
    input.focus({ preventScroll: true });
    render();
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
      input.focus({ preventScroll: true });
      render();
    }
    else {
      hide();
      onSelect(row.entry);
    }
  }
  function render(keepPosition = false) {
    const scrollTop = keepPosition ? list.scrollTop : 0;
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
    list.scrollTop = scrollTop;
    breadcrumb.scrollLeft = breadcrumb.scrollWidth;
    positionOpenPicker(true);
  }
  function show(query = '') {
    if (openPicker?.panel !== panel) openPicker?.hide();
    openPicker = { wrapper, input, panel, hide };
    input.value = query;
    panel.hidden = false;
    panel.showPopover?.();
    input.setAttribute('aria-expanded', 'true');
    render();
  }
  close.addEventListener('click', () => { hide(); input.focus({ preventScroll: true }); });
  back.addEventListener('click', () => {
    if (input.value) {
      input.value = '';
      input.focus({ preventScroll: true });
      render();
    } else navigate(specifics ? path : path.slice(0, -1));
  });
  more.addEventListener('click', () => {
    const next = limit;
    input.focus({ preventScroll: true });
    limit += pageSize;
    render(true);
    highlight(Math.min(next, visible.length - 1));
  });
  input.addEventListener('focus', () => { if (panel.hidden) input.select(); });
  input.addEventListener('click', () => { if (panel.hidden) { path = []; specifics = false; show(); } });
  input.addEventListener('input', () => show(input.value));
  wrapper.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      event.stopPropagation();
      hide();
      input.focus({ preventScroll: true });
    }
  });
  input.addEventListener('keydown', event => {
    const arrow = event.key === 'ArrowDown' || event.key === 'ArrowUp';
    const boundary = (event.key === 'Home' || event.key === 'End') && !input.value;
    if ((arrow || boundary) && (!panel.hidden || arrow)) {
      event.preventDefault();
      if (panel.hidden) show();
      if (visible.length) {
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1 : event.key === 'ArrowDown' ? Math.min(active + 1, visible.length - 1) : Math.max(active - 1, 0);
        if (next >= limit) {
          limit = Math.ceil((next + 1) / pageSize) * pageSize;
          render(true);
        }
        highlight(next);
      }
    } else if ((event.key === 'Enter' || event.key === 'ArrowRight') && !panel.hidden && visible.length) {
      if (event.key === 'ArrowRight' && (input.value || visible[Math.max(0, active)].type === 'item')) return;
      event.preventDefault();
      activate(visible[Math.max(0, active)]);
    } else if (event.key === 'ArrowLeft' && !panel.hidden && !input.value && (path.length || specifics)) {
      event.preventDefault();
      navigate(specifics ? path : path.slice(0, -1));
    }
  });
  wrapper.addEventListener('focusout', event => { if (!wrapper.contains(event.relatedTarget)) hide(); });
  return wrapper;
}
