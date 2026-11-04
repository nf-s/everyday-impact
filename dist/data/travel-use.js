export const travelUseGroups = [
  {
    "id": "australian-flight-routes",
    "label": "Australian flight route estimates",
    "category": "Travel",
    "unit": "one-way flight per passenger",
    "singular": "one-way flight",
    "plural": "one-way flights",
    "defaultAmount": 1,
    "sourceNote": "Illustrative economy estimates using the Australian Department of Finance 2025–26 reporting default for 400–3,700 km flights: 0.09684 kg CO₂e per passenger-km including fuel supply. This adopted reporting factor is derived from UK DESNZ 2025 factors; it is not measured route performance. Excludes non-CO₂ warming and aircraft manufacture. Airport-to-airport great-circle distances were calculated from OurAirports public-domain coordinates downloaded 4 November 2026, using a spherical Earth radius of 6,371.0088 km. They are not flown tracks. Derived factors retain calculation precision; use two flights for a return. Adapted from © Commonwealth of Australia, Department of Finance, Emissions Reporting Framework 2025–26 (2026), CC BY 4.0, and UK DESNZ 2025, Crown copyright, OGL v3.0. Third-party material, logos and coats of arms are excluded from the respective licences.",
    "sources": [
      {
        "label": "Australian Department of Finance: 2025–26 Emissions Reporting Framework, Table 22",
        "url": "https://www.finance.gov.au/sites/default/files/2026-05/emissions-reporting-framework-2025-26.pdf"
      },
      {
        "label": "Department of Finance: copyright and CC BY 4.0 terms",
        "url": "https://www.finance.gov.au/about-us/copyright-notice"
      },
      {
        "label": "UK DESNZ: greenhouse gas reporting conversion factors 2025",
        "url": "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025"
      },
      {
        "label": "Open Government Licence v3.0",
        "url": "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
      },
      {
        "label": "OurAirports public-domain airport coordinates and terms",
        "url": "https://ourairports.com/data/"
      },
      {
        "label": "OurAirports airport-coordinate data",
        "url": "https://davidmegginson.github.io/ourairports-data/airports.csv"
      }
    ],
    "options": [
      {
        "id": "hobart-melbourne-economy",
        "label": "Hobart–Melbourne · economy · estimated",
        "values": {
          "carbon": 59.8088699
        },
        "note": "One passenger, one way: 617.605018 km × 0.09684 kg CO₂e per passenger-km = 59.8088699 kg CO₂e. Airport coordinates: YMHB (−42.837032, 147.513022) and YMML (-37.670732, 144.837898). Uses the reporting factor’s average occupancy allocation, not a specific aircraft."
      },
      {
        "id": "hobart-sydney-economy",
        "label": "Hobart–Sydney · economy · estimated",
        "values": {
          "carbon": 100.58086857
        },
        "note": "One passenger, one way: 1038.629374 km × 0.09684 kg CO₂e per passenger-km = 100.58086857 kg CO₂e. Airport coordinates: YMHB (−42.837032, 147.513022) and YSSY (-33.946098, 151.177002). Uses the reporting factor’s average occupancy allocation, not a specific aircraft."
      }
    ]
  },
  {
    "id": "surface-travel",
    "label": "Surface travel",
    "category": "Travel",
    "unit": "km per person",
    "singular": "km",
    "plural": "km",
    "defaultAmount": 10,
    "sourceNote": "UK government 2025 operational factors per passenger-km. Cars assume the stated occupants; public transport uses average passenger occupancy. Excludes vehicle manufacture and fuel production. Electric cars include UK electricity generation and grid losses. These are UK averages, not Australian transport factors. Adapted from UK Department for Energy Security and Net Zero (2025), Crown copyright, under the Open Government Licence v3.0. The shared-car factor divides the published vehicle-km factor by two. The licence does not cover third-party rights, logos or endorsement; only published DESNZ factors are used, not the underlying third-party datasets.",
    "sources": [
      {
        "label": "UK government conversion factors 2025",
        "url": "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025"
      },
      {
        "label": "2025 factors workbook: Business travel–land",
        "url": "https://assets.publishing.service.gov.uk/media/6846a4f55e92539572806125/ghg-conversion-factors-2025-full-set.xlsx"
      },
      {
        "label": "Open Government Licence v3.0",
        "url": "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
      }
    ],
    "options": [
      {
        "id": "petrol-car-solo",
        "label": "Petrol car · 1 person",
        "values": {
          "carbon": 0.16272
        },
        "note": "Average UK petrol car; one occupant. Vehicle-km factor equals passenger-km at this occupancy."
      },
      {
        "id": "petrol-car-shared",
        "label": "Petrol car · 2 people",
        "values": {
          "carbon": 0.08136
        },
        "note": "Same car and distance, shared equally between two occupants: 0.16272 ÷ 2 kg CO₂e per person-km."
      },
      {
        "id": "diesel-car-solo",
        "label": "Diesel car · 1 person",
        "values": {
          "carbon": 0.17304
        },
        "note": "Average UK diesel car; one occupant."
      },
      {
        "id": "hybrid-car-solo",
        "label": "Hybrid car · 1 person",
        "values": {
          "carbon": 0.12825
        },
        "note": "Average UK non-plug-in hybrid; one occupant."
      },
      {
        "id": "electric-car-solo",
        "label": "Electric car · 1 person · UK grid",
        "values": {
          "carbon": 0.04047
        },
        "note": "Average UK battery electric car; one occupant. Includes electricity generation and transmission/distribution, not battery manufacture."
      },
      {
        "id": "bus",
        "label": "Local bus · UK average",
        "values": {
          "carbon": 0.10385
        },
        "note": "Per passenger-km at average UK local-bus occupancy; not emissions for a whole bus."
      },
      {
        "id": "coach",
        "label": "Coach · UK average",
        "values": {
          "carbon": 0.02776
        },
        "note": "Per passenger-km at average coach occupancy."
      },
      {
        "id": "national-rail",
        "label": "National rail · UK average",
        "values": {
          "carbon": 0.03546
        },
        "note": "Per passenger-km across UK national rail at average occupancy."
      },
      {
        "id": "international-rail",
        "label": "International rail · Eurostar routes",
        "values": {
          "carbon": 0.00446
        },
        "note": "Passenger-weighted Eurostar route average; not a global rail factor."
      },
      {
        "id": "tram",
        "label": "Tram and light rail · UK average",
        "values": {
          "carbon": 0.0286
        },
        "note": "Per passenger-km at average occupancy."
      }
    ]
  },
  {
    "id": "flights",
    "label": "Flights by distance",
    "category": "Travel",
    "unit": "km per passenger",
    "singular": "km",
    "plural": "km",
    "defaultAmount": 1000,
    "sourceNote": "UK government 2025 factors per passenger-km, with average load factors and cabin allocation. Enter great-circle distance; the factors already include an 8% route uplift and a 1.7 multiplier on CO₂ for non-CO₂ warming. Fuel production and aircraft manufacture are excluded. Short/long-haul factors apply to UK-linked flights; other routes have a separate international average. Adapted from UK Department for Energy Security and Net Zero (2025), Crown copyright, under the Open Government Licence v3.0. The licence does not cover third-party rights, logos or endorsement; only published DESNZ factors are used, not the underlying third-party datasets.",
    "sources": [
      {
        "label": "UK government conversion factors 2025",
        "url": "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025"
      },
      {
        "label": "2025 factors workbook: Business travel–air",
        "url": "https://assets.publishing.service.gov.uk/media/6846a4f55e92539572806125/ghg-conversion-factors-2025-full-set.xlsx"
      },
      {
        "label": "Open Government Licence v3.0",
        "url": "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
      }
    ],
    "options": [
      {
        "id": "domestic-flight",
        "label": "Domestic flight · UK",
        "values": {
          "carbon": 0.22928
        },
        "note": "Average passenger, all cabin classes, UK domestic routes."
      },
      {
        "id": "short-haul-economy",
        "label": "Short-haul · economy · UK-linked",
        "values": {
          "carbon": 0.12576
        },
        "note": "Short-haul is broadly European destinations from/to the UK; government haul classifications apply."
      },
      {
        "id": "short-haul-business",
        "label": "Short-haul · business · UK-linked",
        "values": {
          "carbon": 0.18863
        },
        "note": "Larger cabin space increases the emissions allocated to each passenger."
      },
      {
        "id": "long-haul-economy",
        "label": "Long-haul · economy · UK-linked",
        "values": {
          "carbon": 0.11704
        },
        "note": "Long-haul is broadly destinations outside Europe from/to the UK."
      },
      {
        "id": "long-haul-premium",
        "label": "Long-haul · premium economy · UK-linked",
        "values": {
          "carbon": 0.18726
        }
      },
      {
        "id": "long-haul-business",
        "label": "Long-haul · business · UK-linked",
        "values": {
          "carbon": 0.3394
        }
      },
      {
        "id": "international-economy",
        "label": "Non-UK international · economy",
        "values": {
          "carbon": 0.10916
        },
        "note": "Government average for flights between non-UK destinations; not a route-specific measurement."
      }
    ]
  },
  {
    "id": "return-flight",
    "label": "Paris–New York return flight",
    "category": "Travel",
    "unit": "return flight per passenger",
    "singular": "return flight",
    "plural": "return flights",
    "defaultAmount": 1,
    "sourceNote": "Independent example: one economy passenger flying Paris Charles de Gaulle (CDG) to New York John F. Kennedy (JFK) and back. Great-circle distance is 11668.291573 km, calculated from OurAirports public-domain coordinates downloaded 4 November 2026 using a spherical Earth radius of 6,371.0088 km. Uses the UK DESNZ 2025 non-UK international economy factor, 0.10916 kg CO₂e per passenger-km, because neither endpoint is in the UK. The factor already includes an 8% route uplift and a 1.7 multiplier on CO₂ for non-CO₂ warming; neither is applied again. Fuel production, aircraft and airport manufacture are excluded. This is a reporting-factor estimate, not a flight-specific measurement or marginal airline-emissions saving. Adapted from UK DESNZ (2025), Crown copyright, OGL v3.0; coordinates released by OurAirports to the public domain.",
    "sources": [
      {
        "label": "UK DESNZ: greenhouse gas reporting conversion factors 2025",
        "url": "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025"
      },
      {
        "label": "UK DESNZ 2025 full factors workbook",
        "url": "https://assets.publishing.service.gov.uk/media/6846a4f55e92539572806125/ghg-conversion-factors-2025-full-set.xlsx"
      },
      {
        "label": "Open Government Licence v3.0",
        "url": "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
      },
      {
        "label": "OurAirports public-domain airport coordinates and terms",
        "url": "https://ourairports.com/data/"
      },
      {
        "label": "OurAirports airport-coordinate data",
        "url": "https://davidmegginson.github.io/ourairports-data/airports.csv"
      }
    ],
    "options": [
      {
        "id": "paris-new-york-return",
        "label": "Paris CDG–New York JFK · return · estimated",
        "values": {
          "carbon": 1273.71070808
        },
        "note": "One passenger, both directions: 11668.291573 km × 0.10916 kg CO₂e per passenger-km = 1273.71070808 kg CO₂e. LFPG coordinates: 49.00896, 2.554117. KJFK coordinates: 40.639447, −73.779317. Skipping removes this modelled trip from the passenger footprint; immediate airline operational effects are unknown."
      }
    ]
  },
  {
    "id": "ai-request",
    "label": "AI text request",
    "category": "Digital",
    "unit": "text request",
    "singular": "request",
    "plural": "requests",
    "defaultAmount": 1,
    "sourceNote": "Google’s May 2025 median Gemini Apps text prompt: 0.24 Wh, 0.03 g CO₂e and 0.26 mL cooling water. Energy includes accelerator, host, idle capacity and data-centre overhead. Carbon uses market-based electricity accounting plus relevant infrastructure emissions. Water is estimated from energy and annual cooling WUE, excluding electricity-generation water. This is a dated provider-specific median, not a universal AI query footprint; totals are illustrative scaling of that median. Adapted from Cooper Elsworth and coauthors, Measuring the environmental impact of delivering AI at Google Scale (2025), arXiv:2508.15734v1, CC BY 4.0. Original figures are converted from Wh to kWh, grams to kg and mL to litres, then multiplied by the chosen request count. No Google text, figures, logos or blog images are reproduced.",
    "sources": [
      {
        "label": "Elsworth et al. (2025): paper and CC BY 4.0 licence",
        "url": "https://arxiv.org/abs/2508.15734v1"
      },
      {
        "label": "Technical paper: measurement boundaries and results",
        "url": "https://arxiv.org/html/2508.15734v1"
      },
      {
        "label": "Creative Commons Attribution 4.0 International",
        "url": "https://creativecommons.org/licenses/by/4.0/"
      }
    ],
    "options": [
      {
        "id": "gemini-text-2025",
        "energyScope": "Serving infrastructure and facility overhead",
        "label": "Gemini Apps · median text prompt · May 2025",
        "categoryPath": ["Digital", "AI", "Chat responses"],
        "evidenceLabel": "Provider study",
        "reasoning": "Google reports median values of 0.24 Wh, 0.03 g CO₂e and 0.26 mL of cooling water for a Gemini Apps text prompt in May 2025. Dividing each by 1,000 gives kWh, kg CO₂e and litres per prompt.",
        "values": {
          "carbon": 0.00003,
          "energy": 0.00024,
          "coolingWater": 0.00026
        },
        "note": "Inference only; excludes model training. Cooling water is onsite freshwater consumption, not household tap water or the full water footprint."
      }
    ]
  },
  {
    "id": "shower",
    "label": "Shower",
    "category": "Household water",
    "unit": "minute",
    "singular": "minute",
    "plural": "minutes",
    "defaultAmount": 4,
    "sourceNote": "Illustrative flows using the published upper bounds of the federal WELS shower bands: 5 stars, 6 L/min; 4 stars, 7.5 L/min; 3 stars, 9 L/min. These are chosen band endpoints, not measured fixture performance or population averages. Household water delivered only; excludes heating, treatment, supply emissions and water scarcity. Measure a specific shower for a personal estimate. Adapted from © Commonwealth of Australia, energy.gov.au, Water efficiency (accessed 4 November 2026), CC BY 4.0. Website terms exclude the Coat of Arms and third-party content. Only the Commonwealth’s numerical examples are used; no logos, images or third-party material are reproduced.",
    "sources": [
      {
        "label": "Commonwealth of Australia, energy.gov.au: Water efficiency",
        "url": "https://www.energy.gov.au/households/water-efficiency"
      },
      {
        "label": "energy.gov.au copyright: CC BY 4.0 and exceptions",
        "url": "https://www.energy.gov.au/copyright"
      }
    ],
    "options": [
      {
        "id": "efficient-6l",
        "label": "5-star shower example · 6 L/min",
        "values": {
          "tapWater": 6
        },
        "note": "Upper endpoint of the published >4.5–6 L/min band."
      },
      {
        "id": "standard-7-5l",
        "label": "4-star shower example · 7.5 L/min",
        "values": {
          "tapWater": 7.5
        },
        "note": "Upper endpoint of the published >6–7.5 L/min band."
      },
      {
        "id": "higher-9l",
        "label": "3-star shower example · 9 L/min",
        "values": {
          "tapWater": 9
        },
        "note": "Upper endpoint of the published >7.5–9 L/min band."
      }
    ]
  },
  {
    "id": "toilet-flush",
    "label": "Toilet",
    "category": "Household water",
    "unit": "flush",
    "singular": "flush",
    "plural": "flushes",
    "defaultAmount": 1,
    "sourceNote": "Federal WELS examples: a 4.5/3 L dual-flush toilet and an older single-flush example set to 9 L. The source says older toilets can use 9 L or more, so this chosen value is not a universal single-flush factor. Half and full flushes serve different needs. Household water delivered only; excludes supply, treatment and wastewater impacts. Adapted from © Commonwealth of Australia, energy.gov.au, Water efficiency (accessed 4 November 2026), CC BY 4.0. Website terms exclude the Coat of Arms and third-party content. Only the Commonwealth’s numerical examples are used; no logos, images or third-party material are reproduced.",
    "sources": [
      {
        "label": "Commonwealth of Australia, energy.gov.au: Water efficiency",
        "url": "https://www.energy.gov.au/households/water-efficiency"
      },
      {
        "label": "energy.gov.au copyright: CC BY 4.0 and exceptions",
        "url": "https://www.energy.gov.au/copyright"
      }
    ],
    "options": [
      {
        "id": "dual-flush-mix",
        "label": "Dual-flush toilet",
        "generic": true,
        "genericHint": "Four half flushes per full flush.",
        "values": { "tapWater": (4 * 3 + 4.5) / 5 },
        "defaultUsage": { "amount": 1, "period": "daily", "times": 5, "description": "Assumes five flushes per day." },
        "note": "The Australian WELS rating assumes four half flushes and one full flush. For the 4.5/3 L toilet, (4 × 3 L + 4.5 L) ÷ 5 = 3.3 L per flush."
      },
      {
        "id": "modern-half",
        "label": "Dual-flush example · half flush · 3 L",
        "values": {
          "tapWater": 3
        }
      },
      {
        "id": "modern-full",
        "label": "Dual-flush example · full flush · 4.5 L",
        "values": {
          "tapWater": 4.5
        }
      },
      {
        "id": "single-flush",
        "label": "Older single-flush example · 9 L",
        "values": {
          "tapWater": 9
        },
        "note": "Illustrative lower-end value; source reports 9 L or more."
      }
    ]
  },
  {
    "id": "laundry-load",
    "label": "Clothes washing",
    "category": "Household water",
    "unit": "load",
    "singular": "load",
    "plural": "loads",
    "defaultAmount": 1,
    "sourceNote": "Illustrative equal-capacity 6 kg washing-machine cases. Published WELS bands are 52–61 L per wash for 4 stars and 74–88 L for 3 stars; this comparison chooses their upper endpoints, 61 and 88 L. These are examples within rating bands, not measured machines or front-loader/top-loader averages. Household water delivered only; excludes electricity, detergent and wastewater impacts. Adapted from © Commonwealth of Australia, energy.gov.au, Water efficiency (accessed 4 November 2026), CC BY 4.0. Website terms exclude the Coat of Arms and third-party content. Only the Commonwealth’s numerical examples are used; no logos, images or third-party material are reproduced.",
    "sources": [
      {
        "label": "Commonwealth of Australia, energy.gov.au: Water efficiency",
        "url": "https://www.energy.gov.au/households/water-efficiency"
      },
      {
        "label": "energy.gov.au copyright: CC BY 4.0 and exceptions",
        "url": "https://www.energy.gov.au/copyright"
      }
    ],
    "options": [
      {
        "id": "washer-6kg-4star",
        "label": "6 kg washer · 4-star example · 61 L/load",
        "values": {
          "tapWater": 61
        },
        "note": "Chosen upper endpoint of the published 52–61 L per wash band."
      },
      {
        "id": "washer-6kg-3star",
        "label": "6 kg washer · 3-star example · 88 L/load",
        "values": {
          "tapWater": 88
        },
        "note": "Chosen upper endpoint of the published 74–88 L per wash band."
      }
    ]
  }
];
