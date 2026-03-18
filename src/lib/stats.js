/**
 * Compute basic statistics locally from a GeoJSON FeatureCollection.
 *
 * WHY THIS EXISTS:
 * The MapX SDK provides get_view_source_summary for server-side views
 * (vector tiles, raster tiles, etc.), but custom GeoJSON overlays
 * added via view_geojson_create live entirely on the client — the
 * server knows nothing about them. So get_view_source_summary just
 * returns nothing useful for them. So we compute the same kind of
 * summary (count, min/max/mean, category counts) locally from the
 * GeoJSON data we already have in memory.
 *
 * NUMERIC vs TEXT DETECTION:
 * Real-world GeoJSON is messy — a field called "population" might be
 * a number in most features but a string like "N/A" in a few others.
 * We use a simple heuristic: if more than 50% of the non-empty values
 * for an attribute can be parsed as numbers, treat the whole attribute
 * as numeric (and just ignore the non-numeric outliers). Otherwise
 * treat it as categorical text and count up the distinct values.
 *
 * Returns an object with:
 *   - count: number of features
 *   - attributes: object mapping attribute names to stats
 *     Each attribute has: type ("numeric"|"text"), and either
 *     {min, max, mean, count} for numeric or {categories, count} for text.
 */
export function computeLocalStats(geojson) {
  const features = geojson.features || [];
  const result = { count: features.length, attributes: {} };
  if (features.length === 0) return result;

  /* Collect all property keys across all features */
  const allKeys = new Set();
  for (const f of features) {
    if (f.properties) {
      Object.keys(f.properties).forEach((k) => allKeys.add(k));
    }
  }

  for (const key of allKeys) {
    const values = features
      .map((f) => f.properties && f.properties[key])
      .filter((v) => v != null && v !== "");

    if (values.length === 0) continue;

    /* Determine if numeric or text based on actual values */
    const numericValues = values.filter(
      (v) => typeof v === "number" || !isNaN(Number(v)),
    );

    if (numericValues.length > values.length / 2) {
      /* Treat as numeric */
      const nums = numericValues.map(Number);
      result.attributes[key] = {
        type: "numeric",
        min: Math.min(...nums),
        max: Math.max(...nums),
        mean: nums.reduce((a, b) => a + b, 0) / nums.length,
        count: nums.length,
      };
    } else {
      /* Treat as categorical text */
      const categories = {};
      for (const v of values) {
        const s = String(v);
        categories[s] = (categories[s] || 0) + 1;
      }
      result.attributes[key] = {
        type: "text",
        categories,
        count: values.length,
      };
    }
  }

  return result;
}
