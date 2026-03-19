/**
 * View toggle buttons — builds and manages the DRR view button list.
 *
 * Each curated view gets a button with:
 *   - Type tag (live/raster/vector) showing the data format
 *   - Info button ("i") that fetches and displays view metadata
 *   - Transparency slider (shown when the view is active)
 *   - Legend integration (fetched when view is toggled on)
 *
 * State tracking:
 *   store.openViews is the source of truth for which views are active.
 *   There's no synchronous SDK check for "is this view displayed?" so
 *   we track it locally and sync the UI accordingly.
 *
 * Key exports:
 *   buildViewButtons()      — create the button list from CURATED_VIEWS
 *   toggleView(idView, btn) — add/remove a view and update all UI
 *   ensureView(idView)      — idempotent activation (used by scenarios)
 *   clearAllViews()         — remove everything and reset all state
 */

import { CURATED_VIEWS, TYPE_LABELS, TYPE_TAG_CLASS } from "../config/views.js";
import * as store from "../state/store.js";
import { viewAdd, viewRemove, viewGeojsonDelete, getViewMeta } from "../sdk/views.js";
import { setViewLayerTransparency, getViewLayerTransparency } from "../sdk/filters.js";
import { removeLayer, removeSource } from "../sdk/map-layers.js";
import { log } from "./log.js";
import { esc } from "../lib/esc.js";
import { dismissStoryOverlay } from "./story-overlay.js";
import { updateAnalysisViewSelect } from "./analysis/view-select.js";
import { cancelBoxSelect, cleanupBoxSelectHighlight } from "./analysis/box-select.js";
import { cancelPolygonSelect, cleanupPolygonSelectHighlight } from "./analysis/polygon-select.js";
import { cleanupFeatureHighlight } from "./analysis/feature-highlight.js";
import { addLegend, removeLegend, clearAllLegends } from "./legends.js";

/**
 * Build the view button list from CURATED_VIEWS config.
 *
 * Each button row contains:
 *   [type-tag] View Label  [i]
 * When active, a transparency slider row appears below the button.
 */
export function buildViewButtons() {
  const container = document.getElementById("view-buttons");
  container.innerHTML = "";

  CURATED_VIEWS.forEach((v) => {
    /* Wrapper div for the button + slider pair */
    const wrapper = document.createElement("div");
    wrapper.className = "view-button-wrapper";

    /* Button row: tag + label + info button */
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:0;";

    const btn = document.createElement("button");
    btn.className = "mg-button mg-button-secondary";
    btn.style.flex = "1";

    const tag = document.createElement("span");
    tag.className = `mg-tag view-type-tag ${TYPE_TAG_CLASS[v.type] || ""}`;
    tag.textContent = TYPE_LABELS[v.type] || v.type;

    const text = document.createTextNode(v.label);
    btn.appendChild(tag);
    btn.appendChild(text);
    btn.title = v.id;
    btn.addEventListener("click", () => toggleView(v.id, btn, wrapper, v.label));

    /* Info button — fetch and show view metadata on click */
    const infoBtn = document.createElement("button");
    infoBtn.className = "view-info-btn";
    infoBtn.textContent = "i";
    infoBtn.title = "View metadata";
    infoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showViewMetadata(v.id, v.label);
    });

    row.appendChild(btn);
    row.appendChild(infoBtn);
    wrapper.appendChild(row);
    container.appendChild(wrapper);
  });
}

/**
 * Toggle a curated view on or off.
 *
 * When toggling on:
 *   - Adds the view via view_add
 *   - Shows a transparency slider below the button
 *   - Fetches the view's legend for the legends panel
 *
 * When toggling off:
 *   - Removes the view via view_remove
 *   - Removes the transparency slider and legend entry
 *
 * @param {string} idView  - MapX view ID
 * @param {HTMLElement} btn - The toggle button element
 * @param {HTMLElement} wrapper - Parent wrapper for slider placement
 * @param {string} label - Human-readable view label
 */
export async function toggleView(idView, btn, wrapper, label) {
  dismissStoryOverlay();
  try {
    if (store.openViews.has(idView)) {
      log(`Removing view ${idView}`);
      await viewRemove(idView);
      store.openViews.delete(idView);
      btn.classList.remove("is-active");
      removeTransparencySlider(wrapper);
      removeLegend(idView);
    } else {
      log(`Adding view ${idView}`);
      await viewAdd(idView);
      store.openViews.add(idView);
      btn.classList.add("is-active");
      addTransparencySlider(idView, wrapper);
      /* Fetch legend asynchronously — don't block the toggle */
      addLegend(idView, label || idView);
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

    /* Update button state if it exists in the view list */
    const wrapper = findViewWrapper(idView);
    if (wrapper) {
      const btn = wrapper.querySelector(".mg-button");
      if (btn) btn.classList.add("is-active");
      addTransparencySlider(idView, wrapper);
    }

    /* Look up label from CURATED_VIEWS config for the legend */
    const viewConfig = CURATED_VIEWS.find((v) => v.id === idView);
    const label = viewConfig ? viewConfig.label : idView;
    addLegend(idView, label);
    updateAnalysisViewSelect();
  }
}

/**
 * Remove everything from the map and reset all UI state.
 *
 * Cleans up three categories of layers:
 *   1. Curated views — removed via view_remove
 *   2. Custom GeoJSON views — field offices and project zones
 *   3. Mapbox passthrough layers — monitoring stations
 *
 * Also clears: legends, transparency sliders, analysis highlights,
 * infobox, and all active selection tools.
 */
export async function clearAllViews() {
  dismissStoryOverlay();

  const removals = [...store.openViews].map((idView) => viewRemove(idView));
  await Promise.all(removals);
  store.openViews.clear();

  /* Reset all view button states and remove sliders */
  document.querySelectorAll("#view-buttons .view-button-wrapper").forEach((w) => {
    const btn = w.querySelector(".mg-button");
    if (btn) btn.classList.remove("is-active");
    removeTransparencySlider(w);
  });

  /* Clear all legend entries */
  clearAllLegends();

  /* Clean up custom GeoJSON views */
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

  /* Clean up Mapbox passthrough layers */
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

/* ------------------------------------------------------------------ */
/*  Transparency slider helpers                                        */
/* ------------------------------------------------------------------ */

/**
 * Add a transparency slider below a view button.
 * Initializes the slider position from the SDK's current transparency
 * value (defaults to 0 = fully opaque if the call fails).
 *
 * @param {string} idView  - View ID for the transparency SDK call
 * @param {HTMLElement} wrapper - The view button wrapper element
 */
async function addTransparencySlider(idView, wrapper) {
  if (!wrapper) return;
  /* Don't add duplicate sliders */
  if (wrapper.querySelector(".view-transparency-row")) return;

  const row = document.createElement("div");
  row.className = "view-transparency-row";

  const label = document.createElement("label");
  label.textContent = "Opacity";

  /*
   * Slider represents OPACITY (100 = fully visible, 0 = invisible).
   * The SDK uses TRANSPARENCY (0 = opaque, 100 = invisible), so we
   * convert: transparency = 100 - opacity.
   */
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.value = "100"; /* Default: fully opaque */

  const valueDisplay = document.createElement("span");
  valueDisplay.className = "transparency-value";
  valueDisplay.textContent = "100%";

  /* Try to read current transparency from SDK and convert to opacity */
  try {
    const current = await getViewLayerTransparency(idView);
    if (typeof current === "number") {
      slider.value = String(100 - current);
      valueDisplay.textContent = `${100 - current}%`;
    }
  } catch {
    /* Use default — view may not support transparency query */
  }

  /* Update transparency on slider input (live, not just on release) */
  slider.addEventListener("input", async () => {
    const opacity = Number(slider.value);
    valueDisplay.textContent = `${opacity}%`;
    try {
      await setViewLayerTransparency(idView, 100 - opacity);
    } catch (e) {
      log(`Transparency error: ${e.message}`);
    }
  });

  row.appendChild(label);
  row.appendChild(slider);
  row.appendChild(valueDisplay);
  wrapper.appendChild(row);
}

/**
 * Remove the transparency slider from a view button wrapper.
 * @param {HTMLElement} wrapper - The view button wrapper element
 */
function removeTransparencySlider(wrapper) {
  if (!wrapper) return;
  const row = wrapper.querySelector(".view-transparency-row");
  if (row) row.remove();
}

/**
 * Find the view button wrapper element for a given view ID.
 * @param {string} idView - MapX view ID
 * @returns {HTMLElement|null}
 */
function findViewWrapper(idView) {
  const btn = document.querySelector(`#view-buttons .mg-button[title="${idView}"]`);
  return btn ? btn.closest(".view-button-wrapper") : null;
}

/* ------------------------------------------------------------------ */
/*  View metadata modal                                                */
/* ------------------------------------------------------------------ */

/**
 * Fetch and display view metadata in a modal overlay.
 *
 * Uses get_view_meta({idView}) to retrieve the view's catalog info:
 * title, abstract, data source, temporal extent, etc. The metadata
 * object typically contains language objects ({en, fr, ...}) for
 * text fields — we extract the English version or first available.
 *
 * @param {string} idView - MapX view ID
 * @param {string} fallbackLabel - Label to show if metadata title is unavailable
 */
async function showViewMetadata(idView, fallbackLabel) {
  try {
    log(`Fetching metadata for ${idView}...`);
    const meta = await getViewMeta(idView);

    if (!meta) {
      log(`No metadata available for ${idView}`);
      return;
    }

    /* Extract localised text (prefer English, fall back to first available) */
    const getLocalText = (obj) => {
      if (!obj) return null;
      if (typeof obj === "string") return obj;
      return obj.en || obj.fr || obj.es || Object.values(obj).find((v) => typeof v === "string") || null;
    };

    const title = getLocalText(meta.title) || fallbackLabel;
    const abstract = getLocalText(meta.abstract) || getLocalText(meta.notes);

    /* Build modal HTML */
    const modal = document.createElement("div");
    modal.className = "view-meta-modal";

    let bodyHtml = "<dl>";
    if (title) bodyHtml += `<dt>Title</dt><dd>${esc(title)}</dd>`;
    if (abstract) bodyHtml += `<dt>Abstract</dt><dd>${esc(abstract)}</dd>`;
    if (meta.id) bodyHtml += `<dt>View ID</dt><dd>${esc(meta.id)}</dd>`;

    /* Source attribution */
    const source = meta.source;
    if (source) {
      const srcText = getLocalText(source) || (Array.isArray(source) ? source.map(getLocalText).filter(Boolean).join(", ") : null);
      if (srcText) bodyHtml += `<dt>Source</dt><dd>${esc(srcText)}</dd>`;
    }

    /* Temporal extent */
    if (meta.temporal) {
      const from = meta.temporal.range?.from || meta.temporal.from;
      const to = meta.temporal.range?.to || meta.temporal.to;
      if (from || to) {
        bodyHtml += `<dt>Temporal Extent</dt><dd>${esc(from || "?")} — ${esc(to || "present")}</dd>`;
      }
    }

    /* Type */
    if (meta.type) bodyHtml += `<dt>Type</dt><dd>${esc(meta.type)}</dd>`;

    bodyHtml += "</dl>";

    modal.innerHTML = `
      <div class="view-meta-content">
        <div class="view-meta-header">
          <strong>${esc(title)}</strong>
          <button title="Close">&times;</button>
        </div>
        <div class="view-meta-body">${bodyHtml}</div>
      </div>
    `;

    /* Close on button click or backdrop click */
    modal.querySelector(".view-meta-header button").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
    log(`Metadata displayed for: ${title}`);
  } catch (e) {
    log(`Metadata error (${idView}): ${e.message}`);
  }
}
