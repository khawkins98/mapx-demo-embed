/**
 * Trigger a GeoJSON file download in the browser.
 *
 * Creates an in-memory Blob from the JSON data, generates a temporary
 * object URL for it, then creates a hidden <a> element with the
 * download attribute set. Clicking that anchor kicks off the browser's
 * "Save As" flow. The anchor and object URL are cleaned up immediately
 * afterward so we don't leak memory.
 */
export function downloadGeoJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/geo+json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
