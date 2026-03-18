import { log } from "./log.js";

/**
 * Story Map overlay — why we use an iframe instead of view_add
 *
 * The story map views we want to play (MapX Presentation, Caribbean Sea)
 * belong to a different project (MX-YBJ-YYF-08R-UUR-QW6) than the one
 * our SDK instance is connected to (MX-2LD-FBB-58N-ROK-8RH, the Eco-DRR
 * project). view_add doesn't work cross-project: if you pass a view ID
 * that belongs to another project, it silently fails — no error thrown,
 * no view loaded, no feedback at all. The SDK just swallows it.
 *
 * Three approaches were tried:
 *
 *   1. Cross-project view IDs — pass the story map's idView directly
 *      to view_add on our SDK instance. Result: silent failure. The SDK
 *      resolves the promise but the view never appears. This is by design;
 *      MapX scopes views to projects for access control.
 *
 *   2. Open in a new tab — window.open() to the MapX story URL. Works,
 *      but the user loses context of the demo entirely. Bad UX for a
 *      "look at this embedded feature" demo.
 *
 *   3. Overlay iframe — create a full-viewport iframe inside the map
 *      area, pointed at the MapX app URL with storyAutoStart=true. The
 *      story plays inline with a close button to return to the demo.
 *
 * We went with option 3. Trade-offs: the iframe loads a full MapX app
 * instance (heavy), story navigation doesn't communicate back to our
 * SDK instance, and the close button sits over the iframe's own UI.
 * But it keeps the user in the demo and shows story maps working as
 * embedded content, which is the point of this proof of concept.
 */

export function dismissStoryOverlay() {
  const overlay = document.getElementById("story-overlay");
  if (overlay) {
    log("Dismissing story map overlay");
    overlay.remove();
  }
}

export function playStoryMap(idView, label) {
  log(`Playing story map: ${label} (${idView})`);
  const mapArea = document.querySelector(".app-map");

  const existing = document.getElementById("story-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "story-overlay";
  overlay.style.cssText = "position:absolute;inset:0;z-index:20;background:#000;";

  const iframe = document.createElement("iframe");
  iframe.src = `https://app.mapx.org/?project=MX-YBJ-YYF-08R-UUR-QW6&views=${idView}&storyAutoStart=true&language=en`;
  iframe.style.cssText = "width:100%;height:100%;border:none;";

  const closeBtn = document.createElement("button");
  closeBtn.className = "mg-button mg-button-primary";
  closeBtn.textContent = "Close Story Map";
  closeBtn.style.cssText = "position:absolute;top:1rem;right:1rem;z-index:21;";
  closeBtn.addEventListener("click", () => {
    log("Closing story map");
    overlay.remove();
  });

  overlay.appendChild(iframe);
  overlay.appendChild(closeBtn);
  mapArea.appendChild(overlay);
}
