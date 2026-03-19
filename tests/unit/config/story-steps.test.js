import { describe, it, expect } from "vitest";
import { STORY_STEPS } from "../../../src/config/story-steps.js";

/** Regex for MapX view IDs: MX-XXXXX-XXXXX-XXXXX (alphanumeric segments). */
const MX_ID_RE = /^MX-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;

describe("STORY_STEPS configuration", () => {
  it("has the expected number of steps", () => {
    expect(STORY_STEPS.length).toBeGreaterThanOrEqual(7);
    expect(STORY_STEPS.length).toBeLessThanOrEqual(8);
  });

  it("first step is 'intro' and last step is 'resilience'", () => {
    expect(STORY_STEPS[0].id).toBe("intro");
    expect(STORY_STEPS[STORY_STEPS.length - 1].id).toBe("resilience");
  });

  it("all step IDs are unique", () => {
    const ids = STORY_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe("required fields", () => {
    STORY_STEPS.forEach((step) => {
      it(`step "${step.id}" has id, title, narrative, views, and camera`, () => {
        expect(typeof step.id).toBe("string");
        expect(step.id.length).toBeGreaterThan(0);
        expect(typeof step.title).toBe("string");
        expect(step.title.length).toBeGreaterThan(0);
        expect(typeof step.narrative).toBe("string");
        expect(step.narrative.length).toBeGreaterThan(0);
        expect(Array.isArray(step.views)).toBe(true);
        expect(step.camera).toBeDefined();
        expect(typeof step.camera).toBe("object");
      });
    });
  });

  describe("view IDs match MapX format", () => {
    STORY_STEPS.forEach((step) => {
      step.views.forEach((viewId) => {
        it(`view "${viewId}" in step "${step.id}" matches MX-xxxxx-xxxxx-xxxxx`, () => {
          expect(viewId).toMatch(MX_ID_RE);
        });
      });
    });
  });

  describe("camera objects", () => {
    STORY_STEPS.forEach((step) => {
      it(`step "${step.id}" camera has center (with lng/lat) or code (string)`, () => {
        const cam = step.camera;
        const hasCenter = cam.center != null;
        const hasCode = cam.code != null;
        expect(hasCenter || hasCode).toBe(true);

        if (hasCenter) {
          expect(typeof cam.center.lng).toBe("number");
          expect(typeof cam.center.lat).toBe("number");
        }
        if (hasCode) {
          expect(typeof cam.code).toBe("string");
        }
      });
    });
  });

  describe("transparency field", () => {
    STORY_STEPS.forEach((step) => {
      if (step.transparency) {
        it(`step "${step.id}" transparency maps view IDs to numbers 0-100`, () => {
          for (const [viewId, value] of Object.entries(step.transparency)) {
            expect(viewId).toMatch(MX_ID_RE);
            expect(typeof value).toBe("number");
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(100);
          }
        });
      }
    });
  });
});
