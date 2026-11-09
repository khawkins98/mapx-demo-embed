# Integration decisions and investigation record

For current setup and implementation contracts, use the
[integration guide](docs/integration.md). The [methodology record](methodology.md)
preserves the original experiments, including superseding notes where an old
explanation no longer applies.

## Findings from the May 2026 audit

The original investigation found that adding story views from a different
project could fail silently. This led to the separate HOME-project iframe used
for story playback, while regular layers remain in Eco-DRR. There is no startup
catalogue validation in the demo.

Some older SDK resolver failures also left requests pending. This explains the
historical timeout workarounds; it is not a guarantee about how later releases
handle errors. The current guide describes the checked SDK version and error path.

The iframe bridge cannot serialize callbacks. Passthrough overlays therefore
keep their data in a local registry for coordinate matching. Waiting for map
idle before analysis queries also emerged from the early experiments.

## November 2026 compatibility update

MapX 1.14.3 and Mangrove 2.3.0 were checked on 9 November 2026. Feature inspection
moved from `click_attributes` to grouped `click_features` results. The Manager
continues to follow the same host as the embedded app to avoid version drift.
The custom PIN gate was replaced with Mangrove PreviewAccess.

These choices draw on `undrr-risk-resilience-maps-pw`, particularly its
`src/sdk/client.js`, `src/sdk/inspect.js` and `src/sdk/availability.js`, as well as
the published MapX and Mangrove contracts linked from the integration guide.

## Where new findings belong

Keep changes to this demo's integration in the integration guide. Record a dated
experiment here or in the methodology record when its conditions and outcome
matter. General SDK discoveries belong in
[mapx-llm-skills](https://github.com/khawkins98/mapx-llm-skills).
[Audit issue #3](https://github.com/khawkins98/mapx-demo-embed/issues/3) tracks
broader production gaps and the project's positioning as an investigation PoC.
