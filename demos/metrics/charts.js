/**
 * Pure SVG chart renderers for the Metrics Hub.
 *
 * Each function returns an HTML/SVG string. No DOM side effects.
 * Colors follow the Sendai Framework palette used across the project.
 */

/**
 * Horizontal bar chart.
 * @param {Object} opts
 * @param {string} opts.title
 * @param {{ label: string, value: number, color: string }[]} opts.data
 * @param {string} [opts.unit]
 * @returns {string} SVG markup
 */
export function renderHorizontalBarChart({ title, data, unit = "" }) {
  const barH = 28;
  const gap = 12;
  const labelW = 130;
  const valueW = 70;
  const chartW = 400;
  const barAreaW = chartW - labelW - valueW;
  const chartH = data.length * (barH + gap) + 30;
  const max = Math.max(...data.map((d) => d.value));

  let bars = "";
  data.forEach((d, i) => {
    const y = 30 + i * (barH + gap);
    const w = max > 0 ? (d.value / max) * barAreaW : 0;

    bars += `
      <text x="${labelW - 8}" y="${y + barH / 2 + 5}"
        text-anchor="end" font-size="13" fill="#333">${d.label}</text>
      <rect x="${labelW}" y="${y}" width="${w}" height="${barH}"
        rx="3" fill="${d.color}" opacity="0.85">
        <animate attributeName="width" from="0" to="${w}" dur="0.6s" fill="freeze" />
      </rect>
      <text x="${labelW + w + 6}" y="${y + barH / 2 + 5}"
        font-size="12" fill="#666">${d.value}${unit ? " " + unit : ""}</text>`;
  });

  return `
    <svg viewBox="0 0 ${chartW} ${chartH}" class="chart-svg"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
      <text x="${chartW / 2}" y="18" text-anchor="middle"
        font-size="14" font-weight="600" fill="#1a1a1a">${title}</text>
      ${bars}
    </svg>`;
}

/**
 * Donut chart using arc paths.
 * @param {Object} opts
 * @param {string} opts.title
 * @param {{ label: string, value: number, color: string }[]} opts.data
 * @param {number} [opts.size=220]
 * @returns {string} SVG markup
 */
export function renderDonutChart({ title, data, size = 220 }) {
  const cx = size / 2;
  const cy = size / 2 + 10;
  const outerR = size / 2 - 20;
  const innerR = outerR * 0.55;
  const total = data.reduce((s, d) => s + d.value, 0);

  let paths = "";
  let legendItems = "";
  let startAngle = -Math.PI / 2;

  data.forEach((d, i) => {
    const sliceAngle = total > 0 ? (d.value / total) * 2 * Math.PI : 0;
    const endAngle = startAngle + sliceAngle;
    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const x1o = cx + outerR * Math.cos(startAngle);
    const y1o = cy + outerR * Math.sin(startAngle);
    const x2o = cx + outerR * Math.cos(endAngle);
    const y2o = cy + outerR * Math.sin(endAngle);
    const x1i = cx + innerR * Math.cos(endAngle);
    const y1i = cy + innerR * Math.sin(endAngle);
    const x2i = cx + innerR * Math.cos(startAngle);
    const y2i = cy + innerR * Math.sin(startAngle);

    paths += `
      <path d="M${x1o},${y1o}
               A${outerR},${outerR} 0 ${largeArc} 1 ${x2o},${y2o}
               L${x1i},${y1i}
               A${innerR},${innerR} 0 ${largeArc} 0 ${x2i},${y2i}Z"
        fill="${d.color}" opacity="0.85" />`;

    const ly = size + 20 + i * 18;
    legendItems += `
      <rect x="10" y="${ly}" width="12" height="12" rx="2" fill="${d.color}" />
      <text x="28" y="${ly + 11}" font-size="12" fill="#333">
        ${d.label} (${Math.round((d.value / total) * 100)}%)</text>`;

    startAngle = endAngle;
  });

  const legendH = data.length * 18 + 10;

  return `
    <svg viewBox="0 0 ${size} ${size + 20 + legendH}" class="chart-svg"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
      <text x="${size / 2}" y="14" text-anchor="middle"
        font-size="14" font-weight="600" fill="#1a1a1a">${title}</text>
      ${paths}
      ${legendItems}
    </svg>`;
}

/**
 * Metric card — big number with label. Returns HTML, not SVG.
 * @param {Object} opts
 * @param {string} opts.label
 * @param {string|number} opts.value
 * @param {string} [opts.unit]
 * @param {string} [opts.subtitle]
 * @returns {string} HTML markup
 */
export function renderMetricCard({ label, value, unit = "", subtitle = "" }) {
  return `
    <div class="metric-card">
      <div class="metric-card__value">${value}${unit ? `<span class="metric-card__unit">${unit}</span>` : ""}</div>
      <div class="metric-card__label">${label}</div>
      ${subtitle ? `<div class="metric-card__subtitle">${subtitle}</div>` : ""}
    </div>`;
}

/**
 * Stacked horizontal bar chart.
 * @param {Object} opts
 * @param {string} opts.title
 * @param {{ label: string, segments: { label: string, value: number, color: string }[] }[]} opts.data
 * @returns {string} SVG markup
 */
export function renderStackedBar({ title, data }) {
  const barH = 24;
  const gap = 10;
  const labelW = 100;
  const chartW = 400;
  const barAreaW = chartW - labelW - 10;
  const chartH = data.length * (barH + gap) + 60;

  const maxTotal = Math.max(
    ...data.map((d) => d.segments.reduce((s, seg) => s + seg.value, 0)),
  );

  let bars = "";
  data.forEach((d, i) => {
    const y = 30 + i * (barH + gap);
    bars += `<text x="${labelW - 8}" y="${y + barH / 2 + 5}"
      text-anchor="end" font-size="12" fill="#333">${d.label}</text>`;

    let xOffset = labelW;
    d.segments.forEach((seg) => {
      const w = maxTotal > 0 ? (seg.value / maxTotal) * barAreaW : 0;
      bars += `<rect x="${xOffset}" y="${y}" width="${w}" height="${barH}"
        fill="${seg.color}" opacity="0.85">
        <animate attributeName="width" from="0" to="${w}" dur="0.6s" fill="freeze" />
      </rect>`;
      if (w > 20) {
        bars += `<text x="${xOffset + w / 2}" y="${y + barH / 2 + 4}"
          text-anchor="middle" font-size="10" fill="#fff">${seg.value}%</text>`;
      }
      xOffset += w;
    });
  });

  // Legend at the bottom
  const legendY = chartH - 18;
  const segLabels = data[0]?.segments || [];
  let legend = "";
  segLabels.forEach((seg, i) => {
    const lx = labelW + i * 120;
    legend += `
      <rect x="${lx}" y="${legendY}" width="12" height="12" rx="2" fill="${seg.color}" />
      <text x="${lx + 16}" y="${legendY + 11}" font-size="11" fill="#666">${seg.label}</text>`;
  });

  return `
    <svg viewBox="0 0 ${chartW} ${chartH}" class="chart-svg"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
      <text x="${chartW / 2}" y="18" text-anchor="middle"
        font-size="14" font-weight="600" fill="#1a1a1a">${title}</text>
      ${bars}
      ${legend}
    </svg>`;
}

/**
 * Trend line chart (sparkline with labels).
 * @param {Object} opts
 * @param {string} opts.title
 * @param {{ year: number, value: number }[]} opts.data
 * @param {string} [opts.unit]
 * @returns {string} SVG markup
 */
export function renderTrendLine({ title, data, unit = "" }) {
  const chartW = 400;
  const chartH = 180;
  const padL = 45;
  const padR = 20;
  const padT = 40;
  const padB = 35;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const minY = Math.min(...data.map((d) => d.value));
  const maxY = Math.max(...data.map((d) => d.value));
  const minX = Math.min(...data.map((d) => d.year));
  const maxX = Math.max(...data.map((d) => d.year));
  const rangeY = maxY - minY || 1;
  const rangeX = maxX - minX || 1;

  const points = data
    .map((d) => {
      const x = padL + ((d.year - minX) / rangeX) * plotW;
      const y = padT + plotH - ((d.value - minY) / rangeY) * plotH;
      return `${x},${y}`;
    })
    .join(" ");

  // Fill area under the line
  const firstX = padL;
  const lastX = padL + plotW;
  const areaPoints = `${firstX},${padT + plotH} ${points} ${lastX},${padT + plotH}`;

  // Axis labels
  let axisLabels = "";
  data.forEach((d, i) => {
    if (i % 2 === 0 || i === data.length - 1) {
      const x = padL + ((d.year - minX) / rangeX) * plotW;
      axisLabels += `<text x="${x}" y="${chartH - 5}" text-anchor="middle"
        font-size="11" fill="#666">${d.year}</text>`;
    }
  });

  // Y-axis ticks
  const yTicks = 4;
  let yAxisLabels = "";
  for (let i = 0; i <= yTicks; i++) {
    const val = minY + (rangeY / yTicks) * i;
    const y = padT + plotH - (i / yTicks) * plotH;
    yAxisLabels += `
      <text x="${padL - 6}" y="${y + 4}" text-anchor="end"
        font-size="10" fill="#999">${Math.round(val)}</text>
      <line x1="${padL}" y1="${y}" x2="${padL + plotW}" y2="${y}"
        stroke="#eee" stroke-width="1" />`;
  }

  // Data point dots
  let dots = "";
  data.forEach((d) => {
    const x = padL + ((d.year - minX) / rangeX) * plotW;
    const y = padT + plotH - ((d.value - minY) / rangeY) * plotH;
    dots += `<circle cx="${x}" cy="${y}" r="3" fill="#c10920" />`;
  });

  return `
    <svg viewBox="0 0 ${chartW} ${chartH}" class="chart-svg"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
      <text x="${chartW / 2}" y="18" text-anchor="middle"
        font-size="14" font-weight="600" fill="#1a1a1a">${title}</text>
      ${unit ? `<text x="${padL}" y="32" font-size="10" fill="#999">${unit}</text>` : ""}
      ${yAxisLabels}
      <polygon points="${areaPoints}" fill="#c10920" opacity="0.1" />
      <polyline points="${points}" fill="none"
        stroke="#c10920" stroke-width="2.5" stroke-linejoin="round" />
      ${dots}
      ${axisLabels}
    </svg>`;
}
