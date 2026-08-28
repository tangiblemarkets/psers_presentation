// SDD_STRATEGY_NARRATIVES — the subtitle + 3 numbered "insight" points
// shown in Strategy Deep Dive's left column, keyed by the same strategy
// `key` as SDD_STRATEGIES (js/slide-data/10-strategy-deep-dive.data.js).
//
// Deliberately a SEPARATE file from 10-strategy-deep-dive.data.js: every
// number in that file is computed live from CFG.rows (Excel-derived);
// this file is pure authored prose with NO source anywhere in the
// workbook. Real Estate and Infrastructure share one authored sleeve.
const SDD_RE_INFRA_NARRATIVE = {
  subtitle: 'Real Estate discounts reflect valuation uncertainty and limited comparable sales, while Infrastructure supports stronger pricing',
  points: [
    {
      title: 'Real estate’s 1.13x DPI shifts the focus to whether the remaining assets generate cash or still require refinancing or development',
      body: 'Historical distributions provide a proven track record, but buyers will price asset by asset and their path to exit. Assets with current income, manageable leverage and recent valuation support attract strong bids, while positions dependent on leasing, refinancing or completing the business plan face wider discounts.'
    },
    {
      title: 'Infrastructure remains early in its investment life, with nearly half of NAV invested across the 2022–2026 vintages',
      body: 'The portfolio has returned 0.28x DPI, consistent with its younger profile. Buyers will assess how far the underlying assets have progressed toward stable cash generation and how much capital is still required.'
    },
    {
      title: 'The three largest manager exposures provide a reliable way to test the market',
      body: 'Stockbridge, Blackstone and Brookfield account for half of these segments. Carving out selected funds or vintages within each manager can generate meaningful proceeds while preserving the broader relationships. Tangible has seen active buyer interest in Blackstone vehicles.'
    }
  ]
};

const SDD_STRATEGY_NARRATIVES = {
  'private-equity': {
    subtitle: 'The scale and diversification of the PE portfolio creates multiple paths to liquidity, and depends on PSERS’ objectives',
    points: [
      {
        title: 'Buyer demand favors the 2019–2021 positions, while the pre-2016 tail will require specialised investors',
        body: 'Pricing will be driven by the quality and concentration of the remaining assets, current marks compared to the market and expected exits. The 2019–2021 vintages will be the sweet spot for secondary buyers as they are seasoned enough to underwrite, with meaningful value still to be realised.'
      },
      {
        title: 'Each fund will be priced based on the quality of the remaining portfolio rather than headline performance',
        body: 'Headline fund metrics provide a starting point, but secondary pricing will be driven by underlying asset performance, leverage, valuations compared to current market and expected realisations.'
      },
      {
        title: 'Well-covered managers create more competition, while buyer demand expands across the mid-market',
        body: '61% is concentrated with global platforms at 1.70x, while a sizeable further 24% sits with established mid-market managers at 1.37x, broadening the buyer universe and giving buyers meaningful exposure to proven positions rather than a portfolio reliant solely on mega-fund names.'
      }
    ]
  },

  'credit': {
    subtitle: 'Credit pricing is driven by bottom-up underwriting, with buyers focusing on the loan tapes and underlying assets rather than fund-level metrics',
    points: [
      {
        title: '$3.6bn invested with managers Tangible’s buyer base actively tracks',
        body: 'Tangible has transacted meaningful volume in Apollo, Cerberus and Blackstone funds as recently as Q2 2026, with the remaining names also well covered through our market activity and buyer relationships. This familiarity provides useful reference points on pricing, liquidity and transferability across the majority of the sleeve.'
      },
      {
        title: 'Half of private credit NAV requires a different process from standard secondary transactions',
        body: 'Funds-of-one and nine single-asset co-investments account for 49% of private credit NAV. Funds-of-one require closer GP coordination, while co-investments are better suited to direct credit buyers. These positions will need tailored underwriting and a separate route to market.'
      },
      {
        title: 'Recent liquidity events drew public attention, but secondary market pricing remains stable, although dispersed',
        body: 'Redemptions and discounted tender offers drew public attention but have not led to significant weakness in secondary pricing. Pricing dispersion reflects differences in the underlying assets, including quality and borrower performance, seniority, concentration and expected repayment.'
      }
    ]
  },

  'real-estate-infra': SDD_RE_INFRA_NARRATIVE,

  'growth-venture': {
    subtitle: 'Pricing will be driven by asset mix, with AI-linked exposure attracting stronger demand and broader SaaS facing greater discount pressure',
    points: [
      {
        title: 'Software accounts for 84% of NAV, but pricing will diverge between AI-linked and broader SaaS exposure',
        body: 'The market is selective. AI-linked assets continue to attract stronger demand and higher pricing, while broader SaaS and non-AI growth exposure face discount pressure amid weaker public comparables and slower exit activity. This divergence is directly impacting discount levels.'
      },
      {
        title: 'The 2019–2021 vintages have peak-cycle entry valuations with limited realisations',
        body: 'With nearly half of Growth & VC NAV, the portfolio was largely invested in 2019–2021, at peak valuation levels, and have returned only 0.28x DPI. Buyers will test current marks against company performance since entry, with recent financings and visible exit paths supporting tighter pricing.'
      },
      {
        title: 'Manager quality supports demand, but does not protect weaker funds from wider discounts',
        body: 'Insight and LLR account for 40% of NAV and benefit from broad market coverage. Tangible has seen significant volatility in secondary pricing for these funds, with buyers underwriting each position on its own merits rather than apply a uniform discount to the Insight exposure.'
      }
    ]
  }
};
