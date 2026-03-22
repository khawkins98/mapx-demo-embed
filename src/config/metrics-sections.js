/**
 * Scrollytelling section definitions for the Metrics Hub.
 *
 * Each section defines:
 *   id           - unique section identifier
 *   title        - heading shown in the narrative card
 *   narrative    - body text (HTML allowed for emphasis)
 *   views        - array of MapX view IDs to display
 *   camera       - {center, zoom} for mapFlyTo, or {code, param} for commonLocFitBbox
 *   transparency - optional map of viewId -> transparency value (0=opaque, 100=invisible)
 *   chart        - { type, title, data, unit? } for SVG chart rendering
 *   metrics      - optional array of { label, value, unit } for metric cards
 */

export const METRICS_SECTIONS = [
  {
    id: "global-hazard",
    title: "The Global Hazard Landscape",
    narrative:
      "Disasters are not random — they follow geographic patterns dictated " +
      "by tectonics, climate, and topography. Floods alone account for 42% " +
      "of global average annual loss (AAL), followed by tropical cyclones " +
      "at 28% and earthquakes at 18%. Understanding where hazards " +
      "concentrate is the first step toward targeted investment.",
    views: ["MX-V07LO-829XA-4BIZ8", "MX-10AE5-746D1-76777"],
    camera: { center: { lng: 20, lat: 15 }, zoom: 2.5 },
    chart: {
      type: "horizontal-bar",
      title: "Average Annual Loss by Hazard Type",
      data: [
        { label: "Flood", value: 42, color: "#004f91" },
        { label: "Cyclone", value: 28, color: "#962987" },
        { label: "Earthquake", value: 18, color: "#eb752a" },
        { label: "Landslide", value: 12, color: "#00afae" },
      ],
      unit: "$ billions",
    },
  },
  {
    id: "population-at-risk",
    title: "Population at Risk",
    narrative:
      "Hazard is only half the equation. Risk emerges where hazards " +
      "intersect with people. Over 1.8 billion people live in areas with " +
      "significant flood exposure, concentrated in South and Southeast " +
      "Asia's river deltas and coastal lowlands. Exposure is growing as " +
      "urbanization pushes communities into hazard-prone areas.",
    views: ["MX-6YLMU-U4WXC-2JJD7", "MX-V07LO-829XA-4BIZ8"],
    camera: { center: { lng: 90, lat: 23 }, zoom: 5 },
    transparency: { "MX-V07LO-829XA-4BIZ8": 40 },
    metrics: [
      { label: "People Exposed to Floods", value: "1.81B", unit: "" },
      { label: "Countries >10% Pop. at Risk", value: "40+", unit: "" },
      { label: "Assets in Flood Zones", value: "$4.2T", unit: "" },
    ],
  },
  {
    id: "counting-the-cost",
    title: "Counting the Cost",
    narrative:
      "For Small Island Developing States and least developed countries, " +
      "disaster losses can exceed 5% of GDP annually — enough to erase " +
      "years of development gains. The Caribbean alone faces $3.2 billion " +
      "in average annual losses from cyclones and flooding, yet less than " +
      "30% of losses are insured.",
    views: ["MX-6YLMU-U4WXC-2JJD7", "MX-10AE5-746D1-76777"],
    camera: { center: { lng: -72, lat: 18 }, zoom: 4.5 },
    transparency: { "MX-10AE5-746D1-76777": 40 },
    chart: {
      type: "stacked-bar",
      title: "Disaster Losses: Insured vs. Uninsured (% GDP)",
      data: [
        {
          label: "Haiti",
          segments: [
            { label: "Uninsured", value: 4.9, color: "#c10920" },
            { label: "Insured", value: 0.3, color: "#00afae" },
          ],
        },
        {
          label: "Fiji",
          segments: [
            { label: "Uninsured", value: 3.7, color: "#c10920" },
            { label: "Insured", value: 1.1, color: "#00afae" },
          ],
        },
        {
          label: "Mozambique",
          segments: [
            { label: "Uninsured", value: 3.8, color: "#c10920" },
            { label: "Insured", value: 0.3, color: "#00afae" },
          ],
        },
        {
          label: "Bangladesh",
          segments: [
            { label: "Uninsured", value: 3.5, color: "#c10920" },
            { label: "Insured", value: 0.3, color: "#00afae" },
          ],
        },
        {
          label: "Nepal",
          segments: [
            { label: "Uninsured", value: 2.8, color: "#c10920" },
            { label: "Insured", value: 0.3, color: "#00afae" },
          ],
        },
        {
          label: "Madagascar",
          segments: [
            { label: "Uninsured", value: 3.4, color: "#c10920" },
            { label: "Insured", value: 0.1, color: "#00afae" },
          ],
        },
      ],
    },
  },
  {
    id: "natures-shield",
    title: "Nature's Shield",
    narrative:
      "Ecosystem-based approaches offer cost-effective risk reduction. " +
      "Intact forests reduce downstream flood peaks by up to 20%. Coastal " +
      "mangroves attenuate cyclone storm surge, protecting an estimated " +
      "$65 billion in property annually. Every $1 invested in nature-based " +
      "solutions yields $4–7 in avoided losses.",
    views: ["MX-DC56E-6ABC9-3C768", "MX-559C5-58858-96A69"],
    camera: { center: { lng: 100, lat: 10 }, zoom: 4.5 },
    transparency: { "MX-559C5-58858-96A69": 30 },
    chart: {
      type: "horizontal-bar",
      title: "Return on Investment: Nature-Based Solutions",
      data: [
        { label: "Mangrove Restoration", value: 7.1, color: "#00afae" },
        { label: "Forest Protection", value: 5.8, color: "#004f91" },
        { label: "Wetland Conservation", value: 4.2, color: "#962987" },
        { label: "Coral Reef Restoration", value: 3.6, color: "#eb752a" },
      ],
      unit: "$ return per $1 invested",
    },
  },
  {
    id: "climate-outlook",
    title: "Climate Outlook",
    narrative:
      "Climate change is a risk multiplier. Under RCP 8.5, water stress " +
      "is projected to intensify across the Middle East, North Africa, and " +
      "Central Asia by 2030. Cyclone intensity is increasing. Sea level " +
      "rise amplifies coastal flood and storm surge exposure for hundreds " +
      "of millions. Adaptation investment now is cheaper than recovery later.",
    views: ["MX-1L2TA-6FXPV-N3QMX"],
    camera: { center: { lng: 40, lat: 30 }, zoom: 3 },
    chart: {
      type: "trend-line",
      title: "Projected Water Stress Index (Global Average)",
      data: [
        { year: 2000, value: 32 },
        { year: 2005, value: 34 },
        { year: 2010, value: 37 },
        { year: 2015, value: 40 },
        { year: 2020, value: 44 },
        { year: 2025, value: 49 },
        { year: 2030, value: 55 },
        { year: 2040, value: 64 },
        { year: 2050, value: 72 },
      ],
      unit: "Stress Index (0–100)",
    },
  },
];
