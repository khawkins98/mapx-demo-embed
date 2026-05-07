# Contributing

Thanks for your interest. This is an investigation proof of concept embedding MapX disaster-risk-reduction maps via the MapX SDK, styled with the UNDRR Mangrove component library. It is **not** intended for production — see the README banner.

For deeper technical patterns and SDK quirks, the related skills repo is the canonical reference: https://github.com/khawkins98/mapx-llm-skills

## Filing issues

Open an issue at https://github.com/khawkins98/mapx-demo-embed/issues. Useful detail:

- The demo page (e.g. `index.html`, `country-map.html`).
- Browser + OS, browser console output if anything errored.
- Whether the failure is in the MapX SDK, the Mangrove styling, or the demo glue.

## Proposing changes

1. Fork and branch off `main`.
2. `npm install`, then `npm run dev` to serve locally.
3. Open a draft PR while you iterate.

Note that this repo's relationship to `mapx-llm-skills` is "the demos that informed the skills" — if you find a new SDK quirk worth documenting, the skills repo is usually the better home for it long-term.

## Branch and commit style

- Branches: descriptive, e.g. `feat/mangrove-1.4-upgrade`, `fix/postmessage-bridge`.
- Commits: short, imperative — recent history mixes Conventional Commits and plain summaries.

## Review

Best-effort, no SLA. This is exploratory; expect occasional decisions to lean toward "this lives in mapx-llm-skills now."

## License

MIT (see [LICENSE](LICENSE) — added in audit PR #5).
