import { test, expect } from "@playwright/test";

test.describe("Explorer demo", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/explorer/");
    await expect(page).toHaveTitle(/MapX/);
  });

  test("SDK status shows Connected after ready", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/explorer/");
    const status = page.locator("#status");
    await expect(status).toHaveText("Connected", { timeout: 60000 });
  });

  test("back link is visible and points to /", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/explorer/");
    const backLink = page.locator('a', { hasText: "All Demos" });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/");
  });

  test("#mapx container exists", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/explorer/");
    await expect(page.locator("#mapx")).toHaveCount(1);
  });

  test("sidebar with Data Explorer heading is visible", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/explorer/");
    const sidebar = page.locator(".explorer-sidebar");
    await expect(sidebar).toBeVisible();
    const heading = sidebar.locator("h2", { hasText: "Data Explorer" });
    await expect(heading).toBeVisible();
  });

  test("severity legend is visible with 4 items", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/explorer/");
    const legend = page.locator(".damage-legend");
    await expect(legend).toBeVisible();
    const items = legend.locator(".damage-legend-item");
    await expect(items).toHaveCount(4);
  });
});

test.describe("Explorer demo — after SDK ready", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/explorer/");
    await expect(page.locator("#status")).toHaveText("Connected", { timeout: 60000 });
  });

  test("preset query buttons appear and are not disabled", async ({ page }) => {
    const container = page.locator("#preset-buttons");
    const buttons = container.locator(".mg-button");
    // PRESET_QUERIES has 4 entries — wirePresetQueries replaces the loading placeholder
    await expect(buttons).toHaveCount(4, { timeout: 30000 });
    for (let i = 0; i < 4; i++) {
      await expect(buttons.nth(i)).not.toHaveClass(/disabled/);
    }
  });

  test("clicking a preset query button shows results", async ({ page }) => {
    const container = page.locator("#preset-buttons");
    const buttons = container.locator(".mg-button");
    await expect(buttons).toHaveCount(4, { timeout: 30000 });

    const resultsEl = page.locator("#preset-results");
    // Results div should not have the has-results class initially
    await expect(resultsEl).not.toHaveClass(/has-results/);

    // Click the first preset query button
    await buttons.first().click();

    // Results div should now have the has-results class
    await expect(resultsEl).toHaveClass(/has-results/, { timeout: 10000 });
  });
});
