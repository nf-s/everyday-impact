// Derived GEMS examples retain the source group's CC BY 3.0 Australia attribution.
// Published reporting factors retain their own source terms; no cross-source averages.
const medians = {
  'dishwasher-cycles': [{
    id: 'generic-dishwasher-14-place', label: 'Dishwasher wash, 14 place settings',
    members: ['adw1264', 'adw1142'],
    selection: 'Two selected 14-place GEMS registrations on their Eco / Normal Eco test programs. Equal weight per model, per wash including allocated standby; not a market average.'
  }],
  'tv-viewing': [{
    id: 'generic-tv-55-inch', label: 'Watching a 55-inch TV',
    members: ['atv6816', 'atv7109'],
    selection: 'Two selected 55-inch GEMS registrations. Equal weight per model, per viewing hour at tested on-mode power; standby and streaming services excluded. Not a market average.'
  }]
};

const examples = {
  'au-pipeline-gas': [{ id: 'generic-mains-gas-victoria', label: 'Mains gas, Victorian reference', member: 'victoria', selection: 'Published Victorian pipeline-gas factor, including upstream supply. Explicit regional reference, not a national gas factor.' }],
  'digital-devices': [
    { id: 'generic-smartphone', label: 'Smartphone', member: 'smartphone', selection: 'Single-model reference: Apple iPhone 13 Pro, 128 GB (2021). Not a smartphone market average.' },
    { id: 'generic-tablet', label: 'Tablet', member: 'tablet', selection: 'Single-model reference: Apple iPad 9th generation, Wi-Fi + Cellular, 64 GB (2021). Not a tablet market average.' },
    { id: 'generic-laptop', label: 'Laptop', member: 'laptop', selection: 'Single-model reference: Apple MacBook Air 13-inch M1, 256 GB (2020). Not a laptop market average.' },
    { id: 'generic-desktop', label: 'Desktop computer', member: 'desktop-home', selection: 'Single-model reference: Apple Mac mini M1, 256 GB (2020), excluding external display and peripherals. Not a desktop market average.' }
  ],
  'french-meals': [{ id: 'generic-chicken-meal', label: 'Complete meal, chicken reference', member: 'chicken', selection: 'One ADEME complete-meal recipe with 150 g chicken and standard sides and dessert. Named recipe reference, not an average across meals.' }],
  'uk-diets': [{ id: 'generic-medium-meat-diet', label: 'Whole diet, medium-meat reference', member: 'medium-meat', selection: 'Observed medium-meat dietary group: 50 to under 100 g meat/day, standardised to 2,000 kcal. Study-group reference, not a population-average diet or a personal prediction.' }],
  'washer-cycles': [{ id: 'generic-washer-9kg', label: 'Washing machine load, 9 kg', member: 'acw817223759', selection: 'One named 9 kg cold-connected washer, full-load Cotton 40 °C program including allocated standby. Illustrative model, not a washer average.' }],
  refrigeration: [
    { id: 'generic-fridge-freezer', label: 'Fridge-freezer', member: 'arf3715', selection: 'One named 413 L fridge-freezer, continuous operation for 24 hours. Illustrative model, not an average across fridge sizes.' },
    { id: 'generic-chest-freezer', label: 'Chest freezer', member: 'arf3640', selection: 'One named 300 L chest freezer, continuous operation for 24 hours. Illustrative model, not a freezer average.' }
  ]
};

const promoted = {
  'au-grid-electricity': ['national'],
  'uk-motorcycles': ['average'],
  'uk-taxi-travel': ['regular'],
  'surface-travel': ['petrol-car-solo', 'bus', 'coach', 'national-rail', 'tram'],
  flights: ['domestic-flight', 'short-haul-economy', 'long-haul-economy', 'international-economy'],
  'au-stationary-liquid-fuels': ['lpg', 'heating-oil', 'diesel-generator'],
  'au-road-fuels': ['petrol', 'diesel', 'lpg'],
  packaging: ['paper-primary', 'cardboard-primary', 'glass-primary'],
  'clothing-material': ['clothing-primary'],
  'building-material': ['bricks-primary', 'insulation-primary', 'plasterboard-primary'],
  shower: ['standard-7-5l'],
  'laundry-load': ['washer-6kg-4star']
};

function contributor(option, group) {
  const source = option.sources?.[0] || group.sources?.[0];
  return { label: option.label, values: { ...option.values }, ...(source ? { url: source.url } : {}) };
}

function median(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function derivedOption(group, definition, method) {
  const ids = definition.members || [definition.member];
  const members = ids.map(id => group.options.find(option => option.id === id));
  // An incomplete evidence set must not silently become a different estimate.
  if (members.some(member => !member)) return null;
  const keys = Object.keys(members[0].values).filter(key => members.every(member => Number.isFinite(member.values[key])));
  if (!keys.length) return null;
  const values = method === 'representative' ? members[0].values : Object.fromEntries(keys.map(key => [key, median(members.map(member => member.values[key]))]));
  const denominator = method === 'median' ? ' Each measure is the median of ' + members.length + ' model values in the source unit; with an even count, the middle two values are averaged. The measures need not describe one physical model.' : '';
  return {
    ...(method === 'representative' ? members[0] : {}),
    id: definition.id, label: definition.label, values, generic: true,
    note: definition.selection + denominator + ' Source models: ' + members.map(member => member.label + '. ' + (member.note || '')).join(' '),
    sources: [...new Map([...members.flatMap(member => member.sources || []), ...(group.sources || [])].map(source => [source.url, source])).values()],
    genericEvidence: { method, selection: definition.selection, contributors: members.map(member => contributor(member, group)) }
  };
}

// Dated official CSV: filter Cap=8, Combination=No, SubmitStatus=Approved,
// Regulator=Australia, ExpDate>=2026-11-04, finite positive labelled kWh/year.
// One vote per Registration Number; all variants within each registration agree.
const dryerSnapshot = [
  ["ACD0593", "NORJ NHPD815W1", 149.0],
  ["ACD0601", "MIELE TWC220 WP", 112.0],
  ["ACD0603", "BOSCH WTH8300AU", 159.0],
  ["ACD0604", "EURO E8HPCDW", 149.0],
  ["ACD0605", "Kogan KAG8HTPPDYA, KAG8HTPPDYB, KAG8HTPPDYC, KAG8HTPPDYD, KAG8HTPPDYE", 158.0],
  ["ACD0606", "HOOVER HV-LHP8", 145.0],
  ["ACD0611", "BEKO BDCB8020W", 360.0],
  ["ACD0612", "BEKO BDPB802SW", 135.0],
  ["ACD0613", "MIELE TCE 630 WP, TCF 720 WP, TWF 720 WP", 94.0],
  ["ACD0616", "ASKO T208H.W.AU", 150.0],
  ["ACD0617", "ASKO T408HD.T.AU, T408HD.W.AU, T608HX.S.AU, T608HX.W.AU", 119.0],
  ["ACD0619", "ASKO T208C.W.AU", 353.0],
  ["ACD0622", "Westinghouse WDH804N8WA", 156.0],
  ["ACD0627", "MIELE TDD 130 WP", 138.0],
  ["ACD0632", "ELECTROLUX EDH803R9WB", 130.0],
  ["ACD0633", "Stirling SHPD80S, SHPD80W", 159.0],
  ["ACD0634", "Esatto EHPD80, EHPD80S", 159.0],
  ["ACD0635", "AEG T8DHC846C", 151.0],
  ["ACD0637", "Inalto IHPD80, IHPD80S", 159.0],
  ["ACD0639", "AEG T6DHE842B", 151.0],
  ["ACD0640", "HOOVER HV-LHP8", 148.0],
  ["ACD0643", "Solt GGSHPD80W", 135.0],
  ["ACD0659", "Teka THPD80", 159.0],
  ["ACD0661", "EURO E8CCDW", 352.0],
  ["ACD0677", "anko ACD80W", 360.0],
  ["ACD0678", "TCL C1208DRW", 131.0],
  ["ACD0682", "BOSCH WQG235D8AU, WQG235DRAU", 115.0],
  ["ACD0683", "EVOKE EHPD800W", 158.0],
  ["ACD0688", "AEG T858M6OBC", 112.0],
  ["ACD0692", "HISENSE HDFS80HE", 121.0],
  ["ACD0695", "AEG T738A4OBC", 130.0],
  ["ACD0697", "Westinghouse WDH804N8SA", 156.0],
  ["ACD0698", "HOOVER HV-LCD8", 355.0],
  ["ACD0700", "Haier HDHP80AW1", 135.0],
  ["ACD0707", "Kogan KAMHTDRY8BA, KAMHTDRY8BB, KAMHTDRY8BC", 148.0],
  ["ACD0709", "Kogan KAMHTDRY8PA, KAMHTDRY8PB, KAMHTDRY8PC", 159.0],
  ["ACD0712", "Kogan KAMHTDRY8BA, KAMHTDRY8BB, KAMHTDRY8BC", 159.0],
  ["ACD0713", "AEG T8DHC862B", 123.0],
  ["ACD0715", "Solt GGSHPD800B, GGSHPD800C, GGSHPD800S, GGSHPD800W, GGSHPD800X", 159.0],
  ["ACD0717", "Esatto ECD80W", 360.0],
  ["ACD0718", "Everdure EHPD815W", 135.0],
  ["ACD0719", "Solt GGSHPD80", 159.0],
  ["ACD0726", "Artusi AHPD8000W", 149.0],
  ["ACD0727", "Smeg SAHP83S", 135.0],
  ["ACD0728", "ONIX ON-HPD8W", 135.0],
  ["ACD0729", "ONIX ON-VD8W", 349.0],
  ["ACD0732", "LG DVH4-08W, DVH45-08W, DVH45-08WG, DVH5-08W, DVH9-08B, TD-H803CSW", 115.0],
  ["ACD0737", "LG DVH3-08W", 149.0],
  ["ACD0751", "BEKO BDPB8010B, BDPB8010G, BDPB8010W", 135.0],
  ["ACD0752", "MIELE PDR908HP", 141.0],
  ["ACD0753", "Omega OHPD800W", 159.0],
  ["ACD0754", "Esatto EHPD800B, EHPD800W, EHPD800X", 159.0],
  ["ACD0756", "Kogan KAMHTDRY8NA, KAMHTDRY8NB, KAMHTDRY8NC, KAMHTDRY8ND", 159.0],
  ["ACD0757", "yokohama YOKHP80W", 159.0],
  ["ACD0758", "Stirling SHPD80S2, SHPD80W2", 159.0],
  ["ACD0761", "STIRLING STR-VD8W", 332.0],
  ["ACD0762", "MIELE PDR1108HP", 111.0],
  ["ACD0767", "HISENSE HDF5S80H", 110.0],
  ["ACD0773", "BOSCH WQB235B8AU", 98.0],
  ["ACD0775", "MIELE TWD 440 WP", 110.0],
  ["ACD0779", "Inalto IHPD800W", 159.0],
  ["ACD0784", "Altus ADP80W", 135.0],
  ["ACD0786", "Electrolux EDH803P5WC", 130.0],
  ["ACD0787", "Electrolux EDH803R7WC", 115.0],
  ["ACD0796", "HISENSE HDFS80HS", 134.0],
  ["ACD0806", "FISHER & PAYKEL DE8060P2, DE8060P3", 355.0],
  ["ACD0808", "BOSCH WTX88M20AU", 98.0],
  ["ACD0813", "BOSCH WTH83002AU", 135.0],
  ["ACD0815", "Esatto EHPD802B, EHPD802BX, EHPD802S, EHPD802W, EHPD802X", 159.0],
  ["ACD0819", "BEKO BDPB803SW", 115.0],
  ["ACD0827", "Haier HDHP80A1", 134.0],
  ["ACD0830", "Stirling SHPD800S, SHPD800W", 135.0],
  ["ACD0832", "MIELE TEA325 WP, TWC220 WP, TWC340 WP", 112.0],
  ["ACD0833", "ELECTROLUX EDH803CEWA", 158.0],
  ["ACD0836", "AEG T8DHC846B", 156.0],
  ["ACD0837", "AEG T9DHA866C", 123.0],
  ["ACD0839", "AEG T6DHE831B", 156.0],
  ["ACD0841", "MIELE TCD 660 WP, TWD 660 WP", 110.0],
  ["ACD0842", "Haier HDHPS80NB1, HDHPS80NW1", 127.0],
  ["ACD0846", "MIELE PDR908HP P", 149.0],
  ["ACD0850", "SHOME I SEIKI SC-800AU8HP", 159.0],
  ["ACD0852", "SAMSUNG ELECTRONICS DV80T5420AB, DV80T5420AW, DV80T6420LE, DV80T6420LH, DV80TA420DE", 115.0],
  ["ACD0856", "Hafele HZHPD80W", 159.0],
  ["ACD0864", "ASKO T108HW.AU", 130.0],
  ["ACD0865", "ASKO T308HCW.AU", 115.0],
  ["ACD0871", "Inalto IHPD800S2W", 159.0],
  ["ACD0872", "ELECTROLUX EDH812R7WC", 93.0],
  ["ACD0874", "ELECTROLUX EDH812R7WC", 98.0],
  ["ACD0875", "TELEFUNKEN TF800AU8HP", 124.0],
  ["ACD0876", "SEIKI SC-800AU8HP", 124.0],
  ["ACD0878", "Solt GGSHPD88B, GGSHPD88W", 135.0],
  ["ACD0883", "FISHER & PAYKEL DH8060P5, DH8060PG5", 113.0],
  ["ACD0887", "FISHER & PAYKEL DH8060J5", 113.0],
  ["ACD0889", "AEG T8DHC876C", 115.0],
  ["ACD0890", "MIDEA MD110H80/T-AU, MD110H80/W-AU", 135.0],
  ["ACD0891", "MIDEA MD200H80WB/W-AU", 114.0],
  ["ACD0892", "MIDEA MD200H80WB/W-AU", 114.0],
  ["ACD0898", "FISHER & PAYKEL DH8060P1", 155.0],
  ["ACD0901", "Norj NVD28S, NVD28W, NVD8S, NVD8W", 351.0],
  ["ACD0906", "FISHER & PAYKEL DH8060P3", 155.0],
  ["ACD0912", "Haier HDHPS80KB1, HDHPS80KW1", 130.0],
  ["ACD0915", "WHIRLPOOL HWEC8002IG, HWEC8002IW", 135.0],
  ["ACD0920", "Omega OVD8B, OVD8G, OVD8W", 351.0],
  ["ACD0921", "Solt GGSVD8B, GGSVD8G, GGSVD8W", 351.0],
  ["ACD0923", "Westinghouse WDH804N7WA", 158.0],
  ["ACD0925", "Mykin MHPD800B, MHPD800W", 159.0],
  ["ACD0929", "Esatto EVD28B, EVD28G, EVD28W", 351.0],
  ["ACD0930", "Esatto EHPD8002B, EHPD8002W", 159.0],
  ["ACD0936", "Esatto MVD28B, MVD28G, MVD28W", 351.0],
  ["ACD0937", "Esatto EHPD800XB, EHPD800XW", 135.0],
  ["ACD0942", "EUROTECH 360329, 360330", 332.0],
  ["ACD0944", "Hafele HZVD28B, HZVD28G, HZVD28W", 351.0],
  ["ACD0954", "Mistral MBDY578-V8W, MBDY578-V8W-F", 332.0],
  ["ACD0955", "SIEMENS WQ35H2A8AU", 110.0],
  ["ACD0956", "BOSCH WQH235B8AU, WQH235BFAU", 110.0],
  ["ACD0958", "SIEMENS WQ35B2A8AU, WQ35B2AXAU", 98.0],
  ["ACD0962", "Solt GGSHPD8002B, GGSHPD8002W, GGSHPD800S2B, GGSHPD800S2W", 159.0],
  ["ACD0966", "LG DXH3-08G, DXH3-08W", 135.0],
  ["ACD0968", "Inalto IVD28B, IVD28BHi, IVD28G, IVD28W", 351.0],
  ["ACD0971", "LG DVH1-08WP", 135.0],
  ["ACD0973", "HAIER HDHP80AN1, HDHP80ANB1", 135.0],
  ["ACD0977", "Kogan KAMHTDRY8NB, KAMHTDRY8NC, KAMHTDRY8ND, KAMHTDRY8NE, KAMHTDRY8NF", 140.0],
  ["ACD0992", "Electrolux TD2-8 (TE1120)", 357.0],
  ["ACD0996", "Artusi AHPD8800GB, AHPD8800W", 135.0],
  ["ACD1003", "HAIER HDC80E1", 359.0],
  ["ACD1004", "Bellaro BDV8-W-AU", 332.0],
  ["ACD1015", "CHIQ HPD78PG2, HPD80PW1", 115.0],
  ["ACD1021", "Devanti TD-D-8KG-GY, TD-D-8KG-WH", 327.0]
];
const dryerSource = 'https://data.gov.au/data/dataset/559708e5-480e-4f94-8429-c49571e82761/resource/f734c56b-a255-4c4e-a3c1-e835c38b8774/download/cd_2026_11_03.csv';

function registeredDryerMedian(group) {
  const contributors = dryerSnapshot.map(([id, label, annual]) => ({ id, label, values: { energy: annual / 52 }, url: dryerSource }));
  const selection = '128 distinct approved Australian standalone 8 kg dryer registrations in the GEMS CSV dated 3 November 2026, not expired on 4 November 2026. One equal vote per registration; model variants sharing a registration count once. Includes vented and condenser dryers. Registration counts are not sales or household weights.';
  return {
    id: 'generic-dryer-8kg', label: 'Clothes dryer load, 8 kg', generic: true,
    values: { energy: median(contributors.map(item => item.values.energy)) },
    note: selection + ' Median labelled electricity is 146.5 kWh/year, divided by 52 full loads: 2.8173076923 kWh/load. The middle two registrations are averaged. This is a registration median, not electricity for an average Australian household or a particular dryer. Manufacture and disposal are excluded.',
    sources: [{ label: 'GEMS clothes dryers · dated CSV, 3 November 2026', url: dryerSource }, ...group.sources],
    genericEvidence: { method: 'median', selection, contributors }
  };
}

// Pure catalogue overlay. Specific records and their stable IDs remain searchable.
export function withActivityGenerics(groups) {
  return groups.map(group => {
    const added = [
      ...(group.id === 'dryer-loads' ? [registeredDryerMedian(group)] : []),
      ...(medians[group.id] || []).map(definition => derivedOption(group, definition, 'median')),
      ...(examples[group.id] || []).map(definition => derivedOption(group, definition, 'representative'))
    ].filter(Boolean);
    const singletonGroups = ['apparel', 'return-flight'];
    const ids = promoted[group.id] || (singletonGroups.includes(group.id) && group.options.length === 1 ? [group.options[0].id] : []);
    if (!added.length && !ids.length) return group;
    const promotedOptions = ids.flatMap(id => {
      const option = group.options.find(option => option.id === id);
      return option ? [{ ...option, generic: true }] : [];
    });
    const firstIds = new Set([...added, ...promotedOptions].map(option => option.id));
    return { ...group, options: [...added, ...promotedOptions, ...group.options.filter(option => !firstIds.has(option.id))] };
  });
}
