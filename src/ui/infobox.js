import { esc } from "../lib/esc.js";
import { findNearestFeature } from "../lib/geo.js";
import { log } from "./log.js";
import { showToast } from "./toast.js";

/** Handle click_attributes from the SDK and display an infobox. */
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

  let html = '<table style="width:100%;border-collapse:collapse;">';
  for (const [key, value] of entries) {
    const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    html += `<tr>
      <td style="padding:0.3rem 0.5rem 0.3rem 0;color:#666;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
      <td style="padding:0.3rem 0;font-weight:500;">${esc(value)}</td>
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
