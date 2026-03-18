import { log } from "../log.js";
import { getViewTableAttributeConfig } from "../../sdk/data-query.js";
import { getSDK } from "../../sdk/client.js";
import { mapWaitIdle } from "../../sdk/map-control.js";
import { setViewLayerFilterNumeric } from "../../sdk/filters.js";
import { showToolMessage, clearToolResults } from "./tool-helpers.js";
import { getViewType, updateAnalysisToolState } from "./view-select.js";

export function enableNumericFilter() {
  const filterAttrSelect = document.getElementById("filter-attr-select");
  const filterFrom = document.getElementById("filter-from");
  const filterTo = document.getElementById("filter-to");

  document.getElementById("analysis-view-select").addEventListener("change", async () => {
    const idView = document.getElementById("analysis-view-select").value;
    updateAnalysisToolState();
    filterAttrSelect.innerHTML = '<option value="">Loading...</option>';
    filterFrom.value = "";
    filterTo.value = "";
    filterFrom.disabled = true;
    filterTo.disabled = true;
    clearToolResults("filter-results");
    showToolMessage("filter-message", "");

    if (!idView) {
      filterAttrSelect.innerHTML = '<option value="">Select a view first</option>';
      return;
    }

    const viewType = getViewType(idView);
    if (viewType !== "vt") {
      filterAttrSelect.innerHTML = '<option value="">N/A — not a vector view</option>';
      showToolMessage("filter-message", "Numeric filter only works on vector tile (vt) views.", true);
      return;
    }

    try {
      log(`Discovering attributes for ${idView}...`);
      const config = await getViewTableAttributeConfig(idView);
      log("Attribute config: " + JSON.stringify(config).substring(0, 300));

      if (config && config.attributes && config.attributes.length > 0) {
        filterAttrSelect.innerHTML = "";
        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = "Choose attribute...";
        filterAttrSelect.appendChild(defaultOpt);

        for (const attr of config.attributes) {
          const opt = document.createElement("option");
          opt.value = attr;
          const label = (config.labels && config.labels[attr]) || attr;
          opt.textContent = label;
          filterAttrSelect.appendChild(opt);
        }
      } else {
        filterAttrSelect.innerHTML = '<option value="">No attributes found</option>';
      }
    } catch (e) {
      log("Attribute discovery error: " + e.message);
      filterAttrSelect.innerHTML = '<option value="">Error loading attributes</option>';
      showToolMessage("filter-message", e.message, true);
    }
  });

  filterAttrSelect.addEventListener("change", async () => {
    const idView = document.getElementById("analysis-view-select").value;
    const idAttr = filterAttrSelect.value;
    filterFrom.value = "";
    filterTo.value = "";
    clearToolResults("filter-results");

    if (!idAttr || !idView) {
      filterFrom.disabled = true;
      filterTo.disabled = true;
      return;
    }

    try {
      showToolMessage("filter-message", "Fetching attribute range...");
      await mapWaitIdle();
      const summary = await getSDK().ask("get_view_source_summary", {
        idView,
        idAttr,
        stats: ["attributes"],
      });
      log("Attribute summary: " + JSON.stringify(summary).substring(0, 400));

      if (summary && summary.attribute_stat) {
        const stat = summary.attribute_stat;
        if (stat.min != null) {
          filterFrom.placeholder = `min: ${stat.min}`;
          filterFrom.value = stat.min;
        }
        if (stat.max != null) {
          filterTo.placeholder = `max: ${stat.max}`;
          filterTo.value = stat.max;
        }
        filterFrom.disabled = false;
        filterTo.disabled = false;
        showToolMessage("filter-message", `Range: ${stat.min} to ${stat.max}`);
      } else {
        filterFrom.disabled = false;
        filterTo.disabled = false;
        showToolMessage("filter-message", "Could not determine range — enter values manually.");
      }
    } catch (e) {
      log("Summary error: " + e.message);
      filterFrom.disabled = false;
      filterTo.disabled = false;
      showToolMessage("filter-message", "Could not fetch range: " + e.message, true);
    }
  });

  document.getElementById("btn-filter-apply").addEventListener("click", async () => {
    const idView = document.getElementById("analysis-view-select").value;
    const attribute = filterAttrSelect.value;
    const from = parseFloat(filterFrom.value);
    const to = parseFloat(filterTo.value);

    if (!idView || !attribute) {
      showToolMessage("filter-message", "Select a view and attribute first.", true);
      return;
    }
    if (isNaN(from) || isNaN(to)) {
      showToolMessage("filter-message", "Enter valid numeric from/to values.", true);
      return;
    }

    try {
      log(`Applying numeric filter: ${attribute} [${from}, ${to}] on ${idView}`);
      await setViewLayerFilterNumeric(idView, attribute, from, to);
      showToolMessage("filter-message", `Filter applied: ${attribute} between ${from} and ${to}`);
      log("Numeric filter applied");
    } catch (e) {
      log("Filter error: " + e.message);
      showToolMessage("filter-message", "Filter failed: " + e.message, true);
    }
  });

  document.getElementById("btn-filter-clear").addEventListener("click", async () => {
    const idView = document.getElementById("analysis-view-select").value;
    const attribute = filterAttrSelect.value;

    if (!idView || !attribute) {
      showToolMessage("filter-message", "Select a view and attribute first.", true);
      return;
    }

    try {
      log(`Clearing numeric filter on ${idView}`);
      await setViewLayerFilterNumeric(idView, attribute, null, null);
      showToolMessage("filter-message", "Filter cleared.");
      log("Numeric filter cleared");
    } catch (e) {
      log("Clear filter error: " + e.message);
      showToolMessage("filter-message", "Clear failed: " + e.message, true);
    }
  });
}
