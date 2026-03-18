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
