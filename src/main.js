/**
 * Application entry point.
 *
 * Initialises the MapX SDK, sets up event listeners, and bootstraps
 * all UI modules. The init sequence is:
 *
 *   1. PIN gate (synchronous — blocks interaction until dismissed)
 *   2. SDK initialisation (creates iframe, connects to MapX app)
 *   3. On SDK "ready":
 *      - Build view toggle buttons
 *      - Wire all action buttons and sub-modules
 *      - Enable vector highlight for click interactions
 *      - Start the coordinate display polling
 */

import "./styles/shared.css";
import { initSDK } from "./sdk/client.js";
import { setVectorHighlight } from "./sdk/ui.js";
import { setStatus, log } from "./ui/log.js";
import { showInfobox } from "./ui/infobox.js";
import { initPinGate } from "./ui/pin-gate.js";
import { buildViewButtons } from "./ui/view-buttons.js";
import { enableActionButtons } from "./ui/action-buttons.js";
import { initCoordinateDisplay } from "./ui/coordinates.js";

/* PIN gate (runs synchronously before SDK) */
initPinGate();

/* Initialise the SDK */
const mapx = initSDK(document.getElementById("mapx"));

mapx.on("ready", async () => {
  setStatus("Connected", "ok");
  log("SDK ready — Eco-DRR project loaded");
  buildViewButtons();
  enableActionButtons();
  await mapx.ask("set_vector_highlight", { enable: true });

  /* Start coordinate bar — polls every 2 seconds */
  initCoordinateDisplay(2000);
});

mapx.on("click_attributes", (...args) => {
  log("click_attributes args count: " + args.length);
  for (let i = 0; i < args.length; i++) {
    try {
      log("  arg[" + i + "]: " + JSON.stringify(args[i]).substring(0, 500));
    } catch (e) {
      log("  arg[" + i + "]: (not serializable) " + typeof args[i]);
    }
  }
  showInfobox(args.length === 1 ? args[0] : args);
});
