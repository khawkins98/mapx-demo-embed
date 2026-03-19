/**
 * Story step definitions for the "Risk to Resilience" narrative.
 *
 * Each step defines:
 *   - id: unique step identifier
 *   - title: heading shown in the narrative panel
 *   - narrative: body text explaining the data
 *   - views: array of MapX view IDs to display
 *   - camera: either {center, zoom} for mapFlyTo, or {code, param} for commonLocFitBbox
 *   - transparency: optional map of viewId → transparency value (0=opaque, 100=invisible)
 */

export const STORY_STEPS = [
  {
    id: "intro",
    title: "Introduction",
    narrative:
      "Welcome to the Eco-DRR risk narrative. This story walks through " +
      "how disaster risk emerges from the intersection of natural hazards, " +
      "human exposure, and vulnerability — and how nature-based solutions " +
      "can build resilience. Use the Next button to begin.",
    views: [],
    camera: { center: { lng: 20, lat: 15 }, zoom: 2.5 },
  },
  {
    id: "hazard",
    title: "Step 1: Hazard",
    narrative:
      "Flood hazard data reveals areas prone to inundation during a " +
      "25-year return period event. The darker tones indicate higher " +
      "expected water depth. Coastal and riverine lowlands in South and " +
      "Southeast Asia face the greatest flood hazard.",
    views: ["MX-V07LO-829XA-4BIZ8"],
    camera: { center: { lng: 90, lat: 23 }, zoom: 5 },
  },
  {
    id: "exposure",
    title: "Step 2: Exposure",
    narrative:
      "Population density from the High Resolution Settlement Layer (HRSL 2022) " +
      "shows where people live. Overlaying population with hazard data reveals " +
      "how many people are physically exposed to flood risk. Dense settlements " +
      "along river deltas are especially vulnerable.",
    views: ["MX-V07LO-829XA-4BIZ8", "MX-6YLMU-U4WXC-2JJD7"],
    camera: { center: { lng: 90, lat: 23 }, zoom: 6 },
    transparency: { "MX-V07LO-829XA-4BIZ8": 40 },
  },
  {
    id: "vulnerability",
    title: "Step 3: Vulnerability",
    narrative:
      "Landslide exposure data highlights mountainous regions where terrain " +
      "instability compounds flood risk. Communities in steep terrain with " +
      "deforested hillsides face cascading hazards — floods trigger landslides, " +
      "which block drainage and cause further flooding.",
    views: ["MX-04E66-2E550-81068"],
    camera: { code: "NPL", param: { duration: 2000 } },
  },
  {
    id: "compound-risk",
    title: "Step 4: Compound Risk",
    narrative:
      "When we overlay population, flood hazard, and landslide exposure " +
      "together, the compound risk picture emerges. Nepal's Terai belt and " +
      "middle hills show high overlap between all three — meaning large " +
      "populations face multiple simultaneous hazards.",
    views: [
      "MX-6YLMU-U4WXC-2JJD7",
      "MX-V07LO-829XA-4BIZ8",
      "MX-04E66-2E550-81068",
    ],
    camera: { code: "NPL", param: { duration: 2000 } },
    transparency: {
      "MX-6YLMU-U4WXC-2JJD7": 30,
      "MX-V07LO-829XA-4BIZ8": 40,
    },
  },
  {
    id: "nbs",
    title: "Step 5: Nature-Based Solutions",
    narrative:
      "Forest protection can significantly reduce flood risk in downstream " +
      "communities. This layer shows areas where protecting existing forest " +
      "cover would have the greatest impact on reducing flood exposure. " +
      "Mangrove restoration along coastlines provides a natural buffer " +
      "against cyclone storm surge.",
    views: ["MX-DC56E-6ABC9-3C768", "MX-559C5-58858-96A69"],
    camera: { center: { lng: 100, lat: 10 }, zoom: 4.5 },
    transparency: { "MX-559C5-58858-96A69": 30 },
  },
  {
    id: "monitoring",
    title: "Step 6: Monitoring",
    narrative:
      "Real-time monitoring completes the picture. Live earthquake data " +
      "(M5.5+) from USGS and active fire tracking at administrative level " +
      "provide early warning signals. Continuous monitoring helps " +
      "communities prepare and respond to emerging threats.",
    views: ["MX-YLZJG-JAIID-V27X5", "MX-OU7NG-ZNZGA-ZX3K0"],
    camera: { center: { lng: 20, lat: 15 }, zoom: 2.5 },
  },
  {
    id: "resilience",
    title: "Step 7: Resilience",
    narrative:
      "From hazard to resilience: understanding where risks overlap and " +
      "where nature-based solutions can help is the foundation of " +
      "disaster risk reduction. The Eco-DRR approach combines geospatial " +
      "data, real-time monitoring, and ecosystem-based interventions to " +
      "build a more resilient future. Explore the other demos to dive deeper.",
    views: [],
    camera: { center: { lng: 20, lat: 15 }, zoom: 2.5 },
  },
];
