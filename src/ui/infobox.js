import { esc } from "../lib/esc.js";
import { findNearestFeature } from "../lib/geo.js";
import { log } from "./log.js";
import { showToast } from "./toast.js";

/**
 * Handle click_attributes from the SDK and display an infobox.
 *
 * There are two strategies for extracting feature properties from the
 * click event, and which one works depends on who owns the layer:
 *
 *   Strategy 1 — data.attributes[0]
 *     For MapX-managed views (GeoJSON, vt, rt, cc), the SDK includes
 *     the clicked feature's attribute table row in data.attributes as
 *     an array of objects. We grab the first element. This is the happy
 *     path for any view that was added via view_add or view_geojson_create.
 *
 *   Strategy 2 — Coordinate matching fallback (data.lngLat)
 *     For Mapbox passthrough layers added via the map() method (e.g.
 *     our monitoring stations), MapX doesn't know about the layer's
 *     data — it just proxied addSource/addLayer to the underlying
 *     Mapbox GL instance. So data.attributes comes back empty. Instead,
 *     we use the click coordinates (data.lngLat) and search our local
 *     GeoJSON registry via findNearestFeature() to find the closest
 *     feature within tolerance.
 *
 *   Why two strategies?
 *     Passthrough layers bypass MapX's view management entirely. MapX
 *     only tracks views it created (view_add, view_geojson_create), so
 *     it can attach attribute data to click events for those. Passthrough
 *     layers are invisible to MapX's click handler — it reports the click
 *     location but has no attributes to send. Our coordinate-matching
 *     fallback covers those cases using the local GeoJSON registry
 *     (see state/store.js).
 */
export function showInfobox(data) {
  const box = document.getElementById("infobox");
  const titleEl = document.getElementById("infobox-title");
  const body = document.getElementById("infobox-body");
  const closeBtn = document.getElementById("infobox-close");

  if (!data || typeof data !== "object") {
    box.style.display = "none";
    return;
  }

  let props = null;

  if (data.attributes && Array.isArray(data.attributes) && data.attributes.length > 0) {
    props = data.attributes[0];
  } else if (data.attributes && typeof data.attributes === "object" && !Array.isArray(data.attributes)) {
    props = data.attributes;
  }

  if (!props && data.lngLat) {
    props = findNearestFeature(data.lngLat.lng, data.lngLat.lat);
  }

  if (!props || typeof props !== "object") {
    box.style.display = "none";
    return;
  }

  const skipKeys = ["gid", "mx_t0", "mx_t1", "geom", "geometry"];
  const entries = Object.entries(props).filter(
    ([k, v]) => !skipKeys.includes(k.toLowerCase()) && v != null && v !== "",
  );

  if (entries.length === 0) {
    box.style.display = "none";
    return;
  }

  const nameEntry = entries.find(([k]) =>
    ["name", "title", "label"].includes(k.toLowerCase()),
  );
  const featureName = nameEntry ? String(nameEntry[1]) : "Feature";
  titleEl.textContent = featureName;

  let html = '<table class="mg-table mg-table--small">';
  for (const [key, value] of entries) {
    const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    html += `<tr>
      <td>${esc(label)}</td>
      <td>${esc(value)}</td>
    </tr>`;
  }
  html += "</table>";
  body.innerHTML = html;

  box.style.display = "block";
  log(`Infobox: ${featureName}`);
  closeBtn.onclick = () => {
    box.style.display = "none";
  };

  showToast(featureName);
}
