import { agribalyseFoodMetadata, groupNames, subgroupNames, preparationNames, selections, rows } from "./agribalyse-foods.js";

const sourceNote = "Source ADEME, données AGRIBALYSE® v3.2 (2025); public Synthèse data updated " + agribalyseFoodMetadata.sourceDataUpdated.slice(0, 10) + ", metadata updated " + agribalyseFoodMetadata.sourceMetadataUpdated.slice(0, 10) + ", retrieved " + agribalyseFoodMetadata.retrieved + ". Etalab Open Licence 2.0. Aggregate indicators only, not underlying process inventories. French-market generic food models, not measurements of a specific brand or an Australian average. Farm-to-consumer scope follows the preparation stated for each food. Values are per kg of the specified product form; drinks also use mass, without assuming kg equals litres. Equal mass is not equal nutrition. Land use is a soil-quality score in EF points and may be negative; water scarcity is deprivation-weighted, not litres of water. Phosphorus and nitrogen eutrophication factors are converted from published kg to g equivalents. DQR rates data quality from 1 (very good) to 5 (very poor); the publisher recommends caution above 3 and provides no quantitative error bars. Some products use representative recipes or proxies; this simplified export has no whole-food proxy flag. PACK PROXY refers specifically to packaging. Biodiversity, pesticide and soil-carbon effects are incompletely represented. No endorsement by ADEME.";

// Runtime expansion of validated, bundled aggregate data. No network requests.
const selectionByCode = new Map(selections.map(selection => [selection.sourceCode, selection]));
const metricEntries = Object.entries(agribalyseFoodMetadata.sourceFields);
const nameCounts = new Map();
for (const row of rows) nameCounts.set(row[1], (nameCounts.get(row[1]) || 0) + 1);
const sourceApi = agribalyseFoodMetadata.source;
const sources = [
  { label: 'ADEME AGRIBALYSE 3.2: aggregate food results', url: 'https://data.ademe.fr/datasets/agribalyse-31-synthese' },
  { label: 'ADEME API: source units and release metadata', url: sourceApi },
  { label: 'AGRIBALYSE: data quality and uncertainty', url: 'https://doc.agribalyse.fr/documentation-en/data-use/life-cycle-assessment-method' },
  { label: 'AGRIBALYSE: open-data reuse conditions', url: 'https://doc.agribalyse.fr/documentation-en/agribalyse-data/terms-of-use-and-environmental-communication' }
];

function suggestedUsage(group, subgroup, sourceName) {
  const name = sourceName.toLowerCase();
  let amount = 0.15;
  let times = 3;
  let period = 'weekly';
  if (group === 'Infant food products' || subgroup === 'Special dietary products') {
    amount = 0.1; times = 1; period = 'once';
  } else if (['Herbs', 'Spices', 'Salt'].includes(subgroup)) {
    amount = subgroup === 'Herbs' ? 0.002 : 0.001;
  } else if (['Condiments', 'Sauces', 'Sugar and honey', 'Jams and preserves'].includes(subgroup) || group === 'Oils and fats') {
    amount = 0.01; times = 5;
  } else if (['Cooking aids', 'Other ingredients'].includes(subgroup)) {
    amount = 0.02;
  } else if (subgroup === 'Alcoholic drinks') {
    amount = name.includes('beer') ? 0.33 : /wine|cider/.test(name) ? 0.15 : 0.03; times = 2;
  } else if (['Non-alcoholic drinks', 'Water'].includes(subgroup)) {
    amount = subgroup === 'Water' ? 1 : 0.25; times = 5;
    if (/powder|instant|dehydrated|dried|ground|coffee beans|tea leaves/.test(name)) amount = /tea|instant/.test(name) ? 0.002 : 0.01;
  } else if (subgroup === 'Milk') {
    amount = 0.2; times = 5;
  } else if (subgroup === 'Cheese') {
    amount = 0.03; times = 5;
  } else if (subgroup === 'Fresh dairy products and alternatives') {
    amount = 0.125; times = 5;
  } else if (subgroup === 'Cream') {
    amount = 0.02;
  } else if (subgroup === 'Nuts and seeds') {
    amount = 0.03; times = 5;
  } else if (['Bread and breakfast pastries', 'Breakfast cereals and biscuits'].includes(subgroup)) {
    amount = 0.05; times = 5;
  } else if (subgroup === 'Flour and pastry dough') {
    amount = 0.06;
  } else if (['Pasta, rice and cereals', 'Pulses'].includes(subgroup)) {
    amount = /cooked|boiled|canned/.test(name) ? 0.15 : 0.06;
  } else if (subgroup === 'Eggs') {
    amount = 0.06;
  } else if (['Cured and processed meats', 'Plant-based deli alternatives', 'Other meat products'].includes(subgroup)) {
    amount = 0.05; times = 2;
  } else if (group === 'Prepared dishes and starters') {
    amount = 0.3;
  } else if (['Sweet foods', 'Ice cream and sorbets'].includes(group)) {
    amount = group === 'Ice cream and sorbets' ? 0.08 : 0.05; times = 2;
  }
  const cadence = period === 'once' ? 'once' : times + ' times per week';
  return { amount, times, period, description: 'Assumes ' + (amount * 1000) + ' g, ' + cadence + '.' };
}

function expandFood(row) {
  const [code, name, french, groupIndex, subgroupIndex, preparationIndex, dqr, packagingProxy, season, airFreight, ...factors] = row;
  const group = groupNames[groupIndex][1];
  const subgroup = subgroupNames[subgroupIndex];
  const selected = selectionByCode.get(code);
  let label = selected ? selected.label : name;
  if (!selected && nameCounts.get(name) > 1) label += ' · AGB ' + code;
  let qualityWarning = dqr > 3 ? 'DQR ' + dqr + '/5: the publisher recommends caution for data above 3.' : '';
  if (dqr > 4) qualityWarning += ' The publisher considers scores above 4 unreliable.';
  let note = 'AGRIBALYSE ' + code + '. Source food: ' + french + '. Preparation: ' + preparationNames[preparationIndex] + '. DQR ' + dqr + '/5 (lower is better).';
  if (qualityWarning) note += ' ' + qualityWarning;
  if (packagingProxy) note += ' Packaging uses the source PACK PROXY model; no whole-food proxy flag is supplied.';
  if (airFreight) note += ' Air freight is included.';
  if (season === 0 || season === 1) note += season === 1 ? ' In-season production.' : ' Out-of-season production.';
  const query = new URLSearchParams({ qs: 'Code_AGB:"' + code + '"', size: '1' });
  return {
    id: selected ? selected.id : 'agb-' + code, label,
    values: Object.fromEntries(metricEntries.map(([key, definition], index) => [key, Number((factors[index] * definition.multiplier).toPrecision(12))])),
    note, sources: [{ label: 'ADEME source food ' + code + ': ' + name, url: sourceApi + '/lines?' + query }],
    sourceCode: code, sourceName: name, sourceFrenchName: french,
    categoryPath: ['Food', group, subgroup], dqr, qualityWarning,
    packagingApproach: packagingProxy ? 'PACK PROXY' : 'PACK AGB',
    defaultUsage: suggestedUsage(group, subgroup, name)
  };
}

function makeGroup(id, label, options) {
  return { id, label, category: 'food', unit: 'per kg of the specified product form', singular: 'kg', plural: 'kg', defaultAmount: 1, sourceNote, sources, options };
}
const foods = rows.map(expandFood);
const byCode = new Map(foods.map(food => [food.sourceCode, food]));
export const agribalyseFoodGroups = [
  ...[['food-products', 'Selected everyday foods'], ['food-liquids', 'Selected drinks and oils (by mass)']].map(([id, label]) => makeGroup(id, label, selections.filter(selection => selection.group === id).map(selection => byCode.get(selection.sourceCode)))),
  ...groupNames.map(([id, label]) => makeGroup(id, label, foods.filter(food => food.categoryPath[1] === label && !selectionByCode.has(food.sourceCode))))
];
