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

/** Update the status badge in the header. */
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
