// MARKET_SENTIMENT_DATA — configuration + methodology constants for the
// "Market Sentiment by Strategy and Vintage" slide (js/pages/09-market-
// sentiment.js).
//
// As of Round 83, this slide is fully dynamic: the user picks a Strategy
// and a Vintage band from two dropdowns on the slide itself, and EVERY
// number on both panels (Indicative Pricing + Sell vs Hold) is computed
// live, in the browser, from CFG.rows (js/data.js, itself Excel-pipeline-
// derived as of Round 73) filtered to that one strategy+vintage-band
// cohort — not baked into this file per combination, and not written by
// a Python exporter either. There is no server/build step to re-run when
// the workbook changes for THIS slide specifically: CFG.rows already
// updates from `python3 tools/export.py` same as every other slide, and
// this slide reads CFG.rows directly at render/interaction time.
//
// This file holds only what does NOT come from the Excel workbook: the
// slide's fixed styling/copy, and Tangible's own forward-looking pricing/
// underwriting assumptions (see "PRICING METHODOLOGY" below), which have
// no source column anywhere in the workbook — confirmed by checking all
// 3 sheets (Summary, Raw Data, Clean Data) for anything resembling a
// pricing/discount/expected-return assumption before writing any of this.
//
// See js/pages/09-market-sentiment.js for the actual per-cohort
// computation (msComputeCohort(), msBuildDrivers(), msBuildPricing(),
// msBuildSellVsHold()) and the dropdown wiring.
//
// PRICING METHODOLOGY (Round 83) — genuinely NOT derivable from the
// workbook; these are placeholder, illustrative defaults the user
// explicitly asked to be built now ("fixed defaults, editable later" —
// not real Tangible underwriting judgment per cohort, which does not
// exist anywhere in the data this deck has access to). Whoever owns this
// slide's numbers should feel free to replace these constants (or the
// pricingScoreTable bands) with real assumptions at any time — nothing
// else in this file or the render code needs to change to do so.
//
//   - Each of the 4 Pricing Drivers (vintage band, unfunded %, DPI, TVPI)
//     scores -1 (Unfavourable) / 0 (Moderate) / +1 (Favourable) for the
//     selected cohort. The 4 scores sum to one number from -4 to +4,
//     which `pricingScoreTable` maps to a NAV-price range and a discount-
//     to-NAV range. The score-0 band (75-90% of NAV, 10-25% discount) is
//     exactly the range the very first version of this slide (Round 42's
//     Figma mockup) showed for Private Credit/2022+ — that cohort's own
//     driver scores (Favourable/Unfavourable/Moderate/Moderate) sum to
//     0 — so the table's middle band is anchored to a real prior example,
//     not invented from nothing. Net Sale Proceeds = cohort NAV x this
//     range — reproduces that same mockup's $730M-$876M exactly given the
//     cohort's real NAV (~$973.5M) and the 75-90% band, which is a strong
//     sign this mechanical relationship (not just the score-0 band) was
//     already implicit in the original mockup.
//   - Expected TVPI = current cohort TVPI x tvpiUpliftFactor (a flat 15%
//     uplift assumption for value creation between now and fund
//     maturity). This is the one number that does NOT reproduce the old
//     mockup's placeholder (1.67x) — that figure didn't correspond to any
//     clean rule against the mockup's own 1.29x current TVPI, so rather
//     than reverse-engineer a coincidence, this uses a clean, documented
//     default instead.
//   - Reinvestment rate = reinvestRateDefault for every cohort (10% p.a.
//     — matches the old mockup's own value exactly).
//   - Fund end year = round(cohort's commitment-weighted average vintage)
//     + fundLifeYears, floored at (today + transactionLagYears +
//     minHorizonYears) so an old, near-fully-realized cohort still gets a
//     sensible multi-year chart instead of a negative/zero horizon. For
//     Private Credit/2022+ this reproduces the old mockup's 2035 exactly
//     (round(2023.1) + 12 = 2035).
//
// VINTAGE-BAND FAVOURABILITY (the "Weighted Avg Vintage" driver's own
// scoring scale) is a fixed bell curve, not derived from the workbook
// either: 2016-2018 is the "sweet spot" (seasoned enough to have a real
// track record and distributions, young enough to still offer a buyer
// meaningful remaining upside) and both extremes score Unfavourable. This
// also fixes a real inconsistency the pre-Round-74 file had: its one
// baked-in example (Private Credit, 2022+) positioned the vintage marker
// in the 2016-2018 (Favourable) segment even though the cohort's own
// filter is 2022+, which this same segments array marks Unfavourable —
// see this file's Round-42-era comment history in project memory
// (psers_v7_round42_market_sentiment.md). Since a cohort's weighted-
// average vintage can only ever fall inside its own selected vintage
// band (a 2022+-filtered cohort's average vintage is always >= 2022),
// the driver's tag/marker below is derived directly from the SELECTED
// vintage band rather than re-bucketing the computed average — mathematically
// identical, and it can never drift out of sync with the dropdown again.

const MARKET_SENTIMENT_DATA = {
  title: 'Market Sentiment by Strategy and Vintage',

  // Default cohort shown when the slide first loads. Both must be a real,
  // non-empty combination (checked at render time; msComputeCohort()
  // throws loudly if not, rather than silently rendering a blank/NaN
  // slide) — Private Credit/2022+ is the cohort this slide has always
  // shown, and has 15 underlying positions.
  defaultStrategy: 'Credit',
  defaultVintageSegment: '2022+',

  // Ordered strategies (Strategy dropdown option order) — the same 5
  // legacy-taxonomy categories tools/export_strategy_mix.py's
  // STRATEGY_META uses, in the same order, plus "Special Situations"
  // (CFG.rows' 6th strategy value, not separately broken out on Strategy
  // Mix) appended at the end.
  strategies: ['Buyout', 'Real Estate', 'Credit', 'Infrastructure', 'Growth & Venture', 'Special Situations'],

  // CFG.rows `strategy` value -> display label. Only "Credit" differs
  // from its literal CFG.rows value, matching the phrase ("Private
  // Credit") this slide has always used.
  strategyDisplayLabels: {
    'Buyout': 'Buyout',
    'Real Estate': 'Real Estate',
    'Credit': 'Private Credit',
    'Infrastructure': 'Infrastructure',
    'Growth & Venture': 'Growth & Venture',
    'Special Situations': 'Special Situations'
  },

  // Vintage bands, in order, each with its fixed favourability tag (see
  // "VINTAGE-BAND FAVOURABILITY" above). Keys must match CFG.rows'
  // vintage_segment values exactly (tools/export_cfg_rows.py).
  vintageSegments: [
    { key: 'Pre-2013',  label: 'Pre-2013',  tagKey: 'unfavourable' },
    { key: '2013-2015', label: '2013-2015', tagKey: 'moderate' },
    { key: '2016-2018', label: '2016-2018', tagKey: 'favourable' },
    { key: '2019-2021', label: '2019-2021', tagKey: 'moderate' },
    { key: '2022+',     label: '2022+',     tagKey: 'unfavourable' }
  ],

  // Unfunded / DPI / TVPI band definitions — thresholds match CFG.rows'
  // own unfunded_segment/dpi_segment/tvpi_segment bucket boundaries
  // exactly (tools/export_cfg_rows.py), so a cohort's tag here always
  // agrees with how that same fund buckets elsewhere in the deck.
  // `max` is an exclusive upper bound checked in array order.
  unfundedBands: [
    { max: 0.15, label: 'Under 15%',   tagKey: 'favourable' },
    { max: 0.30, label: '15% - 30%',   tagKey: 'moderate' },
    { max: Infinity, label: 'Over 30%', tagKey: 'unfavourable' }
  ],
  dpiBands: [
    { max: 0.25, label: 'Under 0.25x',  tagKey: 'unfavourable' },
    { max: 0.75, label: '0.25 - 0.75x', tagKey: 'moderate' },
    { max: Infinity, label: 'Over 0.75x', tagKey: 'favourable' }
  ],
  tvpiBands: [
    { max: 1.2, label: 'Under 1.2x',  tagKey: 'unfavourable' },
    { max: 1.7, label: '1.2 - 1.7x',  tagKey: 'moderate' },
    { max: Infinity, label: 'Over 1.7x', tagKey: 'favourable' }
  ],

  pricing: {
    heading: 'Indicative Pricing',
    subheading: 'Estimated transaction pricing and corresponding cash proceeds based on current market sentiment.',
    rangeSuffix: 'of Net Asset Value',
    // The range bar's own scale runs 5-105 (not 0-100) — a deliberate bit
    // of headroom at both ends carried over from the original Figma
    // export, not a bug.
    barScaleMin: 5,
    barScaleMax: 105,
    netSaleProceedsUnit: 'M',
    driversHeading: 'Pricing Drivers',
    driversSubheading: 'Four attributes that typically influence how funds in this strategy are priced. The marker shows where this fund sits on each.'
  },

  // score (-4..+4, the 4 drivers' Unfavourable=-1/Moderate=0/Favourable=+1
  // tags summed) -> NAV-price range (%) + discount-to-NAV range (%). See
  // "PRICING METHODOLOGY" above. Checked top-down, first band whose
  // `minScore` the cohort's score meets or exceeds wins.
  pricingScoreTable: [
    { minScore: 3,          rangeLow: 90, rangeHigh: 98, discountLow: 0,  discountHigh: 10 },
    { minScore: 1,          rangeLow: 85, rangeHigh: 95, discountLow: 5,  discountHigh: 15 },
    { minScore: -1,         rangeLow: 75, rangeHigh: 90, discountLow: 10, discountHigh: 25 },
    { minScore: -3,         rangeLow: 65, rangeHigh: 80, discountLow: 20, discountHigh: 30 },
    { minScore: -Infinity,  rangeLow: 55, rangeHigh: 70, discountLow: 30, discountHigh: 45 }
  ],

  tvpiUpliftFactor: 1.15,
  reinvestRateDefault: 0.10,
  fundLifeYears: 12,
  transactionLagYears: 2,
  minHorizonYears: 3,
  // The deck's own fixed "as of" reference date (matches every other
  // slide's data, all "as at 31 March 2026") — NOT the real wall-clock
  // date, deliberately, for the same reason the chrome-year chip on every
  // slide reads "2026" regardless of when the deck is actually opened.
  todayYear: 2026,

  sellVsHold: {
    heading: 'Sell vs Hold',
    subheading: 'Compares the expected net money multiple at fund maturity between holding the investment and selling today to reinvest the proceeds elsewhere.',
    // `label` is a fallback only — js/pages/09-market-sentiment.js always
    // overrides sell10/sell25's labels with the cohort's own actual
    // discount percentages (e.g. "Sell at 23%"), since discountLow/High
    // now vary by cohort instead of being the fixed 10%/25% this slide
    // used to hardcode.
    legend: [
      { key: 'hold',   label: 'Hold',     color: '#414a63' },
      { key: 'sell10', label: 'Sell low',  color: '#4a9e7d' },
      { key: 'sell25', label: 'Sell high', color: '#c48a3c' }
    ],
    transactionDateLabel: 'Transaction date',
    todayLabel: 'Today',
    sourceNote: 'Source: Tangible analysis; illustrative. Multiples stated on capital called.'
  },

  footnote: '* Pricing remains subject to further portfolio information, review of underlying valuation marks and buyer due diligence, and should not be interpreted as binding indications of interest.'
};
