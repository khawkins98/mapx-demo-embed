/*
 * View statistics — two paths depending on data source
 *
 * For MapX vector tile (vt) views:
 *   We call get_view_source_summary with stats: ["base", "attributes"]. The
 *   server returns row counts, and if we can discover an attribute via
 *   get_view_table_attribute_config, we also get min/max/mean/median/sum for
 *   that attribute plus a category breakdown table.
 *
 * For custom GeoJSON views (our locally-added overlays):
 *   There's no server-side source to query, so we compute stats locally with
 *   computeLocalStats from the customGeoJSONRegistry. That function walks
 *   every feature, classifies each property as numeric or categorical, and
 *   produces the same kind of summary (min/max/mean for numbers, frequency
 *   counts for strings).
 *
 * Raster and custom-code views also go through the server path. They may
 * return limited data depending on what the MapX backend can extract.
 */

import { log } from "../log.js";
import { esc } from "../../lib/esc.js";
import { computeLocalStats } from "../../lib/stats.js";
import { customGeoJSONRegistry } from "../../state/store.js";
import { getViewTableAttributeConfig, getViewSourceSummary } from "../../sdk/data-query.js";
import { mapWaitIdle } from "../../sdk/map-control.js";
import { showToolMessage, showToolResults, clearToolResults } from "./tool-helpers.js";
import { getViewType } from "./view-select.js";

/**
 * Wrap a promise with a timeout so the UI never hangs indefinitely.
 *
 * The MapX SDK calls (get_view_table_attribute_config, get_view_source_summary)
 * go through the postMessage bridge and occasionally stall — particularly for
 * raster/custom-coded views that have no attribute table. Without a timeout the
 * "Loading statistics..." spinner would spin forever. The caller catches the
 * resulting "Request timed out" error and can show a view-type-specific message
 * (e.g. "raster views do not expose attribute data").
 *
 * @param {Promise<T>} promise — The async operation to guard.
 * @param {number}     ms      — Maximum wait time in milliseconds.
 * @returns {Promise<T>} Resolves with the original value or rejects with a
 *   timeout Error.
 * @template T
 */
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms)),
  ]);
}

export function enableStatistics() {
  document.getElementById("btn-get-stats").addEventListener("click", async () => {
    const idView = document.getElementById("analysis-view-select").value;
    if (!idView) {
      showToolMessage("stats-message", "Select a view first.", true);
      return;
    }

    showToolMessage("stats-message", "Loading statistics...");
    clearToolResults("stats-results");

    const viewType = getViewType(idView);

    if (viewType === "geojson") {
      const entry = customGeoJSONRegistry.find((r) => r.id === idView);
      if (!entry) {
        showToolMessage("stats-message", "No local data found for this view.", true);
        return;
      }

      const stats = computeLocalStats(entry.geojson);
      log(`Local stats: ${stats.count} features, ${Object.keys(stats.attributes).length} attributes`);
      showToolMessage("stats-message", `${stats.count} features (local data)`);

      let html = `<h4>${stats.count} Features</h4>`;
      for (const [attr, info] of Object.entries(stats.attributes)) {
        const label = attr.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        html += `<div class="stat-section"><strong>${esc(label)}</strong>`;
        if (info.type === "numeric") {
          html += `<table>
            <tr><td>Min</td><td>${info.min}</td></tr>
            <tr><td>Max</td><td>${info.max}</td></tr>
            <tr><td>Mean</td><td>${info.mean.toFixed(2)}</td></tr>
            <tr><td>Count</td><td>${info.count}</td></tr>
          </table>`;
        } else {
          html += "<table><tr><th>Value</th><th>Count</th></tr>";
          for (const [val, cnt] of Object.entries(info.categories).sort((a, b) => b[1] - a[1])) {
            html += `<tr><td>${esc(val)}</td><td>${cnt}</td></tr>`;
          }
          html += "</table>";
        }
        html += "</div>";
      }

      showToolResults("stats-results", html);
      return;
    }

    try {
      await mapWaitIdle();

      let idAttr = null;
      try {
        const config = await withTimeout(getViewTableAttributeConfig(idView), 10000);
        if (config && config.attributes && config.attributes.length > 0) {
          idAttr = config.attributes[0];
          log(`Using attribute: ${idAttr}`);
        }
      } catch (e) {
        log("Attribute config not available: " + e.message);
      }

      const summary = await withTimeout(
        getViewSourceSummary(idView, idAttr, ["base", "attributes"]),
        15000,
      );
      log("Source summary: " + JSON.stringify(summary).substring(0, 500));

      let html = "<h4>View Statistics</h4>";

      if (summary) {
        if (summary.row_count != null) {
          html += `<table><tr><td>Feature Count</td><td>${summary.row_count}</td></tr></table>`;
        }

        if (summary.attribute_stat) {
          const stat = summary.attribute_stat;
          html += `<div class="stat-section"><strong>Attribute: ${esc(idAttr || "primary")}</strong></div>`;
          html += "<table>";
          if (stat.min != null) html += `<tr><td>Min</td><td>${stat.min}</td></tr>`;
          if (stat.max != null) html += `<tr><td>Max</td><td>${stat.max}</td></tr>`;
          if (stat.mean != null) html += `<tr><td>Mean</td><td>${Number(stat.mean).toFixed(4)}</td></tr>`;
          if (stat.median != null) html += `<tr><td>Median</td><td>${stat.median}</td></tr>`;
          if (stat.sum != null) html += `<tr><td>Sum</td><td>${stat.sum}</td></tr>`;
          html += "</table>";
        }

        if (summary.table && Array.isArray(summary.table) && summary.table.length > 0) {
          html += '<div class="stat-section"><strong>Categories</strong></div>';
          html += "<table><tr><th>Value</th><th>Count</th></tr>";
          for (const row of summary.table.slice(0, 20)) {
            const val = row.value || row.category || Object.values(row)[0];
            const cnt = row.count || row.frequency || Object.values(row)[1] || "";
            html += `<tr><td>${esc(val)}</td><td>${esc(cnt)}</td></tr>`;
          }
          if (summary.table.length > 20) {
            html += `<tr><td colspan="2" class="mg-u-color--neutral-500">...and ${summary.table.length - 20} more</td></tr>`;
          }
          html += "</table>";
        }
      } else {
        html += "<p>No summary data returned for this view.</p>";
      }

      showToolMessage("stats-message", "Statistics loaded.");
      showToolResults("stats-results", html);
    } catch (e) {
      log("Statistics error: " + e.message);
      /* Raster (rt) and custom-coded (cc) views don't have a queryable attribute
       * table on the server, so get_view_source_summary will hang until our
       * withTimeout fires. We detect this specific combination and show a
       * friendlier explanation instead of a generic timeout error — the user
       * needs to know this is a view-type limitation, not a transient failure. */
      if (e.message === "Request timed out" && (viewType === "rt" || viewType === "cc")) {
        showToolMessage("stats-message",
          "Statistics are not available for this layer — raster and custom-coded views do not expose attribute data for server-side summary.",
          true,
        );
      } else {
        showToolMessage("stats-message", "Failed: " + e.message, true);
      }
    }
  });
}
