import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("mg-preview-access:mapx-demo-embed", "unlocked"));
    await page.goto("/mapx-demo-embed/");
    await expect(page).toHaveTitle(/MapX/);
  });

  test("PIN gate is visible on fresh load", async ({ page }) => {
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

  test("four demo cards are visible after PIN dismissed", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("mg-preview-access:mapx-demo-embed", "unlocked"));
    await page.goto("/mapx-demo-embed/");
    const cards = page.locator(".demo-card");
    await expect(cards).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });

  test("demo cards link to correct URLs", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("mg-preview-access:mapx-demo-embed", "unlocked"));
    await page.goto("/mapx-demo-embed/");
    const cards = page.locator(".demo-card");

    await expect(cards.nth(0)).toHaveAttribute("href", "/mapx-demo-embed/demos/kitchen-sink/");
    await expect(cards.nth(1)).toHaveAttribute("href", "/mapx-demo-embed/demos/story/");
    await expect(cards.nth(2)).toHaveAttribute("href", "/mapx-demo-embed/demos/explorer/");
    await expect(cards.nth(3)).toHaveAttribute("href", "/mapx-demo-embed/demos/metrics/");
  });

  test("About this project section is visible", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("mg-preview-access:mapx-demo-embed", "unlocked"));
    await page.goto("/mapx-demo-embed/");
    const heading = page.locator("h2", { hasText: "About this project" });
    await expect(heading).toBeVisible();
  });

  test("no #mapx element exists on landing page", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("mg-preview-access:mapx-demo-embed", "unlocked"));
    await page.goto("/mapx-demo-embed/");
    await expect(page.locator("#mapx")).toHaveCount(0);
  });

  test("no #status element exists on landing page", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("mg-preview-access:mapx-demo-embed", "unlocked"));
    await page.goto("/mapx-demo-embed/");
    await expect(page.locator("#status")).toHaveCount(0);
  });
});
