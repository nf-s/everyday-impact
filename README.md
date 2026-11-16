# Everyday impact

[Open the calculator](https://everyday-impact.pages.dev/) · [Read the data credits](https://everyday-impact.pages.dev/credits.html)

The calculator has two views, switched from the header. **In words** writes one sentence per activity, ranked from largest to smallest beside a scale where each step is ten times the one below. The first activity is the reference, and every other row shows how many times more or less it comes to. **In numbers** shows every measure as a column, with schedules edited in place, alternatives as sub-rows and totals underneath.

Select an underlined phrase to change it: the activity opens the catalogue, the schedule opens its quantity and frequency, and the figure opens the calculation, assumptions and sources. **More** offers **Try an alternative**, which compares the activity with a compatible replacement or with skipping it at the same quantity and schedule, **Compare everything with this**, which makes the activity the reference, and **Remove**. **Add an activity** adds an independent activity. Faint lines on the scale are common activities at an illustrative schedule; select one to add it. The measure and period sit above the comparison. The period starts at 12 months and accepts 1 to 1,000 days, weeks, months or years. The activity picker can filter candidates by shared measures, and **Shared measures only** limits the In numbers columns to measures every activity has. **Share** copies a link that restores the activities, alternatives, schedules, period, measure, shared-measures filter and assumed grid. It leaves out the question and microphone input.

Type a question into **Ask a comparison question** and select **Compare**, or press **Command–Enter** or **Ctrl–Enter**. Try “Compare two AI images a day with running a kettle once a day for a month.” The question selects catalogue records and fills in their schedules. Dictation is available in browsers that provide speech recognition. It fills in editable text and requires a separate submit.

General choices appear first. Open **Specific items** for individual models and food variants, or search for them directly. The calculation view identifies the reference item or shows how the median was calculated for that measure. For example, the clothes dryer estimate uses full loads from 8 kg registrations in the Australian GEMS register.

Try [building a web app and running a kettle](https://everyday-impact.pages.dev/?example=web-app-kettle) or [generating an image and lighting a bulb](https://everyday-impact.pages.dev/?example=image-light). Under Digital → AI, evidence labels distinguish benchmarks, provider studies, limited disclosures, published models and AI-modelled scenarios. Select a figure to see the unit conversion, workload assumptions and source. The web-app scenarios scale a measured code-completion GPU factor by an illustrative output-token budget.

For an electricity-only benchmark, you can select an assumed Australian grid to estimate greenhouse gases from the electricity the source counted. The grid estimate is labelled beside the figure. The calculation view shows the kWh, the grid factor, both sources and the limits of the benchmark. Existing greenhouse gas factors keep their original source boundaries. Fish and meat portions each average three named cooked foods in equal proportions by mass. The ingredients and source values are listed in the calculation view.

## Interface design

Colour, type and spacing tokens are at the top of `dist/styles.css`: warm paper (`#fbfaf7`), near-black ink and a cobalt accent used for focus, links and lower figures. Sentences and headings use Fraunces; controls, labels and tables use Hanken Grotesk. Both are self-hosted from `dist/fonts/` under the SIL Open Font Licence, with licence texts in `dist/notices/`. `dist/table.css` styles the In numbers table. Below 720px the scale narrows to a rail, rows stack and the table keeps the activity column fixed while measures scroll. Native inputs keep 16px text on phones.

`dist/comparison.js` holds the comparison state and the figures derived from it, `dist/words-view.js` and `dist/table-view.js` render the two views, and `dist/actions.js` opens the shared dialogs (`picker.js`, `schedule-dialog.js`, `measure-dialog.js`).

## Design prototypes

`prototypes/` holds the layouts explored before the current interface. `combined/` is the one the calculator was built from; Sentence, Bars, True scale, Scale and Ledger are the first round it draws on. They import the catalogue and model from `dist/`, so their figures match the calculator, and they share one comparison through browser storage. Run `npm run start:prototypes` and open http://127.0.0.1:8000/prototypes/. The folder sits outside `dist/` and is not part of a release. The comparison question, dictation, sharing, the factor library and labour evidence are not wired in the prototypes. Fonts in `prototypes/fonts/` are self-hosted under the SIL Open Font Licence; licence texts are in `prototypes/fonts/licences/`.

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

Publish completed changes to the existing public Cloudflare Pages project `everyday-impact` after testing and pushing `main`. The deployed project owns the existing `AI` and `USAGE` bindings and native Cloudflare Web Analytics settings. Keep those settings unchanged for ordinary releases.

Do not deploy from the repository root with `wrangler.jsonc`: Wrangler can clear the native Web Analytics settings. Instead, upload the committed static assets and Pages Function from a temporary directory without a Wrangler config. From a clean checkout of the approved release commit, after `npm ci` and `npm test`:

```sh
repo="$PWD"
release="$(git rev-parse HEAD)"
stage="$(mktemp -d /tmp/everyday-impact-release-XXXXXX)"
git archive "$release" dist functions lib | tar -x -C "$stage"
(
  cd "$stage"
  "$repo/node_modules/.bin/wrangler" pages deploy dist \
    --project-name everyday-impact --branch main \
    --commit-hash "$release" --commit-dirty=false
)
```

The temporary directory must contain `dist/`, `functions/` and `lib/`, which the Pages Function imports. Do not copy the private Wrangler config into it. This upload reuses the project's deployed bindings and compatibility settings. If a release needs a binding or compatibility change, review and apply that separately rather than silently relying on the local config. Apply required database migrations using the private config before the release; analytics-only releases do not need migrations.

After upload, read back the production deployment and project settings. Confirm the intended commit, `AI` and `USAGE` bindings, compatibility settings and `fail_open` are unchanged unless explicitly part of the release. Confirm the project's `build_config.web_analytics_tag` and `web_analytics_token` remain set. The live homepage and credits page should each contain exactly one native `static.cloudflareinsights.com/beacon.min.js` script, and a browser visit should load the script and send its analytics request successfully. Do not add a second hard-coded beacon. Verify the production calculator and its existing NFS Home launcher entry. For an analytics-only redeployment, stage the currently deployed commit rather than newer unrelated changes on `main`.

## Code licence

The [MIT licence](LICENSE) covers the original application and test code. Its scope excludes all data and source materials, including the catalogue in `dist/data/`, factors and example quantities embedded in code or tests, evidence summaries, cited publications and third-party notices.

## Data attribution and reuse

[Sources and licences](dist/credits.html) identifies the creator, published source, applicable licence and adaptations for each data family. Each calculator record also links to its underlying evidence. Retain the source notices when redistributing covered material. The Boavizta-derived [electronics database](dist/data/electronics.js) is separately available under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) with individual contents under [DbCL 1.0](https://opendatacommons.org/licenses/dbcl/1-0/). The [Datagir MIT notice](dist/notices/impactco2-MIT.txt) accompanies the Impact CO₂ meal reference.
