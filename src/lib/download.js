/*
 * Browser-side file download helpers.
 *
 * Both public functions (downloadGeoJSON, downloadFeaturesCSV) produce an
 * in-memory Blob and hand it to downloadBlob(), which creates a temporary
 * object URL and programmatically clicks a hidden <a download> element to
 * trigger the browser's "Save As" dialog. No server round-trip is needed.
 */

/**
 * Trigger a GeoJSON file download in the browser.
 *
 * Creates an in-memory Blob from the JSON data, generates a temporary
 * object URL for it, then creates a hidden <a> element with the
 * download attribute set. Clicking that anchor kicks off the browser's
 * "Save As" flow. The anchor and object URL are cleaned up immediately
 * afterward so we don't leak memory.
 *
 * @param {object} data     — Any JSON-serializable value (typically a GeoJSON
 *   FeatureCollection). Pretty-printed with two-space indent for readability.
 * @param {string} filename — Suggested filename including extension (e.g. "selection.geojson").
 */
export function downloadGeoJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/geo+json",
  });
  downloadBlob(blob, filename);
}

/**
 * Convert an array of Mapbox rendered features to CSV and trigger download.
 *
 * CSV structure:
 *   - Header row: `longitude, latitude, ...propertyKeys`
 *   - longitude/latitude are extracted from Point geometry coordinates;
 *     non-Point features get empty coordinate columns.
 *   - Property columns are the union of every key found across all features,
 *     so rows whose features lack a given key get an empty cell.
 *   - Values containing commas, double-quotes, or newlines are quoted per
 *     RFC 4180 (double-quotes are escaped by doubling them).
 *
 * @param {Array<object>} features — Mapbox GL rendered feature objects
 *   (as returned by queryRenderedFeatures). Each must have `.geometry`
 *   and `.properties`.
 * @param {string} filename — Suggested filename including extension (e.g. "selection.csv").
 */
export function downloadFeaturesCSV(features, filename) {
  const propKeys = new Set();
  for (const f of features) {
    for (const k of Object.keys(f.properties || {})) propKeys.add(k);
  }
  const columns = ["longitude", "latitude", ...propKeys];

  const csvCell = (val) => {
    if (val == null) return "";
    const s = String(val);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const rows = [columns.map(csvCell).join(",")];
  for (const f of features) {
    const coords = f.geometry?.coordinates || [];
    const lng = f.geometry?.type === "Point" ? coords[0] : "";
    const lat = f.geometry?.type === "Point" ? coords[1] : "";
    const cells = [csvCell(lng), csvCell(lat)];
    for (const k of propKeys) {
      cells.push(csvCell(f.properties?.[k]));
    }
    rows.push(cells.join(","));
  }

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, filename);
}

/**
 * Internal helper — creates a temporary object URL, clicks a hidden anchor
 * to trigger the browser download, and cleans up immediately.
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
