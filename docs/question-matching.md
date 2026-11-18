# Question matching and usage

`POST /api/compare` matches requested activities to real catalogue entries. Unambiguous matches use deterministic selections. Ambiguous matches make at most one Workers AI call constrained to vetted labels. Quantities, recurrence and the comparison horizon are parsed separately; the model cannot supply factors or arbitrary catalogue IDs. Failed or incomplete requests leave existing cards in place.

The question box supports listed lifestyle changes and compatible `replace X with Y`, `swap X for Y` and `Y instead of X` substitutions. Replacements require matching source families and units and inherit the baseline quantity and schedule when unspecified. Incompatible replacements and compounds mixing a separate activity with a substitution are rejected with instructions. Unknown operating factors, such as phone calls or sending email, are not substituted with hardware-production footprints. Vague AI uses a disclosed Gemini text-chat reference. Heavy AI without a count assumes 100 text prompts daily; explicit counts take precedence. Fish and meat use the disclosed portion mixtures. Review the chosen references and assumptions in the cards and Details.

## Benchmarks

The [repeatable benchmark](question-benchmark.md) records the original 12/24 development baseline and revised 24/24 local API regression result. Independent held-out sets initially exposed substantial failures: 5/8 on the first revision and 1/6 exact canonical matches on the second set. Their post-disclosure repair checks reached 7/8 and 6/6. These small repaired sets do not establish general natural-language accuracy. [Original held-out outcomes and limitations](question-holdouts.md) are retained separately.

## Model and cost

The configured model is [IBM Granite 4.0 H Micro](https://developers.cloudflare.com/workers-ai/models/granite-4.0-h-micro/), priced at US$0.017 per million input tokens and US$0.112 per million output tokens when checked on 4 November 2026. A tested [Qwen3 30B alternative](https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/) costs $0.0509/$0.335 and showed no useful reliability improvement in four-case probes. Browsing, editing, evidence lookup, deterministic matches and the tab's eight-result memory cache do not call the model. Browser dictation uses the browser's speech service. [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)

## Request limits

Immediately before real inference, one conditional D1 update reserves a request. The shared limit is 12 attempts per minute and 200 per UTC day, including failed upstream calls. D1 stores counts and time buckets in one fixed row, without user, IP or question records. Static routes bypass the Function. [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) · [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/)
