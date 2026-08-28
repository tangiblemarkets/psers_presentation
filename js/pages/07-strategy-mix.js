// renderStrategyMixSlide() — Strategy Mix slide (slide 7).
//
// Round 24 rewrite: previously this whole slide (bars, table cells, and the
// "Share of NAV by Vintage" half-donut) was one giant literal template
// string with every number/position hand-pasted from the Figma export —
// correct at export time, but a nightmare to keep correct afterwards (the
// donut in particular was 5 hardcoded SVG <path> arcs whose `d` attributes
// are raw circle-geometry math; changing one vintage's % meant re-deriving
// all 5 arcs by hand). This version instead:
//   1. Reads every number/label/color from STRATEGY_MIX_DATA
//      (js/slide-data/07-strategy-mix.data.js, loaded before this file) —
//      edit that file and the slide picks it up automatically, including
//      row counts (add/remove a strategy or vintage row and spacing/bar
//      widths recompute).
//   2. Renders the half-donut with ApexCharts (vendored locally at
//      js/vendor/apexcharts.min.js — this deck runs offline via file://,
//      so a CDN <script src> would silently fail with no internet; SVG
//      output was the deciding factor over a canvas-based library like
//      Chart.js, since this deck's slides are scaled via CSS
//      transform:scale() (see syncSlideCanvasScale() in js/app.js) and a
//      canvas chart would visibly blur at large scale/projector size the
//      way the old vector SVG arcs never did).
// ApexCharts needs a real DOM node to mount into, which doesn't exist until
// this function's returned HTML has actually been inserted — that's what
// the new `afterRender` hook on HTML_SLIDES[7] (js/app.js) is for; see
// renderStrategyMixSlideAfterRender() below.
//
// Layout note: the strategy-row and vintage-row Y positions below are
// generated from a constant row height rather than the original's
// per-row hardcoded pixel values (which had ~1-2px of Figma-export jitter
// row to row). This is a deliberate, documented approximation — the
// generated positions land within ~1-2px of the original, invisible at
// normal viewing size — and is what makes row count actually data-driven
// (a hardcoded per-row position table wouldn't relayout if a row were
// added or removed).
let strategyMixChartInstance = null;
let strategyMixPlayed = false;

function smShouldPlay(){
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return !strategyMixPlayed && !reduce;
}

function renderStrategyMixSlide(){
  const D = computeStrategyMixData();
  const BOX_L = 56, BOX_W = 786;
  const STRAT_TOP = 220, STRAT_H = 356, STRAT_BOT = STRAT_TOP + STRAT_H;
  const VINT_TOP = STRAT_BOT + 16, VINT_H = 268, VINT_BOT = VINT_TOP + VINT_H;
  const RIGHT_X = 880, RIGHT_W = 972;

  // ---- "Share of NAV by Strategy" bars + table -------------------------
  const ROW0_TOP = 287, ROW_H = 48.75, BAR_MAX_PX = 200;
  const maxPct = Math.max(...D.strategies.map(s => s.pct));
  const strategyRows = D.strategies.map((s, i) => {
    const nameTop = ROW0_TOP + i * ROW_H;
    const barTop = nameTop + 5;
    const valTop = nameTop + 3;
    const barW = (s.pct / maxPct * BAR_MAX_PX).toFixed(2);
    const hotspotTop = nameTop - 8.5;
    return `
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:74.00px;top:${nameTop.toFixed(2)}px;width:170.00px;height:21.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:16.38px;line-height:20.64px;letter-spacing:0.00px;color:#1a1a1a;text-align:left;white-space:pre;">${esc(s.name)}</div>
  <div class="fig-box smBar" data-fig-name="r" style="--sm-i:${i};position:absolute;left:253.00px;top:${barTop.toFixed(2)}px;width:${barW}px;height:11.00px;background:${s.color};"></div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:501.00px;top:${valTop.toFixed(2)}px;width:104.00px;height:21.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:16.38px;line-height:20.64px;letter-spacing:0.00px;color:#1a1a1a;text-align:right;white-space:pre;">$${s.nav.toLocaleString()}M</div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:608.00px;top:${valTop.toFixed(2)}px;width:56.00px;height:20.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:15.52px;line-height:19.55px;letter-spacing:0.00px;color:#787878;text-align:right;white-space:pre;">${s.pct.toFixed(1)}%</div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:668.00px;top:${valTop.toFixed(2)}px;width:56.00px;height:21.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:16.38px;line-height:20.64px;letter-spacing:0.00px;color:#104130;text-align:right;white-space:pre;">${s.tvpi.toFixed(2)}x</div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:736.00px;top:${valTop.toFixed(2)}px;width:56.00px;height:21.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:16.38px;line-height:20.64px;letter-spacing:0.00px;color:#1c1f21;text-align:right;white-space:pre;">${s.dpi.toFixed(2)}x</div>
  <div class="fig-hotspot" data-action="mixStrategy" data-value="${escAttr(s.name)}" role="button" tabindex="0" title="${escAttr(s.name)}: open source metrics" style="position:absolute;left:74.00px;top:${hotspotTop.toFixed(2)}px;width:726.00px;height:49.00px;cursor:pointer;"></div>`;
  }).join('');

  // ---- "Share of NAV by Vintage" legend rows (chart itself is mounted
  // and drawn by renderStrategyMixSlideAfterRender() below) --------------
  const VROW0_TOP = 674.39, VROW_H = 31.89;
  const vintageRows = D.vintages.map((v, i) => {
    const textTop = VROW0_TOP + i * VROW_H;
    const dotTop = textTop - 1.88;
    return `
  <svg class="fig-arc" data-fig-name="Ellipse" style="position:absolute;left:392.61px;top:${dotTop.toFixed(2)}px;width:12.78px;height:13.13px;overflow:visible;" viewBox="0 0 12.781 13.130"><ellipse cx="6.390" cy="6.565" rx="6.390" ry="6.565" fill="${v.color}"/></svg>
  <div class="fig-text" data-fig-name="v" style="position:absolute;left:414.52px;top:${textTop.toFixed(2)}px;width:164.33px;height:18.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:14.00px;line-height:17.64px;letter-spacing:0.00px;color:#104130;text-align:left;white-space:pre;">${esc(v.label)}</div>
  <div class="fig-text" data-fig-name="v" style="position:absolute;left:520.00px;top:${textTop.toFixed(2)}px;width:82.16px;height:18.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:14.00px;line-height:17.64px;letter-spacing:0.00px;color:#1a1a1a;text-align:right;white-space:pre;">${v.pct.toFixed(1)}%</div>
  <div class="fig-text" data-fig-name="v" style="position:absolute;left:622.00px;top:${textTop.toFixed(2)}px;width:82.16px;height:18.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:14.00px;line-height:17.64px;letter-spacing:0.00px;color:#1a1a1a;text-align:right;white-space:pre;">${v.tvpi.toFixed(2)}x</div>
  <div class="fig-text" data-fig-name="v" style="position:absolute;left:706.00px;top:${textTop.toFixed(2)}px;width:82.16px;height:18.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:14.00px;line-height:17.64px;letter-spacing:0.00px;color:#1a1a1a;text-align:right;white-space:pre;">${v.dpi.toFixed(2)}x</div>
  <div class="fig-hotspot" data-action="vintageSegment" data-value="${escAttr(v.segmentKey)}" role="button" tabindex="0" title="${escAttr(v.label)}: open vintage detail" style="position:absolute;left:392.61px;top:${(textTop - 7).toFixed(2)}px;width:395.55px;height:${VROW_H.toFixed(2)}px;cursor:pointer;"></div>`;
  }).join('');

  // ---- The 4 commentary cards -------------------------------------------
  // Title 26 / subtitle 25 / body 16. Tight gap after the title, larger
  // gap before the body — same rhythm as the design.
  const SM_TITLE_H = 33, SM_LEAD_H = 60, SM_GAP_TITLE = 10, SM_GAP_BODY = 22;
  const commentaryCards = D.commentary.map((c, i) => {
    const titleTop = c.label.top;
    const leadTop = titleTop + SM_TITLE_H + SM_GAP_TITLE;
    const bodyTop = leadTop + SM_LEAD_H + SM_GAP_BODY;
    return `
  <div class="fig-text" data-fig-name="bx-label" style="position:absolute;left:${c.x.toFixed(2)}px;top:${titleTop.toFixed(2)}px;width:${c.width.toFixed(2)}px;height:${SM_TITLE_H}px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:26.00px;line-height:32.84px;letter-spacing:0.00px;color:#5E5E5E;text-align:left;white-space:pre;">${esc(c.label.text)}</div>
  <div class="fig-text" data-fig-name="bx-lead" style="position:absolute;left:${c.x.toFixed(2)}px;top:${leadTop.toFixed(2)}px;width:${c.width.toFixed(2)}px;height:${SM_LEAD_H}px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:25.00px;line-height:30.00px;letter-spacing:0.00px;color:#104130;text-align:left;white-space:pre-wrap;overflow-wrap:break-word;">${esc(c.lead.text)}</div>
  <div class="fig-text smBody" data-fig-name="bx-body" style="position:absolute;left:${c.x.toFixed(2)}px;top:${bodyTop.toFixed(2)}px;width:${c.width.toFixed(2)}px;height:${c.body.height.toFixed(2)}px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:16.00px;line-height:22.00px;letter-spacing:0.00px;color:#808582;text-align:left;white-space:pre-wrap;overflow-wrap:break-word;">${smEmphasize(c.body.text, i)}</div>`;
  }).join('');

  return `<div class="fig-slide ${smShouldPlay() ? 'smSlide sm-ready' : 'smSlide sm-static'}" style="position:relative;width:1920px;height:1080px;background:#ffffff;overflow:hidden;">
  <div class="smPanel" style="left:${BOX_L}px;top:${STRAT_TOP}px;width:${BOX_W}px;height:${STRAT_H}px;"></div>
  <div class="smPanel" style="left:${BOX_L}px;top:${VINT_TOP}px;width:${BOX_W}px;height:${VINT_H}px;"></div>
  <div class="smRule" style="left:${RIGHT_X}px;top:${STRAT_TOP}px;width:${RIGHT_W}px;"></div>
  <div class="smRule" style="left:${RIGHT_X}px;top:${STRAT_BOT}px;width:${RIGHT_W}px;"></div>
  <div class="smRule" style="left:${RIGHT_X}px;top:${VINT_BOT}px;width:${RIGHT_W}px;"></div>
  <div class="fig-text" data-fig-name="chrome-year" style="position:absolute;left:68.00px;top:64.00px;width:49.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#787878;text-align:left;white-space:pre;">2026</div>
  <div class="fig-box" data-fig-name="chrome-logo-box" style="position:absolute;left:1675.00px;top:58.00px;width:177.00px;height:44.00px;border:1px solid #0f0f0f;box-sizing:border-box;"></div>
  <div class="fig-text" data-fig-name="chrome-logo" style="position:absolute;left:1677.00px;top:69.00px;width:177.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:5.00px;color:#0f0f0f;text-align:center;white-space:pre;">TANGIBLE</div>
  <div class="fig-text" data-fig-name="chrome-footer" style="position:absolute;left:68.00px;top:982.00px;width:112.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">Confidential</div>
  <div class="fig-text" data-fig-name="chrome-page" style="position:absolute;left:1674.00px;top:982.00px;width:178.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:right;white-space:pre;">05</div>
  <div class="fig-text" data-fig-name="title" style="position:absolute;left:68.00px;top:136.00px;width:1550.00px;height:66.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:52.00px;line-height:65.52px;letter-spacing:0.00px;color:#104130;text-align:left;white-space:pre;">A balanced portfolio across strategies and vintages</div>
  <div class="fig-text" data-fig-name="t" data-action="portfolioSummary" role="button" tabindex="0" title="Open portfolio source data" style="position:absolute;left:74.00px;top:244.00px;width:300.00px;height:18.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:15.00px;line-height:17.24px;letter-spacing:1.03px;color:#787878;text-align:left;white-space:pre;cursor:pointer;">SHARE OF NAV BY STRATEGY</div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:501.00px;top:244.00px;width:104.00px;height:18.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:15.00px;line-height:18.00px;letter-spacing:0.00px;color:#787878;text-align:right;white-space:pre;">NAV</div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:608.00px;top:244.00px;width:56.00px;height:18.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:15.00px;line-height:18.00px;letter-spacing:0.00px;color:#787878;text-align:right;white-space:pre;">%</div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:668.00px;top:244.00px;width:56.00px;height:18.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:15.00px;line-height:18.00px;letter-spacing:0.00px;color:#787878;text-align:right;white-space:pre;">TVPI</div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:736.00px;top:244.00px;width:56.00px;height:18.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:15.00px;line-height:18.00px;letter-spacing:0.00px;color:#787878;text-align:right;white-space:pre;">DPI</div>
  <div class="fig-box" data-fig-name="tbl-head-rule" style="position:absolute;left:74.00px;top:270.00px;width:718.00px;height:1.00px;background:#dee4df;"></div>
  ${strategyRows}
  <div class="fig-box" data-fig-name="tbl-total-rule" style="position:absolute;left:74.00px;top:522.00px;width:718.00px;height:1.00px;background:#dee4df;"></div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:74.00px;top:534.00px;width:170.00px;height:21.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:16.38px;line-height:20.64px;letter-spacing:0.00px;color:#1a1a1a;text-align:left;white-space:pre;">Total NAV</div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:501.00px;top:537.00px;width:104.00px;height:21.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:16.38px;line-height:20.64px;letter-spacing:0.00px;color:#1a1a1a;text-align:right;white-space:pre;">$${D.totalNav.nav.toLocaleString()}M</div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:608.00px;top:537.00px;width:56.00px;height:20.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:15.52px;line-height:19.55px;letter-spacing:0.00px;color:#787878;text-align:right;white-space:pre;">${D.totalNav.pct}%</div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:668.00px;top:537.00px;width:56.00px;height:21.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:16.38px;line-height:20.64px;letter-spacing:0.00px;color:#104130;text-align:right;white-space:pre;">${D.totalNav.tvpi.toFixed(2)}x</div>
  <div class="fig-text" data-fig-name="t" style="position:absolute;left:736.00px;top:537.00px;width:56.00px;height:21.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:16.38px;line-height:20.64px;letter-spacing:0.00px;color:#1c1f21;text-align:right;white-space:pre;">${D.totalNav.dpi.toFixed(2)}x</div>
  <div class="fig-hotspot" data-action="portfolioSummary" role="button" tabindex="0" title="Total NAV: open portfolio source data" style="position:absolute;left:74.00px;top:526.00px;width:726.00px;height:40.00px;cursor:pointer;"></div>
  ${commentaryCards}
  <div class="fig-text smVintageTitle" data-fig-name="SHARE OF NAV BY VINTAGE" data-action="vintageView" role="button" tabindex="0" title="Open vintage profile (all vintages)" aria-label="Open vintage profile (all vintages)" style="position:absolute;left:74.00px;top:635.00px;width:227.32px;height:19.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:15.00px;line-height:18.90px;letter-spacing:0.00px;color:#787878;text-align:left;white-space:pre;cursor:pointer;">SHARE OF NAV BY VINTAGE</div>
  <div id="strategyMixDonut" class="smDonut" style="position:absolute;left:74.00px;top:660.00px;width:280.00px;height:150.00px;overflow:hidden;"></div>
  <div class="fig-text smDonutLabel" data-fig-name="Top 5 GPs" style="position:absolute;left:136.99px;top:770.32px;width:164.33px;height:23.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:18.00px;line-height:22.68px;letter-spacing:0.00px;color:#787878;text-align:center;white-space:pre;pointer-events:none;">${esc(D.topGPs.label)}</div>
  <div class="fig-text smDonutLabel" data-fig-name="topGPsValue" style="position:absolute;left:136.99px;top:794.83px;width:164.33px;height:28.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-style:normal;font-size:22.00px;line-height:27.72px;letter-spacing:0.00px;color:#104130;text-align:center;white-space:pre;pointer-events:none;">${esc(D.topGPs.value)}</div>
  <div class="fig-text" data-fig-name="VINTAGE" style="position:absolute;left:392.61px;top:636.88px;width:88.55px;height:16.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:13.00px;line-height:16.38px;letter-spacing:0.00px;color:#787878;text-align:left;white-space:pre;">VINTAGE</div>
  <div class="fig-text" data-fig-name="% NAV" style="position:absolute;left:520.00px;top:635.00px;width:82.16px;height:16.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:13.00px;line-height:16.38px;letter-spacing:0.00px;color:#787878;text-align:right;white-space:pre;">% NAV</div>
  <div class="fig-text" data-fig-name="TVPI" style="position:absolute;left:622.00px;top:636.88px;width:82.16px;height:16.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:13.00px;line-height:16.38px;letter-spacing:0.00px;color:#787878;text-align:right;white-space:pre;">TVPI</div>
  <div class="fig-text" data-fig-name="DPI" style="position:absolute;left:706.00px;top:636.88px;width:82.16px;height:16.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:13.00px;line-height:16.38px;letter-spacing:0.00px;color:#787878;text-align:right;white-space:pre;">DPI</div>
  <div class="fig-box" data-fig-name="Rectangle" style="position:absolute;left:392.61px;top:660.32px;width:395.55px;height:0.94px;background:#dee4df;"></div>
  ${vintageRows}
  <div class="fig-hotspot" data-action="portfolioSummary" role="button" tabindex="0" title="Open strategy commentary lens" style="position:absolute;left:866.00px;top:${STRAT_TOP}px;width:1000.00px;height:${VINT_BOT - STRAT_TOP}px;cursor:pointer;"></div>
</div>`;
}

// Mounts the real (ApexCharts) half-donut into #strategyMixDonut, driven by
// STRATEGY_MIX_DATA.vintages. Run by showSlide() (js/app.js) right after
// renderStrategyMixSlide()'s HTML is inserted into the page — see the
// `afterRender` field on HTML_SLIDES[7].
//
// Why the donut only occupies the *top* half of its mount div: ApexCharts'
// startAngle:-90/endAngle:90 draws a genuine semi-donut, but still lays it
// out inside a full circular chart area — the bottom half of that area is
// blank space. The mount div is deliberately shorter than the chart's
// rendered height and clips with `overflow:hidden` (set in the markup
// above) so only the drawn semicircle shows, matching how the old
// hand-drawn SVG arcs only ever painted the top half of their bounding box.
//
// Interactivity: clicking a wedge fires 'vintageSegment' (see runAction()
// in js/app.js) which opens that vintage's data lens directly — a
// per-segment drill-down the old static arcs never had, since they weren't
// backed by real chart data to begin with. The legend rows below the chart
// each carry their own matching per-row hotspot (in the vintageRows loop
// above), same 'vintageSegment' action and the same `.fig-hotspot` class
// the strategy table above uses — so hovering/clicking a legend row now
// behaves identically to hovering/clicking its wedge, and the hover style
// is consistent between the two tables on this slide. This replaced the
// original single whole-region "vintageView" hotspot, which (a) highlighted
// the entire section as one block on hover instead of per-row like the
// strategy table, and (b) sat on top of the chart's mount div and would
// have swallowed clicks meant for individual wedges.
function renderStrategyMixSlideAfterRender(){
  const mount = document.getElementById('strategyMixDonut');
  if (!mount || typeof ApexCharts === 'undefined') return;
  if (strategyMixChartInstance) {
    try { strategyMixChartInstance.destroy(); } catch (e) { /* already gone */ }
    strategyMixChartInstance = null;
  }
  const D = computeStrategyMixData();
  const vintages = D.vintages;
  strategyMixChartInstance = new ApexCharts(mount, {
    chart: {
      type: 'donut',
      width: 280,
      height: 280,
      background: 'transparent',
      animations: { enabled: false },
      selection: { enabled: false },
      events: {
        dataPointSelection: function(event, chartContext, config) {
          const v = vintages[config.dataPointIndex];
          if (v) runAction({ action: 'vintageSegment', value: v.segmentKey });
        },
        // ApexCharts' own tooltip element renders *inside* this chart's
        // mount div, which needs `overflow:hidden` to crop the donut's
        // blank bottom half (a real, fully opaque white rectangle ApexCharts
        // draws behind the whole circle, not just empty space — removing
        // the clip would paint over the vintage legend rows below). That
        // clip cut the tooltip off too whenever it tried to render near the
        // mount's edge. Fixed by disabling ApexCharts' tooltip entirely
        // (`tooltip.enabled:false` below) and driving a dedicated `#donutTip`
        // element (index.html) instead. `#donutTip` is `position:fixed`
        // at the document root, outside any of this slide's clipped/
        // transformed ancestors, so it can never be cut off.
        dataPointMouseEnter: function(event, chartContext, config) {
          const v = vintages[config.dataPointIndex];
          if (!v) return;
          const tip = document.getElementById('donutTip');
          tip.innerHTML = '<b>' + v.label + '</b><br>' + v.pct.toFixed(1) + '% of NAV &middot; ' + v.tvpi.toFixed(2) + 'x TVPI';
          tip.style.left = (event.clientX + 12) + 'px';
          tip.style.top = (event.clientY + 12) + 'px';
          tip.style.display = 'block';
        },
        dataPointMouseLeave: function() {
          const tip = document.getElementById('donutTip');
          if (tip) tip.style.display = 'none';
        }
      }
    },
    series: vintages.map(v => v.pct),
    labels: vintages.map(v => v.label),
    colors: vintages.map(v => v.color),
    stroke: { width: 0 },
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
    states: {
      hover: { filter: { type: 'darken', value: 0.92 } },
      active: { filter: { type: 'darken', value: 0.85 } }
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        offsetY: 10,
        donut: {
          // The "Top 5 GPs" / value center callout is drawn as its own pair
          // of absolutely-positioned overlay <div>s in
          // renderStrategyMixSlide() above (not this library's built-in
          // donut total label) — that gave pixel-exact, version-stable
          // control over the exact typography this brand needs, rather than
          // fighting ApexCharts' own total-label rendering, which didn't
          // actually paint anything in this ApexCharts version.
          size: '68%',
          labels: { show: false }
        }
      }
    }
  });
  const play = smShouldPlay();
  if (play) strategyMixPlayed = true;
  const shown = strategyMixChartInstance.render();
  const reveal = () => { if (mount && play) mount.classList.add('smDonut-in'); };
  if (play) {
    if (shown && typeof shown.then === 'function') shown.then(reveal).catch(reveal);
    else reveal();
  }
}

const SM_EMPHASIS = [
  ['visibility and expected timing on exits'],
  ['more specialised buyer'],
  ['depend on underlying loans'],
  ['manager by manager, asset by asset']
];

function smEmphasize(text, i){
  let out = esc(text);
  (SM_EMPHASIS[i] || []).forEach(phrase => {
    out = out.replace(esc(phrase), '<b>' + esc(phrase) + '</b>');
  });
  return out;
}
