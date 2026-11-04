// Match complete words first so "AI" ranks ahead of unrelated words like "rail".
function words(text) {
  return text.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').match(/[a-z0-9]+/g) || [];
}

function matches(entries, query) {
  const terms = words(query);
  if (!terms.length) return entries;
  const ranked = [];
  for (const entry of entries) {
    const title = words(entry.label);
    const all = [...title, ...words(entry.groupLabel + ' ' + entry.aliases)];
    if (!terms.every(term => all.some(word => word.startsWith(term)))) continue;
    const score = terms.reduce((total, term) => total +
      (title.includes(term) ? 3 : all.includes(term) ? 2 : title.some(word => word.startsWith(term)) ? 1 : 0), 0);
    ranked.push({ entry, score });
  }
  return ranked.sort((a, b) => b.score - a.score).map(result => result.entry);
}

function closeList(input, list) {
  if (!list.hidden && list.isConnected) list.hidePopover?.();
  list.hidden = true;
  input.value = input.defaultValue;
  input.setAttribute('aria-expanded', 'false');
  input.removeAttribute('aria-activedescendant');
}

// Place the list outside the scrolling strip, following its input while it is visible.
function positionOpenList() {
  const list = document.querySelector('.picker-list:not([hidden])');
  if (!list) return;
  const input = list.previousElementSibling;
  const anchor = input.getBoundingClientRect();
  const strip = input.closest('.choices').getBoundingClientRect();
  const viewport = window.visualViewport;
  const left = viewport?.offsetLeft ?? 0;
  const top = viewport?.offsetTop ?? 0;
  const width = viewport?.width ?? document.documentElement.clientWidth;
  const height = viewport?.height ?? window.innerHeight;
  if (anchor.right <= strip.left || anchor.left >= strip.right || anchor.bottom <= top || anchor.top >= top + height) {
    closeList(input, list);
    return;
  }
  const gap = 6;
  const roomBelow = top + height - anchor.bottom - 2 * gap;
  const roomAbove = anchor.top - top - 2 * gap;
  const above = roomBelow < 150 && roomAbove > roomBelow;
  const listWidth = Math.min(anchor.width, width - 2 * gap);
  list.style.width = listWidth + 'px';
  list.style.setProperty('--list-room', Math.max(0, above ? roomAbove : roomBelow) + 'px');
  list.style.left = Math.max(left + gap, Math.min(anchor.left, left + width - listWidth - gap)) + 'px';
  list.style.top = (above ? anchor.top - list.offsetHeight - gap : anchor.bottom + gap) + 'px';
}

window.addEventListener('resize', positionOpenList);
window.visualViewport?.addEventListener('resize', positionOpenList);
window.visualViewport?.addEventListener('scroll', positionOpenList);
document.addEventListener('scroll', event => {
  if (event.target === document || event.target.id === 'choices') positionOpenList();
}, true);

export function activityPicker(entries, current, letter, onSelect) {
  const wrapper = document.createElement('div');
  wrapper.className = 'picker';
  const label = document.createElement('label');
  label.htmlFor = 'activity-' + letter;
  label.textContent = 'Choice ' + letter;
  const input = document.createElement('input');
  input.type = 'search';
  input.id = label.htmlFor;
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.placeholder = 'Search activities or items';
  input.defaultValue = current;
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  const list = document.createElement('div');
  list.className = 'picker-list';
  list.id = 'options-' + letter;
  list.popover = 'manual';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Activities for choice ' + letter);
  input.setAttribute('aria-controls', list.id);
  list.hidden = true;
  const search = document.createElement('div');
  search.className = 'picker-search';
  search.append(input, list);
  wrapper.append(label, search);

  let visible = [];
  let active = -1;
  function hide() {
    closeList(input, list);
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
  function show(query) {
    active = -1;
    input.removeAttribute('aria-activedescendant');
    visible = matches(entries, query);
    list.replaceChildren();
    visible.forEach((entry, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'picker-option';
      option.id = list.id + '-' + index;
      option.tabIndex = -1;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      const title = document.createElement('strong');
      title.textContent = entry.label;
      const group = document.createElement('small');
      group.textContent = entry.groupLabel;
      option.append(title, group);
      option.addEventListener('mousedown', event => event.preventDefault());
      option.addEventListener('click', () => onSelect(entry));
      list.append(option);
    });
    if (!visible.length) {
      const empty = document.createElement('p');
      empty.className = 'option-group';
      empty.textContent = 'No matching activities';
      list.append(empty);
    }
    list.hidden = false;
    list.showPopover?.();
    list.scrollTop = 0;
    input.setAttribute('aria-expanded', 'true');
    positionOpenList();
  }

  input.addEventListener('focus', () => input.select());
  input.addEventListener('click', () => {
    if (list.hidden) {
      input.select();
      show('');
    }
  });
  input.addEventListener('input', () => show(input.value));
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault();
      hide();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (list.hidden) show('');
      if (visible.length) highlight(event.key === 'ArrowDown' ? (active + 1) % visible.length : (active <= 0 ? visible.length - 1 : active - 1));
    } else if (event.key === 'Enter' && !list.hidden) {
      event.preventDefault();
      if (visible.length) onSelect(visible[Math.max(0, active)]);
    }
  });
  wrapper.addEventListener('focusout', event => {
    if (!wrapper.contains(event.relatedTarget)) hide();
  });
  return wrapper;
}
