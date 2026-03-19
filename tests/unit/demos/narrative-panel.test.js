import { describe, it, expect, vi, beforeEach } from "vitest";
import { initNarrativePanel, updatePanel } from "../../../demos/story/narrative-panel.js";

/**
 * Sets up the minimal DOM that narrative-panel.js expects.
 * Called fresh before each test so state does not leak.
 */
function setupDOM() {
  document.body.innerHTML = `
    <div id="narrative-panel">
      <h2 id="narrative-title"></h2>
      <p id="narrative-text"></p>
      <div id="step-dots"></div>
      <span id="step-count"></span>
      <button id="btn-prev-step">Prev</button>
      <button id="btn-next-step">Next</button>
    </div>
  `;
}

describe("narrative-panel", () => {
  beforeEach(() => {
    setupDOM();
  });

  /* ── initNarrativePanel ────────────────────────────────────────── */

  describe("initNarrativePanel", () => {
    it("wires onPrev click handler to the prev button", () => {
      const onPrev = vi.fn();
      const onNext = vi.fn();
      initNarrativePanel({ onPrev, onNext });

      document.getElementById("btn-prev-step").click();
      expect(onPrev).toHaveBeenCalledOnce();
      expect(onNext).not.toHaveBeenCalled();
    });

    it("wires onNext click handler to the next button", () => {
      const onPrev = vi.fn();
      const onNext = vi.fn();
      initNarrativePanel({ onPrev, onNext });

      document.getElementById("btn-next-step").click();
      expect(onNext).toHaveBeenCalledOnce();
      expect(onPrev).not.toHaveBeenCalled();
    });
  });

  /* ── updatePanel ───────────────────────────────────────────────── */

  describe("updatePanel", () => {
    const step = {
      title: "Step 2: Exposure",
      narrative: "Population density overlayed with flood data.",
    };

    beforeEach(() => {
      initNarrativePanel({ onPrev: vi.fn(), onNext: vi.fn() });
    });

    it("updates title text", () => {
      updatePanel(step, 1, 5, true, true);
      expect(document.getElementById("narrative-title").textContent).toBe(
        "Step 2: Exposure",
      );
    });

    it("updates narrative text", () => {
      updatePanel(step, 1, 5, true, true);
      expect(document.getElementById("narrative-text").textContent).toBe(
        "Population density overlayed with flood data.",
      );
    });

    it("updates step count display", () => {
      updatePanel(step, 2, 7, true, true);
      expect(document.getElementById("step-count").textContent).toBe("3 / 7");
    });

    it("creates the correct number of dots", () => {
      updatePanel(step, 0, 5, false, true);
      const dots = document.getElementById("step-dots").children;
      expect(dots).toHaveLength(5);
    });

    it("marks the active dot", () => {
      updatePanel(step, 2, 5, true, true);
      const dots = document.getElementById("step-dots").children;
      expect(dots[2].classList.contains("step-dot--active")).toBe(true);
      /* Others are not active */
      expect(dots[0].classList.contains("step-dot--active")).toBe(false);
      expect(dots[1].classList.contains("step-dot--active")).toBe(false);
      expect(dots[3].classList.contains("step-dot--active")).toBe(false);
      expect(dots[4].classList.contains("step-dot--active")).toBe(false);
    });

    it("all dots have the base step-dot class", () => {
      updatePanel(step, 0, 3, false, true);
      const dots = document.getElementById("step-dots").children;
      for (let i = 0; i < dots.length; i++) {
        expect(dots[i].classList.contains("step-dot")).toBe(true);
      }
    });

    it("disables prev button when canPrev is false", () => {
      updatePanel(step, 0, 5, false, true);
      const prevBtn = document.getElementById("btn-prev-step");
      expect(prevBtn.disabled).toBe(true);
      expect(prevBtn.classList.contains("disabled")).toBe(true);
    });

    it("disables next button when canNext is false", () => {
      updatePanel(step, 4, 5, true, false);
      const nextBtn = document.getElementById("btn-next-step");
      expect(nextBtn.disabled).toBe(true);
      expect(nextBtn.classList.contains("disabled")).toBe(true);
    });

    it("enables both buttons when canPrev and canNext are true", () => {
      updatePanel(step, 2, 5, true, true);
      const prevBtn = document.getElementById("btn-prev-step");
      const nextBtn = document.getElementById("btn-next-step");
      expect(prevBtn.disabled).toBe(false);
      expect(nextBtn.disabled).toBe(false);
      expect(prevBtn.classList.contains("disabled")).toBe(false);
      expect(nextBtn.classList.contains("disabled")).toBe(false);
    });
  });
});
