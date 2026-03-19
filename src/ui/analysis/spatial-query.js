/*
 * Spatial query — three modes for selecting features on the map
 *
 *   1. Query viewport:  calls queryRenderedFeatures with no geometry argument,
 *      which returns every vector feature currently visible in the viewport.
 *      Quick way to see what's on screen without drawing anything.
 *
 *   2. Box select:  overlay-based interactive rectangle tool (see box-select.js).
 *      User clicks two corners; features inside the pixel bbox are returned.
 *
 *   3. Polygon select:  overlay-based interactive polygon tool (see polygon-select.js).
 *      User clicks multiple vertices to define an arbitrary region.
 *
 * All three modes go through queryRenderedFeatures under the hood. Results are
 * serialized through the SDK's postMessage bridge, so very large feature sets
 * may be truncated by the browser's message-size limits. The results table
 * shows a layer-by-layer breakdown and a handful of sample features.
 */

import { log } from "../log.js";
import { esc } from "../../lib/esc.js";
import { queryRenderedFeatures } from "../../sdk/map-layers.js";
import { showToolMessage, showToolResults, clearToolResults, filterBasemapFeatures } from "./tool-helpers.js";
import { cancelBoxSelect, startBoxSelect, cleanupBoxSelectHighlight } from "./box-select.js";
import { cancelPolygonSelect, startPolygonSelect, cleanupPolygonSelectHighlight } from "./polygon-select.js";
import { highlightQueryResults, cleanupFeatureHighlight } from "./feature-highlight.js";
import * as store from "../../state/store.js";

export function enableSpatialQuery() {
  document.getElementById("btn-query-viewport").addEventListener("click", async () => {
    showToolMessage("bbox-message", "Querying visible features...");
    clearToolResults("bbox-results");
    cancelBoxSelect();
    cancelPolygonSelect();
    cleanupBoxSelectHighlight();
    cleanupPolygonSelectHighlight();
    cleanupFeatureHighlight();

    try {
      const rawFeatures = await queryRenderedFeatures();
      const features = filterBasemapFeatures(rawFeatures || []);

      if (features.length === 0) {
        showToolMessage("bbox-message", "No features found in viewport.");
        return;
      }

      log(`Viewport query: ${features.length} features (${(rawFeatures || []).length} before basemap filter)`);
      showToolMessage("bbox-message", `${features.length} features in viewport`);

      const byLayer = {};
      for (const f of features) {
        const layer = f.layer?.id || f.sourceLayer || "(unknown)";
        byLayer[layer] = (byLayer[layer] || 0) + 1;
      }

      let html = `<h4>${features.length} Features</h4>`;
      html += "<table><tr><th>Layer</th><th>Count</th></tr>";
      for (const [layer, count] of Object.entries(byLayer).sort((a, b) => b[1] - a[1])) {
        html += `<tr><td>${esc(layer)}</td><td>${count}</td></tr>`;
      }
      html += "</table>";

      const samples = features.slice(0, 5);
      if (samples.length > 0) {
        html += `<h4>Sample Features (first ${samples.length})</h4>`;
        for (const f of samples) {
          const props = f.properties || {};
          const keys = Object.keys(props).slice(0, 4);
          const summary = keys.map((k) => `${k}: ${String(props[k]).substring(0, 30)}`).join(", ");
          html += `<div class="sample-feature">${esc(summary)}</div>`;
        }
      }

      showToolResults("bbox-results", html);
      await highlightQueryResults(features);
    } catch (e) {
      log("Viewport query error: " + e.message);
      showToolMessage("bbox-message", "Query failed: " + e.message, true);
    }
  });

  document.getElementById("btn-box-select").addEventListener("click", async () => {
    if (store.boxSelectOverlay) {
      cancelBoxSelect();
      showToolMessage("bbox-message", "Box select cancelled.");
      return;
    }
    await startBoxSelect();
  });

  document.getElementById("btn-polygon-select").addEventListener("click", async () => {
    if (store.polygonSelectOverlay) {
      cancelPolygonSelect();
      showToolMessage("bbox-message", "Polygon select cancelled.");
      return;
    }
    await startPolygonSelect();
  });

  document.getElementById("btn-clear-selection").addEventListener("click", async () => {
    cancelBoxSelect();
    cancelPolygonSelect();
    await cleanupBoxSelectHighlight();
    await cleanupPolygonSelectHighlight();
    await cleanupFeatureHighlight();
    clearToolResults("bbox-results");
    showToolMessage("bbox-message", "");
    log("Selection cleared");
  });
}
