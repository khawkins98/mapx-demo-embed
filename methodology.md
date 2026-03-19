# Methodology: Discovering MapX Views and Data Sources

The demo views and project configuration had to be discovered manually because
MapX does not expose a public unauthenticated search API. Here is what we did.

## 1. SDK documentation review

The MapX SDK source at https://github.com/unep-grid/mapx/tree/master/app/src/js/sdk
was cloned and reviewed. This provided:

- The UMD script URL (`https://app.mapx.org/sdk/mxsdk.umd.js`)
- The `Manager` constructor pattern and configuration options
- The full list of `mapx.ask()` resolver methods (view_add, view_remove, map_fly_to, etc.)
- Several example view IDs used in documentation and test files
- Known project IDs referenced in dev/test configurations

## 2. API exploration (blocked)

Several MapX API endpoint patterns were tested:

- `app.mapx.org/api/views/search?search=...` — 404
- `app.mapx.org/api/get/views/list/public?idProject=...` — 404
- `app.mapx.org/api/get/view/metadata?idView=...` — 404
- `search.mapx.org/indexes/views_catalog/search` — 401 (requires API key)

The MapX API requires authenticated tokens (`idUser`, `idProject`, `token`) for all
view listing and search operations. There is no public REST endpoint for catalog
search. See https://github.com/unep-grid/mapx/discussions/662 for the ongoing
discussion about a formal public API.

## 3. SDK-based view probe (what worked)

Since the API is auth-gated, a probe page (`probe-views.html`) was built that uses
the SDK itself to enumerate views. It connects to MapX projects via hidden iframes
and calls `mapx.ask("get_views")` to dump the full catalog.

Three projects were probed:

| Project ID | Name | Views found |
|---|---|---|
| `MX-Z5J-4IZ-RM2-3O9-506` | Training Project | 22 |
| `MX-2LD-FBB-58N-ROK-8RH` | Eco-DRR Geospatial datasets | 85 |
| `MX-YBJ-YYF-08R-UUR-QW6` | MapX Default/HOME | 22 |

The probe returned each view's ID, type code, English title, and description.

### MapX view type codes

| Code | Meaning | Example |
|---|---|---|
| `vt` | Vector tiles — polygons, lines, points | Country-level indicators, admin boundaries |
| `rt` | Raster tiles — gridded/continuous data | Hazard maps, population grids, satellite imagery |
| `cc` | Custom coded — dynamic/real-time views | Live earthquake feed, animated emissions |
| `sm` | Story map — narrative presentation | Guided walkthroughs with map steps |

## 4. Project selection

The **Eco-DRR project** (`MX-2LD-FBB-58N-ROK-8RH`) was the natural fit as the primary
project -- it has 85 views focused on disaster risk reduction, covering:

- Multi-hazard exposure and frequency layers (flood, cyclone, tsunami, landslide)
- Ecosystem-based DRR solution layers (forest protection/restoration, mangrove, coral reef, seagrass)
- Ecosystem distribution baselines (forests, mangroves, coral reefs, seagrass)
- Population and protected area layers

## 5. View curation

From the 85 available Eco-DRR views (plus shared HOME project views), 11 were
selected to demonstrate breadth across data types and DRR themes:

### Real-time / points (cc)

| View ID | Title | Why selected |
|---|---|---|
| `MX-YLZJG-JAIID-V27X5` | Earthquakes Mag >= 5.5: Past 30 Days (USGS) | Live point data, updates every 15 min |

### Raster hazard layers (rt)

| View ID | Title | Why selected |
|---|---|---|
| `MX-V07LO-829XA-4BIZ8` | Flood Hazard 25 Years | Core hazard — river flood return period |
| `MX-04E66-2E550-81068` | Landslide Exposure | Composite earthquake + precipitation trigger |
| `MX-10AE5-746D1-76777` | Tropical Cyclone Exposure | Wind speed probability model |
| `MX-F0DEE-12D97-6447B` | Tsunami Exposure | Modeled annual physical exposure |
| `MX-6YLMU-U4WXC-2JJD7` | Population Distribution (HRSL 2022) | Exposure baseline — who is at risk |

### Eco-DRR solution layers (rt)

| View ID | Title | Why selected |
|---|---|---|
| `MX-DC56E-6ABC9-3C768` | Forest Protection — Flood Risk | Nature-based solution, shows opportunity areas |
| `MX-559C5-58858-96A69` | Mangrove Restoration — Cyclone Surge | Coastal NbS, complements forest layer |

### Vector polygon layers (vt)

| View ID | Title | Why selected |
|---|---|---|
| `MX-1L2TA-6FXPV-N3QMX` | Projected Water Stress Change (RCP8.5) 2030 | Forward-looking climate projection |
| `MX-OU7NG-ZNZGA-ZX3K0` | Active Fires Assessment (Admin Level 1) | Admin-level polygons with dashboards |
| `MX-FX1HT-Z7KXL-8X22K` | Intact Forest Landscapes | Ecosystem polygons — large intact areas |

### Selection criteria

- **Domain relevance**: all views relate to hazards, exposure, resilience, or nature-based solutions
- **Type diversity**: mix of raster (rt), vector (vt), and live/dynamic (cc) layers
- **Hazard breadth**: flood, earthquake, cyclone, tsunami, landslide, fire, drought/water stress
- **Solution layers**: forest and mangrove eco-DRR options show actionable interventions
- **Visual variety**: gridded heatmaps, country polygons, real-time dots, ecosystem boundaries

## 6. Region presets

Fly-to presets were chosen for regions with high DRR relevance:

| Region | Center | Zoom | Rationale |
|---|---|---|---|
| Caribbean | -72, 18 | 5.5 | Hurricane corridor, coral/mangrove coastlines |
| Southeast Asia | 110, 5 | 4.5 | Tsunami, cyclone, flood, and landslide hotspot |
| East Africa | 37, 0 | 4.5 | Flood, landslide, drought exposure |
| Pacific Islands | 170, -10 | 4.0 | Cyclone, tsunami, coastal erosion |

## 7. Styling

The UNDRR Mangrove component library (v1.3.3) was used for UI consistency:

- CDN: `https://assets.undrr.org/static/mangrove/1.3.3/css/style.css`
- Source: https://github.com/unisdr/undrr-mangrove
- The Mangrove repo was temporarily cloned to `/tmp/undrr-mangrove` to review SCSS
  source, verify available CSS classes, and compile a local build for testing before
  switching to the CDN version.

Classes used: `mg-button`, `mg-button-primary`, `mg-button-secondary`, `mg-tag`,
`mg-tag--outline`, `mg-tag--accent`, `mg-tag--secondary`, `mg-form-help`,
`mg-page-header__decoration`, `mg-table`, `mg-table--striped`, `mg-table--border`.

## 8. Story map cross-project limitation

### The problem

Story maps (type `sm`) are narrative map presentations built into MapX. The
natural way to play them via the SDK is:

```js
await mapx.ask("view_add", { idView: "MX-5BWRN-RBB0W-ZAXRA" });
```

This works when the story map belongs to the project the SDK is connected to.
The Eco-DRR project (`MX-2LD-FBB-58N-ROK-8RH`) contains 85 views but
**zero story maps**. The story maps we wanted to demo are in the HOME project
(`MX-YBJ-YYF-08R-UUR-QW6`).

### What we tried

1. **`view_add` with cross-project view IDs** — the call returns without error,
   but nothing happens. No network requests fire, no error is thrown, and the
   story map does not start. The MapX app inside the SDK iframe only resolves
   views from its currently loaded project. Cross-project view references are
   silently ignored.

2. **`set_panel_left_visibility` before `view_add`** — we hypothesised that the
   story map player needed the left panel visible (since we init with
   `closePanels: true`). Opening the panel first made no difference — the
   underlying issue is project scope, not panel visibility.

3. **Opening in a new browser tab** — works, but breaks the on-page experience.
   The user leaves the demo page entirely.

### The workaround

We overlay a second iframe on top of the map area that loads the MapX app
directly from the HOME project with `?storyAutoStart=true`:

```
https://app.mapx.org/?project=MX-YBJ-YYF-08R-UUR-QW6&views=MX-5BWRN-RBB0W-ZAXRA&storyAutoStart=true&language=en
```

A "Close Story Map" button is positioned over the overlay to dismiss it and
return to the SDK-controlled map underneath (which keeps its state).

### Trade-offs

- Loads a full second MapX instance (additional memory and network)
- The story map runs independently — not controllable via the SDK
- The SDK map pauses rendering but preserves all view/filter state

### When this workaround is NOT needed

If your project contains its own story maps, `view_add` works seamlessly:

```js
// This works if "MX-XXXXX" is a story map in the current project
await mapx.ask("view_add", { idView: "MX-XXXXX" });
```

Use `probe-views.html` to check — look for views with type `sm` in your project.

### Potential alternatives not yet explored

- **`set_project`** — the SDK has a `set_project({idProject})` method that
  switches the loaded project. This could theoretically switch to the HOME
  project, play the story map, then switch back. The downside is that this
  reloads the entire MapX app state, so you lose all current views/filters.
- **Requesting story maps be added to the Eco-DRR project** — the cleanest
  solution if working with the MapX data administrators.

## 9. Custom data overlays

### The problem

The curated MapX views (sections 4-5) are published datasets hosted on the MapX
platform. In practice, you will often want to overlay your own data -- field
office locations, monitoring stations, project boundaries -- on top of the MapX
basemap and its layers. The SDK provides two distinct mechanisms for
this, plus a hybrid approach for polygon overlays.

### Approach A: GeoJSON view (`view_geojson_create`)

The SDK method `view_geojson_create` registers a first-class MapX view from a
GeoJSON FeatureCollection. Because it goes through the MapX view system, the
resulting layer gets:

- An entry in the view list panel
- Native click interaction via the `click_attributes` event
- Style control (color, size, opacity) through the SDK

```js
await mapx.ask("view_geojson_create", {
  idView: "custom-offices",
  title: "DRR Field Offices",
  data: featureCollection,
  style: {
    color: "#e74c3c",
    size: 8,
    opacity: 0.9
  }
});
```

When a user clicks a feature in this layer, MapX fires the `click_attributes`
event with the feature's properties attached at `data.attributes[0]`. This is
the most straightforward way to get interactive point overlays working.

### Approach B: Mapbox passthrough (`map` method)

The SDK exposes the underlying Mapbox GL JS instance through the `map` resolver.
You can call any Mapbox method — `addSource`, `addLayer`, `setPaintProperty`,
etc. — by passing the method name and arguments:

```js
await mapx.ask("map", {
  method: "addSource",
  args: ["monitoring-stations", {
    type: "geojson",
    data: featureCollection
  }]
});

await mapx.ask("map", {
  method: "addLayer",
  args: [{
    id: "monitoring-stations-layer",
    type: "circle",
    source: "monitoring-stations",
    paint: {
      "circle-radius": 6,
      "circle-color": "#2ecc71"
    }
  }]
});
```

This gives full Mapbox styling power (data-driven paint expressions, zoom
interpolation, heatmaps, 3D extrusions, etc.) but comes with a notable limitation:
**the layer has no click handler**. Mapbox GL normally supports `map.on("click",
layerId, callback)`, but the SDK's `map` passthrough only accepts serializable
arguments. Callbacks (functions) cannot be serialized through `postMessage`, so
there is no way to attach a native click handler to a passthrough layer.

### Approach C: Polygon overlays

For polygon data (project zones, administrative boundaries), the `map`
passthrough is used with `fill` and `line` layer types:

```js
await mapx.ask("map", {
  method: "addLayer",
  args: [{
    id: "project-zones-fill",
    type: "fill",
    source: "project-zones",
    paint: {
      "fill-color": "#3498db",
      "fill-opacity": 0.25
    }
  }]
});
```

Polygon overlays share the same click limitation as Approach B — no native
interaction through the passthrough. The coordinate matching fallback (below)
uses a different algorithm for polygons than for points.

### Click interaction and the coordinate matching fallback

For GeoJSON views (Approach A), click interaction is straightforward:

```js
mapx.on("click_attributes", {
  callback: function(data) {
    const attrs = data.attributes[0];
    showInfoBox(attrs.name, attrs.description, attrs.status);
  }
});
```

The `click_attributes` event fires with `data.attributes` containing an array of
objects, where each object holds the properties of a clicked feature. The first
element (`data.attributes[0]`) is the topmost feature under the click.

For Mapbox passthrough layers (Approaches B and C), this event does **not** fire.
To provide click interaction on passthrough layers, a coordinate matching
fallback was implemented:

1. **Register GeoJSON data locally.** When overlay data is added via the `map`
   passthrough, the same FeatureCollection is also stored in a local JavaScript
   variable in the parent page.

2. **Listen for map clicks.** The `click_attributes` event is still registered,
   but a secondary listener watches for click coordinates (available even when
   no MapX feature is hit).

3. **Nearest-point matching (for point layers).** When a click occurs and no
   `click_attributes` data is returned, the parent page iterates over the
   locally stored point features and finds the nearest one using Euclidean
   distance on longitude/latitude. A tolerance of **0.5 degrees** is applied —
   if no point is within this radius, the click is ignored. This tolerance is
   fairly generous so that it works across different zoom levels.

4. **Ray-casting point-in-polygon (for polygon layers).** For polygon overlays,
   the fallback uses a ray-casting algorithm to determine whether the click
   coordinate falls inside any of the locally stored polygons. The algorithm
   casts a horizontal ray from the click point and counts how many polygon edges
   it crosses — an odd count means the point is inside.

### Infobox and toast notification pattern

When a feature is identified (either through `click_attributes` or coordinate
matching), the demo displays feature information using a custom UI panel in the
parent page — not inside the MapX iframe:

- **Infobox panel**: a styled card positioned over the map showing the feature's
  properties (name, type, status, description). This is built from the
  properties in `data.attributes[0]` for GeoJSON views, or from the locally
  matched feature's properties for passthrough layers.

- **Toast notification**: a brief notification confirming the click was
  registered, shown at the top of the page.

Both are regular DOM elements in the parent page, styled with Mangrove classes.
They live outside the MapX iframe -- injecting them into the iframe would break
cross-origin restrictions.

### Sample data

All overlay data used in the demo is **fictional** and created solely for
demonstration purposes:

| Dataset | Type | Features | Description |
|---|---|---|---|
| DRR Field Offices | Points | 5 | Fictional UN field office locations |
| Monitoring Stations | Points | 4 | Fictional environmental monitoring sites |
| Project Zones | Polygons | 3 | Fictional DRR project intervention areas |

The coordinates are placed in regions covered by the curated MapX layers
(Caribbean, Southeast Asia, East Africa) so that overlay data can be viewed
alongside the real hazard and ecosystem layers.

### Trade-offs between the approaches

| Aspect | GeoJSON view (A) | Mapbox passthrough (B/C) |
|---|---|---|
| Click interaction | Native — `click_attributes` fires automatically | Requires coordinate matching fallback |
| Styling flexibility | Limited to SDK style options (color, size, opacity) | Full Mapbox GL paint/layout expressions |
| View list integration | Appears in the MapX panel as a toggleable view | Invisible to the MapX view system |
| Layer ordering | Managed by MapX — may be reordered by MapX internals | Explicit — you control z-order via `addLayer` |
| Polygon support | Supported but styling is basic | Full fill, line, and extrusion support |
| Data-driven styling | Not available | Fully supported (color by attribute, zoom interpolation) |
| Removal | `view_remove` by view ID | Must call `map` with `removeLayer` and `removeSource` |
| Complexity | Low — single SDK call | Higher — multiple calls, local data management, fallback logic |

In general, GeoJSON views (Approach A) are the easier path when you need click
interaction and simple styling. The Mapbox passthrough (Approach B/C) makes more
sense for advanced styling or for overlays that are purely visual. If you need
interactive polygon overlays with advanced styling, the passthrough plus
coordinate matching fallback is the way to go, though it does add complexity.

## 10. Analysis tools

### What we built

Four lightweight analysis tools that run in the parent page and operate on
whichever MapX or custom layer the user selects from a dropdown:

| Tool | SDK methods used | View type requirement |
|---|---|---|
| Numeric Range Filter | `get_view_table_attribute_config`, `get_view_source_summary`, `set_view_layer_filter_numeric` | `vt` only |
| Spatial Query | `map({method: "queryRenderedFeatures"})`, `map({method: "project"})` | Any |
| Feature Statistics | `get_view_source_summary`, `get_view_table_attribute_config` | `vt` (local compute for GeoJSON) |
| Data Export | `download_view_source_geojson` | GeoJSON views only |

### Floating panel

The analysis tools live in a floating panel that overlays the map area rather
than in the sidebar. This was changed because the sidebar's fixed width (320px)
made results tables and sample data difficult to read, especially for the
spatial query tool which can return many features.

The panel is:
- **Draggable** — grab the header bar to reposition it over the map
- **Resizable** — grab the bottom-right corner handle
- **Toggled** from the sidebar via the "Open Analysis Panel" button
- Positioned at `z-index: 14`, above the map iframe but below the infobox (15)
  and story map overlay (20)

### Active view selector

A `<select>` dropdown lists all currently open views (both curated MapX views
and custom GeoJSON overlays). It is rebuilt whenever views are added or removed.
Tools 1, 3, and 4 pass the selected view ID to SDK methods that require `idView`.

When a raster (`rt`) or custom-coded (`cc`) view is selected, an orange notice
banner appears and the incompatible tools (numeric filter, spatial query, data
export) are visually disabled. This is because raster layers don't have
attribute tables or discrete queryable features.

### Numeric range filter

Discovers a vector view's attribute columns via `get_view_table_attribute_config`,
fetches min/max ranges from `get_view_source_summary`, then applies a numeric
range filter via `set_view_layer_filter_numeric({idView, attribute, from, to})`.

Key findings:
- Only works on `vt` (vector tile) views — raster and custom-coded views
  don't have queryable attribute tables
- Use `from`/`to` params, not the deprecated `value` array
- Pass `from: null, to: null` to clear the filter
- `get_view_source_summary` requires `map_wait_idle()` first to avoid
  getting stale or empty results

### Spatial query and the `toggle_draw_mode` problem

The SDK docs and some wiki examples reference `toggle_draw_mode` for drawing
shapes on the map. This method **does not exist** in the current SDK version.
Calling it throws an "unknown resolver" error.

#### First attempt: `click_attributes` interception

The initial workaround intercepted `click_attributes` events to capture two
click coordinates. This worked functionally but had poor UX — no crosshair
cursor, no visual rectangle while selecting, and no visual feedback on the map
about what area was being selected.

#### Current approach: transparent overlay

The working approach uses a transparent overlay div positioned over the map
container during box select mode:

1. User clicks "Box Select" — a transparent overlay is created over the map
   with `cursor: crosshair`
2. **Drag passthrough** — the overlay distinguishes clicks from drags by
   measuring mouse movement between mousedown and mouseup. If movement exceeds
   5px, pointer-events are temporarily disabled so the iframe receives the drag
   for panning. Wheel events are also passed through for zoom.
3. **Click 1** — stores pixel coordinates and adds a visual corner marker dot
4. **Mousemove** — draws a live-updating dashed rectangle from corner 1 to
   the current mouse position (pure DOM, no async calls)
5. **Click 2** — finalises the rectangle, adds a second corner marker
6. The overlay is removed and the pixel bounding box is passed to
   `queryRenderedFeatures`
7. Both pixel corners are unprojected to geographic coordinates via
   `map({method: "unproject"})`, and a highlight polygon is drawn on the map
   via the Mapbox passthrough so the selection area persists through zoom/pan

**Why the overlay approach works:** The overlay div and the `#mapx` iframe are
both positioned with `inset: 0` within the same parent (`.app-map`), so pixel
coordinates from click events on the overlay correspond directly to map canvas
pixel coordinates. No projection/unprojection is needed for the
`queryRenderedFeatures` call — only for drawing the geographic highlight
polygon afterward.

The "Query Viewport" sub-tool is simpler — it calls `queryRenderedFeatures`
with no geometry argument to get everything currently rendered on screen.

#### Polygon select

The polygon select tool extends the box select approach to arbitrary polygons:

1. The user clicks multiple points to define polygon vertices
2. An SVG overlay draws the polygon outline and a rubber-band line in real-time
3. Double-click (or clicking near the first vertex) closes the polygon
4. The polygon's bounding box is used for `queryRenderedFeatures`
5. Results are **post-filtered client-side** using the existing `pointInPolygon()`
   function — only features whose representative point falls inside the drawn
   polygon are kept in the final results
6. A geographic highlight polygon is drawn on the map via Mapbox passthrough

The post-filtering step is necessary because `queryRenderedFeatures` only
accepts rectangular bounding boxes, not arbitrary polygons. The bounding box
query returns a superset of the actual results, and the polygon containment
test narrows it down. For polygon-type features, the first coordinate of the
outer ring is used as the representative point (a simplification, but adequate
for a demo).

#### Feature highlighting

After a spatial query completes, the matched features are highlighted on the
map using a temporary Mapbox source and layers added via the passthrough. The
highlight uses amber/gold (`#f39c12`) styling so it stands out against both the
blue box select boundary and the purple polygon select boundary:

- Polygon features get a semi-transparent fill with a solid outline
- Line features get a thick stroke
- Point features get circles with white borders

The highlight layers are added alongside the selection boundary (box or polygon)
so the user can see both the area they selected and the features within it.
Starting a new query or clicking "Clear Selection" removes all highlights and
boundaries.

The highlight source (`query-result-highlight`) uses geometry from the
`queryRenderedFeatures` results, which include GeoJSON geometry for each
feature serialized through `postMessage`. Features without valid geometry are
skipped. Separate Mapbox layer types (`fill`, `line`, `circle`) with geometry
type filters (`["==", "$type", "Polygon"]` etc.) handle the different feature
types in a single source.

#### Selection lifecycle and cleanup

Starting a new selection (box or polygon) automatically clears the previous
one — including the selection boundary, feature highlights, and results panel.
All three Mapbox source/layer groups use fixed IDs so they can be reliably
cleaned up:

| Group | Source ID | Layer IDs |
|---|---|---|
| Box boundary | `box-select-bbox` | `box-select-bbox-fill`, `box-select-bbox-line` |
| Polygon boundary | `polygon-select-area` | `polygon-select-fill`, `polygon-select-line` |
| Feature highlights | `query-result-highlight` | `query-highlight-fill`, `query-highlight-outline`, `query-highlight-line`, `query-highlight-circle` |

Cleanup calls `removeLayer` then `removeSource` via the SDK passthrough,
swallowing errors for layers/sources that don't exist. The `getLayer`/`getSource`
pre-check approach was abandoned because the serialized return values through
`postMessage` were unreliable — sometimes returning truthy objects for
non-existent layers.

Important considerations:
- `queryRenderedFeatures` returns features serialized through `postMessage`,
  so very large result sets may be slow or truncated
- The results include features from **all** rendered layers, not just the
  selected view — results are grouped by layer in the UI
- **Raster layers are not queryable** — `queryRenderedFeatures` only returns
  vector features (points, lines, polygons from vt views and GeoJSON overlays).
  Raster (rt) and custom-coded (cc) views don't have discrete features to query.

### Feature statistics

For MapX vector views, calls `get_view_source_summary({idView, idAttr,
stats: ["base", "attributes"]})` which returns count, min/max, mean, and
category distributions depending on the attribute type.

For custom GeoJSON overlays (created via `view_geojson_create`), the SDK
summary methods may not return useful data because the view was created
dynamically. Instead, statistics are computed locally from the parent page's
`customGeoJSONRegistry`, which stores a copy of the GeoJSON data. Local
computation handles both numeric attributes (min/max/mean) and categorical
text (frequency counts).

### Data export

`download_view_source_geojson({idView, mode: "data"})` returns a GeoJSON
FeatureCollection for views that support it. The parent page creates a Blob
and triggers a file download via a temporary `<a>` element.

Limitations:
- Only works for GeoJSON views created via `view_geojson_create`
- Native MapX views (vector tiles, raster tiles) cannot be bulk-exported
  this way — they are served as tiled data, not downloadable files
- For custom overlays stored in the `customGeoJSONRegistry`, the local
  copy is exported directly without making an SDK call

## 11. UX improvements — collapsible sidebar and floating controls

### The problem

The sidebar contained ~2000px of content in ~675px of visible space. Bottom
sections (SDK Features, Custom Data) were buried below the fold. Map controls
(zoom, globe, terrain, etc.) required scrolling the sidebar to reach them.

### Collapsible sections

All sidebar sections are wrapped in native `<details>/<summary>` elements.
Only "DRR Views" is open by default. This solves the vertical scrolling
problem with zero JavaScript — the browser handles expand/collapse natively.

Custom CSS removes the default disclosure triangle and replaces it with a
`▸`/`▾` marker that's more consistent with the Mangrove design language.

### Floating map controls toolbar

Zoom, globe, terrain, 3D, aerial, and immersive buttons were moved from the
sidebar into a compact vertical icon bar pinned to the bottom-left of the
map area (above the coordinate bar). This keeps map controls visible regardless
of sidebar scroll position. The toolbar uses short icon labels with `title`
attributes for discoverability.

"Remove All Views" stays in the sidebar since it's a destructive action that
shouldn't be too easy to hit accidentally.

### Country/region dropdown

The 5 hardcoded region buttons were replaced with a `<select>` populated
dynamically from `common_loc_get_list_codes()`. The dropdown groups entries
into "Regions" (M49 codes) and "Countries" (ISO 3166-1 alpha-3 codes),
sorted alphabetically. The 5 preset regions remain as compact quick-access
buttons above the dropdown.

When a selection is made, `common_loc_fit_bbox(code)` flies the map to the
selected location's bounding box.

### Coordinate + zoom display

A translucent bar at the bottom of the map area shows current lat, lng, and
zoom level. Updated via polling (every 2 seconds) because the SDK's
postMessage bridge doesn't support native Mapbox map events (`moveend`,
`zoomend`) from the parent page.

## 12. Legend images for active views

When a view is toggled on, its legend is fetched via `get_view_legend_image({idView})`
which returns a base64-encoded PNG. Legends are displayed in a floating panel
in the bottom-right of the map area.

The panel updates automatically as views are added/removed:
- Toggle on → fetch legend, add entry (with view label)
- Toggle off → remove entry
- Clear all → remove all entries, hide panel

Not all views have legends — failed fetches are silently skipped. The panel
is hidden when no legends are active.

Implementation: `src/ui/legends.js` creates the DOM lazily on first use and
manages a `Map<idView, HTMLElement>` for efficient add/remove.

## 13. Transparency sliders

When a view is active, a range input (0–100) appears below its button in the
sidebar. On input, calls `set_view_layer_transparency({idView, value})`. The
slider is initialized from `get_view_layer_transparency({idView})` to match
the current server state (e.g. after a scenario sets transparency).

The slider label shows "Opacity" as a percentage (100 - transparency) since
users think in terms of "how visible is this layer" rather than "how
transparent is it."

## 14. View metadata ("i" button)

Each view button row includes a small "i" icon. On click, calls
`get_view_meta({idView})` and displays the view's title, abstract, source,
temporal extent, and type in a modal overlay.

The metadata object uses language objects (`{en, fr, ...}`) for text fields.
We extract English first, then fall back to French or the first available
language. The modal closes on backdrop click or the close button.

## 15. Map Composer and Share modals

Two buttons in the SDK Features section:
- "Map Composer" calls `show_modal_map_composer()` — full-featured map export
  tool with layout, title, legend, scale bar, and north arrow.
- "Share Map" calls `show_modal_share()` — sharing options including direct
  link, embed code, and social sharing buttons.

Both modals are entirely provided by MapX — zero custom layout needed.
The SDK wrappers are in `src/sdk/ui.js`.

## 16. New scenarios

### Compound Risk (Nepal)

Three-layer stacking: Population (HRSL 2022) + Flood Hazard (25yr) +
Landslide Exposure. Flies to Nepal — a mountainous region prone to compound
flood + landslide events. Demonstrates how transparency blending reveals
multi-hazard overlap. Population shows who is exposed, while the two hazard
layers show what they're exposed to.

### Live Monitoring Dashboard

Earthquakes (live, Mag >= 5.5) + Active Fires (admin level 1). Shows
real-time data layers combined on a single view, then opens the fires
dashboard for administrative-level analysis. Demonstrates the live monitoring
use case.

### Loading states

All scenario buttons show a CSS spinner during execution and are disabled
to prevent double-clicks. The `withLoading()` wrapper handles this
automatically — any error is caught and logged, and the spinner is cleared
in the `finally` block.
