// SDD_STRATEGY_NARRATIVES — the subtitle + 3 numbered "insight" points
// shown in Strategy Deep Dive's left column, keyed by the same strategy
// `key` as SDD_STRATEGIES (js/slide-data/10-strategy-deep-dive.data.js).
//
// Deliberately a SEPARATE file from 10-strategy-deep-dive.data.js: every
// number in that file is computed live from CFG.rows (Excel-derived);
// this file is pure authored prose with NO source anywhere in the
// workbook. Real Estate and Infrastructure share one authored sleeve
// (the "Real Estate & Infrastructure" design).
const SDD_RE_INFRA_NARRATIVE = {
  subtitle: 'Real Estate has already paid back more than it holds while Infrastructure has barely begun distributing, so the two sit at opposite ends of their life',
  points: [
    {
      title: 'Real estate’s 1.13x DPI shifts the focus to whether the remaining assets generate cash or still require refinancing or development',
      body: 'Historical distributions provide a proven track record, but buyers will price asset by asset and their path to exit. Assets with current income, manageable leverage and recent valuation support attract strong bids, while positions dependent on leasing, refinancing or completing the business plan face wider discounts.'
    },
    {
      title: '51% sits with Stockbridge, Blackstone and Brookfield',
      body: 'These are the three deepest relationships in the sleeve, so selling all three as a block would effectively end them. Carving out individual vintages within each manager raises meaningful proceeds and keeps the relationships intact. Our buyer base has shown active interest in Blackstone vehicles, so the demand is there to work with.'
    },
    {
      title: 'The three largest manager exposures provide a reliable way to test the market',
      body: 'Stockbridge, Blackstone and Brookfield account for half of these segments. Carving out selected funds or vintages within each manager can generate meaningful proceeds while preserving the broader relationships. Tangible has seen active buyer interest in Blackstone vehicles, so selected vintages can test pricing without selling the sleeve as a block.'
    }
  ]
};

const SDD_STRATEGY_NARRATIVES = {
  'private-equity': {
    subtitle: 'The scale and diversification of the PE portfolio creates multiple paths to liquidity, depending on PSERS’ objectives',
    points: [
      {
        title: 'Buyer demand favors the 2019–2021 positions, while the pre-2016 tail will require specialised investors',
        body: 'Pricing will be driven by the quality and concentration of the remaining assets, current marks compared to the market and expected exits. The 2019-2021 vintages will be the sweet spot for secondary buyers as they are seasoned enough to underwrite, with meaningful value still to be realised.'
      },
      {
        title: 'Each fund will be priced based on the quality of the remaining portfolio rather than its historical performance',
        body: 'Headline fund metrics provide a starting point, but secondary pricing will be driven by underlying asset performance, leverage, valuations compared to current market and expected realisations.'
      },
      {
        title: 'Well-covered managers create more competition, while buyer demand expands across the mid-market',
        body: '61% is concentrated with global platforms at 1.70x, while a sizeable further 24% sits with established mid-market managers at 1.37x, broadening the buyer universe and giving buyers meaningful exposure to proven positions rather than a portfolio reliant solely on mega-fund names.'
      }
    ]
  },

  'credit': {
    subtitle: 'Credit pricing is driven by bottom-up underwriting, with buyers looking through the loan tapes and underlying assets rather than fund-level metrics.',
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

  'real-estate': SDD_RE_INFRA_NARRATIVE,
  'infrastructure': SDD_RE_INFRA_NARRATIVE,

  'growth-venture': {
    subtitle: 'VC buyers are underwriting on an underlying asset basis, targeting specific companies they like and the funds that hold them.',
    points: [
      {
        title: '84% of the sleeve is in the software-led technology vintages',
        body: 'The 2019–2021 funds bought software at peak valuations. Whether those companies keep pace with AI adoption is the judgement a buyer is making, and it is why marks from this vintage are treated with more scepticism than elsewhere. Low DPI is normal in venture, but alongside unproven marks it widens the spread of bids rather than lowering all of them.'
      },
      {
        title: '55% of the sleeve is 2019 or later, sitting at 0.24x DPI',
        body: 'Pricing is bifurcated rather than uniform: funds holding identifiable, underwritable assets can attract NAV-level pricing, while the rest is likely to take a blanket discount. With just 0.24x DPI vs. 1.33x for pre-2019 funds, asset quality will be a key driver of the outcome.'
      },
      {
        title: '40% of NAV is concentrated in 2 managers',
        body: '23% of the sleeve is spread across ten Insight funds, with materially different performance profiles across vintages. We have also seen significant volatility in secondary pricing for these funds, so buyers are likely to underwrite each position on its own merits rather than apply a uniform discount to the Insight exposure.'
      }
    ]
  }
};
