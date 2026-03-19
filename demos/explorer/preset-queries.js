/**
 * Preset queries — wires the preset query buttons in the explorer sidebar.
 *
 * Each preset filters the damage GeoJSON client-side and displays
 * a summary of matching features in the results panel.
 */

import { PRESET_QUERIES } from "../../src/config/explorer-layers.js";
import { getDamageGeoJSON } from "./damage-overlay.js";
import { esc } from "../../src/lib/esc.js";
import { log } from "../../src/ui/log.js";

/**
 * Create preset query buttons and bind click handlers.
 *
 * Expects two DOM elements to already exist in the page:
 *
 * - `#preset-buttons` — container `<div>` where buttons are appended.
 *   Its contents are cleared first so this function is idempotent.
 * - `#preset-results` — results panel `<div>` with the shared
 *   `.analysis-results` class. Query output is injected here and the
 *   `.has-results` class is toggled to make it visible.
 *
 * If either element is missing the function returns silently.
 */
export function wirePresetQueries() {
  const container = document.getElementById("preset-buttons");
  const resultsEl = document.getElementById("preset-results");
  if (!container || !resultsEl) return;

  container.innerHTML = "";

  PRESET_QUERIES.forEach((q) => {
    const btn = document.createElement("button");
    btn.className = "mg-button mg-button-secondary";
    btn.textContent = q.label;
    btn.title = q.description;
    btn.addEventListener("click", () => runPresetQuery(q, resultsEl));
    container.appendChild(btn);
  });
}

/**
 * Execute a single preset query against the damage GeoJSON.
 *
 * Filters the FeatureCollection using the query's `filter` predicate,
 * computes summary statistics (total damage, affected people, countries),
 * and renders an HTML summary table plus a per-event detail table into
 * the results element. Adds the `.has-results` class so the panel
 * becomes visible via the shared `.analysis-results.has-results` rule
 * in shared.css.
 *
 * @param {object}      query           Preset query definition from PRESET_QUERIES.
 * @param {string}      query.label     Human-readable name shown in output headings.
 * @param {Function}    query.filter    Predicate `(feature) => boolean`.
 * @param {HTMLElement} resultsEl       The DOM element to render results into.
 */
function runPresetQuery(query, resultsEl) {
  const geojson = getDamageGeoJSON();
  const matches = geojson.features.filter(query.filter);

  log(`Preset "${query.label}": ${matches.length} matches`);

  if (matches.length === 0) {
    resultsEl.innerHTML = `<p>No events match: <strong>${esc(query.label)}</strong></p>`;
    resultsEl.classList.add("has-results");
    return;
  }

  const totalDamage = matches.reduce((s, f) => s + f.properties.damage_usd, 0);
  const totalAffected = matches.reduce((s, f) => s + f.properties.affected_people, 0);
  const countries = [...new Set(matches.map((f) => f.properties.country))].sort();

  let html = `<h4>${esc(query.label)}</h4>`;
  html += `<table>`;
  html += `<tr><th>Metric</th><th>Value</th></tr>`;
  html += `<tr><td>Matching events</td><td>${matches.length}</td></tr>`;
  html += `<tr><td>Total damage</td><td>$${(totalDamage / 1e6).toFixed(1)}M</td></tr>`;
  html += `<tr><td>Total affected</td><td>${totalAffected.toLocaleString()}</td></tr>`;
  html += `<tr><td>Countries</td><td>${countries.map(esc).join(", ")}</td></tr>`;
  html += `</table>`;

  html += `<h4 style="margin-top:0.8rem;">Events</h4>`;
  html += `<table>`;
  html += `<tr><th>Name</th><th>Type</th><th>Severity</th><th>Damage</th></tr>`;
  matches.forEach((f) => {
    const p = f.properties;
    html += `<tr>`;
    html += `<td>${esc(p.name)}</td>`;
    html += `<td>${esc(p.event_type)}</td>`;
    html += `<td>${esc(p.severity)}</td>`;
    html += `<td>$${(p.damage_usd / 1e6).toFixed(1)}M</td>`;
    html += `</tr>`;
  });
  html += `</table>`;

  resultsEl.innerHTML = html;
  resultsEl.classList.add("has-results");
}
