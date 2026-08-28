// MANAGER_CONCENTRATION_DATA — data for the "Diversified manager base with
// limited concentration" slide (js/pages/08-manager-concentration.js),
// inserted after Strategy Mix per the user's Round 49 request: "the right
// side table ... will be controlled by data ... the chart on the left
// [should] be live and use a real chart ... reflect according to what data
// we pass it".
//
// Numbers come live from CFG.rows (Excel via tools/export.py). Every
// included interest is kept. Do not drop a manager without asking.

// Short "common name" for each manager, matching the Figma mockup's own
// table/legend labels (e.g. "Insight Venture Management LLC" is shown as
// "Insight Partners" — its actual market name, not derivable by stripping
// a legal suffix). Curated for the top ~20 managers by NAV as of this
// round, which comfortably covers the current top 10 with room for minor
// future reshuffling; mcDisplayName() below falls back to stripping
// common legal-entity suffixes for anyone not in this list, so a new
// manager entering the top 10 after a CFG.rows update still gets a
// reasonable (if less polished) short name instead of breaking.
const MANAGER_CONCENTRATION_DISPLAY_NAMES = {
  'Stockbridge Capital Group LLC': 'Stockbridge Capital',
  'Blackstone Inc': 'Blackstone',
  'Sixth Street Advisors LLC': 'Sixth Street',
  'Brookfield Asset Management': 'Brookfield',
  'Bain Capital LLC': 'Bain Capital',
  'Park Square Capital LLP': 'Park Square',
  'Insight Venture Management LLC': 'Insight Partners',
  'Cerberus Capital Management LP': 'Cerberus',
  'Platinum Equity Advisors LLC': 'Platinum Equity',
  'Clearlake Capital Group LP': 'Clearlake Capital',
  'I Squared Capital Advisors (US) LLC': 'I Squared Capital',
  'LLR Partners': 'LLR Partners',
  'Grosvenor Capital Management LP': 'Grosvenor Capital',
  'EQT Partners AB': 'EQT',
  'Summit Partners': 'Summit Partners',
  'HgCapital': 'HgCapital',
  'Carlyle': 'Carlyle',
  'Cabot Properties LP': 'Cabot Properties',
  'CIFC Asset Management': 'CIFC',
  'Apax Partners': 'Apax Partners',
  'Polaris Capital Group Co Ltd': 'Polaris Capital'
};

function mcDisplayName(manager) {
  if (MANAGER_CONCENTRATION_DISPLAY_NAMES[manager]) return MANAGER_CONCENTRATION_DISPLAY_NAMES[manager];
  return manager.replace(/\s*\(US\)\s*$/i, '').replace(/\s*(LLC|L\.?L\.?C\.?|LLP|L\.?L\.?P\.?|L\.?P\.?|Inc\.?|Co\.? Ltd\.?|Ltd\.?|AB|PLC)\s*$/i, '').trim();
}
const MANAGER_CONCENTRATION_TOP_N_TABLE = 10;
const MANAGER_CONCENTRATION_TOP_N_HIGHLIGHT = 6;

// DPI-band thresholds match the 3 columns described by CFG.rows'
// `dpi_segment` field, but are applied here to each MANAGER's aggregate
// DPI (dist/paid summed across all of that manager's vehicles) rather
// than to each individual fund row.
const MANAGER_CONCENTRATION_DPI_BANDS = [
  { key: 'under25', label: 'Under 0.25x DPI', min: 0, max: 0.25 },
  { key: 'mid', label: '0.25x-0.75x DPI', min: 0.25, max: 0.75 },
  { key: 'over75', label: 'Over 0.75x DPI', min: 0.75, max: Infinity }
];

function mcPluralize(n, noun) { return n + ' ' + noun + (n === 1 ? '' : 's'); }

function computeManagerConcentrationData() {
  const rows = CFG.rows;

  // 1. Aggregate every fund-level row up to its manager.
  const raw = {};
  rows.forEach(function (r) {
    const a = raw[r.manager] || (raw[r.manager] = {
      manager: r.manager, nav: 0, dist: 0, paid: 0, totalValue: 0, n: 0, strategies: {}
    });
    a.nav += r.nav || 0;
    a.dist += r.dist || 0;
    a.paid += r.paid || 0;
    a.totalValue += r.total_value || 0;
    a.n += 1;
    a.strategies[r.strategy] = (a.strategies[r.strategy] || 0) + (r.nav || 0);
  });

  const totalNav = Object.keys(raw).reduce(function (s, k) { return s + raw[k].nav; }, 0);

  function derive(a) {
    const dpi = a.paid > 0 ? a.dist / a.paid : 0;
    const tvpi = a.paid > 0 ? a.totalValue / a.paid : 0;
    const topStrategy = Object.keys(a.strategies).sort(function (x, y) { return a.strategies[y] - a.strategies[x]; })[0];
    return {
      manager: a.manager,
      nav: a.nav,
      dist: a.dist,
      paid: a.paid,
      totalValue: a.totalValue,
      pct: totalNav > 0 ? a.nav / totalNav * 100 : 0,
      dpi: dpi,
      tvpi: tvpi,
      vehicleCount: a.n,
      dominantStrategy: topStrategy || '',
      dominantStrategyShare: topStrategy ? a.strategies[topStrategy] / a.nav * 100 : 0,
      allSameStrategy: Object.keys(a.strategies).length === 1
    };
  }

  // 2. Rank every manager by NAV descending.
  const managers = Object.keys(raw).map(function (k) { return derive(raw[k]); });
  managers.forEach(function (m) { m.displayName = mcDisplayName(m.manager); });
  managers.sort(function (a, b) { return b.nav - a.nav; });
  managers.forEach(function (m, i) { m.rank = i + 1; });

  const top10 = managers.slice(0, MANAGER_CONCENTRATION_TOP_N_TABLE);
  const highlighted = managers.slice(0, MANAGER_CONCENTRATION_TOP_N_HIGHLIGHT);
  const remainingList = managers.slice(MANAGER_CONCENTRATION_TOP_N_TABLE);

  // 3. Aggregate helper — used for both the "Remaining N managers" table
  // row and the "Total" row: DPI/TVPI must be recomputed from summed
  // dist/paid/totalValue, not averaged from each manager's own ratio.
  function aggregate(list, label) {
    const nav = list.reduce(function (s, m) { return s + m.nav; }, 0);
    const dist = list.reduce(function (s, m) { return s + m.dist; }, 0);
    const paid = list.reduce(function (s, m) { return s + m.paid; }, 0);
    const totalValue = list.reduce(function (s, m) { return s + m.totalValue; }, 0);
    return {
      label: label,
      count: list.length,
      nav: nav,
      pct: totalNav > 0 ? nav / totalNav * 100 : 0,
      dpi: paid > 0 ? dist / paid : 0,
      tvpi: paid > 0 ? totalValue / paid : 0
    };
  }

  const remaining = aggregate(remainingList, 'Remaining ' + mcPluralize(remainingList.length, 'manager'));
  const total = aggregate(managers, 'Total');

  // 4. DPI-band segments (the 3 chart columns + header stats).
  const maxDpi = managers.reduce(function (m, mgr) { return Math.max(m, mgr.dpi); }, 0);
  const segments = MANAGER_CONCENTRATION_DPI_BANDS.map(function (band) {
    const points = managers.filter(function (m) { return m.dpi >= band.min && m.dpi < band.max; });
    const agg = aggregate(points, band.label);
    return {
      key: band.key,
      label: band.label,
      xMin: band.min,
      // Segment 3's DPI range is open-ended in the data (Infinity), so its
      // chart panel needs a real numeric max — round the actual highest
      // manager DPI up to the next 0.1x with a little headroom, mirroring
      // the Figma mockup's own "2.42x" top tick.
      xMax: band.max === Infinity ? Math.max(band.min + 0.5, Math.ceil(maxDpi * 10) / 10 + 0.1) : band.max,
      count: agg.count,
      nav: agg.nav,
      pct: agg.pct,
      points: points
    };
  });

  return {
    totalGpCount: managers.length,
    totalNav: totalNav,
    managers: managers,
    segments: segments,
    top10: top10,
    highlighted: highlighted,
    remaining: remaining,
    total: total
  };
}

// computeManagerConcentrationCallouts() — the 2 long-form notes + 3 stat
// callouts on the right, written as templates over the computed data
// above rather than pasted-in mockup prose, so they stay accurate if
// CFG.rows changes. Wording otherwise follows the Figma export closely.
function computeManagerConcentrationCallouts(D) {
  const seg1 = D.segments[0], seg3 = D.segments[2];
  const top1 = D.top10[0];
  const isTopRealiser = D.top10.every(function (m) { return m.manager === top1.manager || m.dpi <= top1.dpi; });
  const vehiclesWord = top1.vehicleCount === 4 ? 'all four vehicles' : 'all ' + mcPluralize(top1.vehicleCount, 'vehicle');

  return {
    note1: mcPluralize(seg3.count, 'manager') + ' have already returned more than three-quarters of what was drawn down',
    note2: 'The $' + (seg1.nav / 1e9).toFixed(1) + 'bn sitting with low-DPI GPs is largely young vintages still in their investment period',
    stat1Value: '~' + Math.round(top1.pct) + '%',
    stat1Label: 'of total NAV sits with the largest manager',
    stat1Detail: top1.displayName + ' is ' + top1.pct.toFixed(1) + '% of the book, with ' + vehiclesWord +
      (top1.allSameStrategy ? ' in ' + top1.dominantStrategy : ' concentrated in ' + top1.dominantStrategy) +
      ', accounting for ' + Math.round(top1.dominantStrategyShare) + '% of that sleeve.' +
      (isTopRealiser ? ' It is the strongest realiser in the top ten,' : '') +
      ' and large enough to be carved out and sold on its own',
    stat2Value: '~' + Math.round(seg3.pct) + '%',
    stat2Label: 'of NAV already above 0.75x DPI',
    stat3Value: String(seg1.count),
    stat3Label: mcPluralize(seg1.count, 'manager').replace(/^\d+\s/, '') + ' remain below 0.25x DPI'
  };
}

const MANAGER_CONCENTRATION_DATA = computeManagerConcentrationData();
const MANAGER_CONCENTRATION_CALLOUTS = computeManagerConcentrationCallouts(MANAGER_CONCENTRATION_DATA);
