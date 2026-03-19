import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/");
    await expect(page).toHaveTitle(/MapX/);
  });

  test("PIN gate is visible on fresh load", async ({ page }) => {
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
    // Gate is removed from the DOM after a 300ms fade
    await expect(page.locator("#pin-gate")).toHaveCount(0, { timeout: 5000 });
  });

  test("three demo cards are visible after PIN dismissed", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/");
    const cards = page.locator(".demo-card");
    await expect(cards).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });

  test("demo cards link to correct URLs", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/");
    const cards = page.locator(".demo-card");

    await expect(cards.nth(0)).toHaveAttribute("href", "/demos/kitchen-sink/");
    await expect(cards.nth(1)).toHaveAttribute("href", "/demos/story/");
    await expect(cards.nth(2)).toHaveAttribute("href", "/demos/explorer/");
  });

  test("About This Project section is visible", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/");
    const heading = page.locator("h2", { hasText: "About This Project" });
    await expect(heading).toBeVisible();
  });

  test("no #mapx element exists on landing page", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/");
    await expect(page.locator("#mapx")).toHaveCount(0);
  });

  test("no #status element exists on landing page", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/");
    await expect(page.locator("#status")).toHaveCount(0);
  });
});
