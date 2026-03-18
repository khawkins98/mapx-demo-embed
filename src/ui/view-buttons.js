import { CURATED_VIEWS, TYPE_LABELS, TYPE_TAG_CLASS } from "../config/views.js";
import * as store from "../state/store.js";
import { viewAdd, viewRemove, viewGeojsonDelete } from "../sdk/views.js";
import { removeLayer, removeSource } from "../sdk/map-layers.js";
import { log } from "./log.js";
import { dismissStoryOverlay } from "./story-overlay.js";
import { updateAnalysisViewSelect } from "./analysis/view-select.js";
import { cancelBoxSelect, cleanupBoxSelectHighlight } from "./analysis/box-select.js";
import { cancelPolygonSelect, cleanupPolygonSelectHighlight } from "./analysis/polygon-select.js";
import { cleanupFeatureHighlight } from "./analysis/feature-highlight.js";

export function buildViewButtons() {
  const container = document.getElementById("view-buttons");
  container.innerHTML = "";

  CURATED_VIEWS.forEach((v) => {
    const btn = document.createElement("button");
    btn.className = "mg-button mg-button-secondary";

    const tag = document.createElement("span");
    tag.className = `mg-tag view-type-tag ${TYPE_TAG_CLASS[v.type] || ""}`;
    tag.textContent = TYPE_LABELS[v.type] || v.type;

    const text = document.createTextNode(v.label);
    btn.appendChild(tag);
    btn.appendChild(text);
    btn.title = v.id;
    btn.addEventListener("click", () => toggleView(v.id, btn));
    container.appendChild(btn);
  });
}

export async function toggleView(idView, btn) {
  dismissStoryOverlay();
  try {
    if (store.openViews.has(idView)) {
      log(`Removing view ${idView}`);
      await viewRemove(idView);
      store.openViews.delete(idView);
      btn.classList.remove("is-active");
    } else {
      log(`Adding view ${idView}`);
      await viewAdd(idView);
      store.openViews.add(idView);
      btn.classList.add("is-active");
    }
    updateAnalysisViewSelect();
  } catch (e) {
    log(`View toggle error (${idView}): ${e.message}`);
  }
}

export async function ensureView(idView) {
  dismissStoryOverlay();
  if (!store.openViews.has(idView)) {
    log(`Adding view ${idView}`);
    await viewAdd(idView);
    store.openViews.add(idView);
    const btn = document.querySelector(`#view-buttons .mg-button[title="${idView}"]`);
    if (btn) btn.classList.add("is-active");
    updateAnalysisViewSelect();
  }
}

export async function clearAllViews() {
  dismissStoryOverlay();

  const removals = [...store.openViews].map((idView) => viewRemove(idView));
  await Promise.all(removals);
  store.openViews.clear();
  document.querySelectorAll("#view-buttons .mg-button").forEach((b) => b.classList.remove("is-active"));

  if (store.geojsonViewId) {
    store.unregisterGeoJSON(store.geojsonViewId);
    await viewGeojsonDelete(store.geojsonViewId);
    store.setGeojsonViewId(null);
  }
  if (store.polygonViewId) {
    store.unregisterGeoJSON(store.polygonViewId);
    await viewGeojsonDelete(store.polygonViewId);
    store.setPolygonViewId(null);
  }
  if (store.markersAdded) {
    try {
      await removeLayer(store.MARKERS_LABEL_LAYER);
      await removeLayer(store.MARKERS_LAYER);
      await removeSource(store.MARKERS_SOURCE);
      store.unregisterGeoJSON(store.MARKERS_SOURCE);
    } catch (e) {
      log("Marker cleanup: " + e.message);
    }
    store.setMarkersAdded(false);
  }
  document.getElementById("infobox").style.display = "none";
  cancelBoxSelect();
  cancelPolygonSelect();
  await cleanupBoxSelectHighlight();
  await cleanupPolygonSelectHighlight();
  await cleanupFeatureHighlight();
  updateAnalysisViewSelect();
}
