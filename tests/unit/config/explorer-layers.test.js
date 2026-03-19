import { describe, it, expect } from "vitest";
import {
  EXPLORER_HAZARD_LAYERS,
  SEVERITY_COLORS,
  DAMAGE_CIRCLE_PAINT,
  PRESET_QUERIES,
} from "../../../src/config/explorer-layers.js";

/* ── Hazard layers ──────────────────────────────────────────────────── */

describe("EXPLORER_HAZARD_LAYERS", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(EXPLORER_HAZARD_LAYERS)).toBe(true);
    expect(EXPLORER_HAZARD_LAYERS.length).toBeGreaterThan(0);
  });

  it("each layer has id and label fields", () => {
    EXPLORER_HAZARD_LAYERS.forEach((layer) => {
      expect(layer).toHaveProperty("id");
      expect(layer).toHaveProperty("label");
    });
  });

  it("layer IDs are strings matching MapX ID format", () => {
    const mapxIdPattern = /^MX-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
    EXPLORER_HAZARD_LAYERS.forEach((layer) => {
      expect(typeof layer.id).toBe("string");
      expect(layer.id).toMatch(mapxIdPattern);
    });
  });
});

/* ── Severity colours ───────────────────────────────────────────────── */

describe("SEVERITY_COLORS", () => {
  it("has entries for Critical, High, Medium, Low", () => {
    expect(SEVERITY_COLORS).toHaveProperty("Critical");
    expect(SEVERITY_COLORS).toHaveProperty("High");
    expect(SEVERITY_COLORS).toHaveProperty("Medium");
    expect(SEVERITY_COLORS).toHaveProperty("Low");
  });

  it("values are valid hex colour strings", () => {
    const hexPattern = /^#[0-9a-fA-F]{6}$/;
    Object.values(SEVERITY_COLORS).forEach((colour) => {
      expect(colour).toMatch(hexPattern);
    });
  });
});

/* ── Damage circle paint spec ───────────────────────────────────────── */

describe("DAMAGE_CIRCLE_PAINT", () => {
  it("has required keys", () => {
    expect(DAMAGE_CIRCLE_PAINT).toHaveProperty("circle-radius");
    expect(DAMAGE_CIRCLE_PAINT).toHaveProperty("circle-color");
    expect(DAMAGE_CIRCLE_PAINT).toHaveProperty("circle-stroke-width");
    expect(DAMAGE_CIRCLE_PAINT).toHaveProperty("circle-stroke-color");
    expect(DAMAGE_CIRCLE_PAINT).toHaveProperty("circle-opacity");
  });
});

/* ── Preset queries ─────────────────────────────────────────────────── */

describe("PRESET_QUERIES", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(PRESET_QUERIES)).toBe(true);
    expect(PRESET_QUERIES.length).toBeGreaterThan(0);
  });

  it("each preset has id, label, description, and filter (function)", () => {
    PRESET_QUERIES.forEach((q) => {
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("label");
      expect(q).toHaveProperty("description");
      expect(q).toHaveProperty("filter");
      expect(typeof q.id).toBe("string");
      expect(typeof q.label).toBe("string");
      expect(typeof q.description).toBe("string");
      expect(typeof q.filter).toBe("function");
    });
  });

  it("preset query IDs are unique", () => {
    const ids = PRESET_QUERIES.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  /* ── Filter behaviour against sample features ──────────────────── */

  describe("filter functions", () => {
    const makeFeature = (props) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [0, 0] },
      properties: {
        name: "Test Event",
        event_type: "Flood",
        severity: "Medium",
        damage_usd: 1000000,
        affected_people: 5000,
        country: "Testland",
        date: "2024-01-01",
        ...props,
      },
    });

    const findFilter = (id) => PRESET_QUERIES.find((q) => q.id === id).filter;

    it("high-damage filter returns true for damage_usd > 5000000", () => {
      const filter = findFilter("high-damage");
      expect(filter(makeFeature({ damage_usd: 6000000 }))).toBe(true);
      expect(filter(makeFeature({ damage_usd: 5000000 }))).toBe(false);
      expect(filter(makeFeature({ damage_usd: 3000000 }))).toBe(false);
    });

    it("critical-severity filter returns true for severity === 'Critical'", () => {
      const filter = findFilter("critical-severity");
      expect(filter(makeFeature({ severity: "Critical" }))).toBe(true);
      expect(filter(makeFeature({ severity: "High" }))).toBe(false);
      expect(filter(makeFeature({ severity: "Low" }))).toBe(false);
    });

    it("floods-only filter returns true for event_type === 'Flood'", () => {
      const filter = findFilter("floods-only");
      expect(filter(makeFeature({ event_type: "Flood" }))).toBe(true);
      expect(filter(makeFeature({ event_type: "Cyclone" }))).toBe(false);
      expect(filter(makeFeature({ event_type: "Earthquake" }))).toBe(false);
    });

    it("large-affected filter returns true for affected_people > 30000", () => {
      const filter = findFilter("large-affected");
      expect(filter(makeFeature({ affected_people: 50000 }))).toBe(true);
      expect(filter(makeFeature({ affected_people: 30000 }))).toBe(false);
      expect(filter(makeFeature({ affected_people: 10000 }))).toBe(false);
    });
  });
});
