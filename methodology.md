# Methodology: Discovering MapX Views and Data Sources

This document records how the demo views and project configuration were discovered
and selected, since MapX does not expose a public unauthenticated search API.

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

The **Eco-DRR project** (`MX-2LD-FBB-58N-ROK-8RH`) was chosen as the primary project
because it contains 85 views purpose-built for disaster risk reduction, including:

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
However, the Eco-DRR project (`MX-2LD-FBB-58N-ROK-8RH`) contains 85 views but
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
  project, play the story map, then switch back. However, this reloads the
  entire MapX app state and would lose all current views/filters.
- **Requesting story maps be added to the Eco-DRR project** — the cleanest
  solution if working with the MapX data administrators.

## 9. Custom data overlays

### The problem

The curated MapX views (sections 4-5) are published datasets hosted on the MapX
platform. For many integration scenarios, however, you need to overlay your own
data — field office locations, monitoring stations, project boundaries — on top
of the MapX basemap and its layers. The SDK provides two distinct mechanisms for
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
the simplest path for interactive point overlays.

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
interpolation, heatmaps, 3D extrusions, etc.) but has a critical limitation:
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
   deliberately generous because it must account for varying zoom levels.

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

Both elements are standard DOM elements in the parent page, styled with the
Mangrove component library. They are not injected into the MapX iframe (which
would violate cross-origin restrictions).

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

**Recommendation:** Use GeoJSON views (Approach A) when click interaction is
important and styling needs are simple. Use Mapbox passthrough (Approach B/C)
when you need advanced Mapbox styling or when the overlay is purely visual
without click interaction. For interactive polygon overlays with advanced
styling, the passthrough with coordinate matching fallback is the only option,
but it adds significant complexity.
