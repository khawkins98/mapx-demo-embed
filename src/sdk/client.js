/**
 * SDK client — owns the mxsdk.Manager instance.
 * The UMD script tag loads the global `mxsdk` object.
 */

let _mapx = null;

export function initSDK(container) {
  /* global mxsdk */
  _mapx = new mxsdk.Manager({
    container,
    url: "https://app.mapx.org/?project=MX-2LD-FBB-58N-ROK-8RH",
    params: {
      closePanels: true,
      language: "en",
      theme: "color_light",
    },
    style: {
      width: "100%",
      height: "100%",
      border: "none",
    },
  });
  return _mapx;
}

export function getSDK() {
  if (!_mapx) throw new Error("SDK not initialised — call initSDK() first");
  return _mapx;
}
