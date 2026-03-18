export const projectZonesGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [88.0, 21.0], [92.5, 21.0], [92.5, 26.5],
          [88.0, 26.5], [88.0, 21.0],
        ]],
      },
      properties: {
        name: "Bangladesh Flood Resilience Zone",
        programme: "Eco-DRR Pilot",
        hazard: "River flooding",
        status: "Active",
        budget: "$2.4M",
        partners: "UNEP, UNDP, Local Gov",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [95.0, 10.0], [107.0, 10.0], [107.0, 20.0],
          [95.0, 20.0], [95.0, 10.0],
        ]],
      },
      properties: {
        name: "Mekong Delta Coastal Zone",
        programme: "Mangrove Restoration",
        hazard: "Cyclone surge, sea level rise",
        status: "Planning",
        budget: "$5.1M",
        partners: "UNEP, FAO, IUCN",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [34.0, -4.0], [42.0, -4.0], [42.0, 5.0],
          [34.0, 5.0], [34.0, -4.0],
        ]],
      },
      properties: {
        name: "East Africa Drought Watch",
        programme: "Early Warning Systems",
        hazard: "Drought, water stress",
        status: "Active",
        budget: "$1.8M",
        partners: "WMO, IGAD, UNDRR",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-75.0, 16.0], [-60.0, 16.0], [-60.0, 22.0],
          [-75.0, 22.0], [-75.0, 16.0],
        ]],
      },
      properties: {
        name: "Caribbean Hurricane Corridor",
        programme: "Multi-Hazard EWS",
        hazard: "Tropical cyclone, storm surge",
        status: "Active",
        budget: "$3.7M",
        partners: "CDEMA, UNDRR, WMO",
      },
    },
  ],
};
