/**
 * Metrics Hub demo entry point.
 *
 * Wiring strategy:
 *   - METRICS_SECTIONS is the single source of truth for section config
 *   - HTML cards use `data-section="<id>"` matching section.id
 *   - Chart containers use `id="chart-<section.id>"`
 *   - The scroll engine fires onActivate(sectionId)
 *   - main.js looks up the section by ID in a Map for O(1) access
 *
 * To add a section: add it to metrics-sections.js, add the HTML card
 * with matching data-section and chart container IDs. No other wiring.
 */

import "../../src/styles/shared.css";
import "../../src/styles/metrics.css";
import { initSDK } from "../../src/sdk/client.js";
import { initPinGate } from "../../src/ui/pin-gate.js";
import { setStatus, log } from "../../src/ui/log.js";
import { viewAdd, viewRemove } from "../../src/sdk/views.js";
import { setViewLayerTransparency } from "../../src/sdk/filters.js";
import {
  mapFlyTo,
  commonLocFitBbox,
} from "../../src/sdk/map-control.js";
import { METRICS_SECTIONS } from "../../src/config/metrics-sections.js";
import { COUNTRY_PROFILES } from "../../src/config/country-data.js";
import { initScrollEngine } from "./scroll-engine.js";
import { initCountryProfile } from "./country-profile.js";
import {
  renderHorizontalBarChart,
  renderDonutChart,
  renderMetricCard,
  renderStackedBar,
  renderTrendLine,
} from "./charts.js";

/* ── Section lookup map ──────────────────────────────────────── */

/** @type {Map<string, object>} section.id → section config */
const sectionMap = new Map(METRICS_SECTIONS.map((s) => [s.id, s]));

/** Chart renderer dispatch table — avoids a switch statement */
const chartRenderers = {
  "horizontal-bar": renderHorizontalBarChart,
  "donut": renderDonutChart,
  "stacked-bar": renderStackedBar,
  "trend-line": renderTrendLine,
};

/* ── PIN gate ────────────────────────────────────────────────── */
initPinGate();

/* ── SDK bootstrap — two instances ───────────────────────────── */

/** Scrollytelling map (sticky panel in section 3) */
const mapx = initSDK(document.getElementById("mapx"));

/**
 * Country deep-dive map (section 4, side-by-side with profile).
 * Created directly via mxsdk.Manager so it has its own iframe and
 * independent view/camera state. SDK wrapper functions (viewAdd etc.)
 * operate on the scrollytelling instance; for the country map we
 * call countryMapx.ask() directly.
 */
/* global mxsdk */
const countryMapx = new mxsdk.Manager({
  container: document.getElementById("country-mapx"),
  url: "https://app.mapx.org/?project=MX-2LD-FBB-58N-ROK-8RH",
  params: {
    closePanels: true,
    language: "en",
    theme: "color_light",
  },
  style: { width: "100%", height: "100%", border: "none" },
});

/* ── Render static charts into card containers ───────────────── */
function renderAllCharts() {
  for (const section of METRICS_SECTIONS) {
    const el = document.getElementById(`chart-${section.id}`);
    if (!el) continue;

    if (section.metrics) {
      el.innerHTML = section.metrics.map((m) => renderMetricCard(m)).join("");
      continue;
    }

    if (section.chart) {
      const render = chartRenderers[section.chart.type];
      if (render) el.innerHTML = render(section.chart);
    }
  }
}

renderAllCharts();

/* ── View diffing state ──────────────────────────────────────── */
const openViews = new Set();
let isBusy = false;
let pendingId = null;

/**
 * Activate a section by its ID. If a transition is already running,
 * queues the latest ID and jumps to it when the current one finishes.
 *
 * @param {string} sectionId - matches section.id in METRICS_SECTIONS
 */
async function activateSection(sectionId) {
  if (!sectionMap.has(sectionId)) return;

  if (isBusy) {
    pendingId = sectionId;
    updateActiveCard(sectionId);
    return;
  }
  isBusy = true;

  try {
    await transitionToSection(sectionId);
  } finally {
    isBusy = false;

    if (pendingId !== null && pendingId !== sectionId) {
      const next = pendingId;
      pendingId = null;
      activateSection(next);
    } else {
      pendingId = null;
    }
  }
}

/**
 * Run the SDK calls to transition the map to a section's state.
 * Diffs views, applies transparency, flies the camera.
 */
async function transitionToSection(sectionId) {
  const section = sectionMap.get(sectionId);
  const targetViews = new Set(section.views);

  const toRemove = [...openViews].filter((id) => !targetViews.has(id));
  const toAdd = [...targetViews].filter((id) => !openViews.has(id));

  await Promise.all(
    toRemove.map((id) => {
      openViews.delete(id);
      return viewRemove(id);
    }),
  );

  for (const id of toAdd) {
    await viewAdd(id);
    openViews.add(id);
  }

  if (section.transparency) {
    for (const [id, val] of Object.entries(section.transparency)) {
      await setViewLayerTransparency(id, val);
    }
  }

  if (section.camera) {
    if (section.camera.code) {
      await commonLocFitBbox(
        section.camera.code,
        section.camera.param || { duration: 1500 },
      );
    } else if (section.camera.center) {
      await mapFlyTo({
        center: section.camera.center,
        zoom: section.camera.zoom || 3,
        duration: 1500,
      });
    }
  }

  updateActiveCard(sectionId);
  log(`Section: ${section.title}`);
}

/** Highlight the active card, un-highlight the rest. */
function updateActiveCard(sectionId) {
  document.querySelectorAll(".metrics-card").forEach((card) => {
    card.classList.toggle(
      "metrics-card--active",
      card.dataset.section === sectionId,
    );
  });
}

/* ── Interactive actions (click-to-explore on charts/metrics) ── */

/**
 * Apply a map action from a clicked metric card or chart bar.
 * Actions are partial overrides within the current section — they
 * adjust views/transparency/camera without switching sections.
 *
 * @param {Object} action - parsed from data-action attribute
 * @param {string[]} [action.views] - view IDs to highlight
 * @param {Object} [action.transparency] - per-view opacity overrides
 * @param {Object} [action.camera] - camera target
 */
async function applyAction(action) {
  if (!action) return;

  if (action.transparency) {
    for (const [id, val] of Object.entries(action.transparency)) {
      if (openViews.has(id)) {
        await setViewLayerTransparency(id, val);
      }
    }
  }

  // If the action specifies views not currently open, add them
  if (action.views) {
    for (const id of action.views) {
      if (!openViews.has(id)) {
        await viewAdd(id);
        openViews.add(id);
      }
    }
  }

  if (action.camera) {
    if (action.camera.code) {
      await commonLocFitBbox(
        action.camera.code,
        action.camera.param || { duration: 1200 },
      );
    } else if (action.camera.center) {
      await mapFlyTo({
        center: action.camera.center,
        zoom: action.camera.zoom || 3,
        duration: 1200,
      });
    }
  }
}

/**
 * Event delegation for [data-action] clicks.
 * Works for both HTML elements (metric cards) and SVG elements
 * (chart bars wrapped in <g>).
 */
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  if (!target) return;

  try {
    const action = JSON.parse(target.dataset.action);
    applyAction(action);

    // Toggle selected state on siblings
    const parent = target.parentElement;
    if (parent) {
      parent.querySelectorAll("[data-action]").forEach((el) => {
        el.classList.toggle("is-selected", el === target);
      });
    }
  } catch (err) {
    // Malformed action JSON — ignore
  }
});

// Keyboard support for [data-action] elements
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    const target = e.target.closest("[data-action]");
    if (target) {
      e.preventDefault();
      target.click();
    }
  }
});

/* ── SDK ready ───────────────────────────────────────────────── */
mapx.on("ready", async () => {
  setStatus("Connected", "ok");
  log("Metrics Hub ready");

  initScrollEngine({
    cardSelector: ".metrics-card",
    onActivate: activateSection,
  });

  initCountryProfile({
    onCountryChange: async (code) => {
      const country = COUNTRY_PROFILES.find((c) => c.code === code);
      if (!country) return;

      // Fly the country map to the selected country, add relevant layers
      await countryMapx.ask("common_loc_fit_bbox", {
        code,
        param: { duration: 1500 },
      });
      // Remove any previously added views (fire and forget)
      countryMapx.ask("view_remove", { idView: "MX-6YLMU-U4WXC-2JJD7" }).catch(() => {});
      countryMapx.ask("view_remove", { idView: country.primaryViewId }).catch(() => {});
      // Add population + primary hazard
      await countryMapx.ask("view_add", { idView: "MX-6YLMU-U4WXC-2JJD7" });
      await countryMapx.ask("view_add", { idView: country.primaryViewId });
      await countryMapx.ask("set_view_layer_transparency", {
        idView: country.primaryViewId,
        value: 40,
      });
    },
  });

  await activateSection(METRICS_SECTIONS[0].id);
});

/* ── Country map ready ───────────────────────────────────────── */
countryMapx.on("ready", () => {
  const badge = document.getElementById("country-map-status");
  if (badge) {
    badge.textContent = "Connected";
    badge.classList.add("status-badge--ok");
  }
});
