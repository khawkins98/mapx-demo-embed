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
  await page.goto("/demos/kitchen-sink/");
  await expect(page.locator("#status")).toHaveText("Connected", { timeout: 60000 });
  await openSection(page, "#sc-fires-india");
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
