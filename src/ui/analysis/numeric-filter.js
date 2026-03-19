/*
 * Numeric attribute filter
 *
 * Two paths depending on the view type:
 *
 *   vt (vector tile):
 *     Server-side flow — discover attributes via get_view_table_attribute_config,
 *     fetch min/max via get_view_source_summary, apply via set_view_layer_filter_numeric.
 *
 *   geojson (local registry):
 *     Client-side flow — scan feature properties for numeric fields, compute
 *     min/max locally, apply filter visually by setting circle-opacity via
 *     view_geojson_set_style (non-matching features become nearly transparent).
 *     On clear, the original paint spec (stored in the registry entry) is restored.
 */

import { log } from "../log.js";
import { getViewTableAttributeConfig } from "../../sdk/data-query.js";
import { mapWaitIdle } from "../../sdk/map-control.js";
import { getViewSourceSummary } from "../../sdk/data-query.js";
import { setViewLayerFilterNumeric } from "../../sdk/filters.js";
import { viewGeojsonSetStyle } from "../../sdk/views.js";
import { showToolMessage, clearToolResults } from "./tool-helpers.js";
import { getViewType, updateAnalysisToolState } from "./view-select.js";
import * as store from "../../state/store.js";

/**
 * Scan GeoJSON features for properties that are numeric in at least one feature.
 *
 * Mixed-type properties (e.g. "5" in one feature, 5 in another) will only be
 * included if at least one feature has a true `typeof "number"` value. This is
 * intentional — coercing strings would risk false positives on IDs or codes.
 *
 * @param {object} geojson — GeoJSON FeatureCollection to scan.
 * @returns {string[]} Sorted array of property names that contain numeric values.
 */
function discoverNumericAttributes(geojson) {
  const attrs = new Set();
  for (const f of geojson.features || []) {
    for (const [key, val] of Object.entries(f.properties || {})) {
      if (typeof val === "number") attrs.add(key);
    }
  }
  return [...attrs].sort();
}

/**
 * Compute min/max for a numeric attribute across all features.
 *
 * Non-numeric values for `attr` are silently skipped. If no feature has a
 * numeric value, both min and max are returned as `null`.
 *
 * @param {object} geojson — GeoJSON FeatureCollection.
 * @param {string} attr    — Property name to aggregate.
 * @returns {{ min: number|null, max: number|null }}
 */
function computeAttributeRange(geojson, attr) {
  let min = Infinity;
  let max = -Infinity;
  for (const f of geojson.features || []) {
    const val = f.properties?.[attr];
    if (typeof val === "number") {
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }
  return { min: min === Infinity ? null : min, max: max === -Infinity ? null : max };
}

/**
 * Find the registry entry for a view ID, if it exists.
 *
 * Used to determine whether a view has local GeoJSON data (client-side path)
 * or should be handled via server-side SDK calls (vt path).
 *
 * @param {string} idView — View ID or source ID.
 * @returns {object|undefined} The registry entry, or undefined if not found.
 */
function getRegistryEntry(idView) {
  return store.customGeoJSONRegistry.find((r) => r.id === idView);
}

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

    /* Local GeoJSON — discover attributes from the registry data */
    if (viewType === "geojson") {
      const entry = getRegistryEntry(idView);
      if (!entry) {
        filterAttrSelect.innerHTML = '<option value="">N/A — GeoJSON not in local registry</option>';
        showToolMessage("filter-message", "This GeoJSON view has no local data for filtering.", true);
        return;
      }

      const numericAttrs = discoverNumericAttributes(entry.geojson);
      if (numericAttrs.length === 0) {
        filterAttrSelect.innerHTML = '<option value="">No numeric attributes</option>';
        return;
      }

      filterAttrSelect.innerHTML = "";
      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.textContent = "Choose attribute...";
      filterAttrSelect.appendChild(defaultOpt);

      for (const attr of numericAttrs) {
        const opt = document.createElement("option");
        opt.value = attr;
        opt.textContent = attr;
        filterAttrSelect.appendChild(opt);
      }
      return;
    }

    /* Only vt views support server-side attribute discovery */
    if (viewType !== "vt") {
      filterAttrSelect.innerHTML = '<option value="">N/A — not a filterable view</option>';
      showToolMessage("filter-message", "Numeric filter is not available for this view type.", true);
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

    /* Local GeoJSON — compute range from registry data */
    const entry = getRegistryEntry(idView);
    if (entry) {
      const range = computeAttributeRange(entry.geojson, idAttr);
      if (range.min != null) {
        filterFrom.placeholder = `min: ${range.min}`;
        filterFrom.value = range.min;
      }
      if (range.max != null) {
        filterTo.placeholder = `max: ${range.max}`;
        filterTo.value = range.max;
      }
      filterFrom.disabled = false;
      filterTo.disabled = false;
      showToolMessage("filter-message", `Range: ${range.min} to ${range.max}`);
      return;
    }

    /* Server-side path for vt views */
    try {
      showToolMessage("filter-message", "Fetching attribute range...");
      await mapWaitIdle();
      const summary = await getViewSourceSummary(idView, idAttr, ["attributes"]);
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

      const entry = getRegistryEntry(idView);
      if (entry) {
        /* Local GeoJSON — apply a visual filter via Mapbox GL paint expressions.
         *
         * We can't use set_view_layer_filter_numeric (server-side) for local
         * GeoJSON because there's no server source to filter. Instead we build
         * a Mapbox "case" expression that sets circle-opacity to 1 for matching
         * features and 0.08 (near-transparent) for non-matching ones. This
         * keeps non-matching features faintly visible so the user retains
         * spatial context. The basePaint (stored in the registry at creation
         * time) is spread in so other paint properties (color, radius) are
         * preserved. On clear, basePaint is restored verbatim. */
        const basePaint = entry.paint || {};
        const filterExpr = [
          "case",
          ["all", [">=", ["get", attribute], from], ["<=", ["get", attribute], to]],
          1, 0.08,
        ];
        const filterPaint = {
          ...basePaint,
          "circle-opacity": filterExpr,
          "circle-stroke-opacity": filterExpr,
        };
        await viewGeojsonSetStyle(idView, filterPaint);

        const total = (entry.geojson.features || []).length;
        const matching = (entry.geojson.features || []).filter((f) => {
          const val = f.properties?.[attribute];
          return typeof val === "number" && val >= from && val <= to;
        }).length;
        showToolMessage("filter-message", `Filter applied: ${matching} of ${total} features match.`);
      } else {
        /* Server-side path for vt views */
        await setViewLayerFilterNumeric(idView, attribute, from, to);
        showToolMessage("filter-message", `Filter applied: ${attribute} between ${from} and ${to}`);
      }
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

      const entry = getRegistryEntry(idView);
      if (entry) {
        /* Restore original paint */
        const basePaint = entry.paint || {};
        await viewGeojsonSetStyle(idView, basePaint);
      } else {
        await setViewLayerFilterNumeric(idView, attribute, null, null);
      }
      showToolMessage("filter-message", "Filter cleared.");
      log("Numeric filter cleared");
    } catch (e) {
      log("Clear filter error: " + e.message);
      showToolMessage("filter-message", "Clear failed: " + e.message, true);
    }
  });
}
