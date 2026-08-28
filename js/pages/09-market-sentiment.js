// renderMarketSentimentSlide() — "Market Sentiment by Strategy and
// Vintage". Originally a static, per-combination slide (Round 42); as of
// Round 83 this is a fully dynamic slide, per the user's explicit
// request ("instead of making many duplicates pages... lets modify them
// and make all data point change in a smooth way"): two dropdowns
// (Strategy, Vintage band) let the viewer pick any real combination, and
// EVERY number in both panels — the 4 "Pricing Drivers", the Indicative
// Pricing range/proceeds, and all 4 "Sell vs Hold" input tiles plus the
// chart itself — recomputes live from CFG.rows (js/data.js) filtered to
// that cohort. See js/slide-data/09-market-sentiment.data.js's header
// comment for the full methodology (what's real Excel data vs. the
// placeholder pricing/underwriting assumptions the workbook has no
// column for).
//
// Architecture: unlike every other migrated slide, there is NO Python
// exporter for this one's cohort-dependent numbers. CFG.rows is already
// the Excel-pipeline-derived, 363-row dataset (Round 73) and is available
// client-side, so filtering/aggregating it per dropdown selection happens
// directly in this file at render/interaction time — regenerating a data
// file on every dropdown change isn't possible (this deck is static
// `file://` HTML) and isn't needed (the aggregation is cheap: at most a
// few hundred row-filters over an array of 363). Only the fixed styling
// copy and the placeholder pricing methodology constants live in
// MARKET_SENTIMENT_DATA now — everything cohort-specific is computed
// below.
//
// THE CHART FORMULA (unchanged from Round 42/49, still the "challenge"
// the user flagged directly back then): see computeSellVsHoldSeries()
// below for the full smootherstep-interpolation reasoning, preserved
// as-is. What's new in Round 83 is that its 4 inputs (currentMultiple,
// expectedTVPI, reinvestRate, fundEndYear) are now themselves computed
// per cohort instead of hardcoded — see msBuildSellVsHold().
//
// SMOOTH UPDATES: switching either dropdown does NOT re-render the whole
// slide. msApplySelection() updates the range bar's fill/marker positions
// via CSS `transition` (see css/styles.css's .msRangeFill/.msMarker
// rules) so they visibly slide to their new position/width, and calls
// the existing ApexCharts instance's `updateOptions()` (not
// destroy+recreate) so the 3 curves, axis scale, and endpoint pills
// animate to their new values using the chart library's own transition —
// the same "real chart, not a picture" bar this slide's Round 42 build
// had to clear.
//
// chrome-page stays "08" (deck position unchanged by this round).

const MS_TAG_STYLES = {
  favourable: { bg: '#e3f3e9', text: '#1f6b4a', label: 'Favourable' },
  moderate: { bg: '#fdf0da', text: '#8a5a12', label: 'Moderate' },
  unfavourable: { bg: '#fee9e7', text: '#b2291e', label: 'Unfavourable' }
};
const MS_SEGMENT_COLORS = { red: '#f3a9a0', yellow: '#f5c86a', green: '#7cbf9e' };

const MS_COL_X = { left: 68, right: 494 };
const MS_ROW_Y = { 0: 674, 1: 790 };
// Tag-pill left x per column/row — pills are auto-width (padding, not a
// fixed px width) since "Favourable"/"Moderate"/"Unfavourable" are
// different lengths.
const MS_TAG_X = { left: { 0: 382, 1: 382 }, right: { 0: 794, 1: 822 } };
const MS_SEG_GAP = 3;
const MS_LABEL_TO_TAG_DY = -2;
const MS_LABEL_TO_VALUE_DY = 18;
const MS_LABEL_TO_SEGBAR_DY = 62;
const MS_LABEL_TO_SEGLABELS_DY = 80;
const MS_LABEL_TO_MARKER_DY = 57;

let marketSentimentPlayed = false;
function msShouldPlay(){
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return !marketSentimentPlayed && !reduce;
}

// ---- Cohort computation (CFG.rows -> this slide's numbers) ----
// See js/slide-data/09-market-sentiment.data.js's header comment for the
// full methodology and what is/isn't real Excel data.

function msTagColorWord(tagKey) {
  return tagKey === 'favourable' ? 'green' : (tagKey === 'unfavourable' ? 'red' : 'yellow');
}

// Returns the first band whose `max` exceeds value (bands sorted
// ascending, last band's max is Infinity) — matches the "<" convention
// CFG.rows' own *_segment fields already use (tools/export_cfg_rows.py).
function msBandFor(value, bands) {
  for (let i = 0; i < bands.length; i++) { if (value < bands[i].max) return bands[i]; }
  return bands[bands.length - 1];
}

function msFilterRows(strategy, vintageKey) {
  return CFG.rows.filter(function (r) { return r.strategy === strategy && r.vintage_segment === vintageKey; });
}

// Sum-then-derive, never average a ratio (same convention as
// js/app.js's weightedMetrics() and every Python exporter in this deck).
function msWeightedCohortMetrics(rows) {
  let paid = 0, nav = 0, dist = 0, totalValue = 0, commitment = 0, unfunded = 0, wVintageNum = 0;
  for (let i = 0; i < rows.length; i++) {
    const d = rows[i];
    paid += d.paid; nav += d.nav; dist += d.dist; totalValue += d.total_value;
    commitment += d.commitment_revised; unfunded += d.unfunded;
    wVintageNum += d.vintage * d.commitment_revised;
  }
  return {
    n: rows.length, nav: nav, paid: paid, dist: dist, unfunded: unfunded, commitment: commitment,
    dpi: paid ? dist / paid : 0,
    rvpi: paid ? nav / paid : 0,
    tvpi: paid ? totalValue / paid : 0,
    unfundedPct: commitment ? unfunded / commitment : 0,
    wVintage: commitment ? wVintageNum / commitment : null
  };
}

function msComputeCohort(strategy, vintageKey) {
  const rows = msFilterRows(strategy, vintageKey);
  if (!rows.length) throw new Error('msComputeCohort: no CFG.rows for strategy=' + strategy + ' vintage_segment=' + vintageKey);
  return msWeightedCohortMetrics(rows);
}

function msVintageCountsForStrategy(strategy) {
  const counts = {};
  MARKET_SENTIMENT_DATA.vintageSegments.forEach(function (v) { counts[v.key] = 0; });
  for (let i = 0; i < CFG.rows.length; i++) {
    const r = CFG.rows[i];
    if (r.strategy === strategy && counts.hasOwnProperty(r.vintage_segment)) counts[r.vintage_segment]++;
  }
  return counts;
}

function msAvailableVintageSegments(strategy) {
  const counts = msVintageCountsForStrategy(strategy);
  return MARKET_SENTIMENT_DATA.vintageSegments
    .filter(function (v) { return counts[v.key] > 0; })
    .map(function (v) { return Object.assign({}, v, { n: counts[v.key] }); });
}

// Keeps `preferredKey` if it's valid for the (possibly just-changed)
// strategy; otherwise falls back to whichever available vintage band has
// the most underlying funds, as the most representative default view.
function msPickVintage(strategy, preferredKey) {
  const avail = msAvailableVintageSegments(strategy);
  if (!avail.length) throw new Error('msPickVintage: no vintage data at all for strategy ' + strategy);
  const match = avail.filter(function (v) { return v.key === preferredKey; })[0];
  if (match) return match.key;
  return avail.slice().sort(function (a, b) { return b.n - a.n; })[0].key;
}

function msBuildBandDriver(column, row, label, numericValue, valueText, bands) {
  const band = msBandFor(numericValue, bands);
  const activeIndex = bands.indexOf(band);
  const segments = bands.map(function (b) { return { label: b.label, color: msTagColorWord(b.tagKey) }; });
  return {
    column: column, row: row, label: label, value: valueText, tagKey: band.tagKey,
    segmentWidth: 133, segments: segments, activeIndex: activeIndex,
    markerFraction: (activeIndex + 0.5) / segments.length
  };
}

// The vintage driver's tag/marker is derived from the SELECTED vintage
// band directly, not by re-bucketing the computed weighted-average value
// — mathematically identical (a cohort filtered to one vintage band's
// weighted average can only ever fall inside that same band) and it can
// never drift out of sync with the dropdown. See the data file's
// "VINTAGE-BAND FAVOURABILITY" comment for why this also fixes a real
// bug the pre-Round-74 static file had.
function msBuildVintageDriver(vintageKey, wVintage) {
  const D = MARKET_SENTIMENT_DATA;
  const activeIndex = D.vintageSegments.findIndex(function (v) { return v.key === vintageKey; });
  const segments = D.vintageSegments.map(function (v) { return { label: v.label, color: msTagColorWord(v.tagKey) }; });
  const tagKey = D.vintageSegments[activeIndex].tagKey;
  const valueText = wVintage != null ? String(Math.round(wVintage)) : '—';
  return {
    column: 'left', row: 0, label: 'Weighted Avg Vintage', value: valueText, tagKey: tagKey,
    segmentWidth: 78, segments: segments, activeIndex: activeIndex,
    markerFraction: (activeIndex + 0.5) / segments.length
  };
}

function msBuildDrivers(cohort, vintageKey) {
  const D = MARKET_SENTIMENT_DATA;
  return [
    msBuildVintageDriver(vintageKey, cohort.wVintage),
    msBuildBandDriver('right', 0, 'Unfunded (%)', cohort.unfundedPct, (cohort.unfundedPct * 100).toFixed(1) + '%', D.unfundedBands),
    msBuildBandDriver('left', 1, 'DPI', cohort.dpi, cohort.dpi.toFixed(2) + 'x', D.dpiBands),
    msBuildBandDriver('right', 1, 'TVPI', cohort.tvpi, cohort.tvpi.toFixed(2) + 'x', D.tvpiBands)
  ];
}

function msScoreFromDrivers(drivers) {
  const scoreOf = { favourable: 1, moderate: 0, unfavourable: -1 };
  return drivers.reduce(function (s, d) { return s + scoreOf[d.tagKey]; }, 0);
}

function msPricingFromScore(score, navDollars) {
  const D = MARKET_SENTIMENT_DATA;
  const band = D.pricingScoreTable.filter(function (b) { return score >= b.minScore; })[0];
  const navM = navDollars / 1e6;
  return {
    rangeLow: band.rangeLow, rangeHigh: band.rangeHigh,
    rangeDisplay: band.rangeLow + ' – ' + band.rangeHigh + '%',
    netSaleProceedsLow: Math.round(navM * band.rangeLow / 100),
    netSaleProceedsHigh: Math.round(navM * band.rangeHigh / 100),
    discountLow: band.discountLow, discountHigh: band.discountHigh
  };
}

// Ken Perlin's "nicenum"-style axis rounding: picks a human-friendly tick
// step (1/2/5 x a power of ten) covering [minVal,maxVal] with roughly
// targetTicks gridlines, replacing the old fixed [2.42..1.17] array which
// only worked for one cohort. Returns gridlines DESCENDING (index 0 =
// max), matching the field's original convention.
function msNiceAxis(minVal, maxVal, targetTicks) {
  targetTicks = targetTicks || 5;
  const span = Math.max(maxVal - minVal, 0.01);
  const rawStep = span / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  let niceNorm;
  if (norm < 1.5) niceNorm = 1; else if (norm < 3) niceNorm = 2; else if (norm < 7) niceNorm = 5; else niceNorm = 10;
  const step = niceNorm * mag;
  const niceMin = Math.floor(minVal / step) * step;
  const niceMax = Math.ceil(maxVal / step) * step;
  const ticks = [];
  for (let v = niceMax; v >= niceMin - 1e-9; v -= step) ticks.push(Math.round(v * 1000) / 1000);
  return ticks;
}

function msBuildSellVsHold(cohort, pricing) {
  const D = MARKET_SENTIMENT_DATA;
  const currentMultiple = cohort.tvpi;
  const expectedTVPI = currentMultiple * D.tvpiUpliftFactor;
  const reinvestRate = D.reinvestRateDefault;
  const discountLow = pricing.discountLow / 100;
  const discountHigh = pricing.discountHigh / 100;
  const todayYear = D.todayYear;
  const transactionYear = todayYear + D.transactionLagYears;
  const roundedVintage = cohort.wVintage != null ? Math.round(cohort.wVintage) : transactionYear;
  const fundEndYear = Math.max(transactionYear + D.minHorizonYears, roundedVintage + D.fundLifeYears);
  const years = fundEndYear - transactionYear;
  const growthFactor = Math.pow(1 + reinvestRate, years);
  const endpoints = {
    hold: expectedTVPI,
    sell10: currentMultiple * (1 - discountLow) * growthFactor,
    sell25: currentMultiple * (1 - discountHigh) * growthFactor
  };
  const allVals = [currentMultiple, endpoints.hold, endpoints.sell10, endpoints.sell25];
  const rawMin = Math.min.apply(null, allVals);
  const rawMax = Math.max.apply(null, allVals);
  const pad = (rawMax - rawMin) * 0.08 || 0.05;
  const yAxisGridlines = msNiceAxis(rawMin - pad, rawMax + pad, 5);

  return Object.assign({}, D.sellVsHold, {
    todayYear: todayYear, transactionYear: transactionYear, fundEndYear: fundEndYear,
    currentMultiple: currentMultiple, expectedTVPI: expectedTVPI, reinvestRate: reinvestRate,
    discountLow: discountLow, discountHigh: discountHigh,
    yAxisGridlines: yAxisGridlines,
    legend: [
      Object.assign({}, D.sellVsHold.legend[0]),
      Object.assign({}, D.sellVsHold.legend[1], { label: 'Sell at ' + Math.round(pricing.discountLow) + '%' }),
      Object.assign({}, D.sellVsHold.legend[2], { label: 'Sell at ' + Math.round(pricing.discountHigh) + '%' })
    ],
    filters: [
      { label: 'Fund end date', value: String(fundEndYear) },
      { label: 'Expected TVPI', value: expectedTVPI.toFixed(2) + 'x' },
      { label: 'Reinvestment rate', value: (reinvestRate * 100).toFixed(1) + '% p.a.' },
      { label: 'Discount', value: Math.round(pricing.discountLow) + '% – ' + Math.round(pricing.discountHigh) + '%' }
    ]
  });
}

function msComposeSlideData(strategy, vintageKey) {
  const D = MARKET_SENTIMENT_DATA;
  const cohort = msComputeCohort(strategy, vintageKey);
  const drivers = msBuildDrivers(cohort, vintageKey);
  const score = msScoreFromDrivers(drivers);
  const pricingBase = msPricingFromScore(score, cohort.nav);
  const sellVsHold = msBuildSellVsHold(cohort, pricingBase);
  const vintageMeta = D.vintageSegments.filter(function (v) { return v.key === vintageKey; })[0];
  const vintageLabel = vintageMeta ? vintageMeta.label : vintageKey;
  const strategyLabel = D.strategyDisplayLabels[strategy] || strategy;

  return {
    strategy: strategy, vintageKey: vintageKey, n: cohort.n,
    subtitleText: strategyLabel + ', ' + vintageLabel,
    pricing: Object.assign({}, D.pricing, pricingBase, { drivers: drivers }),
    sellVsHold: sellVsHold
  };
}

// ---- Dropdown state + wiring ----

let msState = { strategy: MARKET_SENTIMENT_DATA.defaultStrategy, vintageSegment: MARKET_SENTIMENT_DATA.defaultVintageSegment };

// If the configured default combo somehow has no data (e.g. a future
// workbook change), fall back to whatever real combination has the most
// underlying funds, rather than throwing on first render.
function msEnsureValidState() {
  try {
    msComputeCohort(msState.strategy, msState.vintageSegment);
    return;
  } catch (e) { /* fall through to auto-pick below */ }
  let best = null;
  MARKET_SENTIMENT_DATA.strategies.forEach(function (s) {
    msAvailableVintageSegments(s).forEach(function (v) {
      if (!best || v.n > best.n) best = { strategy: s, vintageSegment: v.key, n: v.n };
    });
  });
  if (best) { msState = { strategy: best.strategy, vintageSegment: best.vintageSegment }; }
}

function msStrategyOptionsHtml(selected) {
  const D = MARKET_SENTIMENT_DATA;
  return D.strategies.map(function (s) {
    const sel = s === selected ? ' selected' : '';
    return '<option value="' + s + '"' + sel + '>' + (D.strategyDisplayLabels[s] || s) + '</option>';
  }).join('');
}

function msVintageOptionsHtml(strategy, selected) {
  return msAvailableVintageSegments(strategy).map(function (v) {
    const sel = v.key === selected ? ' selected' : '';
    return '<option value="' + v.key + '"' + sel + '>' + v.label + '</option>';
  }).join('');
}

function msDropdownBarHtml() {
  return '\n  <div id="msFilterBar" style="position:absolute;left:68.00px;top:196.00px;width:1700.00px;height:44.00px;display:flex;align-items:baseline;gap:14px;">' +
    '<select id="msStrategySelect" class="msFilterSelect" style="min-width:300px;">' + msStrategyOptionsHtml(msState.strategy) + '</select>' +
    '<span class="msFilterSep">,</span>' +
    '<select id="msVintageSelect" class="msFilterSelect" style="min-width:150px;">' + msVintageOptionsHtml(msState.strategy, msState.vintageSegment) + '</select>' +
    '</div>';
}

function msTagPillHtml(x, y, tagKey, id) {
  const s = MS_TAG_STYLES[tagKey];
  return '\n  <div id="' + id + '" class="fig-box" data-fig-name="driver-tag" style="position:absolute;left:' + x.toFixed(2) + 'px;top:' + y.toFixed(2) + 'px;padding:4px 14px;background:' + s.bg + ';border-radius:11px;box-sizing:border-box;white-space:pre;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:600;font-style:normal;font-size:11.00px;line-height:13.86px;letter-spacing:0.00px;color:' + s.text + ';text-align:center;">' + s.label + '</div>';
}

function msDriverHtml(d, i) {
  const colX = MS_COL_X[d.column];
  const rowY = MS_ROW_Y[d.row];
  const tagX = MS_TAG_X[d.column][d.row];
  const tag = d.tagKey;
  const segTop = rowY + MS_LABEL_TO_SEGBAR_DY;
  const segLabelTop = rowY + MS_LABEL_TO_SEGLABELS_DY;
  const markerTop = rowY + MS_LABEL_TO_MARKER_DY;
  const barTotalWidth = d.segments.length * d.segmentWidth + (d.segments.length - 1) * MS_SEG_GAP;

  const segmentsHtml = d.segments.map(function (seg, j) {
    const segX = colX + j * (d.segmentWidth + MS_SEG_GAP);
    const isActive = j === d.activeIndex;
    const labelColor = isActive ? MS_TAG_STYLES[tag].text : '#808582';
    const labelWeight = isActive ? 600 : 400;
    return '\n  <div class="fig-box" data-fig-name="driver-segment" style="position:absolute;left:' + segX.toFixed(2) + 'px;top:' + segTop.toFixed(2) + 'px;width:' + d.segmentWidth.toFixed(2) + 'px;height:8.00px;background:' + MS_SEGMENT_COLORS[seg.color] + ';border-radius:4px;box-sizing:border-box;"></div>' +
      '\n  <div id="msSeg' + i + '_' + j + '" class="fig-text" data-fig-name="driver-segment-label" style="position:absolute;left:' + (segX - 6).toFixed(2) + 'px;top:' + segLabelTop.toFixed(2) + 'px;width:' + (d.segmentWidth + 12).toFixed(2) + 'px;height:13.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:' + labelWeight + ';font-style:normal;font-size:10.00px;line-height:12.60px;letter-spacing:0.00px;color:' + labelColor + ';text-align:center;white-space:pre;">' + seg.label + '</div>';
  }).join('');

  const markerX = colX + d.markerFraction * barTotalWidth - 9;
  const markerTravel = (colX - markerX).toFixed(2);
  const markerHtml = '\n  <div id="msDriverMarker' + i + '" class="fig-box msMarker" data-fig-name="driver-marker" style="--ms-i:' + i + ';--ms-travel:' + markerTravel + 'px;position:absolute;left:' + markerX.toFixed(2) + 'px;top:' + markerTop.toFixed(2) + 'px;width:18.00px;height:18.00px;border-radius:50%;background:#ffffff;border:3px solid ' + MS_TAG_STYLES[tag].text + ';box-sizing:border-box;"></div>';

  return '\n  <div class="fig-text" data-fig-name="driver-label" style="position:absolute;left:' + colX.toFixed(2) + 'px;top:' + rowY.toFixed(2) + 'px;width:240.00px;height:18.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:14.00px;line-height:17.64px;letter-spacing:0.00px;color:#808582;text-align:left;white-space:pre;">' + d.label + '</div>' +
    '\n  <div id="msDriverValue' + i + '" class="fig-text" data-fig-name="driver-value" style="position:absolute;left:' + colX.toFixed(2) + 'px;top:' + (rowY + MS_LABEL_TO_VALUE_DY).toFixed(2) + 'px;width:240.00px;height:33.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:600;font-style:normal;font-size:26.00px;line-height:32.76px;letter-spacing:0.00px;color:#1c1f21;text-align:left;white-space:pre;">' + d.value + '</div>' +
    msTagPillHtml(tagX, rowY + MS_LABEL_TO_TAG_DY, tag, 'msDriverTag' + i) + segmentsHtml + markerHtml;
}

function msRenderPricingPanel(P) {
  const barX0 = 68, barWidth = 832;
  const fillLeft = barX0 + (P.rangeLow - P.barScaleMin) / (P.barScaleMax - P.barScaleMin) * barWidth;
  const fillWidth = (P.rangeHigh - P.rangeLow) / (P.barScaleMax - P.barScaleMin) * barWidth;
  const driversHtml = P.drivers.map(msDriverHtml).join('');

  return '\n  <div class="fig-text" data-fig-name="pricing-heading" style="position:absolute;left:68.00px;top:264.00px;width:832.00px;height:43.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:600;font-style:normal;font-size:34.00px;line-height:42.84px;letter-spacing:0.00px;color:#104130;text-align:left;white-space:pre;">' + P.heading + '</div>' +
  '\n  <div class="fig-text" data-fig-name="pricing-subheading" style="position:absolute;left:68.00px;top:314.00px;width:832.00px;height:52.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:18.00px;line-height:26.00px;letter-spacing:0.00px;color:#808582;text-align:left;white-space:pre-wrap;overflow-wrap:break-word;">' + P.subheading + '</div>' +
  '\n  <div class="fig-box" data-fig-name="rule" style="position:absolute;left:68.00px;top:387.00px;width:832.00px;height:1.00px;background:#e2e6e3;"></div>' +
  '\n  <div id="msRangeStat" class="fig-text" data-fig-name="range-stat" style="position:absolute;left:68.00px;top:420.00px;width:400.00px;height:60.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:600;font-style:normal;font-size:48.00px;line-height:60.48px;letter-spacing:0.00px;color:#1c1f21;text-align:left;white-space:pre;">' + P.rangeDisplay + '</div>' +
  '\n  <div class="fig-text" data-fig-name="range-suffix" style="position:absolute;left:310.00px;top:446.00px;width:184.00px;height:21.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:17.00px;line-height:21.42px;letter-spacing:0.00px;color:#808582;text-align:left;white-space:pre;">' + P.rangeSuffix + '</div>' +
  '\n  <div class="fig-box" data-fig-name="range-bar-track" style="position:absolute;left:68.00px;top:490.00px;width:832.00px;height:10.00px;background:#e7eae8;border-radius:5px;box-sizing:border-box;"></div>' +
  '\n  <div id="msRangeFill" class="fig-box msRangeFill" data-fig-name="range-bar-fill" style="position:absolute;left:' + fillLeft.toFixed(2) + 'px;top:490.00px;width:' + fillWidth.toFixed(2) + 'px;height:10.00px;background:#1b6749;border-radius:5px;box-sizing:border-box;"></div>' +
  '\n  <div id="msNetSaleProceeds" class="fig-text" data-fig-name="net-sale-proceeds" style="position:absolute;left:68.00px;top:516.00px;width:832.00px;height:23.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:500;font-style:normal;font-size:18.00px;line-height:22.68px;letter-spacing:0.00px;color:#1c1f21;text-align:left;white-space:pre;">Net Sale Proceeds:  $' + P.netSaleProceedsLow + P.netSaleProceedsUnit + ' – $' + P.netSaleProceedsHigh + P.netSaleProceedsUnit + '</div>' +
  '\n  <div id="msDiscountNote" class="fig-text" data-fig-name="discount-note" style="position:absolute;left:68.00px;top:544.00px;width:832.00px;height:18.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:14.00px;line-height:17.64px;letter-spacing:0.00px;color:#808582;text-align:left;white-space:pre;">' + P.discountLow + '% – ' + P.discountHigh + '% discount to NAV</div>' +
  '\n  <div class="fig-box" data-fig-name="rule" style="position:absolute;left:68.00px;top:576.00px;width:832.00px;height:1.00px;background:#e2e6e3;"></div>' +
  '\n  <div class="fig-text" data-fig-name="drivers-heading" style="position:absolute;left:68.00px;top:596.00px;width:832.00px;height:28.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:600;font-style:normal;font-size:22.00px;line-height:27.72px;letter-spacing:0.00px;color:#1c1f21;text-align:left;white-space:pre;">' + P.driversHeading + '</div>' +
  '\n  <div class="fig-text" data-fig-name="drivers-subheading" style="position:absolute;left:68.00px;top:626.00px;width:832.00px;height:19.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:13.00px;line-height:19.00px;letter-spacing:0.00px;color:#808582;text-align:left;white-space:pre;">' + P.driversSubheading + '</div>' + driversHtml;
}

function msRenderSellVsHoldPanel(S) {
  const filtersHtml = S.filters.map(function (f, i) {
    const x = 1020 + i * 210;
    return '\n  <div class="fig-box" data-fig-name="filter-tile" style="position:absolute;left:' + x.toFixed(2) + 'px;top:428.00px;width:200.00px;height:50.00px;background:#f6f8f7;border:1px solid #e5e8e6;border-radius:6px;box-sizing:border-box;"></div>' +
      '\n  <div class="fig-text" data-fig-name="filter-label" style="position:absolute;left:' + (x + 12).toFixed(2) + 'px;top:435.00px;width:176.00px;height:13.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:10.00px;line-height:12.60px;letter-spacing:0.00px;color:#808582;text-align:left;white-space:pre;">' + f.label + '</div>' +
      '\n  <div id="msFilterValue' + i + '" class="fig-text" data-fig-name="filter-value" style="position:absolute;left:' + (x + 12).toFixed(2) + 'px;top:451.00px;width:176.00px;height:20.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:600;font-style:normal;font-size:16.00px;line-height:20.16px;letter-spacing:0.00px;color:#1c1f21;text-align:left;white-space:pre;">' + f.value + '</div>';
  }).join('');

  return '\n  <div class="fig-text" data-fig-name="sell-hold-heading" style="position:absolute;left:1020.00px;top:264.00px;width:832.00px;height:43.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:600;font-style:normal;font-size:34.00px;line-height:42.84px;letter-spacing:0.00px;color:#104130;text-align:left;white-space:pre;">' + S.heading + '</div>' +
  '\n  <div class="fig-text" data-fig-name="sell-hold-subheading" style="position:absolute;left:1020.00px;top:314.00px;width:832.00px;height:52.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:18.00px;line-height:26.00px;letter-spacing:0.00px;color:#808582;text-align:left;white-space:pre-wrap;overflow-wrap:break-word;">' + S.subheading + '</div>' +
  '\n  <div class="fig-box" data-fig-name="rule" style="position:absolute;left:1020.00px;top:387.00px;width:832.00px;height:1.00px;background:#e2e6e3;"></div>' + filtersHtml +
  '\n  <div id="marketSentimentChart" style="position:absolute;left:1010.00px;top:478.00px;width:852.00px;height:390.00px;"></div>' +
  '\n  <div id="msSourceNote" class="fig-text" data-fig-name="source-note" style="position:absolute;left:1020.00px;top:886.00px;width:832.00px;height:14.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:11.00px;line-height:13.86px;letter-spacing:0.00px;color:#808582;text-align:left;white-space:pre;">' + S.sourceNote + '</div>';
}

function renderMarketSentimentSlide() {
  const D = MARKET_SENTIMENT_DATA;
  msEnsureValidState();
  const cur = msComposeSlideData(msState.strategy, msState.vintageSegment);
  const pricingHtml = msRenderPricingPanel(cur.pricing);
  const sellVsHoldHtml = msRenderSellVsHoldPanel(cur.sellVsHold);

  return '<div class="fig-slide ' + (msShouldPlay() ? 'msSlide ms-ready' : 'msSlide ms-static') + '" style="position:relative;width:1920px;height:1080px;background:#ffffff;overflow:hidden;">' +
  '\n  <div class="fig-text" data-fig-name="chrome-year" style="position:absolute;left:68.00px;top:64.00px;width:49.00px;height:24.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#787878;text-align:left;white-space:pre;">2026</div>' +
  '\n  <div class="fig-box" data-fig-name="chrome-logo-box" style="position:absolute;left:1675.00px;top:58.00px;width:177.00px;height:44.00px;border:1px solid #0f0f0f;box-sizing:border-box;"></div>' +
  '\n  <div class="fig-text" data-fig-name="chrome-logo" style="position:absolute;left:1677.00px;top:69.00px;width:177.00px;height:24.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:5.00px;color:#0f0f0f;text-align:center;white-space:pre;">TANGIBLE</div>' +
  '\n  <div class="fig-text" data-fig-name="chrome-footer" style="position:absolute;left:68.00px;top:982.00px;width:112.00px;height:24.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">Confidential</div>' +
  '\n  <div class="fig-text" data-fig-name="chrome-page" style="position:absolute;left:1674.00px;top:982.00px;width:178.00px;height:24.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:right;white-space:pre;">08</div>' +
  '\n  <div class="fig-text" data-fig-name="chrome-footer-note" style="position:absolute;left:219.00px;top:982.00px;width:954.00px;height:24.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-style:normal;font-size:14.00px;line-height:18.00px;letter-spacing:0.00px;color:#787878;text-align:left;white-space:pre-wrap;overflow-wrap:break-word;">' + D.footnote + '</div>' +
  '\n  <div class="fig-text" data-fig-name="title" style="position:absolute;left:68.00px;top:136.00px;width:1700.00px;height:55.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:500;font-style:normal;font-size:44.00px;line-height:55.44px;letter-spacing:0.00px;color:#104130;text-align:left;white-space:pre;">' + D.title + '</div>' +
  msDropdownBarHtml() +
  '\n  <div class="fig-box" data-fig-name="panel-divider" style="position:absolute;left:956.00px;top:296.00px;width:1.00px;height:600.00px;background:#e2e6e3;"></div>' +
  '\n  <div id="msPricingPanel">' + pricingHtml + '</div>' +
  '\n  <div id="msSellVsHoldPanel">' + sellVsHoldHtml + '</div>' +
  '\n</div>';
}

// ---- Sell vs Hold chart math (unchanged since Round 49) ----
// See this file's header comment for the reasoning. Returns
// {hold, sell10, sell25} each an array of {x:year, y:multiple} points, and
// {endpoints:{hold,sell10,sell25}} for the bubble labels.
function msSmootherstep(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function computeSellVsHoldSeries(S) {
  const endpoints = {
    hold: S.expectedTVPI,
    sell10: S.currentMultiple * (1 - S.discountLow) * Math.pow(1 + S.reinvestRate, S.fundEndYear - S.transactionYear),
    sell25: S.currentMultiple * (1 - S.discountHigh) * Math.pow(1 + S.reinvestRate, S.fundEndYear - S.transactionYear)
  };
  function buildSeries(endValue) {
    const years = [S.todayYear, S.transactionYear];
    for (let i = 1; i <= 8; i++) years.push(S.transactionYear + (S.fundEndYear - S.transactionYear) * i / 8);
    return years.map(function (t) {
      let v = S.currentMultiple;
      if (t > S.transactionYear) {
        const frac = (t - S.transactionYear) / (S.fundEndYear - S.transactionYear);
        v = S.currentMultiple + (endValue - S.currentMultiple) * msSmootherstep(frac);
      }
      return { x: t, y: v };
    });
  }
  return {
    hold: buildSeries(endpoints.hold),
    sell10: buildSeries(endpoints.sell10),
    sell25: buildSeries(endpoints.sell25),
    endpoints: endpoints
  };
}

function msChartOptionsFor(S, play) {
  const fontFamily = "'Plus Jakarta Sans', sans-serif";
  const series = computeSellVsHoldSeries(S);
  const yMax = S.yAxisGridlines[0];
  const yMin = S.yAxisGridlines[S.yAxisGridlines.length - 1];
  const yTickAmount = S.yAxisGridlines.length - 1;

  function pillLabel(value, color) {
    return {
      borderColor: 'transparent', borderWidth: 0, borderRadius: 13,
      text: value.toFixed(2) + 'x', textAnchor: 'middle',
      style: { background: color, color: '#ffffff', fontFamily: fontFamily, fontSize: '14px', fontWeight: 600, padding: { left: 10, right: 10, top: 7, bottom: 7 } }
    };
  }

  return {
    chart: { type: 'line', width: 852, height: 390, fontFamily: fontFamily, toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: play, easing: 'easeinout', speed: 500 } },
    series: [
      { name: S.legend[0].label, data: series.hold.map(function (p) { return { x: p.x, y: p.y }; }) },
      { name: S.legend[1].label, data: series.sell10.map(function (p) { return { x: p.x, y: p.y }; }) },
      { name: S.legend[2].label, data: series.sell25.map(function (p) { return { x: p.x, y: p.y }; }) }
    ],
    colors: [S.legend[0].color, S.legend[1].color, S.legend[2].color],
    stroke: { curve: 'monotoneCubic', width: [3, 2.6, 2.6], lineCap: 'round' },
    markers: { size: 0, hover: { size: 6 }, strokeWidth: 2, strokeColors: '#ffffff' },
    dataLabels: { enabled: false },
    grid: { borderColor: '#edefee', strokeDashArray: 0, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } }, padding: { left: 8, right: 68, top: 24, bottom: 0 } },
    xaxis: {
      type: 'numeric', min: S.todayYear, max: S.fundEndYear, tickAmount: 1,
      crosshairs: { show: true, stroke: { color: '#c7cbc9', dashArray: 3 } }, tooltip: { enabled: false },
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: {
        style: { colors: '#808582', fontSize: '12px', fontFamily: fontFamily },
        formatter: function (val) {
          const y = Math.round(Number(val));
          if (y === S.todayYear) return S.todayLabel || 'Today';
          if (y === S.fundEndYear) return y + ' · ' + (S.fundEndYear - S.todayYear) + ' yrs';
          return '';
        }
      }
    },
    yaxis: {
      min: yMin, max: yMax, tickAmount: yTickAmount, axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { colors: '#808582', fontSize: '12px', fontFamily: fontFamily }, formatter: function (val) { return val.toFixed(2) + 'x'; } }
    },
    legend: { show: true, position: 'bottom', horizontalAlign: 'left', fontFamily: fontFamily, fontSize: '13px', labels: { colors: '#1c1f21' }, markers: { width: 12, height: 12, radius: 2 }, itemMargin: { horizontal: 16, vertical: 10 } },
    tooltip: { shared: true, intersect: false, x: { formatter: function (val) { return Math.round(Number(val)); } }, y: { formatter: function (val) { return val.toFixed(2) + 'x'; } } },
    annotations: {
      xaxis: [{
        x: S.transactionYear, strokeDashArray: 4, borderColor: '#9aa0a6',
        label: { text: S.transactionDateLabel || 'Transaction date', orientation: 'horizontal', offsetY: -6, borderColor: 'transparent', style: { background: 'transparent', color: '#808582', fontFamily: fontFamily, fontSize: '12px' } }
      }],
      points: [
        { x: S.fundEndYear, y: series.endpoints.hold, marker: { size: 0 }, label: pillLabel(series.endpoints.hold, S.legend[0].color) },
        { x: S.fundEndYear, y: series.endpoints.sell10, marker: { size: 0 }, label: pillLabel(series.endpoints.sell10, S.legend[1].color) },
        { x: S.fundEndYear, y: series.endpoints.sell25, marker: { size: 0 }, label: pillLabel(series.endpoints.sell25, S.legend[2].color) }
      ]
    }
  };
}

let marketSentimentChartInstance = null;

function renderMarketSentimentSlideAfterRender() {
  const play = msShouldPlay();
  if (play) marketSentimentPlayed = true;
  const mount = document.getElementById('marketSentimentChart');
  if (!mount || typeof ApexCharts === 'undefined') return;
  if (marketSentimentChartInstance) {
    try { marketSentimentChartInstance.destroy(); } catch (e) { /* already gone */ }
    marketSentimentChartInstance = null;
  }
  const cur = msComposeSlideData(msState.strategy, msState.vintageSegment);
  marketSentimentChartInstance = new ApexCharts(mount, msChartOptionsFor(cur.sellVsHold, play));
  marketSentimentChartInstance.render();

  const strategySelect = document.getElementById('msStrategySelect');
  const vintageSelect = document.getElementById('msVintageSelect');
  if (strategySelect) strategySelect.addEventListener('change', function () { msOnStrategyChange(this.value); });
  if (vintageSelect) vintageSelect.addEventListener('change', function () { msOnVintageChange(this.value); });
}

function msOnStrategyChange(newStrategy) {
  const newVintage = msPickVintage(newStrategy, msState.vintageSegment);
  msState = { strategy: newStrategy, vintageSegment: newVintage };
  const vintageSelect = document.getElementById('msVintageSelect');
  if (vintageSelect) vintageSelect.innerHTML = msVintageOptionsHtml(newStrategy, newVintage);
  msApplySelection();
}

function msOnVintageChange(newVintage) {
  msState = { strategy: msState.strategy, vintageSegment: newVintage };
  msApplySelection();
}

// Updates every dynamic number/position in place (not a full re-render)
// so css/styles.css's .msRangeFill/.msMarker `transition` rules and
// ApexCharts' own updateOptions() animation both get a chance to animate
// smoothly to the new cohort's values, instead of the view just jumping.
function msApplySelection() {
  const D = msComposeSlideData(msState.strategy, msState.vintageSegment);
  const P = D.pricing, S = D.sellVsHold;
  const barX0 = 68, barWidth = 832;
  const fillLeft = barX0 + (P.rangeLow - P.barScaleMin) / (P.barScaleMax - P.barScaleMin) * barWidth;
  const fillWidth = (P.rangeHigh - P.rangeLow) / (P.barScaleMax - P.barScaleMin) * barWidth;

  const rangeStat = document.getElementById('msRangeStat');
  if (rangeStat) rangeStat.textContent = P.rangeDisplay;
  const rangeFill = document.getElementById('msRangeFill');
  if (rangeFill) { rangeFill.style.left = fillLeft.toFixed(2) + 'px'; rangeFill.style.width = fillWidth.toFixed(2) + 'px'; }
  const netSale = document.getElementById('msNetSaleProceeds');
  if (netSale) netSale.textContent = 'Net Sale Proceeds:  $' + P.netSaleProceedsLow + P.netSaleProceedsUnit + ' – $' + P.netSaleProceedsHigh + P.netSaleProceedsUnit;
  const discountNote = document.getElementById('msDiscountNote');
  if (discountNote) discountNote.textContent = P.discountLow + '% – ' + P.discountHigh + '% discount to NAV';

  P.drivers.forEach(function (d, i) {
    const valueEl = document.getElementById('msDriverValue' + i);
    if (valueEl) valueEl.textContent = d.value;
    const tagEl = document.getElementById('msDriverTag' + i);
    if (tagEl) {
      const s = MS_TAG_STYLES[d.tagKey];
      tagEl.style.background = s.bg; tagEl.style.color = s.text; tagEl.textContent = s.label;
    }
    const barTotalWidth = d.segments.length * d.segmentWidth + (d.segments.length - 1) * MS_SEG_GAP;
    const markerX = MS_COL_X[d.column] + d.markerFraction * barTotalWidth - 9;
    const markerEl = document.getElementById('msDriverMarker' + i);
    if (markerEl) { markerEl.style.left = markerX.toFixed(2) + 'px'; markerEl.style.borderColor = MS_TAG_STYLES[d.tagKey].text; }
    d.segments.forEach(function (seg, j) {
      const segLabelEl = document.getElementById('msSeg' + i + '_' + j);
      if (!segLabelEl) return;
      const isActive = j === d.activeIndex;
      segLabelEl.style.color = isActive ? MS_TAG_STYLES[d.tagKey].text : '#808582';
      segLabelEl.style.fontWeight = isActive ? '600' : '400';
    });
  });

  S.filters.forEach(function (f, i) {
    const el = document.getElementById('msFilterValue' + i);
    if (el) el.textContent = f.value;
  });

  if (marketSentimentChartInstance) {
    marketSentimentChartInstance.updateOptions(msChartOptionsFor(S, false), true, true);
  }
}
