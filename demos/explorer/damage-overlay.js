/**
 * Damage overlay — loads and styles the fictional damage event GeoJSON.
 *
 * Creates a dynamic GeoJSON view inside the MapX iframe, applies
 * data-driven circle paint (radius by damage_usd, color by severity),
 * and exposes accessors so other modules (preset-queries) can read
 * the overlay state without importing the raw data themselves.
 */

import { viewGeojsonCreate, viewGeojsonSetStyle } from "../../src/sdk/views.js";
import { damageEventsGeoJSON } from "../../src/data/damage-events.js";
import { DAMAGE_CIRCLE_PAINT } from "../../src/config/explorer-layers.js";
import { log } from "../../src/ui/log.js";

/** @type {string|null} SDK-assigned view ID once the overlay is created */
let damageViewId = null;

/**
 * Return the SDK view ID of the damage overlay.
 *
 * @returns {string|null} The view ID, or `null` if the overlay has not
 *   been loaded yet (or failed to load).
 */
export function getDamageViewId() {
  return damageViewId;
}

/**
 * Return the raw GeoJSON FeatureCollection used by the damage overlay.
 *
 * @returns {object} A GeoJSON FeatureCollection whose features each
 *   carry the properties described in `src/data/damage-events.js`.
 */
export function getDamageGeoJSON() {
  return damageEventsGeoJSON;
}

/**
 * Create the damage-event overlay inside the MapX iframe.
 *
 * Calls `viewGeojsonCreate` with the fictional dataset and then
 * applies the circle paint spec from `DAMAGE_CIRCLE_PAINT`.
 *
 * @returns {Promise<string|null>} The SDK-assigned view ID on success,
 *   or `null` if creation failed.
 */
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
