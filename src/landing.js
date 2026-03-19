/**
 * Landing page entry point.
 *
 * This is the minimal bootstrap for the demo landing page (index.html at
 * the project root). Unlike src/main.js — which initialises the MapX SDK,
 * wires view buttons, and sets up all map interactions — the landing page
 * has no embedded map and therefore performs no SDK initialisation.
 *
 * Responsibilities:
 *   1. Import shared.css (base resets, Mangrove overrides, layout utilities)
 *   2. Import landing.css (hero section, demo cards, tag colour variants)
 *   3. Initialise the PIN gate overlay (blocks access until a 4-digit PIN
 *      is entered; see src/ui/pin-gate.js for mechanism and localStorage
 *      persistence)
 */

import "./styles/shared.css";
import "./styles/landing.css";
import { initPinGate } from "./ui/pin-gate.js";

initPinGate();
