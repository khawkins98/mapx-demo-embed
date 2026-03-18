export const fieldOfficesGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [90.41, 23.81] },
      properties: { name: "Dhaka Field Office", role: "Flood response coordination", staff: 12, status: "Active" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [72.88, 19.08] },
      properties: { name: "Mumbai Field Office", role: "Cyclone early warning", staff: 8, status: "Active" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [106.85, -6.21] },
      properties: { name: "Jakarta Field Office", role: "Tsunami preparedness", staff: 15, status: "Active" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-72.34, 18.54] },
      properties: { name: "Port-au-Prince Office", role: "Earthquake recovery", staff: 6, status: "Active" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [36.82, -1.29] },
      properties: { name: "Nairobi Regional Hub", role: "Drought monitoring", staff: 20, status: "Active" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [100.52, 13.76] },
      properties: { name: "Bangkok Regional Hub", role: "Regional coordination", staff: 18, status: "Active" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-79.52, 8.98] },
      properties: { name: "Panama City Office", role: "Central America liaison", staff: 5, status: "Standby" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [178.44, -18.14] },
      properties: { name: "Suva Pacific Office", role: "Pacific islands support", staff: 4, status: "Active" },
    },
  ],
};
