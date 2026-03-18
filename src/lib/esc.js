const ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape a string for safe insertion into innerHTML. Pure string replacement — no DOM needed. */
export function esc(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);
}
