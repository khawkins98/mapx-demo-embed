const ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escape a string for safe insertion into innerHTML.
 *
 * The original monolith used the classic DOM trick: create a throwaway
 * <div>, set its textContent, then read back innerHTML. That works fine
 * in a browser but requires jsdom or similar in a test environment.
 * This version does the same job with pure string replacement so it's
 * testable anywhere — no DOM needed.
 */
export function esc(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);
}
