import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
  await page.goto("/");
  await expect(page.locator("#status")).toHaveText("Connected", { timeout: 60000 });
});

test.describe("Scenarios", () => {
  test("scenario buttons are enabled after SDK ready", async ({ page }) => {
    const fireBtn = page.locator("#sc-fires-india");
    await expect(fireBtn).not.toHaveClass(/disabled/);
  });

  test("clicking a scenario logs output", async ({ page }) => {
    const fireBtn = page.locator("#sc-fires-india");
    await fireBtn.click();
    // Check that something was logged
    const logEntries = page.locator("#log div");
    await expect(logEntries.last()).toContainText(/Scenario|Adding view|Flying/, { timeout: 15000 });
  });
});
