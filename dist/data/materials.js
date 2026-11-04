// Published UK DESNZ 2026 material-use factors, kg CO₂e/tonne. Crown copyright, OGL v3.0.
const publication = 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026';
const workbook = 'https://assets.publishing.service.gov.uk/media/6a29392bade52dc0882218a8/ghg-conversion-factors-2026-full-set.xlsx';

function materialGroup(id, label, rows) {
  return {
    id, label, category: 'Materials', unit: 'per kg of material purchased', singular: 'kg', plural: 'kg', defaultAmount: 1,
    sourceNote: 'UK DESNZ 2026 material procurement factors through the point of sale. Primary material includes extraction and manufacture. Closed-loop recycled material includes sorting and processing into the same type of material. These estimates exclude use, disposal and avoided-production credits. Comparable service can require different weights.',
    sources: [
      { label: 'DESNZ 2026 · Material use worksheet', url: workbook },
      { label: 'DESNZ 2026 · factors and methodology, section 12', url: publication }
    ],
    options: rows.flatMap(([id, label, row, primary, secondary, reused]) => [
      ['primary', 'primary material', 'D', primary],
      [reused ? 'reused' : 'recycled', reused ? 'reused' : 'closed-loop recycled material', reused ? 'E' : 'G', secondary]
    ].filter(([, , , factor]) => factor !== undefined).map(([kind, description, column, factor]) => ({
      id: id + '-' + kind,
      label: label + ' · ' + description,
      values: { carbon: factor / 1000 },
      note: 'Material use, cell ' + column + row + '. ' + factor + ' kg CO₂e per tonne ÷ 1,000 = ' + (factor / 1000) + ' kg CO₂e per kg.'
    })))
  };
}

export const materialGroups = [
  materialGroup('packaging', 'Packaging materials', [
    ['glass', 'Glass', 40, 1402.76667, 823.18954],
    ['aluminium', 'Aluminium for cans or foil (before forming)', 64, 9113.58251, 993.59114],
    ['steel-cans', 'Steel cans', 67, 2861.58251, 1821.58251],
    ['plastic-film', 'Plastic film, average', 73, 2914.94602, 1101.24657],
    ['hdpe', 'High-density polyethylene (HDPE), formed', 75, 3092.8927, 1768.47219],
    ['ldpe', 'Low-density polyethylene (LDPE/LLDPE), formed', 76, 2963.59114, 1095.58251],
    ['pet', 'PET plastic, formed', 77, 3861.58251, 2211.58251],
    ['pp', 'Polypropylene (PP), formed', 78, 2575.25292, 1310.25292],
    ['cardboard', 'Cardboard', 85, 1198.23866, 1096.62766],
    ['paper', 'Paper', 87, 1343.59114, 1048.59114]
  ]),
  materialGroup('clothing-material', 'New and second-hand clothing', [
    ['clothing', 'Clothing, mixed garments', 41, 22310, 152.25, true]
  ]),
  materialGroup('building-material', 'Home improvement materials', [
    ['bricks', 'Bricks', 26, 241.80307],
    ['insulation', 'Insulation', 28, 1861.80307, 1852.13294],
    ['plasterboard', 'Plasterboard', 32, 120.05, 32.17]
  ])
];
