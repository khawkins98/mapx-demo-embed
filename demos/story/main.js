/**
 * Story demo entry point.
 *
 * Initialises the MapX SDK, wires the step engine to the narrative
 * panel, and starts at step 0. The init sequence is:
 *
 *   1. PIN gate (synchronous — blocks interaction until dismissed)
 *   2. SDK initialisation (creates iframe, connects to MapX app)
 *   3. Step-change callback registered (updates narrative panel
 *      whenever the engine transitions to a new step)
 *   4. Narrative panel initialised (caches DOM refs, wires
 *      Prev/Next click handlers to the step engine)
 *   5. On SDK "ready":
 *      - Set status to "Connected"
 *      - Navigate to step 0 to kick off the story
 */

import "../../src/styles/shared.css";
import "../../src/styles/story.css";
import { initSDK } from "../../src/sdk/client.js";
import { initPinGate } from "../../src/ui/pin-gate.js";
import { setStatus, log } from "../../src/ui/log.js";
import { initNarrativePanel, updatePanel } from "./narrative-panel.js";
import {
  goToStep,
  nextStep,
  prevStep,
  canGoNext,
  canGoPrev,
  getStepCount,
  setOnStepChange,
} from "./step-engine.js";

initPinGate();

const mapx = initSDK(document.getElementById("mapx"));

setOnStepChange((step, index) => {
  updatePanel(step, index, getStepCount(), canGoPrev(), canGoNext());
});

initNarrativePanel({
  onPrev: () => prevStep(),
  onNext: () => nextStep(),
});

mapx.on("ready", async () => {
  setStatus("Connected", "ok");
  log("Story demo ready");
  await goToStep(0);
});
