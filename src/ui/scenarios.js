import { log } from "./log.js";
import { clearAllViews, ensureView } from "./view-buttons.js";
import { mapFlyTo, commonLocFitBbox, mapWaitIdle } from "../sdk/map-control.js";
import { setViewLayerTransparency, setViewLayerFilterText } from "../sdk/filters.js";
import { hasDashboard, setDashboardVisibility } from "../sdk/ui.js";
import { getViewTableAttribute } from "../sdk/data-query.js";

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
