/**
 * Explorer demo entry point.
 *
 * Initialises the MapX SDK, loads hazard layers and the damage
 * overlay, and wires preset query buttons.
 *
 * ## Init sequence
 *
 * 1. **PIN gate** — blocks the page with a numeric code prompt until
 *    the correct preview PIN is entered (shared across all demos).
 * 2. **SDK bootstrap** — creates the MapX iframe inside `#mapx` and
 *    waits for the `"ready"` event.
 * 3. **Camera** — flies to the Caribbean region so the hazard layers
 *    are visible immediately.
 * 4. **Hazard layers** — iterates `EXPLORER_HAZARD_LAYERS`, adds each
 *    view and sets 40 % transparency so the base map remains legible.
 * 5. **Damage overlay** — creates a GeoJSON view from the fictional
 *    damage-events dataset and styles it with data-driven circles.
 * 6. **Preset queries** — populates the sidebar button list so the
 *    user can run canned filters against the damage data.
 * 7. **Analysis tools** — enables the floating analysis panel (filter,
 *    spatial query, statistics, export) and opens it by default. The
 *    panel opens automatically in the explorer because the damage
 *    overlay is the primary interactive dataset and users are expected
 *    to start analyzing it immediately.
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
import { openViews } from "../../src/state/store.js";
import { enableAnalysisTools } from "../../src/ui/analysis/panel.js";
import { updateAnalysisViewSelect } from "../../src/ui/analysis/view-select.js";

initPinGate();

const mapx = initSDK(document.getElementById("mapx"));

/**
 * SDK ready handler — runs the full init sequence described above.
 *
 * All async steps are awaited sequentially so each layer is fully
 * registered before the next one starts (avoids race conditions in
 * the MapX iframe).
 */
mapx.on("ready", async () => {
  setStatus("Connected", "ok");
  log("Explorer demo ready");

  /* Fly to Caribbean region center (lng -72, lat 18, zoom 5.5) */
  await mapFlyTo({
    center: { lng: -72, lat: 18 }, // Caribbean region center
    zoom: 5.5, // fits the island arc from Bahamas to Trinidad
    duration: 1500, // 1.5 s camera animation
  });

  /* Load hazard layers with transparency */
  for (const layer of EXPLORER_HAZARD_LAYERS) {
    try {
      await viewAdd(layer.id);
      openViews.add(layer.id);
      await setViewLayerTransparency(layer.id, 40); // 40 % transparent so base map shows through
      log(`Loaded hazard layer: ${layer.label}`);
    } catch (e) {
      log(`Failed to load ${layer.label}: ${e.message}`);
    }
  }

  /* Load damage overlay */
  await loadDamageOverlay();

  /* Wire preset query buttons */
  wirePresetQueries();

  /* Enable analysis tools panel and populate the view dropdown.
   * The programmatic click on btn-toggle-analysis opens the panel on load —
   * in the explorer demo the damage overlay is the primary interactive dataset
   * and the analysis tools are the main interaction pathway, so hiding them
   * behind an extra click would hurt discoverability. Other demos (e.g. story)
   * leave the panel closed since analysis is secondary there. */
  enableAnalysisTools();
  updateAnalysisViewSelect();
  document.getElementById("btn-toggle-analysis").click();

  log("Explorer initialisation complete");
});
