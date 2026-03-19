/**
 * Explorer demo entry point.
 *
 * Initialises the MapX SDK, loads hazard layers and the damage
 * overlay, and wires preset query buttons.
 */

import "../../src/styles/shared.css";
import "../../src/styles/explorer.css";
import { initSDK } from "../../src/sdk/client.js";
import { initPinGate } from "../../src/ui/pin-gate.js";
import { setStatus, log } from "../../src/ui/log.js";
import { viewAdd } from "../../src/sdk/views.js";
import { mapFlyTo } from "../../src/sdk/map-control.js";
import { setViewLayerTransparency } from "../../src/sdk/filters.js";
import { EXPLORER_HAZARD_LAYERS } from "../../src/config/explorer-layers.js";
import { loadDamageOverlay } from "./damage-overlay.js";
import { wirePresetQueries } from "./preset-queries.js";

initPinGate();

const mapx = initSDK(document.getElementById("mapx"));

mapx.on("ready", async () => {
  setStatus("Connected", "ok");
  log("Explorer demo ready");

  /* Fly to Caribbean region */
  await mapFlyTo({ center: { lng: -72, lat: 18 }, zoom: 5.5, duration: 1500 });

  /* Load hazard layers with transparency */
  for (const layer of EXPLORER_HAZARD_LAYERS) {
    try {
      await viewAdd(layer.id);
      await setViewLayerTransparency(layer.id, 40);
      log(`Loaded hazard layer: ${layer.label}`);
    } catch (e) {
      log(`Failed to load ${layer.label}: ${e.message}`);
    }
  }

  /* Load damage overlay */
  await loadDamageOverlay();

  /* Wire preset query buttons */
  wirePresetQueries();

  log("Explorer initialisation complete");
});
