# Everyday impact

[Open the calculator](https://everyday-impact.pages.dev/) · [Read the data credits](https://everyday-impact.pages.dev/credits.html)

Click a choice to browse categories and subcategories, or type to search across the catalogue. Choose an item, activity or lifestyle change to compare its impact over 12 months. Use the plus button to add choices. Advanced lets you edit the illustrative quantity and schedule, skip the activity, or choose a replacement with a compatible unit and evidence base. Bars compare estimates within each measure. Open Details to see the calculation, assumptions and evidence.

Run `npm start` with Python 3 installed, then open http://127.0.0.1:8000. Run `npm test` with Node.js 20 or later. The files under `dist/` are the complete static site.

Catalogue records live in `dist/data/`. Each group defines a common unit, sources and scope. Each option supplies factors only for the metrics its sources cover. Preserve the original water measure in each source record. The comparison shows volumes in litres on one Water row and labels each value with its scope. A change between unlike water definitions has no calculated difference. Record the source’s geography, year or edition, product form and system boundary when adding factors. The calculator uses 365 daily, 52 weekly or 12 monthly occurrences within the comparison year.

The catalogue includes all food records from the public AGRIBALYSE 3.2 summary, Australian grid and fuel factors, named appliance test programs and UK procurement and transport factors. The labour evidence section links company-level disclosures separately. Food records retain the publisher’s quality rating and link to the exact source row. Run `python3 scripts/build_agribalyse_foods.py` to refresh the bundled food snapshot and `python3 scripts/verify_agribalyse_foods.py` to compare every imported value with ADEME. The calculator uses local data files at runtime.

## Code licence

The [MIT licence](LICENSE) covers the original application and test code. Its scope excludes all data and source materials, including the catalogue in `dist/data/`, factors and example quantities embedded in code or tests, evidence summaries, cited publications and third-party notices.

## Data attribution and reuse

[Sources and licences](dist/credits.html) identifies the creator, published source, applicable licence and adaptations for each data family. Each calculator record also links to its underlying evidence. Retain the source notices when redistributing covered material. The Boavizta-derived [electronics database](dist/data/electronics.js) is separately available under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) with individual contents under [DbCL 1.0](https://opendatacommons.org/licenses/dbcl/1-0/). The [Datagir MIT notice](dist/notices/impactco2-MIT.txt) accompanies the Impact CO₂ meal reference.
