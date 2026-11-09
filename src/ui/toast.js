import { esc } from "../lib/esc.js";

/**
 * Local auto-dismiss behaviour using Mangrove 2.3 Notice presentation.
 * The library Snackbar controller requires React; this demo owns its timer.
 */
export function showToast(message) {
  const existing = document.getElementById("demo-toast");
  if (existing) existing.remove();

  const wrapper = document.createElement("div");
  wrapper.id = "demo-toast";
  wrapper.className = "mg-snackbar-wrapper mg-snackbar-wrapper__open";
  wrapper.innerHTML = `
    <div class="mg-notice mg-snackbar" role="status">
      <div class="mg-notice__description">
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
