import { test, expect } from "@playwright/test";

const routes = ["", "demos/kitchen-sink/", "demos/story/", "demos/explorer/", "demos/metrics/"];
const key = "mg-preview-access:mapx-demo-embed";
const gate = "[data-mg-preview-access]";
const overlay = ".mg-preview-access__overlay";

// Exercise the published Mangrove module and CSS. MapX startup is independent
// of access control, so avoid loading WebGL frames while checking the gate.
test.beforeEach(async ({ context }) => {
  await context.route("https://app.mapx.org/sdk/mxsdk.umd.js", (route) => route.fulfill({
    contentType: "application/javascript",
    body: "window.mxsdk = { Manager: class { on() {} } };",
  }));
});

for (const route of routes) {
  test(`the Mangrove preview gate covers /${route}`, async ({ page }) => {
    await page.goto(`/mapx-demo-embed/${route}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("dialog", { name: "Preview access required" })).toBeVisible();
    await expect(page.getByLabel("Preview PIN")).toBeFocused();
    await expect(page.locator("main")).toBeHidden();
    await expect(page.locator("main")).toHaveAttribute("inert", "");
    await expect(page.locator(gate)).toHaveAttribute("data-mg-preview-id", "mapx-demo-embed");
    await expect(page.locator(gate)).toHaveAttribute("data-mg-preview-persist", "local");
  });
}

test("incorrect PIN stays locked; a corrected PIN unlocks and focuses the content", async ({ page }) => {
  await page.goto("/mapx-demo-embed/");
  const input = page.getByLabel("Preview PIN");
  await input.fill("0000");
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await expect(page.locator(overlay).getByRole("alert")).toContainText("That PIN is not correct");
  await expect(page.locator("main")).toBeHidden();
  await input.fill("5498");
  await input.press("Enter");
  await expect(page.locator(overlay)).toHaveCount(0);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("main")).toBeFocused();
  await expect(page.locator("main")).not.toHaveAttribute("inert");
});

test("one unlock is remembered after reload and on another demo tab", async ({ page, context }) => {
  await page.goto("/mapx-demo-embed/");
  await page.getByLabel("Preview PIN").fill("5498");
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await expect(page.locator(gate)).toHaveClass(/mg-preview-access--unlocked/);
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).not.toBeNull();

  await page.reload();
  await expect(page.locator(gate)).toHaveClass(/mg-preview-access--unlocked/);
  await expect(page.locator(overlay)).toHaveCount(0);
  const otherTab = await context.newPage();
  await otherTab.goto("/mapx-demo-embed/demos/story/", { waitUntil: "domcontentloaded" });
  await expect(otherTab.locator(gate)).toHaveClass(/mg-preview-access--unlocked/);
  await expect(otherTab.locator(overlay)).toHaveCount(0);
  await expect(otherTab.locator("main")).toBeVisible();
});
