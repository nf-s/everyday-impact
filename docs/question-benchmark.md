# Question planner benchmark

Checked 4 November 2026. These small sets test specific questions. The [independent held-out evaluations](question-holdouts.md) record the initial results and subsequent repairs separately.

## Fixed cases and recorded runs

The [original 24 cases](../scripts/question-benchmark-cases.json) were written before the first full baseline and include two reported failures, alternative wording, quantities, time periods, geographic references, substitutions and unsupported activities. The script compares declared IDs, quantities, recurrence and horizon exactly. A defensible alternate source can still fail this strict checker. Each report includes the actual source chosen.

The original expectation for replacing beef with tofu was an explicit rejection. The revised planner supports the same compatible substitutions as the manual calculator. [Version 2](../scripts/question-benchmark-v2.json) changes only that expectation to a successful, source-compatible swap. The original fixture and baseline were retained. The [eight conversational regression cases](../scripts/question-regression-cases.json) were added after those failures were disclosed, so they are not held-out evidence.

| Run | Exact expectations met | Inference calls | Interpretation |
| --- | ---: | ---: | --- |
| [Old production, two real failures](benchmarks/production-baseline.json) | 0/2 | Not exposed by endpoint | Wrong AI and fish references. Heavy use rejected. |
| [Original local planner with real Granite](benchmarks/granite-baseline.json) | 12/24 | 18 | Before repairs |
| [Intermediate real Granite run](benchmarks/granite-intermediate.json) | 21/24 | 20 | Remaining shower-band and bathroom failures |
| [Forced Granite, v2 cases](benchmarks/granite-forced-v2.json) | 23/24 | 21 | Forced inference falsely rejected the shower and laundry comparison |
| [Revised local Pages API, v2 cases](benchmarks/release-api-v2.json) | 24/24 | Endpoint does not expose count | Actual release path, including deterministic selections |
| [Forced Granite, conversational cases](benchmarks/conversational-forced.json) | 6/8 | 6 | Forced inference falsely rejected two otherwise unambiguous comparisons |
| [Revised local Pages API, conversational cases](benchmarks/conversational-api.json) | 8/8 | Endpoint does not expose count | Regression validation after repairs |

A forced run intentionally asks the model to choose even when the application already has one unambiguous catalogue record. The release path returns those validated deterministic selections without inference. This avoids the model's observed false `Unsupported` decisions. Ambiguous cases still make at most one constrained call and fail closed if the result is invalid or incomplete. The endpoint's recorded `calls` count is HTTP requests, not paid model calls.

The first independent eight-case set initially scored 6/8 on old production and 5/8 on the first revision. Repair validation reached 7/8; the compound flight-skip plus meal-replacement request now fails clearly instead of silently losing the flight, and remains a functional miss. The second untouched six-case set initially scored 1/6 exact, 2/6 with its predeclared source equivalence allowance; its post-disclosure repair validation reached 6/6. See [the complete held-out report](question-holdouts.md).

## Model comparison and cost

Cloudflare's published prices checked on 4 November 2026 are US dollars per million tokens:

| Model | Input | Output |
| --- | ---: | ---: |
| [Granite 4.0 H Micro](https://developers.cloudflare.com/workers-ai/models/granite-4.0-h-micro/) | $0.017 | $0.112 |
| [Qwen3 30B A3B FP8](https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/) | $0.0509 | $0.335 |

[Four Qwen default-mode probes](benchmarks/qwen-default.json) exhausted the 220-token cap in reasoning and produced no usable validated selections: 0/4. A [four-case repeat with `/no_think`](benchmarks/qwen-no-thinking.json), as documented in the [Qwen model card](https://huggingface.co/Qwen/Qwen3-30B-A3B#advanced-usage-switching-between-thinking-and-non-thinking-modes-via-user-input), reached 3/4 and falsely rejected heavy AI. This does not show a useful reliability gain over Granite for this constrained task. The configured model remains Granite.

The 18-call Granite baseline used 2,526 input and 446 output tokens, about $0.000093 at the published token rates. Reports retain usage and neuron counts. The account's free allowance, D1 budget and HTTP request costs are separate. No quota or configuration was increased for these checks.

## Reproduce

Use the repository's Node version and authenticated local Wrangler session. Set `CLOUDFLARE_ACCOUNT_ID`; an optional `CLOUDFLARE_API_TOKEN` can replace Wrangler OAuth. The runner never writes credentials. `--live` explicitly enables metered inference. Each run is bounded to at most 24 cases; no retry loop runs automatically.

```sh
node scripts/benchmark_questions.mjs --live --output /tmp/planner-baseline.json
node scripts/benchmark_questions.mjs --live --cases scripts/question-benchmark-v2.json --output /tmp/planner-v2.json
node scripts/benchmark_questions.mjs --live --endpoint http://127.0.0.1:8000/api/compare --cases scripts/question-benchmark-v2.json --output /tmp/planner-api.json
node scripts/benchmark_questions.mjs --live --cases scripts/question-regression-cases.json --output /tmp/planner-conversation.json
```

For a model diagnostic, add `--force-inference` to bypass the application's single-candidate shortcut. To repeat the Qwen comparison, add `--model @cf/qwen/qwen3-30b-a3b-fp8 --no-thinking --only real-ai-fish,real-heavy-meat,website-kettle,named-grid`. Output files contain questions, expected and actual plans, errors, source hashes, timings, raw constrained responses and usage. Write each run to a new report to preserve the original blinded results.

## Boundaries

The planner distinguishes operating an appliance from making a food product or owning hardware. Phone calls, sending emails, unavailable named AI providers and unknown activities are rejected rather than assigned a device-production or unrelated food factor. A reference is still an explicit scenario, not a personalised measurement. Vague AI means Gemini text chat; vague fish and meat use the disclosed cooked-food mixtures. Heavy AI without an explicit count assumes 100 text prompts per day, with an editable assumption; explicit counts take precedence.

Compatible `replace X with Y`, `swap X for Y` and `Y instead of X` use the manual calculator's source-family and unit criteria. The replacement inherits the baseline quantity and cadence when unspecified. Conflicting explicit quantities/cadences, incompatible evidence and compounds mixing a separate activity with a substitution return actionable errors. Other unsupported or ambiguous phrasing can still be rejected. Litres are not silently converted to kilograms. Inspect the selected records and their assumptions; the manual picker and Advanced controls remain available.
