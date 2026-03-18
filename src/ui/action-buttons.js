import { log } from "./log.js";
import { clearAllViews } from "./view-buttons.js";
import { enableScenarios } from "./scenarios.js";
import { enableCustomData } from "./custom-data.js";
import { enableSdkFeatures } from "./sdk-features.js";
import { enableAnalysisTools } from "./analysis/panel.js";
import { REGIONS } from "../config/regions.js";
import {
  mapFlyTo, mapGetZoom, getProjection, setProjection,
  set3dTerrain, setMode3d, setModeAerial, setImmersiveMode,
} from "../sdk/map-control.js";

export function enableActionButtons() {
  document
    .querySelectorAll(".action-buttons .mg-button, #btn-zoom-in, #btn-zoom-out, #btn-reset, #scenario-buttons .mg-button")
    .forEach((b) => b.classList.remove("disabled"));

  enableScenarios();
  enableCustomData();
  enableSdkFeatures();
  enableAnalysisTools();

  document.getElementById("btn-zoom-in").addEventListener("click", async () => {
    const z = await mapGetZoom();
    log(`Zoom in: ${z.toFixed(1)} → ${(z + 2).toFixed(1)}`);
    await mapFlyTo({ zoom: z + 2 });
  });

  document.getElementById("btn-zoom-out").addEventListener("click", async () => {
    const z = await mapGetZoom();
    log(`Zoom out: ${z.toFixed(1)} → ${(z - 2).toFixed(1)}`);
    await mapFlyTo({ zoom: Math.max(0, z - 2) });
  });

  document.getElementById("btn-globe").addEventListener("click", async () => {
    const current = await getProjection();
    const next = current?.name === "globe" ? "mercator" : "globe";
    log(`Setting projection: ${next}`);
    await setProjection(next);
  });

  document.getElementById("btn-terrain").addEventListener("click", async () => {
    log("Toggling 3D terrain");
    await set3dTerrain("toggle");
  });

  document.getElementById("btn-3d").addEventListener("click", async () => {
    log("Toggling 3D tilt mode");
    await setMode3d("toggle");
  });

  document.getElementById("btn-aerial").addEventListener("click", async () => {
    log("Toggling aerial view");
    await setModeAerial("toggle");
  });

  document.getElementById("btn-immersive").addEventListener("click", async () => {
    log("Toggling immersive mode");
    await setImmersiveMode("toggle");
  });

  document.getElementById("btn-world").addEventListener("click", async () => {
    log("Fly to world view");
    await mapFlyTo(REGIONS.world);
  });

  document.getElementById("btn-caribbean").addEventListener("click", async () => {
    log("Fly to Caribbean");
    await mapFlyTo(REGIONS.caribbean);
  });

  document.getElementById("btn-se-asia").addEventListener("click", async () => {
    log("Fly to Southeast Asia");
    await mapFlyTo(REGIONS.seAsia);
  });

  document.getElementById("btn-e-africa").addEventListener("click", async () => {
    log("Fly to East Africa");
    await mapFlyTo(REGIONS.eAfrica);
  });

  document.getElementById("btn-pacific").addEventListener("click", async () => {
    log("Fly to Pacific Islands");
    await mapFlyTo(REGIONS.pacific);
  });

  document.getElementById("btn-reset").addEventListener("click", async () => {
    log("Removing all views");
    await clearAllViews();
  });
}
