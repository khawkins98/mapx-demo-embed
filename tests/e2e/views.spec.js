import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
  await page.goto("/");
  await expect(page.locator("#status")).toHaveText("Connected", { timeout: 60000 });
});

test.describe("View buttons", () => {
  test("view buttons are rendered after SDK ready", async ({ page }) => {
    const buttons = page.locator("#view-buttons .mg-button");
    await expect(buttons.first()).toBeVisible();
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("clicking a view button toggles is-active class", async ({ page }) => {
    const firstBtn = page.locator("#view-buttons .mg-button").first();
    await expect(firstBtn).not.toHaveClass(/is-active/);
    await firstBtn.click();
    await expect(firstBtn).toHaveClass(/is-active/, { timeout: 10000 });
    await firstBtn.click();
    await expect(firstBtn).not.toHaveClass(/is-active/, { timeout: 10000 });
  });
});
