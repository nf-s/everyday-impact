# Question matching checks

These checks evaluate activity selection, quantities, recurrence, comparison periods and source coverage. They do not validate environmental factors or establish a population-wide accuracy rate. Each set was fixed before its first run and withheld from the implementation agent until the results were recorded. Once disclosed, it becomes a regression set.

## First set before fixes

The original eight-question set met **6/8 expectations on old production** and **5/8 on the initial revision**. Both scores include two correct rejections. Among the six supported comparisons, old production answered four correctly and the initial revision answered three correctly. Later fixes informed by these cases must be reported separately.

| Question | Old production | Initial revision |
| --- | --- | --- |
| Daily AI chat and a salmon serving each week | Pass | Pass, with an explicit Gemini reference assumption |
| 12 Gemini prompts daily and 150 g steak weekly, over six months | Pass | Pass |
| Seven-minute daily shower and drying two laundry loads weekly | Pass | Selected a washing machine |
| 400 Qwen3-Coder 30B output tokens and 15 minutes of TV, once | Rejected a supported comparison | Rejected a supported comparison |
| 250 ml oat milk daily and a steak weekly | Correctly rejected unsupported ml-to-kg conversion | Correctly rejected unsupported conversion |
| Skip a Hobart–Melbourne return flight and replace a beef meal with a vegan meal weekly | Rejected a supported comparison | Returned only the meal replacement and omitted the flight |
| 30 ChatGPT queries daily and chicken daily, over two weeks | Pass | Pass |
| Outdoor jog and an apple | Correctly rejected unsupported jogging factor | Correctly rejected unsupported jogging factor |

The initial run used `@cf/ibm-granite/granite-4.0-h-micro`, with four live inference calls and four deterministic paths. Its planner SHA256 was `26ee2d0b8322406a9da044345e2fe26deeb84cd0bd6356bac4e4f701935910ff`. The fixed-question fixture SHA256 was `e23e645f0d4a5af819fc366ad906e493e64ce01b1747b5bba9c3d4bf337ccdcf`.

Before the first test, the evaluator corrected the expected coverage for ChatGPT. Its published record contains electricity and a water volume with an undisclosed scope. It shares no published measure with the AGRIBALYSE chicken or salmon records. Gemini can share carbon with these foods. Optional grid-carbon scenarios must be identified separately. No question was changed by that correction.

## First-set repair validation

After the first-set failures were disclosed and repaired, a new run met **7/8 original expectations**. The dryer and Qwen3-Coder comparisons were corrected. The compound flight-skip plus meal-replacement request returned a clear `unsupported_replacement` limitation instead of silently dropping the flight. It remains a functional miss under the original expectation of two supported changes. The implementation agent knew the questions for this regression run.

## Equivalence criteria

Every requested activity must appear. A missing activity, unrelated factor, wrong appliance, or invented unit conversion fails even if the remaining choice is correct. Clear rejection is preferable to an incorrect calculated comparison, but rejecting a supported request still fails that request.

Equivalent source records may pass when they describe the requested activity and retain their product form, denominator and source scope. Each second-set case specifies any acceptable reference proxy or serving-size range. Equivalent `amount × times` schedules count as equal. Mass and time conversions must be exact within ordinary floating-point tolerance. A quantity without recurrence counts once. A named comparison period must not become an activity quantity. No physical-water volume may be invented from a water-scarcity score, and no carbon factor may be invented from electricity without an explicit grid scenario.

## Second set before fixes

The second set contains five straightforward supported comparisons and one unsupported operating-factor request. Its six questions and equivalence criteria were fixed before the first run: [fixture](../scripts/holdout-second-cases.json), SHA256 `87ba1706016f6479b674af9d7d0dc893747bae44fe199ad61317274efc6747d3`. They were not exposed to the implementation agent until after this run completed.

The first run produced **1/6 exact canonical matches**, or **2/6 correct supported results** when applying the predeclared allowance for an equivalent lentil source record. The unsupported request was safely rejected, but with an inaccurate unit-conversion explanation instead of the expected unsupported-activity error. Counting that safe rejection gives a generous **3/6**, not six successful comparisons. No question was rerun to improve this score.

| Question | Initial result |
| --- | --- |
| An apple a day or a banana a day | Correct activities and daily servings |
| Two hours of TV or running the dishwasher once | Added an unrequested third activity, 10 kWh of NSW/ACT grid electricity |
| 100 g plain tofu daily against 100 g lentils daily | Correct quantities and activities using an allowed, explicitly labelled dried-lentil source equivalent. The exact-ID checker rejected the alternate source |
| Keeping a fridge running against a chest freezer, over two weeks | Omitted the fridge and returned only the freezer |
| Boiling a kettle daily and heating food in a microwave daily, for a month | Selected a double cheeseburger instead of microwave operation |
| Ten-minute phone call next to five emails | Rejected. The error described a unit conversion. The actual gap was the lack of operating factors for calls and emails |

All six cases used real Workers AI inference with `@cf/ibm-granite/granite-4.0-h-micro`. Source hashes and complete initial outputs are retained in the [machine-readable report](../scripts/holdout-second-results.json). Planner SHA256 was `ef7f00ac70406a26eca7f4b7a83a77b3e9e57feafe508729bb960dccab0fe440`. Schedule SHA256 was `1708fbb7f22e6a7bf626afe98fe1a5bae4c57f9b34195ae55bc35eb94267c935`.

## Second set after fixes

The same six questions passed all six exact checks on the revised local Pages endpoint. TV and dishwasher produced two choices, fridge and freezer both appeared, and microwave use matched an appliance. The call and email question returned the unsupported-activity error. The test expectations stayed fixed. This run checks regressions after the cases were disclosed.

## Repeating the regression check

The existing bounded benchmark runner accepts the second-set fixture. It requires explicit metered-run authorization through `--live` and credentials supplied locally.

```sh
node scripts/benchmark_questions.mjs --live --cases scripts/holdout-second-cases.json --limit 6 --output holdout-regression-results.json
```

Set `CLOUDFLARE_ACCOUNT_ID` and use a locally authenticated Wrangler session or `CLOUDFLARE_API_TOKEN`. The runner checks canonical IDs strictly. Review any mismatches against the fixture's **predeclared** `equivalence` rules. Keep the initial report above and write later results to a separate file. The questions are now public regression cases.
