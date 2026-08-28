// js/pages/08-manager-concentration.js — "Diversified manager base with
// limited concentration" slide (Round 49), inserted right after Strategy
// Mix per the user's request.
//
// Two "real component" requirements, learned the hard way two rounds ago
// on the Market Sentiment slide (js/pages/09-market-sentiment.js's header
// comment + project memory psers_v7_round42_market_sentiment.md tell the
// full story: "thats bunch of svg... i wanted to create this chart as a
// component... interactive... tooltips"):
//
// LEFT — "NAV by DPI segment" bubble chart. The Figma export's own pixel
// geometry (figma-export/slide.json) shows this is NOT one continuous DPI
// x-axis: it's 3 equal-pixel-width panels (~318-319px each), each
// independently linearly scaled to its own DPI sub-range (0-0.25x /
// 0.25x-0.75x / 0.75x-2.5x+), which is why the tick spacing visibly
// compresses from left to right — a deliberate small-multiples design so
// the 17/25/62-manager distribution stays legible even though segment 3's
// DPI range is ~7x wider than segment 1's. That's reproduced here as 3
// SEPARATE ApexCharts bubble-chart instances (mcChartInstances[0..2]),
// each with its OWN real axes/gridlines/tooltip — sharing an identical
// logarithmic NAV y-axis (same min/max/tickAmount) so the gridlines land
// on the same rows across all 3; only the leftmost panel shows y-axis
// tick labels (the other two still draw real gridlines, just without a
// second copy of the label text). Every panel has 2 real series ("Other
// managers" light green, "Top 6 by NAV" dark green with a numbered data
// label) and a per-point custom tooltip showing that manager's own
// name/NAV/DPI/TVPI — nothing here is a positioned div standing in for a
// chart or its tooltip.
//
// Known simplification: bubble RADIUS is sized by ApexCharts' own
// z-normalization (z = sqrt(NAV), matching the diameter-vs-sqrt(NAV)
// relationship measured off the Figma export's 103 ellipses), computed
// independently per chart instance. NAV (y-position, exact) and DPI
// (x-position/segment, exact) are always correct; only the bubble-size
// *comparison across the 3 panels* is an approximation, since 3 separate
// chart instances don't share one global size scale. Documented in
// project memory psers_v7_round43_manager_concentration.md.
//
// RIGHT — "Manager Concentration" table, sortable by clicking any header
// (MANAGER/NAV/% OF NAV/DPI/TVPI). Only the top 10 rows reorder.
// "Remaining N managers" and "Total" stay pinned at the bottom.
//
// Both panels read MANAGER_CONCENTRATION_DATA (js/slide-data/08-manager-
// concentration.data.js), computed live from every CFG.rows interest.
//
// Click-to-drill-down: top-10 table rows, bubbles, and the 6 numbered
// legend items open that manager via openManager(). Remaining / Total
// open openDataLens() grouped by manager (same as Strategy Deep Dive).
//
// Bubble clicks do NOT use ApexCharts' own markerClick event: this chart
// deliberately sets tooltip:{enabled:false} (Round 89/90, "no Apex
// tooltip" — the custom #donutTip below replaces it), and markerClick's
// internal wiring runs through ApexCharts' own Tooltip module, so with
// the native tooltip disabled it silently never fires — confirmed by a
// live Playwright click test before settling on this approach. Instead,
// dataPointMouseEnter/Leave (which #donutTip already depends on, and are
// proven to fire independently of the tooltip module) record "the point
// currently under the pointer" into mcHoverPoint[i]; a plain native
// click listener on each panel's own mount div acts on that point. See
// mcHoverPoint's own comment above renderManagerConcentrationSlideAfter-
// Render() if this needs revisiting.

function mcEsc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

// Matches the Figma mockup's own table/legend number format: always
// whole millions with a thousands separator (e.g. "$2,086M"), never
// switching to a "B" suffix above $1bn — unlike mcFormatUSDShort() below,
// which is for the chart's own log-scale axis tick labels and DOES need
// the K/M/B suffix ladder.
function mcFormatUSD(nav) {
  return '$' + Math.round(nav / 1e6).toLocaleString('en-US') + 'M';
}

// Tick-label formatter for the chart's own y-axis — only ever called at
// (approximately) exact powers of ten, so it can be simpler than
// mcFormatUSD's general-purpose rounding.
function mcFormatUSDShort(v) {
  if (v >= 1e9) return '$' + Math.round(v / 1e9) + 'B';
  if (v >= 1e6) return '$' + Math.round(v / 1e6) + 'M';
  if (v >= 1e3) return '$' + Math.round(v / 1e3) + 'K';
  return '$' + Math.round(v);
}

const MC_BAR_MAX_PX = 120;

const MC_COLS = [
  { key: 'manager', label: 'MANAGER CONCENTRATION', type: 'str', align: 'left',  width: 332 },
  { key: 'nav',     label: 'NAV',      type: 'num', align: 'right', width: 120 },
  { key: 'pct',     label: '% OF NAV', type: 'num', align: 'right', width: 89 },
  { key: 'dpi',     label: 'DPI',      type: 'num', align: 'right', width: 88 },
  { key: 'tvpi',    label: 'TVPI',     type: 'num', align: 'right', width: 89 }
];

let mcSortKey = null;
let mcSortDir = null;
let mcPlayed = false;
function mcShouldPlay(){
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return !mcPlayed && !reduce;
}

function mcBarMaxNav() {
  const D = MANAGER_CONCENTRATION_DATA;
  return Math.max(D.top10[0].nav, D.remaining.nav);
}

function mcSortedRows() {
  const D = MANAGER_CONCENTRATION_DATA;
  const dir = mcSortDir === 'asc' ? 1 : -1;
  const rows = D.top10.map(m => ({
    manager: m.manager, displayName: m.displayName,
    nav: m.nav, pct: m.pct, dpi: m.dpi, tvpi: m.tvpi, isRemaining: false
  }));
  if (mcSortKey) {
    rows.sort((a, b) => {
      if (mcSortKey === 'manager') return a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }) * dir;
      return (a[mcSortKey] - b[mcSortKey]) * dir;
    });
  }
  rows.push({
    manager: D.remaining.label, displayName: D.remaining.label,
    nav: D.remaining.nav, pct: D.remaining.pct, dpi: D.remaining.dpi,
    tvpi: D.remaining.tvpi, isRemaining: true
  });
  return rows;
}

function mcRowHtml(m, i) {
  const barW = (m.nav / mcBarMaxNav() * MC_BAR_MAX_PX).toFixed(1);
  // Every top-10 row is a single real manager (never true for the pinned
  // Remaining/Total rows below), so only those get data-manager + the
  // clickable-row treatment — clicking opens the same openManager()
  // drawer every other manager reference in the deck opens (Round 91).
  const cls = m.isRemaining ? 'mcRemainingRow mcClickableRow' : 'mcClickableRow';
  const attr = m.isRemaining ? ' data-mc-lens="remaining"' : ` data-manager="${escAttr(m.manager)}"`;
  return `<tr class="${cls}"${attr}>
    <td><div class="mc-namecell"><div class="mc-name">${mcEsc(m.displayName)}</div><div class="mc-bar" style="width:${barW}px;--mc-bar-i:${i};"></div></div></td>
    <td class="mc-green">${mcFormatUSD(m.nav)}</td>
    <td class="mc-muted">${m.pct.toFixed(1)}%</td>
    <td>${m.dpi.toFixed(2)}x</td>
    <td>${m.tvpi.toFixed(2)}x</td>
  </tr>`;
}

function mcTotalRowHtml() {
  const t = MANAGER_CONCENTRATION_DATA.total;
  return `<tr class="mcTotalRow mcClickableRow" data-mc-lens="total">
    <td>${mcEsc(t.label)}</td>
    <td class="mc-green">${mcFormatUSD(t.nav)}</td>
    <td>${t.pct.toFixed(1)}%</td>
    <td>${t.dpi.toFixed(2)}x</td>
    <td>${t.tvpi.toFixed(2)}x</td>
  </tr>`;
}

function mcRenderTbody() {
  return mcSortedRows().map((m, i) => mcRowHtml(m, i)).join('') + mcTotalRowHtml();
}

function mcRenderHeadArrows() {
  const head = document.getElementById('mcHeadRow');
  if (!head) return;
  head.querySelectorAll('th[data-key]').forEach(th => {
    const isSorted = th.getAttribute('data-key') === mcSortKey;
    th.classList.toggle('is-sorted', isSorted);
    th.classList.toggle('dir-desc', isSorted && mcSortDir === 'desc');
  });
}

function bindManagerConcentrationSort() {
  const head = document.getElementById('mcHeadRow');
  const tbody = document.getElementById('mcTbody');
  if (!head || !tbody || head.dataset.boundSort) return;
  head.dataset.boundSort = '1';
  mcRenderHeadArrows();
  head.querySelectorAll('th[data-key]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-key');
      const col = MC_COLS.find(c => c.key === key);
      if (key === mcSortKey) {
        mcSortDir = mcSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        mcSortKey = key;
        mcSortDir = col.type === 'num' ? 'desc' : 'asc';
      }
      tbody.innerHTML = mcRenderTbody();
      mcRenderHeadArrows();
    });
  });
}

function mcSlideRows() {
  return CFG.rows.slice();
}

function mcOpenTotal() {
  const D = MANAGER_CONCENTRATION_DATA;
  const arr = mcSlideRows();
  if (!arr.length) return;
  openDataLens('All managers', t('lens.includedMgrs', { n: arr.length, mgrs: D.total.count }), arr, { intro: t('lens.introStrategy') });
}

function mcOpenRemaining() {
  const D = MANAGER_CONCENTRATION_DATA;
  const top = {};
  D.top10.forEach(m => { top[m.manager] = 1; });
  const arr = mcSlideRows().filter(d => !top[d.manager]);
  if (!arr.length) return;
  openDataLens(D.remaining.label, t('lens.includedMgrs', { n: arr.length, mgrs: D.remaining.count }), arr, { intro: t('lens.introStrategy') });
}

function mcOpenSegment(i) {
  const seg = MANAGER_CONCENTRATION_DATA.segments[i];
  if (!seg) return;
  const names = {};
  seg.points.forEach(function (m) { names[m.manager] = 1; });
  const arr = CFG.rows.filter(function (d) { return names[d.manager]; });
  if (!arr.length) return;
  openDataLens(seg.label, t('lens.includedMgrs', { n: arr.length, mgrs: seg.count }), arr, { intro: t('lens.introStrategy') });
}

function bindManagerConcentrationRows() {
  const tbody = document.getElementById('mcTbody');
  if (!tbody || tbody.dataset.boundRowClick) return;
  tbody.dataset.boundRowClick = '1';
  tbody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (!row || !tbody.contains(row)) return;
    if (row.dataset.manager) {
      openManager(row.dataset.manager);
      return;
    }
    const lens = row.getAttribute('data-mc-lens');
    if (lens === 'remaining') mcOpenRemaining();
    else if (lens === 'total') mcOpenTotal();
  });
}

function bindManagerConcentrationSegments() {
  document.querySelectorAll('[data-mc-segment]').forEach(function (el) {
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      mcOpenSegment(Number(el.getAttribute('data-mc-segment')));
    });
  });
}

function bindManagerConcentrationLegend() {
  const legend = document.querySelector('.mcLegend');
  if (!legend || legend.dataset.boundClick) return;
  legend.dataset.boundClick = '1';
  legend.addEventListener('click', (e) => {
    const item = e.target.closest('[data-manager]');
    if (!item) return;
    openManager(item.dataset.manager);
  });
}

// ---- Left chart layout constants (see header comment for the 3-panel
// small-multiples rationale) --------------------------------------------
const MC_PANEL_TOP = 306;
const MC_PANEL_HEIGHT = 412;
const MC_PANEL_DEFS = [
  { left: 45,  width: 400, plotLeft: 99.5,  plotWidth: 319 },
  { left: 461, width: 300, plotLeft: 418.5, plotWidth: 318 },
  { left: 777, width: 320, plotLeft: 736.5, plotWidth: 319 }
];

function mcRenderSegmentCaptions() {
  const D = MANAGER_CONCENTRATION_DATA;
  return D.segments.map((seg, i) => {
    const p = MC_PANEL_DEFS[i];
    return `
  <div class="fig-text mcSegClick" data-mc-segment="${i}" style="position:absolute;left:${p.plotLeft}px;top:264px;width:${p.plotWidth}px;height:23px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:18px;color:#104130;text-align:center;white-space:nowrap;">${seg.count} GPs</div>
  <div class="fig-text mcSegClick" data-mc-segment="${i}" style="position:absolute;left:${p.plotLeft}px;top:289px;width:${p.plotWidth}px;height:13px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-size:10px;color:#1a1a1a;text-align:center;white-space:nowrap;">${seg.pct.toFixed(1)}% of NAV - ${mcFormatUSD(seg.nav)}</div>
  <div class="fig-text mcSegClick" data-mc-segment="${i}" style="position:absolute;left:${p.plotLeft}px;top:738px;width:${p.plotWidth}px;height:16px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:13px;color:#104130;text-align:center;white-space:nowrap;">${seg.label}</div>`;
  }).join('');
}

function mcRenderPanelDividers() {
  return `
  <div class="fig-box" style="position:absolute;left:453px;top:${MC_PANEL_TOP}px;width:1px;height:${MC_PANEL_HEIGHT}px;background:#dee4df;"></div>
  <div class="fig-box" style="position:absolute;left:769px;top:${MC_PANEL_TOP}px;width:1px;height:${MC_PANEL_HEIGHT}px;background:#dee4df;"></div>`;
}

function mcRenderChartMounts() {
  return MC_PANEL_DEFS.map((p, i) =>
    `\n  <div id="mcChart${i}" class="mcChartPanel" style="position:absolute;left:${p.left}px;top:${MC_PANEL_TOP}px;width:${p.width}px;height:${MC_PANEL_HEIGHT}px;"></div>`
  ).join('');
}

const MC_LEGEND_NAMES = {
  'Stockbridge Capital Group LLC': 'Stockbridge Capital Group',
  'Blackstone Inc': 'Blackstone',
  'Sixth Street Advisors LLC': 'Sixth Street Advisors',
  'Brookfield Asset Management': 'Brookfield Asset Management',
  'Bain Capital LLC': 'Bain Capital',
  'Park Square Capital LLP': 'Park Square'
};

function mcRenderLegend() {
  const items = MANAGER_CONCENTRATION_DATA.highlighted.map(m => {
    const name = MC_LEGEND_NAMES[m.manager] || m.displayName;
    return `<div class="mcLegendItem" data-manager="${escAttr(m.manager)}"><span class="mcLegendBadge">${m.rank}</span><span class="mcLegendText">${mcEsc(name)} (${mcFormatUSD(m.nav)} / ${m.pct.toFixed(1)}% of NAV)</span></div>`;
  }).join('');
  return `<div class="mcLegend">${items}</div>`;
}

function mcRenderCallouts() {
  const C = MANAGER_CONCENTRATION_CALLOUTS;
  const rows = [
    { top: 705.34, value: C.stat1Value, valueW: 93,  label: C.stat1Label, labelW: 162, labelTop: 705.34, detail: C.stat1Detail, detailTop: 705.34, detailW: 466, detailH: 76 },
    { top: 805.34, value: C.stat2Value, valueW: 97,  label: C.stat2Label, labelW: 136, labelTop: 809.34, detail: C.note1,       detailTop: 809,    detailW: 445, detailH: 38 },
    { top: 883.34, value: C.stat3Value, valueW: 52,  label: C.stat3Label, labelW: 130, labelTop: 884.34, detail: C.note2,       detailTop: 883.34, detailW: 455, detailH: 38 }
  ];
  return rows.map(r => `
  <div class="fig-text" style="position:absolute;left:1116.96px;top:${r.top}px;width:100px;height:38px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:30.46px;color:#104130;white-space:nowrap;text-align:center;">${r.value}</div>
  <div class="fig-text" style="position:absolute;left:1222.96px;top:${r.labelTop}px;width:${r.labelW}px;height:36px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:14.33px;line-height:18px;color:#104130;">${r.label}</div>
  <div class="fig-text" style="position:absolute;left:1387.96px;top:${r.detailTop}px;width:${r.detailW}px;height:${r.detailH}px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-size:15.23px;line-height:19px;color:#1a1a1a;white-space:pre-wrap;">${mcEsc(r.detail)}</div>`).join('');
}

function renderManagerConcentrationSlide() {
  const D = MANAGER_CONCENTRATION_DATA;
  const headHtml = MC_COLS.map(col =>
    `<th data-key="${col.key}" style="width:${col.width}px;text-align:${col.align};">${col.label}<span class="mc-arrow" aria-hidden="true"></span></th>`
  ).join('');
  const footnote = `* Portfolio sizes on the vertical axis are plotted on a logarithmic scale, meaning each horizontal gridline represents a tenfold increase in NAV ($100K, $1M, $10M, etc.).`;

  return `<div class="fig-slide" style="position:relative;width:1920px;height:1080px;background:#ffffff;overflow:hidden;">
  <div class="fig-text" data-fig-name="chrome-year" style="position:absolute;left:68.00px;top:64.00px;width:49.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#787878;text-align:left;white-space:pre;">2026</div>
  <div class="fig-box" data-fig-name="chrome-logo-box" style="position:absolute;left:1675.00px;top:58.00px;width:177.00px;height:44.00px;border:1px solid #0f0f0f;box-sizing:border-box;"></div>
  <div class="fig-text" data-fig-name="chrome-logo" style="position:absolute;left:1677.00px;top:69.00px;width:177.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:5.00px;color:#0f0f0f;text-align:center;white-space:pre;">TANGIBLE</div>
  <div class="fig-text" data-fig-name="chrome-footer" style="position:absolute;left:68.00px;top:982.00px;width:112.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">Confidential</div>
  <div class="fig-text" data-fig-name="chrome-page" style="position:absolute;left:1674.00px;top:982.00px;width:178.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:right;white-space:pre;">06</div>
  <div class="fig-text" data-fig-name="chrome-footer-note" style="position:absolute;left:219.00px;top:982.00px;width:1052.00px;height:46.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:14.00px;line-height:17.64px;letter-spacing:0.00px;color:#a0a0a0;text-align:left;white-space:pre-wrap;">${footnote}</div>
  <div class="fig-text" data-fig-name="title" style="position:absolute;left:68.00px;top:136.00px;width:1287.00px;height:66.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:52.00px;line-height:65.52px;letter-spacing:0.00px;color:#104130;text-align:left;white-space:pre;">Diversified manager base with limited concentration</div>
  <div class="fig-text" style="position:absolute;left:65.17px;top:229px;width:500px;height:18px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:12.98px;color:#787878;white-space:nowrap;">NAV BY DPI SEGMENT: ONE DOT PER MANAGER (N=${D.totalGpCount})</div>
  <div class="fig-text" style="position:absolute;left:53.87px;top:291.19px;width:80px;height:13px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:9.92px;color:#787878;white-space:nowrap;">NAV (log)</div>
  ${mcRenderSegmentCaptions()}
  ${mcRenderPanelDividers()}
  ${mcRenderChartMounts()}
  ${mcRenderLegend()}
  ${mcRenderCallouts()}
  <div class="mcWrap" style="position:absolute;left:1100px;top:236px;width:752px;">
    <table class="mcTable" id="mcHeadTable">
      <colgroup>${MC_COLS.map(c => `<col style="width:${c.width}px;">`).join('')}</colgroup>
      <thead><tr id="mcHeadRow">${headHtml}</tr></thead>
      <tbody id="mcTbody"${mcShouldPlay() ? ' class="mcTbody-play"' : ''}>${mcRenderTbody()}</tbody>
    </table>
  </div>
</div>`;
}

let mcChartInstances = [];
// mcHoverPoint[i] — the data point (if any) currently under the pointer in
// panel i, kept in sync by dataPointMouseEnter/Leave below. See the click-
// to-drill-down comment above renderManagerConcentrationSlideAfterRender().
let mcHoverPoint = [null, null, null];

function renderManagerConcentrationSlideAfterRender() {
  if (mcShouldPlay()) mcPlayed = true;
  mcChartInstances.forEach(inst => { try { inst.destroy(); } catch (e) { /* already gone */ } });
  mcChartInstances = [];
  if (typeof ApexCharts === 'undefined') return;

  const D = MANAGER_CONCENTRATION_DATA;
  const fontFamily = "'Plus Jakarta Sans', sans-serif";
  const yMin = 1e5, yMax = 1e10, yTickAmount = 5;
  const highlightRank = {};
  D.highlighted.forEach(m => { highlightRank[m.manager] = m.rank; });

  function seriesFor(points) {
    const other = [], top = [];
    points.forEach(p => {
      const rank = highlightRank[p.manager] || null;
      const point = {
        x: Number(p.dpi.toFixed(4)),
        y: Math.round(p.nav),
        z: Math.sqrt(p.nav),
        manager: p.manager,
        displayName: p.displayName,
        navLabel: mcFormatUSD(p.nav),
        dpiLabel: p.dpi.toFixed(2) + 'x',
        tvpiLabel: p.tvpi.toFixed(2) + 'x',
        rank: rank
      };
      (rank ? top : other).push(point);
    });
    return [
      { name: 'Other managers', data: other },
      { name: 'Top 6 by NAV', data: top }
    ];
  }

  MC_PANEL_DEFS.forEach((panelDef, i) => {
    const mount = document.getElementById('mcChart' + i);
    if (!mount) return;
    const seg = D.segments[i];
    const isFirst = i === 0;

    const inst = new ApexCharts(mount, {
      chart: {
        type: 'bubble',
        width: panelDef.width,
        height: MC_PANEL_HEIGHT,
        fontFamily: fontFamily,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, easing: 'easeinout', speed: 400 },
        events: {
          dataPointMouseEnter: function(event, chartContext, config) {
            const series = chartContext.w.config.series[config.seriesIndex];
            const p = series && series.data[config.dataPointIndex];
            mcHoverPoint[i] = p || null;
            const tip = document.getElementById('donutTip');
            if (!p || !tip) return;
            tip.innerHTML = '<b>' + mcEsc(p.displayName) + '</b><br>NAV: ' + p.navLabel + '<br>DPI: ' + p.dpiLabel + '<br>TVPI: ' + p.tvpiLabel;
            tip.style.left = (event.clientX + 12) + 'px';
            tip.style.top = (event.clientY + 12) + 'px';
            tip.style.display = 'block';
          },
          dataPointMouseLeave: function() {
            mcHoverPoint[i] = null;
            const tip = document.getElementById('donutTip');
            if (tip) tip.style.display = 'none';
          }
        }
      },
      series: seriesFor(seg.points),
      colors: ['#a7dcc2', '#104130'],
      fill: { opacity: [0.85, 0.95] },
      stroke: { width: 0 },
      dataLabels: {
        enabled: true,
        textAnchor: 'middle',
        offsetX: 0,
        offsetY: 1,
        formatter: function (val, opts) {
          if (opts.seriesIndex !== 1) return '';
          const p = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex];
          return p ? String(p.rank) : '';
        },
        style: { fontSize: '10px', fontWeight: 700, colors: ['#ffffff'] },
        background: { enabled: false, padding: 0, borderWidth: 0, dropShadow: { enabled: false } }
      },
      markers: { size: 0, hover: { size: 0, sizeOffset: 0 } },
      states: { hover: { filter: { type: 'none' } } },
      plotOptions: { bubble: { minBubbleRadius: 3, maxBubbleRadius: 26 } },
      grid: {
        borderColor: '#dee4df',
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { left: isFirst ? 0 : 6, right: 6, top: 8, bottom: 0 }
      },
      xaxis: {
        type: 'numeric',
        min: seg.xMin,
        max: seg.xMax,
        tickAmount: i === 0 ? 4 : (i === 1 ? 2 : 4),
        axisBorder: { show: true, color: '#c3c2b7' },
        axisTicks: { show: false },
        labels: {
          style: { colors: '#787878', fontSize: '10px', fontFamily: fontFamily },
          formatter: function (v) { return Number(v).toFixed(2) + 'x'; }
        }
      },
      yaxis: {
        logarithmic: true,
        min: yMin,
        max: yMax,
        tickAmount: yTickAmount,
        labels: {
          show: isFirst,
          style: { colors: '#787878', fontSize: '13px', fontWeight: 700, fontFamily: fontFamily },
          formatter: function (v) { return mcFormatUSDShort(v); }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      legend: { show: false },
      tooltip: { enabled: false }
    });
    inst.render();
    mcChartInstances.push(inst);
    // Fresh mount div every slide-render (renderManagerConcentrationSlide()
    // returns brand-new HTML each time), so a plain addEventListener here
    // never double-binds across re-renders the way the table's delegated
    // listener has to guard against.
    mount.addEventListener('click', function () {
      const p = mcHoverPoint[i];
      if (p && p.manager) openManager(p.manager);
    });
  });

  bindManagerConcentrationSort();
  bindManagerConcentrationRows();
  bindManagerConcentrationLegend();
  bindManagerConcentrationSegments();
}
