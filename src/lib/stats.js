/**
 * Compute basic statistics locally from a GeoJSON FeatureCollection.
 * Used for custom overlays where get_view_source_summary won't work.
 */
export function computeLocalStats(geojson) {
  const features = geojson.features || [];
  const result = { count: features.length, attributes: {} };
  if (features.length === 0) return result;

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

    const numericValues = values.filter(
      (v) => typeof v === "number" || !isNaN(Number(v)),
    );

    if (numericValues.length > values.length / 2) {
      const nums = numericValues.map(Number);
      result.attributes[key] = {
        type: "numeric",
        min: Math.min(...nums),
        max: Math.max(...nums),
        mean: nums.reduce((a, b) => a + b, 0) / nums.length,
        count: nums.length,
      };
    } else {
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
