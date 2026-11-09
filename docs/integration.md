# Integration guide

Use this guide when changing an embed, adding a layer or diagnosing an SDK call.
[README](../README.md#run-locally) covers setup and demo routes. Source wrappers
under [`src/sdk/`](../src/sdk/) define the calls used by the application;
[`package.json`](../package.json) and its lockfile define the Node toolchain.

## Connect to MapX

The regular layer list belongs to the Eco-DRR project
`MX-2LD-FBB-58N-ROK-8RH`. [`src/sdk/client.js`](../src/sdk/client.js) creates the
Manager; use its `ready` event before issuing map operations. Set `iframeTitle`
on each Manager so its embedded map has an accessible name.

The hosted SDK was checked against **MapX 1.14.3 on 9 November 2026**. Load the
Manager from `https://app.mapx.org/sdk/mxsdk.umd.js` and the iframe app from the
same host. Pinning only the npm Manager can produce `err_version_mismatch` when
the hosted app changes. The kitchen-sink log reports the Manager's runtime
`version`; see [upstream #1107](https://github.com/unep-grid/mapx/issues/1107).

The [curated catalogue](../src/config/views.js) supplies layer IDs, labels and
types. To inspect another project's catalogue, run the dev server and open
`http://localhost:3001/mapx-demo-embed/probe-views.html`. This utility is not a
production-build entry point. Change the port if Vite printed a different one.

The kitchen-sink story examples belong to HOME, not Eco-DRR. Story playback
therefore uses a second iframe with its own project and view; closing it returns
to the main map. The [original investigation](../methodology.md#8-story-map-cross-project-limitation)
records the cross-project failures that led to this choice. The app does not
validate the remote catalogue at startup.

## Add overlays and inspect clicks

| Approach | Use it for | Local module |
| --- | --- | --- |
| SDK GeoJSON view | Points with MapX view integration | [Custom data](../src/ui/custom-data.js) |
| Mapbox passthrough | Advanced source/layer styling and polygons | [Map layer wrappers](../src/sdk/map-layers.js) |

Passthrough calls cross the iframe's `postMessage` bridge. Functions and DOM
nodes cannot be passed as callbacks. Import named wrappers such as
`addSource`, `addLayer`, `queryRenderedFeatures` and `unproject`; `mapMethod` is
private. For example, `queryRenderedFeatures()` sends an empty argument array
for a viewport query, while `queryRenderedFeatures(geometry)` sends `[geometry]`.
The helper normalizes omitted argument lists to `[]`. Arrays are truthy in
JavaScript; the old contrary diagnosis is corrected in the
[investigation record](../methodology.md#viewport-query-correction).

MapX 1.14.2 and later emit one `click_features` result per click:

```js
{ attributes: { "view-id": [{ name: "Example site" }] }, lngLat, point }
```

The [infobox](../src/ui/infobox.js) selects the first hit from the grouped rows.
An empty hit closes it unless the click matches a registered local feature.
For passthrough layers, [local coordinate matching](../src/lib/geo.js) finds
nearby points or containing polygons from the
[GeoJSON registry](../src/state/store.js). Register a dataset when adding it and
unregister it when removing it so old features do not remain clickable.
See [upstream #1139](https://github.com/unep-grid/mapx/issues/1139) and the
[MapX 1.14.3 event source](https://github.com/unep-grid/mapx/blob/1.14.3/app/src/js/map_helpers/click_features.js).

## Use the analysis tools

Select a layer in the kitchen-sink **Active View** dropdown, or use the Explorer
presets. Capabilities depend on the source:

| Tool | Supported path |
| --- | --- |
| Numeric filter | SDK numeric filtering for vector tiles; visual filtering for SDK GeoJSON point views |
| Spatial query | Rendered vector features, including local overlays that are rendered, using viewport, box or polygon selection |
| Statistics | SDK summaries for vector tiles; local aggregation for registered GeoJSON |
| GeoJSON export | Local registry data exports directly; SDK export is attempted for GeoJSON and vector views when the response contains valid GeoJSON. Raster and custom-coded views are blocked |

The [analysis modules](../src/ui/analysis/) implement these branches. Numeric
field/range discovery also reads other registry entries, but its visual filter
uses circle paint through the GeoJSON-view styling resolver. Filtering
passthrough source IDs or polygon fills is not implemented by that path. Spatial
queries use rendered features, not an independent raw-registry query. Polygon
selection checks a point or first vertex and retains unknown geometries; it is
a demo approximation, not full geometry intersection. Numeric
range discovery and SDK statistics wait for `map_wait_idle()` before querying.
Await SDK requests and handle failures: older releases could leave a request
pending; the checked 1.14.3 bridge supports structured resolver errors and
request timeouts. For more failure modes, use the SDK skills repo's
[troubleshooting guide](https://github.com/khawkins98/mapx-llm-skills/blob/main/skills/mapx-sdk-dev/troubleshooting.md).

The SDK uses transparency from 0 to 100, with 0 fully opaque. The UI displays
opacity as `100 - transparency`; a transparency of 1 means 99% opacity, not a
normalized value on a 0–1 scale.

## Map SDK calls to wrappers

| Resolver | Wrapper or consumer |
| --- | --- |
| `view_add`, `view_remove` | [`views.js`](../src/sdk/views.js) |
| `map_fly_to`, `map_get_zoom`, `map_wait_idle` | [`map-control.js`](../src/sdk/map-control.js) |
| Text/numeric filters and layer transparency | [`filters.js`](../src/sdk/filters.js) |
| Source schema, summaries and GeoJSON download | [`data-query.js`](../src/sdk/data-query.js) |
| Language, theme, dashboard, composer and share controls | [`ui.js`](../src/sdk/ui.js) |

## Use Mangrove and preview access

Every page pins CSS and preview-access JavaScript to
`https://assets.undrr.org/mangrove/2.3.0/`. Consult the
[Mangrove guide](https://mangrove.undrr.org/llms.txt),
[component index](https://mangrove.undrr.org/ai-components/index.json),
[asset guidance](https://assets.undrr.org/AGENTS.md) and
[editorial manual](https://mangrove.undrr.org/llms-editorial-manual.txt) before
changing markup or copy. Verify a component's contract in the pinned assets;
current documentation can describe a later release.

- Channel tokens require `rgb(var(--mg-color-interactive))`; complete colour
  expressions are used directly. Check the [token dictionary](https://mangrove.undrr.org/tokens.json)
  and component properties rather than guessing from names.
- Use the published font roles, `mg-icon-button` and verified `mg-icon-*` masks.
  Local toolbar/metadata controls have 44px targets; `mg-range` inputs have
  associated labels. The rem base is 16px.
- The header uses the canonical logo URL with `mg-logo mg-logo--autocrop`.
  Static application headings use sentence case; source dataset titles and
  scientific legend colours retain their source values.
- Toasts use `mg-notice mg-snackbar` with `role="status"`. The library Snackbar
  controller requires React, so this vanilla demo owns the auto-dismiss timer.
  Old `mg-snackbar__info` and `mg-snackbar__content` classes are obsolete.

Each page declares `[data-mg-preview-access]` with ID `mapx-demo-embed`, PIN `5498`
and `data-mg-preview-persist="local"`, then loads `js/preview-access.js` as a
module. The [PreviewAccess contract](https://mangrove.undrr.org/ai-components/components-preview-access.json)
owns the dialog, errors, background isolation, anti-flash CSS, focus and storage.
The PIN is a preview signal rather than authentication. Changing from the old
custom gate requires one fresh unlock; the old `mapx-demo-pin` key is not read.

Mangrove stores the local unlock under `mg-preview-access:mapx-demo-embed`.
Browser tests that need to bypass the gate seed the documented session flag
`unlocked` under that key. The dedicated PreviewAccess tests use the real
published module to check all locked pages, PIN errors, focus and persistence
across reloads and tabs. Both the app and these checks need the remote assets.

## Related references

- [MapX SDK source and examples](https://github.com/unep-grid/mapx/tree/master/app/src/js/sdk)
- [SDK skills and deeper limitations](https://github.com/khawkins98/mapx-llm-skills)
