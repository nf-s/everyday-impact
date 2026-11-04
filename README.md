# Everyday impact

[Open the calculator](https://everyday-impact.pages.dev/) · [Read the data credits](https://everyday-impact.pages.dev/credits.html)

Click a choice to browse categories and subcategories, or type to search across the catalogue. Choose an item, activity or lifestyle change. The comparison starts at 12 months. Change the period to any whole number from 1 to 1,000 days, weeks, months or years. Use the plus button to add choices. Advanced lets you edit the illustrative quantity and schedule, skip the activity, or choose a replacement with a compatible unit and evidence base. Bars compare estimates within each measure. Open Details to see the calculation, assumptions and evidence.

You can also enter a question, such as “Compare two AI images a day with running a kettle once a day for a month.” The question box selects catalogue records and fills in their schedules. Review the choices or adjust them in Advanced. Dictation is available in browsers that provide speech recognition. It fills in editable text and requires a separate submit.

General choices appear first. Open **Specific items** for individual models and food variants, or search for them directly. Details identifies the reference item or shows how the median was calculated for that measure. For example, the clothes dryer estimate uses full loads from 8 kg registrations in the Australian GEMS register.

Try [building a web app and running a kettle](https://everyday-impact.pages.dev/?example=web-app-kettle) or [generating an image and lighting a bulb](https://everyday-impact.pages.dev/?example=image-light). Under Digital → AI, evidence labels distinguish benchmarks, provider studies, limited disclosures, published models and AI-modelled scenarios. Open a measure’s Details link to see the unit conversion, workload assumptions and source. The web-app scenarios scale a measured code-completion GPU factor by an illustrative output-token budget.

## Local development

Use Node.js 22.13 or later. Run `npm ci` and `npm test`. To run the full calculator, copy `wrangler.example.jsonc` to `wrangler.jsonc`, set the D1 database identifier for your project and authenticate with `npx wrangler login`. Run `npm start` and open http://127.0.0.1:8000. Wrangler applies the budget migration to local SQLite. Submitted questions use the connected account’s real Workers AI allocation even in development.

For the manual calculator alone, run `npm run start:static` with Python 3. The browser assets live in `dist/`. The question endpoint lives in `functions/api/compare.js`.

Catalogue records live in `dist/data/`. Each group defines a common unit, sources and scope. Each option supplies factors only for the metrics its sources cover. Preserve the original water measure in each source record. The comparison shows volumes in litres on one Water row and labels each value with its scope. A change between unlike water definitions has no calculated difference. Record the source’s geography, year or edition, product form and system boundary when adding factors. Month and year horizons use the historic 365 daily, 52 weekly and 12 monthly occurrences per year. Day and week horizons use seven-day weeks and average months of 365/12 days. Recurring activities are prorated. One-off activities count once at every horizon.

The catalogue includes all food records from the public AGRIBALYSE 3.2 summary, Australian grid and fuel factors, named appliance test programs and UK procurement and transport factors. The labour evidence section links company-level disclosures separately. Food records retain the publisher’s quality rating and link to the exact source row. Run `python3 scripts/build_agribalyse_foods.py` to refresh the bundled food snapshot and `python3 scripts/verify_agribalyse_foods.py` to compare every imported value with ADEME. The calculator uses local data files at runtime.

## Question matching and usage

The only Function route is `POST /api/compare`. The server shortlists real catalogue entries for each requested activity. Cloudflare Workers AI selects from those labels. The application validates every selection, reads time periods and quantities from the question, and uses the same factors as the manual picker. Unsupported matches leave the current cards in place. The question box recognises catalogue lifestyle changes such as going vegan. For a custom substitution, compare the two activities separately or choose a compatible replacement in Advanced.

A submission makes at most one inference. Browsing, editing cards, changing the horizon and looking up evidence run locally. The tab keeps up to eight successful question results in memory. Rejecting an unmatched shortlist and reusing a cached comparison both cost zero model calls. Browser dictation uses the browser’s speech service.

IBM Granite 4.0 H Micro was selected after live matching tests. Its published rates are US$0.017 per million input tokens and US$0.112 per million output tokens. A test comparison of five daily Gemini prompts and one weekly steak used 160 input tokens and 24 output tokens, about US$0.0000054 at those rates. The Workers AI free allocation is shared across the account. [Model and rates](https://developers.cloudflare.com/workers-ai/models/granite-4.0-h-micro/) · [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)

Before inference, a single conditional D1 update reserves a request. The shared limit is 12 attempts per minute and 200 per UTC day, including calls that fail upstream. D1 stores only two counts and their time buckets in a single fixed row. On a disposable populated copy, the primary-key query read one row per reservation, wrote one for an accepted call and wrote zero at the limit. There are no user, IP or question records. Static routes bypass the Function. [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) · [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/)

## Production releases

Publish completed changes to the existing public Cloudflare Pages project `everyday-impact` after testing and pushing `main`. Use the project’s private local `wrangler.jsonc` with the existing `AI` and `USAGE` bindings. From the clean checkout run `npx wrangler d1 migrations apply USAGE --remote`, then `npx wrangler pages deploy dist --project-name everyday-impact --branch main` from the repository root so Wrangler includes the Pages Function. Verify the production calculator and its existing NFS Home launcher entry after the upload.

## Code licence

The [MIT licence](LICENSE) covers the original application and test code. Its scope excludes all data and source materials, including the catalogue in `dist/data/`, factors and example quantities embedded in code or tests, evidence summaries, cited publications and third-party notices.

## Data attribution and reuse

[Sources and licences](dist/credits.html) identifies the creator, published source, applicable licence and adaptations for each data family. Each calculator record also links to its underlying evidence. Retain the source notices when redistributing covered material. The Boavizta-derived [electronics database](dist/data/electronics.js) is separately available under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) with individual contents under [DbCL 1.0](https://opendatacommons.org/licenses/dbcl/1-0/). The [Datagir MIT notice](dist/notices/impactco2-MIT.txt) accompanies the Impact CO₂ meal reference.
