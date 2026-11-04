# Everyday impact

[Open the calculator](https://everyday-impact.pages.dev/) · [Read the data credits](https://everyday-impact.pages.dev/credits.html)

Click a choice to browse categories and subcategories, or type to search across the catalogue. Choose an item, activity or lifestyle change. The comparison starts at 12 months. Change the period to any whole number from 1 to 1,000 days, weeks, months or years. Use the plus button to add choices. Advanced lets you edit the illustrative quantity and schedule, skip the activity, or choose a replacement with a compatible unit and evidence base. Bars compare estimates within each measure. Open Details to see the calculation, assumptions and evidence.

Measures with figures for the most choices appear first in the table. Cards list the measures each choice covers. When choosing another activity, the picker shows which measures it shares with the other selected cards. Its filter keeps candidates with at least one shared measure. **Share comparison** copies a link that restores the cards, schedules, comparison period, shared-measures filter and assumed grid. It leaves out the question and microphone input.

You can also enter a question, such as “Compare two AI images a day with running a kettle once a day for a month.” The question box selects catalogue records and fills in their schedules. Review the choices or adjust them in Advanced. Dictation is available in browsers that provide speech recognition. It fills in editable text and requires a separate submit.

General choices appear first. Open **Specific items** for individual models and food variants, or search for them directly. Details identifies the reference item or shows how the median was calculated for that measure. For example, the clothes dryer estimate uses full loads from 8 kg registrations in the Australian GEMS register.

Try [building a web app and running a kettle](https://everyday-impact.pages.dev/?example=web-app-kettle) or [generating an image and lighting a bulb](https://everyday-impact.pages.dev/?example=image-light). Under Digital → AI, evidence labels distinguish benchmarks, provider studies, limited disclosures, published models and AI-modelled scenarios. Open a measure’s Details link to see the unit conversion, workload assumptions and source. The web-app scenarios scale a measured code-completion GPU factor by an illustrative output-token budget.

For an electricity-only benchmark, you can select an assumed Australian grid to estimate greenhouse gases from the electricity the source counted. The grid estimate is labelled in the table. Details shows the kWh, the grid factor, both sources and the limits of the benchmark. Existing greenhouse gas factors keep their original source boundaries. Fish and meat portions each average three named cooked foods in equal proportions by mass. The ingredients and source values are listed in Details.

## Local development

Use Node.js 22.13 or later. Run `npm ci` and `npm test`. To run the full calculator, copy `wrangler.example.jsonc` to `wrangler.jsonc`, set the D1 database identifier for your project and authenticate with `npx wrangler login`. When copying from localhost or a loopback address, the link uses the public base configured by `rel="canonical"` in `dist/index.html`. Other deployments retain their own host.

Run `npm start` and open http://127.0.0.1:8000. Wrangler applies the budget migration to local SQLite. Submitted questions use the connected account’s real Workers AI allocation even in development.

For the manual calculator alone, run `npm run start:static` with Python 3. The browser assets live in `dist/`. The question endpoint lives in `functions/api/compare.js`.

Catalogue records live in `dist/data/`. Each group defines a common unit, sources and scope. Each option supplies factors only for the metrics its sources cover. Preserve the original water measure in each source record. The comparison shows volumes in litres on one Water row and labels each value with its scope. A change between unlike water definitions has no calculated difference. Record the source’s geography, year or edition, product form and system boundary when adding factors. Month and year horizons use the historic 365 daily, 52 weekly and 12 monthly occurrences per year. Day and week horizons use seven-day weeks and average months of 365/12 days. Recurring activities are prorated. One-off activities count once at every horizon.

The catalogue includes all food records from the public AGRIBALYSE 3.2 summary, Australian grid and fuel factors, named appliance test programs and UK procurement and transport factors. The labour evidence section links company-level disclosures separately. Food records retain the publisher’s quality rating and link to the exact source row. Run `python3 scripts/build_agribalyse_foods.py` to refresh the bundled food snapshot and `python3 scripts/verify_agribalyse_foods.py` to compare every imported value with ADEME. The calculator uses local data files at runtime.

## Question matching and usage

`POST /api/compare` matches requested activities to real catalogue entries. Unambiguous matches use deterministic selections. Ambiguous matches make at most one Workers AI call constrained to vetted labels. Quantities, recurrence and the comparison horizon are parsed separately; the model cannot supply factors or arbitrary catalogue IDs. Failed or incomplete requests leave existing cards in place.

The question box supports listed lifestyle changes and compatible `replace X with Y`, `swap X for Y` and `Y instead of X` substitutions. Replacements require matching source families and units and inherit the baseline quantity and schedule when unspecified. Incompatible replacements and compounds mixing a separate activity with a substitution are rejected with instructions. Unknown operating factors, such as phone calls or sending email, are not substituted with hardware-production footprints. Vague AI uses a disclosed Gemini text-chat reference. Heavy AI without a count assumes 100 text prompts daily; explicit counts take precedence. Fish and meat use the disclosed portion mixtures. Review the chosen references and assumptions in the cards and Details.

The [repeatable benchmark](docs/question-benchmark.md) records the original 12/24 development baseline and revised 24/24 local API regression result. Independent held-out sets initially exposed substantial failures: 5/8 on the first revision and 1/6 exact canonical matches on the second set. Their post-disclosure repair checks reached 7/8 and 6/6. These small repaired sets do not establish general natural-language accuracy. [Original held-out outcomes and limitations](docs/question-holdouts.md) are retained separately.

The configured model is [IBM Granite 4.0 H Micro](https://developers.cloudflare.com/workers-ai/models/granite-4.0-h-micro/), priced at US$0.017 per million input tokens and US$0.112 per million output tokens when checked on 4 November 2026. A tested [Qwen3 30B alternative](https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/) costs $0.0509/$0.335 and showed no useful reliability improvement in four-case probes. Browsing, editing, evidence lookup, deterministic matches and the tab's eight-result memory cache do not call the model. Browser dictation uses the browser's speech service. [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)

Immediately before real inference, one conditional D1 update reserves a request. The shared limit is 12 attempts per minute and 200 per UTC day, including failed upstream calls. D1 stores counts and time buckets in one fixed row, without user, IP or question records. Static routes bypass the Function. [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) · [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/)

## Production releases

Publish completed changes to the existing public Cloudflare Pages project `everyday-impact` after testing and pushing `main`. Use the project’s private local `wrangler.jsonc` with the existing `AI` and `USAGE` bindings. From the clean checkout run `npx wrangler d1 migrations apply USAGE --remote`, then `npx wrangler pages deploy dist --project-name everyday-impact --branch main` from the repository root so Wrangler includes the Pages Function. Verify the production calculator and its existing NFS Home launcher entry after the upload.

## Code licence

The [MIT licence](LICENSE) covers the original application and test code. Its scope excludes all data and source materials, including the catalogue in `dist/data/`, factors and example quantities embedded in code or tests, evidence summaries, cited publications and third-party notices.

## Data attribution and reuse

[Sources and licences](dist/credits.html) identifies the creator, published source, applicable licence and adaptations for each data family. Each calculator record also links to its underlying evidence. Retain the source notices when redistributing covered material. The Boavizta-derived [electronics database](dist/data/electronics.js) is separately available under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) with individual contents under [DbCL 1.0](https://opendatacommons.org/licenses/dbcl/1-0/). The [Datagir MIT notice](dist/notices/impactco2-MIT.txt) accompanies the Impact CO₂ meal reference.
