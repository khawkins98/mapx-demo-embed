import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("landing page loads with title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MapX Embed/);
  });

  test("PIN gate is visible on fresh load", async ({ page }) => {
    // Clear any stored PIN
    await page.addInitScript(() => localStorage.removeItem("mapx-demo-pin"));
    await page.goto("/");
    const gate = page.locator("#pin-gate");
    await expect(gate).toBeVisible();
  });

  test("PIN gate dismisses with correct PIN", async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem("mapx-demo-pin"));
    await page.goto("/");
    const input = page.locator("#pin-input");
    await input.fill("5498");
    // Gate should fade out
    await expect(page.locator("#pin-gate")).toHaveCount(0, { timeout: 5000 });
  });

  test("SDK status shows Connected after ready", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/kitchen-sink/");
    const status = page.locator("#status");
    await expect(status).toHaveText("Connected", { timeout: 60000 });
  });
});
