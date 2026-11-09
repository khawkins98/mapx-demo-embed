import { test, expect } from "@playwright/test";

// Test the consumer contract without depending on the live MapX service.
test("MapX click_features updates the infobox and clears an empty hit", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("mg-preview-access:mapx-demo-embed", "unlocked"));
  await page.route("https://app.mapx.org/sdk/mxsdk.umd.js", (route) => route.fulfill({
    contentType: "application/javascript",
    body: `window.mxsdk = { Manager: class {
      version = '1.14.3';
      handlers = {};
      constructor(options) {
        window.mapxTest = this;
        const frame = document.createElement('iframe');
        frame.title = options.iframeTitle;
        options.container.append(frame);
      }
      on(event, callback) {
        this.handlers[event] = callback;
        if (event === 'ready') queueMicrotask(callback);
      }
      async ask(method) {
        if (method === 'get_language') return 'en';
        if (method === 'get_theme_id') return 'color_light';
        if (method === 'get_view_layer_transparency') return 1;
        return [];
      }
    }};`,
  }));
  await page.goto("/mapx-demo-embed/demos/kitchen-sink/");
  await expect(page.locator("#status")).toHaveText("Connected");
  await expect(page.locator("#mapx iframe")).toHaveAttribute("title", "Interactive Eco-DRR map");
  expect(await page.evaluate(() => Object.keys(window.mapxTest.handlers))).toContain("click_features");
  expect(await page.evaluate(() => Object.keys(window.mapxTest.handlers))).not.toContain("click_attributes");
  await page.evaluate(() => window.mapxTest.handlers.click_features({ attributes: { site: [{ name: "Flood site", depth: 3 }] } }));
  await expect(page.locator("#infobox-title")).toHaveText("Flood site");
  await expect(page.locator("#demo-toast [role=status]")).toContainText("Flood site");
  await page.evaluate(() => window.mapxTest.handlers.click_features({ attributes: {} }));
  await expect(page.locator("#infobox")).toBeHidden();

  // A 1% transparency value means 99% opacity, not normalized 0–1 data.
  await page.locator("#view-buttons .mg-button").first().click();
  await expect(page.locator(".view-transparency-row .mg-range")).toHaveValue("99");
  await expect(page.getByLabel("Opacity")).toHaveValue("99");
});
