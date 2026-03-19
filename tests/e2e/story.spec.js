import { test, expect } from "@playwright/test";

test.describe("Story demo", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/story/");
    await expect(page).toHaveTitle(/MapX/);
  });

  test("SDK status shows Connected after ready", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/story/");
    const status = page.locator("#status");
    await expect(status).toHaveText("Connected", { timeout: 60000 });
  });

  test("back link is visible and points to /", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/story/");
    const backLink = page.locator('a', { hasText: "All Demos" });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/");
  });

  test("narrative panel is visible with title and text", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/story/");
    const panel = page.locator("#narrative-panel");
    await expect(panel).toBeVisible();
    const title = page.locator("#narrative-title");
    await expect(title).toBeVisible();
    const text = page.locator("#narrative-text");
    await expect(text).toBeVisible();
  });

  test("#mapx container exists", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/story/");
    await expect(page.locator("#mapx")).toHaveCount(1);
  });
});

test.describe("Story demo — after SDK ready", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mapx-demo-pin", "ok"));
    await page.goto("/demos/story/");
    await expect(page.locator("#status")).toHaveText("Connected", { timeout: 60000 });
  });

  test("step dots are rendered with correct count", async ({ page }) => {
    const dots = page.locator("#step-dots .step-dot");
    // STORY_STEPS has 8 entries
    await expect(dots).toHaveCount(8, { timeout: 10000 });
  });

  test("Previous button is disabled on first step", async ({ page }) => {
    const prevBtn = page.locator("#btn-prev-step");
    await expect(prevBtn).toBeVisible();
    await expect(prevBtn).toHaveClass(/disabled/);
    await expect(prevBtn).toBeDisabled();
  });

  test("Next button is enabled on first step", async ({ page }) => {
    const nextBtn = page.locator("#btn-next-step");
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).not.toHaveClass(/disabled/);
    await expect(nextBtn).toBeEnabled();
  });

  test("clicking Next updates the narrative title", async ({ page }) => {
    const title = page.locator("#narrative-title");
    const initialTitle = await title.textContent();

    const nextBtn = page.locator("#btn-next-step");
    await nextBtn.click();

    // Title should change from "Introduction" to "Step 1: Hazard"
    await expect(title).not.toHaveText(initialTitle, { timeout: 15000 });
  });

  test("step count display updates after navigation", async ({ page }) => {
    const stepCount = page.locator("#step-count");
    await expect(stepCount).toHaveText("1 / 8");

    const nextBtn = page.locator("#btn-next-step");
    await nextBtn.click();

    await expect(stepCount).toHaveText("2 / 8", { timeout: 15000 });
  });
});
