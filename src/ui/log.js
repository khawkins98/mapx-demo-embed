/** Append a timestamped message to the on-screen log overlay */
export function log(msg) {
  const el = document.getElementById("log");
  const line = document.createElement("div");
  const ts = new Date().toLocaleTimeString();
  line.textContent = `[${ts}] ${msg}`;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
  console.log(msg);
}

/**
 * Update the status badge in the header.
 *
 * The badge uses Mangrove tag classes to communicate connection state:
 *   - "ok"    → mg-tag--outline with white text/border. Normal connected state.
 *   - "error" → mg-tag--accent. Red-ish highlight for failures.
 *   - (other) → mg-tag--secondary. Muted/gray, used during loading/init.
 *
 * We reset className to the bare "mg-tag" first, then layer on the
 * variant class, so previous states don't bleed through.
 */
export function setStatus(msg, variant) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "mg-tag";
  if (variant === "ok") {
    el.classList.add("mg-tag--outline");
    el.style.cssText = "color:#fff;border-color:#fff";
  } else if (variant === "error") {
    el.classList.add("mg-tag--accent");
    el.style.cssText = "";
  } else {
    el.classList.add("mg-tag--secondary");
    el.style.cssText = "";
  }
}
