import { agribalyseFoodGroups } from "./agribalyse-runtime.js";
export { agribalyseFoodMetadata } from "./agribalyse-foods.js";

export const foodGroups = [
  {
    id: 'us-beef',
    label: 'Beef consumption (US study)',
    category: 'food',
    unit: 'per kg of boneless beef eaten',
    singular: 'kg', plural: 'kg', defaultAmount: 1,
    sourceNote: 'Asem-Hiablie and colleagues modelled a US beef supply chain using farm, packing, retail, restaurant and household data from the early 2010s. Table 3 reports climate impact and absolute consumptive water per kilogram eaten. The water estimate includes irrigation and other freshwater lost from the source watershed. The study also reports a separate scarcity-weighted result.',
    sources: [
      { label: 'Asem-Hiablie et al. (2019), US beef life-cycle study, Table 3', url: 'https://doi.org/10.1007/s11367-018-1464-6' },
      { label: 'Creative Commons Attribution 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' }
    ],
    options: [{
      id: 'consumed-beef', label: 'Beef, boneless (US study)',
      values: { carbon: 48.4, consumedWater: 5126 },
      note: 'Modelled average across cuts. Water uses the absolute consumption row in Table 3, measured in litres per kg eaten.'
    }]
  },
  ...agribalyseFoodGroups,
  {
    "id": "french-meals",
    "label": "Modelled complete meals (France)",
    "category": "food",
    "unit": "per modelled meal",
    "singular": "meal",
    "plural": "meals",
    "defaultAmount": 1,
    "sourceNote": "Source ADEME, données AGRIBALYSE® v3.2 (2025), under Etalab Open Licence 2.0. Adapted from the published Impact CO₂ meal indicators. Source version dated 15 January 2025, accessed 4 November 2026. Lifecycle food estimates include preparation. Standard sides and dessert: 300 g vegetables, 7 g olive oil, 200 g average dessert and 50 g bread. Vegan meal uses fruit instead of the average dessert. These specific recipes have different portions and are not nutritionally matched or universal meal averages. Water and land values are unavailable here.",
    "sources": [
      {
        "label": "ADEME Impact CO₂: meal comparison and source version",
        "url": "https://impactco2.fr/outils/alimentation"
      },
      {
        "label": "ADEME meal factors at the source revision",
        "url": "https://github.com/incubateur-ademe/impactco2/blob/3106130d308c2cf5605d409779b7b22b32221258/src/data/categories/repas.ts"
      },
      {
        "label": "AGRIBALYSE data reuse conditions",
        "url": "https://doc.agribalyse.fr/documentation-en/agribalyse-data/terms-of-use-and-environmental-communication"
      },
      {
        "label": "Agribalyse: food lifecycle scope",
        "url": "https://doc.agribalyse.fr/documentation/le-programme-agribalyse/introduction"
      }
    ],
    "options": [
      {
        "id": "vegan",
        "label": "Vegan meal",
        "values": {
          "carbon": 0.54
        },
        "note": "100 g plant protein; 300 g vegetables; 7 g olive oil; 200 g fruit; 50 g bread.",
        "sources": [
          {
            "label": "ADEME: recipe and estimate",
            "url": "https://impactco2.fr/outils/alimentation/repasvegetalien"
          }
        ]
      },
      {
        "id": "vegetarian",
        "label": "Vegetarian meal",
        "values": {
          "carbon": 0.85
        },
        "note": "120 g non-meat animal protein, plus the standard sides and dessert.",
        "sources": [
          {
            "label": "ADEME: recipe and estimate",
            "url": "https://impactco2.fr/outils/alimentation/repasvegetarien"
          }
        ]
      },
      {
        "id": "chicken",
        "label": "Chicken meal",
        "values": {
          "carbon": 1.46
        },
        "note": "150 g chicken, plus the standard sides and dessert.",
        "sources": [
          {
            "label": "ADEME: recipe and estimate",
            "url": "https://impactco2.fr/outils/alimentation/repasavecdupoulet"
          }
        ]
      },
      {
        "id": "salmon",
        "label": "Salmon meal",
        "values": {
          "carbon": 1.46
        },
        "note": "150 g salmon, plus the standard sides and dessert.",
        "sources": [
          {
            "label": "ADEME: recipe and estimate",
            "url": "https://impactco2.fr/outils/alimentation/repasavecdupoissongras"
          }
        ]
      },
      {
        "id": "tuna",
        "label": "Tuna meal",
        "values": {
          "carbon": 1.6
        },
        "note": "150 g tuna in oil, plus the standard sides and dessert.",
        "sources": [
          {
            "label": "ADEME: recipe and estimate",
            "url": "https://impactco2.fr/outils/alimentation/repasavecduthon"
          }
        ]
      },
      {
        "id": "pork",
        "label": "Pork meal",
        "values": {
          "carbon": 1.65
        },
        "note": "150 g pork chop, plus the standard sides and dessert.",
        "sources": [
          {
            "label": "ADEME: recipe and estimate",
            "url": "https://impactco2.fr/outils/alimentation/repasavecduporc"
          }
        ]
      },
      {
        "id": "saithe",
        "label": "Saithe meal",
        "values": {
          "carbon": 1.87
        },
        "note": "150 g saithe, plus the standard sides and dessert.",
        "sources": [
          {
            "label": "ADEME: recipe and estimate",
            "url": "https://impactco2.fr/outils/alimentation/repasavecdulieunoir"
          }
        ]
      },
      {
        "id": "cod",
        "label": "Cod meal",
        "values": {
          "carbon": 2.43
        },
        "note": "150 g cod, plus the standard sides and dessert.",
        "sources": [
          {
            "label": "ADEME: recipe and estimate",
            "url": "https://impactco2.fr/outils/alimentation/repasavecdupoissonblanc"
          }
        ]
      },
      {
        "id": "veal",
        "label": "Veal meal",
        "values": {
          "carbon": 4.12
        },
        "note": "150 g veal chop, plus the standard sides and dessert.",
        "sources": [
          {
            "label": "ADEME: recipe and estimate",
            "url": "https://impactco2.fr/outils/alimentation/repasavecduveau"
          }
        ]
      },
      {
        "id": "beef",
        "label": "Beef meal",
        "values": {
          "carbon": 4.97
        },
        "note": "150 g flank steak, plus the standard sides and dessert.",
        "sources": [
          {
            "label": "ADEME: recipe and estimate",
            "url": "https://impactco2.fr/outils/alimentation/repasavecduboeuf"
          }
        ]
      }
    ]
  },
  {
    "id": "uk-diets",
    "label": "Whole diets (UK study)",
    "category": "food",
    "unit": "per person-day at 2,000 kcal",
    "singular": "person-day",
    "plural": "person-days",
    "defaultAmount": 1,
    "sourceNote": "Scarborough et al. (2023), Table 3: median AR6 GWP100 estimates, standardised to 2,000 kcal and age and gender. Based on 55,504 EPIC-Oxford adults surveyed in 1993–1999, linked to UK supermarket foods available in 2019 and global production data. Boundary ends at retail. Not a representative UK sample or an Australian estimate. Multiply by days for a scenario total; do not combine whole-diet totals with their constituent meals or ingredients. These are comparisons of observed diet groups, not personalised forecasts. Table 4 adds agricultural water use (published m³/person-day converted to litres) and eutrophication potential (g phosphate-equivalent/person-day), both median estimates. The water measure is separate from freshwater withdrawals because the paper does not establish identical accounting. Land is omitted because the reported daily area units do not explicitly resolve the occupation-time interpretation.",
    "sources": [
      {
        "label": "Scarborough et al. (2023), Nature Food: Tables 3–4 and methods",
        "url": "https://www.nature.com/articles/s43016-023-00795-w"
      },
      {
        "label": "Study PDF: Tables 3–4, daily values and uncertainty intervals",
        "url": "https://www.nature.com/articles/s43016-023-00795-w.pdf"
      }
    ],
    "options": [
      {
        "id": "high-meat",
        "label": "High meat",
        "values": {
          "carbon": 10.24,
          "dietWater": 890.0,
          "eutrophication": 40.8
        },
        "note": "At least 100 g meat/day. 95% uncertainty interval: 7.04–15.95 kg CO₂e/day."
      },
      {
        "id": "medium-meat",
        "label": "Medium meat",
        "values": {
          "carbon": 7.04,
          "dietWater": 780.0,
          "eutrophication": 29.61
        },
        "note": "50 to under 100 g meat/day. 95% uncertainty interval: 5.26–9.39 kg CO₂e/day."
      },
      {
        "id": "low-meat",
        "label": "Low meat",
        "values": {
          "carbon": 5.37,
          "dietWater": 710.0,
          "eutrophication": 23.55
        },
        "note": "More than zero and under 50 g meat/day. 95% uncertainty interval: 4.26–6.99 kg CO₂e/day."
      },
      {
        "id": "fish",
        "label": "Fish, no meat",
        "values": {
          "carbon": 4.74,
          "dietWater": 710.0,
          "eutrophication": 21.09
        },
        "note": "Self-identified fish-eaters who eat no meat. 95% uncertainty interval: 3.85–6.27 kg CO₂e/day."
      },
      {
        "id": "vegetarian",
        "label": "Vegetarian",
        "values": {
          "carbon": 4.16,
          "dietWater": 530.0,
          "eutrophication": 17.27
        },
        "note": "No meat or fish. 95% uncertainty interval: 3.31–5.82 kg CO₂e/day."
      },
      {
        "id": "vegan",
        "label": "Vegan",
        "values": {
          "carbon": 2.47,
          "dietWater": 410.0,
          "eutrophication": 10.7
        },
        "note": "No meat, fish, dairy or eggs. 95% uncertainty interval: 2.09–3.36 kg CO₂e/day."
      }
    ]
  }
];
