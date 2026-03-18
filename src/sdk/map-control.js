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
  return getSDK().ask("map", { method: "getProjection" });
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
