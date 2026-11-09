import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => { vi.resetModules(); delete window.mxsdk; });

describe("MapX Manager", () => {
  it("explains when the hosted SDK is unavailable", async () => {
    const { initSDK } = await import("../../../src/sdk/client.js");
    expect(() => initSDK(document.createElement("div"))).toThrow("MapX SDK is unavailable");
  });
  it("labels the frame and exposes the hosted version", async () => {
    const manager = { version: "1.14.3" };
    window.mxsdk = { Manager: vi.fn(function () { return manager; }) };
    const { initSDK, getMapXVersion } = await import("../../../src/sdk/client.js");
    expect(getMapXVersion()).toBeNull();
    initSDK(document.createElement("div"));
    expect(window.mxsdk.Manager).toHaveBeenCalledWith(expect.objectContaining({
      iframeTitle: "Interactive Eco-DRR map",
      url: "https://app.mapx.org/?project=MX-2LD-FBB-58N-ROK-8RH",
    }));
    expect(getMapXVersion()).toBe("1.14.3");
  });
});
