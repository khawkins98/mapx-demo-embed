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
  return params;
}

export function getViewSourceSummaryFull(params) {
  return getSDK().ask("get_view_source_summary", params);
}

export function downloadViewSourceGeojson(idView, mode) {
  return getSDK().ask("download_view_source_geojson", { idView, mode });
}
