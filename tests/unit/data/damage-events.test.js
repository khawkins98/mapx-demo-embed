import { describe, it, expect } from "vitest";
import { damageEventsGeoJSON } from "../../../src/data/damage-events.js";

describe("damageEventsGeoJSON", () => {
  /* ── GeoJSON structure ────────────────────────────────────────────── */

  it("is a valid GeoJSON FeatureCollection", () => {
    expect(damageEventsGeoJSON).toHaveProperty("type", "FeatureCollection");
    expect(damageEventsGeoJSON).toHaveProperty("features");
    expect(Array.isArray(damageEventsGeoJSON.features)).toBe(true);
  });

  it("has exactly 25 features", () => {
    expect(damageEventsGeoJSON.features).toHaveLength(25);
  });

  /* ── Feature shape ────────────────────────────────────────────────── */

  it("every feature has type, geometry, and properties", () => {
    damageEventsGeoJSON.features.forEach((f) => {
      expect(f).toHaveProperty("type", "Feature");
      expect(f).toHaveProperty("geometry");
      expect(f).toHaveProperty("properties");
    });
  });

  it("every geometry is a Point with [lng, lat] coordinates", () => {
    damageEventsGeoJSON.features.forEach((f) => {
      expect(f.geometry).toHaveProperty("type", "Point");
      expect(Array.isArray(f.geometry.coordinates)).toBe(true);
      expect(f.geometry.coordinates).toHaveLength(2);
    });
  });

  it("coordinates are in valid ranges (lng -180..180, lat -90..90)", () => {
    damageEventsGeoJSON.features.forEach((f) => {
      const [lng, lat] = f.geometry.coordinates;
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
    });
  });

  /* ── Required properties ──────────────────────────────────────────── */

  const REQUIRED_PROPS = [
    "name",
    "event_type",
    "severity",
    "damage_usd",
    "affected_people",
    "country",
    "date",
  ];

  it("every feature has required properties", () => {
    damageEventsGeoJSON.features.forEach((f) => {
      REQUIRED_PROPS.forEach((key) => {
        expect(f.properties).toHaveProperty(key);
      });
    });
  });

  /* ── Value constraints ────────────────────────────────────────────── */

  it("damage_usd is always a positive number", () => {
    damageEventsGeoJSON.features.forEach((f) => {
      expect(typeof f.properties.damage_usd).toBe("number");
      expect(f.properties.damage_usd).toBeGreaterThan(0);
    });
  });

  it("affected_people is always a positive number", () => {
    damageEventsGeoJSON.features.forEach((f) => {
      expect(typeof f.properties.affected_people).toBe("number");
      expect(f.properties.affected_people).toBeGreaterThan(0);
    });
  });

  it("severity is one of Critical, High, Medium, Low", () => {
    const validSeverities = ["Critical", "High", "Medium", "Low"];
    damageEventsGeoJSON.features.forEach((f) => {
      expect(validSeverities).toContain(f.properties.severity);
    });
  });

  it("event_type is one of Flood, Cyclone, Earthquake, Landslide", () => {
    const validTypes = ["Flood", "Cyclone", "Earthquake", "Landslide"];
    damageEventsGeoJSON.features.forEach((f) => {
      expect(validTypes).toContain(f.properties.event_type);
    });
  });

  it("date matches YYYY-MM-DD format", () => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    damageEventsGeoJSON.features.forEach((f) => {
      expect(f.properties.date).toMatch(datePattern);
    });
  });

  it("all feature names are unique", () => {
    const names = damageEventsGeoJSON.features.map((f) => f.properties.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
