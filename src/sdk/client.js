/**
 * SDK client -- owns the mxsdk.Manager instance.
 * The UMD script tag loads the global `mxsdk` object.
 *
 * The Manager constructor creates an iframe inside the target container
 * and loads the MapX app with the specified project. All communication
 * between this page and the MapX app happens via window.postMessage.
 *
 * Constructor options:
 *   container -- DOM element where the iframe will be inserted
 *   url       -- MapX app URL with project, language, and theme params
 *   params    -- URL query params passed to the MapX app:
 *                closePanels: hide the sidebar/panels on load
 *                views: array of view IDs to show at startup
 *                lat/lng/zoom: initial map position
 *                lockProject: prevent project switching
 *   style     -- CSS applied to the iframe element
 *   static    -- if true, loads /static.html (fewer features, faster)
 *
 * Full options: https://github.com/unep-grid/mapx/tree/master/app/src/js/sdk
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
  if (!_mapx) throw new Error("SDK not initialised -- call initSDK() first");
  return _mapx;
}
