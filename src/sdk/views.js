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
