import { test, expect } from "@playwright/test";

/** Open a collapsed <details> section that contains the given selector. */
async function openSection(page, selector) {
  const details = page.locator(`details:has(${selector})`);
  const isOpen = await details.getAttribute("open");
  if (isOpen === null) {
    await details.locator("summary").click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
  await page.goto("/");
  await expect(page.locator("#status")).toHaveText("Connected", { timeout: 60000 });
  await openSection(page, "#btn-geojson-add");
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
