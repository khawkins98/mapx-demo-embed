/**
 * Layer filters and transparency.
 *
 * set_view_layer_filter_numeric({idView, attribute, from, to})
 *   Filters a vt (vector tile) layer to features where the named
 *   attribute falls within [from, to]. Only works on vt views.
 *   Use the attribute/from/to params -- the deprecated value array
 *   form still works but is not recommended.
 *   Pass {idView, attribute, from: null, to: null} to clear the filter.
 *
 * set_view_layer_filter_text({idView, value})
 *   Controls the view's text/category search box filter. The value
 *   must match entries from the view's filter dropdown -- use
 *   get_view_table_attribute() first to discover valid values.
 *   Pass a string for a single match, or an array for multiple.
 *   Pass an empty string or empty array to clear the filter.
 *
 * set_view_layer_transparency({idView, value})
 *   Sets a layer's transparency from 0 (fully opaque) to 100
 *   (fully invisible). Useful for overlaying multiple raster layers
 *   so you can see through one to the other.
 */

import { getSDK } from "./client.js";

export function setViewLayerFilterNumeric(idView, attribute, from, to) {
  return getSDK().ask("set_view_layer_filter_numeric", {
    idView,
    attribute,
    from,
    to,
  });
}

export function setViewLayerFilterText(idView, value) {
  return getSDK().ask("set_view_layer_filter_text", { idView, value });
}

export function setViewLayerTransparency(idView, value) {
  return getSDK().ask("set_view_layer_transparency", { idView, value });
}
