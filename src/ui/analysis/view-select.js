import { CURATED_VIEWS } from "../../config/views.js";
import * as store from "../../state/store.js";

/** Look up the view type for a given view ID. */
export function getViewType(idView) {
  const curated = CURATED_VIEWS.find((v) => v.id === idView);
  if (curated) return curated.type;
  if (idView === store.geojsonViewId || idView === store.polygonViewId) return "geojson";
  return null;
}

/** Rebuild the "Active View" dropdown with all currently open views. */
export function updateAnalysisViewSelect() {
  const select = document.getElementById("analysis-view-select");
  if (!select) return;
  const previousValue = select.value;
  select.innerHTML = "";

  const entries = [];

  for (const idView of store.openViews) {
    const curated = CURATED_VIEWS.find((v) => v.id === idView);
    const label = curated ? `${curated.label} [${curated.type}]` : `${idView}`;
    entries.push({ id: idView, label });
  }

  if (store.geojsonViewId) entries.push({ id: store.geojsonViewId, label: "DRR Field Offices [geojson]" });
  if (store.polygonViewId) entries.push({ id: store.polygonViewId, label: "DRR Project Zones [geojson]" });

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
    }
  }

  updateAnalysisToolState();
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
    dataExport.classList.add("tool-disabled");
    notice.classList.add("visible");

    if (viewType === "rt") {
      notice.textContent = "Raster layer selected — filtering, spatial query, and export are not available for raster data.";
    } else {
      notice.textContent = "Custom-coded layer selected — filtering, spatial query, and export are not available for this view type.";
    }
  }
}
