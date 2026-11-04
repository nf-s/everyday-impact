export const metrics = {
  carbon: { label: 'Greenhouse gases', unit: 'kg CO₂e', note: 'CO₂e expresses the warming effect of different greenhouse gases in one unit. Check what each source includes.' },
  freshwater: { label: 'Freshwater withdrawals', unit: 'L', note: 'Water taken from freshwater sources. A litre withdrawn has different effects in different catchments.' },
  dietWater: { label: 'Dietary water use', unit: 'L', note: 'Agricultural water use as reported in the UK diet study. Compare its diet groups with one another using this measure.' },
  agribalyseLand: { label: 'Land use (soil quality)', unit: 'Pt', note: 'AGRIBALYSE models effects on soil quality and reports a score in points. It can assign a negative score. This indicator does not measure occupied area.' },
  freshwaterEutrophication: { label: 'Freshwater nutrient pollution', unit: 'g P eq', note: 'AGRIBALYSE reports freshwater eutrophication as a mass of phosphorus equivalent. The calculator converts the published kg to grams.' },
  waterScarcity: { label: 'Water scarcity impact', unit: 'm³ deprivation eq', note: 'AGRIBALYSE weights water use by local scarcity. This indicator is kept separate from the physical volumes in the Water row.' },
  consumedWater: { label: 'Supply-chain freshwater consumption', unit: 'L', note: 'Absolute freshwater consumption reported for the US beef supply chain.' },
  eutrophication: { label: 'Nutrient pollution', unit: 'g PO₄e', note: 'Nutrient emissions expressed in grams of phosphate equivalent. They can drive excessive growth of algae in waterways.' },
  energy: { label: 'Electricity', unit: 'kWh', note: 'Electricity within the operating boundary reported by the source.' },
  coolingWater: { label: 'Data-centre cooling water', unit: 'L', note: 'Water consumed on site to cool the serving infrastructure. Water used to generate electricity is outside this measure.' },
  tapWater: { label: 'Household tap water', unit: 'L', note: 'Water delivered to a household fixture or appliance.' }
};

export const comparisonMetrics = {
  carbon: metrics.carbon,
  water: {
    label: 'Water',
    unit: 'L',
    note: 'Each source defines which physical water use it counts, such as household delivery or water consumed in production. The scope appears beside each figure. Water scarcity scores have their own row.'
  },
  agribalyseLand: metrics.agribalyseLand,
  waterScarcity: metrics.waterScarcity,
  freshwaterEutrophication: metrics.freshwaterEutrophication,
  eutrophication: metrics.eutrophication,
  energy: metrics.energy
};

const waterMetrics = ['freshwater', 'consumedWater', 'dietWater', 'coolingWater', 'tapWater'];

export function metricForOption(option, displayKey) {
  if (!option?.values || !Object.hasOwn(comparisonMetrics, displayKey)) return null;
  if (displayKey !== 'water') return Number.isFinite(option.values[displayKey]) ? displayKey : null;
  const supported = waterMetrics.filter(key => Number.isFinite(option.values[key]));
  return supported.length === 1 ? supported[0] : null;
}

export const periods = {
  once: { label: 'Just once', count: 1 },
  daily: { label: 'Every day', count: 365 },
  weekly: { label: 'Every week', count: 52 },
  monthly: { label: 'Every month', count: 12 }
};

const displayNumber = new Intl.NumberFormat('en-AU', { maximumSignificantDigits: 3 });
const factorNumber = new Intl.NumberFormat('en-AU', { maximumSignificantDigits: 10 });
export const number = value => displayNumber.format(value);
export const raw = value => factorNumber.format(value);
export function validAmount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 1000000;
}

export function availableMetrics(before, after) {
  return Object.keys(metrics).filter(key => before.values[key] !== undefined && (!after || after.values[key] !== undefined));
}

export function calculate(before, after, amount, period, metric) {
  if (!validAmount(amount) || !Object.hasOwn(periods, period)) return null;
  const from = before.values[metric];
  const to = after ? after.values[metric] : 0;
  if (from === undefined || to === undefined) return null;
  return (from - to) * amount * periods[period].count;
}

export function estimateChoice(before, after, amount, period, times, displayKey) {
  if (!validAmount(times)) return null;
  const sourceKey = metricForOption(before, displayKey);
  if (sourceKey === null || (after !== null && metricForOption(after, displayKey) !== sourceKey)) return null;
  const base = calculate(before, after, amount, period, sourceKey);
  if (base === null) return null;
  const result = base * times;
  return Number.isFinite(result) ? result : null;
}

export function formatEstimate(value, key, kind) {
  const unit = comparisonMetrics[key].unit;
  if (kind === 'footprint' || value === 0) return number(value) + ' ' + unit;
  return number(Math.abs(value)) + ' ' + unit + (value > 0 ? ' lower' : ' higher');
}

export function displayImpact(value, key) {
  if (key === 'carbon' && value >= 1000) return number(value / 1000) + ' t CO₂e';
  if (key === 'carbon' && value > 0 && value < 0.1) return number(value * 1000) + ' g CO₂e';
  if (key === 'energy' && value > 0 && value < 0.1) return number(value * 1000) + ' Wh';
  if ((key === 'water' || waterMetrics.includes(key)) && value > 0 && value < 1) return number(value * 1000) + ' mL';
  return number(value) + ' ' + (key === 'water' ? comparisonMetrics.water.unit : metrics[key].unit);
}
