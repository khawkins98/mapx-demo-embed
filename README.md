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

The demo sits behind a PIN overlay since it's an unofficial preview.

**PIN: `5498`**

Enter this when prompted. The PIN is stored in `localStorage` so you only need to enter it once per browser.

## Running It

No dependencies — just Node:

```bash
node server.js
```

Open **http://localhost:3001**. To change the port: `PORT=8080 node server.js`.

## What's In Here

| File | Purpose |
|---|---|
| `index.html` | Demo page — embeds MapX with curated DRR views and map controls |
| `server.js` | Zero-dependency Node static file server |
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

**Click interaction:** GeoJSON views fire the `click_attributes` event natively
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
- **Mangrove component library:** https://unisdr.github.io/undrr-mangrove/
- **Mangrove CSS (CDN):** `https://assets.undrr.org/static/mangrove/1.3.3/css/style.css`
- **NPM:** `npm install @fxi/mxsdk` (if a build step is preferred)
- **UMD script:** `https://app.mapx.org/sdk/mxsdk.umd.js`
