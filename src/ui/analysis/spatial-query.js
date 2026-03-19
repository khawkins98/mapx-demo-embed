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
import { downloadFeaturesCSV } from "../../lib/download.js";
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
      /* Race the query against a 15 s timeout. queryRenderedFeatures must
       * serialize every visible vector feature through the postMessage bridge,
       * which can stall when the viewport contains tens of thousands of features
       * (e.g. dense point layers at low zoom). The timeout gives the user an
       * actionable error message suggesting box/polygon selection instead. */
      const rawFeatures = await Promise.race([
        queryRenderedFeatures(),
        new Promise((_, reject) => setTimeout(() => reject(new Error(
          "Viewport query timed out — the visible area may contain too many features. Try a box or polygon selection to query a smaller region."
        )), 15000)),
      ]);
      const features = filterBasemapFeatures(rawFeatures || []);

      if (features.length === 0) {
        showToolMessage("bbox-message", "No vector features found in viewport. Raster layers are not queryable — use box or polygon selection on GeoJSON layers.");
        return;
      }

      store.setLastSpatialQueryResults(features);
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

      html += `<button class="mg-button mg-button-secondary btn-download-selection-csv" style="margin-top:0.5rem;width:100%;">Download CSV</button>`;
      showToolResults("bbox-results", html);
      await highlightQueryResults(features);
    } catch (e) {
      log("Viewport query error: " + e.message);
      showToolMessage("bbox-message", "Query failed: " + e.message, true);
    }
  });

  /* Event delegation for the "Download CSV" button.
   *
   * The button is injected as raw HTML inside the results container after each
   * query completes. Because it doesn't exist in the DOM at page load, we
   * can't attach a listener to it directly. Instead we listen on the stable
   * parent (#bbox-results) and filter by class name. This avoids re-attaching
   * listeners every time results are re-rendered. */
  document.getElementById("bbox-results").addEventListener("click", (e) => {
    if (!e.target.classList.contains("btn-download-selection-csv")) return;
    const results = store.lastSpatialQueryResults;
    if (!results || results.length === 0) return;
    log(`Downloading CSV for ${results.length} selected features`);
    downloadFeaturesCSV(results, "selection.csv");
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
    store.setLastSpatialQueryResults(null);
    clearToolResults("bbox-results");
    showToolMessage("bbox-message", "");
    log("Selection cleared");
  });
}
