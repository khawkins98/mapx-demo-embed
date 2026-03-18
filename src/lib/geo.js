import { customGeoJSONRegistry } from "../state/store.js";

/**
 * Ray-casting point-in-polygon test.
 * Works for simple polygons (not multi-polygons with holes).
 */
export function pointInPolygon(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Find the nearest/matching GeoJSON feature at a click location.
 * Checks polygons first (exact containment), then points (nearest within tolerance).
 *
 * @param {number} lng - Click longitude
 * @param {number} lat - Click latitude
 * @param {Array} registry - GeoJSON registry to search (defaults to store)
 * @returns {Object|null} Feature properties, or null if no match
 */
export function findNearestFeature(lng, lat, registry = customGeoJSONRegistry) {
  /* Pass 1: Check polygons first */
  for (const { geojson } of registry) {
    for (const feature of geojson.features) {
      if (feature.geometry.type === "Polygon") {
        const ring = feature.geometry.coordinates[0];
        if (pointInPolygon(lng, lat, ring)) {
          return feature.properties;
        }
      } else if (feature.geometry.type === "MultiPolygon") {
        for (const polygon of feature.geometry.coordinates) {
          if (pointInPolygon(lng, lat, polygon[0])) {
            return feature.properties;
          }
        }
      }
    }
  }

  /* Pass 2: Check points — nearest within 0.5 degrees */
  let best = null;
  let bestDist = 0.5;

  for (const { geojson } of registry) {
    for (const feature of geojson.features) {
      if (feature.geometry.type !== "Point") continue;
      const [fLng, fLat] = feature.geometry.coordinates;
      const dist = Math.sqrt((fLng - lng) ** 2 + (fLat - lat) ** 2);
      if (dist < bestDist) {
        bestDist = dist;
        best = feature.properties;
      }
    }
  }
  return best;
}
