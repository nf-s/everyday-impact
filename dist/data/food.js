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
  {
    "id": "food-products",
    "label": "Food products (French-market estimates)",
    "category": "food",
    "unit": "per kg of product",
    "singular": "kg",
    "plural": "kg",
    "defaultAmount": 1,
    "sourceNote": "Source ADEME, données AGRIBALYSE® v3.2 (2025); Synthèse data updated 27 February 2025, metadata updated 30 June 2026, accessed 4 November 2026. Licensed under Etalab Open Licence 2.0. Aggregate product impact indicators only; no process inventories reproduced. French-market life-cycle models through the consumer stage; preparation follows each row, including no preparation for raw products. These are not Australian or global producer averages. Factors are per kg of the specified product form. Carbon is EF 3.1 climate change (kg CO₂e); Land use is scored in EF points. Freshwater nutrient pollution is converted from kg to g of P equivalent. The water scarcity indicator uses deprivation-weighted m³ equivalents. DQR is source data quality: 1 excellent, 5 very poor. Equal mass is not equal nutrition. No endorsement by ADEME.",
    "sources": [
      {
        "label": "ADEME AGRIBALYSE v3.2: aggregate product indicators",
        "url": "https://data.ademe.fr/datasets/agribalyse-31-synthese"
      },
      {
        "label": "ADEME aggregate data API and units",
        "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese"
      },
      {
        "label": "AGRIBALYSE licence and application reuse conditions",
        "url": "https://doc.agribalyse.fr/documentation-en/agribalyse-data/terms-of-use-and-environmental-communication"
      },
      {
        "label": "Etalab Open Licence 2.0",
        "url": "https://www.etalab.gouv.fr/wp-content/uploads/2017/04/ETALAB-Licence-Ouverte-v2.0.pdf"
      }
    ],
    "options": [
      {
        "id": "beef-steak",
        "label": "Beef steak, grilled",
        "values": {
          "carbon": 36.6,
          "agribalyseLand": 2390,
          "freshwaterEutrophication": 1.54,
          "waterScarcity": 3.05
        },
        "note": "AGRIBALYSE code 6200; CIQUAL 6200. Source row: Boeuf, steak ou bifteck, grillé. Modelled consumer preparation: oven. DQR 2.86/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 6200: Beef, steak or beef steak, grilled",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%226200%22&size=1"
          }
        ]
      },
      {
        "id": "beef-mince",
        "label": "Beef mince, 15% fat, cooked",
        "values": {
          "carbon": 45.2,
          "agribalyseLand": 2940,
          "freshwaterEutrophication": 1.96,
          "waterScarcity": 3.77
        },
        "note": "AGRIBALYSE code 6255; CIQUAL 6255. Source row: Bœuf, steak haché 15% MG, cuit. Modelled consumer preparation: frying pan. DQR 2.9/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 6255: Beef, minced steak, 15% fat, cooked",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%226255%22&size=1"
          }
        ]
      },
      {
        "id": "lamb-mutton",
        "label": "Lamb leg, roasted",
        "values": {
          "carbon": 52.3,
          "agribalyseLand": 5580,
          "freshwaterEutrophication": 2.59,
          "waterScarcity": 8.79
        },
        "note": "AGRIBALYSE code 21503; CIQUAL 21503. Source row: Agneau, gigot, rôti/cuit au four. Modelled consumer preparation: oven. DQR 2.97/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 21503: Lamb, leg, roasted/baked",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2221503%22&size=1"
          }
        ]
      },
      {
        "id": "pork",
        "label": "Pork chop, grilled",
        "values": {
          "carbon": 8.65,
          "agribalyseLand": 442,
          "freshwaterEutrophication": 1.18,
          "waterScarcity": 2.81
        },
        "note": "AGRIBALYSE code 28101; CIQUAL 28101. Source row: Porc, côte, grillée. Modelled consumer preparation: oven. DQR 2.86/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 28101: Pork, chop, grilled",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2228101%22&size=1"
          }
        ]
      },
      {
        "id": "poultry-meat",
        "label": "Chicken breast, skinless, cooked",
        "values": {
          "carbon": 7.48,
          "agribalyseLand": 444,
          "freshwaterEutrophication": 1.39,
          "waterScarcity": 3.34
        },
        "note": "AGRIBALYSE code 36018; CIQUAL 36018. Source row: Poulet, filet, sans peau, cuit. Modelled consumer preparation: oven. DQR 2.31/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 36018: Chicken, breast, without skin, cooked",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2236018%22&size=1"
          }
        ]
      },
      {
        "id": "farmed-fish",
        "label": "Farmed salmon, baked",
        "values": {
          "carbon": 6.87,
          "agribalyseLand": 279,
          "freshwaterEutrophication": 1.6,
          "waterScarcity": 1.5
        },
        "note": "AGRIBALYSE code 26230; CIQUAL 26230. Source row: Saumon, élevage, rôti/cuit au four. Modelled consumer preparation: oven. DQR 2.59/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 26230: Salmon, farmed, roasted/baked",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2226230%22&size=1"
          }
        ]
      },
      {
        "id": "prawns",
        "label": "Prawns, cooked",
        "values": {
          "carbon": 25.7,
          "agribalyseLand": 316,
          "freshwaterEutrophication": 10.6,
          "waterScarcity": 218
        },
        "note": "AGRIBALYSE code 10007; CIQUAL 10007. Source row: Crevette, cuite. Modelled consumer preparation: frying pan. DQR 3.11/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 10007: Shrimp or prawn, cooked",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2210007%22&size=1"
          }
        ]
      },
      {
        "id": "cheese",
        "label": "Emmental cheese",
        "values": {
          "carbon": 6.28,
          "agribalyseLand": 288,
          "freshwaterEutrophication": 0.584,
          "waterScarcity": 0.804
        },
        "note": "AGRIBALYSE code 12115; CIQUAL 12115. Source row: Emmental ou emmenthal. Modelled consumer preparation: no preparation. DQR 1.77/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 12115: Emmental cheese, from cow's milk",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2212115%22&size=1"
          }
        ]
      },
      {
        "id": "eggs",
        "label": "Eggs, hard-boiled",
        "values": {
          "carbon": 2.74,
          "agribalyseLand": 164,
          "freshwaterEutrophication": 0.62,
          "waterScarcity": 0.986
        },
        "note": "AGRIBALYSE code 22010; CIQUAL 22010. Source row: Oeuf, dur. Modelled consumer preparation: boiling in water. DQR 2.46/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 22010: Egg, hard-boiled",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2222010%22&size=1"
          }
        ]
      },
      {
        "id": "tofu",
        "label": "Tofu, plain",
        "values": {
          "carbon": 1,
          "agribalyseLand": -19.8,
          "freshwaterEutrophication": 0.176,
          "waterScarcity": 0.258
        },
        "note": "AGRIBALYSE code 20904; CIQUAL 20904. Source row: Tofu, nature. Modelled consumer preparation: microwave. DQR 2.04/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 20904: Tofu, plain",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2220904%22&size=1"
          }
        ]
      },
      {
        "id": "peas",
        "label": "Split peas, dried",
        "values": {
          "carbon": 0.75,
          "agribalyseLand": 155,
          "freshwaterEutrophication": 0.373,
          "waterScarcity": 0.247
        },
        "note": "AGRIBALYSE code 20515; CIQUAL 20515. Source row: Pois cassé, sec. Modelled consumer preparation: no preparation. DQR 3.5/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 20515: Split pea, dried",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2220515%22&size=1"
          }
        ]
      },
      {
        "id": "other-pulses",
        "label": "Lentils, dried",
        "values": {
          "carbon": 0.581,
          "agribalyseLand": 309,
          "freshwaterEutrophication": 0.469,
          "waterScarcity": 0.13
        },
        "note": "AGRIBALYSE code 20504; CIQUAL 20504. Source row: Lentille, sèche. Modelled consumer preparation: no preparation. DQR 2.55/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 20504: Lentil, dried",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2220504%22&size=1"
          }
        ]
      },
      {
        "id": "nuts",
        "label": "Walnuts, dried, shelled",
        "values": {
          "carbon": 4.11,
          "agribalyseLand": 653,
          "freshwaterEutrophication": 0.595,
          "waterScarcity": 9.09
        },
        "note": "AGRIBALYSE code 15005; CIQUAL 15005. Source row: Noix, séchée, cerneaux. Modelled consumer preparation: no preparation. DQR 2.84/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 15005: Walnut, dried, husked",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2215005%22&size=1"
          }
        ]
      },
      {
        "id": "groundnuts",
        "label": "Peanuts, roasted, unsalted",
        "values": {
          "carbon": 4.18,
          "agribalyseLand": 535,
          "freshwaterEutrophication": 1.23,
          "waterScarcity": 14.6
        },
        "note": "AGRIBALYSE code 15037; CIQUAL 15037. Source row: Cacahuète, grillée. Modelled consumer preparation: no preparation. DQR 3.46/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 15037: Peanut, grilled",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2215037%22&size=1"
          }
        ]
      },
      {
        "id": "wheat-rye-bread",
        "label": "Wholemeal bread",
        "values": {
          "carbon": 0.779,
          "agribalyseLand": 63.3,
          "freshwaterEutrophication": 0.148,
          "waterScarcity": 0.189
        },
        "note": "AGRIBALYSE code 7110; CIQUAL 7110. Source row: Pain complet ou intégral (à la farine T150). Modelled consumer preparation: no preparation. DQR 2.34/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 7110: Bread, wholemeal or integral bread (made with flour type 150)",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%227110%22&size=1"
          }
        ]
      },
      {
        "id": "maize-meal",
        "label": "Maize flour",
        "values": {
          "carbon": 0.865,
          "agribalyseLand": 66.5,
          "freshwaterEutrophication": 0.194,
          "waterScarcity": 0.748
        },
        "note": "AGRIBALYSE code 9545; CIQUAL 9545. Source row: Farine de maïs. Modelled consumer preparation: no preparation. DQR 3.12/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 9545: Maize/corn flour",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%229545%22&size=1"
          }
        ]
      },
      {
        "id": "oatmeal",
        "label": "Rolled oats, dry",
        "values": {
          "carbon": 1.22,
          "agribalyseLand": 214,
          "freshwaterEutrophication": 0.847,
          "waterScarcity": 0.634
        },
        "note": "AGRIBALYSE code 9311; CIQUAL 9311. Source row: Flocon d'avoine. Modelled consumer preparation: no preparation. DQR 4.27/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 9311: Oatmeal flakes",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%229311%22&size=1"
          }
        ]
      },
      {
        "id": "rice",
        "label": "Rice, uncooked",
        "values": {
          "carbon": 2.01,
          "agribalyseLand": 63,
          "freshwaterEutrophication": 0.247,
          "waterScarcity": 14.3
        },
        "note": "AGRIBALYSE code 9100; CIQUAL 9100. Source row: Riz blanc, cru. Modelled consumer preparation: no preparation. DQR 3.85/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 9100: Rice, raw",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%229100%22&size=1"
          }
        ]
      },
      {
        "id": "potatoes",
        "label": "Potatoes, boiled",
        "values": {
          "carbon": 1.25,
          "agribalyseLand": 35.7,
          "freshwaterEutrophication": 0.205,
          "waterScarcity": 0.484
        },
        "note": "AGRIBALYSE code 4003; CIQUAL 4003. Source row: Pomme de terre, bouillie/cuite à l'eau. Modelled consumer preparation: boiling in water. DQR 2.48/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 4003: Potato, boiled/cooked in water",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%224003%22&size=1"
          }
        ]
      },
      {
        "id": "cassava",
        "label": "Cassava, cooked",
        "values": {
          "carbon": 0.942,
          "agribalyseLand": 29.4,
          "freshwaterEutrophication": 0.13,
          "waterScarcity": 2.91
        },
        "note": "AGRIBALYSE code 54034; CIQUAL 54034. Source row: Manioc, racine cuite. Modelled consumer preparation: boiling in water. DQR 3.4/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 54034: Cassava or manioc, roots, cooked",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2254034%22&size=1"
          }
        ]
      },
      {
        "id": "tomatoes",
        "label": "Tomatoes, raw, French consumption mix",
        "values": {
          "carbon": 0.75,
          "agribalyseLand": 6.51,
          "freshwaterEutrophication": 0.111,
          "waterScarcity": 1.27
        },
        "note": "AGRIBALYSE code 20047_1; CIQUAL 20047. Source row: Tomate, crue. Modelled consumer preparation: no preparation. DQR 2.77/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 20047_1: Tomato, raw",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2220047_1%22&size=1"
          }
        ]
      },
      {
        "id": "onions-leeks",
        "label": "Onions, raw",
        "values": {
          "carbon": 0.421,
          "agribalyseLand": 17.6,
          "freshwaterEutrophication": 0.0652,
          "waterScarcity": 0.736
        },
        "note": "AGRIBALYSE code 20034; CIQUAL 20034. Source row: Oignon, cru. Modelled consumer preparation: no preparation. DQR 2.39/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 20034: Onion, raw",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2220034%22&size=1"
          }
        ]
      },
      {
        "id": "root-vegetables",
        "label": "Carrots, raw",
        "values": {
          "carbon": 0.396,
          "agribalyseLand": 9.54,
          "freshwaterEutrophication": 0.0573,
          "waterScarcity": 0.362
        },
        "note": "AGRIBALYSE code 20009; CIQUAL 20009. Source row: Carotte, crue. Modelled consumer preparation: no preparation. DQR 2.24/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 20009: Carrot, raw",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2220009%22&size=1"
          }
        ]
      },
      {
        "id": "brassicas",
        "label": "Broccoli, raw",
        "values": {
          "carbon": 0.951,
          "agribalyseLand": 10.5,
          "freshwaterEutrophication": 0.124,
          "waterScarcity": 1.01
        },
        "note": "AGRIBALYSE code 20057; CIQUAL 20057. Source row: Brocoli, cru. Modelled consumer preparation: no preparation. DQR 3.27/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 20057: Broccoli, raw",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2220057%22&size=1"
          }
        ]
      },
      {
        "id": "other-vegetables",
        "label": "Zucchini, raw",
        "values": {
          "carbon": 0.498,
          "agribalyseLand": 15.1,
          "freshwaterEutrophication": 0.0728,
          "waterScarcity": 0.551
        },
        "note": "AGRIBALYSE code 20020; CIQUAL 20020. Source row: Courgette, pulpe et peau, crue. Modelled consumer preparation: no preparation. DQR 2.95/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 20020: Courgette or zucchini, pulp and peel, raw",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2220020%22&size=1"
          }
        ]
      },
      {
        "id": "citrus-fruit",
        "label": "Orange, edible pulp",
        "values": {
          "carbon": 0.678,
          "agribalyseLand": 26,
          "freshwaterEutrophication": 0.102,
          "waterScarcity": 10.5
        },
        "note": "AGRIBALYSE code 13034; CIQUAL 13034. Source row: Orange, pulpe, crue. Modelled consumer preparation: no preparation. DQR 3.1/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 13034: Orange, pulp, raw",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2213034%22&size=1"
          }
        ]
      },
      {
        "id": "bananas",
        "label": "Banana, edible pulp",
        "values": {
          "carbon": 0.909,
          "agribalyseLand": 26.5,
          "freshwaterEutrophication": 0.125,
          "waterScarcity": 0.572
        },
        "note": "AGRIBALYSE code 13005; CIQUAL 13005. Source row: Banane, pulpe, crue. Modelled consumer preparation: no preparation. DQR 2.61/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 13005: Banana, pulp, raw",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2213005%22&size=1"
          }
        ]
      },
      {
        "id": "apples",
        "label": "Apple, with skin",
        "values": {
          "carbon": 0.408,
          "agribalyseLand": 16.4,
          "freshwaterEutrophication": 0.0461,
          "waterScarcity": 0.543
        },
        "note": "AGRIBALYSE code 13039; CIQUAL 13039. Source row: Pomme, pulpe et peau, crue. Modelled consumer preparation: no preparation. DQR 2.01/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 13039: Apple, pulp and peel, raw",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2213039%22&size=1"
          }
        ]
      },
      {
        "id": "berries-grapes",
        "label": "Strawberries, French consumption mix",
        "values": {
          "carbon": 0.533,
          "agribalyseLand": 77.4,
          "freshwaterEutrophication": 0.101,
          "waterScarcity": 6.66
        },
        "note": "AGRIBALYSE code 13014_1; CIQUAL 13014. Source row: Fraise, crue. Modelled consumer preparation: no preparation. DQR 2.41/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 13014_1: Strawberry, raw",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2213014_1%22&size=1"
          }
        ]
      },
      {
        "id": "other-fruit",
        "label": "Pear, with skin",
        "values": {
          "carbon": 0.387,
          "agribalyseLand": 16.9,
          "freshwaterEutrophication": 0.048,
          "waterScarcity": 1.42
        },
        "note": "AGRIBALYSE code 13037; CIQUAL 13037. Source row: Poire, pulpe et peau, crue. Modelled consumer preparation: no preparation. DQR 2.69/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 13037: Pear, pulp and peel, raw",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2213037%22&size=1"
          }
        ]
      },
      {
        "id": "brown-sugar",
        "label": "Brown sugar",
        "values": {
          "carbon": 1.04,
          "agribalyseLand": 90.7,
          "freshwaterEutrophication": 0.286,
          "waterScarcity": 6.6
        },
        "note": "AGRIBALYSE code 31017; CIQUAL 31017. Source row: Sucre roux. Modelled consumer preparation: no preparation. DQR 3.15/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 31017: Sugar, brown",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2231017%22&size=1"
          }
        ]
      },
      {
        "id": "white-sugar",
        "label": "White sugar",
        "values": {
          "carbon": 0.746,
          "agribalyseLand": 31.9,
          "freshwaterEutrophication": 0.176,
          "waterScarcity": 1.8
        },
        "note": "AGRIBALYSE code 31016; CIQUAL 31016. Source row: Sucre blanc. Modelled consumer preparation: no preparation. DQR 3.09/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 31016: Sugar, white",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2231016%22&size=1"
          }
        ]
      },
      {
        "id": "coffee",
        "label": "Ground coffee, dry",
        "values": {
          "carbon": 8.4,
          "agribalyseLand": 417,
          "freshwaterEutrophication": 1.74,
          "waterScarcity": 9.71
        },
        "note": "AGRIBALYSE code 18003; CIQUAL 18003. Source row: Café, moulu. Modelled consumer preparation: no preparation. DQR 3.67/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 18003: Coffee, ground",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2218003%22&size=1"
          }
        ]
      },
      {
        "id": "dark-chocolate",
        "label": "Dark chocolate, over 70% cocoa",
        "values": {
          "carbon": 19.1,
          "agribalyseLand": 725,
          "freshwaterEutrophication": 2.49,
          "waterScarcity": 0.876
        },
        "note": "AGRIBALYSE code 31074; CIQUAL 31074. Source row: Chocolat noir à 70% cacao minimum, extra, dégustation, tablette. Modelled consumer preparation: no preparation. DQR 1.89/5 (lower is better).",
        "sources": [
          {
            "label": "ADEME source row AGB 31074: Dark chocolate bar, more than 70% cocoa",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2231074%22&size=1"
          }
        ]
      }
    ]
  },
  {
    "id": "food-liquids",
    "label": "Drinks and oils, by mass (French-market estimates)",
    "category": "food",
    "unit": "per kg of product",
    "singular": "kg",
    "plural": "kg",
    "defaultAmount": 1,
    "sourceNote": "Source ADEME, données AGRIBALYSE® v3.2 (2025); Synthèse data updated 27 February 2025, metadata updated 30 June 2026, accessed 4 November 2026. Licensed under Etalab Open Licence 2.0. Aggregate product impact indicators only; no process inventories reproduced. French-market life-cycle models through the consumer stage; preparation follows each row, including no preparation for raw products. These are not Australian or global producer averages. Factors are per kg of the specified product form. Carbon is EF 3.1 climate change (kg CO₂e); Land use is scored in EF points. Freshwater nutrient pollution is converted from kg to g of P equivalent. The water scarcity indicator uses deprivation-weighted m³ equivalents. DQR is source data quality: 1 excellent, 5 very poor. Equal mass is not equal nutrition. No endorsement by ADEME. Drinks and oils use mass; a kg is not assumed to equal a litre.",
    "sources": [
      {
        "label": "ADEME AGRIBALYSE v3.2: aggregate product indicators",
        "url": "https://data.ademe.fr/datasets/agribalyse-31-synthese"
      },
      {
        "label": "ADEME aggregate data API and units",
        "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese"
      },
      {
        "label": "AGRIBALYSE licence and application reuse conditions",
        "url": "https://doc.agribalyse.fr/documentation-en/agribalyse-data/terms-of-use-and-environmental-communication"
      },
      {
        "label": "Etalab Open Licence 2.0",
        "url": "https://www.etalab.gouv.fr/wp-content/uploads/2017/04/ETALAB-Licence-Ouverte-v2.0.pdf"
      }
    ],
    "options": [
      {
        "id": "milk",
        "label": "Whole milk, pasteurised",
        "values": {
          "carbon": 1.46,
          "agribalyseLand": 63.8,
          "freshwaterEutrophication": 0.124,
          "waterScarcity": 0.174
        },
        "note": "AGRIBALYSE code 19024; CIQUAL 19024. Source row: Lait entier, pasteurisé. Modelled consumer preparation: no preparation. DQR 1.2/5 (lower is better). No mass-to-volume conversion is made; enter kg, not litres.",
        "sources": [
          {
            "label": "ADEME source row AGB 19024: Milk, whole, pasteurised",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2219024%22&size=1"
          }
        ]
      },
      {
        "id": "soy-milk",
        "label": "Soy drink, plain",
        "values": {
          "carbon": 0.427,
          "agribalyseLand": 21.6,
          "freshwaterEutrophication": 0.0796,
          "waterScarcity": 0.0786
        },
        "note": "AGRIBALYSE code 18900; CIQUAL 18900. Source row: Boisson au soja, nature. Modelled consumer preparation: no preparation. DQR 2.06/5 (lower is better). No mass-to-volume conversion is made; enter kg, not litres.",
        "sources": [
          {
            "label": "ADEME source row AGB 18900: Soy drink, plain, prepacked",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2218900%22&size=1"
          }
        ]
      },
      {
        "id": "beer",
        "label": "Beer, 4–5% alcohol",
        "values": {
          "carbon": 1.35,
          "agribalyseLand": 17,
          "freshwaterEutrophication": 0.139,
          "waterScarcity": 0.258
        },
        "note": "AGRIBALYSE code 5001; CIQUAL 5001. Source row: Bière \"coeur de marché\" (4-5° alcool). Modelled consumer preparation: refrigerated at home. DQR 2.24/5 (lower is better). No mass-to-volume conversion is made; enter kg, not litres.",
        "sources": [
          {
            "label": "ADEME source row AGB 5001: Beer, regular (4-5° alcohol)",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%225001%22&size=1"
          }
        ]
      },
      {
        "id": "wine",
        "label": "Red wine",
        "values": {
          "carbon": 1.27,
          "agribalyseLand": 99.4,
          "freshwaterEutrophication": 0.226,
          "waterScarcity": 0.231
        },
        "note": "AGRIBALYSE code 5214; CIQUAL 5214. Source row: Vin rouge. Modelled consumer preparation: refrigerated at home. DQR 2.16/5 (lower is better). No mass-to-volume conversion is made; enter kg, not litres.",
        "sources": [
          {
            "label": "ADEME source row AGB 5214: Wine, red",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%225214%22&size=1"
          }
        ]
      },
      {
        "id": "soybean-oil",
        "label": "Soy oil",
        "values": {
          "carbon": 3.73,
          "agribalyseLand": 321,
          "freshwaterEutrophication": 0.599,
          "waterScarcity": 0.718
        },
        "note": "AGRIBALYSE code 17420; CIQUAL 17420. Source row: Huile de soja. Modelled consumer preparation: no preparation. DQR 2.01/5 (lower is better). No mass-to-volume conversion is made; enter kg, not litres.",
        "sources": [
          {
            "label": "ADEME source row AGB 17420: Soy oil",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2217420%22&size=1"
          }
        ]
      },
      {
        "id": "palm-oil",
        "label": "Palm oil, refined",
        "values": {
          "carbon": 6.65,
          "agribalyseLand": 147,
          "freshwaterEutrophication": 0.405,
          "waterScarcity": 1.96
        },
        "note": "AGRIBALYSE code 16150; CIQUAL 16150. Source row: Huile de palme raffinée. Modelled consumer preparation: no preparation. DQR 1.02/5 (lower is better). No mass-to-volume conversion is made; enter kg, not litres.",
        "sources": [
          {
            "label": "ADEME source row AGB 16150: Palm oil, refined",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2216150%22&size=1"
          }
        ]
      },
      {
        "id": "sunflower-oil",
        "label": "Sunflower oil",
        "values": {
          "carbon": 2.36,
          "agribalyseLand": 555,
          "freshwaterEutrophication": 1.36,
          "waterScarcity": 0.788
        },
        "note": "AGRIBALYSE code 17440; CIQUAL 17440. Source row: Huile de tournesol. Modelled consumer preparation: no preparation. DQR 1.77/5 (lower is better). No mass-to-volume conversion is made; enter kg, not litres.",
        "sources": [
          {
            "label": "ADEME source row AGB 17440: Sunflower oil",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2217440%22&size=1"
          }
        ]
      },
      {
        "id": "rapeseed-oil",
        "label": "Rapeseed oil",
        "values": {
          "carbon": 2.5,
          "agribalyseLand": 287,
          "freshwaterEutrophication": 0.525,
          "waterScarcity": 0.602
        },
        "note": "AGRIBALYSE code 17130; CIQUAL 17130. Source row: Huile de colza. Modelled consumer preparation: no preparation. DQR 1.99/5 (lower is better). No mass-to-volume conversion is made; enter kg, not litres.",
        "sources": [
          {
            "label": "ADEME source row AGB 17130: Rapeseed oil",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2217130%22&size=1"
          }
        ]
      },
      {
        "id": "olive-oil",
        "label": "Olive oil, extra virgin",
        "values": {
          "carbon": 1.63,
          "agribalyseLand": 621,
          "freshwaterEutrophication": 0.67,
          "waterScarcity": 22.2
        },
        "note": "AGRIBALYSE code 17270; CIQUAL 17270. Source row: Huile d'olive vierge extra. Modelled consumer preparation: no preparation. DQR 2.21/5 (lower is better). No mass-to-volume conversion is made; enter kg, not litres.",
        "sources": [
          {
            "label": "ADEME source row AGB 17270: Olive oil, extra virgin",
            "url": "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines?qs=Code_AGB%3A%2217270%22&size=1"
          }
        ]
      }
    ]
  },
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
