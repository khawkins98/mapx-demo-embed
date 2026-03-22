/**
 * Synthetic country risk profiles for the Metrics Hub demo.
 *
 * Each profile uses real ISO 3166-1 alpha-3 codes compatible with the
 * MapX SDK's commonLocFitBbox() resolver. Numeric values are synthetic
 * but calibrated to approximate published figures from GAR, EM-DAT,
 * and World Bank sources.
 *
 * Schema:
 *   code             - ISO 3166-1 alpha-3 (used by commonLocFitBbox)
 *   name             - Country display name
 *   riskScore        - Composite 0–100 risk index
 *   aal              - { pctGdp, usdMillions } Average Annual Loss
 *   gdpAtRisk        - % of GDP at risk from multi-hazard exposure
 *   popExposed       - Millions of people in hazard-prone areas
 *   primaryHazard    - Dominant hazard type (for map layer selection)
 *   hazardBreakdown  - { flood, cyclone, earthquake, landslide } in %
 *   sectorExposure   - { agriculture, housing, infrastructure, commercial } in %
 *   resilience       - { earlyWarning, insurance, ecosystem } scores 0–100
 *   primaryViewId    - MapX view ID for the dominant hazard layer
 */

export const COUNTRY_PROFILES = [
  {
    code: "NPL",
    name: "Nepal",
    riskScore: 78,
    aal: { pctGdp: 3.1, usdMillions: 1120 },
    gdpAtRisk: 8.4,
    popExposed: 12.5,
    primaryHazard: "Earthquake",
    hazardBreakdown: { flood: 30, cyclone: 0, earthquake: 45, landslide: 25 },
    sectorExposure: { agriculture: 38, housing: 28, infrastructure: 22, commercial: 12 },
    resilience: { earlyWarning: 42, insurance: 8, ecosystem: 61 },
    primaryViewId: "MX-04E66-2E550-81068",
  },
  {
    code: "PHL",
    name: "Philippines",
    riskScore: 82,
    aal: { pctGdp: 2.4, usdMillions: 9200 },
    gdpAtRisk: 7.1,
    popExposed: 48.3,
    primaryHazard: "Cyclone",
    hazardBreakdown: { flood: 25, cyclone: 45, earthquake: 20, landslide: 10 },
    sectorExposure: { agriculture: 32, housing: 30, infrastructure: 24, commercial: 14 },
    resilience: { earlyWarning: 68, insurance: 12, ecosystem: 45 },
    primaryViewId: "MX-10AE5-746D1-76777",
  },
  {
    code: "BGD",
    name: "Bangladesh",
    riskScore: 85,
    aal: { pctGdp: 3.8, usdMillions: 14200 },
    gdpAtRisk: 9.2,
    popExposed: 89.6,
    primaryHazard: "Flood",
    hazardBreakdown: { flood: 55, cyclone: 30, earthquake: 5, landslide: 10 },
    sectorExposure: { agriculture: 42, housing: 25, infrastructure: 20, commercial: 13 },
    resilience: { earlyWarning: 72, insurance: 6, ecosystem: 38 },
    primaryViewId: "MX-V07LO-829XA-4BIZ8",
  },
  {
    code: "HTI",
    name: "Haiti",
    riskScore: 88,
    aal: { pctGdp: 5.2, usdMillions: 920 },
    gdpAtRisk: 12.1,
    popExposed: 6.8,
    primaryHazard: "Earthquake",
    hazardBreakdown: { flood: 30, cyclone: 35, earthquake: 30, landslide: 5 },
    sectorExposure: { agriculture: 35, housing: 32, infrastructure: 18, commercial: 15 },
    resilience: { earlyWarning: 22, insurance: 3, ecosystem: 18 },
    primaryViewId: "MX-10AE5-746D1-76777",
  },
  {
    code: "MOZ",
    name: "Mozambique",
    riskScore: 76,
    aal: { pctGdp: 4.1, usdMillions: 680 },
    gdpAtRisk: 10.3,
    popExposed: 14.2,
    primaryHazard: "Cyclone",
    hazardBreakdown: { flood: 35, cyclone: 45, earthquake: 5, landslide: 15 },
    sectorExposure: { agriculture: 45, housing: 24, infrastructure: 19, commercial: 12 },
    resilience: { earlyWarning: 35, insurance: 4, ecosystem: 52 },
    primaryViewId: "MX-10AE5-746D1-76777",
  },
  {
    code: "IDN",
    name: "Indonesia",
    riskScore: 74,
    aal: { pctGdp: 1.2, usdMillions: 15400 },
    gdpAtRisk: 5.8,
    popExposed: 76.5,
    primaryHazard: "Earthquake",
    hazardBreakdown: { flood: 25, cyclone: 5, earthquake: 40, landslide: 30 },
    sectorExposure: { agriculture: 28, housing: 30, infrastructure: 26, commercial: 16 },
    resilience: { earlyWarning: 62, insurance: 15, ecosystem: 58 },
    primaryViewId: "MX-F0DEE-12D97-6447B",
  },
  {
    code: "IND",
    name: "India",
    riskScore: 68,
    aal: { pctGdp: 1.8, usdMillions: 62000 },
    gdpAtRisk: 4.5,
    popExposed: 280.0,
    primaryHazard: "Flood",
    hazardBreakdown: { flood: 45, cyclone: 25, earthquake: 20, landslide: 10 },
    sectorExposure: { agriculture: 35, housing: 28, infrastructure: 22, commercial: 15 },
    resilience: { earlyWarning: 71, insurance: 18, ecosystem: 42 },
    primaryViewId: "MX-V07LO-829XA-4BIZ8",
  },
  {
    code: "PAK",
    name: "Pakistan",
    riskScore: 80,
    aal: { pctGdp: 2.9, usdMillions: 9800 },
    gdpAtRisk: 7.8,
    popExposed: 72.0,
    primaryHazard: "Flood",
    hazardBreakdown: { flood: 50, cyclone: 10, earthquake: 30, landslide: 10 },
    sectorExposure: { agriculture: 40, housing: 26, infrastructure: 21, commercial: 13 },
    resilience: { earlyWarning: 48, insurance: 7, ecosystem: 30 },
    primaryViewId: "MX-V07LO-829XA-4BIZ8",
  },
  {
    code: "FJI",
    name: "Fiji",
    riskScore: 72,
    aal: { pctGdp: 4.8, usdMillions: 260 },
    gdpAtRisk: 11.5,
    popExposed: 0.5,
    primaryHazard: "Cyclone",
    hazardBreakdown: { flood: 25, cyclone: 60, earthquake: 5, landslide: 10 },
    sectorExposure: { agriculture: 30, housing: 32, infrastructure: 24, commercial: 14 },
    resilience: { earlyWarning: 58, insurance: 22, ecosystem: 65 },
    primaryViewId: "MX-10AE5-746D1-76777",
  },
  {
    code: "MDG",
    name: "Madagascar",
    riskScore: 75,
    aal: { pctGdp: 3.5, usdMillions: 520 },
    gdpAtRisk: 8.9,
    popExposed: 11.8,
    primaryHazard: "Cyclone",
    hazardBreakdown: { flood: 30, cyclone: 50, earthquake: 5, landslide: 15 },
    sectorExposure: { agriculture: 48, housing: 22, infrastructure: 18, commercial: 12 },
    resilience: { earlyWarning: 28, insurance: 2, ecosystem: 40 },
    primaryViewId: "MX-10AE5-746D1-76777",
  },
];
