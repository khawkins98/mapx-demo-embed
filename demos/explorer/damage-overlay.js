/**
 * Damage overlay — loads and styles the fictional damage event GeoJSON.
 */

import { viewGeojsonCreate, viewGeojsonSetStyle } from "../../src/sdk/views.js";
import { damageEventsGeoJSON } from "../../src/data/damage-events.js";
import { DAMAGE_CIRCLE_PAINT } from "../../src/config/explorer-layers.js";
import { log } from "../../src/ui/log.js";

let damageViewId = null;

export function getDamageViewId() {
  return damageViewId;
}

export function getDamageGeoJSON() {
  return damageEventsGeoJSON;
}

export async function loadDamageOverlay() {
  try {
    const result = await viewGeojsonCreate({
      data: damageEventsGeoJSON,
      title: { en: "Damage Events (fictional)" },
      abstract: { en: "Simulated damage event points for analysis demo" },
      random: false,
    });
    damageViewId = result.id;

    await viewGeojsonSetStyle(damageViewId, DAMAGE_CIRCLE_PAINT);
    log(`Damage overlay loaded: ${damageEventsGeoJSON.features.length} events`);
    return damageViewId;
  } catch (e) {
    log(`Failed to load damage overlay: ${e.message}`);
    return null;
  }
}
