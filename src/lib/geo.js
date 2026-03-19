import { customGeoJSONRegistry } from "../state/store.js";

/**
 * Simple point-in-polygon test using the ray casting algorithm.
 * Works for simple polygons (not multi-polygons with holes).
 *
 * HOW IT WORKS (non-technical summary):
 * Imagine drawing a horizontal line from the test point out to
 * infinity. If that line crosses the polygon boundary an ODD
 * number of times, the point is inside. If it crosses an EVEN
 * number of times (or zero), the point is outside. Think of it
 * like crossing fence lines — if you cross one fence you're in
 * the yard; cross a second and you're out again.
 *
 * The loop walks each edge of the polygon (pairs of consecutive
 * vertices). For each edge, it checks: (a) does the edge straddle
 * the point's latitude? and (b) is the crossing point to the
 * right of the test point? Each qualifying crossing toggles the
 * inside/outside flag.
 *
 * @param {number} lng - Longitude of the test point
 * @param {number} lat - Latitude of the test point
 * @param {Array}  ring - Array of [lng, lat] coordinate pairs
 *                        forming the polygon's outer boundary
 * @returns {boolean} true if the point is inside the polygon
 */
export function pointInPolygon(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    /* Check if edge straddles the point's latitude, and if the
     * ray cast rightward from the point crosses this edge */
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
 * Handles both Point (nearest within 0.5 degrees) and Polygon
 * (point-in-polygon ray casting) geometries.
 *
 * TWO-PASS APPROACH:
 * This function uses a deliberate two-pass strategy:
 *
 *   Pass 1 — Polygons (exact containment test):
 *     Polygons are checked first because they provide an exact,
 *     unambiguous match: either the click is inside the polygon
 *     or it isn't. If the user clicks inside a project zone,
 *     we can confidently return that zone's properties.
 *
 *   Pass 2 — Points (nearest-neighbor proximity):
 *     Points are checked second because they use approximate
 *     matching (closest point within 0.5 degrees). This is a
 *     fuzzy match — if the click is near two points, we pick
 *     the closest one. By checking polygons first, we avoid
 *     the situation where a point proximity match "steals" a
 *     click that was clearly meant for an overlapping polygon.
 *
 * The `registry` parameter was added during the refactor so this
 * function can be tested in isolation — just pass in a fake
 * registry array instead of mocking the global store.
 *
 * @param {number} lng - Click longitude
 * @param {number} lat - Click latitude
 * @param {Array} registry - GeoJSON registry to search (defaults to store)
 * @returns {Object|null} Feature properties, or null if no match
 */
export function findNearestFeature(lng, lat, registry = customGeoJSONRegistry) {
  /* Pass 1: Check polygons first — exact containment test.
   * If the click lands inside a polygon, return immediately.
   * This takes priority over nearby points. */
  for (const { geojson } of registry) {
    for (const feature of geojson.features) {
      if (feature.geometry.type === "Polygon") {
        const ring = feature.geometry.coordinates[0]; /* outer ring */
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

  /* Pass 2: Check points — nearest-neighbor within tolerance.
   * Only reached if no polygon contained the click point.
   * The 0.5-degree tolerance is generous enough to catch clicks
   * near markers at most zoom levels, but tight enough to avoid
   * matching distant features. */
  let best = null;
  let bestDist = 0.5; /* tolerance in degrees (~55 km at equator) */

  for (const { geojson } of registry) {
    for (const feature of geojson.features) {
      if (feature.geometry.type !== "Point") continue;
      const [fLng, fLat] = feature.geometry.coordinates;
      /* Simple Euclidean distance in degree-space. Not geodesically
       * accurate, but perfectly adequate for click-matching — we just
       * need a rough "closest" ranking, not a precise distance. */
      const dist = Math.sqrt((fLng - lng) ** 2 + (fLat - lat) ** 2);
      if (dist < bestDist) {
        bestDist = dist;
        best = feature.properties;
      }
    }
  }
  return best;
}
