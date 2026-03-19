/*
 * Track which views are currently displayed on the map.
 * Needed because view_add/view_remove are fire-and-forget —
 * there's no synchronous "is this view open?" check.
 * (get_views_id_open() exists but it's async.)
 */
export const openViews = new Set();

/*
 * Registry of custom GeoJSON datasets added to the map.
 *
 * WHY THIS EXISTS:
 * The MapX SDK's click_attributes event tells us WHERE a click happened
 * (lng/lat coordinates) and WHICH view was clicked (idView), but for
 * GeoJSON views created via view_geojson_create or layers added via the
 * Mapbox passthrough, the event may not include the actual feature
 * properties (e.g. name, status, budget). The feature data lives in
 * the parent page's JavaScript — not inside the MapX iframe.
 *
 * So we keep a local copy: when we add GeoJSON data to the map, we
 * also push it into this array. When a click event arrives, we use
 * the click coordinates to search the registry and find the matching
 * feature, then display its properties in our custom infobox.
 *
 * PATTERN:
 *   1. Call view_geojson_create (or map.addSource) to put data on the map
 *   2. Call registerGeoJSON(id, geojson, label, paint) to store the data
 *      for click matching, dropdown labels, and paint restoration
 *   3. On click_attributes, findNearestFeature() searches the registry
 *   4. On removal, call unregisterGeoJSON(id) to clean up
 */
export const customGeoJSONRegistry = [];

/* Custom data overlay state — hoisted so clearAllViews can reset them */
export let geojsonViewId = null;
export let polygonViewId = null;
export let markersAdded = false;

export const MARKERS_SOURCE = "demo-monitoring-stations";
export const MARKERS_LAYER = "demo-monitoring-circles";
export const MARKERS_LABEL_LAYER = "demo-monitoring-labels";

/** Highlight layer tracking flags */
export let boxHighlightActive = false;
export let polygonHighlightActive = false;
export let featureHighlightActive = false;

/** Box/polygon select overlay references */
export let boxSelectOverlay = null;
export let polygonSelectOverlay = null;

/*
 * Setter functions — why these exist:
 * ES modules export live read-only bindings. Importing modules can read
 * an exported `let` variable and will see updates, but they can't
 * reassign it directly — only the declaring module can do that. These
 * thin setters give other modules a way to mutate the shared state.
 */

export function setGeojsonViewId(id) { geojsonViewId = id; }
export function setPolygonViewId(id) { polygonViewId = id; }
export function setMarkersAdded(val) { markersAdded = val; }
export function setBoxHighlightActive(val) { boxHighlightActive = val; }
export function setPolygonHighlightActive(val) { polygonHighlightActive = val; }
export function setFeatureHighlightActive(val) { featureHighlightActive = val; }
export function setBoxSelectOverlay(val) { boxSelectOverlay = val; }
export function setPolygonSelectOverlay(val) { polygonSelectOverlay = val; }

/**
 * Register a GeoJSON dataset so clicks can be matched to features.
 *
 * Call this after view_geojson_create (or map.addSource for passthrough
 * layers) with the same GeoJSON data. The id should match the view ID
 * or source ID used with the SDK, so we can clean up on removal.
 *
 * @param {string} id    — View ID or source ID; must match what the SDK uses
 *   so unregisterGeoJSON can find it later.
 * @param {object} geojson — The GeoJSON FeatureCollection. Kept in memory for
 *   click matching, local statistics, and data export.
 * @param {string} [label] — Human-readable name shown in the analysis panel's
 *   view selector dropdown. Falls back to the raw id when omitted.
 * @param {object} [paint] — Mapbox GL paint specification (e.g. circle-color,
 *   circle-radius expressions). Stored so the numeric filter can restore the
 *   original style after clearing a filter that overrides circle-opacity.
 */
export function registerGeoJSON(id, geojson, label, paint) {
  customGeoJSONRegistry.push({ id, geojson, label, paint });
}

/**
 * Last spatial query results — the feature array from the most recent
 * viewport / box / polygon query. Shared across modules so that:
 *   - data-export can offer "Export Selection" as GeoJSON
 *   - spatial-query's "Download CSV" button can access the same data
 *     via event delegation without passing it through the DOM
 *
 * Set to null when the user clears the selection.
 *
 * @type {Array<object>|null}
 */
export let lastSpatialQueryResults = null;

/** @param {Array<object>|null} val */
export function setLastSpatialQueryResults(val) { lastSpatialQueryResults = val; }

/**
 * Unregister a GeoJSON dataset (call on view_geojson_delete or
 * map.removeSource). Removes the dataset from the registry so stale
 * features are no longer matched on click.
 */
export function unregisterGeoJSON(id) {
  const idx = customGeoJSONRegistry.findIndex((r) => r.id === id);
  if (idx !== -1) customGeoJSONRegistry.splice(idx, 1);
}
