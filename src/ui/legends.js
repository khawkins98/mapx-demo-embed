/**
 * Legend panel — displays legend images for active views.
 *
 * When a view is toggled on, its legend is fetched via the SDK's
 * get_view_legend_image({idView}) method which returns a base64-encoded
 * PNG image. Legends are displayed in a floating panel pinned to the
 * bottom-right of the map area.
 *
 * The panel updates automatically as views are added/removed:
 *   - addLegend(idView, label)    — fetch and display a view's legend
 *   - removeLegend(idView)        — remove a view's legend entry
 *   - clearAllLegends()           — remove all legend entries (used by reset)
 *
 * Design decisions:
 *   - Panel is hidden when no legends are active (display:none)
 *   - Each legend entry includes the view label for context
 *   - Failed legend fetches are silently skipped (not all views have legends)
 *   - The panel is scrollable for when many views are active
 *
 * SDK method used:
 *   get_view_legend_image({idView}) → returns base64 PNG string or null
 */

import { getViewLegendImage } from "../sdk/views.js";
import { log } from "./log.js";

/** @type {Map<string, HTMLElement>} Active legend entries keyed by view ID */
const activeLegends = new Map();

/**
 * Get or create the floating legends panel DOM element.
 * The panel is created once and reused across the session.
 * @returns {HTMLElement} The legends panel container
 */
function getPanel() {
  let panel = document.getElementById("legends-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "legends-panel";
    panel.className = "legends-panel";
    panel.innerHTML = `
      <div class="legends-panel-header">
        <strong>Legends</strong>
        <button id="legends-panel-toggle" class="legends-collapse-btn" title="Collapse" aria-label="Collapse legends panel">&#x25BC;</button>
      </div>
      <div class="legends-panel-body" id="legends-panel-body"></div>
    `;
    document.querySelector(".app-map").appendChild(panel);

    /* Toggle collapse/expand on header button click */
    panel.querySelector("#legends-panel-toggle").addEventListener("click", () => {
      const body = panel.querySelector(".legends-panel-body");
      const btn = panel.querySelector("#legends-panel-toggle");
      const collapsed = body.style.display === "none";
      body.style.display = collapsed ? "block" : "none";
      btn.innerHTML = collapsed ? "&#x25BC;" : "&#x25B6;";
      btn.title = collapsed ? "Collapse" : "Expand";
    });
  }
  return panel;
}

/**
 * Update panel visibility — show when legends exist, hide when empty.
 */
function updatePanelVisibility() {
  const panel = getPanel();
  panel.style.display = activeLegends.size > 0 ? "flex" : "none";
}

/**
 * Fetch and display a legend image for a view.
 * Called when a view is toggled on. Silently no-ops if the view
 * has no legend or the fetch fails.
 *
 * @param {string} idView - MapX view ID
 * @param {string} label  - Human-readable view label for display
 */
export async function addLegend(idView, label) {
  try {
    const legendData = await getViewLegendImage(idView);
    if (!legendData) return; /* View has no legend — skip silently */

    const panel = getPanel();
    const body = panel.querySelector("#legends-panel-body");

    /* Build legend entry: label + image */
    const entry = document.createElement("div");
    entry.className = "legend-entry";
    entry.dataset.idView = idView;

    const title = document.createElement("div");
    title.className = "legend-entry-title";
    title.textContent = label;
    entry.appendChild(title);

    const img = document.createElement("img");
    /* legendData may be a base64 string or a data URL */
    img.src = legendData.startsWith("data:") ? legendData : `data:image/png;base64,${legendData}`;
    img.alt = `Legend for ${label}`;
    img.className = "legend-entry-image";
    entry.appendChild(img);

    body.appendChild(entry);
    activeLegends.set(idView, entry);
    updatePanelVisibility();
    log(`Legend loaded: ${label}`);
  } catch (e) {
    /* Not all views have legends — this is expected for some view types */
    log(`Legend unavailable for ${label}: ${e.message}`);
  }
}

/**
 * Remove a view's legend entry from the panel.
 * Called when a view is toggled off.
 *
 * @param {string} idView - MapX view ID to remove
 */
export function removeLegend(idView) {
  const entry = activeLegends.get(idView);
  if (entry) {
    entry.remove();
    activeLegends.delete(idView);
    updatePanelVisibility();
  }
}

/**
 * Remove all legend entries. Called by clearAllViews() during reset.
 */
export function clearAllLegends() {
  activeLegends.forEach((entry) => entry.remove());
  activeLegends.clear();
  updatePanelVisibility();
}
