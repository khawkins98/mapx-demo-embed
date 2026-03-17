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
