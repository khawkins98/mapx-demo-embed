import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadGeoJSON } from "../../../src/lib/download.js";

describe("downloadGeoJSON", () => {
  let mockAnchor;
  let createObjectURLSpy;
  let revokeObjectURLSpy;

  beforeEach(() => {
    mockAnchor = { href: "", download: "", click: vi.fn() };
    vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => {});
    vi.spyOn(document.body, "removeChild").mockImplementation(() => {});

    createObjectURLSpy = vi.fn().mockReturnValue("blob:test-url");
    revokeObjectURLSpy = vi.fn();
    globalThis.URL.createObjectURL = createObjectURLSpy;
    globalThis.URL.revokeObjectURL = revokeObjectURLSpy;
  });

  it("creates a Blob with correct type", () => {
    const data = { type: "FeatureCollection", features: [] };
    downloadGeoJSON(data, "test.geojson");

    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    const blob = createObjectURLSpy.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/geo+json");
  });

  it("sets download filename", () => {
    downloadGeoJSON({ type: "FeatureCollection", features: [] }, "export.geojson");
    expect(mockAnchor.download).toBe("export.geojson");
  });

  it("triggers click and cleans up", () => {
    downloadGeoJSON({ type: "FeatureCollection", features: [] }, "test.geojson");
    expect(mockAnchor.click).toHaveBeenCalledOnce();
    expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
    expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:test-url");
  });
});
