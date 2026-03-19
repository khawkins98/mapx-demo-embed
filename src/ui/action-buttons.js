/**
 * Action button wiring — connects UI buttons to SDK methods.
 *
 * This module handles three groups of controls:
 *
 * 1. Floating map toolbar (bottom-left of map area):
 *    Zoom, globe, terrain, 3D tilt, aerial, immersive mode.
 *    Moved from the sidebar to keep controls visible at all times.
 *
 * 2. Navigate section (sidebar):
 *    Country/region dropdown (populated from common_loc_get_list_codes),
 *    preset region buttons, and the "Remove All Views" reset button.
 *
 * 3. Sub-module initialisation:
 *    Delegates to enableScenarios(), enableCustomData(), enableSdkFeatures(),
 *    and enableAnalysisTools() for their respective sidebar sections.
 *
 * SDK methods used:
 *   map_fly_to, map_get_zoom, getProjection, setProjection,
 *   set_3d_terrain, set_mode_3d, set_mode_aerial, set_immersive_mode,
 *   common_loc_fit_bbox, common_loc_get_list_codes
 */

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
  commonLocFitBbox, commonLocGetListCodes,
} from "../sdk/map-control.js";

/**
 * Enable all action buttons and sub-modules.
 * Called once after SDK ready event fires.
 */
export function enableActionButtons() {
  /* Remove 'disabled' class from all wired buttons */
  document
    .querySelectorAll(
      ".action-buttons .mg-button, .map-toolbar-btn, #btn-reset, #scenario-buttons .mg-button",
    )
    .forEach((b) => b.classList.remove("disabled"));

  /* Initialise sub-modules */
  enableScenarios();
  enableCustomData();
  enableSdkFeatures();
  enableAnalysisTools();

  /* --- Floating map toolbar controls --- */
  wireMapToolbar();

  /* --- Navigate section --- */
  wireRegionPresets();
  wireCountryDropdown();

  /* Reset button */
  document.getElementById("btn-reset").addEventListener("click", async () => {
    log("Removing all views");
    await clearAllViews();
  });
}

/**
 * Wire up the floating map toolbar buttons.
 * These are the zoom, projection, and display mode controls that
 * sit in a compact vertical bar on the map.
 */
function wireMapToolbar() {
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
}

/**
 * Wire up the preset region fly-to buttons.
 * These are the quick-access buttons in the Navigate section.
 */
function wireRegionPresets() {
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
}

/**
 * Populate the country/region dropdown from common_loc_get_list_codes().
 *
 * The SDK returns an array of {code, label} objects. We group them into:
 *   1. Preset regions (optgroup at top for quick access)
 *   2. M49 region codes (codes starting with "m49_")
 *   3. Country codes (everything else, sorted alphabetically by label)
 *
 * When a selection is made, we fly to the location via common_loc_fit_bbox.
 */
async function wireCountryDropdown() {
  const select = document.getElementById("country-select");

  try {
    const codes = await commonLocGetListCodes();
    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      select.innerHTML = '<option value="">No locations available</option>';
      return;
    }

    log(`Loaded ${codes.length} location codes`);

    /* Separate M49 regions from country codes */
    const regions = [];
    const countries = [];
    for (const item of codes) {
      /* item may be a string code or {code, label} object */
      const code = typeof item === "string" ? item : item.code || item;
      const label = typeof item === "object" ? (item.label || item.name || code) : code;
      if (typeof code === "string" && code.startsWith("m49_")) {
        regions.push({ code, label });
      } else {
        countries.push({ code, label });
      }
    }

    /* Sort alphabetically by label */
    regions.sort((a, b) => a.label.localeCompare(b.label));
    countries.sort((a, b) => a.label.localeCompare(b.label));

    /* Build dropdown HTML */
    let html = '<option value="">-- Select a location --</option>';

    if (regions.length > 0) {
      html += '<optgroup label="Regions">';
      for (const r of regions) {
        html += `<option value="${r.code}">${r.label}</option>`;
      }
      html += "</optgroup>";
    }

    if (countries.length > 0) {
      html += '<optgroup label="Countries">';
      for (const c of countries) {
        html += `<option value="${c.code}">${c.label}</option>`;
      }
      html += "</optgroup>";
    }

    select.innerHTML = html;
    select.disabled = false;

    /* Fly to selected location on change */
    select.addEventListener("change", async () => {
      const code = select.value;
      if (!code) return;
      log(`Flying to: ${select.options[select.selectedIndex].text} (${code})`);
      try {
        await commonLocFitBbox(code, { duration: 2000 });
      } catch (e) {
        log(`Navigation error: ${e.message}`);
      }
    });
  } catch (e) {
    log(`Country dropdown: ${e.message}`);
    select.innerHTML = '<option value="">Unavailable</option>';
  }
}
