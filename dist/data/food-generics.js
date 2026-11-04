import { agribalyseFoodGroups } from './agribalyse-runtime.js';
import { defaultUsage } from '../defaults.js';

// Plain-name entry points to named source models, not averages of each leaf.
// Order puts a practical representative first; extra choices distinguish common foods.
// The source record supplies preparation, DQR, packaging, units and usage assumptions.
const representatives = [
  ['bread', 'Bread', '7110', 'Wholemeal, flour type 150'],
  ['croissant', 'Croissant', '7602'],
  ['breakfast-cereal', 'Breakfast cereal', '32014', 'Plain corn flakes'],
  ['oats', 'Rolled oats', '32140', 'Dry, pre-cooked flakes'],
  ['biscuit', 'Biscuit', '24000'],
  ['cake', 'Cake', '23909', 'Fruit cake'],
  ['flour', 'Wheat flour', '9435', 'Type 65'],
  ['rice', 'Rice', '9104', 'Cooked, unsalted'],
  ['pasta', 'Pasta', '9811', 'Cooked, unsalted'],
  ['rice-dry', 'Dry rice', '9100', 'Uncooked grain'],
  ['pasta-dry', 'Dry pasta', '9810', 'Uncooked dried pasta'],
  ['mustard', 'Mustard', '11013'],
  ['soy-cream', 'Soy cooking cream', '11214'],
  ['garlic', 'Garlic', '11000', 'Fresh'],
  ['maple-syrup', 'Maple syrup', '31034'],
  ['salt', 'Salt', '11017'],
  ['ketchup', 'Ketchup', '11008'],
  ['hummus', 'Hummus', '25621'],
  ['seaweed', 'Seaweed', '20987', 'Dried nori'],
  ['meal-replacement', 'Meal replacement drink, low calorie', '42003'],
  ['ginger', 'Ground ginger', '11006', 'Dried powder'],
  ['beer', 'Beer', '5001'],
  ['wine', 'Red wine', '5214'],
  ['coffee', 'Coffee', '18004', 'Brewed, not instant, without sugar'],
  ['ground-coffee', 'Ground coffee', '18003', 'Dry grounds; brewing excluded'],
  ['tea', 'Tea', '18020', 'Brewed, without sugar'],
  ['soy-milk', 'Soy drink', '18900', 'Plain, prepacked'],
  ['orange-juice', 'Orange juice', '2012', 'Reconstituted from concentrate'],
  ['water', 'Tap water', '18066'],
  ['apple', 'Apple', '13039', 'Raw, with skin'],
  ['banana', 'Banana', '13005', 'Raw, peeled'],
  ['orange', 'Orange', '13034', 'Raw, peeled'],
  ['strawberry', 'Strawberries', '13014_1', 'Raw'],
  ['walnut', 'Walnuts', '15023', 'Fresh'],
  ['almond', 'Almonds', '15000', 'With skin'],
  ['potato', 'Potatoes', '4002', 'Peeled and baked'],
  ['lentil', 'Lentils', '20505', 'Cooked'],
  ['chickpea', 'Chickpeas', '20507', 'Cooked'],
  ['tomato', 'Tomatoes', '20047_1', 'Raw'],
  ['carrot', 'Carrots', '20009', 'Raw'],
  ['onion', 'Onions', '20034', 'Raw'],
  ['leek', 'Leeks', '20039', 'Raw'],
  ['frozen-dessert', 'Ice cream log', '39533'],
  ['ice-cream', 'Ice cream', '39515', 'From a tub'],
  ['sorbet', 'Sorbet', '39524', 'From a tub'],
  ['infant-biscuit', 'Baby biscuit', '24689'],
  ['infant-fruit', 'Infant fruit purée, with banana', '13157'],
  ['infant-meal', 'Infant vegetable purée, 4–6 months', '20246'],
  ['infant-milk', 'First infant milk, ready to feed', '19013'],
  ['salmon-cooked', 'Salmon', '26038', 'Steamed'],
  ['beef-cooked', 'Beef', '6200', 'Grilled steak'],
  ['chicken-cooked', 'Chicken', '36018', 'Cooked breast, without skin'],
  ['pork-cooked', 'Pork', '28101', 'Grilled chop'],
  ['lamb-cooked', 'Lamb', '21519', 'Braised leg'],
  ['mussel-cooked', 'Mussels', '10013', 'Boiled'],
  ['ham', 'Ham', '28900', 'Cooked, superior quality'],
  ['egg', 'Egg', '22010', 'Hard-boiled'],
  ['seitan', 'Seitan', '25598'],
  ['smoked-tofu', 'Tofu, smoked', '20912'],
  ['chicken-nuggets', 'Poultry nuggets', '25512'],
  ['plant-ham', 'Plant-based ham', '1030'],
  ['canned-salmon', 'Canned salmon', '26119', 'Drained'],
  ['salmon', 'Raw salmon', '26036', 'Farmed'],
  ['tuna', 'Raw tuna', '26053', 'Uncooked'],
  ['beef', 'Raw beef', '6201', 'Uncooked steak'],
  ['chicken', 'Raw chicken', '36017', 'Uncooked breast, without skin'],
  ['pork', 'Raw pork', '28003', 'Uncooked loin'],
  ['lamb', 'Raw lamb', '21502', 'Uncooked leg'],
  ['mussel', 'Raw mussels', '10014', 'Common mussel, uncooked'],
  ['cheese', 'Cheese', '12726', 'Cheddar'],
  ['emmental', 'Cheese, emmental', '12115'],
  ['cream', 'Cream', '19415', '30% fat, UHT'],
  ['yogurt', 'Yogurt', '19593', 'Plain'],
  ['milk', 'Milk', '19024', 'Whole, pasteurised'],
  ['butter', 'Butter', '16400', 'Unsalted, 82% fat'],
  ['margarine', 'Margarine', '16615', 'Unsalted, 80% fat'],
  ['duck-fat', 'Duck fat', '16550'],
  ['olive-oil', 'Olive oil', '17270', 'Extra virgin'],
  ['rapeseed-oil', 'Rapeseed oil', '17130'],
  ['sunflower-oil', 'Sunflower oil', '17440'],
  ['cod-liver-oil', 'Cod liver oil', '17630'],
  ['spring-roll', 'Spring roll', '25419'],
  ['tofu', 'Tofu, plain', '20904'],
  ['paella', 'Paella', '25031'],
  ['tabbouleh', 'Tabbouleh', '25608'],
  ['sandwich', 'Sandwich', '25485', 'French bread, ham and emmental'],
  ['pizza', 'Pizza', '25404', 'Cheese and tomato, margherita'],
  ['soup', 'Soup', '25945', 'Prepacked pumpkin soup, reheated'],
  ['vegetarian-patty', 'Plant-based patty, soy and vegetables', '20914'],
  ['dark-chocolate', 'Dark chocolate', '31074', 'Over 70% cocoa'],
  ['milk-chocolate', 'Milk chocolate', '31004'],
  ['jam', 'Strawberry jam', '31024'],
  ['sugar', 'White sugar', '31016'],
  ['honey', 'Honey', '31008'],
  ['sweets', 'Sweets', '31003', 'Source mix of candy types']
];

const byCode = new Map(agribalyseFoodGroups.flatMap(group => group.options.map(source => [source.sourceCode, { source, group }])));
const method = 'Each indicator copies one named AGRIBALYSE source record without averaging or weighting. This is an illustrative representative, not a consumption-weighted average or an estimate for every food in its category.';

function representative([id, label, code, genericHint]) {
  const original = byCode.get(code);
  if (!original) throw new Error('Missing AGRIBALYSE representative: ' + code);
  const { source, group } = original;
  // Aliases retain provenance without masquerading as another original source row.
  const { sourceCode, ...option } = source;
  const selection = label + ' uses the source model “' + source.sourceName + '” (AGRIBALYSE ' + code + '). Product form and preparation are those of this source record; no recipe or nutritional equivalence is assumed.';
  return {
    ...option, id: 'generic-food-' + id, label, generic: true,
    ...(genericHint ? { genericHint } : {}),
    representativeSourceCode: sourceCode, replacementBasis: 'agribalyse',
    defaultUsage: defaultUsage(group, source),
    note: selection + ' ' + source.note,
    genericEvidence: {
      method: 'representative', selection: selection + ' ' + method,
      contributors: [{ label: source.sourceName + ' · AGB ' + code, values: { ...source.values }, url: source.sources[0].url }]
    }
  };
}

export const genericFoodGroups = [{
  id: 'generic-foods', label: 'Common foods', category: 'food',
  unit: 'per kg of the specified product form', singular: 'kg', plural: 'kg', defaultAmount: 1,
  sourceNote: agribalyseFoodGroups[0].sourceNote + ' Plain-name choices use individual named source records, not category averages. Infant food entries describe products, not feeding advice.',
  sources: agribalyseFoodGroups[0].sources,
  options: representatives.map(representative)
}];

// Equal cooked masses define two editable serving scenarios using the published French records.
function portion(id, label, foods, codes) {
  const members = codes.map(code => byCode.get(code).source);
  const keys = Object.keys(members[0].values).filter(key => members.every(item => Number.isFinite(item.values[key])));
  const selection = 'Equal cooked weights of ' + foods + '. The mix is illustrative. It does not represent national consumption.';
  return {
    id, label, generic: true, genericHint: 'Equal weights of ' + foods,
    values: Object.fromEntries(keys.map(key => [key, members.reduce((sum, item) => sum + item.values[key], 0) / members.length])),
    categoryPath: ['Food', 'Meat, fish and eggs', 'Portion scenarios'], replacementBasis: 'agribalyse',
    note: selection + ' ' + members.map(item => item.note).join(' '),
    qualityWarning: members.filter(item => item.qualityWarning).map(item => item.label + ' · ' + item.qualityWarning).join(' '),
    sources: members.flatMap(item => item.sources),
    defaultUsage: { amount: 0.15, times: 3, period: 'weekly', description: 'Assumes a 150 g cooked portion three times a week.' },
    genericEvidence: { method: 'mean', selection,
      contributors: members.map(item => ({ label: item.label + ' · AGB ' + item.sourceCode, values: item.values })) }
  };
}

export const foodPortions = {
  id: 'food-portions', label: 'Meat and fish portions', category: 'food',
  unit: 'per kg of cooked food', singular: 'kg', plural: 'kg', defaultAmount: 0.15,
  sourceNote: 'These scenarios average three cooked AGRIBALYSE 3.2 foods by mass. They cover the food portion only. ' + agribalyseFoodGroups[0].sourceNote,
  sources: agribalyseFoodGroups[0].sources,
  options: [
    portion('fish-portion', 'Fish portion', 'salmon, cod and tuna', ['26038', '26025', '26041']),
    portion('meat-portion', 'Meat portion', 'chicken, pork and beef', ['36018', '28101', '6200'])
  ]
};
