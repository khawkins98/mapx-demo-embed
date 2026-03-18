import { log } from "../log.js";
import * as store from "../../state/store.js";
import { addSource, addLayer, removeLayer, removeSource } from "../../sdk/map-layers.js";

export async function cleanupFeatureHighlight() {
  if (!store.featureHighlightActive) return;
  for (const id of ["query-highlight-fill", "query-highlight-line", "query-highlight-outline", "query-highlight-circle"]) {
    try { await removeLayer(id); } catch (e) { /* ignore */ }
  }
  try { await removeSource("query-result-highlight"); } catch (e) { /* ignore */ }
  store.setFeatureHighlightActive(false);
}

export async function highlightQueryResults(features) {
  await cleanupFeatureHighlight();

  const validFeatures = [];
  for (const f of features) {
    if (f.geometry && f.geometry.type && f.geometry.coordinates) {
      validFeatures.push({ type: "Feature", geometry: f.geometry, properties: {} });
    }
  }

  if (validFeatures.length === 0) {
    log("No features with geometry to highlight");
    return;
  }

  const geojson = { type: "FeatureCollection", features: validFeatures };

  try {
    await addSource("query-result-highlight", { type: "geojson", data: geojson });

    await addLayer({
      id: "query-highlight-fill", type: "fill", source: "query-result-highlight",
      filter: ["any", ["==", "$type", "Polygon"]],
      paint: { "fill-color": "#f39c12", "fill-opacity": 0.25 },
    });

    await addLayer({
      id: "query-highlight-outline", type: "line", source: "query-result-highlight",
      filter: ["==", "$type", "Polygon"],
      paint: { "line-color": "#f39c12", "line-width": 2 },
    });

    await addLayer({
      id: "query-highlight-line", type: "line", source: "query-result-highlight",
      filter: ["==", "$type", "LineString"],
      paint: { "line-color": "#f39c12", "line-width": 3 },
    });

    await addLayer({
      id: "query-highlight-circle", type: "circle", source: "query-result-highlight",
      filter: ["==", "$type", "Point"],
      paint: { "circle-radius": 7, "circle-color": "#f39c12", "circle-stroke-width": 2, "circle-stroke-color": "#fff", "circle-opacity": 0.9 },
    });

    store.setFeatureHighlightActive(true);
    log(`Highlighted ${validFeatures.length} features on map`);
  } catch (e) {
    log("Feature highlight error: " + e.message);
  }
}
