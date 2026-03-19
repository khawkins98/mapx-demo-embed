import { describe, it, expect, vi, beforeEach } from "vitest";
import { damageEventsGeoJSON } from "../../../src/data/damage-events.js";
import { PRESET_QUERIES } from "../../../src/config/explorer-layers.js";

/* ── Mock SDK-dependent modules ─────────────────────────────────────── */

vi.mock("../../../demos/explorer/damage-overlay.js", () => ({
  getDamageGeoJSON: () => damageEventsGeoJSON,
}));

vi.mock("../../../src/ui/log.js", () => ({
  log: vi.fn(),
}));

/* ── Import module under test (after mocks are declared) ────────────── */

const { wirePresetQueries } = await import(
  "../../../demos/explorer/preset-queries.js"
);

describe("wirePresetQueries", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    /* Set up minimal DOM required by wirePresetQueries */
    document.body.innerHTML = `
      <div id="preset-buttons"></div>
      <div id="preset-results"></div>
    `;
  });

  it("creates the correct number of buttons", () => {
    wirePresetQueries();

    const buttons = document.querySelectorAll("#preset-buttons button");
    expect(buttons).toHaveLength(PRESET_QUERIES.length);
  });

  it("buttons have the correct labels and titles", () => {
    wirePresetQueries();

    const buttons = document.querySelectorAll("#preset-buttons button");
    buttons.forEach((btn, i) => {
      expect(btn.textContent).toBe(PRESET_QUERIES[i].label);
      expect(btn.title).toBe(PRESET_QUERIES[i].description);
    });
  });

  it("clicking a preset button adds has-results class to the results div", () => {
    wirePresetQueries();

    const firstButton = document.querySelector("#preset-buttons button");
    firstButton.click();

    const resultsEl = document.getElementById("preset-results");
    expect(resultsEl.classList.contains("has-results")).toBe(true);
  });

  it("clicking a preset button populates results with matching event count and table", () => {
    wirePresetQueries();

    /* Click the "high-damage" button (index 0) */
    const buttons = document.querySelectorAll("#preset-buttons button");
    buttons[0].click();

    const resultsEl = document.getElementById("preset-results");

    /* The results should contain a table */
    const tables = resultsEl.querySelectorAll("table");
    expect(tables.length).toBeGreaterThan(0);

    /* Count the expected matches manually */
    const expectedMatches = damageEventsGeoJSON.features.filter(
      PRESET_QUERIES[0].filter,
    );

    /* The summary table should show the matching event count */
    expect(resultsEl.innerHTML).toContain(
      `<td>${expectedMatches.length}</td>`,
    );
  });

  it("each preset button filters correctly and shows matching events", () => {
    wirePresetQueries();

    const buttons = document.querySelectorAll("#preset-buttons button");

    PRESET_QUERIES.forEach((q, i) => {
      /* Reset the results div before each click */
      const resultsEl = document.getElementById("preset-results");
      resultsEl.innerHTML = "";
      resultsEl.classList.remove("has-results");

      buttons[i].click();

      const expectedMatches = damageEventsGeoJSON.features.filter(q.filter);
      expect(resultsEl.classList.contains("has-results")).toBe(true);

      if (expectedMatches.length > 0) {
        /* Summary row with match count */
        expect(resultsEl.innerHTML).toContain(
          `<td>${expectedMatches.length}</td>`,
        );

        /* Event detail rows: one <tr> per matching event in the events table */
        const allRows = resultsEl.querySelectorAll("table:last-of-type tr");
        /* First row is the header, rest are events */
        expect(allRows.length).toBe(expectedMatches.length + 1);
      }
    });
  });

  it("does nothing if preset-buttons container is missing", () => {
    document.body.innerHTML = "";
    wirePresetQueries();
    /* Should not throw */
    expect(true).toBe(true);
  });
});
