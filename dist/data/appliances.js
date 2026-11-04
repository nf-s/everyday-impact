// DCCEEW GEMS registration extracts, 3 November 2026. CC BY 3.0 Australia.
const dataset = 'https://data.gov.au/data/dataset/559708e5-480e-4f94-8429-c49571e82761';
const labelGuide = 'https://www.energyrating.gov.au/consumer-information/understand-energy-rating-label';

function applianceGroup(id, label, resource, unit, singular, plural, scope, options) {
  return {
    id, label, category: 'Appliances', unit, singular, plural, defaultAmount: 1,
    sourceNote: scope + ' Selected Australian and New Zealand GEMS registrations, 3 November 2026. These are supplier test results for named models. Household use varies with settings and load. Manufacture and disposal are outside the estimates.',
    sources: [
      { label: 'GEMS registration data · ' + label, url: dataset + '/resource/' + resource },
      { label: 'Energy Rating · label usage assumptions', url: labelGuide }
    ],
    options
  };
}

// Preserve the label's kWh/year and the test program's litres per cycle.
// Electricity per use includes its share of label standby consumption.
function wash(registration, model, capacity, program, kWhPerYear, litres) {
  return {
    id: registration.toLowerCase(), label: model + ' · ' + capacity,
    values: { energy: kWhPerYear / 365, tapWater: litres },
    note: 'GEMS ' + registration + ' · ' + program + '. Registered annual electricity is ' + kWhPerYear +
      ' kWh at one wash a day, divided by 365. The test program uses ' + litres + ' L (Tot Wat Cons).'
  };
}

function dryer(registration, model, kg, type, kWhPerYear) {
  return {
    id: registration.toLowerCase(), label: model + ' · ' + kg + ' kg ' + type + ' dryer',
    values: { energy: kWhPerYear / 52 },
    note: 'GEMS ' + registration + '. The registered ' + kWhPerYear + ' kWh/year is divided by 52 full loads.'
  };
}

function refrigerator(registration, model, litres, type, kWhPerYear) {
  return {
    id: registration.toLowerCase(), label: model + ' · ' + litres + ' L ' + type,
    values: { energy: kWhPerYear / 365 },
    note: 'GEMS ' + registration + '. The registered ' + kWhPerYear + ' kWh/year is divided by 365 days of continuous operation.'
  };
}

function television(registration, model, screenCm, watts) {
  return {
    id: registration.toLowerCase(), label: model + ' · ' + Math.round(screenCm / 2.54) + '″ TV',
    values: { energy: watts / 1000 },
    note: 'GEMS ' + registration + '. Tested on-mode power is ' + watts + ' W (Avg_mode_power), or ' + (watts / 1000) + ' kWh per viewing hour. Diagonal rounded to the nearest inch.'
  };
}

export const applianceGroups = [
  applianceGroup('dishwasher-cycles', 'Dishwasher cycles', 'cbe7057d-e132-4297-b8be-eecf8322d4e6',
    'per wash on the registered program', 'wash', 'washes',
    'The label assumes one wash per day including standby. Compare models with a similar number of place settings.', [
      wash('ADW0976', 'Ilve IVDFS55', '6 place settings', 'Eco', 158, 7.4),
      wash('ADW1239', 'Fisher & Paykel DD60SDFTB9', '7 place settings', 'Eco', 136, 6.743),
      wash('ADW1358', 'Bosch SMS2ITI02A', '13 place settings', 'Eco Wash', 255, 12.39),
      wash('ADW1264', 'Miele G 5000', '14 place settings', 'Eco', 219, 9.21),
      wash('ADW1142', 'Smeg DWAU6314X2', '14 place settings', 'Normal Eco', 243, 9.9),
      wash('ADW1233', 'Haier HDW15F2S1', '15 place settings', 'Eco', 246, 11.67),
      wash('ADW0974', 'Hisense HSCM15FS', '15 place settings', 'Eco', 246, 11.8)
    ]),
  applianceGroup('washer-cycles', 'Washing machine cycles', 'eb3b9d8e-f39d-47b7-9db0-309856176951',
    'per cotton wash at 40 °C', 'wash', 'washes',
    'These models connect to cold water and heat it internally. Test cycles use a full rated load on the 40 °C cotton program, including a share of standby electricity.', [
      wash('ACW818345262', 'Seiki SC-600AU6FL', '6 kg', 'Cotton 40 °C', 301, 66.4),
      wash('ACW818093049', 'Telefunken TF750AUFL9', '7.5 kg', 'Cotton 40 °C', 180, 61.34),
      wash('ACW817311785', 'Kogan KAFWASH85TC', '8.5 kg', 'Cotton 40 °C', 201, 70.12),
      wash('ACW817223759', 'TCL WF90S30G', '9 kg', 'Cotton 40 °C', 204, 71.46),
      wash('ACW818068620', 'Telefunken TF100AUFL8', '10 kg', 'Cotton 40 °C', 241, 80.06)
    ]),
  applianceGroup('dryer-loads', 'Clothes dryer loads', 'f734c56b-a255-4c4e-a3c1-e835c38b8774',
    'per full drying cycle', 'load', 'loads',
    'The label assumes one full load per week at the stated capacity.', [
      dryer('ACD0826', 'Solt GGSVDE45S', 4.5, 'vented', 202),
      dryer('ACD0916', 'Westinghouse WDV656N3WB', 6.5, 'vented', 291),
      dryer('ACD0929', 'Esatto EVD28B', 8, 'vented', 351),
      dryer('ACD0698', 'Hoover HV-LCD8', 8, 'condenser', 355),
      dryer('ACD0833', 'Electrolux EDH803CEWA', 8, 'condenser', 158),
      dryer('ACD0915', 'Whirlpool HWEC8002IW', 8, 'condenser', 135),
      dryer('ACD0699', 'Fisher & Paykel DH9060HG1', 9, 'condenser', 106)
    ]),
  applianceGroup('refrigeration', 'Fridges and freezers', '0eabca18-49bb-4a9e-8019-28d5d56501c4',
    'per 24 hours of operation', 'day', 'days',
    'The label models continuous refrigeration for the year. Capacity is the registered total volume.', [
      refrigerator('ARF3861', 'Konka KR-70', 67, 'fridge', 109),
      refrigerator('ARF3800', 'Kogan KAM143LICFC', 143, 'chest freezer', 164),
      refrigerator('ARF3640', 'Haier HCF300W', 300, 'chest freezer', 189),
      refrigerator('ARF3032', 'CHiQ CRBM228NR3', 231, 'fridge-freezer', 237),
      refrigerator('ARF3643', 'Smeg FAB28LWH6', 270, 'fridge-freezer', 151),
      refrigerator('ARF3715', 'Midea MDRT580MTF45AP', 413, 'fridge-freezer', 302),
      refrigerator('ARF3582', 'Fisher & Paykel RF505BRNUX1', 515, 'fridge-freezer', 259),
      refrigerator('ARF3527', 'Samsung SRS6800BFH', 615, 'fridge-freezer', 450)
    ]),
  applianceGroup('tv-viewing', 'Watching television', '93a615e5-935e-4713-a4b0-379e3f6dedc9',
    'per hour with the television on', 'hour', 'hours',
    'Viewing uses the tested on-mode watts. Standby, streaming services and other connected devices are outside this figure.', [
      television('ATV6105', 'TECO LED32AHSRC', 80.054, 26.3),
      television('ATV6386', 'LG OLED48C56LA', 120.721, 76),
      television('ATV6816', 'Toshiba 55C350RP', 138.783, 63.29),
      television('ATV7109', 'Samsung QA55QN80HAW', 138.783, 102),
      television('ATV6135', 'Kogan KAQL65MQ9TA', 165.513, 136.1),
      television('ATV6014', 'Samsung UA75DU7000S', 189.338, 137)
    ])
];
