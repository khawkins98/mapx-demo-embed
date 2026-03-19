/**
 * Direct Mapbox GL JS map access via the "map" resolver.
 *
 * The "map" resolver is a passthrough to the underlying Mapbox GL JS
 * Map object inside the MapX iframe. The "parameters" array maps to
 * the method's positional arguments. Use it for anything the SDK
 * doesn't wrap directly.
 *
 * This bypasses MapX's view system -- the parent page has full control
 * over sources, layers, popups, and interaction for anything added
 * this way.
 *
 * Common methods:
 *
 *   addSource(id, sourceSpec)
 *     Adds a data source to the map.
 *     map({method: "addSource", parameters: ["my-id", {type: "geojson", data: {...}}]})
 *
 *   addLayer(layerSpec)
 *     Adds a visual layer referencing an existing source.
 *     map({method: "addLayer", parameters: [{id, type, source, paint}]})
 *
 *   removeLayer(id)
 *     Removes a layer by its ID.
 *
 *   removeSource(id)
 *     Removes a source by its ID. Remove all layers using the source first.
 *
 *   queryRenderedFeatures(geometry)
 *     Queries vector features currently rendered on screen.
 *     geometry can be a [x, y] point, [[x1, y1], [x2, y2]] bounding box,
 *     or omitted to query the full viewport. Results are serialized through
 *     postMessage, so large feature sets may be truncated. Only returns
 *     vector features -- raster layers are not queryable.
 *
 *   unproject(point)
 *     Converts pixel coordinates {x, y} on the map canvas to geographic
 *     coordinates {lng, lat}. Useful for translating a pixel-space
 *     selection rectangle into geographic bounds.
 *
 * Any other Mapbox GL JS Map method can be called the same way via
 * mapMethod(name, argsArray).
 *
 * IMPORTANT — SDK bridge requirement:
 * The "map" resolver in the MapX SDK expects a `parameters` array to be
 * present in the request payload. If `parameters` is omitted entirely
 * (as opposed to an empty array), the bridge skips method invocation and
 * returns undefined. This is why queryRenderedFeatures() passes an empty
 * array `[]` even when no geometry argument is needed. All wrapper
 * functions in this module follow the same convention for safety.
 */

import { getSDK } from "./client.js";

export function mapMethod(method, parameters) {
  const opts = { method, parameters: parameters ?? [] };
  return getSDK().ask("map", opts);
}

export function addSource(id, sourceSpec) {
  return mapMethod("addSource", [id, sourceSpec]);
}

export function addLayer(layerSpec) {
  return mapMethod("addLayer", [layerSpec]);
}

export function removeLayer(id) {
  return mapMethod("removeLayer", [id]);
}

export function removeSource(id) {
  return mapMethod("removeSource", [id]);
}

export function queryRenderedFeatures(geometry) {
  /* Always pass parameters array — omitting it causes the MapX SDK bridge
   * to skip method invocation (it expects parameters to be present). */
  if (geometry) return mapMethod("queryRenderedFeatures", [geometry]);
  return mapMethod("queryRenderedFeatures", []);
}

export function unproject(point) {
  return mapMethod("unproject", [point]);
}
