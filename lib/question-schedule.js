import { validAmount, validHorizon } from '../dist/model.js';

export class QuestionScheduleError extends Error {
  constructor(message) { super(message); this.name = 'QuestionScheduleError'; this.code = 'unsupported_schedule'; }
}

const wordNumbers = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, half: 0.5, quarter: 0.25 };
const numberPattern = '(?:(?:one|two|three|four|five|six|seven|eight|nine)\\s+hundred(?:\\s+(?:and\\s+)?(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|one|two|three|four|five|six|seven|eight|nine|ten))?|\\d+(?:,\\d{3})*(?:\\.\\d+)?(?:\\s*\\/\\s*\\d+)?|(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[ -](?:one|two|three|four|five|six|seven|eight|nine)|' + Object.keys(wordNumbers).join('|') + '|½|¼|¾)';
function numeric(text) {
  const value = text.toLowerCase().trim();
  if (Object.hasOwn(wordNumbers, value)) return wordNumbers[value];
  if (value === '½') return 0.5;
  if (value === '¼') return 0.25;
  if (value === '¾') return 0.75;
  if (/\//.test(value)) { const [top, bottom] = value.split('/').map(Number); return top / bottom; }
  if (/[ -]/.test(value) && !/^\d/.test(value)) {
    let total = 0;
    for (const part of value.split(/[ -]/).filter(part => part !== 'and')) total = part === 'hundred' ? total * 100 : total + wordNumbers[part];
    return total;
  }
  return Number(value.replaceAll(',', ''));
}
function fail(message) { throw new QuestionScheduleError(message); }
const periods = { day: 'daily', week: 'weekly', month: 'monthly', year: 'monthly' };
function cadence(text) {
  const result = [];
  const pattern = new RegExp('\\b(?:(once|twice|thrice|' + numberPattern + '\\s+times?)\\s*)?(?:per\\s+|each\\s+|every\\s+|a\\s+|/\\s*)(?:(every)\\s+)?(' + numberPattern + '\\s+)?(day|week|month|year)s?\\b', 'gi');
  for (const match of text.matchAll(pattern)) {
    const count = match[1] ? ({ once: 1, twice: 2, thrice: 3 }[match[1].toLowerCase()] ?? numeric(match[1].replace(/\s+times?$/i, ''))) : 1;
    const interval = match[3] ? numeric(match[3]) : 1;
    result.push({ period: periods[match[4].toLowerCase()], times: count / interval / (match[4].toLowerCase() === 'year' ? 12 : 1), start: match.index, end: match.index + match[0].length });
  }
  for (const match of text.matchAll(new RegExp('\\b(?:(once|twice|thrice|' + numberPattern + '\\s+times?)\\s+)?(daily|weekly|monthly|yearly|annually)\\b', 'gi'))) result.push({ period: ['yearly', 'annually'].includes(match[2].toLowerCase()) ? 'monthly' : match[2].toLowerCase(), times: (match[1] ? ({ once: 1, twice: 2, thrice: 3 }[match[1].toLowerCase()] ?? numeric(match[1].replace(/\s+times?$/i, ''))) : 1) / (['yearly', 'annually'].includes(match[2].toLowerCase()) ? 12 : 1), start: match.index, end: match.index + match[0].length });
  for (const match of text.matchAll(/\b(?:every other (day|week|month)|(?:every|each) (?:morning|evening|night)|everyday)\b/gi)) result.push({ period: periods[match[1]?.toLowerCase() || 'day'], times: match[1] ? 0.5 : 1, start: match.index, end: match.index + match[0].length });
  for (const match of text.matchAll(/\b(?:every|each|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekday|weekend)s?\b/gi)) result.push({ period: 'weekly', times: match[1].toLowerCase() === 'weekday' ? 5 : 1, start: match.index, end: match.index + match[0].length });
  for (const match of text.matchAll(/\b(?:every|each) day of (?:the )?weekend\b/gi)) result.push({ period: 'weekly', times: 2, start: match.index, end: match.index + match[0].length });
  const once = text.match(/\b(?:just once|once|one[- ]off)\b/i);
  if (!result.length && once) result.push({ period: 'once', times: 1, start: once.index, end: once.index + once[0].length });
  return result.filter(match => !result.some(other => other !== match && other.start <= match.start && other.end >= match.end && other.end - other.start > match.end - match.start));
}
function extractHorizon(question) {
  const pattern = new RegExp('\\b(?:(?:over|for|during|across)\\s+(?:(?:the\\s+)?(?:next|coming|this)\\s+)?|(?:the\\s+)?(?:next|this)\\s+)(' + numberPattern + '\\s+)?(day|week|month|year)s?\\b', 'gi');
  const matches = [...question.matchAll(pattern)];
  let horizon;
  for (const match of matches) {
    const next = { amount: match[1] ? numeric(match[1]) : 1, unit: match[2].toLowerCase() + 's' };
    if (!validHorizon(next)) fail('Use a comparison period of 1–1,000 whole days, weeks, months or years.');
    if (horizon && (horizon.amount !== next.amount || horizon.unit !== next.unit)) fail('Use one comparison period for all choices.');
    horizon = next;
  }
  return { horizon, strip: text => text.replace(pattern, ' ') };
}
const dimensions = [
  { pattern: 'kilograms?|kilos?|kgs?|grams?|g', base: 'kg', factor: unit => /^(g|grams?)$/.test(unit) ? 0.001 : 1 },
  { pattern: 'millilitres?|milliliters?|ml|litres?|liters?|l', base: 'litre', factor: unit => /^(ml|milli)/.test(unit) ? 0.001 : 1 },
  { pattern: 'minutes?|mins?|hours?|hrs?', base: 'minute', factor: unit => /^(h|hour)/.test(unit) ? 60 : 1 },
  { pattern: 'days?', base: 'day', factor: () => 1 },
  { pattern: 'kilometres?|kilometers?|km', base: 'km', factor: () => 1 },
  { pattern: 'kwh|mj', base: 'energy', factor: () => 1 }
];
function quantity(text, selection) {
  if (/\b\d+(?:\.\d+)?\s*(?:lbs?|pounds?|ounces?|oz|miles?|gallons?|cups?)\b/i.test(text)) fail('Use the catalogue unit for this quantity.');
  if (/(?<![\w])-\d+(?:\.\d+)?[-\s]*(?:kg|g|litres?|ml|minutes?|hours?|km|prompts?|requests?|steaks?)\b/i.test(text)) fail('Use a quantity above zero.');
  text = text.replace(/\bone and a half\b/gi, '1.5').replace(/\bhalf a\b/gi, 'half').replace(/\bquarter of a\b/gi, 'quarter');
  if (selection.singular !== 'output token') text = text.replace(/\b\d+\s+(?:output\s+)?tokens?(?:\s+output)?\b/gi, ' ');
  text = text.replace(/\b\d{3,}[- ]\d{3,}[- ]\d{3,}\b/g, ' ');
  for (const dimension of dimensions) {
    const pattern = new RegExp('(?<![\\w.])(' + numberPattern + ')[-\\s]*(' + dimension.pattern + ')\\b', 'gi');
    const matches = [...text.matchAll(pattern)];
    if (!matches.length) continue;
    if (matches.length > 1) fail('Use one quantity for each activity.');
    const match = matches[0], unit = match[2].toLowerCase();
    let amount = numeric(match[1]) * dimension.factor(unit);
    const target = selection.singular.toLowerCase();
    if (dimension.base === 'day' && target === 'person-day') return amount;
    if (dimension.base === 'minute' && target === 'hour') amount /= 60;
    else if (dimension.base === 'minute' && target === 'day') amount /= 1440;
    else if (dimension.base === 'minute' && target === 'use' && Number.isFinite(selection.durationMinutes) && selection.durationMinutes > 0) amount /= selection.durationMinutes;
    else if (dimension.base === 'energy' ? target !== unit : target !== dimension.base) fail('Cannot convert ' + match[2] + ' to ' + selection.singular + ' for this activity.');
    return amount;
  }
  // Only count activity nouns; model sizes, phone numbers and token configuration labels are not quantities.
  const nouns = selection.singular === 'kg'
    ? 'steaks?|servings?|portions?|pieces?|meals?|eggs?|apples?|bananas?|shirts?|garments?'
    : 'prompts?|requests?|questions?|quer(?:y|ies)|responses?|images?|pictures?|clips?|videos?|summaries|classifications?|captions?|answers?|completions?|builds?|attempts?|uses?|loads?|washes|cycles?|flushes|devices?|phones?|laptops?|items?|flights?|trips?';
  const tokenNoun = selection.singular === 'output token' ? '|(?:output\\s+)?tokens?' : '';
  const count = text.match(new RegExp('(?<![\\w.])(' + numberPattern + ')\\s+(?:(?!times?\\b)[a-z][a-z0-9-]*\\s+){0,3}(?:' + nouns + tokenNoun + ')\\b', 'i'));
  if (count) return numeric(count[1]) * (selection.singular === 'kg' ? selection.choice.amount : 1);
  return null;
}

export function applyQuestionSchedule(question, selections) {
  if (typeof question !== 'string' || !Array.isArray(selections)) fail('Use a question and catalogue activities.');
  const { horizon, strip } = extractHorizon(question);
  const cleanQuestion = strip(question);
  const allCadences = cadence(cleanQuestion);
  const shared = allCadences.length === 1 && /^[\s?.!]*$/.test(cleanQuestion.slice(allCadences[0].end)) ? allCadences[0] : null;
  const assumptions = [];
  const choices = selections.map(selection => {
    if (!selection?.choice || typeof selection.phrase !== 'string' || typeof selection.singular !== 'string') fail('The selected activity is incomplete.');
    const choice = { ...selection.choice };
    const phrase = strip(selection.phrase);
    const frequencies = cadence(phrase);
    if (frequencies.length > 1) fail('Use one frequency for each activity.');
    const frequency = frequencies[0] || shared;
    // Remove frequency counts before identifying the activity quantity.
    const quantityPhrase = frequencies.reduceRight((text, match) => text.slice(0, match.start) + ' ' + text.slice(match.end), phrase);
    const amount = quantity(quantityPhrase, selection);
    if (amount !== null) { choice.amount = amount; choice.times = 1; if (!frequency) choice.period = 'once'; }
    if (selection.choice.group === 'ai-request' && /\b(heavy|frequent|lots)\b/i.test(phrase) && amount === null) {
      choice.amount = 100;
      if (!frequency) { choice.period = 'daily'; choice.times = 1; }
      assumptions.push('Heavy use assumes 100 text prompts per ' + ({ daily: 'day', weekly: 'week', monthly: 'month', once: 'comparison' }[choice.period]) + '. Edit the count in Advanced.');
    }
    if (selection.choice.group === 'ai-request' && /\bai\b/i.test(phrase)) assumptions.push('AI uses Gemini’s May 2025 median text prompt.');
    if (selection.choice.group === 'ai-web-app-development') assumptions.push('App development uses a prototype web-app workload. Choose a different coding scenario for a larger build.');
    if (selection.choice.group === 'food-portions') assumptions.push(selection.choice.before === 'fish-portion' ? 'The fish portion is equal weights of cooked salmon, cod and tuna.' : 'The meat portion is equal weights of cooked chicken, pork and beef.');
    if (frequency) { choice.period = frequency.period; choice.times = frequency.times; }
    if (/\b(?:skip|avoid|stop|give up|cut out|forego|forgo|not taking)\b/i.test(phrase) && choice.kind === 'footprint') { choice.kind = 'skip'; choice.after = null; delete choice.afterGroup; }
    if (!validAmount(choice.amount) || !validAmount(choice.times)) fail('Use quantities and occurrence counts above zero and no greater than 1,000,000.');
    return choice;
  });
  return { choices, ...(horizon ? { horizon } : {}), ...(assumptions.length ? { assumptions: [...new Set(assumptions)].slice(0, 6) } : {}) };
}
