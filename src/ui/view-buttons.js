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

/**
 * Toggle a curated view on or off.
 *
 * Under the hood this calls the SDK's view_add or view_remove, both of
 * which return Promise<Boolean>. The idView must belong to the current
 * project (MX-2LD-FBB-58N-ROK-8RH) — view_add silently fails if you
 * pass an ID from a different project (no error thrown, just nothing
 * happens). We track open/closed state locally in store.openViews
 * because there's no cheap synchronous way to ask MapX "is this view
 * currently displayed?"
 */
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

/**
 * Idempotent view activation — adds the view only if it isn't already
 * open. Scenarios call this so they can list the views they need without
 * worrying about double-adding. Safe to call multiple times with the
 * same idView; it's a no-op if the view is already in store.openViews.
 */
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

/**
 * Remove everything from the map and reset all UI state.
 *
 * This cleans up three categories of layers:
 *   1. Curated views — removed via view_remove for each ID in store.openViews
 *   2. Custom GeoJSON views — the field offices and project zones created
 *      via view_geojson_create. We unregister them from the GeoJSON click
 *      registry and call view_geojson_delete.
 *   3. Mapbox passthrough layers — the monitoring stations added via
 *      map.addSource/addLayer. We remove the label layer, circle layer,
 *      and source individually, plus unregister from the click registry.
 *
 * After layer cleanup: hides the infobox, cancels any active box/polygon
 * selection, tears down spatial highlight layers, and refreshes the
 * analysis view dropdown.
 */
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
