/**
 * Metrics Hub demo entry point.
 *
 * Init sequence:
 *   1. PIN gate (synchronous — blocks interaction until dismissed)
 *   2. CSS imports
 *   3. SDK initialisation (creates iframe, connects to MapX app)
 *   4. Render static charts (no SDK needed)
 *   5. On SDK "ready":
 *      - Initialise scroll engine (Intersection Observer)
 *      - Initialise country deep-dive
 *      - Activate first section
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

/* ── PIN gate ────────────────────────────────────────────────── */
initPinGate();

/* ── SDK bootstrap ───────────────────────────────────────────── */
const mapx = initSDK(document.getElementById("mapx"));

/* ── Render static charts into card containers ───────────────── */
function renderAllCharts() {
  METRICS_SECTIONS.forEach((section, i) => {
    const el = document.getElementById(`chart-${i}`);
    if (!el) return;

    if (section.metrics) {
      el.innerHTML = section.metrics
        .map((m) => renderMetricCard(m))
        .join("");
      return;
    }

    if (!section.chart) return;

    switch (section.chart.type) {
      case "horizontal-bar":
        el.innerHTML = renderHorizontalBarChart(section.chart);
        break;
      case "donut":
        el.innerHTML = renderDonutChart(section.chart);
        break;
      case "stacked-bar":
        el.innerHTML = renderStackedBar(section.chart);
        break;
      case "trend-line":
        el.innerHTML = renderTrendLine(section.chart);
        break;
    }
  });
}

renderAllCharts();

/* ── View diffing state ──────────────────────────────────────── */
const openViews = new Set();
let isBusy = false;

/**
 * Activate a scrollytelling section: diff views, fly camera.
 * Adapted from demos/story/step-engine.js goToStep().
 */
async function activateSection(index) {
  if (isBusy) return;
  if (index < 0 || index >= METRICS_SECTIONS.length) return;
  isBusy = true;

  try {
    const section = METRICS_SECTIONS[index];
    const targetViews = new Set(section.views);

    // Compute diff
    const toRemove = [...openViews].filter((id) => !targetViews.has(id));
    const toAdd = [...targetViews].filter((id) => !openViews.has(id));

    // Remove old views in parallel
    await Promise.all(
      toRemove.map((id) => {
        openViews.delete(id);
        return viewRemove(id);
      }),
    );

    // Add new views sequentially (prevents SDK race conditions)
    for (const id of toAdd) {
      await viewAdd(id);
      openViews.add(id);
    }

    // Apply transparency overrides
    if (section.transparency) {
      for (const [id, val] of Object.entries(section.transparency)) {
        await setViewLayerTransparency(id, val);
      }
    }

    // Fly camera
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

    // Update active card styling
    document.querySelectorAll(".metrics-card").forEach((card) => {
      card.classList.toggle(
        "metrics-card--active",
        Number(card.dataset.index) === index,
      );
    });

    log(`Section: ${section.title}`);
  } finally {
    isBusy = false;
  }
}

/* ── SDK ready ───────────────────────────────────────────────── */
mapx.on("ready", async () => {
  setStatus("Connected", "ok");
  log("Metrics Hub ready");

  // Initialise scroll-driven map transitions
  initScrollEngine({
    cardSelector: ".metrics-card",
    onActivate: activateSection,
  });

  // Initialise country deep-dive
  initCountryProfile({
    onCountryChange: async (code) => {
      const country = COUNTRY_PROFILES.find((c) => c.code === code);
      if (!country) return;

      // Clear scrollytelling views
      for (const id of [...openViews]) {
        await viewRemove(id);
        openViews.delete(id);
      }

      // Fly to country
      await commonLocFitBbox(code, { duration: 1500 });

      // Show population + primary hazard layer
      await viewAdd("MX-6YLMU-U4WXC-2JJD7");
      await viewAdd(country.primaryViewId);
      await setViewLayerTransparency(country.primaryViewId, 40);
    },
  });

  // Activate first section
  await activateSection(0);
});
