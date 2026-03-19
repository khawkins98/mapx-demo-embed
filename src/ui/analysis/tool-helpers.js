import * as store from "../../state/store.js";

/*
 * Basemap layer filter for spatial query results.
 *
 * queryRenderedFeatures returns everything on screen, including MapX's
 * basemap layers (boundaries, bathymetry, hillshading, labels, water).
 * Those are noise for analysis purposes — the user wants features from
 * the views they've toggled on and the custom overlays they've added.
 *
 * We keep a feature if its layer ID:
 *   - starts with "MX-" (a MapX-managed view layer)
 *   - matches one of our custom source IDs (passthrough layers)
 *   - starts with "query-" or "box-select-" or "polygon-select-"
 *     (our own highlight layers, which we then skip separately)
 *
 * Everything else (boundary_un_*, bathymetry, hillshading, water,
 * country_un_*_label_*, etc.) gets dropped.
 */
const HIGHLIGHT_PREFIXES = ["query-highlight-", "box-select-bbox", "polygon-select-"];

export function filterBasemapFeatures(features) {
  const customSourceIds = new Set(
    store.customGeoJSONRegistry.map((r) => r.id),
  );

  return features.filter((f) => {
    const layerId = f.layer?.id || "";
    const source = f.source || "";

    /* Skip our own highlight layers */
    if (HIGHLIGHT_PREFIXES.some((p) => layerId.startsWith(p))) return false;

    /* Keep MapX view layers */
    if (layerId.startsWith("MX-")) return true;

    /* Keep custom overlay layers */
    if (customSourceIds.has(source) || customSourceIds.has(layerId)) return true;

    return false;
  });
}

/** Show a message inside a tool's message element. */
export function showToolMessage(elId, text, isError) {
  const el = document.getElementById(elId);
  el.textContent = text;
  el.className = isError ? "tool-message error" : "tool-message";
}

/** Show HTML content in a tool's results panel. */
export function showToolResults(elId, html) {
  const el = document.getElementById(elId);
  el.innerHTML = html;
  el.classList.add("has-results");
}

/** Clear a tool's results panel. */
export function clearToolResults(elId) {
  const el = document.getElementById(elId);
  el.innerHTML = "";
  el.classList.remove("has-results");
}
