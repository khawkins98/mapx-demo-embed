import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { showInfobox } from "../../../src/ui/infobox.js";
import { customGeoJSONRegistry, registerGeoJSON } from "../../../src/state/store.js";

beforeEach(() => {
  vi.useFakeTimers();
  customGeoJSONRegistry.length = 0;
  document.body.innerHTML = '<div id="infobox"><h2 id="infobox-title"></h2><div id="infobox-body"></div><button id="infobox-close">Close</button></div>';
});
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

describe("MapX click_features", () => {
  it("reads attributes grouped by view, skipping empty results and escaping values", () => {
    showInfobox({ attributes: { empty: [], flood: [{ name: "Flood site", note: "<script>bad()</script>" }], other: [{ name: "Other" }] } });
    expect(document.querySelector("#infobox-title").textContent).toBe("Flood site");
    expect(document.querySelector("#infobox-body").textContent).toContain("<script>bad()</script>");
    expect(document.querySelector("#infobox-body script")).toBeNull();
    expect(document.querySelector("#demo-toast [role=status]")).not.toBeNull();
  });
  it("accepts an object result per view", () => {
    showInfobox({ attributes: { raster: { name: "Raster", value: 7 } } });
    expect(document.querySelector("#infobox-title").textContent).toBe("Raster");
  });
  it("hides the previous result when a click hits nothing", () => {
    showInfobox({ attributes: { site: [{ name: "Site" }] } });
    showInfobox({ attributes: {} });
    expect(document.querySelector("#infobox").style.display).toBe("none");
  });
  it("falls back to local passthrough features for an empty hit", () => {
    registerGeoJSON("local", { type: "FeatureCollection", features: [{ type: "Feature", geometry: { type: "Point", coordinates: [1, 2] }, properties: { name: "Station" } }] });
    showInfobox({ attributes: {}, lngLat: { lng: 1, lat: 2 } });
    expect(document.querySelector("#infobox-title").textContent).toBe("Station");
  });
});
