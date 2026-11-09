# Learnings

Hard-won lessons from building this MapX embed proof of concept. Captured during the 2026-05 audit sweep — pull more in over time.

The deeper SDK reference lives in the [mapx-llm-skills](https://github.com/khawkins98/mapx-llm-skills) repo (especially `skills/mapx-sdk-dev/limitations-and-workarounds.md`). This file captures lessons specifically relevant to *this* embed PoC.

## Project context and SDK error handling

- The original investigation found silent failures when adding story views
  from a different project. Check project context first when a view fails to
  appear; see the historical investigation in [methodology.md](methodology.md).
- The regular view list targets the Eco-DRR project. Cross-project stories use
  a separate iframe with their own project context; there is no startup catalogue
  validation in this demo.
- Older MapX releases could leave `get_view_source_summary` pending on resolver failure. MapX 1.14.3 now returns structured resolver errors and supports request timeouts; do not assume an SDK call always succeeds.

For more SDK failure modes, see the skills repo's
[`troubleshooting.md`](https://github.com/khawkins98/mapx-llm-skills/blob/main/skills/mapx-sdk-dev/troubleshooting.md).

## `map_wait_idle()` is the bottleneck people miss

Dashboard, filter, and data operations must wait for `map_wait_idle()`. If you call them too early they fail without a clear error. Build the wait into shared helpers rather than sprinkling it case by case.

## postMessage bridge can't carry callbacks

The SDK's bridge can't pass functions or DOM elements. Click interaction on custom layers needs a coordinate-matching workaround on the embed side. If a SDK pattern in some old wiki example expects a callback, it's outdated.

## Hosted SDK and MapX compatibility

Checked against MapX **1.14.3** on 9 November 2026, using integration lessons from
`undrr-risk-resilience-maps-pw` (`src/sdk/client.js`, `src/sdk/inspect.js` and
`src/sdk/availability.js`).

- Load the Manager and iframe from the same MapX host. Pinning the npm Manager
  independently can produce `err_version_mismatch` as the hosted app upgrades.
  See [upstream #1107](https://github.com/unep-grid/mapx/issues/1107).
- Since 1.14.2, consume one `click_features` event per click, with
  `{ attributes: { [idView]: rows }, lngLat, point }`. Do not also subscribe to
  the retired `click_attributes` event. Empty attributes mean no hits.
  See [upstream #1139](https://github.com/unep-grid/mapx/issues/1139) and the
  [1.14.3 source](https://github.com/unep-grid/mapx/blob/1.14.3/app/src/js/map_helpers/click_features.js).
- Keep transparency in the SDK's 0–100 scale (0 = opaque), converting to opacity
  for the UI with `100 - transparency`. Do not infer a 0–1 scale from small values.
- Set `iframeTitle` on each Manager for an accessible frame name. The hosted
  version is available from the Manager instance's `version` getter.

## Mangrove 2.3.0 styling notes

- Use the canonical `https://assets.undrr.org/mangrove/2.3.0/` asset path.
  The old `/testing/static/` path is not the published release contract.
- The rem base remains 16px. Use the published font-role properties for local UI.
- The header uses the canonical logo URL with `mg-logo mg-logo--autocrop`.
- Use `mg-range` for opacity inputs, with an explicit associated label.
- Snackbar presentation now uses Notice: `mg-notice mg-snackbar`, with
  `role="status"`. The library controller requires React, so this vanilla demo
  retains its local auto-dismiss timer. Old `mg-snackbar__info` and
  `mg-snackbar__content` classes no longer style the notification.
- Existing buttons, tags, header and footer use their published CSS contracts;
  sidebar, map geometry, story steps and charts remain local. Preview access
  uses the published component described below.

Sources: [Mangrove guide](https://mangrove.undrr.org/llms.txt),
[component index](https://mangrove.undrr.org/ai-components/index.json) and the
[pinned stylesheet](https://assets.undrr.org/mangrove/2.3.0/css/style.css).

## Guidance follow-up

The November upgrade also checks the [theme dictionary](https://mangrove.undrr.org/tokens.json),
[utility inventory](https://mangrove.undrr.org/ai-components/utilities.json),
[icon inventory](https://mangrove.undrr.org/ai-components/components-icons.json),
[asset-library guide](https://assets.undrr.org/AGENTS.md) and
[editorial manual](https://mangrove.undrr.org/llms-editorial-manual.txt).

- Shell interactive, white surface and border colours use sRGB channel tokens
  inside `rgb(...)`; their declarations were verified in the 2.3.0 stylesheet.
  Preview-access stacking and isolation are owned by the library component.
- Map toolbar and metadata actions use the published Buttons `mg-icon-button`
  contract with verified `mg-icon-*` masks, accessible names and 44px targets.
  A 420px mobile map minimum accommodates the taller toolbar. Map behaviour
  and arrangement remain application-specific.
- Code-font counters use tabular numerals to avoid shifting as values change.
- Static application headings use sentence case, including "DRR views" and
  "About this project". Source-authored dataset titles are retained.
- Drupal page building, search configuration, publication/news recipes and
  taxonomy assignment do not apply to this standalone demo update.

## Published preview-access gate

Each page declares `[data-mg-preview-access]` with the shared ID `mapx-demo-embed`,
PIN `5498` and `data-mg-preview-persist="local"`, then loads
`https://assets.undrr.org/mangrove/2.3.0/js/preview-access.js` as a module.
The [PreviewAccess contract](https://mangrove.undrr.org/ai-components/components-preview-access.json)
is verified against that published script and the matching CSS.

The library owns rendering, form submission, errors, focus, background `inert`
state, anti-flash CSS and persisted unlocks. The custom `pin-gate.js` and its
styles are removed. Unlock requires submitting the form rather than typing
four digits alone. Existing users unlock once again; the old `mapx-demo-pin`
entry is not used by the new component.

The local unlock is stored by Mangrove under `mg-preview-access:mapx-demo-embed`.
Browser tests that need access without testing the gate seed the documented
session flag (`unlocked`) under the same key. Dedicated browser tests use the
real published module to verify the locked state on all five pages, error and
focus behaviour, and persistence across reloads and tabs. This remains an
editorial preview signal, not authentication.

## Repo positioning

- This repo is a PoC, not production. Decision pending on whether to archive it once `mapx-llm-skills` fully supersedes it (audit issue #3).
- If you're documenting a new SDK quirk, the skills repo is the better long-term home; this one is more for live demonstration.

---

Add new lessons as you find them. Cite a commit, PR, or upstream issue when possible.
