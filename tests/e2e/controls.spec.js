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
});

test.describe("Controls", () => {
  test("region buttons are enabled", async ({ page }) => {
    await openSection(page, "#btn-world");
    const worldBtn = page.locator("#btn-world");
    await expect(worldBtn).not.toHaveClass(/disabled/);
  });

  test("zoom buttons are enabled", async ({ page }) => {
    await expect(page.locator("#btn-zoom-in")).not.toHaveClass(/disabled/);
    await expect(page.locator("#btn-zoom-out")).not.toHaveClass(/disabled/);
  });

  test("reset button is enabled", async ({ page }) => {
    await openSection(page, "#btn-reset");
    await expect(page.locator("#btn-reset")).not.toHaveClass(/disabled/);
  });

  test("clicking a region button logs fly-to", async ({ page }) => {
    await openSection(page, "#btn-caribbean");
    await page.locator("#btn-caribbean").click();
    const logEntries = page.locator("#log div");
    await expect(logEntries.last()).toContainText(/Fly to Caribbean/, { timeout: 10000 });
  });
});
