export const monitoringStationsGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [30.52, 50.45] },
      properties: { name: "Kyiv Station", type: "Air Quality", reading: "AQI 42 — Good", installed: "2019" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [32.06, 49.44] },
      properties: { name: "Cherkasy Station", type: "Water Level", reading: "2.4m — Normal", installed: "2020" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [35.05, 48.46] },
      properties: { name: "Dnipro Station", type: "Seismic", reading: "0.2 mag — Quiet", installed: "2018" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [24.03, 49.84] },
      properties: { name: "Lviv Station", type: "Air Quality", reading: "AQI 31 — Good", installed: "2021" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [36.23, 49.99] },
      properties: { name: "Kharkiv Station", type: "Water Level", reading: "3.1m — Elevated", installed: "2017" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [30.73, 46.48] },
      properties: { name: "Odesa Station", type: "Coastal", reading: "Wave 1.2m — Calm", installed: "2020" },
    },
  ],
};
