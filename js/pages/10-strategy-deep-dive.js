// js/pages/10-strategy-deep-dive.js — "Strategy Deep Dive" slide,
// inserted before Liquidity Options.
//
// As of Round 92 this is dropdown-driven, same architecture as Market
// Sentiment (Round 83, see js/pages/09-market-sentiment.js's header
// comment for the pattern this mirrors): a Strategy dropdown replaces
// what used to be a fixed "Private Equity" title suffix, and every
// number on the RIGHT side (stat row, manager table, NAV-by-vintage
// chart, DPI-vs-RVPI row) recomputes live from CFG.rows for whichever
// strategy is selected — computeStrategyDeepDiveData() in
// js/slide-data/10-strategy-deep-dive.data.js, called at render and on
// every dropdown change via sddComposeSlideData() below, never eagerly.
//
// LEFT column: the title ("Strategy Deep Dive: <dropdown>"), a subtitle,
// and up to 3 authored "insight" blocks (big number badge + heading +
// prose). None of that column's prose is derivable from the workbook —
// per the user's own framing (Round 92): "the 3 points at left they are
// not related to the excel data so we can make a file for it where we
// have these 3 points for every strategy". That content lives in
// js/slide-data/10-strategy-deep-dive-narratives.data.js, keyed by the
// same strategy `key` as SDD_STRATEGIES; sddComputeNarrative() falls
// back to a clearly-labeled placeholder for a strategy that doesn't have
// authored content yet (currently every key except 'private-equity').
//
// RIGHT column: a 4-cell stat row, a sortable mini "Manager
// Concentration" table (same click-to-sort pattern as
// bindManagerConcentrationSort() in js/pages/08-manager-concentration.js,
// renamed sdd*/SDD* here to stay independent), HTML NAV-by-vintage
// columns (one shared 5-col grid with the DPI row so they line up; hover
// tooltip via #donutTip so CSS slide-scale cannot offset Apex's built-in
// tip), and 5 equal-width HTML split bars for DPI vs RVPI (no tooltip).
//
// INTERACTIVE DRILL-DOWNS:
//   - Top-5 manager row → openManager() (flat fund list).
//   - Remaining / Total → openDataLens() grouped by manager (same as
//     the strategy drawer). Remaining uses funds not in the top 5.
//     Total uses every fund in this strategy (D.rows).
//   - Vintage column → vintage-segment drawer.
//   ONE delegated click listener on the persistent <tbody> survives
//   sort-triggered innerHTML swaps and strategy-driven re-renders.
//   - Clicking a NAV-by-vintage column opens a drawer filtered to that
//     strategy + vintage bucket's underlying fund rows
//     (sddVintageDrilldown() below), reusing the existing generic
//     openDataLens() plus the SAME `lens.vintageSegTitle` /
//     `lens.vintageSegSub` / `lens.introVintage` i18n keys the deck
//     already uses for its other vintage-segment drill-down (see
//     js/app.js's 'vintageSegment' action) — no new i18n keys needed,
//     the {seg} placeholder just carries "<Strategy> · <vintage band>"
//     instead of the deck-wide vintage_segment value.
//
// SMOOTH UPDATES: switching the Strategy dropdown does NOT re-render the
// whole slide (sddApplySelection() below). The subtitle and left-column
// points swap by innerHTML/textContent (prose, no meaningful geometry to
// animate — same as Market Sentiment's driver values). The stat row's 4
// numbers update by textContent, bypassing the one-time count-up
// entrance animation (runCountUp('sdd'), js/pages/03-tangible-stats.js)
// which only ever plays once per slide-visit. The manager table's
// <tbody> is replaced by innerHTML (the delegated row-click listener
// lives on the <tbody> element itself, so it survives). The NAV-by-
// vintage bars/value labels and the DPI-vs-RVPI segment widths/labels
// update existing DOM nodes' inline styles/text in place, so the new
// css/styles.css `transition` rules on .sddNavBar/.sddDpiSeg/
// .sddNavValueText animate the change instead of jumping.
//
// Fixed vs. the raw Figma export: the export's "Total" row LABEL sits at
// y=607.1, overlapping the "Remaining 44 managers" row above it (y=609.9)
// — its own NAV/DPI/TVPI/% values correctly sit at y=641.1, one row below.
// That's a Figma-export positioning bug (a stray/duplicate text node),
// not an intentional design choice, so this implementation places the
// whole Total row together at the correct, evenly-spaced position
// instead of reproducing the mismatch.

const SDD_BAR_MAX_PX = 161;

function sddFormatUSD(nav) {
  return '$' + Math.round(nav / 1e6).toLocaleString('en-US') + 'M';
}

const SDD_COLS = [
  { key: 'manager', label: 'MANAGER CONCENTRATION', type: 'str', width: 378.1 },
  { key: 'nav',      label: 'NAV',       type: 'num', width: 137.7 },
  { key: 'dpi',      label: 'DPI',       type: 'num', width: 100.9 },
  { key: 'tvpi',     label: 'TVPI',      type: 'num', width: 101.0 },
  { key: 'pct',      label: '% OF TOT.', type: 'num', width: 100.9 }
];

let sddSortKey = null;
let sddSortDir = null;

// ---- Dropdown state + "current composed view" ----
// sddCurrent is recomputed on every full render AND on every dropdown
// change (sddApplySelection), and is read by click/hover handlers that
// are bound only ONCE (they close over sddCurrent by reference, not by
// value, so they always see whichever strategy is currently selected).
let sddState = { strategyKey: SDD_STRATEGIES[0].key };
let sddCurrent = null;

function sddComposeSlideData(strategyKey) {
  const cfg = sddStrategyByKey(strategyKey);
  return { cfg: cfg, D: computeStrategyDeepDiveData(cfg), N: sddComputeNarrative(cfg) };
}

function sddBarMaxNav(D) {
  const topNav = D.top.length ? D.top[0].nav : 0;
  return Math.max(topNav, D.remaining.nav) || 1;
}

// Only the top 5 reorder. Remaining + Total stay last.
function sddSortedRows(D) {
  const dir = sddSortDir === 'asc' ? 1 : -1;
  const rows = D.top.map(function (m) {
    return { manager: m.manager, displayName: m.displayName, nav: m.nav, dpi: m.dpi, tvpi: m.tvpi, pct: m.pct, isRemaining: false };
  });
  if (sddSortKey) {
    rows.sort(function (a, b) {
      if (sddSortKey === 'manager') return a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }) * dir;
      return (a[sddSortKey] - b[sddSortKey]) * dir;
    });
  }
  rows.push({
    manager: D.remaining.label, displayName: D.remaining.label, nav: D.remaining.nav, dpi: D.remaining.dpi, tvpi: D.remaining.tvpi, pct: D.remaining.pct, isRemaining: true
  });
  return rows;
}

function sddRowHtml(m, maxNav, i) {
  const barW = (m.nav / maxNav * SDD_BAR_MAX_PX).toFixed(1);
  const cls = m.isRemaining ? 'sddRemainingRow sddClickableRow' : 'sddClickableRow';
  const dataAttr = m.isRemaining ? ' data-sdd-lens="remaining"' : ' data-manager="' + escAttr(m.manager) + '"';
  return '<tr class="' + cls + '"' + dataAttr + '>' +
    '<td class="sdd-namecell"><span class="sdd-name">' + esc(m.displayName) + '</span><span class="sdd-bar" style="width:' + barW + 'px;--sdd-bar-i:' + i + ';"></span></td>' +
    '<td class="sdd-green">' + sddFormatUSD(m.nav) + '</td>' +
    '<td>' + m.dpi.toFixed(2) + 'x</td>' +
    '<td>' + m.tvpi.toFixed(2) + 'x</td>' +
    '<td class="sdd-muted">' + m.pct.toFixed(1) + '%</td>' +
  '</tr>';
}

function sddTotalRowHtml(D) {
  const tot = D.total;
  return '<tr class="sddTotalRow sddClickableRow" data-sdd-lens="total">' +
    '<td>' + esc(tot.label) + '</td>' +
    '<td class="sdd-green">' + sddFormatUSD(tot.nav) + '</td>' +
    '<td>' + tot.dpi.toFixed(2) + 'x</td>' +
    '<td>' + tot.tvpi.toFixed(2) + 'x</td>' +
    '<td>' + tot.pct.toFixed(1) + '%</td>' +
  '</tr>';
}

function sddRenderTbody(D) {
  const maxNav = sddBarMaxNav(D);
  return sddSortedRows(D).map(function (m, i) { return sddRowHtml(m, maxNav, i); }).join('') + sddTotalRowHtml(D);
}

function sddRenderHeadArrows() {
  const head = document.getElementById('sddHeadRow');
  if (!head) return;
  head.querySelectorAll('th[data-key]').forEach(function (th) {
    const isSorted = th.getAttribute('data-key') === sddSortKey;
    th.classList.toggle('is-sorted', isSorted);
    th.classList.toggle('dir-desc', isSorted && sddSortDir === 'desc');
  });
}

function bindStrategyDeepDiveSort() {
  const head = document.getElementById('sddHeadRow');
  const tbody = document.getElementById('sddTbody');
  if (!head || !tbody || head.dataset.boundSort) return;
  head.dataset.boundSort = '1';
  sddRenderHeadArrows();
  head.querySelectorAll('th[data-key]').forEach(function (th) {
    th.addEventListener('click', function () {
      const key = th.getAttribute('data-key');
      const col = SDD_COLS.filter(function (c) { return c.key === key; })[0];
      if (key === sddSortKey) {
        sddSortDir = sddSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sddSortKey = key;
        sddSortDir = col.type === 'num' ? 'desc' : 'asc';
      }
      tbody.innerHTML = sddRenderTbody(sddCurrent.D);
      sddRenderHeadArrows();
    });
  });
}

// Manager-row click-to-drill-down (Round 92) — exact mirror of
// bindManagerConcentrationRows() in js/pages/08-manager-concentration.js.
// ONE delegated listener on the persistent <tbody> survives both
// sort-triggered and strategy-change-triggered innerHTML replacement.
function sddNavShare(arr) {
  const m = weightedMetrics(arr);
  const pct = m.nav && CFG.totalNav ? (m.nav / CFG.totalNav * 100).toFixed(1) : '0.0';
  return t('lens.includedNavShare', { n: arr.length, pct: pct });
}

function sddOpenTotal() {
  if (!sddCurrent) return;
  const arr = sddCurrent.D.rows;
  if (!arr.length) return;
  openDataLens(sddCurrent.cfg.label, sddNavShare(arr), arr, { intro: t('lens.introStrategy') });
}

function sddOpenRemaining() {
  if (!sddCurrent) return;
  const D = sddCurrent.D;
  const top = {};
  D.top.forEach(function (m) { top[m.manager] = 1; });
  const arr = D.rows.filter(function (r) { return !top[r.manager]; });
  if (!arr.length) return;
  openDataLens(D.remaining.label, t('lens.includedMgrs', { n: arr.length, mgrs: D.remaining.count }), arr, { intro: t('lens.introStrategy') });
}

function bindStrategyDeepDiveRows() {
  const tbody = document.getElementById('sddTbody');
  if (!tbody || tbody.dataset.boundRowClick) return;
  tbody.dataset.boundRowClick = '1';
  tbody.addEventListener('click', function (e) {
    const row = e.target.closest('tr');
    if (!row || !tbody.contains(row)) return;
    if (row.dataset.manager) {
      openManager(row.dataset.manager);
      return;
    }
    const lens = row.getAttribute('data-sdd-lens');
    if (lens === 'remaining') sddOpenRemaining();
    else if (lens === 'total') sddOpenTotal();
  });
}

function sddRenderStatCell(x, valueId, value, label, countAttrs, labelId) {
  return '\n  <div id="' + valueId + '" class="fig-text"' + (countAttrs || '') + ' style="position:absolute;left:' + x + 'px;top:252px;width:400px;height:46px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:500;font-size:38px;color:#104130;white-space:nowrap;">' + esc(value) + '</div>' +
    '\n  <div' + (labelId ? ' id="' + labelId + '"' : '') + ' class="fig-text" style="position:absolute;left:' + x + 'px;top:304px;width:400px;height:30px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-size:24px;color:#787878;white-space:nowrap;">' + esc(label) + '</div>';
}

function sddRenderStatRow(D) {
  const navM = Math.round(D.strategyNav / 1e6);
  const xs = [68, 514, 960, 1406];
  const pad = 32;
  const navLabel = D.navLabel;
  // Verticals stop short of the baseline so they do not touch it.
  const dividers = [514, 960, 1406].map(function (x) {
    return '\n  <div class="fig-box" style="position:absolute;left:' + x + 'px;top:252px;width:1px;height:86px;background:#dee4df;"></div>';
  }).join('');
  return sddRenderStatCell(xs[0], 'sddStatPct', D.pctOfTotalNav.toFixed(1) + '%', 'of total NAV', ' data-count-to="' + D.pctOfTotalNav.toFixed(1) + '" data-count-decimals="1" data-count-suffix="%"') +
    sddRenderStatCell(xs[1] + pad, 'sddStatNav', sddFormatUSD(D.strategyNav), navLabel, ' data-count-to="' + navM + '" data-count-prefix="$" data-count-suffix="M"', 'sddStatNavLabel') +
    sddRenderStatCell(xs[2] + pad, 'sddStatInterests', String(D.interestsCount), 'interests', ' data-count-to="' + D.interestsCount + '"') +
    sddRenderStatCell(xs[3] + pad, 'sddStatManagers', String(D.managerCount), 'managers', ' data-count-to="' + D.managerCount + '"') +
    dividers +
    '\n  <div class="fig-box" style="position:absolute;left:68px;top:356px;width:1784px;height:1px;background:#dee4df;"></div>';
}

function sddRenderInsightBlock(n, title, body) {
  const num = String(n).padStart(2, '0');
  return '<div class="sddPoint">' +
    '<div class="sddNum">' + num + '</div>' +
    '<div class="sddPointCopy">' +
      '<div class="sddPointHead">' + esc(title) + '</div>' +
      '<div class="sddPointBody">' + esc(body) + '</div>' +
    '</div></div>';
}

function sddCurrentLabel() {
  return (sddStrategyByKey(sddState.strategyKey) || SDD_STRATEGIES[0]).label;
}

function sddTitleBarHtml() {
  return '\n  <div id="sddTitleBar" data-fig-name="title" style="position:absolute;left:68px;top:136px;width:1700px;height:58px;display:flex;align-items:center;gap:12px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:500;font-size:46px;color:#104130;white-space:nowrap;">' +
    '<span>Strategy Deep Dive:</span>' +
    '<button type="button" id="sddSettingsBtn" class="sddStratBtn" title="Choose strategy" aria-label="Choose strategy">' +
      '<span id="sddTitleStrategy">' + esc(sddCurrentLabel()) + '</span>' +
      '<svg class="sddStratBtnIcon" viewBox="0 0 24 24" width="52" height="52" aria-hidden="true"><path d="M8 16L16 8"/><path d="M9 8h7v7"/></svg>' +
    '</button>' +
    '</div>';
}

function openSddStrategyDrawer() {
  const body = SDD_STRATEGIES.map(function (s) {
    const on = s.key === sddState.strategyKey;
    return '<div class="dataRow sddStratPick' + (on ? ' is-on' : '') + '" data-sdd-strategy="' + s.key + '">' +
      '<div class="name"><b>' + esc(s.label) + '</b></div>' +
      '<div class="val">' + (on ? 'Current' : '') + '</div>' +
    '</div>';
  }).join('');
  openDrawer('Choose strategy', 'The slide updates upon selection', '<div class="sddStratList">' + body + '</div>');
  document.querySelectorAll('.sddStratPick').forEach(function (el) {
    el.addEventListener('click', function () {
      sddOnStrategyChange(el.getAttribute('data-sdd-strategy'));
      closeDrawer();
    });
  });
}

function sddSubtitleHtml(N) {
  return '\n  <div id="sddSubtitle" class="fig-text" style="position:absolute;left:68px;top:216px;width:1550px;height:28px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-size:19px;color:#808582;white-space:nowrap;">' + esc(N.subtitle) + '</div>';
}

function sddPointsHtml(N) {
  return '\n  <div class="sddPoints" id="sddPoints">' +
    N.points.map(function (p, i) { return sddRenderInsightBlock(i + 1, p.title, p.body); }).join('') +
  '</div>';
}

const SDD_GRID_LEFT = 1010;
const SDD_GRID_W = 818.6;
const SDD_COL_N = 5;
const SDD_COL_W = SDD_GRID_W / SDD_COL_N;
function sddColX(i) { return SDD_GRID_LEFT + i * SDD_COL_W; }

// NAV-by-vintage bar geometry. Five HTML columns share the same x-grid
// as the DPI-vs-RVPI row. Value/vintage labels sit outside the plot.
const SDD_NAV_BASELINE_Y = 855.1;
const SDD_NAV_AREA_TOP = 735.1;
const SDD_NAV_AREA_HEIGHT = 120;

function sddNavYMax(D) {
  return Math.max.apply(null, D.buckets.map(function (b) { return b.nav / 1e6; })) * 1.15;
}

// Shared by the render path (initial HTML) and sddApplySelection (live
// update on a dropdown change) so the two never drift out of sync.
function sddVintageColMetrics(D) {
  const yMax = sddNavYMax(D);
  return D.buckets.map(function (b) {
    const navM = b.nav / 1e6;
    const barH = yMax > 0 ? (navM / yMax) * SDD_NAV_AREA_HEIGHT : 0;
    return { barH: barH, valueTop: SDD_NAV_BASELINE_Y - barH - 25, navText: sddFormatUSD(b.nav) };
  });
}

function sddDpiColMetrics(D) {
  return D.buckets.map(function (b) {
    const pair = b.dpi + b.rvpi;
    return {
      dpiPct: pair > 0 ? (b.dpi / pair) * 100 : 0,
      rvpiPct: pair > 0 ? (b.rvpi / pair) * 100 : 0,
      text: b.dpi.toFixed(2) + ' / ' + b.rvpi.toFixed(2)
    };
  });
}

function sddRenderVintageChartSection(D) {
  const metrics = sddVintageColMetrics(D);
  const cols = D.buckets.map(function (b, i) {
    const m = metrics[i];
    const x = sddColX(i);
    return '\n  <div class="sddNavCol" data-sdd-bucket="' + i + '" style="--sdd-i:' + i + ';position:absolute;left:' + x.toFixed(2) + 'px;top:' + SDD_NAV_AREA_TOP + 'px;width:' + SDD_COL_W.toFixed(2) + 'px;height:' + SDD_NAV_AREA_HEIGHT + 'px;">' +
      '<div class="sddNavBar" id="sddNavBar' + i + '" style="height:' + m.barH.toFixed(2) + 'px;"></div></div>' +
      '\n  <div class="fig-text sddNavValueText" id="sddNavValue' + i + '" style="position:absolute;left:' + x.toFixed(2) + 'px;top:' + m.valueTop.toFixed(2) + 'px;width:' + SDD_COL_W.toFixed(2) + 'px;height:19px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:600;font-size:14.68px;color:#104130;text-align:center;white-space:nowrap;pointer-events:none;">' + m.navText + '</div>' +
      '\n  <div class="fig-text" style="position:absolute;left:' + x.toFixed(2) + 'px;top:866.1px;width:' + SDD_COL_W.toFixed(2) + 'px;height:20px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-size:15.6px;color:#787878;text-align:center;white-space:nowrap;">' + esc(b.label) + '</div>';
  }).join('');
  return '\n  <div class="fig-text" style="position:absolute;left:1010px;top:692px;width:367.1px;height:17px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:600;font-size:13px;color:#787878;white-space:nowrap;">NAV BY VINTAGE, $M</div>' +
    cols;
}

function sddRenderDpiRvpiSection(D) {
  const barW = 110;
  const metrics = sddDpiColMetrics(D);
  const mounts = D.buckets.map(function (b, i) {
    const x = sddColX(i);
    const m = metrics[i];
    const barLeft = x + (SDD_COL_W - barW) / 2;
    return '\n  <div class="sddDpiBar" style="position:absolute;left:' + barLeft.toFixed(2) + 'px;top:914px;width:' + barW + 'px;">' +
      '<span class="sddDpiSeg" id="sddDpiSegA' + i + '" style="width:' + m.dpiPct.toFixed(2) + '%;background:#104130;"></span>' +
      '<span class="sddDpiSeg" id="sddDpiSegB' + i + '" style="width:' + m.rvpiPct.toFixed(2) + '%;background:#a7dcc2;"></span></div>' +
      '\n  <div class="fig-text" id="sddDpiValue' + i + '" style="position:absolute;left:' + x.toFixed(2) + 'px;top:928px;width:' + SDD_COL_W.toFixed(2) + 'px;height:20px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:600;font-size:15.6px;color:#787878;text-align:center;white-space:nowrap;">' + m.text + '</div>';
  }).join('');
  return '\n  <div class="fig-text" style="position:absolute;left:1010.9px;top:892.5px;width:123.9px;height:17px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:600;font-size:13px;color:#787878;white-space:nowrap;">DPI VS RVPI</div>' +
    '\n  <div class="fig-box" style="position:absolute;left:1596.4px;top:898.0px;width:10.1px;height:10.1px;background:#104130;"></div>' +
    '\n  <div class="fig-text" style="position:absolute;left:1613.9px;top:894.3px;width:100px;height:17px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-size:13.77px;color:#787878;white-space:nowrap;">DPI returned</div>' +
    '\n  <div class="fig-box" style="position:absolute;left:1721.2px;top:898.0px;width:10.1px;height:10.1px;background:#a7dcc2;"></div>' +
    '\n  <div class="fig-text" style="position:absolute;left:1738.7px;top:894.3px;width:110px;height:17px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-size:13.77px;color:#787878;white-space:nowrap;">RVPI still held</div>' +
    mounts;
}

function sddRenderTable(D) {
  const headHtml = SDD_COLS.map(function (col) {
    return '<th data-key="' + col.key + '" style="width:' + col.width + 'px;">' + esc(col.label) + '<span class="sdd-arrow" aria-hidden="true"></span></th>';
  }).join('');
  return '\n  <div class="sddWrap" style="position:absolute;left:990px;top:384px;width:862.6px;">' +
    '<table class="sddTable" id="sddHeadTable">' +
    '<colgroup>' + SDD_COLS.map(function (c) { return '<col style="width:' + c.width + 'px;">'; }).join('') + '</colgroup>' +
    '<thead><tr id="sddHeadRow">' + headHtml + '</tr></thead>' +
    '<tbody id="sddTbody"' + (sddShouldPlay() ? ' class="sddTbody-play"' : '') + '>' + sddRenderTbody(D) + '</tbody>' +
    '</table></div>';
}

function renderStrategyDeepDiveSlide() {
  sddCurrent = sddComposeSlideData(sddState.strategyKey);
  const D = sddCurrent.D, N = sddCurrent.N;
  return '<div class="fig-slide ' + (sddShouldPlay() ? 'sddSlide sdd-ready' : 'sddSlide sdd-static') + '" style="position:relative;width:1920px;height:1080px;background:#ffffff;overflow:hidden;">' +
    '\n  <div class="fig-text" data-fig-name="chrome-year" style="position:absolute;left:68.00px;top:64.00px;width:49.00px;height:24.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-size:19.00px;line-height:23.94px;color:#787878;white-space:pre;">2026</div>' +
    '\n  <div class="fig-box" data-fig-name="chrome-logo-box" style="position:absolute;left:1675.00px;top:58.00px;width:177.00px;height:44.00px;border:1px solid #0f0f0f;box-sizing:border-box;"></div>' +
    '\n  <div class="fig-text" data-fig-name="chrome-logo" style="position:absolute;left:1677.00px;top:69.00px;width:177.00px;height:24.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-size:19.00px;line-height:23.94px;letter-spacing:5.00px;color:#0f0f0f;text-align:center;white-space:pre;">TANGIBLE</div>' +
    '\n  <div class="fig-text" data-fig-name="chrome-footer" style="position:absolute;left:68.00px;top:982.00px;width:112.00px;height:24.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-size:19.00px;line-height:23.94px;color:#96ac9e;white-space:pre;">Confidential</div>' +
    '\n  <div class="fig-text" data-fig-name="chrome-page" style="position:absolute;left:1674.00px;top:982.00px;width:178.00px;height:24.00px;font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:400;font-size:19.00px;line-height:23.94px;color:#96ac9e;text-align:right;white-space:pre;">07</div>' +
    sddTitleBarHtml() +
    sddSubtitleHtml(N) +
    sddPointsHtml(N) +
    sddRenderStatRow(D) +
    sddRenderTable(D) +
    sddRenderVintageChartSection(D) +
    sddRenderDpiRvpiSection(D) +
  '\n</div>';
}

let sddPlayed = false;
function sddShouldPlay(){
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return !sddPlayed && !reduce;
}

function renderStrategyDeepDiveSlideAfterRender() {
  if (sddShouldPlay()) sddPlayed = true;
  if (typeof animateStrategyDeepDiveCount === 'function') animateStrategyDeepDiveCount();
  sddBindNavTips();
  bindStrategyDeepDiveSort();
  bindStrategyDeepDiveRows();
  const btn = document.getElementById('sddSettingsBtn');
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      openSddStrategyDrawer();
    });
  }
}

function sddOnStrategyChange(newKey) {
  sddState = { strategyKey: newKey };
  sddApplySelection();
}

// Updates every dynamic number/position in place (not a full re-render)
// so css/styles.css's .sddNavBar/.sddDpiSeg/.sddNavValueText `transition`
// rules get a chance to animate smoothly to the new strategy's values,
// instead of the view just jumping. See this file's header comment for
// which parts swap by text/innerHTML vs. animate by inline-style.
function sddApplySelection() {
  sddCurrent = sddComposeSlideData(sddState.strategyKey);
  const D = sddCurrent.D, N = sddCurrent.N;

  const titleEl = document.getElementById('sddTitleStrategy');
  if (titleEl) titleEl.textContent = D.strategyLabel;
  const subtitleEl = document.getElementById('sddSubtitle');
  if (subtitleEl) subtitleEl.textContent = N.subtitle;
  const pointsEl = document.getElementById('sddPoints');
  if (pointsEl) pointsEl.innerHTML = N.points.map(function (p, i) { return sddRenderInsightBlock(i + 1, p.title, p.body); }).join('');

  const setText = function (id, text) { const el = document.getElementById(id); if (el) el.textContent = text; };
  setText('sddStatPct', D.pctOfTotalNav.toFixed(1) + '%');
  setText('sddStatNav', sddFormatUSD(D.strategyNav));
  setText('sddStatInterests', String(D.interestsCount));
  setText('sddStatManagers', String(D.managerCount));
  setText('sddStatNavLabel', D.navLabel);

  const tbody = document.getElementById('sddTbody');
  if (tbody) {
    tbody.classList.remove('sddTbody-play');
    tbody.innerHTML = sddRenderTbody(D);
    void tbody.offsetWidth;
    tbody.classList.add('sddTbody-play');
  }
  sddRenderHeadArrows();

  sddVintageColMetrics(D).forEach(function (m, i) {
    const bar = document.getElementById('sddNavBar' + i);
    if (bar) bar.style.height = m.barH.toFixed(2) + 'px';
    const val = document.getElementById('sddNavValue' + i);
    if (val) { val.textContent = m.navText; val.style.top = m.valueTop.toFixed(2) + 'px'; }
  });

  sddDpiColMetrics(D).forEach(function (m, i) {
    const segA = document.getElementById('sddDpiSegA' + i);
    if (segA) segA.style.width = m.dpiPct.toFixed(2) + '%';
    const segB = document.getElementById('sddDpiSegB' + i);
    if (segB) segB.style.width = m.rvpiPct.toFixed(2) + '%';
    const val = document.getElementById('sddDpiValue' + i);
    if (val) val.textContent = m.text;
  });
}

// Vintage-column click-to-drill-down (Round 92). Reuses the deck's
// existing generic openDataLens() plus the SAME i18n keys already used
// by js/app.js's 'vintageSegment' action (lens.vintageSegTitle/
// vintageSegSub/introVintage) — the {seg} placeholder just carries
// "<Strategy> · <vintage band>" here instead of the deck-wide
// vintage_segment value, which those templates already read as a plain
// string. bucket.points (set by sddAggregate() in the data file) holds
// exactly the CFG.rows records behind that bucket for this strategy, so
// no re-filtering is needed here.
function sddVintageDrilldown(bucketIndex) {
  if (!sddCurrent) return;
  const b = sddCurrent.D.buckets[bucketIndex];
  if (!b || !b.count) return; // empty bucket (e.g. Infrastructure has none before 2015) — nothing to show
  const seg = sddCurrent.cfg.label + ' · ' + b.label;
  openDataLens(t('lens.vintageSegTitle', { seg: seg }), t('lens.vintageSegSub', { seg: seg }), b.points, { intro: t('lens.introVintage') });
}

// Hover tooltip AND click-to-drill-down share one per-column bind pass,
// bound once per column element (dataset.sddBound guard) since these
// columns are updated in place, never recreated, by sddApplySelection.
// Both handlers read sddCurrent live (not a value captured at bind
// time), so they always reflect whichever strategy is selected.
function sddBindNavTips() {
  const tip = document.getElementById('donutTip');
  function place(e) {
    if (!tip) return;
    tip.style.left = (e.clientX + 12) + 'px';
    tip.style.top = (e.clientY + 12) + 'px';
  }
  document.querySelectorAll('.sddNavCol').forEach(function (col) {
    if (col.dataset.sddBound) return;
    col.dataset.sddBound = '1';
    const bucketIndex = Number(col.getAttribute('data-sdd-bucket'));
    col.addEventListener('mouseenter', function (e) {
      if (!tip || !sddCurrent) return;
      const b = sddCurrent.D.buckets[bucketIndex];
      if (!b) return;
      tip.innerHTML = '<b>' + esc(b.label) + '</b><br>NAV: ' + sddFormatUSD(b.nav) +
        '<br>DPI: ' + b.dpi.toFixed(2) + 'x<br>RVPI: ' + b.rvpi.toFixed(2) + 'x<br>Interests: ' + b.count;
      tip.style.display = 'block';
      place(e);
    });
    col.addEventListener('mousemove', place);
    col.addEventListener('mouseleave', function () { if (tip) tip.style.display = 'none'; });
    col.addEventListener('click', function () { sddVintageDrilldown(bucketIndex); });
  });
}
