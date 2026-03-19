/**
 * Narrative panel — sidebar UI for the story demo.
 *
 * Renders the step title, narrative text, step indicator dots,
 * and Prev/Next navigation buttons.
 */

import { esc } from "../../src/lib/esc.js";

let panelEl = null;
let titleEl = null;
let textEl = null;
let dotsEl = null;
let prevBtn = null;
let nextBtn = null;
let stepCountEl = null;

export function initNarrativePanel({ onPrev, onNext }) {
  panelEl = document.getElementById("narrative-panel");
  titleEl = document.getElementById("narrative-title");
  textEl = document.getElementById("narrative-text");
  dotsEl = document.getElementById("step-dots");
  prevBtn = document.getElementById("btn-prev-step");
  nextBtn = document.getElementById("btn-next-step");
  stepCountEl = document.getElementById("step-count");

  if (prevBtn) prevBtn.addEventListener("click", onPrev);
  if (nextBtn) nextBtn.addEventListener("click", onNext);
}

export function updatePanel(step, index, totalSteps, canPrev, canNext) {
  if (titleEl) titleEl.textContent = step.title;
  if (textEl) textEl.textContent = step.narrative;
  if (stepCountEl) {
    stepCountEl.textContent = `${index + 1} / ${totalSteps}`;
  }

  /* Update step dots */
  if (dotsEl) {
    dotsEl.innerHTML = "";
    for (let i = 0; i < totalSteps; i++) {
      const dot = document.createElement("span");
      dot.className = "step-dot" + (i === index ? " step-dot--active" : "");
      dot.title = `Step ${i + 1}`;
      dotsEl.appendChild(dot);
    }
  }

  /* Enable/disable nav buttons */
  if (prevBtn) {
    prevBtn.disabled = !canPrev;
    prevBtn.classList.toggle("disabled", !canPrev);
  }
  if (nextBtn) {
    nextBtn.disabled = !canNext;
    nextBtn.classList.toggle("disabled", !canNext);
  }
}
