import { log } from "./log.js";
import { clearAllViews, ensureView } from "./view-buttons.js";
import { mapFlyTo, commonLocFitBbox, mapWaitIdle } from "../sdk/map-control.js";
import { setViewLayerTransparency, setViewLayerFilterText } from "../sdk/filters.js";
import { hasDashboard, setDashboardVisibility } from "../sdk/ui.js";
import { getViewTableAttribute } from "../sdk/data-query.js";

/**
 * Pre-built scenarios that demonstrate chaining multiple SDK calls into
 * cohesive workflows. Each scenario clears the map, loads specific views,
 * flies to a region, and optionally applies filters or opens dashboards.
 *
 * Key SDK methods used across scenarios:
 *   - common_loc_fit_bbox(code)        — fly to a country by ISO 3166 alpha-3
 *   - set_view_layer_transparency(id, %) — blend a layer for overlay stacking
 *   - has_dashboard() / set_dashboard_visibility() — check and toggle dashboards
 *   - get_view_table_attribute(id)     — fetch the attribute table for a vt view
 *   - set_view_layer_filter_text(id, values) — filter a vt layer by category values
 *   - map_wait_idle()                  — wait for tiles to finish loading before
 *                                         querying dashboards or attribute data
 *
 * Scenario 1 — India: Active Fires + Dashboard
 *   The Active Fires view (MX-OU7NG-ZNZGA-ZX3K0) is a vector tile layer
 *   with an attached dashboard showing fire counts by admin region. We
 *   call has_dashboard() to check before opening it — not every view has
 *   one. The dashboard is built into the MapX view configuration; we just
 *   toggle its visibility. To adapt this for other views, swap the idView
 *   and country code, and check whether the new view has a dashboard.
 *
 * Scenario 2 — Caribbean: Cyclone Exposure + Flood Hazard
 *   Two raster layers stacked on top of each other. The cyclone layer is
 *   set to 50% transparency so the flood hazard layer shows through
 *   underneath. Layer ordering follows the order of ensureView calls —
 *   the second view renders on top. Transparency blending lets users see
 *   where multiple hazards overlap, which is the whole point of multi-
 *   hazard risk analysis.
 *
 * Scenario 3 — SE Asia: Tsunami Exposure + Mangrove Restoration
 *   Demonstrates the Eco-DRR (Ecosystem-based Disaster Risk Reduction)
 *   use case: pairing a natural hazard layer (tsunami exposure) with a
 *   nature-based solution layer (mangrove restoration potential for
 *   cyclone surge protection). The tsunami layer gets 40% transparency
 *   so the mangrove restoration priorities are visible underneath.
 *
 * Scenario 4 — Water Stress 2030 (RCP 8.5)
 *   The water stress view (MX-1L2TA-6FXPV-N3QMX) is a vector tile layer
 *   with a text attribute column called "ws3028cl" that contains category
 *   labels like "Significant increase", "Moderate decrease", "Near normal".
 *   We fetch all rows via get_view_table_attribute, extract unique category
 *   values, then split them into "high stress" (categories containing
 *   "increase") and "low stress" (categories containing "decrease" or
 *   "normal"). The two sub-buttons apply different text filters to show
 *   only the relevant polygons.
 */
export function enableScenarios() {
  /* Scenario 1: India — Active Fires + Dashboard */
  document.getElementById("sc-fires-india").addEventListener("click", async () => {
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
  });

  /* Scenario 2: Caribbean — Cyclone Exposure + Flood Hazard */
  document.getElementById("sc-caribbean-multi").addEventListener("click", async () => {
    log("Scenario: Caribbean multi-hazard");
    await clearAllViews();

    await ensureView("MX-10AE5-746D1-76777");
    await ensureView("MX-V07LO-829XA-4BIZ8");

    log("Flying to Caribbean...");
    await mapFlyTo({ center: { lng: -72, lat: 18 }, zoom: 5.5 });

    log("Setting cyclone layer to 50% transparency...");
    await setViewLayerTransparency("MX-10AE5-746D1-76777", 50);
  });

  /* Scenario 3: SE Asia — Tsunami Exposure + Mangrove Restoration */
  document.getElementById("sc-seasia-tsunami").addEventListener("click", async () => {
    log("Scenario: SE Asia tsunami + mangrove NbS");
    await clearAllViews();

    await ensureView("MX-F0DEE-12D97-6447B");
    await ensureView("MX-559C5-58858-96A69");

    log("Flying to Indonesia...");
    await commonLocFitBbox("IDN", { duration: 2000 });

    log("Setting tsunami layer to 40% transparency...");
    await setViewLayerTransparency("MX-F0DEE-12D97-6447B", 40);
  });

  /* Scenarios 4a/4b: Water Stress 2030 */
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

  document.getElementById("sc-water-high").addEventListener("click", async () => {
    log("Water Stress 2030 — filtering to HIGH stress");
    await ensureWaterStressReady();
    if (waterStressCategories) {
      const high = waterStressCategories.filter((c) => c.toLowerCase().includes("increase"));
      log(`Showing: ${high.join(", ")}`);
      await setViewLayerFilterText(waterStressView, high);
    }
  });

  document.getElementById("sc-water-low").addEventListener("click", async () => {
    log("Water Stress 2030 — filtering to LOW stress");
    await ensureWaterStressReady();
    if (waterStressCategories) {
      const low = waterStressCategories.filter(
        (c) => c.toLowerCase().includes("decrease") || c.toLowerCase().includes("normal"),
      );
      log(`Showing: ${low.join(", ")}`);
      await setViewLayerFilterText(waterStressView, low);
    }
  });
}
