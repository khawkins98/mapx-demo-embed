/*
 * Box-select spatial query
 *
 * Why an overlay instead of intercepting click_attributes or the SDK's own
 * draw tools?  The SDK's click_attributes gives us feature info on click, but
 * there's no crosshair cursor and no visual feedback while selecting an area.
 * The SDK method toggle_draw_mode doesn't exist in the current build, so we
 * can't ask MapX to handle rectangle drawing for us. An overlay gives us full
 * control over the UX.
 *
 * How it works:
 *   - We append a transparent div (cursor:crosshair) over the map area.
 *   - We need to tell clicks apart from drags (the user might be panning).
 *     A 5px movement threshold distinguishes the two. When a drag is detected,
 *     we set pointerEvents = "none" on the overlay so the gesture falls
 *     through to the iframe and Mapbox handles the pan normally.
 *   - Click 1 sets corner 1 and drops a marker dot.
 *   - While the mouse moves after click 1, we draw a live dashed rectangle
 *     between corner 1 and the current cursor position.
 *   - Click 2 finalizes the box, fires the query, and removes the overlay.
 *
 * After click 2:
 *   - The pixel-coordinate bounding box goes to queryRenderedFeatures, which
 *     returns every vector feature whose rendered geometry intersects the box.
 *   - We also unproject both corners to geographic coordinates and draw a
 *     highlight polygon on the map so the user can see the area they selected
 *     even after the overlay is gone.
 *
 * RASTER LIMITATION: queryRenderedFeatures only returns vector features.
 * Raster tiles are just images — there are no discrete features to query.
 * The UI shows a message explaining this when the result set is empty.
 */

import { log } from "../log.js";
import { esc } from "../../lib/esc.js";
import * as store from "../../state/store.js";
import { addSource, addLayer, removeLayer, removeSource, queryRenderedFeatures, unproject } from "../../sdk/map-layers.js";
import { showToolMessage, showToolResults, clearToolResults, filterBasemapFeatures } from "./tool-helpers.js";
import { highlightQueryResults } from "./feature-highlight.js";
import { cancelPolygonSelect, cleanupPolygonSelectHighlight } from "./polygon-select.js";
import { cleanupFeatureHighlight } from "./feature-highlight.js";

export function cancelBoxSelect() {
  if (store.boxSelectOverlay) {
    store.boxSelectOverlay.remove();
    store.setBoxSelectOverlay(null);
  }
  const btn = document.getElementById("btn-box-select");
  if (btn) btn.classList.remove("is-active");
}

export async function cleanupBoxSelectHighlight() {
  if (!store.boxHighlightActive) return;
  for (const id of ["box-select-bbox-line", "box-select-bbox-fill"]) {
    try { await removeLayer(id); } catch (e) { /* ignore */ }
  }
  try { await removeSource("box-select-bbox"); } catch (e) { /* ignore */ }
  store.setBoxHighlightActive(false);
}

export async function startBoxSelect() {
  const mapArea = document.querySelector(".app-map");

  cancelBoxSelect();
  cancelPolygonSelect();
  clearToolResults("bbox-results");
  await cleanupBoxSelectHighlight();
  await cleanupPolygonSelectHighlight();
  await cleanupFeatureHighlight();

  let corner1Px = null;
  let mouseDownPos = null;
  let isDragging = false;

  const overlay = document.createElement("div");
  overlay.className = "box-select-overlay";
  store.setBoxSelectOverlay(overlay);

  const rectDiv = document.createElement("div");
  rectDiv.className = "box-select-rect";
  rectDiv.style.display = "none";
  overlay.appendChild(rectDiv);

  function updateRect(p1, p2) {
    rectDiv.style.display = "block";
    rectDiv.style.left = Math.min(p1.x, p2.x) + "px";
    rectDiv.style.top = Math.min(p1.y, p2.y) + "px";
    rectDiv.style.width = Math.abs(p2.x - p1.x) + "px";
    rectDiv.style.height = Math.abs(p2.y - p1.y) + "px";
  }

  function addCornerMarker(px) {
    const dot = document.createElement("div");
    dot.className = "box-select-corner";
    dot.style.left = px.x + "px";
    dot.style.top = px.y + "px";
    overlay.appendChild(dot);
  }

  overlay.addEventListener("mousedown", (e) => {
    mouseDownPos = { x: e.clientX, y: e.clientY };
    isDragging = false;
  });

  overlay.addEventListener("mousemove", (e) => {
    if (mouseDownPos && !isDragging) {
      const dx = Math.abs(e.clientX - mouseDownPos.x);
      const dy = Math.abs(e.clientY - mouseDownPos.y);
      if (dx > 5 || dy > 5) {
        isDragging = true;
        overlay.style.pointerEvents = "none";
      }
    }
    if (corner1Px && !isDragging) {
      updateRect(corner1Px, { x: e.offsetX, y: e.offsetY });
    }
  });

  function onDocMouseUp() {
    if (isDragging) overlay.style.pointerEvents = "";
    isDragging = false;
    mouseDownPos = null;
  }
  document.addEventListener("mouseup", onDocMouseUp);

  overlay.addEventListener("wheel", () => {
    overlay.style.pointerEvents = "none";
    setTimeout(() => {
      if (store.boxSelectOverlay === overlay) overlay.style.pointerEvents = "";
    }, 150);
  }, { passive: true });

  overlay.addEventListener("click", async (e) => {
    if (isDragging) return;
    const px = { x: e.offsetX, y: e.offsetY };

    if (!corner1Px) {
      corner1Px = px;
      addCornerMarker(px);
      showToolMessage("bbox-message", "Corner 1 set. Click again to complete the box.");
      log(`Box select corner 1: pixel (${px.x}, ${px.y})`);
      return;
    }

    const corner2Px = px;
    addCornerMarker(corner2Px);
    updateRect(corner1Px, corner2Px);
    log(`Box select corner 2: pixel (${corner2Px.x}, ${corner2Px.y})`);

    const queryBbox = [
      [Math.min(corner1Px.x, corner2Px.x), Math.min(corner1Px.y, corner2Px.y)],
      [Math.max(corner1Px.x, corner2Px.x), Math.max(corner1Px.y, corner2Px.y)],
    ];

    showToolMessage("bbox-message", "Querying features in box...");
    document.removeEventListener("mouseup", onDocMouseUp);
    cancelBoxSelect();

    try {
      const [c1LL, c2LL] = await Promise.all([
        unproject(corner1Px),
        unproject(corner2Px),
      ]);

      const bboxGeoJSON = {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [c1LL.lng, c1LL.lat], [c2LL.lng, c1LL.lat],
              [c2LL.lng, c2LL.lat], [c1LL.lng, c2LL.lat],
              [c1LL.lng, c1LL.lat],
            ]],
          },
        }],
      };

      await cleanupBoxSelectHighlight();
      await addSource("box-select-bbox", { type: "geojson", data: bboxGeoJSON });
      await addLayer({ id: "box-select-bbox-fill", type: "fill", source: "box-select-bbox", paint: { "fill-color": "#004f91", "fill-opacity": 0.1 } });
      await addLayer({ id: "box-select-bbox-line", type: "line", source: "box-select-bbox", paint: { "line-color": "#004f91", "line-width": 2, "line-dasharray": [4, 3] } });
      store.setBoxHighlightActive(true);
      log("Selection highlight added to map");

      const rawFeatures = await queryRenderedFeatures(queryBbox);
      const features = filterBasemapFeatures(rawFeatures || []);

      if (features.length === 0) {
        showToolMessage("bbox-message", "No view features found in selected area. (Basemap and raster layers are excluded.)");
        return;
      }

      log(`Box query: ${features.length} features (${(rawFeatures || []).length} before basemap filter)`);
      showToolMessage("bbox-message", `${features.length} features in selection`);

      const byLayer = {};
      for (const f of features) {
        const layer = f.layer?.id || f.sourceLayer || "(unknown)";
        byLayer[layer] = (byLayer[layer] || 0) + 1;
      }

      let html = `<h4>${features.length} Features in Box</h4>`;
      html += "<table><tr><th>Layer</th><th>Count</th></tr>";
      for (const [layer, count] of Object.entries(byLayer).sort((a, b) => b[1] - a[1])) {
        html += `<tr><td>${esc(layer)}</td><td>${count}</td></tr>`;
      }
      html += "</table>";

      const samples = features.slice(0, 5);
      if (samples.length > 0) {
        html += `<h4>Sample Features (first ${samples.length})</h4>`;
        for (const f of samples) {
          const props = f.properties || {};
          const keys = Object.keys(props).slice(0, 4);
          const summary = keys.map((k) => `${k}: ${String(props[k]).substring(0, 30)}`).join(", ");
          html += `<div class="sample-feature">${esc(summary)}</div>`;
        }
      }

      showToolResults("bbox-results", html);
      await highlightQueryResults(features);
    } catch (e) {
      log("Box query error: " + e.message);
      showToolMessage("bbox-message", "Box query failed: " + e.message, true);
    }
  });

  mapArea.appendChild(overlay);
  document.getElementById("btn-box-select").classList.add("is-active");
  showToolMessage("bbox-message", "Click on the map to set corner 1...");
  log("Box select: overlay active — click two corners to define the area");
}
