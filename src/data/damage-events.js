/**
 * Fictional damage event dataset — ~25 points across Caribbean/Central America.
 *
 * Used by the Explorer demo to exercise analysis tools:
 * numeric filter (damage_usd), spatial query, statistics, export.
 *
 * ## GeoJSON schema
 *
 * Each Feature is a `Point` with the following properties:
 *
 * | Property          | Type   | Description                                       |
 * |-------------------|--------|---------------------------------------------------|
 * | name              | string | Short event name (e.g. "Port-au-Prince Flood 2024") |
 * | event_type        | string | Category: "Flood", "Cyclone", "Earthquake", "Landslide" |
 * | severity          | string | "Critical", "High", "Medium", or "Low"            |
 * | damage_usd        | number | Estimated damage in US dollars                     |
 * | affected_people   | number | Number of people affected                          |
 * | country           | string | Country or territory name                          |
 * | date              | string | ISO 8601 date (YYYY-MM-DD) of the event            |
 */

export const damageEventsGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-72.34, 18.54] },
      properties: {
        name: "Port-au-Prince Flood 2024",
        event_type: "Flood",
        severity: "Critical",
        damage_usd: 12500000,
        affected_people: 85000,
        country: "Haiti",
        date: "2024-06-15",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-76.80, 18.01] },
      properties: {
        name: "Kingston Cyclone Impact",
        event_type: "Cyclone",
        severity: "High",
        damage_usd: 8700000,
        affected_people: 42000,
        country: "Jamaica",
        date: "2024-08-22",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-66.11, 18.47] },
      properties: {
        name: "San Juan Coastal Surge",
        event_type: "Cyclone",
        severity: "High",
        damage_usd: 6300000,
        affected_people: 31000,
        country: "Puerto Rico",
        date: "2024-09-03",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-69.94, 18.48] },
      properties: {
        name: "Santo Domingo Flash Flood",
        event_type: "Flood",
        severity: "Medium",
        damage_usd: 3200000,
        affected_people: 18000,
        country: "Dominican Republic",
        date: "2024-05-11",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-61.52, 16.24] },
      properties: {
        name: "Guadeloupe Landslide",
        event_type: "Landslide",
        severity: "Medium",
        damage_usd: 1800000,
        affected_people: 4500,
        country: "Guadeloupe",
        date: "2024-07-28",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-61.00, 14.64] },
      properties: {
        name: "Martinique Storm Damage",
        event_type: "Cyclone",
        severity: "Medium",
        damage_usd: 2400000,
        affected_people: 9200,
        country: "Martinique",
        date: "2024-08-15",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-61.79, 17.12] },
      properties: {
        name: "Antigua Coastal Erosion",
        event_type: "Cyclone",
        severity: "Low",
        damage_usd: 750000,
        affected_people: 2100,
        country: "Antigua and Barbuda",
        date: "2024-09-18",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-59.61, 13.10] },
      properties: {
        name: "Barbados Flooding",
        event_type: "Flood",
        severity: "Medium",
        damage_usd: 1500000,
        affected_people: 7800,
        country: "Barbados",
        date: "2024-10-05",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-61.25, 13.16] },
      properties: {
        name: "St. Vincent Landslide",
        event_type: "Landslide",
        severity: "High",
        damage_usd: 4100000,
        affected_people: 11000,
        country: "St. Vincent",
        date: "2024-04-20",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-61.02, 14.02] },
      properties: {
        name: "St. Lucia Earthquake",
        event_type: "Earthquake",
        severity: "Low",
        damage_usd: 920000,
        affected_people: 3400,
        country: "St. Lucia",
        date: "2024-03-12",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-64.62, 18.43] },
      properties: {
        name: "USVI Storm Surge",
        event_type: "Cyclone",
        severity: "High",
        damage_usd: 5600000,
        affected_people: 15000,
        country: "US Virgin Islands",
        date: "2024-08-30",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-79.52, 9.00] },
      properties: {
        name: "Panama City Flood",
        event_type: "Flood",
        severity: "Medium",
        damage_usd: 2800000,
        affected_people: 22000,
        country: "Panama",
        date: "2024-11-02",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-83.99, 9.93] },
      properties: {
        name: "San Jose Earthquake",
        event_type: "Earthquake",
        severity: "Medium",
        damage_usd: 3500000,
        affected_people: 16000,
        country: "Costa Rica",
        date: "2024-02-18",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.22, 14.07] },
      properties: {
        name: "Tegucigalpa Landslide",
        event_type: "Landslide",
        severity: "Critical",
        damage_usd: 7200000,
        affected_people: 28000,
        country: "Honduras",
        date: "2024-06-30",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-89.19, 13.69] },
      properties: {
        name: "San Salvador Earthquake",
        event_type: "Earthquake",
        severity: "High",
        damage_usd: 9100000,
        affected_people: 52000,
        country: "El Salvador",
        date: "2024-01-25",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-90.53, 14.63] },
      properties: {
        name: "Guatemala City Flood",
        event_type: "Flood",
        severity: "High",
        damage_usd: 6800000,
        affected_people: 38000,
        country: "Guatemala",
        date: "2024-07-14",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-86.25, 12.14] },
      properties: {
        name: "Managua Storm Damage",
        event_type: "Cyclone",
        severity: "Medium",
        damage_usd: 2100000,
        affected_people: 14000,
        country: "Nicaragua",
        date: "2024-10-22",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-88.90, 17.50] },
      properties: {
        name: "Belize Coastal Flood",
        event_type: "Flood",
        severity: "Low",
        damage_usd: 480000,
        affected_people: 1800,
        country: "Belize",
        date: "2024-09-08",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-75.51, 10.39] },
      properties: {
        name: "Cartagena Flood",
        event_type: "Flood",
        severity: "Medium",
        damage_usd: 3900000,
        affected_people: 25000,
        country: "Colombia",
        date: "2024-04-03",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-66.90, 10.50] },
      properties: {
        name: "Caracas Landslide",
        event_type: "Landslide",
        severity: "Critical",
        damage_usd: 11000000,
        affected_people: 62000,
        country: "Venezuela",
        date: "2024-08-07",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-58.16, 6.80] },
      properties: {
        name: "Georgetown Coastal Flood",
        event_type: "Flood",
        severity: "Medium",
        damage_usd: 1900000,
        affected_people: 9500,
        country: "Guyana",
        date: "2024-12-01",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-55.17, 5.82] },
      properties: {
        name: "Paramaribo Storm",
        event_type: "Cyclone",
        severity: "Low",
        damage_usd: 650000,
        affected_people: 3200,
        country: "Suriname",
        date: "2024-11-15",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-61.51, 10.65] },
      properties: {
        name: "Trinidad Earthquake",
        event_type: "Earthquake",
        severity: "Medium",
        damage_usd: 2700000,
        affected_people: 12000,
        country: "Trinidad and Tobago",
        date: "2024-05-29",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-68.97, 12.19] },
      properties: {
        name: "Curacao Storm Surge",
        event_type: "Cyclone",
        severity: "Low",
        damage_usd: 890000,
        affected_people: 4200,
        country: "Curacao",
        date: "2024-07-03",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-77.30, 25.06] },
      properties: {
        name: "Nassau Cyclone Damage",
        event_type: "Cyclone",
        severity: "High",
        damage_usd: 7500000,
        affected_people: 35000,
        country: "Bahamas",
        date: "2024-09-25",
      },
    },
  ],
};
