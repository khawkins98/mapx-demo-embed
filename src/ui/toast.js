import { esc } from "../lib/esc.js";

/** Show a Mangrove-styled toast notification at the top of the page. */
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
