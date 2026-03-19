import { describe, it, expect } from "vitest";
import { pointInPolygon, findNearestFeature } from "../../../src/lib/geo.js";

describe("pointInPolygon", () => {
  const square = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];

  it("returns true for a point inside", () => {
    expect(pointInPolygon(5, 5, square)).toBe(true);
  });

  it("returns false for a point outside", () => {
    expect(pointInPolygon(15, 5, square)).toBe(false);
    expect(pointInPolygon(-1, 5, square)).toBe(false);
  });

  it("returns false for a point well outside", () => {
    expect(pointInPolygon(100, 100, square)).toBe(false);
  });

  it("handles concave polygon", () => {
    /* L-shaped polygon */
    const lShape = [
      [0, 0], [10, 0], [10, 5], [5, 5], [5, 10], [0, 10], [0, 0],
    ];
    expect(pointInPolygon(2, 2, lShape)).toBe(true);   // bottom-left
    expect(pointInPolygon(8, 2, lShape)).toBe(true);   // bottom-right
    expect(pointInPolygon(2, 8, lShape)).toBe(true);   // top-left
    expect(pointInPolygon(8, 8, lShape)).toBe(false);  // top-right (outside the L)
  });

  it("handles degenerate case (single point ring)", () => {
    expect(pointInPolygon(0, 0, [[0, 0], [0, 0]])).toBe(false);
  });
});

describe("findNearestFeature", () => {
  const pointRegistry = [
    {
      id: "test-points",
      geojson: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [10, 20] },
            properties: { name: "Point A" },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [30, 40] },
            properties: { name: "Point B" },
          },
        ],
      },
    },
  ];

  const polygonRegistry = [
    {
      id: "test-polygons",
      geojson: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [[[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]]],
            },
            properties: { name: "Zone A" },
          },
        ],
      },
    },
  ];

  it("returns nearest point within tolerance", () => {
    const result = findNearestFeature(10.1, 20.1, pointRegistry);
    expect(result).toEqual({ name: "Point A" });
  });

  it("returns null when no point within tolerance", () => {
    const result = findNearestFeature(100, 100, pointRegistry);
    expect(result).toBeNull();
  });

  it("returns polygon when point is inside", () => {
    const result = findNearestFeature(10, 10, polygonRegistry);
    expect(result).toEqual({ name: "Zone A" });
  });

  it("returns null when outside polygon", () => {
    const result = findNearestFeature(25, 25, polygonRegistry);
    expect(result).toBeNull();
  });

  it("prioritises polygon over nearby point", () => {
    const mixedRegistry = [...polygonRegistry, ...pointRegistry];
    const result = findNearestFeature(10, 10, mixedRegistry);
    expect(result).toEqual({ name: "Zone A" });
  });

  it("returns null for empty registry", () => {
    expect(findNearestFeature(10, 10, [])).toBeNull();
  });

  it("handles MultiPolygon", () => {
    const multiPolyRegistry = [
      {
        id: "test-multi",
        geojson: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "MultiPolygon",
                coordinates: [
                  [[[0, 0], [5, 0], [5, 5], [0, 5], [0, 0]]],
                  [[[10, 10], [15, 10], [15, 15], [10, 15], [10, 10]]],
                ],
              },
              properties: { name: "Multi Zone" },
            },
          ],
        },
      },
    ];

    expect(findNearestFeature(2, 2, multiPolyRegistry)).toEqual({ name: "Multi Zone" });
    expect(findNearestFeature(12, 12, multiPolyRegistry)).toEqual({ name: "Multi Zone" });
    expect(findNearestFeature(7, 7, multiPolyRegistry)).toBeNull();
  });
});
