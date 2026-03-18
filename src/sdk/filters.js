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
