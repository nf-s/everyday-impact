export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const present = children => children.flat(Infinity).filter(child => child !== null && child !== undefined && child !== false);

function assign(node, attributes) {
  for (const [name, value] of Object.entries(attributes)) {
    if (value === false || value === null || value === undefined) continue;
    if (name === 'class') node.setAttribute('class', value);
    else if (name === 'text') node.textContent = value;
    else if (name.startsWith('on')) node.addEventListener(name.slice(2), value);
    else if (name === 'dataset') Object.assign(node.dataset, value);
    else node.setAttribute(name, value === true ? '' : value);
  }
}

// Builds an element from attributes and children. Empty children are skipped and lists are flattened.
export function h(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  assign(node, attributes);
  node.append(...present(children));
  return node;
}

export function svg(tag, attributes = {}, ...children) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  assign(node, attributes);
  node.append(...present(children));
  return node;
}

export function fill(node, ...children) {
  node.replaceChildren(...present(children));
  return node;
}

// Rebuilt controls carry a data-focus key so keyboard focus can follow them.
export function refocus(key) {
  for (const node of document.querySelectorAll('[data-focus]')) {
    if (node.dataset.focus === key && node.offsetParent !== null) return node.focus({ preventScroll: true });
  }
}

const evidenceIcons = {
  'Modelled scenario': 'M5 2h6 M6 2v4l-4 6a1 1 0 0 0 1 2h10a1 1 0 0 0 1-2l-4-6V2 M4 10h8',
  'Limited disclosure': 'M8 2 1.5 14h13L8 2Z M8 6v3 M8 11.3v.3',
  'Benchmark': 'M2 9 9 2l5 5-7 7-5-5Z M7 4l2 2 M5 6l1 1',
  'Provider study': 'M4 1.5h6l3 3V14H4Z M10 2v3h3 M6 8h5 M6 10.5h5',
  'Published model': 'M4 1.5h6l3 3V14H4Z M10 2v3h3 M6 8h5 M6 10.5h5'
};

export function evidenceBadge(label) {
  const badge = el('span', 'evidence-badge');
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 16 16');
  icon.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', evidenceIcons[label]);
  icon.append(path);
  badge.append(icon, label === 'Modelled scenario' ? 'AI-modelled scenario' : label);
  return badge;
}

export function sourceLinks(sources) {
  const links = el('div', 'source-links');
  const unique = new Map(sources.map(source => [source.url, source]));
  for (const source of unique.values()) {
    const link = el('a', '', source.label);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    links.append(link);
  }
  return links;
}
