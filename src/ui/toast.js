import { esc } from "../lib/esc.js";

/**
 * Show a Mangrove-styled toast notification at the top of the page.
 *
 * This recreates the Mangrove UI snackbar pattern outside the MapX
 * iframe. We build the same DOM structure that MapX uses internally
 * so we can piggyback on its CSS (loaded from app.mapx.org inside
 * the embedded stylesheet):
 *
 *   mg-snackbar-wrapper       — fixed-position container that pins
 *                                the toast to the top-center of the
 *                                viewport. Manages z-index stacking.
 *
 *   mg-snackbar-wrapper__open — modifier class that triggers the
 *                                slide-in transition (translateY).
 *                                Without it the wrapper sits offscreen.
 *
 *   mg-snackbar               — the visible card itself (background,
 *                                padding, border-radius, shadow).
 *
 *   mg-snackbar__info          — colour variant: applies a blue/teal
 *                                left-border accent for informational
 *                                messages (vs. __error, __warning).
 *
 *   mg-snackbar__content       — flex container that lays out the icon
 *                                area and the message text side by side.
 *
 *   mg-snackbar__message       — the text content itself. We insert
 *                                our "Selected: <feature name>" here.
 *
 * Animation lifecycle:
 *   1. Create the wrapper with __open already applied → it slides in
 *      immediately on appendChild.
 *   2. After 4 seconds, remove __open → the CSS transition slides
 *      the toast back up (300ms ease-out).
 *   3. After the 300ms transition completes, remove the DOM node
 *      entirely so it doesn't accumulate invisible elements.
 *
 * If a toast is already visible when a new one fires (fast clicking),
 * we remove the old one first to avoid stacking.
 */
export function showToast(message) {
  const existing = document.getElementById("demo-toast");
  if (existing) existing.remove();

  const wrapper = document.createElement("div");
  wrapper.id = "demo-toast";
  wrapper.className = "mg-snackbar-wrapper mg-snackbar-wrapper__open";
  wrapper.innerHTML = `
    <div class="mg-snackbar mg-snackbar__info">
      <div class="mg-snackbar__content">
        <span class="mg-snackbar__message">Selected: <strong>${esc(message)}</strong></span>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  setTimeout(() => {
    wrapper.classList.remove("mg-snackbar-wrapper__open");
    setTimeout(() => wrapper.remove(), 300);
  }, 4000);
}
