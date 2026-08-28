// Hardcoded Market Sentiment cohorts. Numbers come from the source
// slides, not from Excel. Add or change a combo here.

const MARKET_SENTIMENT_DATA = {
  title: 'Market Sentiment by Strategy and Vintage',
  defaultStrategy: 'Private Credit',
  defaultVintageSegment: '2022+',

  strategies: ['Private Equity', 'Private Credit', 'Real Estate', 'Infrastructure', 'Growth & Venture'],
  strategyDisplayLabels: {
    'Private Equity': 'Private Equity',
    'Private Credit': 'Private Credit',
    'Real Estate': 'Real Estate',
    'Infrastructure': 'Infrastructure',
    'Growth & Venture': 'Growth & Venture'
  },

  vintageScale: [
    { key: 'Pre-2013', label: 'Pre-2013', tagKey: 'unfavourable' },
    { key: '2013-2015', label: '2013-2015', tagKey: 'moderate' },
    { key: '2016-2018', label: '2016-2018', tagKey: 'favourable' },
    { key: '2019-2021', label: '2019-2021', tagKey: 'moderate' },
    { key: '2022+', label: '2022+', tagKey: 'unfavourable' }
  ],
  unfundedBands: [
    { label: 'Under 15%', tagKey: 'favourable' },
    { label: '15% - 30%', tagKey: 'moderate' },
    { label: 'Over 30%', tagKey: 'unfavourable' }
  ],
  dpiBands: [
    { label: 'Under 0.25x', tagKey: 'unfavourable' },
    { label: '0.25 - 0.75x', tagKey: 'moderate' },
    { label: 'Over 0.75x', tagKey: 'favourable' }
  ],
  tvpiBands: [
    { label: 'Under 1.2x', tagKey: 'unfavourable' },
    { label: '1.2 - 1.7x', tagKey: 'moderate' },
    { label: 'Over 1.7x', tagKey: 'favourable' }
  ],

  pricing: {
    heading: 'Indicative Pricing',
    subheading: 'Estimated transaction pricing and corresponding cash proceeds based on current market sentiment.',
    rangeSuffix: 'of Net Asset Value',
    barScaleMin: 5,
    barScaleMax: 105,
    netSaleProceedsUnit: 'M',
    driversHeading: 'Pricing Drivers',
    driversSubheading: 'Four attributes that typically influence how funds in this strategy are priced. The marker shows where this fund sits on each.'
  },

  todayYear: 2026,
  transactionLagYears: 2,
  reinvestRateDefault: 0.10,

  sellVsHold: {
    heading: 'Sell vs Hold',
    subheading: 'Compares the expected net money multiple at fund maturity between holding the investment and selling today to reinvest the proceeds elsewhere.',
    legend: [
      { key: 'hold', label: 'Hold', color: '#414a63' },
      { key: 'sell10', label: 'Sell low', color: '#4a9e7d' },
      { key: 'sell25', label: 'Sell high', color: '#c48a3c' }
    ],
    transactionDateLabel: 'Transaction date',
    todayLabel: 'Today',
    sourceNote: 'Source: Tangible analysis; illustrative. Multiples stated on capital called.'
  },

  footnote: '* Pricing remains subject to further portfolio information, review of underlying valuation marks and buyer due diligence, and should not be interpreted as binding indications of interest.',

  cohorts: {
    'Private Equity': {
      'Pre-2016': {
        rangeLow: 55, rangeHigh: 65, proceedsLow: 523, proceedsHigh: 618, discountLow: 35, discountHigh: 45,
        vintageYear: 2013, vintageTag: 'moderate', vintageBand: 1,
        unfunded: 6.6, unfundedTag: 'favourable', unfundedBand: 0,
        dpi: 1.46, dpiTag: 'favourable', dpiBand: 2,
        tvpi: 1.61, tvpiTag: 'moderate', tvpiBand: 1,
        fundEndYear: 2030, expectedTVPI: 1.64,
        holdEnd: 1.61, sellLowEnd: 1.60, sellHighEnd: 1.58
      },
      '2016-2018': {
        rangeLow: 65, rangeHigh: 80, proceedsLow: 1366, proceedsHigh: 1681, discountLow: 20, discountHigh: 35,
        vintageYear: 2017, vintageTag: 'favourable', vintageBand: 2,
        unfunded: 12.2, unfundedTag: 'favourable', unfundedBand: 0,
        dpi: 1.12, dpiTag: 'favourable', dpiBand: 2,
        tvpi: 1.80, tvpiTag: 'favourable', tvpiBand: 2,
        fundEndYear: 2030, expectedTVPI: 1.98,
        holdEnd: 1.94, sellLowEnd: 1.92, sellHighEnd: 1.77
      },
      '2019-2021': {
        rangeLow: 75, rangeHigh: 90, proceedsLow: 1685, proceedsHigh: 2022, discountLow: 10, discountHigh: 25,
        vintageYear: 2020, vintageTag: 'favourable', vintageBand: 3,
        unfunded: 12.8, unfundedTag: 'favourable', unfundedBand: 0,
        dpi: 0.58, dpiTag: 'moderate', dpiBand: 1,
        tvpi: 1.51, tvpiTag: 'moderate', tvpiBand: 1,
        fundEndYear: 2032, expectedTVPI: 1.81,
        holdEnd: 1.77, sellLowEnd: 2.06, sellHighEnd: 1.81
      },
      '2022+': {
        rangeLow: 55, rangeHigh: 65, proceedsLow: 311, proceedsHigh: 368, discountLow: 35, discountHigh: 45,
        vintageYear: 2023, vintageTag: 'unfavourable', vintageBand: 4,
        unfunded: 53.2, unfundedTag: 'unfavourable', unfundedBand: 2,
        dpi: 0.09, dpiTag: 'unfavourable', dpiBand: 0,
        tvpi: 1.03, tvpiTag: 'unfavourable', tvpiBand: 0,
        fundEndYear: 2035, expectedTVPI: 1.69,
        holdEnd: 1.66, sellLowEnd: 1.53, sellHighEnd: 1.30
      }
    },
    'Private Credit': {
      'Pre-2015': {
        rangeLow: 35, rangeHigh: 55, proceedsLow: 703, proceedsHigh: 1105, discountLow: 45, discountHigh: 65,
        vintageYear: 2014, vintageTag: 'moderate', vintageBand: 1,
        unfunded: 11.6, unfundedTag: 'favourable', unfundedBand: 0,
        dpi: 1.03, dpiTag: 'favourable', dpiBand: 2,
        tvpi: 1.33, tvpiTag: 'moderate', tvpiBand: 1,
        fundEndYear: 2030, expectedTVPI: 1.36,
        holdEnd: 1.33, sellLowEnd: 1.27, sellHighEnd: 1.18
      },
      '2016-2018': {
        rangeLow: 65, rangeHigh: 75, proceedsLow: 757, proceedsHigh: 874, discountLow: 25, discountHigh: 35,
        vintageYear: 2017, vintageTag: 'favourable', vintageBand: 2,
        unfunded: 41.4, unfundedTag: 'unfavourable', unfundedBand: 2,
        dpi: 0.97, dpiTag: 'favourable', dpiBand: 2,
        tvpi: 1.43, tvpiTag: 'moderate', tvpiBand: 1,
        fundEndYear: 2030, expectedTVPI: 1.64,
        holdEnd: 1.61, sellLowEnd: 1.47, sellHighEnd: 1.40
      },
      '2019-2021': {
        rangeLow: 75, rangeHigh: 85, proceedsLow: 1138, proceedsHigh: 1289, discountLow: 15, discountHigh: 25,
        vintageYear: 2020, vintageTag: 'favourable', vintageBand: 3,
        unfunded: 38.3, unfundedTag: 'unfavourable', unfundedBand: 2,
        dpi: 0.67, dpiTag: 'moderate', dpiBand: 1,
        tvpi: 1.31, tvpiTag: 'moderate', tvpiBand: 1,
        fundEndYear: 2035, expectedTVPI: 1.63,
        holdEnd: 1.60, sellLowEnd: 1.95, sellHighEnd: 1.80
      },
      '2022+': {
        rangeLow: 75, rangeHigh: 90, proceedsLow: 730, proceedsHigh: 876, discountLow: 10, discountHigh: 25,
        vintageYear: 2023, vintageTag: 'unfavourable', vintageBand: 4,
        unfunded: 59.3, unfundedTag: 'unfavourable', unfundedBand: 2,
        dpi: 0.39, dpiTag: 'moderate', dpiBand: 1,
        tvpi: 1.29, tvpiTag: 'moderate', tvpiBand: 1,
        fundEndYear: 2035, expectedTVPI: 1.67,
        holdEnd: 1.64, sellLowEnd: 2.29, sellHighEnd: 1.98
      }
    },
    'Real Estate': {
      'Pre-2015': {
        rangeLow: 25, rangeHigh: 45, proceedsLow: 403, proceedsHigh: 726, discountLow: 55, discountHigh: 75,
        vintageYear: 2004, vintageTag: 'unfavourable', vintageBand: 0,
        unfunded: 5.9, unfundedTag: 'favourable', unfundedBand: 0,
        dpi: 1.35, dpiTag: 'favourable', dpiBand: 2,
        tvpi: 1.65, tvpiTag: 'moderate', tvpiBand: 1,
        fundEndYear: 2030, expectedTVPI: 1.65,
        holdEnd: 1.62, sellLowEnd: 1.55, sellHighEnd: 1.46
      },
      '2016-2018': {
        rangeLow: 65, rangeHigh: 75, proceedsLow: 1388, proceedsHigh: 1602, discountLow: 25, discountHigh: 35,
        vintageYear: 2017, vintageTag: 'favourable', vintageBand: 2,
        unfunded: 19.8, unfundedTag: 'moderate', unfundedBand: 1,
        dpi: 1.54, dpiTag: 'favourable', dpiBand: 2,
        tvpi: 2.58, tvpiTag: 'favourable', tvpiBand: 2,
        fundEndYear: 2030, expectedTVPI: 2.71,
        holdEnd: 2.66, sellLowEnd: 2.69, sellHighEnd: 2.53
      },
      '2019-2021': {
        rangeLow: 65, rangeHigh: 80, proceedsLow: 824, proceedsHigh: 1014, discountLow: 20, discountHigh: 35,
        vintageYear: 2020, vintageTag: 'favourable', vintageBand: 3,
        unfunded: 15.0, unfundedTag: 'favourable', unfundedBand: 1,
        dpi: 0.27, dpiTag: 'moderate', dpiBand: 1,
        tvpi: 1.18, tvpiTag: 'unfavourable', tvpiBand: 0,
        fundEndYear: 2032, expectedTVPI: 1.35,
        holdEnd: 1.33, sellLowEnd: 1.56, sellHighEnd: 1.31
      },
      '2022+': {
        rangeLow: 60, rangeHigh: 75, proceedsLow: 398, proceedsHigh: 497, discountLow: 25, discountHigh: 40,
        vintageYear: 2023, vintageTag: 'favourable', vintageBand: 4,
        unfunded: 43.4, unfundedTag: 'unfavourable', unfundedBand: 2,
        dpi: 0.02, dpiTag: 'unfavourable', dpiBand: 0,
        tvpi: 0.90, tvpiTag: 'unfavourable', tvpiBand: 0,
        fundEndYear: 2035, expectedTVPI: 1.26,
        holdEnd: 1.24, sellLowEnd: 1.58, sellHighEnd: 1.27
      }
    },
    'Infrastructure': {
      '2016-2018': {
        rangeLow: 75, rangeHigh: 85, proceedsLow: 840, proceedsHigh: 952, discountLow: 15, discountHigh: 25,
        vintageYear: 2018, vintageTag: 'favourable', vintageBand: 2,
        unfunded: 14.6, unfundedTag: 'favourable', unfundedBand: 0,
        dpi: 0.75, dpiTag: 'moderate', dpiBand: 1,
        tvpi: 1.90, tvpiTag: 'favourable', tvpiBand: 2,
        fundEndYear: 2030, expectedTVPI: 2.09,
        holdEnd: 2.05, sellLowEnd: 2.18, sellHighEnd: 2.01
      },
      '2019-2021': {
        rangeLow: 75, rangeHigh: 90, proceedsLow: 894, proceedsHigh: 1073, discountLow: 10, discountHigh: 25,
        vintageYear: 2020, vintageTag: 'favourable', vintageBand: 3,
        unfunded: 41.0, unfundedTag: 'unfavourable', unfundedBand: 2,
        dpi: 0.13, dpiTag: 'unfavourable', dpiBand: 0,
        tvpi: 1.50, tvpiTag: 'moderate', tvpiBand: 1,
        fundEndYear: 2032, expectedTVPI: 1.96,
        holdEnd: 1.92, sellLowEnd: 2.32, sellHighEnd: 1.96
      },
      '2022+': {
        rangeLow: 75, rangeHigh: 85, proceedsLow: 1403, proceedsHigh: 1590, discountLow: 15, discountHigh: 25,
        vintageYear: 2023, vintageTag: 'favourable', vintageBand: 4,
        unfunded: 42.1, unfundedTag: 'unfavourable', unfundedBand: 2,
        dpi: 0.08, dpiTag: 'unfavourable', dpiBand: 0,
        tvpi: 1.28, tvpiTag: 'moderate', tvpiBand: 1,
        fundEndYear: 2035, expectedTVPI: 1.93,
        holdEnd: 1.89, sellLowEnd: 2.49, sellHighEnd: 2.21
      }
    },
    'Growth & Venture': {
      'Pre-2015': {
        rangeLow: 50, rangeHigh: 60, proceedsLow: 291, proceedsHigh: 350, discountLow: 40, discountHigh: 50,
        vintageYear: 2014, vintageTag: 'moderate', vintageBand: 1,
        unfunded: 3.8, unfundedTag: 'favourable', unfundedBand: 0,
        dpi: 1.46, dpiTag: 'favourable', dpiBand: 2,
        tvpi: 1.81, tvpiTag: 'favourable', tvpiBand: 2,
        fundEndYear: 2030, expectedTVPI: 1.81,
        holdEnd: 1.77, sellLowEnd: 1.77, sellHighEnd: 1.72
      },
      '2016-2018': {
        rangeLow: 65, rangeHigh: 75, proceedsLow: 630, proceedsHigh: 727, discountLow: 25, discountHigh: 35,
        vintageYear: 2017, vintageTag: 'favourable', vintageBand: 2,
        unfunded: 14.9, unfundedTag: 'favourable', unfundedBand: 0,
        dpi: 1.08, dpiTag: 'favourable', dpiBand: 2,
        tvpi: 2.22, tvpiTag: 'favourable', tvpiBand: 2,
        fundEndYear: 2030, expectedTVPI: 2.33,
        holdEnd: 2.29, sellLowEnd: 2.33, sellHighEnd: 2.17
      },
      '2019-2021': {
        rangeLow: 50, rangeHigh: 65, proceedsLow: 779, proceedsHigh: 1012, discountLow: 35, discountHigh: 50,
        vintageYear: 2020, vintageTag: 'favourable', vintageBand: 3,
        unfunded: 15.4, unfundedTag: 'moderate', unfundedBand: 1,
        dpi: 0.28, dpiTag: 'moderate', dpiBand: 1,
        tvpi: 1.46, tvpiTag: 'moderate', tvpiBand: 1,
        fundEndYear: 2032, expectedTVPI: 1.61,
        holdEnd: 1.58, sellLowEnd: 1.64, sellHighEnd: 1.33
      },
      '2022+': {
        rangeLow: 70, rangeHigh: 90, proceedsLow: 232, proceedsHigh: 299, discountLow: 10, discountHigh: 30,
        vintageYear: 2023, vintageTag: 'favourable', vintageBand: 4,
        unfunded: 29.8, unfundedTag: 'moderate', unfundedBand: 1,
        dpi: 0.05, dpiTag: 'unfavourable', dpiBand: 0,
        tvpi: 1.23, tvpiTag: 'moderate', tvpiBand: 1,
        fundEndYear: 2035, expectedTVPI: 1.97,
        holdEnd: 1.93, sellLowEnd: 2.55, sellHighEnd: 2.00
      }
    }
  }
};
