/**
 * Country deep-dive: selector + profile card rendering.
 *
 * Populates the country dropdown from COUNTRY_PROFILES and renders
 * a profile card with charts when a country is selected.
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

  // Populate dropdown
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

  // Metric cards row
  const metricsRow = [
    renderMetricCard({
      label: "Avg. Annual Loss",
      value: country.aal.pctGdp + "%",
      subtitle: "of GDP",
    }),
    renderMetricCard({
      label: "AAL (USD)",
      value: "$" + formatMillions(country.aal.usdMillions),
      subtitle: "per year",
    }),
    renderMetricCard({
      label: "Population Exposed",
      value: country.popExposed + "M",
      subtitle: "people at risk",
    }),
    renderMetricCard({
      label: "GDP at Risk",
      value: country.gdpAtRisk + "%",
      subtitle: "multi-hazard",
    }),
  ].join("");

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
    title: "Resilience Indicators (0–100)",
    data: resData,
  });

  container.innerHTML = `
    <div class="country-profile-card">
      <div class="country-profile-header">
        <h3>${country.name}</h3>
        <span class="risk-score-badge" style="background:${scoreColor}">
          Risk Score: ${country.riskScore}/100
        </span>
      </div>
      <p class="country-profile-hazard">Primary hazard: <strong>${country.primaryHazard}</strong></p>
      <div class="metric-cards-row">${metricsRow}</div>
      <div class="country-charts-grid">
        <div class="country-chart-cell">${donut}</div>
        <div class="country-chart-cell">${sectorBars}</div>
      </div>
      <div class="country-chart-full">${resBars}</div>
    </div>`;
}

function formatMillions(m) {
  if (m >= 1000) return (m / 1000).toFixed(1) + "B";
  return m + "M";
}
