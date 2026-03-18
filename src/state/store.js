/** Which MapX views are currently displayed on the map */
export const openViews = new Set();

/** Registry of custom GeoJSON datasets for click matching */
export const customGeoJSONRegistry = [];

/** Custom data overlay state */
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

/* Setter functions (needed because ES modules export live bindings but
 * reassignment must happen in the declaring module) */

export function setGeojsonViewId(id) { geojsonViewId = id; }
export function setPolygonViewId(id) { polygonViewId = id; }
export function setMarkersAdded(val) { markersAdded = val; }
export function setBoxHighlightActive(val) { boxHighlightActive = val; }
export function setPolygonHighlightActive(val) { polygonHighlightActive = val; }
export function setFeatureHighlightActive(val) { featureHighlightActive = val; }
export function setBoxSelectOverlay(val) { boxSelectOverlay = val; }
export function setPolygonSelectOverlay(val) { polygonSelectOverlay = val; }

export function registerGeoJSON(id, geojson) {
  customGeoJSONRegistry.push({ id, geojson });
}

export function unregisterGeoJSON(id) {
  const idx = customGeoJSONRegistry.findIndex((r) => r.id === id);
  if (idx !== -1) customGeoJSONRegistry.splice(idx, 1);
}
