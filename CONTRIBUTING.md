# Contributing

This repository is an unofficial MapX integration prototype. Start with
[local setup](README.md#run-locally), then choose a focused change on a branch
from `main`. Open a draft PR while iterating.

## Report an issue

Include the demo route, browser and operating system, steps to reproduce and
relevant console output in the [issue tracker](https://github.com/khawkins98/mapx-demo-embed/issues).
Say whether the failure appears in the demo controls, Mangrove or the embedded
MapX app. General SDK discoveries can also inform
[mapx-llm-skills](https://github.com/khawkins98/mapx-llm-skills).

## Checks

After the setup in README, run the production build and unit tests:

```sh
npm run build
npm test
```

Install the browser once, then run the same browser subset as CI:

```sh
npx playwright install --with-deps chromium
npx playwright test compatibility.spec.js landing.spec.js preview-access.spec.js
```

These browser checks use the published Mangrove assets, with MapX stubbed where
appropriate. They need network access. For the full suite, including live MapX
views, controls, scenarios and story transitions:

```sh
npm run test:e2e
```

`npm run test:all` combines unit tests and that full suite. Live-service tests
can time out during MapX startup; report those failures and any isolated reruns
separately from a clean run. Also check the affected page at narrow widths and
with a keyboard when changing interaction or layout. The demo and its datasets
remain outside a production validation claim.

## Prepare the contribution

Use descriptive branches such as `fix/postmessage-bridge`. New commits and PR
titles use Conventional Commits, for example `fix: clear stale feature details`
or `docs: clarify preview access`. Keep existing commit history and human credits.
Do not add unsolicited AI co-author trailers, tool signatures or generated-by text.

Describe the concrete problem, resulting behaviour and checks that actually ran.
Name material limits, such as a stubbed service or a live test that timed out.
Keep each PR focused and update its title and description when scope changes.
Review is best-effort, with no service-level commitment.

## Maintain documentation

Apply the maintainer's [Reader First skills](https://github.com/khawkins98/reader-first):
[documentation refactoring](https://github.com/khawkins98/reader-first/blob/main/skills/documentation-refactoring/SKILL.md)
and [contribution conventions](https://github.com/khawkins98/reader-first/blob/main/skills/contribution-conventions/SKILL.md).
Repository and user instructions take precedence.

Keep first-time orientation and a complete local run in README. Maintain SDK,
Mangrove and preview-access details in the [integration guide](docs/integration.md),
and link there instead of appending each upgrade to README. Agent entry points,
including `.claude/agents/mapx-sdk-developer.md`, should route to these same homes. Commands in this
file are the contributor check workflow; keep them aligned with `package.json`
and CI. Preserve the [investigation](methodology.md) and
[concept brief](docs/risk-to-resilience-pitch.md) as records, adding dated corrections
or implementation notes rather than rewriting their original claims as current advice.

When moving material, verify relative links and anchors and exercise affected
reader tasks. Documentation prose follows sentence case and plain language;
retain literal API names, UI labels, credits and scientific qualifications.

## Reuse

Project-authored code and documentation use [Apache-2.0](LICENSE).
[NOTICE](NOTICE) defines the scope and third-party content exclusions.
