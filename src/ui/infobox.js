import { esc } from "../lib/esc.js";
import { findNearestFeature } from "../lib/geo.js";
import { log } from "./log.js";
import { showToast } from "./toast.js";

/**
 * Display the first hit from MapX 1.14.2+ click_features.
 * Attributes are keyed by view ID, with an array (or object) per view.
 * Passthrough layers still use the local coordinate-matching fallback.
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

  if (data.attributes && typeof data.attributes === "object") {
    for (const items of Object.values(data.attributes)) {
      const candidates = Array.isArray(items) ? items : [items];
      props = candidates.find((item) =>
        item && typeof item === "object" && Object.keys(item).length > 0,
      );
      if (props) break;
    }
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
