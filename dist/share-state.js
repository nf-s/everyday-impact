import { periods, validAmount, validHorizon } from './model.js';

const version = 1;
const maxChoices = 50;
const maxStateLength = 16000;
export class ShareLimitError extends Error {}
const id = value => typeof value === 'string' && /^[A-Za-z0-9._-]{1,160}$/.test(value);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const invalid = () => new Error('This comparison link is invalid or uses unavailable catalogue entries.');

function cleanChoice(value, validateChoice) {
  if (value === null) return null;
  if (!object(value) || !id(value.group) || !id(value.before) ||
      !['footprint', 'swap', 'skip'].includes(value.kind) || !validAmount(value.amount) || !validAmount(value.times) ||
      typeof value.period !== 'string' || !Object.hasOwn(periods, value.period) ||
      (value.period === 'once' && value.times !== 1) ||
      (value.afterGroup !== undefined && !id(value.afterGroup))) throw invalid();
  if (value.kind === 'swap' ? !id(value.after) : value.after !== null || value.afterGroup !== undefined) throw invalid();
  const choice = {
    group: value.group, before: value.before, after: value.after, kind: value.kind,
    amount: value.amount, period: value.period, times: value.times,
    ...(value.afterGroup === undefined ? {} : { afterGroup: value.afterGroup })
  };
  if (!validateChoice(choice)) throw invalid();
  return choice;
}

function cleanState(value, validateChoice, gridIds) {
  if (Array.isArray(value?.choices) && value.choices.length > maxChoices) {
    throw new ShareLimitError('Share links support up to 50 choices. Remove some choices and try again.');
  }
  if (!object(value) || !Array.isArray(value.choices) || value.choices.length < 1 || value.choices.length > maxChoices ||
      !validHorizon(value.horizon) || typeof value.sharedOnly !== 'boolean' ||
      (value.grid !== undefined && value.grid !== '' && (!id(value.grid) || !gridIds.includes(value.grid)))) throw invalid();
  return {
    choices: value.choices.map(choice => cleanChoice(choice, validateChoice)),
    horizon: { amount: value.horizon.amount, unit: value.horizon.unit },
    sharedOnly: value.sharedOnly, grid: value.grid || ''
  };
}

export function serializeComparison(value, validateChoice, gridIds = []) {
  const state = cleanState(value, validateChoice, gridIds);
  const encoded = JSON.stringify({
    v: version,
    c: state.choices.map(choice => choice === null ? null : [choice.group, choice.before, choice.after, choice.kind, choice.amount, choice.period, choice.times, ...(choice.afterGroup ? [choice.afterGroup] : [])]),
    h: [state.horizon.amount, state.horizon.unit], s: state.sharedOnly,
    ...(state.grid ? { g: state.grid } : {})
  });
  if (encoded.length > maxStateLength) throw new ShareLimitError('This comparison link is too long. Remove some choices and try again.');
  return encoded;
}

export function parseComparison(encoded, validateChoice, gridIds = []) {
  if (typeof encoded !== 'string' || !encoded || encoded.length > maxStateLength) throw invalid();
  let wire;
  try { wire = JSON.parse(encoded); } catch { throw invalid(); }
  if (!object(wire) || wire.v !== version || Object.keys(wire).some(key => !['v', 'c', 'h', 's', 'g'].includes(key)) ||
      !Array.isArray(wire.c) || !Array.isArray(wire.h) || wire.h.length !== 2) throw invalid();
  const choices = wire.c.map(row => {
    if (row === null) return null;
    if (!Array.isArray(row) || ![7, 8].includes(row.length)) throw invalid();
    const [group, before, after, kind, amount, period, times, afterGroup] = row;
    return { group, before, after, kind, amount, period, times, ...(row.length === 8 ? { afterGroup } : {}) };
  });
  return cleanState({ choices, horizon: { amount: wire.h[0], unit: wire.h[1] }, sharedOnly: wire.s, grid: wire.g }, validateChoice, gridIds);
}

// Only share construction uses this override; opening a local page never redirects.
export function portableShareBase(base, canonical) {
  const url = new URL(base);
  const hostname = url.hostname.toLowerCase();
  const loopback = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '[::1]' || /^127(?:\.\d{1,3}){3}$/.test(hostname);
  if (!loopback || !canonical) return url.href;
  const target = new URL(canonical);
  if (target.protocol !== 'https:' || target.username || target.password) throw new Error('Invalid canonical comparison URL.');
  return target.href;
}

export function comparisonURL(base, state, validateChoice, gridIds = []) {
  const url = new URL(base);
  url.search = '';
  url.hash = 'compare';
  url.searchParams.set('comparison', serializeComparison(state, validateChoice, gridIds));
  if (url.href.length > maxStateLength) throw new ShareLimitError('This comparison link is too long. Remove some choices and try again.');
  return url.href;
}

export function comparisonFromURL(base, validateChoice, gridIds = []) {
  const values = new URL(base).searchParams.getAll('comparison');
  if (!values.length) return null;
  if (values.length !== 1) throw invalid();
  return parseComparison(values[0], validateChoice, gridIds);
}
