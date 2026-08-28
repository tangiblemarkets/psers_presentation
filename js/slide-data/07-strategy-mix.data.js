// STRATEGY_MIX_DATA — colors + authored commentary only.
// Table and drawer numbers both come from CFG.rows (slideStrategy).
const STRATEGY_MIX_DATA = {
  strategies: [
    {name:'Private Equity', color:'#104130'},
    {name:'Real Estate', color:'#1b5a43'},
    {name:'Private Credit', color:'#2e735a'},
    {name:'Infrastructure', color:'#53967b'},
    {name:'Growth & Venture', color:'#82b69e'}
  ],
  vintages: [
    {label:'Pre-2013', segmentKey:'Pre-2013', color:'#104130'},
    {label:'2013-2015', segmentKey:'2013-2015', color:'#2f7a5b'},
    {label:'2016-2018', segmentKey:'2016-2018', color:'#5aa882'},
    {label:'2019-2021', segmentKey:'2019-2021', color:'#8ecfae'},
    {label:'2022+', segmentKey:'2022+', color:'#bfe7d3'}
  ],
  commentary: [
    { x:880, width:452,
      rule:  {top:262.48, height:4, color:'#104130'},
      label: {top:240.0, height:26, text:'Private Equity'},
      lead:  {top:278.0, height:52, text:'Broadest buyer base, with underlying assets driving pricing'},
      body:  {top:342.0, height:158, text:'Pricing will reflect the quality of the funds and their underlying assets, buyer coverage of the GP, as well as visibility and expected timing on exits. Credible valuations and recent realisations support pricing, while longer holding periods and uncertain exit timing widen discounts.'} },
    { x:1372, width:480,
      rule:  {top:262.0, height:4.33, color:'#1d5a43'},
      label: {top:240.0, height:33, text:'Real Estate & Infrastructure'},
      lead:  {top:278.0, height:52, text:'Specialised buyer universe with distinct pricing dynamics'},
      body:  {top:342.0, height:158, text:'The real estate secondary market remains less mature than buyout and credit, with a more specialised buyer base and limited market datapoints, which result in wider pricing ranges. Infrastructure supports stronger secondary pricing, depending on contracted cash flows and asset maturity.'} },
    { x:880, width:452,
      rule:  {top:596.48, height:4, color:'#74bd99'},
      label: {top:596.0, height:33, text:'Private Credit'},
      lead:  {top:638.0, height:52, text:'Selective buyers in a mature market, under current public pressure'},
      body:  {top:704.0, height:148, text:'Redemption pressure and discounted tender activity in 2026 have increased pricing dispersion across private credit. Buyer pricing will depend on underlying loans, borrower performance, seniority, and concentration rather than the headline fund multiple.'} },
    { x:1372, width:480,
      rule:  {top:593.75, height:3.25, color:'#5aa882'},
      label: {top:596.0, height:33, text:'Growth & Venture'},
      lead:  {top:638.0, height:52, text:'Value-creation conviction and AI adoption speed will drive pricing'},
      body:  {top:704.0, height:148, text:'Growth & Venture is a call on whether today’s marks are the bottom or the beginning of a steeper downfall. The answer is likely tied to manager by manager, asset by asset considerations. The decision is whether to monetise now or wait for improving buyer confidence.'} }
  ]
};

function smWeighted(arr){
  const paid = arr.reduce((s, r) => s + (Number(r.paid) || 0), 0);
  const nav = arr.reduce((s, r) => s + (Number(r.nav) || 0), 0);
  const dist = arr.reduce((s, r) => s + (Number(r.dist) || 0), 0);
  const tv = arr.reduce((s, r) => s + (Number(r.total_value) || 0), 0);
  return {nav, paid, dist, dpi: paid ? dist / paid : 0, tvpi: paid ? tv / paid : 0};
}

function computeStrategyMixData(){
  const rows = CFG.rows;
  const tot = smWeighted(rows);
  const strategies = STRATEGY_MIX_DATA.strategies.map(s => {
    const m = smWeighted(rows.filter(r => r.slideStrategy === s.name));
    return {
      name: s.name,
      color: s.color,
      nav: Math.round(m.nav / 1e6),
      pct: tot.nav ? Math.round(m.nav / tot.nav * 1000) / 10 : 0,
      tvpi: m.tvpi,
      dpi: m.dpi
    };
  }).sort((a, b) => b.nav - a.nav);
  const vintages = STRATEGY_MIX_DATA.vintages.map(v => {
    const m = smWeighted(rows.filter(r => r.vintage_segment === v.segmentKey));
    return {
      label: v.label,
      segmentKey: v.segmentKey,
      color: v.color,
      pct: tot.nav ? Math.round(m.nav / tot.nav * 1000) / 10 : 0,
      tvpi: m.tvpi,
      dpi: m.dpi
    };
  });
  const byMgr = {};
  rows.forEach(r => { byMgr[r.manager] = (byMgr[r.manager] || 0) + (Number(r.nav) || 0); });
  const top5 = Object.keys(byMgr).map(k => byMgr[k]).sort((a, b) => b - a).slice(0, 5).reduce((s, n) => s + n, 0);
  return {
    strategies,
    totalNav: {
      nav: Math.round(tot.nav / 1e6),
      pct: 100,
      tvpi: tot.tvpi,
      dpi: tot.dpi
    },
    vintages,
    topGPs: {label: 'Top 5 GPs', value: '$' + Math.round(top5 / 1e6).toLocaleString() + 'M'},
    commentary: STRATEGY_MIX_DATA.commentary
  };
}
