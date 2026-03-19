/**
 * View management -- adding, removing, and creating GeoJSON views.
 *
 * SDK methods wrapped here:
 *
 *   view_add({idView})    -- display a view on the map
 *   view_remove({idView}) -- remove a view from the map
 *
 * Both return a Promise<Boolean>. The idView must be a valid view ID
 * from the current project (or a publicly shared view). For story map
 * views (type "sm"), view_add activates the story map player, and
 * view_remove stops playback.
 *
 * GeoJSON views (SDK-managed custom data):
 *
 *   view_geojson_create({data, title, abstract, random})
 *     Creates a native MapX view from GeoJSON data. The view integrates
 *     with MapX's layer system: it appears in the view list, respects
 *     z-ordering, and click events flow through MapX's built-in
 *     attribute popup system.
 *       data: a GeoJSON FeatureCollection
 *       title: map legend label (supports {en, fr, ...} object)
 *       abstract: description text
 *       random: if true, randomises point styling
 *       Returns {id} with the new view's ID.
 *
 *   view_geojson_set_style({idView, paint, layout})
 *     paint: Mapbox GL paint properties (circle-color, etc.)
 *     layout: Mapbox GL layout properties (icon-image, etc.)
 *
 *   view_geojson_delete({idView})
 *     Removes the GeoJSON view entirely.
 */

import { getSDK } from "./client.js";

export function viewAdd(idView) {
  return getSDK().ask("view_add", { idView });
}

export function viewRemove(idView) {
  return getSDK().ask("view_remove", { idView });
}

export function viewGeojsonCreate(opts) {
  return getSDK().ask("view_geojson_create", opts);
}

export function viewGeojsonSetStyle(idView, paint, layout) {
  const params = { idView, paint };
  if (layout) params.layout = layout;
  return getSDK().ask("view_geojson_set_style", params);
}

export function viewGeojsonDelete(idView) {
  return getSDK().ask("view_geojson_delete", { idView });
}

/**
 * get_view_legend_image({idView})
 *   Returns a base64-encoded PNG of the view's legend, or null if the
 *   view has no legend. Useful for displaying legend keys outside the
 *   MapX iframe in a custom legends panel.
 */
export function getViewLegendImage(idView) {
  return getSDK().ask("get_view_legend_image", { idView });
}

/**
 * get_view_meta({idView})
 *   Returns the view's metadata object including title, abstract,
 *   data source attribution, temporal extent, and other catalog info.
 *   The returned object typically includes:
 *     {title, abstract, notes, source, temporal, ...}
 *   where title/abstract/notes are {en, fr, ...} language objects.
 */
export function getViewMeta(idView) {
  return getSDK().ask("get_view_meta", { idView });
}
