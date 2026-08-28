/*
 * English UI catalog. Copy this file to js/i18n/<code>.js to add a language.
 * Keep every key. Translate values only. Then:
 *   I18N.register('ar', { ... }, { dir: 'rtl', name: 'العربية' });
 */
I18N.register('en', {
  chrome: {
    documentTitle: 'PSERS Portfolio - Interactive Presentation',
    slideAria: 'Interactive presentation slide',
    slideAlt: 'Presentation slide',
    nav: 'Presentation controls',
    prevSlide: 'Previous slide',
    nextSlide: 'Next slide',
    slideNav: 'Slide navigation',
    moreOptions: 'More options',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    exportCurrent: 'Export current',
    exportAll: 'Export all',
    slideFallback: 'Slide',
    back: 'Back',
    close: 'Close'
  },
  common: {
    unknown: 'Unknown',
    interestCount: { one: '{n} interest', other: '{n} interests' },
    interests: 'interests',
    confidential: 'Confidential',
    rows: { one: '{n} row', other: '{n} rows' }
  },
  kpi: {
    nav: 'NAV',
    dpi: 'DPI',
    rvpi: 'RVPI',
    tvpi: 'TVPI',
    unfunded: 'Unfunded',
    interests: 'Interests',
    managers: 'Managers',
    totalNav: 'Total NAV',
    paidIn: 'Paid in',
    distributions: 'Distributions'
  },
  table: {
    holdingsTitle: 'Portfolio Holdings',
    holdingsSub: '{n} included interests',
    holdingsSuffix: '{title} · holdings',
    searchPlaceholder: 'Search funds, managers, strategy…',
    holdSearchPlaceholder: 'Search funds or strategy…',
    exportPdf: 'PDF',
    exportPdfTitle: 'Export the current table as PDF',
    grandTotal: 'Grand total ({n} funds)',
    sortBy: 'Sort by {label}',
    sortActive: 'Sorted {dir}. Click to reverse.',
    sortDirAsc: 'A–Z / low–high',
    sortDirDesc: 'Z–A / high–low',
    sortNumDesc: 'Sorted by {label}, high to low',
    sortNumAsc: 'Sorted by {label}, low to high',
    sortTextAsc: 'Sorted by {label}, A to Z',
    sortTextDesc: 'Sorted by {label}, Z to A',
    searchNote: 'Filtered by search “{q}”',
    col: {
      investment: 'Investment',
      manager: 'Manager',
      strategy: 'Strategy',
      vintage: 'Vintage',
      nav: 'NAV',
      unfunded: 'Unfunded',
      dpi: 'DPI',
      rvpi: 'RVPI',
      tvpi: 'TVPI'
    }
  },
  drawer: {
    portfolioTitle: 'Portfolio source data',
    portfolioSub: '{n} included interests linked to the workbook',
    linkedInterests: '{n} linked interests from the Excel source',
    openAllHoldings: 'Open all holdings',
    viewPositions: 'View positions',
    largestManagers: 'Largest managers',
    vintageNav: 'Vintage NAV',
    marketTitle: 'Market sentiment · source metrics',
    marketSub: 'Click a strategy to follow it through the deck',
    marketSection: 'Live portfolio metrics behind the market-sentiment table',
    unfundedMeta: '{n} interests · unfunded {pct}'
  },
  lens: {
    includedNavShare: '{n} included interests · {pct}% of portfolio NAV',
    includedInterests: '{n} included interests',
    includedMgrs: '{n} included interests · {mgrs} manager relationships',
    managerSub: '{count} · dominant strategy: {strategy}',
    vintageTitle: 'Vintage profile',
    vintageSub: 'Click a vintage segment to see the exact funds behind it',
    vintageSection: 'Vintage segments',
    vintageSegTitle: '{seg} vintage segment',
    vintageSegSub: 'Funds with vintage segment {seg}',
    vintageSegMeta: '{count} · DPI {dpi} · TVPI {tvpi}',
    introStrategy: 'This lens is linked directly to the strategy row on the slide. Expand a manager to see the underlying fund positions.',
    introMulti: 'Combined strategy lens. Expand each manager to see the individual funds driving the segment.',
    introManager: 'Manager lens. Click a fund row for the full position-level detail.',
    introVintage: 'Vintage segment drill-down from the chart. Expand a manager to review the underlying funds.',
    filterFunds: 'Filter funds…',
    filterFundsOrManagers: 'Filter funds or managers…',
    openTable: 'Open table',
    empty: 'No matching funds.',
    sortDefault: 'Original order',
    sortNav: 'NAV high to low',
    sortFundAz: 'Fund A-Z',
    sortManagerAz: 'Manager A-Z',
    sortVintage: 'Vintage newest',
    sortDpi: 'DPI high to low',
    sortMostFunds: 'Most funds',
    fundMeta: 'Vintage {vintage} · DPI {dpi} · TVPI {tvpi}',
    groupMeta: '{count} · {strategy} · DPI {dpi} · TVPI {tvpi}'
  },
  pdf: {
    confidential: 'Confidential',
    brand: 'TANGIBLE'
  },
  error: {
    openView: 'Something went wrong opening this view',
    load: 'There was an error loading the interactive presentation. Please reopen the file or refresh.'
  },
  hotspot: {
    openLinked: 'Open linked data'
  }
}, { dir: 'ltr', name: 'English' });

I18N.init();
