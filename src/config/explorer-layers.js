/**
 * Explorer demo layer configuration and preset query definitions.
 *
 * Hazard layers are curated MapX views added via view_add.
 * Damage events are loaded via viewGeojsonCreate from the local dataset.
 */

/**
 * Hazard layers to pre-load in the explorer.
 *
 * Each entry is added via `viewAdd(id)` during init.
 *
 * - `id`    — MapX view identifier used by the SDK.
 * - `label` — Human-readable name shown in the debug log.
 * - `type`  — MapX view type code for reference ("rt" = raster-tile).
 *             Not consumed by runtime code; kept as documentation
 *             metadata so developers know what kind of layer this is.
 */
export const EXPLORER_HAZARD_LAYERS = [
  { id: "MX-V07LO-829XA-4BIZ8", label: "Flood Hazard 25yr", type: "rt" },
  { id: "MX-10AE5-746D1-76777", label: "Tropical Cyclone Exposure", type: "rt" },
];

/** Severity-based circle color mapping for the damage overlay */
export const SEVERITY_COLORS = {
  Critical: "#c10920",
  High: "#eb752a",
  Medium: "#f0c808",
  Low: "#00afae",
};

/**
 * Mapbox GL Style Spec paint properties for damage-event circles.
 *
 * The values below use **Mapbox expression syntax** — JSON arrays that
 * the Mapbox GL renderer evaluates at render time. They are NOT plain
 * JavaScript; they are declarative style expressions passed through the
 * SDK to the underlying Mapbox GL map.
 *
 * - `circle-radius`: an `["interpolate", ["linear"], ...]` expression
 *   that linearly scales the circle radius based on the feature's
 *   `damage_usd` property ($400 K -> 6 px, $5 M -> 12 px, $12 M -> 20 px).
 *
 * - `circle-color`: a `["match", ["get", "severity"], ...]` expression
 *   that maps the feature's `severity` string to a Sendai-palette color.
 *   Falls back to `#808080` (grey) for unrecognised values.
 *
 * - `circle-stroke-*` / `circle-opacity`: static values for the white
 *   outline and 85 % fill opacity.
 *
 * @see https://docs.mapbox.com/style-spec/reference/expressions/
 */
export const DAMAGE_CIRCLE_PAINT = {
  "circle-radius": [
    "interpolate", ["linear"], ["get", "damage_usd"],
    400000, 6,
    5000000, 12,
    12000000, 20,
  ],
  "circle-color": [
    "match", ["get", "severity"],
    "Critical", SEVERITY_COLORS.Critical,
    "High", SEVERITY_COLORS.High,
    "Medium", SEVERITY_COLORS.Medium,
    "Low", SEVERITY_COLORS.Low,
    "#808080",
  ],
  "circle-stroke-width": 2,
  "circle-stroke-color": "#ffffff",
  "circle-opacity": 0.85,
};

/** Preset query definitions for the explorer sidebar */
export const PRESET_QUERIES = [
  {
    id: "high-damage",
    label: "High Damage (> $5M)",
    description: "Events with damage exceeding $5 million USD",
    filter: (f) => f.properties.damage_usd > 5000000,
  },
  {
    id: "critical-severity",
    label: "Critical Severity",
    description: "Events classified as Critical severity",
    filter: (f) => f.properties.severity === "Critical",
  },
  {
    id: "floods-only",
    label: "Floods Only",
    description: "Filter to flood events",
    filter: (f) => f.properties.event_type === "Flood",
  },
  {
    id: "large-affected",
    label: "Large Impact (> 30K people)",
    description: "Events affecting more than 30,000 people",
    filter: (f) => f.properties.affected_people > 30000,
  },
];
