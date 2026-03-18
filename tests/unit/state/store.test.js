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
  });
});
