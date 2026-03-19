/**
 * Pre-built scenarios that demonstrate chaining multiple SDK calls into
 * cohesive workflows. Each scenario clears the map, loads specific views,
 * flies to a region, and optionally applies filters or opens dashboards.
 *
 * All scenario buttons show a loading spinner during execution to give
 * visual feedback that multiple SDK calls are in progress.
 *
 * Scenarios:
 *   1. India — Active Fires + Dashboard
 *   2. Caribbean — Cyclone + Flood Hazard (transparency stacking)
 *   3. SE Asia — Tsunami + Mangrove NbS (eco-DRR pairing)
 *   4a/4b. Water Stress 2030 — High/Low filter toggle
 *   5. Nepal — Compound Risk (3-layer stacking)
 *   6. Live Monitoring Dashboard (real-time layers)
 *
 * Key SDK methods used across scenarios:
 *   - common_loc_fit_bbox(code)        — fly to a country by ISO 3166 alpha-3
 *   - set_view_layer_transparency(id, %) — blend layers for overlay stacking
 *   - has_dashboard / set_dashboard_visibility — check and toggle dashboards
 *   - get_view_table_attribute(id)     — fetch attribute data for filtering
 *   - set_view_layer_filter_text(id, values) — filter by category values
 *   - map_wait_idle()                  — wait for tiles before querying
 */

import { log } from "./log.js";
import { clearAllViews, ensureView } from "./view-buttons.js";
import { mapFlyTo, commonLocFitBbox, mapWaitIdle } from "../sdk/map-control.js";
import { setViewLayerTransparency, setViewLayerFilterText } from "../sdk/filters.js";
import { hasDashboard, setDashboardVisibility } from "../sdk/ui.js";
import { getViewTableAttribute } from "../sdk/data-query.js";

/**
 * Wrap a scenario handler with loading state management.
 * Shows a spinner on the button during execution and disables it
 * to prevent double-clicks. Automatically clears on completion or error.
 *
 * @param {HTMLElement} btn - The scenario button element
 * @param {Function} handler - Async function to execute
 */
async function withLoading(btn, handler) {
  btn.classList.add("is-loading");
  try {
    await handler();
  } catch (e) {
    log(`Scenario error: ${e.message}`);
  } finally {
    btn.classList.remove("is-loading");
  }
}

export function enableScenarios() {
  /* --- Scenario 1: India — Active Fires + Dashboard --- */
  const btnFires = document.getElementById("sc-fires-india");
  btnFires.addEventListener("click", () => withLoading(btnFires, async () => {
    log("Scenario: India fire activity");
    await clearAllViews();

    const idView = "MX-OU7NG-ZNZGA-ZX3K0";
    await ensureView(idView);

    log("Flying to India...");
    await commonLocFitBbox("IND", { duration: 2000 });

    await mapWaitIdle();
    try {
      const hasDash = await hasDashboard();
      if (hasDash) {
        log("Opening dashboard...");
        await setDashboardVisibility(true);
      } else {
        log("No dashboard available for this view");
      }
    } catch (e) {
      log("Dashboard: " + e.message);
    }
  }));

  /* --- Scenario 2: Caribbean — Cyclone Exposure + Flood Hazard --- */
  const btnCarib = document.getElementById("sc-caribbean-multi");
  btnCarib.addEventListener("click", () => withLoading(btnCarib, async () => {
    log("Scenario: Caribbean multi-hazard");
    await clearAllViews();

    await ensureView("MX-10AE5-746D1-76777"); /* Cyclone */
    await ensureView("MX-V07LO-829XA-4BIZ8"); /* Flood */

    log("Flying to Caribbean...");
    await mapFlyTo({ center: { lng: -72, lat: 18 }, zoom: 5.5 });

    log("Setting cyclone layer to 50% transparency...");
    await setViewLayerTransparency("MX-10AE5-746D1-76777", 50);
  }));

  /* --- Scenario 3: SE Asia — Tsunami + Mangrove Restoration --- */
  const btnTsunami = document.getElementById("sc-seasia-tsunami");
  btnTsunami.addEventListener("click", () => withLoading(btnTsunami, async () => {
    log("Scenario: SE Asia tsunami + mangrove NbS");
    await clearAllViews();

    await ensureView("MX-F0DEE-12D97-6447B"); /* Tsunami */
    await ensureView("MX-559C5-58858-96A69"); /* Mangrove */

    log("Flying to Indonesia...");
    await commonLocFitBbox("IDN", { duration: 2000 });

    log("Setting tsunami layer to 40% transparency...");
    await setViewLayerTransparency("MX-F0DEE-12D97-6447B", 40);
  }));

  /* --- Scenarios 4a/4b: Water Stress 2030 --- */
  const waterStressView = "MX-1L2TA-6FXPV-N3QMX";
  let waterStressCategories = null;

  async function ensureWaterStressReady() {
    await ensureView(waterStressView);
    if (!waterStressCategories) {
      await mapWaitIdle();
      try {
        const data = await getViewTableAttribute(waterStressView);
        if (data && Array.isArray(data)) {
          const cats = new Set();
          for (const row of data) {
            const val = row.ws3028cl || Object.values(row).find((v) => typeof v === "string");
            if (val) cats.add(val);
          }
          waterStressCategories = [...cats].sort();
          log(`Water stress categories: ${waterStressCategories.join(", ")}`);
        }
      } catch (e) {
        log("Attribute data: " + e.message);
      }
    }
  }

  const btnWaterHigh = document.getElementById("sc-water-high");
  btnWaterHigh.addEventListener("click", () => withLoading(btnWaterHigh, async () => {
    log("Water Stress 2030 — filtering to HIGH stress");
    await ensureWaterStressReady();
    if (waterStressCategories) {
      const high = waterStressCategories.filter((c) => c.toLowerCase().includes("increase"));
      log(`Showing: ${high.join(", ")}`);
      await setViewLayerFilterText(waterStressView, high);
    }
  }));

  const btnWaterLow = document.getElementById("sc-water-low");
  btnWaterLow.addEventListener("click", () => withLoading(btnWaterLow, async () => {
    log("Water Stress 2030 — filtering to LOW stress");
    await ensureWaterStressReady();
    if (waterStressCategories) {
      const low = waterStressCategories.filter(
        (c) => c.toLowerCase().includes("decrease") || c.toLowerCase().includes("normal"),
      );
      log(`Showing: ${low.join(", ")}`);
      await setViewLayerFilterText(waterStressView, low);
    }
  }));

  /* --- Scenario 5: Nepal — Compound Risk --- */
  /*
   * Three-layer stacking: Population + Flood Hazard + Landslide Exposure.
   * Demonstrates multi-hazard overlap analysis with transparency blending.
   * Flies to Nepal — a mountainous region prone to compound flood +
   * landslide events. Population layer shows who is exposed.
   */
  const btnCompound = document.getElementById("sc-compound-nepal");
  btnCompound.addEventListener("click", () => withLoading(btnCompound, async () => {
    log("Scenario: Nepal compound risk");
    await clearAllViews();

    await ensureView("MX-6YLMU-U4WXC-2JJD7"); /* Population HRSL 2022 */
    await ensureView("MX-V07LO-829XA-4BIZ8"); /* Flood Hazard 25yr */
    await ensureView("MX-04E66-2E550-81068"); /* Landslide Exposure */

    log("Flying to Nepal...");
    await commonLocFitBbox("NPL", { duration: 2000 });

    log("Setting transparency for overlay stacking...");
    await setViewLayerTransparency("MX-V07LO-829XA-4BIZ8", 40); /* Flood at 40% */
    await setViewLayerTransparency("MX-04E66-2E550-81068", 50); /* Landslide at 50% */
  }));

  /* --- Scenario 6: Live Monitoring Dashboard --- */
  /*
   * Earthquakes (live) + Active Fires. Shows real-time data layers
   * combined on a single view. Opens the fires dashboard for the
   * administrative-level fire activity analysis.
   */
  const btnLive = document.getElementById("sc-live-monitoring");
  btnLive.addEventListener("click", () => withLoading(btnLive, async () => {
    log("Scenario: Live monitoring dashboard");
    await clearAllViews();

    await ensureView("MX-YLZJG-JAIID-V27X5"); /* Earthquakes Mag >= 5.5 */
    await ensureView("MX-OU7NG-ZNZGA-ZX3K0"); /* Active Fires */

    log("Setting world view for monitoring...");
    await mapFlyTo({ center: { lng: 40, lat: 20 }, zoom: 3 });

    await mapWaitIdle();
    try {
      const hasDash = await hasDashboard();
      if (hasDash) {
        log("Opening fires dashboard...");
        await setDashboardVisibility(true);
      }
    } catch (e) {
      log("Dashboard: " + e.message);
    }
  }));
}
