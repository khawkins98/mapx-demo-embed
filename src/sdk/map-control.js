/**
 * Map navigation and display controls.
 *
 * map_fly_to(opts)
 *   Animates the map camera. Accepts any Mapbox GL AnimationOptions:
 *     {center, zoom, bearing, pitch, duration, essential, ...}
 *   Example: map_fly_to({center: {lng: 0, lat: 20}, zoom: 2})
 *
 * map_get_zoom()
 *   Returns the current zoom level as a number.
 *
 * map_wait_idle()
 *   Returns a Promise that resolves when the map finishes rendering.
 *   Call this between navigation and dashboard/filter operations
 *   to avoid race conditions.
 *
 * common_loc_fit_bbox({code, param})
 *   Flies to a country or region bounding box.
 *     code: ISO 3166-1 alpha-3 (e.g. "IND", "IDN") or M49 numeric code
 *           (e.g. "m49_029" for the Caribbean)
 *     param: Mapbox AnimationOptions (duration, maxZoom, etc.)
 *   Use common_loc_get_list_codes() to see all available codes.
 *
 * setProjection / getProjection
 *   Uses the "map" resolver as a passthrough to the underlying Mapbox GL
 *   JS Map object. setProjection accepts "mercator" or "globe".
 *   getProjection returns {name: "mercator"|"globe", ...}.
 *
 * set_3d_terrain({action})
 *   Adds elevation exaggeration to the basemap.
 *   action: "show" | "hide" | "toggle"
 *
 * set_mode_3d({action})
 *   Adjusts pitch and bearing for a perspective view.
 *   action: "show" | "hide" | "toggle"
 *   Combine with 3D terrain for the full effect.
 *
 * set_mode_aerial({action})
 *   Toggles satellite/aerial imagery on the basemap.
 *   action: "show" | "hide" | "toggle"
 *
 * set_immersive_mode({action})
 *   Hides all MapX chrome (panels, toolbars, etc.) for a clean
 *   map-only presentation.
 *   action: "show" | "hide" | "toggle"
 *   get_immersive_mode() returns current Boolean state.
 */

import { getSDK } from "./client.js";

export function mapFlyTo(opts) {
  return getSDK().ask("map_fly_to", opts);
}

export function mapGetZoom() {
  return getSDK().ask("map_get_zoom");
}

export function mapWaitIdle() {
  return getSDK().ask("map_wait_idle");
}

export function commonLocFitBbox(code, param) {
  return getSDK().ask("common_loc_fit_bbox", { code, param });
}

export function setProjection(name) {
  return getSDK().ask("map", { method: "setProjection", parameters: [name] });
}

export function getProjection() {
  return getSDK().ask("map", { method: "getProjection", parameters: [] });
}

export function set3dTerrain(action) {
  return getSDK().ask("set_3d_terrain", { action });
}

export function setMode3d(action) {
  return getSDK().ask("set_mode_3d", { action });
}

export function setModeAerial(action) {
  return getSDK().ask("set_mode_aerial", { action });
}

export function setImmersiveMode(action) {
  return getSDK().ask("set_immersive_mode", { action });
}

/**
 * common_loc_get_list_codes()
 *   Returns the list of location codes available for common_loc_fit_bbox.
 *   Includes ISO 3166-1 alpha-3 country codes (e.g. "IND", "IDN") and
 *   M49 region codes (e.g. "m49_029" for Caribbean). Each entry has
 *   a code and a label. Used to populate the country/region dropdown.
 */
export function commonLocGetListCodes() {
  return getSDK().ask("common_loc_get_list_codes");
}

/**
 * map({method: "getCenter"})
 *   Returns the map's current center as {lng, lat} via the Mapbox GL
 *   passthrough. Used by the coordinate display bar.
 */
export function mapGetCenter() {
  return getSDK().ask("map", { method: "getCenter", parameters: [] });
}
