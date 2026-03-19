/**
 * Explorer demo layer configuration and preset query definitions.
 *
 * Hazard layers are curated MapX views added via view_add.
 * Damage events are loaded via viewGeojsonCreate from the local dataset.
 */

/** Hazard layers to pre-load in the explorer */
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

/** Paint spec for the damage event circles */
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
