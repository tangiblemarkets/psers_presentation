// renderRoutesToLiquiditySlide() — slide 4, footer 03.
// Four equal columns. Numbers are dark green; titles are dark gray.
// Green ↑ / red ↓ bullets. First-visit L→R fade stays in animateRoutesToLiquiditySlide().

function rtlArrowSvg(direction){
  const up = direction === 'up';
  const color = up ? '#006C5C' : '#c10c0c';
  const d = up ? 'M10 16V4M5 9L10 4L15 9' : 'M10 4V16M5 11L10 16L15 11';
  return `<svg class="rtlArrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="${d}" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

const RTL_CARDS = [
  {
    num: '01',
    title: 'Accelerate DPI',
    desc: 'Sell mature positions that have already returned most or all invested capital but retain some residual value. A targeted sale converts the remaining NAV into near-term distributions while limiting disruption to the broader portfolio.',
    bullets: [
      {dir:'up', text:'Converts unrealised TVPI into near-term DPI'},
      {dir:'up', text:'Focuses on positions where most value creation has already been realized'},
      {dir:'up', text:'Reduces exposure to non-core positions'},
      {dir:'up', text:'Releases capital for redeployment in current markets'},
      {dir:'down', text:'No future upside; value transfers to the buyer'},
      {dir:'down', text:'Low-RVPI positions may attract less competitive pricing from buyers'}
    ]
  },
  {
    num: '02',
    title: 'Minimize Discount',
    desc: 'Run a competitive process for the portfolio’s most marketable positions. The perimeter would prioritize blue-chip funds with strong secondary demand, where pricing is expected to be closest to NAV.',
    bullets: [
      {dir:'up', text:'Achieves the strongest pricing available across the portfolio and minimizes discount'},
      {dir:'up', text:'Attracts the broadest range of secondary buyers'},
      {dir:'up', text:'Benefits from wide buyer coverage, market data and easy underwriting'},
      {dir:'up', text:'The sale can be sized from a partial strip to full assets, adjusting for retained upside'},
      {dir:'down', text:'Transfers the remaining upside of the highest-quality positions to buyers'},
      {dir:'down', text:'Average secondary pricing still clears at 5–15% discount to NAV for well-performing funds'}
    ]
  },
  {
    num: '03',
    title: 'GP Consolidation',
    desc: 'Exit smaller or non-core GP relationships while retaining managers where PSERS has the strongest conviction. The sale perimeter can include multiple funds and vintages managed by each selected GP.',
    bullets: [
      {dir:'up', text:'Refocuses the portfolio on PSERS’s highest-conviction GP relationships'},
      {dir:'up', text:'Reduces governance and administrative burden'},
      {dir:'up', text:'Supports more efficient buyer underwriting through a GP-focused sale perimeter'},
      {dir:'up', text:'The sale can be sized from a partial strip to full assets, adjusting for targeted GP exposure'},
      {dir:'up', text:'Simplifies transfer coordination across positions managed by the same GP'},
      {dir:'down', text:'Liquidity limited to the NAV held with selected GPs'},
      {dir:'down', text:'Exiting a GP relationship may limit access to future funds and co-investments'}
    ]
  },
  {
    num: '04',
    title: 'Legacy Portfolio',
    desc: 'Sell the remaining 2015-and-earlier positions through a dedicated tail-end process. These mature investments have returned most of their value but continue to require ongoing monitoring and administration.',
    bullets: [
      {dir:'up', text:'Generates near-term liquidity and DPI on positions with limited natural liquidity'},
      {dir:'up', text:'Removes reliance on uncertain future exit timing'},
      {dir:'up', text:'Reduces ongoing monitoring and administrative requirements'},
      {dir:'up', text:'Reinvest proceeds into current market opportunities'},
      {dir:'down', text:'Wide discounts of 35-50% expected by buyers'},
      {dir:'down', text:'Requires specialist tail-end buyers, limiting competitive tension'}
    ]
  }
];

function renderRoutesToLiquiditySlide(){
  const cardsHtml = RTL_CARDS.map((c, i) => {
    let sawDown = false;
    const bulletsHtml = c.bullets.map(b => {
      const brk = b.dir === 'down' && !sawDown ? ' rtlItem--break' : '';
      if (b.dir === 'down') sawDown = true;
      return `<div class="rtlItem${brk}">${rtlArrowSvg(b.dir)}<span>${esc(b.text)}</span></div>`;
    }).join('');
    const divider = i < RTL_CARDS.length - 1
      ? `<div class="rtlDivider" style="--rtl-i:${i}"></div>`
      : '';
    return `
  <div class="rtlCol" style="--rtl-i:${i}">
    <div class="rtlNum">${c.num}</div>
    <div class="rtlTitle">${esc(c.title)}</div>
    <div class="rtlDesc">${esc(c.desc)}</div>
    <div class="rtlList">${bulletsHtml}</div>
  </div>${divider}`;
  }).join('');

  return `<div class="fig-slide rtlSlide${rtlPlayed ? ' rtl-static' : ''}" style="position:relative;width:1920px;height:1080px;background:#ffffff;overflow:hidden;">
  <div class="fig-box" data-fig-name="chrome-logo-box" style="position:absolute;left:1675.00px;top:58.00px;width:177.00px;height:44.00px;border:1px solid #0f0f0f;box-sizing:border-box;"></div>
  <div class="fig-text" data-fig-name="chrome-logo" style="position:absolute;left:1677.00px;top:69.00px;width:177.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:5.00px;color:#0f0f0f;text-align:center;white-space:pre;">TANGIBLE</div>
  <div class="fig-text" data-fig-name="chrome-year" style="position:absolute;left:68.00px;top:64.00px;width:49.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#787878;text-align:left;white-space:pre;">2026</div>
  <div class="fig-text" data-fig-name="chrome-footer" style="position:absolute;left:68.00px;top:982.00px;width:112.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">Confidential</div>
  <div class="fig-text" data-fig-name="chrome-page" style="position:absolute;left:1674.00px;top:982.00px;width:178.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:right;white-space:pre;">03</div>
  <div class="fig-text" data-fig-name="title" style="position:absolute;left:68.00px;top:136.00px;width:1550.00px;height:66.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:52.00px;line-height:65.52px;letter-spacing:0.00px;color:#104130;text-align:left;white-space:pre;">Routes to liquidity depend on current objectives</div>
  <div class="fig-text" data-fig-name="tldr-0" style="position:absolute;left:68.00px;top:205.00px;width:1554.00px;height:76.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:28.00px;line-height:38.00px;letter-spacing:0.00px;color:#787878;text-align:left;white-space:pre-wrap;overflow-wrap:break-word;">PSERS’ short and long-term objectives will determine the asset perimeter, buyer universe and transaction structure. Options listed below are not mutually exclusive and can be aligned with PSERS’ return and timing expectations.</div>
  <div class="rtlBody">${cardsHtml}
  </div>
</div>`;
}

let rtlPlayed = false;

function animateRoutesToLiquiditySlide(){
  const root = document.querySelector('#slideHtmlCanvas .rtlSlide');
  if (!root) return;
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduce || rtlPlayed){
    root.classList.add('rtl-static');
    return;
  }
  rtlPlayed = true;
  root.classList.remove('rtl-ready');
  void root.offsetWidth;
  root.classList.add('rtl-ready');
}
