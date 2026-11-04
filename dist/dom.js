export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
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
