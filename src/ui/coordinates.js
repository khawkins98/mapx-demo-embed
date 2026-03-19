/**
 * Coordinate + zoom display bar.
 *
 * Shows the current map center (lat, lng) and zoom level in a small
 * bar at the bottom of the map area. Updates on every camera move
 * via the SDK's map event passthrough.
 *
 * Architecture:
 *   - Creates a fixed bar element inside .app-map on init
 *   - Uses the SDK's "map" resolver to call getCenter() and getZoom()
 *   - Polls on "moveend" events via a lightweight interval since the
 *     SDK doesn't expose map events directly to the parent page
 *   - Falls back to periodic polling (every 2s) as a simple approach
 *
 * SDK methods used:
 *   map({method: "getCenter"}) → {lng, lat}
 *   map({method: "getZoom"})   → number
 */

import { mapGetCenter, mapGetZoom } from "../sdk/map-control.js";

/** @type {HTMLElement|null} The coordinate bar element */
let coordBar = null;

/**
 * Create the coordinate bar DOM element and append it to the map area.
 * Should be called once after SDK ready.
 */
function createCoordBar() {
  if (coordBar) return coordBar;

  coordBar = document.createElement("div");
  coordBar.id = "coord-bar";
  coordBar.className = "coord-bar";
  coordBar.textContent = "Lat: — Lng: — Zoom: —";
  document.querySelector(".app-map").appendChild(coordBar);

  return coordBar;
}

/**
 * Fetch current map state and update the coordinate bar display.
 * Silently no-ops on error to avoid log spam during rapid movement.
 */
async function refreshCoordinates() {
  try {
    const [center, zoom] = await Promise.all([
      mapGetCenter(),
      mapGetZoom(),
    ]);
    if (coordBar && center && zoom != null) {
      coordBar.textContent =
        `Lat: ${center.lat.toFixed(4)}  Lng: ${center.lng.toFixed(4)}  Zoom: ${zoom.toFixed(1)}`;
    }
  } catch {
    /* Silently skip — map may be mid-transition */
  }
}

/**
 * Initialise the coordinate display.
 * Creates the bar and starts a polling interval to keep it updated.
 * Polling is used because the SDK's postMessage bridge doesn't support
 * native map event listeners (moveend, zoomend) from the parent page.
 *
 * @param {number} [intervalMs=2000] - How often to refresh coordinates
 */
export function initCoordinateDisplay(intervalMs = 2000) {
  createCoordBar();
  refreshCoordinates(); /* Initial read */
  setInterval(refreshCoordinates, intervalMs);
}
