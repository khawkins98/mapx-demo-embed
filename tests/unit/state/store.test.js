import { describe, it, expect, beforeEach } from "vitest";
import {
  openViews,
  customGeoJSONRegistry,
  registerGeoJSON,
  unregisterGeoJSON,
  geojsonViewId,
  setGeojsonViewId,
  markersAdded,
  setMarkersAdded,
  lastSpatialQueryResults,
  setLastSpatialQueryResults,
} from "../../../src/state/store.js";

describe("store", () => {
  beforeEach(() => {
    openViews.clear();
    customGeoJSONRegistry.length = 0;
  });

  describe("openViews", () => {
    it("is a Set", () => {
      expect(openViews).toBeInstanceOf(Set);
    });

    it("supports add/delete/has", () => {
      openViews.add("view-1");
      expect(openViews.has("view-1")).toBe(true);
      openViews.delete("view-1");
      expect(openViews.has("view-1")).toBe(false);
    });
  });

  describe("registerGeoJSON / unregisterGeoJSON", () => {
    const testGeoJSON = { type: "FeatureCollection", features: [] };

    it("registers a GeoJSON dataset", () => {
      registerGeoJSON("test-id", testGeoJSON);
      expect(customGeoJSONRegistry).toHaveLength(1);
      expect(customGeoJSONRegistry[0]).toEqual({
        id: "test-id",
        geojson: testGeoJSON,
      });
    });

    it("unregisters by id", () => {
      registerGeoJSON("a", testGeoJSON);
      registerGeoJSON("b", testGeoJSON);
      unregisterGeoJSON("a");
      expect(customGeoJSONRegistry).toHaveLength(1);
      expect(customGeoJSONRegistry[0].id).toBe("b");
    });

    it("does nothing when unregistering non-existent id", () => {
      registerGeoJSON("a", testGeoJSON);
      unregisterGeoJSON("nope");
      expect(customGeoJSONRegistry).toHaveLength(1);
    });
  });

  describe("setter functions", () => {
    it("setGeojsonViewId updates the export", async () => {
      const store = await import("../../../src/state/store.js");
      store.setGeojsonViewId("test-view");
      expect(store.geojsonViewId).toBe("test-view");
      store.setGeojsonViewId(null);
      expect(store.geojsonViewId).toBeNull();
    });

    it("setMarkersAdded updates the export", async () => {
      const store = await import("../../../src/state/store.js");
      store.setMarkersAdded(true);
      expect(store.markersAdded).toBe(true);
      store.setMarkersAdded(false);
      expect(store.markersAdded).toBe(false);
    });

    it("setLastSpatialQueryResults sets and clears the value", async () => {
      const store = await import("../../../src/state/store.js");
      const results = [{ id: 1 }, { id: 2 }];
      store.setLastSpatialQueryResults(results);
      expect(store.lastSpatialQueryResults).toBe(results);
      store.setLastSpatialQueryResults(null);
      expect(store.lastSpatialQueryResults).toBeNull();
    });
  });

  describe("registerGeoJSON with label and paint", () => {
    const testGeoJSON = { type: "FeatureCollection", features: [] };

    it("stores label when provided", () => {
      registerGeoJSON("labeled", testGeoJSON, "My Label");
      expect(customGeoJSONRegistry).toHaveLength(1);
      expect(customGeoJSONRegistry[0].label).toBe("My Label");
    });

    it("stores paint when provided", () => {
      const paint = { "circle-color": "#ff0000" };
      registerGeoJSON("painted", testGeoJSON, undefined, paint);
      expect(customGeoJSONRegistry).toHaveLength(1);
      expect(customGeoJSONRegistry[0].paint).toEqual(paint);
    });

    it("stores both label and paint when provided", () => {
      const paint = { "fill-opacity": 0.5 };
      registerGeoJSON("full", testGeoJSON, "Full Entry", paint);
      expect(customGeoJSONRegistry).toHaveLength(1);
      expect(customGeoJSONRegistry[0]).toEqual({
        id: "full",
        geojson: testGeoJSON,
        label: "Full Entry",
        paint,
      });
    });

    it("works without label and paint (backward compatible)", () => {
      registerGeoJSON("compat", testGeoJSON);
      expect(customGeoJSONRegistry).toHaveLength(1);
      expect(customGeoJSONRegistry[0]).toEqual({
        id: "compat",
        geojson: testGeoJSON,
        label: undefined,
        paint: undefined,
      });
    });
  });
});
