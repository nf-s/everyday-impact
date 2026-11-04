export const metrics = {
  carbon: { label: 'Greenhouse gases', unit: 'kg CO₂e', note: 'CO₂e expresses the warming effect of different greenhouse gases in one unit. Check what each source includes.' },
  freshwater: { label: 'Freshwater withdrawals', unit: 'L', note: 'Water taken from freshwater sources. A litre withdrawn has different effects in different catchments.' },
  dietWater: { label: 'Dietary water use', unit: 'L', note: 'Agricultural water use as reported in the UK diet study. Compare its diet groups with one another using this measure.' },
  agribalyseLand: { label: 'Land use (soil quality)', unit: 'Pt', note: 'AGRIBALYSE models effects on soil quality and reports a score in points. It can assign a negative score. This indicator does not measure occupied area.' },
  freshwaterEutrophication: { label: 'Freshwater nutrient pollution', unit: 'g P eq', note: 'AGRIBALYSE reports freshwater eutrophication as a mass of phosphorus equivalent. The calculator converts the published kg to grams.' },
  waterScarcity: { label: 'Water scarcity impact', unit: 'm³ deprivation eq', note: 'AGRIBALYSE weights water use by local scarcity. This indicator is kept separate from the physical volumes in the Water row.' },
  agribalyseAcidification: { label: 'Acidification', unit: 'mol H⁺ eq', note: 'AGRIBALYSE models how emissions can acidify soils and fresh water. The unit expresses their effect in equivalent moles of hydrogen ions.' },
  smogFormation: { label: 'Smog formation', unit: 'g NMVOC eq', note: 'AGRIBALYSE estimates the potential for emissions to form ground-level ozone. The calculator expresses this in grams of non-methane volatile organic compound equivalent.' },
  marineEutrophication: { label: 'Marine nutrient pollution', unit: 'g N eq', note: 'AGRIBALYSE models the potential for nutrient releases to enrich coastal and marine waters. The calculator converts kilograms of nitrogen equivalent to grams.' },
  fossilResources: { label: 'Fossil resource use', unit: 'MJ', note: 'AGRIBALYSE estimates the depletion of fossil energy resources across the product life cycle, in megajoules. The electricity row covers electricity used within its source’s operating boundary.' },
  mineralResources: { label: 'Mineral and metal resource use', unit: 'mg Sb eq', note: 'The depletion of minerals and metals is expressed in milligrams of antimony equivalent. Details gives the study and its scope.' },
  consumedWater: { label: 'Supply-chain freshwater consumption', unit: 'L', note: 'Absolute freshwater consumption reported for the US beef supply chain.' },
  eutrophication: { label: 'Nutrient pollution', unit: 'g PO₄e', note: 'Nutrient emissions expressed in grams of phosphate equivalent. They can drive excessive growth of algae in waterways.' },
  energy: { label: 'Electricity', unit: 'kWh', note: 'Electricity within the operating boundary reported by the source.' },
  coolingWater: { label: 'Data-centre cooling water', unit: 'L', note: 'Water consumed on site to cool the serving infrastructure. Water used to generate electricity is outside this measure.' },
  inferenceWater: { label: 'Inference life-cycle water', unit: 'L', note: 'Mistral reports water consumption potential for serving a response, including upstream impacts.' },
  unspecifiedWater: { label: 'Water · scope undisclosed', unit: 'L', note: 'The provider reports a water volume without specifying which uses it covers.' },
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
  marineEutrophication: metrics.marineEutrophication,
  eutrophication: metrics.eutrophication,
  agribalyseAcidification: metrics.agribalyseAcidification,
  smogFormation: metrics.smogFormation,
  energy: metrics.energy,
  fossilResources: metrics.fossilResources,
  mineralResources: metrics.mineralResources
};

const waterMetrics = ['freshwater', 'consumedWater', 'dietWater', 'coolingWater', 'inferenceWater', 'unspecifiedWater', 'tapWater'];

export function metricForOption(option, displayKey) {
  if (!option?.values || !Object.hasOwn(comparisonMetrics, displayKey)) return null;
  if (displayKey !== 'water') return Number.isFinite(option.values[displayKey]) ? displayKey : null;
  const supported = waterMetrics.filter(key => Number.isFinite(option.values[key]));
  return supported.length === 1 ? supported[0] : null;
}

export function canEstimateGridCarbon(option) {
  return Number.isFinite(option?.values?.energy) && !Number.isFinite(option.values.carbon);
}

export function withGridCarbon(option, grid) {
  if (!grid || !canEstimateGridCarbon(option)) return option;
  return { ...option, gridEstimate: grid, values: { ...option.values, carbon: option.values.energy * grid.values.carbon } };
}

export const periods = {
  once: { label: 'Just once', count: 1 },
  daily: { label: 'Every day', count: 365 },
  weekly: { label: 'Every week', count: 52 },
  monthly: { label: 'Every month', count: 12 }
};

export const defaultHorizon = Object.freeze({ amount: 12, unit: 'months' });
export const horizonUnits = {
  days: { singular: 'day', label: 'Days' },
  weeks: { singular: 'week', label: 'Weeks' },
  months: { singular: 'month', label: 'Months' },
  years: { singular: 'year', label: 'Years' }
};

export function validHorizon(horizon) {
  return horizon !== null && typeof horizon === 'object' && !Array.isArray(horizon) && Number.isInteger(horizon.amount) &&
    horizon.amount >= 1 && horizon.amount <= 1000 && typeof horizon.unit === 'string' && Object.hasOwn(horizonUnits, horizon.unit);
}

export function horizonLabel(horizon = defaultHorizon) {
  if (!validHorizon(horizon)) return '';
  return raw(horizon.amount) + ' ' + (horizon.amount === 1 ? horizonUnits[horizon.unit].singular : horizon.unit);
}

export function horizonExplanation(horizon = defaultHorizon) {
  if (!validHorizon(horizon)) return '';
  const basis = ['days', 'weeks'].includes(horizon.unit)
    ? 'Day and week comparisons use 7-day weeks and average months of 365 ÷ 12 days.'
    : 'Month and year comparisons use 365 daily, 52 weekly and 12 monthly occurrences per year.';
  return basis + ' Recurring schedules are prorated, so fractional occurrences are averages rather than a count of completed actions. One-off actions count once.';
}

export function occurrencesFor(period, horizon = defaultHorizon) {
  if (!validHorizon(horizon) || !Object.hasOwn(periods, period)) return null;
  if (period === 'once') return 1;
  if (horizon.unit === 'months' || horizon.unit === 'years') {
    const months = horizon.amount * (horizon.unit === 'years' ? 12 : 1);
    return periods[period].count * months / 12;
  }
  const days = horizon.amount * (horizon.unit === 'weeks' ? 7 : 1);
  return days / { daily: 1, weekly: 7, monthly: 365 / 12 }[period];
}

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

export function calculate(before, after, amount, period, metric, horizon = defaultHorizon) {
  const occurrences = occurrencesFor(period, horizon);
  if (!validAmount(amount) || occurrences === null) return null;
  const from = before.values[metric];
  const to = after ? after.values[metric] : 0;
  if (from === undefined || to === undefined) return null;
  return (from - to) * amount * occurrences;
}

export function estimateChoice(before, after, amount, period, times, displayKey, horizon = defaultHorizon) {
  if (!validAmount(times)) return null;
  const sourceKey = metricForOption(before, displayKey);
  if (sourceKey === null || (after !== null && metricForOption(after, displayKey) !== sourceKey)) return null;
  const base = calculate(before, after, amount, period, sourceKey, horizon);
  if (base === null) return null;
  const result = base * times;
  return Number.isFinite(result) ? result : null;
}

export function formatEstimate(value, key, kind, unit = comparisonMetrics[key].unit) {
  const scaled = unit === 'Wh' ? value * 1000 : value;
  if (kind === 'footprint' || value === 0) return number(scaled) + ' ' + unit;
  return number(Math.abs(scaled)) + ' ' + unit + (value > 0 ? ' lower' : ' higher');
}

export function displayImpact(value, key) {
  if (key === 'carbon' && value >= 1000) return number(value / 1000) + ' t CO₂e';
  if (key === 'carbon' && value > 0 && value < 0.1) return number(value * 1000) + ' g CO₂e';
  if (key === 'energy' && value > 0 && value < 0.1) return number(value * 1000) + ' Wh';
  if ((key === 'water' || waterMetrics.includes(key)) && value > 0 && value < 1) return number(value * 1000) + ' mL';
  return number(value) + ' ' + (key === 'water' ? comparisonMetrics.water.unit : metrics[key].unit);
}
