/**
 * Country deep-dive: selector + profile card rendering.
 *
 * Populates the country dropdown from COUNTRY_PROFILES and renders
 * a profile card using Mangrove mg-card + mg-stats-card-item patterns
 * combined with SVG charts.
 */

import { COUNTRY_PROFILES } from "../../src/config/country-data.js";
import {
  renderDonutChart,
  renderHorizontalBarChart,
  renderMetricCard,
} from "./charts.js";

const HAZARD_COLORS = {
  flood: "#004f91",
  cyclone: "#962987",
  earthquake: "#eb752a",
  landslide: "#00afae",
};

/**
 * Initialise the country profile section.
 *
 * @param {Object} opts
 * @param {function(string): Promise<void>} opts.onCountryChange
 *   Called with ISO alpha-3 code when user selects a country.
 */
export function initCountryProfile({ onCountryChange }) {
  const select = document.getElementById("country-select");
  if (!select) return;

  // Populate dropdown options
  COUNTRY_PROFILES.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.code;
    opt.textContent = `${c.name} (${c.code})`;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    const code = select.value;
    if (!code) return;
    renderCountryProfile(code);
    onCountryChange(code);
  });
}

/**
 * Render the profile card for a given country code.
 * Uses Mangrove mg-card, mg-stats-card, mg-tag, and mg-grid patterns.
 * @param {string} code - ISO alpha-3
 */
export function renderCountryProfile(code) {
  const container = document.getElementById("country-profile");
  if (!container) return;

  const country = COUNTRY_PROFILES.find((c) => c.code === code);
  if (!country) {
    container.innerHTML = `<p class="tool-message">Country not found.</p>`;
    return;
  }

  // Risk score badge color
  const scoreColor =
    country.riskScore >= 80
      ? "#c10920"
      : country.riskScore >= 60
        ? "#eb752a"
        : "#00afae";

  // Stats row — uses mg-stats-card pattern (2-col to fit in half-width panel)
  const statsHtml = `
    <section class="mg-stats-card mg-stats-card--compact" aria-label="Key risk figures for ${country.name}">
      <div class="mg-grid mg-grid__col-2">
        <article class="mg-card mg-stats-card-item">
          <data class="mg-stats-card-item__value" value="${country.aal.pctGdp}%">${country.aal.pctGdp}%</data>
          <strong class="mg-stats-card-item__bottom-label">Avg. Annual Loss (% GDP)</strong>
        </article>
        <article class="mg-card mg-stats-card-item">
          <data class="mg-stats-card-item__value" value="$${formatMillions(country.aal.usdMillions)}">$${formatMillions(country.aal.usdMillions)}</data>
          <strong class="mg-stats-card-item__bottom-label">AAL (USD per year)</strong>
        </article>
        <article class="mg-card mg-stats-card-item">
          <data class="mg-stats-card-item__value" value="${country.popExposed}M">${country.popExposed}M</data>
          <strong class="mg-stats-card-item__bottom-label">Population Exposed</strong>
        </article>
        <article class="mg-card mg-stats-card-item">
          <data class="mg-stats-card-item__value" value="${country.gdpAtRisk}%">${country.gdpAtRisk}%</data>
          <strong class="mg-stats-card-item__bottom-label">GDP at Risk (multi-hazard)</strong>
        </article>
      </div>
    </section>`;

  // Hazard breakdown donut
  const hazardData = Object.entries(country.hazardBreakdown).map(
    ([key, val]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: val,
      color: HAZARD_COLORS[key] || "#999",
    }),
  );

  const donut = renderDonutChart({
    title: "Hazard Breakdown",
    data: hazardData,
    size: 200,
  });

  // Sectoral exposure bars
  const sectorData = Object.entries(country.sectorExposure).map(
    ([key, val], i) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: val,
      color: ["#004f91", "#962987", "#eb752a", "#00afae"][i] || "#999",
    }),
  );

  const sectorBars = renderHorizontalBarChart({
    title: "Sectoral Exposure (%)",
    data: sectorData,
  });

  // Resilience indicators
  const resData = [
    {
      label: "Early Warning",
      value: country.resilience.earlyWarning,
      color: "#004f91",
    },
    {
      label: "Insurance Coverage",
      value: country.resilience.insurance,
      color: "#962987",
    },
    {
      label: "Ecosystem Protection",
      value: country.resilience.ecosystem,
      color: "#00afae",
    },
  ];

  const resBars = renderHorizontalBarChart({
    title: "Resilience Indicators (0\u2013100)",
    data: resData,
  });

  container.innerHTML = `
    <div class="country-profile-card">
      <article class="mg-card">
        <div class="mg-card__content">
          <div class="country-profile-header">
            <header class="mg-card__title">${country.name}</header>
            <span class="mg-tag mg-tag--accent risk-score-badge" style="background:${scoreColor}">
              Risk Score: ${country.riskScore}/100
            </span>
          </div>
          <p>Primary hazard: <strong>${country.primaryHazard}</strong></p>
        </div>
      </article>
      ${statsHtml}
      <div class="country-charts-grid">
        <div class="country-chart-cell">${donut}</div>
        <div class="country-chart-cell">${sectorBars}</div>
      </div>
      <div class="country-chart-full">${resBars}</div>
      <div class="country-profile-cta">
        <p>This is a high-level snapshot. For the full country risk profile including
          detailed methodology, historical loss data, and policy recommendations:</p>
        <a class="mg-button mg-button-primary mg-button-arrow"
          href="https://www.preventionweb.net/countries/${country.code.toLowerCase()}"
          target="_blank" rel="noopener">
          View ${country.name} on PreventionWeb
        </a>
      </div>
    </div>`;
}

function formatMillions(m) {
  if (m >= 1000) return (m / 1000).toFixed(1) + "B";
  return m + "M";
}
