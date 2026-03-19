/*
 * Polygon-select spatial query
 *
 * Like box-select but for arbitrary polygon regions. The user clicks to place
 * vertices on a transparent overlay. An SVG polyline draws the shape in real
 * time as vertices are added, with a rubber-band line from the last vertex to
 * the current cursor position.
 *
 * Closing the polygon:
 *   - Click within 15px of the first vertex (close-on-proximity), or
 *   - Double-click anywhere (as long as >= 3 vertices exist)
 *
 * Once closed, we query features in two steps:
 *   1. Bounding-box pre-filter: queryRenderedFeatures with the polygon's
 *      pixel bounding box to get a candidate set quickly.
 *   2. Point-in-polygon refinement: each candidate's representative point
 *      is tested against the actual polygon ring using pointInPolygon().
 *      This filters out features that fall inside the bbox but outside the
 *      polygon shape.
 *
 * The polygon is then unprojected to geographic coordinates and added as a
 * Mapbox source + fill/line layer so it persists through zoom and pan. Same
 * raster limitation as box-select applies here.
 */

import { log } from "../log.js";
import { esc } from "../../lib/esc.js";
import { pointInPolygon } from "../../lib/geo.js";
import * as store from "../../state/store.js";
import { addSource, addLayer, removeLayer, removeSource, queryRenderedFeatures, unproject } from "../../sdk/map-layers.js";
import { showToolMessage, showToolResults, clearToolResults, filterBasemapFeatures } from "./tool-helpers.js";
import { highlightQueryResults, cleanupFeatureHighlight } from "./feature-highlight.js";
import { cancelBoxSelect, cleanupBoxSelectHighlight } from "./box-select.js";

export function cancelPolygonSelect() {
  if (store.polygonSelectOverlay) {
    store.polygonSelectOverlay.remove();
    store.setPolygonSelectOverlay(null);
  }
  const btn = document.getElementById("btn-polygon-select");
  if (btn) btn.classList.remove("is-active");
}

export async function cleanupPolygonSelectHighlight() {
  if (!store.polygonHighlightActive) return;
  for (const id of ["polygon-select-line", "polygon-select-fill"]) {
    try { await removeLayer(id); } catch (e) { /* ignore */ }
  }
  try { await removeSource("polygon-select-area"); } catch (e) { /* ignore */ }
  store.setPolygonHighlightActive(false);
}

export async function startPolygonSelect() {
  const mapArea = document.querySelector(".app-map");

  cancelPolygonSelect();
  cancelBoxSelect();
  clearToolResults("bbox-results");
  await cleanupPolygonSelectHighlight();
  await cleanupBoxSelectHighlight();
  await cleanupFeatureHighlight();

  const vertices = [];
  let mouseDownPos = null;
  let isDragging = false;

  const overlay = document.createElement("div");
  overlay.className = "polygon-select-overlay";
  store.setPolygonSelectOverlay(overlay);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
  overlay.appendChild(svg);

  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("fill", "rgba(150,41,135,0.08)");
  polyline.setAttribute("stroke", "#962987");
  polyline.setAttribute("stroke-width", "2");
  polyline.setAttribute("stroke-dasharray", "6,4");
  svg.appendChild(polyline);

  const rubberLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  rubberLine.setAttribute("stroke", "#962987");
  rubberLine.setAttribute("stroke-width", "1");
  rubberLine.setAttribute("stroke-dasharray", "4,4");
  rubberLine.style.display = "none";
  svg.appendChild(rubberLine);

  function updatePolyline(extraPoint) {
    const pts = vertices.map((v) => `${v.x},${v.y}`);
    if (extraPoint) pts.push(`${extraPoint.x},${extraPoint.y}`);
    polyline.setAttribute("points", pts.join(" "));
  }

  function addVertexMarker(px) {
    const dot = document.createElement("div");
    dot.className = "polygon-select-vertex";
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
    if (vertices.length > 0 && !isDragging) {
      const cur = { x: e.offsetX, y: e.offsetY };
      const last = vertices[vertices.length - 1];
      rubberLine.setAttribute("x1", last.x);
      rubberLine.setAttribute("y1", last.y);
      rubberLine.setAttribute("x2", cur.x);
      rubberLine.setAttribute("y2", cur.y);
      rubberLine.style.display = "";
      updatePolyline(cur);
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
      if (store.polygonSelectOverlay === overlay) overlay.style.pointerEvents = "";
    }, 150);
  }, { passive: true });

  overlay.addEventListener("click", async (e) => {
    if (isDragging) return;
    const px = { x: e.offsetX, y: e.offsetY };

    if (vertices.length >= 3) {
      const first = vertices[0];
      const dist = Math.sqrt((px.x - first.x) ** 2 + (px.y - first.y) ** 2);
      if (dist < 15) {
        await closePolygon();
        return;
      }
    }

    vertices.push(px);
    addVertexMarker(px);
    updatePolyline();
    showToolMessage("bbox-message",
      vertices.length < 3
        ? `${vertices.length} point(s) placed. Need at least 3 to close.`
        : `${vertices.length} points. Click near the first point to close, or keep adding.`,
    );
    log(`Polygon vertex ${vertices.length}: (${px.x}, ${px.y})`);
  });

  overlay.addEventListener("dblclick", async (e) => {
    e.preventDefault();
    if (vertices.length >= 3) await closePolygon();
  });

  async function closePolygon() {
    showToolMessage("bbox-message", "Querying features in polygon...");
    document.removeEventListener("mouseup", onDocMouseUp);
    cancelPolygonSelect();

    const xs = vertices.map((v) => v.x);
    const ys = vertices.map((v) => v.y);
    const queryBbox = [
      [Math.min(...xs), Math.min(...ys)],
      [Math.max(...xs), Math.max(...ys)],
    ];

    try {
      const geoVerts = [];
      for (const v of vertices) {
        const ll = await unproject(v);
        geoVerts.push([ll.lng, ll.lat]);
      }
      geoVerts.push([geoVerts[0][0], geoVerts[0][1]]);

      const polyGeoJSON = {
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: { type: "Polygon", coordinates: [geoVerts] } }],
      };

      await cleanupPolygonSelectHighlight();
      await addSource("polygon-select-area", { type: "geojson", data: polyGeoJSON });
      await addLayer({ id: "polygon-select-fill", type: "fill", source: "polygon-select-area", paint: { "fill-color": "#962987", "fill-opacity": 0.1 } });
      await addLayer({ id: "polygon-select-line", type: "line", source: "polygon-select-area", paint: { "line-color": "#962987", "line-width": 2, "line-dasharray": [4, 3] } });
      store.setPolygonHighlightActive(true);
      log("Polygon highlight added to map");

      const rawFeatures = await queryRenderedFeatures(queryBbox);
      const allFeatures = filterBasemapFeatures(rawFeatures || []);

      if (allFeatures.length === 0) {
        showToolMessage("bbox-message", "No view features found in polygon. (Basemap and raster layers are excluded.)");
        return;
      }

      const geoRing = geoVerts;
      const filteredFeatures = [];
      const byLayer = {};

      for (const f of allFeatures) {
        let testLng, testLat;
        if (f.geometry && f.geometry.coordinates) {
          const coords = f.geometry.coordinates;
          if (f.geometry.type === "Point") { [testLng, testLat] = coords; }
          else if (f.geometry.type === "Polygon") { [testLng, testLat] = coords[0][0]; }
          else if (f.geometry.type === "MultiPolygon") { [testLng, testLat] = coords[0][0][0]; }
          else if (f.geometry.type === "LineString") { [testLng, testLat] = coords[0]; }
          else { testLng = null; }
        } else {
          testLng = null;
        }

        const inside = testLng == null || pointInPolygon(testLng, testLat, geoRing);
        if (inside) {
          filteredFeatures.push(f);
          const layer = f.layer?.id || f.sourceLayer || "(unknown)";
          byLayer[layer] = (byLayer[layer] || 0) + 1;
        }
      }

      if (filteredFeatures.length === 0) {
        showToolMessage("bbox-message", "No features found inside the polygon.");
        return;
      }

      log(`Polygon query: ${filteredFeatures.length} features (from ${allFeatures.length} in bbox)`);
      showToolMessage("bbox-message", `${filteredFeatures.length} features in polygon`);

      let html = `<h4>${filteredFeatures.length} Features in Polygon</h4>`;
      html += "<table><tr><th>Layer</th><th>Count</th></tr>";
      for (const [layer, count] of Object.entries(byLayer).sort((a, b) => b[1] - a[1])) {
        html += `<tr><td>${esc(layer)}</td><td>${count}</td></tr>`;
      }
      html += "</table>";

      const samples = filteredFeatures.slice(0, 5);
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
      await highlightQueryResults(filteredFeatures);
    } catch (e) {
      log("Polygon query error: " + e.message);
      showToolMessage("bbox-message", "Polygon query failed: " + e.message, true);
    }
  }

  mapArea.appendChild(overlay);
  document.getElementById("btn-polygon-select").classList.add("is-active");
  showToolMessage("bbox-message", "Click to add polygon vertices. Double-click or click near the first point to close.");
  log("Polygon select: overlay active");
}
