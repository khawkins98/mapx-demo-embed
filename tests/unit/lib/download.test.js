import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadGeoJSON, downloadFeaturesCSV } from "../../../src/lib/download.js";

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

describe("downloadFeaturesCSV", () => {
  let mockAnchor;
  let createObjectURLSpy;
  let revokeObjectURLSpy;
  let capturedBlob;

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

  /** Helper to extract the CSV string from the Blob passed to createObjectURL */
  async function getCsvText() {
    const blob = createObjectURLSpy.mock.calls[0][0];
    return blob.text();
  }

  it("creates a CSV with correct headers (longitude, latitude, property keys)", async () => {
    const features = [
      {
        geometry: { type: "Point", coordinates: [10, 20] },
        properties: { name: "A", status: "open" },
      },
    ];
    downloadFeaturesCSV(features, "test.csv");

    const csv = await getCsvText();
    const header = csv.split("\n")[0];
    expect(header).toBe("longitude,latitude,name,status");
  });

  it("handles features with different property sets (union of all keys)", async () => {
    const features = [
      {
        geometry: { type: "Point", coordinates: [1, 2] },
        properties: { name: "A" },
      },
      {
        geometry: { type: "Point", coordinates: [3, 4] },
        properties: { status: "closed" },
      },
    ];
    downloadFeaturesCSV(features, "union.csv");

    const csv = await getCsvText();
    const lines = csv.split("\n");
    expect(lines[0]).toBe("longitude,latitude,name,status");
    // First feature has name but no status
    expect(lines[1]).toBe("1,2,A,");
    // Second feature has status but no name
    expect(lines[2]).toBe("3,4,,closed");
  });

  it("properly quotes values containing commas, quotes, and newlines", async () => {
    const features = [
      {
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: { desc: 'has "quotes"', note: "has,comma", memo: "has\nnewline" },
      },
    ];
    downloadFeaturesCSV(features, "quoted.csv");

    const csv = await getCsvText();
    // Check against the full CSV text (not a split row) because the
    // newline inside the quoted value would break a naive line split.
    // Double quotes around value with quotes, with internal quotes doubled
    expect(csv).toContain('"has ""quotes"""');
    // Comma-containing value wrapped in quotes
    expect(csv).toContain('"has,comma"');
    // Newline-containing value wrapped in quotes
    expect(csv).toContain('"has\nnewline"');
  });

  it("extracts lon/lat from Point geometry", async () => {
    const features = [
      {
        geometry: { type: "Point", coordinates: [12.34, 56.78] },
        properties: { id: "1" },
      },
    ];
    downloadFeaturesCSV(features, "point.csv");

    const csv = await getCsvText();
    const row = csv.split("\n")[1];
    expect(row).toBe("12.34,56.78,1");
  });

  it("handles non-Point geometry (empty lon/lat)", async () => {
    const features = [
      {
        geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
        properties: { zone: "north" },
      },
    ];
    downloadFeaturesCSV(features, "polygon.csv");

    const csv = await getCsvText();
    const row = csv.split("\n")[1];
    expect(row).toBe(",,north");
  });

  it("handles features with no properties", async () => {
    const features = [
      {
        geometry: { type: "Point", coordinates: [5, 10] },
        properties: {},
      },
    ];
    downloadFeaturesCSV(features, "empty-props.csv");

    const csv = await getCsvText();
    const lines = csv.split("\n");
    expect(lines[0]).toBe("longitude,latitude");
    expect(lines[1]).toBe("5,10");
  });

  it("sets download filename and creates Blob with CSV type", () => {
    const features = [
      {
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: { a: "1" },
      },
    ];
    downloadFeaturesCSV(features, "export.csv");

    expect(mockAnchor.download).toBe("export.csv");
    const blob = createObjectURLSpy.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/csv;charset=utf-8");
  });
});
