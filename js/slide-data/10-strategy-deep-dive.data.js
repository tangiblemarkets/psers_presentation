// STRATEGY_DEEP_DIVE data — for the "Strategy Deep Dive" slide
// (js/pages/10-strategy-deep-dive.js), inserted right before Liquidity
// Options per the user's original request (Round 58): "make sure that
// the right section uses data reflected from its data serving file /
// and we use real charts and display tooltip when hovering it".
//
// As of Round 92 this slide is dropdown-driven, same pattern as Market
// Sentiment (Round 83): the user picks a Strategy from SDD_STRATEGIES
// below, and every number on the RIGHT side (stat row, manager table,
// NAV-by-vintage chart, DPI-vs-RVPI row) recomputes live from CFG.rows
// for that strategy — computeStrategyDeepDiveData() below, called by
// js/pages/10-strategy-deep-dive.js at render/interaction time, not
// eagerly at file-load time (there's no single "the" data anymore, now
// that there are 4 possible strategies). The LEFT side's 3 narrative
// points are a different matter entirely — see "NARRATIVE CONTENT" below
// and js/slide-data/10-strategy-deep-dive-narratives.data.js.
//
// IMPORTANT: this file must load AFTER js/slide-data/08-manager-
// concentration.data.js (see index.html script order) — it reuses
// mcDisplayName() and MANAGER_CONCENTRATION_DATA.totalNav. It must
// also load after 10-strategy-deep-dive-narratives.data.js.
//
// SDD_STRATEGIES — the 4 dropdown options. Filters use `slideStrategy`
// (same field as Strategy Mix), not raw `tier1`. Insight Buyout / PE
// Special Situations vehicles are reported in Growth & Venture, so a
// tier1 filter would put them in Private Equity here and G&V on Mix.
// Real Estate and Infrastructure stay one option on this slide.
const SDD_STRATEGIES = [
  { key: 'private-equity', label: 'Private Equity', slideStrategies: ['Private Equity'] },
  { key: 'real-estate-infra', label: 'Real Estate & Infra', navLabel: 'RE & Infra NAV',
    slideStrategies: ['Real Estate', 'Infrastructure'] },
  { key: 'credit', label: 'Private Credit', slideStrategies: ['Private Credit'] },
  { key: 'growth-venture', label: 'Growth & Venture', slideStrategies: ['Growth & Venture'] }
];

function sddStrategyByKey(key) {
  const found = SDD_STRATEGIES.filter(function (s) { return s.key === key; })[0];
  return found || SDD_STRATEGIES[0];
}

// SDD_VINTAGE_BUCKETS — same 5 bands as Strategy Mix and Market Sentiment
// (`vintage_segment` on CFG.rows). Labels stay fixed when the strategy
// dropdown changes; only bar heights / DPI / RVPI update.
const SDD_VINTAGE_BUCKETS = [
  { label: 'Pre-2013', segmentKey: 'Pre-2013' },
  { label: '2013-2015', segmentKey: '2013-2015' },
  { label: '2016-2018', segmentKey: '2016-2018' },
  { label: '2019-2021', segmentKey: '2019-2021' },
  { label: '2022+', segmentKey: '2022+' }
];

// sddAggregate() — same "sum the dollars, then derive the ratio" pattern
// as aggregate() in 08-manager-concentration.data.js: dpi/rvpi/tvpi must
// come from summed dist/paid/totalValue, never averaged per-row. Keeps
// `points` (the underlying CFG.rows records) on the returned object so
// a vintage bucket's own fund list is available for its click-to-drill-
// down drawer (js/pages/10-strategy-deep-dive.js's sddVintageDrilldown())
// without re-filtering CFG.rows a second time.
function sddAggregate(list) {
  const nav = list.reduce((s, r) => s + (r.nav || 0), 0);
  const dist = list.reduce((s, r) => s + (r.dist || 0), 0);
  const paid = list.reduce((s, r) => s + (r.paid || 0), 0);
  const totalValue = list.reduce((s, r) => s + (r.total_value || 0), 0);
  return {
    count: list.length,
    points: list,
    nav: nav,
    dist: dist,
    paid: paid,
    totalValue: totalValue,
    dpi: paid > 0 ? dist / paid : 0,
    rvpi: paid > 0 ? (totalValue - dist) / paid : 0,
    tvpi: paid > 0 ? totalValue / paid : 0
  };
}

// computeStrategyDeepDiveData(strategyConfig) — one entry from
// SDD_STRATEGIES. Structurally identical to the pre-Round-92 PE-only
// version (see project memory psers_v7_round58_strategy_deep_dive.md),
// just parameterized by strategyConfig.slideStrategies instead of a
// hardcoded constant, and generalized field names (strategyNav, not peNav).
function computeStrategyDeepDiveData(strategyConfig) {
  const rows = CFG.rows.filter(function (r) {
    return strategyConfig.slideStrategies.indexOf(r.slideStrategy) !== -1;
  });

  // ---- manager rollup (mirrors computeManagerConcentrationData()) ----
  const raw = {};
  rows.forEach(function (r) {
    const a = raw[r.manager] || (raw[r.manager] = { manager: r.manager, nav: 0, dist: 0, paid: 0, totalValue: 0, n: 0 });
    a.nav += r.nav || 0;
    a.dist += r.dist || 0;
    a.paid += r.paid || 0;
    a.totalValue += r.total_value || 0;
    a.n += 1;
  });
  const strategyNav = Object.keys(raw).reduce(function (s, k) { return s + raw[k].nav; }, 0);
  const managers = Object.keys(raw).map(function (k) {
    const a = raw[k];
    return {
      manager: a.manager,
      displayName: mcDisplayName(a.manager),
      nav: a.nav,
      dist: a.dist,
      paid: a.paid,
      totalValue: a.totalValue,
      pct: strategyNav > 0 ? a.nav / strategyNav * 100 : 0,
      dpi: a.paid > 0 ? a.dist / a.paid : 0,
      tvpi: a.paid > 0 ? a.totalValue / a.paid : 0,
      vehicleCount: a.n
    };
  });
  managers.sort(function (a, b) { return b.nav - a.nav; });
  managers.forEach(function (m, i) { m.rank = i + 1; });

  const TOP_N = 5;
  const top = managers.slice(0, TOP_N);
  const remainingList = managers.slice(TOP_N);

  function mgrAgg(list, label) {
    const nav = list.reduce(function (s, m) { return s + m.nav; }, 0);
    const dist = list.reduce(function (s, m) { return s + m.dist; }, 0);
    const paid = list.reduce(function (s, m) { return s + m.paid; }, 0);
    const totalValue = list.reduce(function (s, m) { return s + m.totalValue; }, 0);
    return {
      label: label,
      count: list.length,
      nav: nav,
      pct: strategyNav > 0 ? nav / strategyNav * 100 : 0,
      dpi: paid > 0 ? dist / paid : 0,
      tvpi: paid > 0 ? totalValue / paid : 0
    };
  }
  const remaining = mgrAgg(remainingList, 'Remaining ' + remainingList.length + (remainingList.length === 1 ? ' manager' : ' managers'));
  const total = mgrAgg(managers, 'Total');

  // ---- vintage buckets (feeds both the NAV-by-vintage chart and the
  // DPI-vs-RVPI small multiples) ----
  const buckets = SDD_VINTAGE_BUCKETS.map(function (b) {
    const points = rows.filter(function (r) { return r.vintage_segment === b.segmentKey; });
    const agg = sddAggregate(points);
    agg.label = b.label;
    return agg;
  });

  const totalPortfolioNav = CFG.totalNav;

  return {
    strategyKey: strategyConfig.key,
    strategyLabel: strategyConfig.label,
    navLabel: strategyConfig.navLabel || (strategyConfig.label.toLowerCase() + ' NAV'),
    rows: rows,
    strategyNav: strategyNav,
    pctOfTotalNav: totalPortfolioNav > 0 ? strategyNav / totalPortfolioNav * 100 : 0,
    interestsCount: rows.length,
    managerCount: managers.length,
    managers: managers,
    top: top,
    remaining: remaining,
    total: total,
    buckets: buckets
  };
}

// NARRATIVE CONTENT — the 3 left-column insight points are authored
// prose with no source anywhere in the workbook (see the user's own
// framing in js/slide-data/10-strategy-deep-dive-narratives.data.js's
// header comment). sddComputeNarrative() looks up that file's
// SDD_STRATEGY_NARRATIVES by key and falls back to a clearly-labeled
// placeholder for any strategy that doesn't have real content yet,
// rather than showing blank space or silently reusing another
// strategy's copy.
function sddPlaceholderNarrative(strategyConfig) {
  return {
    subtitle: 'Secondary-market insights for ' + strategyConfig.label + ' are being developed.',
    isPlaceholder: true,
    points: [
      {
        title: strategyConfig.label + ' insights are coming soon',
        body: 'This strategy’s own secondary-market analysis has not been authored yet. Every number elsewhere on this slide — NAV, manager concentration, and vintage mix — is already live from the portfolio data; only this narrative column is pending.'
      }
    ]
  };
}

function sddComputeNarrative(strategyConfig) {
  const entry = (typeof SDD_STRATEGY_NARRATIVES !== 'undefined') ? SDD_STRATEGY_NARRATIVES[strategyConfig.key] : null;
  return entry || sddPlaceholderNarrative(strategyConfig);
}
