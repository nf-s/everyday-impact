# Development

## Local development

Use Node.js 22.13 or later. Run `npm ci` and `npm test`. To run the full calculator, copy `wrangler.example.jsonc` to `wrangler.jsonc`, set the D1 database identifier for your project and authenticate with `npx wrangler login`. When copying from localhost or a loopback address, the link uses the public base configured by `rel="canonical"` in `dist/index.html`. Other deployments retain their own host.

Run `npm start` and open http://127.0.0.1:8000. Wrangler applies the budget migration to local SQLite. Submitted questions use the connected account’s real Workers AI allocation even in development.

For the manual calculator alone, run `npm run start:static` with Python 3. The browser assets live in `dist/`. The question endpoint lives in `functions/api/compare.js`.

## Catalogue data

Catalogue records live in `dist/data/`. Each group defines a common unit, sources and scope. Each option supplies factors only for the metrics its sources cover. Preserve the original water measure in each source record. The comparison shows volumes in litres on one Water row and labels each value with its scope. A change between unlike water definitions has no calculated difference. Record the source’s geography, year or edition, product form and system boundary when adding factors. Month and year horizons use the historic 365 daily, 52 weekly and 12 monthly occurrences per year. Day and week horizons use seven-day weeks and average months of 365/12 days. Recurring activities are prorated. One-off activities count once at every horizon.

The catalogue includes all food records from the public AGRIBALYSE 3.2 summary, Australian grid and fuel factors, named appliance test programs and UK procurement and transport factors. The labour evidence section links company-level disclosures separately. Food records retain the publisher’s quality rating and link to the exact source row. Run `python3 scripts/build_agribalyse_foods.py` to refresh the bundled food snapshot and `python3 scripts/verify_agribalyse_foods.py` to compare every imported value with ADEME. The calculator uses local data files at runtime.

## Interface design

Colour, type and spacing tokens are at the top of `dist/styles.css`: warm paper (`#fbfaf7`), near-black ink and a cobalt accent used for focus, links and lower figures. Sentences and headings use Fraunces; controls, labels and tables use Hanken Grotesk. Both are self-hosted from `dist/fonts/` under the SIL Open Font Licence, with licence texts in `dist/notices/`. `dist/table.css` styles the In numbers table. Below 720px the scale narrows to a rail, rows stack and the table keeps the activity column fixed while measures scroll. Native inputs keep 16px text on phones.

`dist/comparison.js` holds the comparison state and the figures derived from it, `dist/words-view.js` and `dist/table-view.js` render the two views, `dist/measure-menu.js` renders the measure menu, and `dist/actions.js` opens the shared dialogs (`picker.js`, `schedule-dialog.js`, `measure-dialog.js`).

## Design prototypes

`prototypes/` holds the layouts explored before the current interface. `combined/` is the one the calculator was built from; Sentence, Bars, True scale, Scale and Ledger are the first round it draws on. They import the catalogue and model from `dist/`, so their figures match the calculator, and they share one comparison through browser storage. Run `npm run start:prototypes` and open http://127.0.0.1:8000/prototypes/. The folder sits outside `dist/` and is not part of a release. The comparison question, dictation, sharing, the factor library and labour evidence are not wired in the prototypes. Fonts in `prototypes/fonts/` are self-hosted under the SIL Open Font Licence; licence texts are in `prototypes/fonts/licences/`.

## README screenshots

The images in `docs/screenshots/` show the default example at a 1280 × 900 viewport and a device scale factor of 2: the In words view, the In numbers view (`#numbers`) and the calculation dialog opened from the first figure. Retake them from `npm run start:static` when the interface changes.
