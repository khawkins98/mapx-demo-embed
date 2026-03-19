/**
 * Data introspection and export for MapX views.
 *
 * get_view_table_attribute_config({idView})
 *   Returns the view's data schema: {attributes, idSource, labels}.
 *   The attributes array lists column names; labels provides human-
 *   readable names. Only works on vt views. Useful for discovering
 *   what filter values are available before calling
 *   set_view_layer_filter_text or set_view_layer_filter_numeric.
 *
 * get_view_table_attribute({idView})
 *   Returns actual row data for the view's underlying table. Each
 *   element is an object keyed by column name. Use this to find out
 *   what text strings or numeric ranges are valid for filtering.
 *
 * get_view_source_summary({idView, idAttr, stats})
 *   Returns a statistical summary for a view's attribute.
 *   stats: array of summary types --
 *     "base" gives count, min, max
 *     "attributes" gives category distributions, histograms
 *   Call map_wait_idle() before this to avoid stale data.
 *
 * download_view_source_geojson({idView, mode})
 *   Returns GeoJSON for a view's data.
 *   mode: "data" (raw source data) or "view" (with current filters applied).
 *   Only works for GeoJSON views created via view_geojson_create -- not
 *   for native MapX vector tile or raster views.
 */

import { getSDK } from "./client.js";

export function getViewTableAttributeConfig(idView) {
  return getSDK().ask("get_view_table_attribute_config", { idView });
}

export function getViewTableAttribute(idView) {
  return getSDK().ask("get_view_table_attribute", { idView });
}

export function getViewSourceSummary(idView, idAttr, stats) {
  const params = { idView, stats };
  if (idAttr) params.idAttr = idAttr;
  return getSDK().ask("get_view_source_summary", params);
}

export function downloadViewSourceGeojson(idView, mode) {
  return getSDK().ask("download_view_source_geojson", { idView, mode });
}
