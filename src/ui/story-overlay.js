import { log } from "./log.js";

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
