# Learnings

Hard-won lessons from building this MapX embed proof of concept. Captured during the 2026-05 audit sweep — pull more in over time.

The deeper SDK reference lives in the [mapx-llm-skills](https://github.com/khawkins98/mapx-llm-skills) repo (especially `skills/mapx-sdk-dev/limitations-and-workarounds.md`). This file captures lessons specifically relevant to *this* embed PoC.

## The MapX SDK fails silently in important places

- `view_add` fails silently for views that aren't part of the connected MapX project — there's no error, no rejected promise, no network request. If a view doesn't appear, the first thing to check is whether the view ID belongs to the project the SDK is connected to.
- Validation logic enforces the single-project constraint at startup. Building a sister project's view into the demo means switching projects, not mixing them.
- `get_view_source_summary` can hang forever on certain failures because the FrameManager never rejects on resolver failure. Wrap calls with a timeout.

The skills repo's `troubleshooting.md` lists the full set of silent-failure resolvers.

## `map_wait_idle()` is the bottleneck people miss

Dashboard, filter, and data operations must wait for `map_wait_idle()`. If you call them too early they fail without a clear error. Build the wait into shared helpers rather than sprinkling it case by case.

## postMessage bridge can't carry callbacks

The SDK's bridge can't pass functions or DOM elements. Click interaction on custom layers needs a coordinate-matching workaround on the embed side. If a SDK pattern in some old wiki example expects a callback, it's outdated.

## CDN URL is unpinned

The SDK is loaded from `app.mapx.org/sdk/mxsdk.umd.js` with no version tag. That's a known compat risk and is tracked in audit issue #3. A future hardening would pin a major version or document a compat window. Keep this in mind when something breaks unexpectedly.

## Mangrove styling notes

- Mangrove 1.4.0 changed the rem base to 16px — recalibrate values when bumping.
- Demo metadata duplication is real: each demo page repeats ~5KB of CSS+JS. Audit issue #3 tracks extracting a shared template.

## Repo positioning

- This repo is a PoC, not production. Decision pending on whether to archive it once `mapx-llm-skills` fully supersedes it (audit issue #3).
- If you're documenting a new SDK quirk, the skills repo is the better long-term home; this one is more for live demonstration.

---

Add new lessons as you find them. Cite a commit, PR, or upstream issue when possible.
