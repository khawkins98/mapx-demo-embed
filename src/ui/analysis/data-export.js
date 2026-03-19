/*
 * Data export — download view data as GeoJSON
 *
 * Three cases depending on the data source:
 *
 *   1. Custom overlays (entries in customGeoJSONRegistry):
 *      We already have the GeoJSON in memory, so we just hand it to
 *      downloadGeoJSON() — no network round-trip needed.
 *
 *   2. GeoJSON views (MapX-hosted):
 *      We call download_view_source_geojson with mode "data", which asks
 *      the MapX backend to serialize the source as a GeoJSON file and send
 *      it back through the SDK bridge.
 *
 *   3. Native MapX views (vt, rt, cc):
 *      NOT supported for export. Vector tiles are sliced server-side and
 *      have no single GeoJSON source to download. Raster and custom-coded
 *      views don't have a GeoJSON representation at all. The UI shows an
 *      explanatory message instead of attempting a download.
 *
 * The "Preview" button uses the same fetch path but only renders the first
 * three features as formatted JSON so the user can inspect the schema before
 * committing to a full download.
 */

import { log } from "../log.js";
import { esc } from "../../lib/esc.js";
import { downloadGeoJSON } from "../../lib/download.js";
import { customGeoJSONRegistry } from "../../state/store.js";
import { downloadViewSourceGeojson } from "../../sdk/data-query.js";
import { showToolMessage, showToolResults } from "./tool-helpers.js";
import { getViewType } from "./view-select.js";

export function enableDataExport() {
  document.getElementById("btn-export-geojson").addEventListener("click", async () => {
    const idView = document.getElementById("analysis-view-select").value;
    if (!idView) {
      showToolMessage("export-message", "Select a view first.", true);
      return;
    }

    const registryEntry = customGeoJSONRegistry.find((r) => r.id === idView);
    if (registryEntry) {
      log(`Exporting local GeoJSON for ${idView}`);
      downloadGeoJSON(registryEntry.geojson, `${idView}.geojson`);
      showToolMessage("export-message", "Downloaded local GeoJSON data.");
      return;
    }

    const viewType = getViewType(idView);
    if (viewType !== "geojson" && viewType !== "vt") {
      showToolMessage("export-message",
        "Export only works for GeoJSON views and some vector views. Raster and custom-coded views cannot be exported as GeoJSON.",
        true,
      );
      return;
    }

    showToolMessage("export-message", "Downloading data...");

    try {
      const data = await downloadViewSourceGeojson(idView, "data");

      if (data && (data.type === "FeatureCollection" || data.features)) {
        log(`Export: ${(data.features || []).length} features`);
        downloadGeoJSON(data, `${idView}.geojson`);
        showToolMessage("export-message", `Downloaded ${(data.features || []).length} features.`);
      } else {
        log("Export returned unexpected data: " + JSON.stringify(data).substring(0, 200));
        showToolMessage("export-message", "Export did not return valid GeoJSON. This view may not support GeoJSON export.", true);
      }
    } catch (e) {
      log("Export error: " + e.message);
      showToolMessage("export-message", "Export failed: " + e.message, true);
    }
  });

  document.getElementById("btn-export-preview").addEventListener("click", async () => {
    const idView = document.getElementById("analysis-view-select").value;
    if (!idView) {
      showToolMessage("export-message", "Select a view first.", true);
      return;
    }

    const registryEntry = customGeoJSONRegistry.find((r) => r.id === idView);
    if (registryEntry) {
      const features = registryEntry.geojson.features || [];
      log(`Preview: ${features.length} local features`);
      log("Sample: " + JSON.stringify(features.slice(0, 2), null, 2));

      let html = `<h4>Local Data Preview (${features.length} features)</h4>`;
      html += '<pre style="white-space:pre-wrap;font-size:1.1rem;max-height:200px;overflow:auto;">';
      html += esc(JSON.stringify(features.slice(0, 3), null, 2));
      html += "</pre>";
      showToolResults("export-results", html);
      showToolMessage("export-message", `${features.length} features in local registry.`);
      return;
    }

    showToolMessage("export-message", "Loading preview...");

    try {
      const data = await downloadViewSourceGeojson(idView, "data");

      if (data && data.features) {
        const sample = data.features.slice(0, 3);
        log(`Preview: ${data.features.length} features total, showing ${sample.length}`);
        log("Sample: " + JSON.stringify(sample, null, 2));

        let html = `<h4>Data Preview (${data.features.length} features)</h4>`;
        html += '<pre style="white-space:pre-wrap;font-size:1.1rem;max-height:200px;overflow:auto;">';
        html += esc(JSON.stringify(sample, null, 2));
        html += "</pre>";
        showToolResults("export-results", html);
        showToolMessage("export-message", `${data.features.length} features available for export.`);
      } else {
        showToolMessage("export-message", "No previewable data for this view type.", true);
      }
    } catch (e) {
      log("Preview error: " + e.message);
      showToolMessage("export-message", "Preview failed: " + e.message, true);
    }
  });
}
