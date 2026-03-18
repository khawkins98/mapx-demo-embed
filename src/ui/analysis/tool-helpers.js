/** Show a message inside a tool's message element. */
export function showToolMessage(elId, text, isError) {
  const el = document.getElementById(elId);
  el.textContent = text;
  el.className = isError ? "tool-message error" : "tool-message";
}

/** Show HTML content in a tool's results panel. */
export function showToolResults(elId, html) {
  const el = document.getElementById(elId);
  el.innerHTML = html;
  el.classList.add("has-results");
}

/** Clear a tool's results panel. */
export function clearToolResults(elId) {
  const el = document.getElementById(elId);
  el.innerHTML = "";
  el.classList.remove("has-results");
}
