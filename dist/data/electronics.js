// Adapted Boavizta database: ODbL 1.0. Individual database contents: DbCL 1.0.
// See the exported licence metadata and source revision. No application code licence is granted here.
export const electronicsDataset = {
  "title": "Adapted Boavizta electronics footprint subset",
  "creator": "Boavizta",
  "source": "https://github.com/Boavizta/environmental-footprint-data",
  "sourceRevision": "61323eb5c3bb63b0703e7a9c6456482ccbaac3a6",
  "sourceFile": "https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/61323eb5c3bb63b0703e7a9c6456482ccbaac3a6/boavizta-data-us.csv",
  "retrieved": "2026-11-04",
  "databaseLicense": {
    "label": "Open Database License 1.0",
    "url": "https://opendatacommons.org/licenses/odbl/1-0/"
  },
  "contentsLicense": {
    "label": "Database Contents License 1.0",
    "url": "https://opendatacommons.org/licenses/dbcl/1-0/"
  },
  "modifications": "Selected eight Apple device records; retained published carbon totals, added descriptive labels and scope notes. First-owner-use years follow the historical Apple method (three for iPhone/iPad, four for Mac) rather than treating Boavizta lifetime entries of 3 or 3.5 years as authoritative. Original lifetime fields are preserved separately. This adapted electronics database is available under ODbL 1.0; rights in its individual contents are under DbCL 1.0. These licences do not apply to application code, other source groups, or linked report documents.",
  "records": [
    {
      "id": "smartphone",
      "label": "Apple iPhone 13 Pro, 128 GB (2021)",
      "values": {
        "carbon": 69.0
      },
      "note": "Apple's published whole-device life-cycle estimate, September 2021. Includes production, transport, first-owner use and end-of-life processing. The historical Apple method models 3 years of first-owner use; this is not a durability claim. Regional electricity assumptions are weighted to the sales geography, not Australian use. Networks and data-centre services are outside this device footprint.",
      "sources": [
        {
          "label": "Boavizta: source dataset at imported revision",
          "url": "https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/61323eb5c3bb63b0703e7a9c6456482ccbaac3a6/boavizta-data-us.csv"
        },
        {
          "label": "Apple: original product environmental report",
          "url": "https://www.apple.com/environment/pdf/products/iphone/iPhone_13_Pro_PER_Sept2021.pdf"
        },
        {
          "label": "Apple: historical life-cycle assessment method (2024), Appendix B",
          "url": "https://images.apple.com/euro/environment/pdf/Apple_Environmental_Progress_Report_2024.pdf"
        }
      ],
      "manufacturer": "Apple",
      "sourceProductName": "iPhone 13 Pro 128GB",
      "sourceReportDate": "September 2021",
      "sourceUseLocation": "WW",
      "sourceLifetimeYears": 3.0,
      "modelledFirstOwnerUseYears": 3
    },
    {
      "id": "smartphone-iphone14",
      "label": "Apple iPhone 14, 128 GB (2022)",
      "values": {
        "carbon": 61.0
      },
      "note": "Apple's published whole-device life-cycle estimate, September 7 2022. Includes production, transport, first-owner use and end-of-life processing. The historical Apple method models 3 years of first-owner use; this is not a durability claim. Regional electricity assumptions are weighted to the sales geography, not Australian use. Networks and data-centre services are outside this device footprint.",
      "sources": [
        {
          "label": "Boavizta: source dataset at imported revision",
          "url": "https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/61323eb5c3bb63b0703e7a9c6456482ccbaac3a6/boavizta-data-us.csv"
        },
        {
          "label": "Apple: original product environmental report",
          "url": "https://www.apple.com/environment/pdf/products/iphone/iPhone_14_PER_Sept2022.pdf"
        },
        {
          "label": "Apple: historical life-cycle assessment method (2024), Appendix B",
          "url": "https://images.apple.com/euro/environment/pdf/Apple_Environmental_Progress_Report_2024.pdf"
        }
      ],
      "manufacturer": "Apple",
      "sourceProductName": "iPhone 14 with 128GB",
      "sourceReportDate": "September 7 2022",
      "sourceUseLocation": "WW",
      "sourceLifetimeYears": 3.5,
      "modelledFirstOwnerUseYears": 3
    },
    {
      "id": "smartphone-iphonese",
      "label": "Apple iPhone SE, 64 GB (2022)",
      "values": {
        "carbon": 46.0
      },
      "note": "Apple's published whole-device life-cycle estimate, March 18 2022. Includes production, transport, first-owner use and end-of-life processing. The historical Apple method models 3 years of first-owner use; this is not a durability claim. Regional electricity assumptions are weighted to the sales geography, not Australian use. Networks and data-centre services are outside this device footprint.",
      "sources": [
        {
          "label": "Boavizta: source dataset at imported revision",
          "url": "https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/61323eb5c3bb63b0703e7a9c6456482ccbaac3a6/boavizta-data-us.csv"
        },
        {
          "label": "Apple: original product environmental report",
          "url": "https://www.apple.com/environment/pdf/products/iphone/iPhone_SE_PER_March2022.pdf"
        },
        {
          "label": "Apple: historical life-cycle assessment method (2024), Appendix B",
          "url": "https://images.apple.com/euro/environment/pdf/Apple_Environmental_Progress_Report_2024.pdf"
        }
      ],
      "manufacturer": "Apple",
      "sourceProductName": "iPhone SE (3rd generation) with 64GB",
      "sourceReportDate": "March 18 2022",
      "sourceUseLocation": "WW",
      "sourceLifetimeYears": 3.5,
      "modelledFirstOwnerUseYears": 3
    },
    {
      "id": "tablet",
      "label": "Apple iPad 9th gen, Wi-Fi + Cellular, 64 GB (2021)",
      "values": {
        "carbon": 75.0
      },
      "note": "Apple's published whole-device life-cycle estimate, September 14 2021. Includes production, transport, first-owner use and end-of-life processing. The historical Apple method models 3 years of first-owner use; this is not a durability claim. Regional electricity assumptions are weighted to the sales geography, not Australian use. Networks and data-centre services are outside this device footprint.",
      "sources": [
        {
          "label": "Boavizta: source dataset at imported revision",
          "url": "https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/61323eb5c3bb63b0703e7a9c6456482ccbaac3a6/boavizta-data-us.csv"
        },
        {
          "label": "Apple: original product environmental report",
          "url": "https://www.apple.com/environment/pdf/products/ipad/iPad_PER_Sept2021.pdf"
        },
        {
          "label": "Apple: historical life-cycle assessment method (2024), Appendix B",
          "url": "https://images.apple.com/euro/environment/pdf/Apple_Environmental_Progress_Report_2024.pdf"
        }
      ],
      "manufacturer": "Apple",
      "sourceProductName": "iPad (9th generation) Wi-Fi + Cellular with 64GB",
      "sourceReportDate": "September 14 2021",
      "sourceUseLocation": "WW",
      "sourceLifetimeYears": 3.5,
      "modelledFirstOwnerUseYears": 3
    },
    {
      "id": "tablet-ipadair",
      "label": "Apple iPad Air 5th gen, 64 GB (2022)",
      "values": {
        "carbon": 80.0
      },
      "note": "Apple's published whole-device life-cycle estimate, March 18 2022. Includes production, transport, first-owner use and end-of-life processing. The historical Apple method models 3 years of first-owner use; this is not a durability claim. Regional electricity assumptions are weighted to the sales geography, not Australian use. Networks and data-centre services are outside this device footprint.",
      "sources": [
        {
          "label": "Boavizta: source dataset at imported revision",
          "url": "https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/61323eb5c3bb63b0703e7a9c6456482ccbaac3a6/boavizta-data-us.csv"
        },
        {
          "label": "Apple: original product environmental report",
          "url": "https://www.apple.com/environment/pdf/products/ipad/iPad_Air_PER_March2022.pdf"
        },
        {
          "label": "Apple: historical life-cycle assessment method (2024), Appendix B",
          "url": "https://images.apple.com/euro/environment/pdf/Apple_Environmental_Progress_Report_2024.pdf"
        }
      ],
      "manufacturer": "Apple",
      "sourceProductName": "iPad Air (5th generation) with 64GB",
      "sourceReportDate": "March 18 2022",
      "sourceUseLocation": "WW",
      "sourceLifetimeYears": 3.5,
      "modelledFirstOwnerUseYears": 3
    },
    {
      "id": "laptop",
      "label": "Apple MacBook Air 13-inch M1, 256 GB (2020)",
      "values": {
        "carbon": 161.0
      },
      "note": "Apple's published whole-device life-cycle estimate, November 2020. Includes production, transport, first-owner use and end-of-life processing. The historical Apple method models 4 years of first-owner use; this is not a durability claim. Regional electricity assumptions are weighted to the sales geography, not Australian use. Networks and data-centre services are outside this device footprint.",
      "sources": [
        {
          "label": "Boavizta: source dataset at imported revision",
          "url": "https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/61323eb5c3bb63b0703e7a9c6456482ccbaac3a6/boavizta-data-us.csv"
        },
        {
          "label": "Apple: original product environmental report",
          "url": "https://www.apple.com/environment/pdf/products/notebooks/13-inch_MacBookAir_PER_Nov2020.pdf"
        },
        {
          "label": "Apple: historical life-cycle assessment method (2024), Appendix B",
          "url": "https://images.apple.com/euro/environment/pdf/Apple_Environmental_Progress_Report_2024.pdf"
        }
      ],
      "manufacturer": "Apple",
      "sourceProductName": "13-inch MacBook Air (M1 CPU) 256GB - 2020",
      "sourceReportDate": "November 2020",
      "sourceUseLocation": "WW",
      "sourceLifetimeYears": 3.0,
      "modelledFirstOwnerUseYears": 4
    },
    {
      "id": "desktop-home",
      "label": "Apple Mac mini M1, 256 GB (2020)",
      "values": {
        "carbon": 172.0
      },
      "note": "Apple's published whole-device life-cycle estimate, November 10 2020. Includes production, transport, first-owner use and end-of-life processing. The historical Apple method models 4 years of first-owner use; this is not a durability claim. Regional electricity assumptions are weighted to the sales geography, not Australian use. Networks and data-centre services are outside this device footprint. External display and peripherals are not included.",
      "sources": [
        {
          "label": "Boavizta: source dataset at imported revision",
          "url": "https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/61323eb5c3bb63b0703e7a9c6456482ccbaac3a6/boavizta-data-us.csv"
        },
        {
          "label": "Apple: original product environmental report",
          "url": "https://www.apple.com/environment/pdf/products/desktops/Macmini_PER_Nov2020.pdf"
        },
        {
          "label": "Apple: historical life-cycle assessment method (2024), Appendix B",
          "url": "https://images.apple.com/euro/environment/pdf/Apple_Environmental_Progress_Report_2024.pdf"
        }
      ],
      "manufacturer": "Apple",
      "sourceProductName": "Mac mini (M1 2020) with 256GB",
      "sourceReportDate": "November 10 2020",
      "sourceUseLocation": "WW",
      "sourceLifetimeYears": 3.5,
      "modelledFirstOwnerUseYears": 4
    },
    {
      "id": "desktop-m2",
      "label": "Apple Mac mini M2, 256 GB (2023)",
      "values": {
        "carbon": 112.0
      },
      "note": "Apple's published whole-device life-cycle estimate, January 17 2023. Includes production, transport, first-owner use and end-of-life processing. The historical Apple method models 4 years of first-owner use; this is not a durability claim. Regional electricity assumptions are weighted to the sales geography, not Australian use. Networks and data-centre services are outside this device footprint. External display and peripherals are not included.",
      "sources": [
        {
          "label": "Boavizta: source dataset at imported revision",
          "url": "https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/61323eb5c3bb63b0703e7a9c6456482ccbaac3a6/boavizta-data-us.csv"
        },
        {
          "label": "Apple: original product environmental report",
          "url": "https://www.apple.com/environment/pdf/products/desktops/Mac_mini_PER_Jan2023.pdf"
        },
        {
          "label": "Apple: historical life-cycle assessment method (2024), Appendix B",
          "url": "https://images.apple.com/euro/environment/pdf/Apple_Environmental_Progress_Report_2024.pdf"
        }
      ],
      "manufacturer": "Apple",
      "sourceProductName": "Mac mini with M2 with 256GB",
      "sourceReportDate": "January 17 2023",
      "sourceUseLocation": "WW",
      "sourceLifetimeYears": 3.5,
      "modelledFirstOwnerUseYears": 4
    }
  ]
};
