/**
 * Curated view IDs from the Eco-DRR project (MX-2LD-FBB-58N-ROK-8RH)
 * and the MapX HOME project. Discovered using probe-views.html.
 *
 * MapX view types:
 *   cc = Custom Coded (dynamic/real-time)
 *   rt = Raster Tiles (gridded data)
 *   vt = Vector Tiles (polygons/points/lines)
 *   sm = Story Map (narrative presentations)
 */
export const CURATED_VIEWS = [
  { id: "MX-YLZJG-JAIID-V27X5", label: "Earthquakes Mag >= 5.5 (live)", type: "cc" },
  { id: "MX-V07LO-829XA-4BIZ8", label: "Flood Hazard 25yr", type: "rt" },
  { id: "MX-04E66-2E550-81068", label: "Landslide Exposure", type: "rt" },
  { id: "MX-10AE5-746D1-76777", label: "Tropical Cyclone Exposure", type: "rt" },
  { id: "MX-F0DEE-12D97-6447B", label: "Tsunami Exposure", type: "rt" },
  { id: "MX-6YLMU-U4WXC-2JJD7", label: "Population (HRSL 2022)", type: "rt" },
  { id: "MX-DC56E-6ABC9-3C768", label: "Forest Protection — Flood Risk", type: "rt" },
  { id: "MX-559C5-58858-96A69", label: "Mangrove Restoration — Cyclone Surge", type: "rt" },
  { id: "MX-1L2TA-6FXPV-N3QMX", label: "Water Stress Change (RCP8.5 2030)", type: "vt" },
  { id: "MX-OU7NG-ZNZGA-ZX3K0", label: "Active Fires (Admin Level 1)", type: "vt" },
  { id: "MX-FX1HT-Z7KXL-8X22K", label: "Intact Forest Landscapes", type: "vt" },
];

export const TYPE_LABELS = { cc: "live", rt: "raster", vt: "vector", sm: "story" };

export const TYPE_TAG_CLASS = {
  cc: "",
  rt: "mg-tag--accent",
  vt: "mg-tag--secondary",
  sm: "",
};
