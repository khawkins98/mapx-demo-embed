/*
 * View selection and tool-state logic for the analysis panel
 *
 * getViewType(idView)
 *   Resolves a view ID to its type string. Checks CURATED_VIEWS first (the
 *   pre-configured MapX layers we know about), then falls back to checking
 *   whether idView matches one of the custom GeoJSON views the user added
 *   at runtime. Returns null for anything unrecognized.
 *
 * updateAnalysisViewSelect()
 *   Rebuilds the "Active View" dropdown from scratch. Sources are the
 *   openViews set (MapX views the user has toggled on) plus any custom
 *   GeoJSON overlays currently registered. Preserves the previous selection
 *   when possible so switching a different view on/off doesn't reset the
 *   user's analysis context.
 *
 * updateAnalysisToolState()
 *   Enables or disables individual tool sections based on the selected view's
 *   type. Raster (rt) and custom-coded (cc) views disable numeric filter,
 *   spatial query, and data export because:
 *     - rt: no attribute table to filter, no vector features for
 *       queryRenderedFeatures, and no downloadable GeoJSON source
 *     - cc: same story — the data is generated client-side by custom code
 *       and has no server-side source to query or export
 *   A notice banner explains the limitation when it kicks in.
 */

import { CURATED_VIEWS } from "../../config/views.js";
import * as store from "../../state/store.js";

/**
 * Look up the view type for a given view ID or source ID.
 * Checks curated MapX views first, then custom GeoJSON views,
 * then the local GeoJSON registry (which includes Mapbox passthrough
 * layers like monitoring stations).
 */
export function getViewType(idView) {
  const curated = CURATED_VIEWS.find((v) => v.id === idView);
  if (curated) return curated.type;
  if (idView === store.geojsonViewId || idView === store.polygonViewId) return "geojson";
  /* Passthrough layers registered in the GeoJSON registry (e.g. monitoring
   * stations added via map.addSource) don't have a MapX view ID, but we
   * use their source ID as a pseudo-view ID so the analysis tools can
   * target them for statistics and export. */
  if (store.customGeoJSONRegistry.some((r) => r.id === idView)) return "geojson";
  return null;
}

/** Rebuild the "Active View" dropdown with all currently open views. */
export function updateAnalysisViewSelect() {
  const select = document.getElementById("analysis-view-select");
  if (!select) return;
  const previousValue = select.value;
  select.innerHTML = "";

  const entries = [];

  /* Human-readable type labels shown in brackets after each view name in the
   * dropdown (e.g. "Flood Hazard [raster]"). Helps the user understand at a
   * glance which analysis tools will be available for each entry — raster and
   * custom views disable most tools, while vector and geojson enable all. */
  const TYPE_LABELS = { rt: "raster", vt: "vector", cc: "custom", sm: "story" };

  for (const idView of store.openViews) {
    const curated = CURATED_VIEWS.find((v) => v.id === idView);
    if (curated) {
      const typeLabel = TYPE_LABELS[curated.type] || curated.type;
      entries.push({ id: idView, label: `${curated.label} [${typeLabel}]` });
    } else {
      /* View isn't in the curated list — fall back to the GeoJSON registry
       * for a human-readable label. This covers dynamically-created views
       * (damage overlay, monitoring stations, etc.) that registered a label
       * via registerGeoJSON(). Without this fallback the dropdown would
       * show a raw UUID which is meaningless to the user. */
      const regEntry = store.customGeoJSONRegistry.find((r) => r.id === idView);
      const label = regEntry?.label ? `${regEntry.label} [geojson]` : `${idView}`;
      entries.push({ id: idView, label });
    }
  }

  if (store.geojsonViewId) entries.push({ id: store.geojsonViewId, label: "DRR Field Offices [geojson]" });
  if (store.polygonViewId) entries.push({ id: store.polygonViewId, label: "DRR Project Zones [geojson]" });

  /* Passthrough layers (added via map.addSource, not view_geojson_create)
   * don't have a MapX view ID. We add them using their source ID so the
   * user can run statistics and export on them too. */
  if (store.markersAdded) entries.push({ id: store.MARKERS_SOURCE, label: "Monitoring Stations [passthrough]" });

  /* Generic registry entries — any GeoJSON datasets registered by other
   * demos (e.g. damage overlay in explorer) that aren't already listed
   * via the hardcoded special cases above. */
  for (const entry of store.customGeoJSONRegistry) {
    if (!entries.some((e) => e.id === entry.id)) {
      const tag = entry.label ? `${entry.label} [geojson]` : `${entry.id} [geojson]`;
      entries.push({ id: entry.id, label: tag });
    }
  }

  if (entries.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No views open";
    select.appendChild(opt);
    select.disabled = true;
  } else {
    entries.forEach(({ id, label }) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = label;
      select.appendChild(opt);
    });
    select.disabled = false;
    if (entries.some((e) => e.id === previousValue)) {
      select.value = previousValue;
    } else {
      /* Default to the first GeoJSON entry. GeoJSON views support all analysis
       * tools (filter, spatial query, statistics, export) while raster/custom
       * views disable most of them. Pre-selecting a GeoJSON view gives new users
       * the most capable starting point without extra clicks. */
      const geojsonEntry = entries.find((e) => e.label.includes("[geojson]"));
      if (geojsonEntry) select.value = geojsonEntry.id;
    }
  }

  updateAnalysisToolState();

  // Dispatch change so listeners (e.g. numeric filter) pick up the new value
  select.dispatchEvent(new Event("change"));
}

/** Enable/disable analysis tool panels based on the selected view type. */
export function updateAnalysisToolState() {
  const idView = document.getElementById("analysis-view-select")?.value;
  const viewType = idView ? getViewType(idView) : null;
  const notice = document.getElementById("analysis-notice");

  const numericFilter = document.getElementById("tool-numeric-filter");
  const spatialQuery = document.getElementById("tool-spatial-query");
  const statistics = document.getElementById("tool-statistics");
  const dataExport = document.getElementById("tool-data-export");

  if (!numericFilter) return;

  [numericFilter, spatialQuery, statistics, dataExport].forEach((el) => {
    el.classList.remove("tool-disabled");
  });
  notice.classList.remove("visible");

  if (!idView) return;

  if (viewType === "rt" || viewType === "cc") {
    numericFilter.classList.add("tool-disabled");
    spatialQuery.classList.add("tool-disabled");
    statistics.classList.add("tool-disabled");
    dataExport.classList.add("tool-disabled");
    notice.classList.add("visible");

    if (viewType === "rt") {
      notice.textContent = "Raster layer selected — analysis tools are not available for raster data. Select a GeoJSON or vector layer.";
    } else {
      notice.textContent = "Custom-coded layer selected — analysis tools are not available for this view type.";
    }
  }
}
