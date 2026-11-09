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
import { initSDK, getMapXVersion } from "./sdk/client.js";
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
  log(`SDK ready — MapX ${getMapXVersion() ?? "unknown version"}, Eco-DRR project loaded`);
  buildViewButtons();
  enableActionButtons();
  await mapx.ask("set_vector_highlight", { enable: true });

  /* Start coordinate bar — polls every 2 seconds */
  initCoordinateDisplay(2000);
});

// MapX 1.14.2+ emits one result per click, grouped by view ID.
mapx.on("click_features", showInfobox);
