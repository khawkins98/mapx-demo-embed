import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
  await page.goto("/");
  await expect(page.locator("#status")).toHaveText("Connected", { timeout: 60000 });
});

test.describe("Custom Data", () => {
  test("add/remove GeoJSON buttons are present", async ({ page }) => {
    await expect(page.locator("#btn-geojson-add")).toBeVisible();
    await expect(page.locator("#btn-geojson-remove")).toBeVisible();
  });

  test("add/remove marker buttons are present", async ({ page }) => {
    await expect(page.locator("#btn-markers-add")).toBeVisible();
    await expect(page.locator("#btn-markers-remove")).toBeVisible();
  });

  test("add/remove polygon buttons are present", async ({ page }) => {
    await expect(page.locator("#btn-polygons-add")).toBeVisible();
    await expect(page.locator("#btn-polygons-remove")).toBeVisible();
  });
});
