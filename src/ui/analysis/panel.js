/*
 * Analysis tools — floating panel architecture
 *
 * Four tools live behind the "Active View" dropdown:
 *   1. Numeric filter  — set_view_layer_filter_numeric on a chosen attribute
 *   2. Spatial query    — queryRenderedFeatures by viewport, box, or polygon
 *   3. Statistics       — get_view_source_summary (server) or computeLocalStats (local)
 *   4. Data export      — download_view_source_geojson or local GeoJSON copy
 *
 * Every tool targets whichever layer is selected in the "Active View" dropdown.
 * What's available depends on the view type:
 *   - vt (vector tile):  all four tools work
 *   - geojson (custom):  spatial query, statistics, and export work; numeric filter is N/A
 *   - rt (raster):       statistics only — no attribute table, no vector features to query
 *   - cc (custom code):  statistics only — same limitations as raster
 *
 * We use a floating, draggable panel rather than embedding in the sidebar because the
 * analysis output (tables, sample features, stat breakdowns) needs more room than a
 * narrow sidebar column can comfortably provide. The panel is drag-to-move from the
 * header and resize from the bottom-right corner grip.
 */

import { enableNumericFilter } from "./numeric-filter.js";
import { enableSpatialQuery } from "./spatial-query.js";
import { enableStatistics } from "./statistics.js";
import { enableDataExport } from "./data-export.js";

export function enableAnalysisTools() {
  document
    .querySelectorAll(".analysis-tool .mg-button, #btn-toggle-analysis")
    .forEach((b) => b.classList.remove("disabled"));

  const panel = document.getElementById("analysis-panel");
  const panelHeader = document.getElementById("analysis-panel-header");
  const panelResize = document.getElementById("analysis-panel-resize");
  const toggleBtn = document.getElementById("btn-toggle-analysis");
  const panelCloseBtn = document.getElementById("analysis-panel-close");

  function openAnalysisPanel() {
    panel.style.display = "flex";
    toggleBtn.textContent = "Close Analysis Panel";
    toggleBtn.classList.add("is-active");
  }
  function closeAnalysisPanel() {
    panel.style.display = "none";
    toggleBtn.textContent = "Open Analysis Panel";
    toggleBtn.classList.remove("is-active");
  }

  toggleBtn.addEventListener("click", () => {
    if (panel.style.display === "none") openAnalysisPanel();
    else closeAnalysisPanel();
  });
  panelCloseBtn.addEventListener("click", closeAnalysisPanel);

  /* Drag */
  panelHeader.addEventListener("mousedown", (e) => {
    if (e.target === panelCloseBtn) return;
    e.preventDefault();
    const mapArea = panel.parentElement;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = panel.offsetLeft;
    const startTop = panel.offsetTop;

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const maxLeft = mapArea.clientWidth - panel.offsetWidth;
      const maxTop = mapArea.clientHeight - panel.offsetHeight;
      panel.style.left = Math.max(0, Math.min(maxLeft, startLeft + dx)) + "px";
      panel.style.top = Math.max(0, Math.min(maxTop, startTop + dy)) + "px";
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  /* Resize */
  panelResize.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = panel.offsetWidth;
    const startH = panel.offsetHeight;

    function onMove(ev) {
      panel.style.width = Math.max(280, startW + (ev.clientX - startX)) + "px";
      panel.style.height = Math.max(180, startH + (ev.clientY - startY)) + "px";
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  enableNumericFilter();
  enableSpatialQuery();
  enableStatistics();
  enableDataExport();
}
