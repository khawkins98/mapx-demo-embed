/**
 * Step engine — manages transitions between story steps.
 *
 * Maintains the current step index and handles view diffing,
 * camera animation, transparency, and narrative panel updates.
 */

import { viewAdd, viewRemove } from "../../src/sdk/views.js";
import { setViewLayerTransparency } from "../../src/sdk/filters.js";
import { mapFlyTo, commonLocFitBbox } from "../../src/sdk/map-control.js";
import { STORY_STEPS } from "../../src/config/story-steps.js";

let currentStepIndex = -1;
let openViews = new Set();
let onStepChange = null;

/** Busy guard — prevents re-entrant transitions from rapid clicks. */
let isBusy = false;

/**
 * Return the total number of story steps.
 * @returns {number} Length of the STORY_STEPS array.
 */
export function getStepCount() {
  return STORY_STEPS.length;
}

/**
 * Return the zero-based index of the currently active step.
 * Returns -1 if no step has been activated yet.
 * @returns {number} Current step index.
 */
export function getCurrentStepIndex() {
  return currentStepIndex;
}

/**
 * Return the step definition object for the current step,
 * or null if no step has been activated yet.
 * @returns {object|null} Current step definition ({id, title, narrative, views, camera, transparency}).
 */
export function getCurrentStep() {
  return STORY_STEPS[currentStepIndex] || null;
}

/**
 * Register a callback that fires after every step transition.
 *
 * @param {function(object, number): void} callback
 *   Called with (step, index) where `step` is the step definition
 *   object and `index` is its zero-based position.
 */
export function setOnStepChange(callback) {
  onStepChange = callback;
}

/**
 * Transition to the step at the given index.
 *
 * The transition sequence is:
 *   1. Diff the current and target view sets to compute removals/additions.
 *   2. Remove views that are no longer needed (parallel via Promise.all).
 *   3. Add views that are newly required (sequential for-loop).
 *   4. Apply per-view transparency overrides if the step defines them.
 *   5. Fly the camera to the step's target location.
 *   6. Notify the narrative panel via the onStepChange callback.
 *
 * A busy guard prevents re-entrant calls — if a transition is already
 * in progress (e.g. from rapid Next/Prev clicks), the call returns
 * immediately without corrupting state.
 *
 * @param {number} index - Zero-based step index to navigate to.
 * @returns {Promise<void>} Resolves when the transition completes.
 */
export async function goToStep(index) {
  if (index < 0 || index >= STORY_STEPS.length) return;
  if (isBusy) return;
  isBusy = true;

  try {
    const step = STORY_STEPS[index];
    const prevStep = currentStepIndex >= 0 ? STORY_STEPS[currentStepIndex] : null;
    currentStepIndex = index;

    /* Diff views: remove old, add new */
    const nextViews = new Set(step.views);
    const toRemove = [...openViews].filter((v) => !nextViews.has(v));
    const toAdd = [...nextViews].filter((v) => !openViews.has(v));

    /*
     * Removals use Promise.all (parallel) because the SDK can safely
     * tear down multiple views concurrently — there are no ordering
     * dependencies between independent view removals.
     */
    await Promise.all(toRemove.map((v) => viewRemove(v)));
    for (const v of toRemove) openViews.delete(v);

    /*
     * Additions use a sequential for-loop (one await per iteration)
     * to avoid SDK race conditions. Adding views in parallel can
     * cause rendering conflicts when layers compete for the same
     * map slot or z-order.
     */
    for (const v of toAdd) {
      await viewAdd(v);
      openViews.add(v);
    }

    /* Apply transparency */
    if (step.transparency) {
      for (const [viewId, value] of Object.entries(step.transparency)) {
        try {
          await setViewLayerTransparency(viewId, value);
        } catch {
          /* View may not support transparency */
        }
      }
    }

    /* Fly camera */
    if (step.camera) {
      /*
       * Two camera code paths:
       *   - .code is an ISO 3166 country code (e.g. "NPL") — uses
       *     commonLocFitBbox to fit the map to the country's bounding box.
       *   - .center is a {lng, lat} object — uses mapFlyTo for a
       *     smooth animated pan/zoom to a specific coordinate.
       */
      if (step.camera.code) {
        await commonLocFitBbox(step.camera.code, step.camera.param || {});
      } else if (step.camera.center) {
        await mapFlyTo({
          center: step.camera.center,
          zoom: step.camera.zoom || 3,
          duration: 2000,
        });
      }
    }

    /* Notify narrative panel */
    if (onStepChange) {
      onStepChange(step, index);
    }
  } finally {
    isBusy = false;
  }
}

/**
 * Advance to the next step, if one exists.
 * No-op when already on the last step.
 * @returns {Promise<void>}
 */
export async function nextStep() {
  if (currentStepIndex < STORY_STEPS.length - 1) {
    await goToStep(currentStepIndex + 1);
  }
}

/**
 * Go back to the previous step, if one exists.
 * No-op when already on the first step.
 * @returns {Promise<void>}
 */
export async function prevStep() {
  if (currentStepIndex > 0) {
    await goToStep(currentStepIndex - 1);
  }
}

/**
 * Check whether a forward step transition is possible.
 * @returns {boolean} True if the current step is not the last.
 */
export function canGoNext() {
  return currentStepIndex < STORY_STEPS.length - 1;
}

/**
 * Check whether a backward step transition is possible.
 * @returns {boolean} True if the current step is not the first.
 */
export function canGoPrev() {
  return currentStepIndex > 0;
}
