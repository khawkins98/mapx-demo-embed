import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
  await page.goto("/");
  await expect(page.locator("#status")).toHaveText("Connected", { timeout: 60000 });
});

test.describe("Controls", () => {
  test("region buttons are enabled", async ({ page }) => {
    const worldBtn = page.locator("#btn-world");
    await expect(worldBtn).not.toHaveClass(/disabled/);
  });

  test("zoom buttons are enabled", async ({ page }) => {
    await expect(page.locator("#btn-zoom-in")).not.toHaveClass(/disabled/);
    await expect(page.locator("#btn-zoom-out")).not.toHaveClass(/disabled/);
  });

  test("reset button is enabled", async ({ page }) => {
    await expect(page.locator("#btn-reset")).not.toHaveClass(/disabled/);
  });

  test("clicking a region button logs fly-to", async ({ page }) => {
    await page.locator("#btn-caribbean").click();
    const logEntries = page.locator("#log div");
    await expect(logEntries.last()).toContainText(/Fly to Caribbean/, { timeout: 10000 });
  });
});
