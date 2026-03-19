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

export function getStepCount() {
  return STORY_STEPS.length;
}

export function getCurrentStepIndex() {
  return currentStepIndex;
}

export function getCurrentStep() {
  return STORY_STEPS[currentStepIndex] || null;
}

export function setOnStepChange(callback) {
  onStepChange = callback;
}

export async function goToStep(index) {
  if (index < 0 || index >= STORY_STEPS.length) return;
  const step = STORY_STEPS[index];
  const prevStep = currentStepIndex >= 0 ? STORY_STEPS[currentStepIndex] : null;
  currentStepIndex = index;

  /* Diff views: remove old, add new */
  const nextViews = new Set(step.views);
  const toRemove = [...openViews].filter((v) => !nextViews.has(v));
  const toAdd = [...nextViews].filter((v) => !openViews.has(v));

  await Promise.all(toRemove.map((v) => viewRemove(v)));
  for (const v of toRemove) openViews.delete(v);

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
}

export async function nextStep() {
  if (currentStepIndex < STORY_STEPS.length - 1) {
    await goToStep(currentStepIndex + 1);
  }
}

export async function prevStep() {
  if (currentStepIndex > 0) {
    await goToStep(currentStepIndex - 1);
  }
}

export function canGoNext() {
  return currentStepIndex < STORY_STEPS.length - 1;
}

export function canGoPrev() {
  return currentStepIndex > 0;
}
