import { electronicsDataset } from "./electronics.js";

// Cotton study summary: CC BY 4.0. Electronics subset: ODbL/DbCL, separately downloadable.
export const goodsGroups = [
{
  "id": "apparel",
  "label": "Cotton T-shirt production",
  "category": "goods",
  "unit": "per 200 g T-shirt, production and distribution only",
  "singular": "item",
  "plural": "items",
  "defaultAmount": 1,
  "sourceNote": "Feichtinger, Scherer and Posch (2026), CC BY 4.0. Published scenario summary adapted into catalogue format. This production estimate excludes wearing, washing and disposal; it has a narrower boundary than whole-life device figures.",
  "sources": [
    {
      "label": "Feichtinger et al. (2026): study and licence",
      "url": "https://doi.org/10.1007/s11367-026-02630-3"
    },
    {
      "label": "Creative Commons Attribution 4.0",
      "url": "https://creativecommons.org/licenses/by/4.0/"
    }
  ],
  "options": [
    {
      "id": "cotton-tshirt",
      "label": "Cotton T-shirt (200 g, study scenario ESM1)",
      "values": {
        "carbon": 5.66
      },
      "note": "Scenario ESM1: US-grown cotton; fabric and garment manufacture in China; sea/land distribution to Germany; 30% overproduction assumption. Source: supplementary climate-change results table. Not a brand average or a complete clothing life cycle.",
      "sources": [
        {
          "label": "Study supplementary results: ESM1, total climate change",
          "url": "https://static-content.springer.com/esm/art%3A10.1007%2Fs11367-026-02630-3/MediaObjects/11367_2026_2630_MOESM2_ESM.docx"
        }
      ]
    }
  ]
},
{
  "id": "digital-devices",
  "label": "Named electronic devices",
  "category": "goods",
  "unit": "per device over its modelled life cycle",
  "singular": "item",
  "plural": "items",
  "defaultAmount": 1,
  "sourceNote": "Apple manufacturer-reported estimates from Boavizta, retrieved 4 November 2026. Includes production, transport, first-owner electricity use and end-of-life processing, with model-specific scope. Totals are counted once per purchase. These historical models and reporting methods differ from current devices and are not Australian averages. Boavizta cautions against precise impact rankings; figures are indicative, not buying recommendations. Electronics subset: ODbL 1.0; individual contents: DbCL 1.0.",
  "sources": [
    {
      "label": "Boavizta: methodology, limits and licences",
      "url": "https://github.com/Boavizta/environmental-footprint-data"
    }
  ],
  "options": electronicsDataset.records
}
];

export const labourEvidence = [
  {
    "brand": "Uniqlo",
    "title": "Good On You: Uniqlo assessment",
    "detail": "Open the publisher’s assessment for its current rating and explanation.",
    "scope": "External assessment · link only",
    "sources": [
      {
        "label": "Good On You: Uniqlo rating and reasons",
        "url": "https://directory.goodonyou.eco/brand/uniqlo"
      }
    ]
  },
  {
    "brand": "Uniqlo",
    "title": "How Fast Retailing addresses forced-labour risks",
    "detail": "KnowTheChain’s 2023 apparel and footwear benchmark scored Fast Retailing, Uniqlo’s parent company, 49/100 and ranked it 4th of 65 companies. It assesses company efforts to address forced-labour risks, including recruitment, worker voice and remedy.",
    "scope": "Parent company · 2023 benchmark",
    "sources": [
      {
        "label": "KnowTheChain: 2023 apparel and footwear benchmark, page 8",
        "url": "https://media.business-humanrights.org/media/documents/KTC_2023_AF_Benchmark_Report.pdf"
      }
    ]
  },
  {
    "brand": "Uniqlo",
    "title": "Tracing a garment to its factory",
    "detail": "Fast Retailing publishes a production-partner list, dated 31 August 2026, covering garment and processing factories, core fabric mills and auxiliary-material factories. It says the list is updated every six months. The list identifies suppliers. Tracing an individual garment and verifying conditions there requires additional evidence.",
    "scope": "Supplier disclosure · 31 August 2026",
    "sources": [
      {
        "label": "Fast Retailing: production partners and disclosure scope",
        "url": "https://www.fastretailing.com/eng/sustainability/labor/list.html"
      }
    ]
  }
];
