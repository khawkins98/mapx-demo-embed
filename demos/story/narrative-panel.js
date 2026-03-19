/**
 * Narrative panel — sidebar UI for the story demo.
 *
 * Renders the step title, narrative text, step indicator dots,
 * and Prev/Next navigation buttons.
 */

let panelEl = null;
let titleEl = null;
let textEl = null;
let dotsEl = null;
let prevBtn = null;
let nextBtn = null;
let stepCountEl = null;

/**
 * Initialise the narrative panel by caching DOM references and
 * wiring click handlers on the Prev/Next navigation buttons.
 *
 * @param {object} options
 * @param {function(): void} options.onPrev - Called when the Previous button is clicked.
 * @param {function(): void} options.onNext - Called when the Next button is clicked.
 */
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

/**
 * Update the narrative panel to reflect the current step.
 *
 * Sets the title, narrative body text, step counter label,
 * regenerates the step indicator dots, and toggles the
 * disabled state of the Prev/Next buttons.
 *
 * @param {object} step        - The step definition object ({title, narrative, ...}).
 * @param {number} index       - Zero-based index of the current step.
 * @param {number} totalSteps  - Total number of steps in the story.
 * @param {boolean} canPrev    - Whether backward navigation is available.
 * @param {boolean} canNext    - Whether forward navigation is available.
 */
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
