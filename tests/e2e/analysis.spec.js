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
  await openSection(page, "#btn-toggle-analysis");
});

test.describe("Analysis Panel", () => {
  test("toggle button opens and closes the panel", async ({ page }) => {
    const toggleBtn = page.locator("#btn-toggle-analysis");
    const panel = page.locator("#analysis-panel");

    await expect(panel).toBeHidden();
    await toggleBtn.click();
    await expect(panel).toBeVisible();
    await expect(toggleBtn).toHaveText("Close Analysis Panel");

    await toggleBtn.click();
    await expect(panel).toBeHidden();
    await expect(toggleBtn).toHaveText("Open Analysis Panel");
  });

  test("analysis tool sections are present", async ({ page }) => {
    await page.locator("#btn-toggle-analysis").click();
    await expect(page.locator("#tool-numeric-filter")).toBeVisible();
    await expect(page.locator("#tool-spatial-query")).toBeVisible();
    await expect(page.locator("#tool-statistics")).toBeVisible();
    await expect(page.locator("#tool-data-export")).toBeVisible();
  });

  test("view select dropdown is present", async ({ page }) => {
    await page.locator("#btn-toggle-analysis").click();
    await expect(page.locator("#analysis-view-select")).toBeVisible();
  });
});
