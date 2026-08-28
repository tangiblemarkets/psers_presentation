// Market Sentiment — hardcoded strategy + vintage combos from the source
// slides (js/slide-data/09-market-sentiment.data.js). Settings drawer
// picks a combo; the slide updates in place.

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

function msTagColorWord(tagKey) {
  return tagKey === 'favourable' ? 'green' : (tagKey === 'unfavourable' ? 'red' : 'yellow');
}

function msGetCohort(strategy, vintageKey) {
  const byStrat = MARKET_SENTIMENT_DATA.cohorts[strategy];
  return byStrat ? byStrat[vintageKey] : null;
}

function msAvailableVintageSegments(strategy) {
  const byStrat = MARKET_SENTIMENT_DATA.cohorts[strategy] || {};
  return Object.keys(byStrat).map(function (key) {
    return { key: key, label: key, n: 1 };
  });
}

function msPickVintage(strategy, preferredKey) {
  const avail = msAvailableVintageSegments(strategy);
  if (!avail.length) return MARKET_SENTIMENT_DATA.defaultVintageSegment;
  if (avail.some(function (v) { return v.key === preferredKey; })) return preferredKey;
  if (preferredKey === 'Pre-2016' && avail.some(function (v) { return v.key === 'Pre-2015'; })) return 'Pre-2015';
  if (preferredKey === 'Pre-2015' && avail.some(function (v) { return v.key === 'Pre-2016'; })) return 'Pre-2016';
  return avail[0].key;
}

function msBuildTaggedDriver(column, row, label, valueText, tagKey, bands, activeIndex, segmentWidth) {
  const segments = bands.map(function (b) { return { label: b.label, color: msTagColorWord(b.tagKey) }; });
  return {
    column: column, row: row, label: label, value: valueText, tagKey: tagKey,
    segmentWidth: segmentWidth, segments: segments, activeIndex: activeIndex,
    markerFraction: (activeIndex + 0.5) / segments.length
  };
}

function msBuildDrivers(c) {
  const D = MARKET_SENTIMENT_DATA;
  return [
    msBuildTaggedDriver('left', 0, 'Weighted Avg Vintage', String(c.vintageYear), c.vintageTag, D.vintageScale, c.vintageBand, 78),
    msBuildTaggedDriver('right', 0, 'Unfunded (%)', c.unfunded.toFixed(1) + '%', c.unfundedTag, D.unfundedBands, c.unfundedBand, 133),
    msBuildTaggedDriver('left', 1, 'DPI', c.dpi.toFixed(2) + 'x', c.dpiTag, D.dpiBands, c.dpiBand, 133),
    msBuildTaggedDriver('right', 1, 'TVPI', c.tvpi.toFixed(2) + 'x', c.tvpiTag, D.tvpiBands, c.tvpiBand, 133)
  ];
}

function msFormatProceeds(n) {
  return '$' + Number(n).toLocaleString('en-US') + 'M';
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

function msBuildSellVsHold(c) {
  const D = MARKET_SENTIMENT_DATA;
  const currentMultiple = c.tvpi;
  const expectedTVPI = c.expectedTVPI;
  const reinvestRate = D.reinvestRateDefault;
  const discountLow = c.discountLow / 100;
  const discountHigh = c.discountHigh / 100;
  const todayYear = D.todayYear;
  const transactionYear = todayYear + D.transactionLagYears;
  const fundEndYear = c.fundEndYear;
  const allVals = [currentMultiple, c.holdEnd, c.sellLowEnd, c.sellHighEnd];
  const rawMin = Math.min.apply(null, allVals);
  const rawMax = Math.max.apply(null, allVals);
  const pad = (rawMax - rawMin) * 0.08 || 0.05;
  const yAxisGridlines = msNiceAxis(rawMin - pad, rawMax + pad, 5);

  return Object.assign({}, D.sellVsHold, {
    todayYear: todayYear, transactionYear: transactionYear, fundEndYear: fundEndYear,
    currentMultiple: currentMultiple, expectedTVPI: expectedTVPI, reinvestRate: reinvestRate,
    discountLow: discountLow, discountHigh: discountHigh,
    holdEnd: c.holdEnd, sellLowEnd: c.sellLowEnd, sellHighEnd: c.sellHighEnd,
    yAxisGridlines: yAxisGridlines,
    legend: [
      Object.assign({}, D.sellVsHold.legend[0]),
      Object.assign({}, D.sellVsHold.legend[1], { label: 'Sell at ' + c.discountLow + '%' }),
      Object.assign({}, D.sellVsHold.legend[2], { label: 'Sell at ' + c.discountHigh + '%' })
    ],
    filters: [
      { label: 'Fund end date', value: String(fundEndYear) },
      { label: 'Expected TVPI', value: expectedTVPI.toFixed(2) + 'x' },
      { label: 'Reinvestment rate', value: (reinvestRate * 100).toFixed(1) + '% p.a.' },
      { label: 'Discount', value: c.discountLow + '% – ' + c.discountHigh + '%' }
    ]
  });
}

function msComposeSlideData(strategy, vintageKey) {
  const D = MARKET_SENTIMENT_DATA;
  const c = msGetCohort(strategy, vintageKey);
  if (!c) throw new Error('No hardcoded cohort for ' + strategy + ' / ' + vintageKey);
  const drivers = msBuildDrivers(c);
  const pricingBase = {
    rangeLow: c.rangeLow, rangeHigh: c.rangeHigh,
    rangeDisplay: c.rangeLow + ' – ' + c.rangeHigh + '%',
    netSaleProceedsLow: c.proceedsLow,
    netSaleProceedsHigh: c.proceedsHigh,
    discountLow: c.discountLow, discountHigh: c.discountHigh
  };
  return {
    strategy: strategy, vintageKey: vintageKey,
    subtitleText: (D.strategyDisplayLabels[strategy] || strategy) + ', ' + vintageKey,
    pricing: Object.assign({}, D.pricing, pricingBase, { drivers: drivers }),
    sellVsHold: msBuildSellVsHold(c)
  };
}

// ---- Dropdown state + wiring ----

let msState = { strategy: MARKET_SENTIMENT_DATA.defaultStrategy, vintageSegment: MARKET_SENTIMENT_DATA.defaultVintageSegment };

// If the configured default combo somehow has no data (e.g. a future
// workbook change), fall back to whatever real combination has the most
// underlying funds, rather than throwing on first render.
function msEnsureValidState() {
  if (msGetCohort(msState.strategy, msState.vintageSegment)) return;
  const s = MARKET_SENTIMENT_DATA.defaultStrategy;
  msState = { strategy: s, vintageSegment: msPickVintage(s, MARKET_SENTIMENT_DATA.defaultVintageSegment) };
}

function msSubtitleText() {
  const D = MARKET_SENTIMENT_DATA;
  return (D.strategyDisplayLabels[msState.strategy] || msState.strategy) + ', ' + msState.vintageSegment;
}

function msTitleBarHtml() {
  return '\n  <div id="msTitleBar" style="position:absolute;left:68px;top:136px;width:1700px;height:55px;display:flex;align-items:center;gap:16px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:500;font-size:44px;color:#104130;white-space:nowrap;">' +
    '<span>' + esc(MARKET_SENTIMENT_DATA.title) + '</span>' +
    '<button type="button" id="msSettingsBtn" class="sddSettingsBtn" title="Choose strategy and vintage" aria-label="Choose strategy and vintage">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.68 15a1.7 1.7 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.68a1.7 1.7 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.51 1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/></svg>' +
    '</button>' +
    '</div>';
}

function msSubtitleHtml() {
  return '\n  <div id="msSubtitle" class="fig-text" style="position:absolute;left:68px;top:196px;width:1550px;height:50px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:600;font-size:40px;line-height:50px;color:#787878;white-space:nowrap;">' + esc(msSubtitleText()) + '</div>';
}

function msPickRowHtml(label, on, kind, value) {
  return '<div class="dataRow sddStratPick' + (on ? ' is-on' : '') + '" data-ms-kind="' + kind + '" data-ms-value="' + escAttr(value) + '">' +
    '<div class="name"><b>' + esc(label) + '</b></div>' +
    '<div class="val">' + (on ? 'Current' : '') + '</div>' +
  '</div>';
}

function msSettingsBodyHtml() {
  const D = MARKET_SENTIMENT_DATA;
  const strat = D.strategies.map(function (s) {
    return msPickRowHtml(D.strategyDisplayLabels[s] || s, s === msState.strategy, 'strategy', s);
  }).join('');
  const vints = msAvailableVintageSegments(msState.strategy).map(function (v) {
    return msPickRowHtml(v.label, v.key === msState.vintageSegment, 'vintage', v.key);
  }).join('');
  return '<div class="sddStratList" id="msSettingsList">' +
    '<div class="sectionTitle">Strategy</div>' + strat +
    '<div class="sectionTitle msSettingsVintageHead">Vintage</div>' + vints +
  '</div>';
}

function msBindSettingsDrawer() {
  document.querySelectorAll('#msSettingsList .sddStratPick').forEach(function (el) {
    el.addEventListener('click', function () {
      const kind = el.getAttribute('data-ms-kind');
      const value = el.getAttribute('data-ms-value');
      if (kind === 'strategy') msOnStrategyChange(value);
      else msOnVintageChange(value);
      msRefreshSettingsDrawer();
    });
  });
}

function msRefreshSettingsDrawer() {
  const list = document.getElementById('msSettingsList');
  if (!list) return;
  list.parentNode.innerHTML = msSettingsBodyHtml();
  msBindSettingsDrawer();
}

function openMsSettingsDrawer() {
  openDrawer('Choose view', 'The slide updates when you pick one', msSettingsBodyHtml());
  msBindSettingsDrawer();
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
  '\n  <div id="msNetSaleProceeds" class="fig-text" data-fig-name="net-sale-proceeds" style="position:absolute;left:68.00px;top:516.00px;width:832.00px;height:23.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:500;font-style:normal;font-size:18.00px;line-height:22.68px;letter-spacing:0.00px;color:#1c1f21;text-align:left;white-space:pre;">Net Sale Proceeds:  ' + msFormatProceeds(P.netSaleProceedsLow) + ' – ' + msFormatProceeds(P.netSaleProceedsHigh) + '</div>' +
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
  msTitleBarHtml() +
  msSubtitleHtml() +
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
    hold: S.holdEnd != null ? S.holdEnd : S.expectedTVPI,
    sell10: S.sellLowEnd != null ? S.sellLowEnd : S.currentMultiple * (1 - S.discountLow) * Math.pow(1 + S.reinvestRate, S.fundEndYear - S.transactionYear),
    sell25: S.sellHighEnd != null ? S.sellHighEnd : S.currentMultiple * (1 - S.discountHigh) * Math.pow(1 + S.reinvestRate, S.fundEndYear - S.transactionYear)
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

  const btn = document.getElementById('msSettingsBtn');
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      openMsSettingsDrawer();
    });
  }
}

function msOnStrategyChange(newStrategy) {
  const newVintage = msPickVintage(newStrategy, msState.vintageSegment);
  msState = { strategy: newStrategy, vintageSegment: newVintage };
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

  const subtitle = document.getElementById('msSubtitle');
  if (subtitle) subtitle.textContent = D.subtitleText;

  const rangeStat = document.getElementById('msRangeStat');
  if (rangeStat) rangeStat.textContent = P.rangeDisplay;
  const rangeFill = document.getElementById('msRangeFill');
  if (rangeFill) { rangeFill.style.left = fillLeft.toFixed(2) + 'px'; rangeFill.style.width = fillWidth.toFixed(2) + 'px'; }
  const netSale = document.getElementById('msNetSaleProceeds');
  if (netSale) netSale.textContent = 'Net Sale Proceeds:  ' + msFormatProceeds(P.netSaleProceedsLow) + ' – ' + msFormatProceeds(P.netSaleProceedsHigh);
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
