# MapX Demo Embed

> **Investigation proof of concept** — Exploratory work to see what the
> MapX SDK can do for embedding interactive geospatial maps into a website.
> Not intended for production use; workarounds and rough edges are documented
> in [methodology.md](methodology.md).

A proof-of-concept that embeds MapX disaster risk reduction maps via the SDK and wires them up to UI controls styled with the UNDRR Mangrove component library.

## Project

- **Primary MapX project:** Eco-DRR Geospatial Datasets (`MX-2LD-FBB-58N-ROK-8RH`)
- **Direct link:** https://app.mapx.org/?project=MX-2LD-FBB-58N-ROK-8RH&language=en&theme=color_light

## Preview Access

The demo uses the published Mangrove 2.3.0 **PreviewAccess** pattern for its unofficial preview.

**PIN: `5498`**

Enter the PIN and select **Unlock** (or press Enter). Mangrove remembers the unlock
in `localStorage`, shared across the landing page and all four demos. Existing
users of the previous custom gate enter the PIN once again after this upgrade.

The component supplies the dialog, background isolation, error feedback and focus
handling. Its CSS and JavaScript both come from the pinned 2.3.0 asset bundle.

## Running It

Requires Node.js 24.15+ (24 LTS). Use `nvm use` to select the supported major.

```bash
npm ci
npm run dev
```

Open **http://localhost:3001/mapx-demo-embed/**. Vite handles module bundling and hot reload.

For production:

```bash
npm run build          # outputs to dist/
npm run preview        # preview the production build
node server.js         # serves dist/ (falls back to root if no build)
```

## Testing

```bash
npm test               # unit tests (Vitest)
npm run test:e2e       # E2E tests (Playwright, requires chromium)
npm run test:all       # both
```

CI runs unit tests plus the preview-access, landing-page and stubbed MapX compatibility browser tests.
The full E2E suite also contacts live MapX and needs network access.

Install Playwright browsers on first run: `npx playwright install --with-deps chromium`

## Demo Pages

The site is a multi-page app (Vite MPA) with a landing page and four demos:

| Page | Route | What it shows |
|---|---|---|
| **Landing** | `/` | Project intro + cards linking to each demo |
| **Kitchen Sink** | `/demos/kitchen-sink/` | All SDK features: views, scenarios, custom data, analysis tools |
| **Risk to Resilience** | `/demos/story/` | Guided narrative with step-by-step map animations |
| **Data Explorer** | `/demos/explorer/` | DELTA-style analysis with damage overlays and preset queries |
| **Metrics Hub** | `/demos/metrics/` | Scrollytelling risk metrics, interactive charts, country deep-dives |

## What's In Here

| Path | Purpose |
|---|---|
| `index.html` | Landing page — demo cards linking to each page |
| `demos/` | Demo pages, each with its own `index.html` + entry-point JS |
| `src/` | Shared modules — config, data, lib (pure functions), SDK wrappers, state, UI |
| `docs/` | Pitch document and story arc for the Metrics Hub concept |
| `tests/unit/` | Vitest unit tests for pure logic (esc, geo, stats, store) |
| `tests/e2e/` | Playwright E2E tests (smoke, views, scenarios, controls, analysis) |
| `server.js` | Node static file server (serves `dist/` in production) |
| `probe-views.html` | Utility page — connects to MapX projects and dumps their view catalogs |
| `methodology.md` | Documents how views and data sources were discovered and selected |

## Curated DRR Views

The demo loads 11 curated views covering hazards, exposure, eco-DRR solutions, and climate projections:

| Type | View | What it shows |
|---|---|---|
| live | Earthquakes Mag >= 5.5 (USGS) | Real-time seismic point data |
| raster | Flood Hazard 25yr | River flood return period model |
| raster | Landslide Exposure | Earthquake + precipitation triggered |
| raster | Tropical Cyclone Exposure | Wind speed probability |
| raster | Tsunami Exposure | Annual physical exposure |
| raster | Population (HRSL 2022) | Who is at risk — exposure baseline |
| raster | Forest Protection — Flood Risk | Nature-based solution opportunities |
| raster | Mangrove Restoration — Cyclone Surge | Coastal NbS opportunities |
| vector | Water Stress Change (RCP8.5 2030) | Forward-looking climate projection |
| vector | Active Fires (Admin Level 1) | Admin polygons with fire trends |
| vector | Intact Forest Landscapes | Large intact ecosystem polygons |

See [methodology.md](methodology.md) for how these were discovered and why they were chosen.

## Known Limitations

**Story maps require same-project context.** The SDK's `view_add` only works
for views belonging to the currently loaded project. Story maps from other
projects (like the HOME project) silently fail — no error, no network request.
The demo works around this by overlaying a second MapX iframe for story map
playback. If your project has its own story maps, `view_add` works seamlessly.
See [methodology.md](methodology.md) section 8 for the full investigation.

## Custom Data Overlays

You can overlay your own data on top of MapX layers in a few different ways:

| Approach | Method | Best for |
|---|---|---|
| **GeoJSON view** | `view_geojson_create` | Point overlays needing click interaction |
| **Mapbox passthrough** | `map` method (`addSource`/`addLayer`) | Layers needing advanced Mapbox GL styling |
| **Polygon overlay** | `map` method with `fill`/`line` layers | Area boundaries and project zones |

**Click interaction:** GeoJSON views fire the `click_features` event natively
when a feature is clicked, and feature properties come through with it. Mapbox
passthrough layers cannot have click handlers (callbacks are not serializable
through `postMessage`), so a coordinate matching fallback is used instead —
nearest-point matching for points and ray-casting point-in-polygon for polygons.

See [methodology.md](methodology.md) section 9 for technical details,
trade-offs, and implementation patterns.

## Analysis Tools

The demo includes lightweight analysis tools in the sidebar that operate on whichever layer is selected in the "Active View" dropdown:

| Tool | What it does |
|---|---|
| **Numeric Range Filter** | Filter vector layers by numeric attribute range |
| **Spatial Query** | Query features in the current viewport or a two-click bounding box |
| **Feature Statistics** | View count, min/max, mean, and category distributions |
| **Data Export** | Download GeoJSON view data as a file |

Not all tools work on all view types — numeric filtering requires vector tile (`vt`) views, and export only works for GeoJSON views. See [methodology.md](methodology.md) section 10 for details and the `toggle_draw_mode` workaround.

## Runtime compatibility

- **Mangrove 2.3.0** is pinned to the published asset CDN on every page.
- **MapX 1.14.3** was checked on 9 November 2026. The Manager is loaded from
  `https://app.mapx.org/sdk/mxsdk.umd.js` alongside the iframe from that same host.
  These intentionally follow the hosted release together: pinning only the Manager
  can cause `err_version_mismatch`. The kitchen-sink log reports the runtime version.
- Feature inspection consumes `click_features` (MapX 1.14.2+), whose `attributes`
  maps view IDs to feature rows. Empty hits close the infobox; custom passthrough
  layers keep their local coordinate-matching fallback.
- Vite 8.3, Vitest/coverage 5.1, jsdom 31 and Playwright 1.65 use the Node 24
  toolchain declared in `.nvmrc` and CI.

See [LEARNINGS.md](LEARNINGS.md) for the compatibility decisions borrowed from
`undrr-risk-resilience-maps-pw`.

## Key SDK Methods

| Method | What it does |
|---|---|
| `mapx.ask("get_views")` | List all views in the project |
| `mapx.ask("view_add", {idView: "MX-..."})` | Display a view on the map |
| `mapx.ask("view_remove", {idView: "MX-..."})` | Remove a view from the map |
| `mapx.ask("map_fly_to", {center: {lng, lat}, zoom})` | Animated fly to a location |
| `mapx.ask("map_jump_to", {center: {lng, lat}, zoom})` | Instant jump to a location |
| `mapx.ask("set_view_layer_filter_text", {idView, value})` | Filter a layer by text |
| `mapx.ask("set_view_layer_transparency", {idView, value})` | Set layer transparency (0-100) |
| `mapx.ask("get_views_id_open")` | Get currently open view IDs |
| `mapx.ask("set_theme", {idTheme})` | Change the map theme |

## References

- **SDK docs:** https://github.com/unep-grid/mapx/tree/master/app/src/js/sdk
- **SDK recipes wiki:** https://github.com/unep-grid/map-x-mgl/wiki/SDK---Recipes
- **Observable examples:** https://observablehq.com/collection/@trepmag/mapx-sdk
- **Starter project:** https://git.unepgrid.ch/drikc/mapx-sdk-starter-project
- **Mangrove component library:** https://mangrove.undrr.org/
- **Mangrove CSS (CDN):** `https://assets.undrr.org/mangrove/2.3.0/css/style.css`
- **NPM alternative:** `@fxi/mxsdk` — use only when its version matches the hosted MapX app.
- **UMD script:** `https://app.mapx.org/sdk/mxsdk.umd.js`
