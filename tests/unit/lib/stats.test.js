import { describe, it, expect } from "vitest";
import { computeLocalStats } from "../../../src/lib/stats.js";

describe("computeLocalStats", () => {
  it("computes numeric stats", () => {
    const geojson = {
      features: [
        { properties: { value: 10 } },
        { properties: { value: 20 } },
        { properties: { value: 30 } },
      ],
    };
    const result = computeLocalStats(geojson);
    expect(result.count).toBe(3);
    expect(result.attributes.value.type).toBe("numeric");
    expect(result.attributes.value.min).toBe(10);
    expect(result.attributes.value.max).toBe(30);
    expect(result.attributes.value.mean).toBe(20);
  });

  it("computes categorical stats", () => {
    const geojson = {
      features: [
        { properties: { status: "Active" } },
        { properties: { status: "Active" } },
        { properties: { status: "Standby" } },
      ],
    };
    const result = computeLocalStats(geojson);
    expect(result.attributes.status.type).toBe("text");
    expect(result.attributes.status.categories).toEqual({
      Active: 2,
      Standby: 1,
    });
  });

  it("handles mixed numeric and text attributes", () => {
    const geojson = {
      features: [
        { properties: { name: "A", staff: 10 } },
        { properties: { name: "B", staff: 20 } },
      ],
    };
    const result = computeLocalStats(geojson);
    expect(result.attributes.name.type).toBe("text");
    expect(result.attributes.staff.type).toBe("numeric");
  });

  it("handles empty features array", () => {
    const result = computeLocalStats({ features: [] });
    expect(result.count).toBe(0);
    expect(result.attributes).toEqual({});
  });

  it("handles missing features", () => {
    const result = computeLocalStats({});
    expect(result.count).toBe(0);
  });

  it("skips null and empty values", () => {
    const geojson = {
      features: [
        { properties: { val: 10 } },
        { properties: { val: null } },
        { properties: { val: "" } },
        { properties: { val: 20 } },
      ],
    };
    const result = computeLocalStats(geojson);
    expect(result.attributes.val.count).toBe(2);
    expect(result.attributes.val.min).toBe(10);
    expect(result.attributes.val.max).toBe(20);
  });
});
