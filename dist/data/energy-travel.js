// Selected official reporting factors; see each group for edition, boundary and reuse terms.
export const energyTravelGroups = [
  {
    "id": "au-grid-electricity",
    "label": "Grid electricity (Australia, 2026)",
    "category": "Home energy",
    "unit": "per kWh of grid electricity used",
    "singular": "kWh",
    "plural": "kWh",
    "defaultAmount": 10,
    "sourceNote": "Location-based reporting averages for the named state or grid, including the published scope 2 and scope 3 factors. Scope 3 includes grid losses. Edition August 2026 uses 2024–25 reporting inputs; hydro-dam methane is included. Greenhouse gases use AR5 100-year warming potentials. These are annual averages, not live or marginal emissions. Renewable tariffs, rooftop solar and battery cycling are not modelled. Use electricity consumed at the property; do not add this to appliance use already counted in the same bill. DCCEEW 2026, Australian National Greenhouse Accounts Factors, Department of Climate Change, Energy, the Environment and Water, Canberra, August. © Commonwealth of Australia 2026, CC BY 4.0. Selected factors are combined and converted to the displayed units. Logos, the Coat of Arms, WELS labels and separately identified third-party material are excluded; none is reproduced.",
    "sources": [
      {
        "label": "DCCEEW (2026): National Greenhouse Accounts Factors",
        "url": "https://www.dcceew.gov.au/climate-change/publications/national-greenhouse-accounts-factors-2026"
      },
      {
        "label": "NGA 2026: official factors workbook",
        "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.xlsx"
      },
      {
        "label": "DCCEEW copyright: CC BY 4.0 and exclusions",
        "url": "https://www.dcceew.gov.au/about/copyright"
      }
    ],
    "options": [
      {
        "id": "nsw-act",
        "label": "New South Wales and ACT",
        "values": {
          "carbon": 0.67,
          "energy": 1
        },
        "note": "Table 1: scope 2 0.6 + scope 3 0.07 = 0.67 kg CO₂e per kWh. Electricity shown is delivered electricity; power-station and network construction are not modelled.",
        "sources": [
          {
            "label": "NGA 2026 Table 1, workbook B4:C4",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=10"
          }
        ]
      },
      {
        "id": "victoria",
        "label": "Victoria",
        "values": {
          "carbon": 0.85,
          "energy": 1
        },
        "note": "Table 1: scope 2 0.74 + scope 3 0.11 = 0.85 kg CO₂e per kWh. Electricity shown is delivered electricity; power-station and network construction are not modelled.",
        "sources": [
          {
            "label": "NGA 2026 Table 1, workbook B5:C5",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=10"
          }
        ]
      },
      {
        "id": "queensland",
        "label": "Queensland",
        "values": {
          "carbon": 0.76,
          "energy": 1
        },
        "note": "Table 1: scope 2 0.65 + scope 3 0.11 = 0.76 kg CO₂e per kWh. Electricity shown is delivered electricity; power-station and network construction are not modelled.",
        "sources": [
          {
            "label": "NGA 2026 Table 1, workbook B6:C6",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=10"
          }
        ]
      },
      {
        "id": "south-australia",
        "label": "South Australia",
        "values": {
          "carbon": 0.24,
          "energy": 1
        },
        "note": "Table 1: scope 2 0.21 + scope 3 0.03 = 0.24 kg CO₂e per kWh. Electricity shown is delivered electricity; power-station and network construction are not modelled.",
        "sources": [
          {
            "label": "NGA 2026 Table 1, workbook B7:C7",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=10"
          }
        ]
      },
      {
        "id": "wa-swis",
        "label": "Western Australia · SWIS",
        "values": {
          "carbon": 0.55,
          "energy": 1
        },
        "note": "Table 1: scope 2 0.45 + scope 3 0.1 = 0.55 kg CO₂e per kWh. Electricity shown is delivered electricity; power-station and network construction are not modelled.",
        "sources": [
          {
            "label": "NGA 2026 Table 1, workbook B8:C8",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=10"
          }
        ]
      },
      {
        "id": "wa-nwis",
        "label": "Western Australia · NWIS",
        "values": {
          "carbon": 0.65,
          "energy": 1
        },
        "note": "Table 1: scope 2 0.56 + scope 3 0.09 = 0.65 kg CO₂e per kWh. Electricity shown is delivered electricity; power-station and network construction are not modelled.",
        "sources": [
          {
            "label": "NGA 2026 Table 1, workbook B9:C9",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=10"
          }
        ]
      },
      {
        "id": "tasmania",
        "label": "Tasmania",
        "values": {
          "carbon": 0.24,
          "energy": 1
        },
        "note": "Table 1: scope 2 0.21 + scope 3 0.03 = 0.24 kg CO₂e per kWh. Electricity shown is delivered electricity; power-station and network construction are not modelled.",
        "sources": [
          {
            "label": "NGA 2026 Table 1, workbook B10:C10",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=10"
          }
        ]
      },
      {
        "id": "nt-dkis",
        "label": "Northern Territory · Darwin–Katherine grid",
        "values": {
          "carbon": 0.68,
          "energy": 1
        },
        "note": "Table 1: scope 2 0.55 + scope 3 0.13 = 0.68 kg CO₂e per kWh. Electricity shown is delivered electricity; power-station and network construction are not modelled.",
        "sources": [
          {
            "label": "NGA 2026 Table 1, workbook B11:C11",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=10"
          }
        ]
      },
      {
        "id": "national",
        "label": "Australian national grid average",
        "values": {
          "carbon": 0.69,
          "energy": 1
        },
        "note": "Table 1: scope 2 0.59 + scope 3 0.1 = 0.69 kg CO₂e per kWh. Electricity shown is delivered electricity; power-station and network construction are not modelled.",
        "sources": [
          {
            "label": "NGA 2026 Table 1, workbook B12:C12",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=10"
          }
        ]
      }
    ]
  },
  {
    "id": "au-pipeline-gas",
    "label": "Pipeline natural gas (Australia, 2026)",
    "category": "Home energy",
    "unit": "per MJ of pipeline gas consumed",
    "singular": "MJ",
    "plural": "MJ",
    "defaultAmount": 20,
    "sourceNote": "Combustion plus the published regional upstream factor. Metro means NSW on/east of the dividing range (including Canberra and Queanbeyan), Melbourne, Brisbane, Adelaide or Perth; otherwise choose non-metro. Upstream factors originate from a 2012 study and exclude low-pressure distribution leakage. Tasmania and NT use explicitly labelled suggested proxies. Appliance efficiency and infrastructure manufacture are excluded. Do not treat equal fuel input as equal useful heating. DCCEEW 2026, Australian National Greenhouse Accounts Factors, Department of Climate Change, Energy, the Environment and Water, Canberra, August. © Commonwealth of Australia 2026, CC BY 4.0. Selected factors are combined and converted to the displayed units. Logos, the Coat of Arms, WELS labels and separately identified third-party material are excluded; none is reproduced.",
    "sources": [
      {
        "label": "DCCEEW (2026): National Greenhouse Accounts Factors",
        "url": "https://www.dcceew.gov.au/climate-change/publications/national-greenhouse-accounts-factors-2026"
      },
      {
        "label": "NGA 2026: official factors workbook",
        "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.xlsx"
      },
      {
        "label": "DCCEEW copyright: CC BY 4.0 and exclusions",
        "url": "https://www.dcceew.gov.au/about/copyright"
      }
    ],
    "options": [
      {
        "id": "nsw-act-metro",
        "label": "NSW and ACT · metro",
        "values": {
          "carbon": 0.06463
        },
        "note": "Tables 5–6: (51.53 combustion + 13.1 upstream) kg CO₂e/GJ ÷ 1,000 = 0.06463 kg CO₂e/MJ. Gross calorific fuel-energy input, not useful heat.",
        "sources": [
          {
            "label": "NGA 2026 Tables 5–6 and regional proxy notes",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=19"
          }
        ]
      },
      {
        "id": "nsw-act-nonmetro",
        "label": "NSW · non-metro",
        "values": {
          "carbon": 0.06553
        },
        "note": "Tables 5–6: (51.53 combustion + 14 upstream) kg CO₂e/GJ ÷ 1,000 = 0.06553 kg CO₂e/MJ. Gross calorific fuel-energy input, not useful heat.",
        "sources": [
          {
            "label": "NGA 2026 Tables 5–6 and regional proxy notes",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=19"
          }
        ]
      },
      {
        "id": "victoria",
        "label": "Victoria",
        "values": {
          "carbon": 0.05553
        },
        "note": "Tables 5–6: (51.53 combustion + 4 upstream) kg CO₂e/GJ ÷ 1,000 = 0.05553 kg CO₂e/MJ. Gross calorific fuel-energy input, not useful heat.",
        "sources": [
          {
            "label": "NGA 2026 Tables 5–6 and regional proxy notes",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=19"
          }
        ]
      },
      {
        "id": "queensland-metro",
        "label": "Queensland · metro",
        "values": {
          "carbon": 0.06033
        },
        "note": "Tables 5–6: (51.53 combustion + 8.8 upstream) kg CO₂e/GJ ÷ 1,000 = 0.06033 kg CO₂e/MJ. Gross calorific fuel-energy input, not useful heat.",
        "sources": [
          {
            "label": "NGA 2026 Tables 5–6 and regional proxy notes",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=19"
          }
        ]
      },
      {
        "id": "queensland-nonmetro",
        "label": "Queensland · non-metro",
        "values": {
          "carbon": 0.05943
        },
        "note": "Tables 5–6: (51.53 combustion + 7.9 upstream) kg CO₂e/GJ ÷ 1,000 = 0.05943 kg CO₂e/MJ. Gross calorific fuel-energy input, not useful heat.",
        "sources": [
          {
            "label": "NGA 2026 Tables 5–6 and regional proxy notes",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=19"
          }
        ]
      },
      {
        "id": "sa-metro",
        "label": "South Australia · metro",
        "values": {
          "carbon": 0.06223
        },
        "note": "Tables 5–6: (51.53 combustion + 10.7 upstream) kg CO₂e/GJ ÷ 1,000 = 0.06223 kg CO₂e/MJ. Gross calorific fuel-energy input, not useful heat.",
        "sources": [
          {
            "label": "NGA 2026 Tables 5–6 and regional proxy notes",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=19"
          }
        ]
      },
      {
        "id": "sa-nonmetro",
        "label": "South Australia · non-metro",
        "values": {
          "carbon": 0.06213
        },
        "note": "Tables 5–6: (51.53 combustion + 10.6 upstream) kg CO₂e/GJ ÷ 1,000 = 0.06213 kg CO₂e/MJ. Gross calorific fuel-energy input, not useful heat.",
        "sources": [
          {
            "label": "NGA 2026 Tables 5–6 and regional proxy notes",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=19"
          }
        ]
      },
      {
        "id": "wa-metro",
        "label": "Western Australia · metro",
        "values": {
          "carbon": 0.05563
        },
        "note": "Tables 5–6: (51.53 combustion + 4.1 upstream) kg CO₂e/GJ ÷ 1,000 = 0.05563 kg CO₂e/MJ. Gross calorific fuel-energy input, not useful heat.",
        "sources": [
          {
            "label": "NGA 2026 Tables 5–6 and regional proxy notes",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=19"
          }
        ]
      },
      {
        "id": "wa-nonmetro",
        "label": "Western Australia · non-metro",
        "values": {
          "carbon": 0.05553
        },
        "note": "Tables 5–6: (51.53 combustion + 4 upstream) kg CO₂e/GJ ÷ 1,000 = 0.05553 kg CO₂e/MJ. Gross calorific fuel-energy input, not useful heat.",
        "sources": [
          {
            "label": "NGA 2026 Tables 5–6 and regional proxy notes",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=19"
          }
        ]
      },
      {
        "id": "tas-victorian-proxy",
        "label": "Tasmania · Victorian upstream proxy",
        "values": {
          "carbon": 0.05553
        },
        "note": "Tables 5–6: (51.53 combustion + 4 upstream) kg CO₂e/GJ ÷ 1,000 = 0.05553 kg CO₂e/MJ. Gross calorific fuel-energy input, not useful heat. Tasmania’s upstream factor is confidential. Uses the publication’s recommended Victorian proxy; not a measured Tasmanian upstream factor.",
        "sources": [
          {
            "label": "NGA 2026 Tables 5–6 and regional proxy notes",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=19"
          }
        ]
      },
      {
        "id": "nt-wa-proxy",
        "label": "Northern Territory · WA non-metro proxy",
        "values": {
          "carbon": 0.05553
        },
        "note": "Tables 5–6: (51.53 combustion + 4 upstream) kg CO₂e/GJ ÷ 1,000 = 0.05553 kg CO₂e/MJ. Gross calorific fuel-energy input, not useful heat. NT’s upstream factor is confidential. Uses the suggested WA proxy, choosing its non-metro value; not a measured NT upstream factor.",
        "sources": [
          {
            "label": "NGA 2026 Tables 5–6 and regional proxy notes",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=19"
          }
        ]
      }
    ]
  },
  {
    "id": "au-stationary-liquid-fuels",
    "label": "Liquid fuels for home energy (Australia, 2026)",
    "category": "Home energy",
    "unit": "per litre of stationary fuel consumed",
    "singular": "litre",
    "plural": "litres",
    "defaultAmount": 1,
    "sourceNote": "Liquid-fuel combustion plus the published upstream fuel factor. Stationary use means use in a boiler, heater or generator, not a road vehicle. Delivered heat or electricity depends on appliance efficiency and is not estimated. Fuel storage, appliance manufacture, air pollution and other impacts are outside these factors. DCCEEW 2026, Australian National Greenhouse Accounts Factors, Department of Climate Change, Energy, the Environment and Water, Canberra, August. © Commonwealth of Australia 2026, CC BY 4.0. Selected factors are combined and converted to the displayed units. Logos, the Coat of Arms, WELS labels and separately identified third-party material are excluded; none is reproduced.",
    "sources": [
      {
        "label": "DCCEEW (2026): National Greenhouse Accounts Factors",
        "url": "https://www.dcceew.gov.au/climate-change/publications/national-greenhouse-accounts-factors-2026"
      },
      {
        "label": "NGA 2026: official factors workbook",
        "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.xlsx"
      },
      {
        "label": "DCCEEW copyright: CC BY 4.0 and exclusions",
        "url": "https://www.dcceew.gov.au/about/copyright"
      }
    ],
    "options": [
      {
        "id": "lpg",
        "label": "LPG for stationary use",
        "values": {
          "carbon": 2.07656
        },
        "note": "Table 8: 25.7 GJ/kL × (60.6 combustion + 20.2 upstream) kg CO₂e/GJ ÷ 1,000 L/kL = 2.07656 kg CO₂e/L. This is liquid volume; do not enter kilograms of bottled LPG.",
        "sources": [
          {
            "label": "NGA 2026 Table 8, workbook row 18",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=24"
          }
        ]
      },
      {
        "id": "heating-oil",
        "label": "Heating oil",
        "values": {
          "carbon": 3.272329
        },
        "note": "Table 8: 37.3 GJ/kL × (69.73 combustion + 18 upstream) kg CO₂e/GJ ÷ 1,000 L/kL = 3.272329 kg CO₂e/L. This is liquid volume; do not enter kilograms of bottled LPG.",
        "sources": [
          {
            "label": "NGA 2026 Table 8, workbook row 13",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=24"
          }
        ]
      },
      {
        "id": "diesel-generator",
        "label": "Diesel for a generator",
        "values": {
          "carbon": 3.3775
        },
        "note": "Table 8: 38.6 GJ/kL × (70.2 combustion + 17.3 upstream) kg CO₂e/GJ ÷ 1,000 L/kL = 3.3775 kg CO₂e/L. This is liquid volume; do not enter kilograms of bottled LPG.",
        "sources": [
          {
            "label": "NGA 2026 Table 8, workbook row 14",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=24"
          }
        ]
      }
    ]
  },
  {
    "id": "au-road-fuels",
    "label": "Road fuel consumed (Australia, 2026)",
    "category": "Travel",
    "unit": "per litre of vehicle fuel burned",
    "singular": "litre",
    "plural": "litres",
    "defaultAmount": 10,
    "sourceNote": "For measured fuel consumption in cars and light commercial vehicles. Includes tailpipe emissions and the published upstream fuel factor. Does not estimate distance, fuel economy, occupancy, vehicle manufacture or road infrastructure. Allocate a shared vehicle’s total between its occupants separately. Do not add this fuel estimate to distance-based emissions for the same driving. DCCEEW 2026, Australian National Greenhouse Accounts Factors, Department of Climate Change, Energy, the Environment and Water, Canberra, August. © Commonwealth of Australia 2026, CC BY 4.0. Selected factors are combined and converted to the displayed units. Logos, the Coat of Arms, WELS labels and separately identified third-party material are excluded; none is reproduced.",
    "sources": [
      {
        "label": "DCCEEW (2026): National Greenhouse Accounts Factors",
        "url": "https://www.dcceew.gov.au/climate-change/publications/national-greenhouse-accounts-factors-2026"
      },
      {
        "label": "NGA 2026: official factors workbook",
        "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.xlsx"
      },
      {
        "label": "DCCEEW copyright: CC BY 4.0 and exclusions",
        "url": "https://www.dcceew.gov.au/about/copyright"
      }
    ],
    "options": [
      {
        "id": "petrol",
        "label": "Petrol · cars and light commercial vehicles",
        "values": {
          "carbon": 2.900844
        },
        "note": "Table 9: 34.2 GJ/kL × (67.62 combustion + 17.2 upstream) kg CO₂e/GJ ÷ 1,000 L/kL = 2.900844 kg CO₂e/L. Per litre burned by the vehicle; not per passenger-km.",
        "sources": [
          {
            "label": "NGA 2026 Table 9, workbook row 5",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=27"
          }
        ]
      },
      {
        "id": "diesel",
        "label": "Diesel · cars and light commercial vehicles",
        "values": {
          "carbon": 3.385606
        },
        "note": "Table 9: 38.6 GJ/kL × (70.41 combustion + 17.3 upstream) kg CO₂e/GJ ÷ 1,000 L/kL = 3.385606 kg CO₂e/L. Per litre burned by the vehicle; not per passenger-km.",
        "sources": [
          {
            "label": "NGA 2026 Table 9, workbook row 6",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=27"
          }
        ]
      },
      {
        "id": "lpg",
        "label": "LPG · cars and light commercial vehicles",
        "values": {
          "carbon": 2.12744
        },
        "note": "Table 9: 26.2 GJ/kL × (61 combustion + 20.2 upstream) kg CO₂e/GJ ÷ 1,000 L/kL = 2.12744 kg CO₂e/L. Per litre burned by the vehicle; not per passenger-km.",
        "sources": [
          {
            "label": "NGA 2026 Table 9, workbook row 7",
            "url": "https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-accounts-factors-2026.pdf#page=27"
          }
        ]
      }
    ]
  },
  {
    "id": "uk-motorcycles",
    "label": "Motorcycles (UK, 2026)",
    "category": "Travel",
    "unit": "per vehicle-km with one rider",
    "singular": "km",
    "plural": "km",
    "defaultAmount": 10,
    "sourceNote": "Operational greenhouse gases only; fuel production, motorcycle manufacture and road infrastructure are excluded. UK reporting factors in the June 2026 full workbook. Methodology uses older real-world data and category registration weights; these are not measurements of a particular motorcycle or Australian fleet. UK DESNZ (2026), Crown copyright 2026, Open Government Licence v3.0. Published government factors only; underlying third-party datasets, logos and reports are not redistributed. Accessed 4 November 2026.",
    "sources": [
      {
        "label": "UK DESNZ: greenhouse gas conversion factors 2026",
        "url": "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026"
      },
      {
        "label": "UK DESNZ 2026: full factors workbook",
        "url": "https://assets.publishing.service.gov.uk/media/6a29392bade52dc0882218a8/ghg-conversion-factors-2026-full-set.xlsx"
      },
      {
        "label": "UK DESNZ 2026: methodology and OGL notice",
        "url": "https://assets.publishing.service.gov.uk/media/6a2940543b15d05a7ce3202e/2026-GHG-conversion-factors-methodology-report.pdf"
      },
      {
        "label": "Open Government Licence v3.0",
        "url": "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
      }
    ],
    "options": [
      {
        "id": "small",
        "label": "Small motorcycle · up to 125 cc",
        "values": {
          "carbon": 0.08319
        },
        "note": "Up to 125 cc, including mopeds and scooters. Vehicle-km with one rider; carrying a second person does not halve the whole-vehicle estimate automatically.",
        "sources": [
          {
            "label": "DESNZ 2026 Business travel–land, D59",
            "url": "https://assets.publishing.service.gov.uk/media/6a29392bade52dc0882218a8/ghg-conversion-factors-2026-full-set.xlsx"
          }
        ]
      },
      {
        "id": "medium",
        "label": "Medium motorcycle · 125–500 cc",
        "values": {
          "carbon": 0.10108
        },
        "note": "Source category 125–500 cc. Vehicle-km with one rider; carrying a second person does not halve the whole-vehicle estimate automatically.",
        "sources": [
          {
            "label": "DESNZ 2026 Business travel–land, D61",
            "url": "https://assets.publishing.service.gov.uk/media/6a29392bade52dc0882218a8/ghg-conversion-factors-2026-full-set.xlsx"
          }
        ]
      },
      {
        "id": "large",
        "label": "Large motorcycle · over 500 cc",
        "values": {
          "carbon": 0.13252
        },
        "note": "Over 500 cc. Vehicle-km with one rider; carrying a second person does not halve the whole-vehicle estimate automatically.",
        "sources": [
          {
            "label": "DESNZ 2026 Business travel–land, D63",
            "url": "https://assets.publishing.service.gov.uk/media/6a29392bade52dc0882218a8/ghg-conversion-factors-2026-full-set.xlsx"
          }
        ]
      },
      {
        "id": "average",
        "label": "Average motorcycle",
        "values": {
          "carbon": 0.11367
        },
        "note": "Weighted average across the published motorcycle categories. Vehicle-km with one rider; carrying a second person does not halve the whole-vehicle estimate automatically.",
        "sources": [
          {
            "label": "DESNZ 2026 Business travel–land, D65",
            "url": "https://assets.publishing.service.gov.uk/media/6a29392bade52dc0882218a8/ghg-conversion-factors-2026-full-set.xlsx"
          }
        ]
      }
    ]
  },
  {
    "id": "uk-taxi-travel",
    "label": "Taxi travel (UK, 2026)",
    "category": "Travel",
    "unit": "per passenger-km",
    "singular": "km",
    "plural": "km",
    "defaultAmount": 10,
    "sourceNote": "Operational greenhouse gases allocated per passenger using the government’s occupancy assumptions. Excludes fuel production, vehicle manufacture and empty cruising for fares. UK fleet and operating assumptions are not an Australian taxi or rideshare factor. UK DESNZ (2026), Crown copyright 2026, Open Government Licence v3.0. Published government factors only; underlying third-party datasets, logos and reports are not redistributed. Accessed 4 November 2026.",
    "sources": [
      {
        "label": "UK DESNZ: greenhouse gas conversion factors 2026",
        "url": "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026"
      },
      {
        "label": "UK DESNZ 2026: full factors workbook",
        "url": "https://assets.publishing.service.gov.uk/media/6a29392bade52dc0882218a8/ghg-conversion-factors-2026-full-set.xlsx"
      },
      {
        "label": "UK DESNZ 2026: methodology and OGL notice",
        "url": "https://assets.publishing.service.gov.uk/media/6a2940543b15d05a7ce3202e/2026-GHG-conversion-factors-methodology-report.pdf"
      },
      {
        "label": "Open Government Licence v3.0",
        "url": "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
      }
    ],
    "options": [
      {
        "id": "regular",
        "label": "Regular taxi",
        "values": {
          "carbon": 0.14861
        },
        "note": "UK passenger-km factor; methodology assumes 1.4 passengers, excluding the driver. Per passenger, not per whole vehicle; no further occupancy division is applied.",
        "sources": [
          {
            "label": "DESNZ 2026 Business travel–land, D71",
            "url": "https://assets.publishing.service.gov.uk/media/6a29392bade52dc0882218a8/ghg-conversion-factors-2026-full-set.xlsx"
          }
        ]
      },
      {
        "id": "black-cab",
        "label": "London black cab",
        "values": {
          "carbon": 0.20402
        },
        "note": "London taxi operating cycle; methodology assumes 1.5 passengers, excluding the driver. Per passenger, not per whole vehicle; no further occupancy division is applied.",
        "sources": [
          {
            "label": "DESNZ 2026 Business travel–land, D73",
            "url": "https://assets.publishing.service.gov.uk/media/6a29392bade52dc0882218a8/ghg-conversion-factors-2026-full-set.xlsx"
          }
        ]
      }
    ]
  },
  {
    "id": "uk-ferry-travel",
    "label": "Mixed passenger and freight ferries (UK, 2026)",
    "category": "Travel",
    "unit": "per passenger-km at sea",
    "singular": "km",
    "plural": "km",
    "defaultAmount": 50,
    "sourceNote": "Operational emissions from mixed roll-on/roll-off passenger and freight ferries on UK routes. Weight allocation distinguishes passengers with cars from foot passengers. The underlying study dates to 2007; the 2026 workbook retains that method. Excludes passenger-only ferries, cruises, fuel production and vessel manufacture. Not a route-specific Australian ferry estimate. UK DESNZ (2026), Crown copyright 2026, Open Government Licence v3.0. Published government factors only; underlying third-party datasets, logos and reports are not redistributed. Accessed 4 November 2026.",
    "sources": [
      {
        "label": "UK DESNZ: greenhouse gas conversion factors 2026",
        "url": "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026"
      },
      {
        "label": "UK DESNZ 2026: full factors workbook",
        "url": "https://assets.publishing.service.gov.uk/media/6a29392bade52dc0882218a8/ghg-conversion-factors-2026-full-set.xlsx"
      },
      {
        "label": "UK DESNZ 2026: methodology and OGL notice",
        "url": "https://assets.publishing.service.gov.uk/media/6a2940543b15d05a7ce3202e/2026-GHG-conversion-factors-methodology-report.pdf"
      },
      {
        "label": "Open Government Licence v3.0",
        "url": "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
      }
    ],
    "options": [
      {
        "id": "foot",
        "label": "Foot passenger on a mixed ferry",
        "values": {
          "carbon": 0.01871
        },
        "note": "Foot-passenger allocation. Do not apply the whole vehicle’s occupancy as another division.",
        "sources": [
          {
            "label": "DESNZ 2026 Business travel–sea, D18",
            "url": "https://assets.publishing.service.gov.uk/media/6a29392bade52dc0882218a8/ghg-conversion-factors-2026-full-set.xlsx"
          }
        ]
      },
      {
        "id": "car-passenger",
        "label": "Car passenger on a mixed ferry",
        "values": {
          "carbon": 0.12933
        },
        "note": "Includes the source’s car-weight allocation per passenger; not a whole-car factor. Do not apply the whole vehicle’s occupancy as another division.",
        "sources": [
          {
            "label": "DESNZ 2026 Business travel–sea, D19",
            "url": "https://assets.publishing.service.gov.uk/media/6a29392bade52dc0882218a8/ghg-conversion-factors-2026-full-set.xlsx"
          }
        ]
      }
    ]
  }
];
