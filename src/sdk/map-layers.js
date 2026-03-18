import { getSDK } from "./client.js";

export function mapMethod(method, parameters) {
  const opts = { method };
  if (parameters) opts.parameters = parameters;
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
  if (geometry) return mapMethod("queryRenderedFeatures", [geometry]);
  return mapMethod("queryRenderedFeatures");
}

export function unproject(point) {
  return mapMethod("unproject", [point]);
}
