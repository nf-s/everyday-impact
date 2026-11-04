// Illustrative scenarios for editing, not measured use or population averages.
// Amount uses the catalogue denominator; times counts occurrences per period.
const usage = (amount, period, times, description) => ({ amount, period, times, description });

const foodProducts = {
  "beef-steak": usage(0.15, "weekly", 2, "Assumes 150 g cooked grilled beef steak, twice a week."),
  "beef-mince": usage(0.15, "weekly", 2, "Assumes 150 g cooked beef mince (15% fat), twice a week."),
  "lamb-mutton": usage(0.15, "weekly", 1, "Assumes 150 g roasted lamb leg, once a week."),
  "pork": usage(0.15, "weekly", 2, "Assumes 150 g grilled pork chop, twice a week."),
  "poultry-meat": usage(0.15, "weekly", 3, "Assumes 150 g cooked skinless chicken breast, three times a week."),
  "farmed-fish": usage(0.15, "weekly", 1, "Assumes 150 g baked farmed salmon, once a week."),
  "prawns": usage(0.15, "weekly", 1, "Assumes 150 g cooked prawns, once a week."),
  "cheese": usage(0.03, "weekly", 5, "Assumes 30 g Emmental cheese, five days a week."),
  "eggs": usage(0.1, "weekly", 3, "Assumes 100 g hard-boiled eggs, three times a week."),
  "tofu": usage(0.15, "weekly", 3, "Assumes 150 g plain tofu, three times a week."),
  "peas": usage(0.075, "weekly", 2, "Assumes 75 g dried split peas, twice a week; the selected source row excludes cooking."),
  "other-pulses": usage(0.075, "weekly", 3, "Assumes 75 g dried lentils, three times a week; the selected source row excludes cooking."),
  "nuts": usage(0.03, "weekly", 5, "Assumes 30 g shelled walnuts, five days a week."),
  "groundnuts": usage(0.03, "weekly", 5, "Assumes 30 g unsalted roasted peanuts, five days a week."),
  "wheat-rye-bread": usage(0.08, "daily", 1, "Assumes 80 g wholemeal bread each day."),
  "maize-meal": usage(0.075, "weekly", 1, "Assumes 75 g dry maize flour, once a week; the selected source row excludes cooking."),
  "oatmeal": usage(0.04, "weekly", 5, "Assumes 40 g dry rolled oats, five days a week; the selected source row excludes cooking."),
  "rice": usage(0.075, "weekly", 3, "Assumes 75 g uncooked rice, three times a week; the selected source row excludes cooking."),
  "potatoes": usage(0.2, "weekly", 3, "Assumes 200 g boiled potatoes, three times a week."),
  "cassava": usage(0.2, "weekly", 1, "Assumes 200 g cooked cassava, once a week."),
  "tomatoes": usage(0.1, "weekly", 5, "Assumes 100 g raw tomatoes, five days a week."),
  "onions-leeks": usage(0.075, "weekly", 5, "Assumes 75 g raw onions, five days a week."),
  "root-vegetables": usage(0.1, "weekly", 4, "Assumes 100 g raw carrots, four days a week."),
  "brassicas": usage(0.1, "weekly", 4, "Assumes 100 g raw broccoli, four days a week."),
  "other-vegetables": usage(0.1, "weekly", 5, "Assumes 100 g raw zucchini, five days a week."),
  "citrus-fruit": usage(0.15, "weekly", 3, "Assumes 150 g orange pulp, three days a week."),
  "bananas": usage(0.15, "weekly", 5, "Assumes 150 g banana pulp, five days a week."),
  "apples": usage(0.15, "weekly", 5, "Assumes 150 g apple with skin, five days a week."),
  "berries-grapes": usage(0.1, "weekly", 3, "Assumes 100 g strawberries, three days a week."),
  "other-fruit": usage(0.15, "weekly", 3, "Assumes 150 g pear with skin, three days a week."),
  "brown-sugar": usage(0.01, "daily", 1, "Assumes 10 g brown sugar each day."),
  "white-sugar": usage(0.01, "daily", 1, "Assumes 10 g white sugar each day."),
  "coffee": usage(0.018, "daily", 1, "Assumes 18 g dry ground coffee each day; brewing is outside the selected source row."),
  "dark-chocolate": usage(0.02, "weekly", 4, "Assumes 20 g dark chocolate (over 70% cocoa), four days a week.")
};

const foodLiquids = {
  "milk": usage(0.2, "daily", 1, "Assumes 200 g whole pasteurised milk each day; measured by mass."),
  "soy-milk": usage(0.2, "daily", 1, "Assumes 200 g plain soy drink each day; measured by mass."),
  "beer": usage(0.375, "weekly", 2, "Assumes 375 g beer (4\u20135% alcohol), twice a week; measured by mass."),
  "wine": usage(0.15, "weekly", 2, "Assumes 150 g red wine, twice a week; measured by mass."),
  "soybean-oil": usage(0.015, "daily", 1, "Assumes 15 g soy oil each day."),
  "palm-oil": usage(0.015, "daily", 1, "Assumes 15 g refined palm oil each day."),
  "sunflower-oil": usage(0.015, "daily", 1, "Assumes 15 g sunflower oil each day."),
  "rapeseed-oil": usage(0.015, "daily", 1, "Assumes 15 g rapeseed oil each day."),
  "olive-oil": usage(0.015, "daily", 1, "Assumes 15 g extra-virgin olive oil each day.")
};

const flightDistances = {
  'domestic-flight': 500,
  'short-haul-economy': 1000,
  'short-haul-business': 1000,
  'long-haul-economy': 6000,
  'long-haul-premium': 6000,
  'long-haul-business': 6000,
  'international-economy': 3000
};

const groupDefaults = {
  'dishwasher-cycles': usage(1, 'daily', 1, 'Assumes one dishwasher cycle on the registered program each day.'),
  'washer-cycles': usage(1, 'weekly', 4, 'Assumes four full cotton washes at 40 °C each week.'),
  'dryer-loads': usage(1, 'weekly', 2, 'Assumes two full dryer loads each week.'),
  refrigeration: usage(1, 'daily', 1, 'Assumes the appliance runs continuously throughout the comparison period.'),
  'tv-viewing': usage(2, 'daily', 1, 'Assumes two hours of viewing each day.'),
  packaging: usage(0.05, 'weekly', 1, 'Assumes 50 g of packaging material purchased each week.'),
  'clothing-material': usage(0.2, 'once', 1, 'Assumes one 200 g garment purchased during the comparison period.'),
  'au-grid-electricity': usage(10, 'daily', 1, 'Assumes 10 kWh of electricity drawn from this grid each day.'),
  'au-pipeline-gas': usage(20, 'daily', 1, 'Assumes 20 MJ of metered gas used each day.'),
  'au-stationary-liquid-fuels': usage(1, 'weekly', 1, 'Assumes one litre of fuel burned each week.'),
  'au-road-fuels': usage(10, 'weekly', 1, 'Assumes 10 litres of vehicle fuel burned each week.'),
  'uk-motorcycles': usage(10, 'weekly', 10, 'Assumes a 10 km solo ride, ten times a week.'),
  'uk-taxi-travel': usage(10, 'weekly', 2, 'Assumes one passenger making two 10 km taxi journeys each week.'),
  'uk-ferry-travel': usage(50, 'monthly', 2, 'Assumes one passenger making two 50 km ferry crossings each month.'),
  'us-beef': usage(0.15, 'weekly', 2, 'Assumes two 150 g servings of boneless beef each week.'),
  'french-meals': usage(1, 'weekly', 2, 'Assumes one complete modelled meal, twice a week.'),
  'uk-diets': usage(1, 'daily', 1, 'Assumes one person following this 2,000 kcal daily diet throughout the comparison period.'),
  'australian-flight-routes': usage(2, 'once', 1, 'Assumes one passenger making one return trip, counted as two one-way flights.'),
  'surface-travel': usage(10, 'weekly', 10, 'Assumes a 10 km one-way journey, ten times a week (five return trips), for one person.'),
  'return-flight': usage(1, 'once', 1, 'Assumes one passenger making one Paris–New York return trip.'),
  'ai-request': usage(5, 'daily', 1, 'Assumes five text prompts per day.'),
  shower: usage(4, 'daily', 1, 'Assumes one four-minute shower each day.'),
  'toilet-flush': usage(1, 'daily', 5, 'Assumes one flush, five times a day, all using the selected flush type.'),
  'laundry-load': usage(1, 'weekly', 4, 'Assumes one household laundry load, four times a week.')
};

export function defaultUsage(group, item) {
  if (group.id === 'food-products' && Object.hasOwn(foodProducts, item.id)) return { ...foodProducts[item.id] };
  if (group.id === 'food-liquids' && Object.hasOwn(foodLiquids, item.id)) return { ...foodLiquids[item.id] };
  if (item.defaultUsage) return { ...item.defaultUsage };
  if (group.id === 'flights' && Object.hasOwn(flightDistances, item.id)) {
    const distance = flightDistances[item.id];
    return usage(distance, 'once', 1, 'Assumes one ' + distance.toLocaleString('en-AU') + ' km one-way flight for one passenger.');
  }
  if (group.id === 'surface-travel' && item.id === 'international-rail') {
    return usage(500, 'once', 1, 'Assumes one 500 km one-way international rail journey for one passenger.');
  }
  if (group.id === 'surface-travel' && item.id === 'coach') {
    return usage(200, 'monthly', 1, 'Assumes one 200 km one-way coach journey each month for one passenger.');
  }
  if (group.id === 'apparel') return usage(1, 'once', 1, 'Assumes one new T-shirt, counting production and distribution.');
  if (group.id === 'digital-devices') return usage(1, 'once', 1, 'Assumes one new device, counting its modelled lifetime footprint once.');
  if (Object.hasOwn(groupDefaults, group.id)) return { ...groupDefaults[group.id] };
  return usage(group.defaultAmount, 'once', 1, 'Assumes ' + group.defaultAmount + ' ' + (group.defaultAmount === 1 ? group.singular : group.plural) + ', once.');
}
