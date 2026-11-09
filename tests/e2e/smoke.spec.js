import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("landing page loads with title", async ({ page }) => {
    await page.goto("/mapx-demo-embed/");
    await expect(page).toHaveTitle(/MapX Embed/);
  });

  test("PIN gate is visible on fresh load", async ({ page }) => {
    // Clear any stored PIN
    await page.addInitScript(() => {
      localStorage.removeItem("mg-preview-access:mapx-demo-embed");
      sessionStorage.removeItem("mg-preview-access:mapx-demo-embed");
    });
    await page.goto("/mapx-demo-embed/");
    const gate = page.locator(".mg-preview-access__overlay");
    await expect(gate).toBeVisible();
  });

  test("PIN gate dismisses with correct PIN", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("mg-preview-access:mapx-demo-embed");
      sessionStorage.removeItem("mg-preview-access:mapx-demo-embed");
    });
    await page.goto("/mapx-demo-embed/");
    const input = page.locator("#mg-preview-access-pin");
    await input.fill("5498");
    await page.getByRole("button", { name: "Unlock", exact: true }).click();
    await expect(page.locator(".mg-preview-access__overlay")).toHaveCount(0, { timeout: 5000 });
  });

  test("SDK status shows Connected after ready", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("mg-preview-access:mapx-demo-embed", "unlocked"));
    await page.goto("/mapx-demo-embed/demos/kitchen-sink/");
    const status = page.locator("#status");
    await expect(status).toHaveText("Connected", { timeout: 60000 });
  });
});
