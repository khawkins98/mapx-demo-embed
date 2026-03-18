import { log } from "../log.js";
import { esc } from "../../lib/esc.js";
import { computeLocalStats } from "../../lib/stats.js";
import { customGeoJSONRegistry } from "../../state/store.js";
import { getViewTableAttributeConfig } from "../../sdk/data-query.js";
import { getSDK } from "../../sdk/client.js";
import { mapWaitIdle } from "../../sdk/map-control.js";
import { showToolMessage, showToolResults, clearToolResults } from "./tool-helpers.js";
import { getViewType } from "./view-select.js";

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
        html += `<div style="margin-top:0.5rem;"><strong>${esc(label)}</strong>`;
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
        const config = await getViewTableAttributeConfig(idView);
        if (config && config.attributes && config.attributes.length > 0) {
          idAttr = config.attributes[0];
          log(`Using attribute: ${idAttr}`);
        }
      } catch (e) {
        log("Attribute config not available: " + e.message);
      }

      const summaryParams = { idView, stats: ["base", "attributes"] };
      if (idAttr) summaryParams.idAttr = idAttr;

      const summary = await getSDK().ask("get_view_source_summary", summaryParams);
      log("Source summary: " + JSON.stringify(summary).substring(0, 500));

      let html = "<h4>View Statistics</h4>";

      if (summary) {
        if (summary.row_count != null) {
          html += `<table><tr><td>Feature Count</td><td>${summary.row_count}</td></tr></table>`;
        }

        if (summary.attribute_stat) {
          const stat = summary.attribute_stat;
          html += `<div style="margin-top:0.5rem;"><strong>Attribute: ${esc(idAttr || "primary")}</strong></div>`;
          html += "<table>";
          if (stat.min != null) html += `<tr><td>Min</td><td>${stat.min}</td></tr>`;
          if (stat.max != null) html += `<tr><td>Max</td><td>${stat.max}</td></tr>`;
          if (stat.mean != null) html += `<tr><td>Mean</td><td>${Number(stat.mean).toFixed(4)}</td></tr>`;
          if (stat.median != null) html += `<tr><td>Median</td><td>${stat.median}</td></tr>`;
          if (stat.sum != null) html += `<tr><td>Sum</td><td>${stat.sum}</td></tr>`;
          html += "</table>";
        }

        if (summary.table && Array.isArray(summary.table) && summary.table.length > 0) {
          html += '<div style="margin-top:0.5rem;"><strong>Categories</strong></div>';
          html += "<table><tr><th>Value</th><th>Count</th></tr>";
          for (const row of summary.table.slice(0, 20)) {
            const val = row.value || row.category || Object.values(row)[0];
            const cnt = row.count || row.frequency || Object.values(row)[1] || "";
            html += `<tr><td>${esc(val)}</td><td>${esc(cnt)}</td></tr>`;
          }
          if (summary.table.length > 20) {
            html += `<tr><td colspan="2" style="color:#666;">...and ${summary.table.length - 20} more</td></tr>`;
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
      showToolMessage("stats-message", "Failed: " + e.message, true);
    }
  });
}
