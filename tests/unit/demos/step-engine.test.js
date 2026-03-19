import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mock SDK modules ─────────────────────────────────────────────── */

vi.mock("../../../src/sdk/views.js", () => ({
  viewAdd: vi.fn(() => Promise.resolve(true)),
  viewRemove: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("../../../src/sdk/filters.js", () => ({
  setViewLayerTransparency: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("../../../src/sdk/map-control.js", () => ({
  mapFlyTo: vi.fn(() => Promise.resolve()),
  commonLocFitBbox: vi.fn(() => Promise.resolve()),
}));

/* ── Mock story steps with a small 3-step fixture ─────────────────── */

const VIEW_A = "MX-AAAAA-AAAAA-AAAAA";
const VIEW_B = "MX-BBBBB-BBBBB-BBBBB";
const VIEW_C = "MX-CCCCC-CCCCC-CCCCC";

const TEST_STEPS = [
  {
    id: "step-0",
    title: "First Step",
    narrative: "Intro text",
    views: [VIEW_A, VIEW_B],
    camera: { center: { lng: 10, lat: 20 }, zoom: 3 },
    transparency: { [VIEW_A]: 50 },
    controls: {},
  },
  {
    id: "step-1",
    title: "Second Step",
    narrative: "Middle text",
    views: [VIEW_B, VIEW_C],
    camera: { code: "NPL", param: { duration: 1000 } },
    transparency: {},
    controls: {},
  },
  {
    id: "step-2",
    title: "Third Step",
    narrative: "Final text",
    views: [VIEW_C],
    camera: { center: { lng: 0, lat: 0 }, zoom: 5 },
    transparency: {},
    controls: {},
  },
];

vi.mock("../../../src/config/story-steps.js", () => ({
  STORY_STEPS: TEST_STEPS,
}));

/* ── Import module under test (after mocks are declared) ──────────── */

const { viewAdd, viewRemove } = await import("../../../src/sdk/views.js");
const { setViewLayerTransparency } = await import(
  "../../../src/sdk/filters.js"
);
const { mapFlyTo, commonLocFitBbox } = await import(
  "../../../src/sdk/map-control.js"
);

/*
 * The step engine holds module-level state (currentStepIndex, openViews).
 * We re-import a fresh copy before every test to reset that state.
 */
let engine;

async function freshEngine() {
  vi.resetModules();
  /* Re-apply mocks after resetModules so the new import picks them up. */
  vi.doMock("../../../src/sdk/views.js", () => ({
    viewAdd: viewAdd,
    viewRemove: viewRemove,
  }));
  vi.doMock("../../../src/sdk/filters.js", () => ({
    setViewLayerTransparency: setViewLayerTransparency,
  }));
  vi.doMock("../../../src/sdk/map-control.js", () => ({
    mapFlyTo: mapFlyTo,
    commonLocFitBbox: commonLocFitBbox,
  }));
  vi.doMock("../../../src/config/story-steps.js", () => ({
    STORY_STEPS: TEST_STEPS,
  }));
  return import("../../../demos/story/step-engine.js");
}

describe("step-engine", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    engine = await freshEngine();
  });

  /* ── Basic state ───────────────────────────────────────────────── */

  it("getStepCount returns the number of steps", () => {
    expect(engine.getStepCount()).toBe(3);
  });

  it("getCurrentStepIndex starts at -1", () => {
    expect(engine.getCurrentStepIndex()).toBe(-1);
  });

  /* ── goToStep ──────────────────────────────────────────────────── */

  it("goToStep(0) sets current index to 0 and calls onStepChange", async () => {
    const cb = vi.fn();
    engine.setOnStepChange(cb);
    await engine.goToStep(0);

    expect(engine.getCurrentStepIndex()).toBe(0);
    expect(cb).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledWith(TEST_STEPS[0], 0);
  });

  it("goToStep with out-of-range index is a no-op", async () => {
    const cb = vi.fn();
    engine.setOnStepChange(cb);

    await engine.goToStep(-1);
    expect(engine.getCurrentStepIndex()).toBe(-1);
    expect(cb).not.toHaveBeenCalled();

    await engine.goToStep(99);
    expect(engine.getCurrentStepIndex()).toBe(-1);
    expect(cb).not.toHaveBeenCalled();
  });

  /* ── nextStep / prevStep ───────────────────────────────────────── */

  it("nextStep increments the index", async () => {
    await engine.goToStep(0);
    await engine.nextStep();
    expect(engine.getCurrentStepIndex()).toBe(1);
  });

  it("prevStep decrements the index", async () => {
    await engine.goToStep(2);
    await engine.prevStep();
    expect(engine.getCurrentStepIndex()).toBe(1);
  });

  /* ── canGoNext / canGoPrev ─────────────────────────────────────── */

  it("canGoNext returns false at last step", async () => {
    await engine.goToStep(2);
    expect(engine.canGoNext()).toBe(false);
  });

  it("canGoPrev returns false at first step", async () => {
    await engine.goToStep(0);
    expect(engine.canGoPrev()).toBe(false);
  });

  /* ── View diffing ──────────────────────────────────────────────── */

  it("diffs views: removes old, adds new, keeps common", async () => {
    /* Step 0 has views [A, B] */
    await engine.goToStep(0);
    vi.clearAllMocks();

    /* Step 1 has views [B, C] — should remove A, add C, keep B */
    await engine.goToStep(1);

    expect(viewRemove).toHaveBeenCalledWith(VIEW_A);
    expect(viewAdd).toHaveBeenCalledWith(VIEW_C);

    /* B should NOT be removed or re-added */
    expect(viewRemove).not.toHaveBeenCalledWith(VIEW_B);
    expect(viewAdd).not.toHaveBeenCalledWith(VIEW_B);
  });

  /* ── Camera ────────────────────────────────────────────────────── */

  it("step with camera.center calls mapFlyTo", async () => {
    await engine.goToStep(0);
    expect(mapFlyTo).toHaveBeenCalledWith({
      center: { lng: 10, lat: 20 },
      zoom: 3,
      duration: 2000,
    });
    expect(commonLocFitBbox).not.toHaveBeenCalled();
  });

  it("step with camera.code calls commonLocFitBbox", async () => {
    await engine.goToStep(1);
    expect(commonLocFitBbox).toHaveBeenCalledWith("NPL", { duration: 1000 });
    expect(mapFlyTo).not.toHaveBeenCalled();
  });

  /* ── Transparency ──────────────────────────────────────────────── */

  it("step with transparency calls setViewLayerTransparency for each entry", async () => {
    await engine.goToStep(0);
    expect(setViewLayerTransparency).toHaveBeenCalledWith(VIEW_A, 50);
  });

  /* ── setOnStepChange callback shape ────────────────────────────── */

  it("setOnStepChange callback receives (step, index)", async () => {
    const cb = vi.fn();
    engine.setOnStepChange(cb);
    await engine.goToStep(1);

    expect(cb).toHaveBeenCalledWith(TEST_STEPS[1], 1);
  });
});
