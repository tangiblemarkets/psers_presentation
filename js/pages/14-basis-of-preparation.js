// renderBasisOfPreparationSlide() — new slide, inserted right after "Next
// Steps" per the user's request. A dark-background slide (the second in
// this deck after the Cover — every other slide uses a white background)
// with a title, a one-line intro paragraph, a horizontal rule, and six
// definition-style paragraphs (bold lead-in term + regular explanatory
// text) arranged in 2 columns x 3 rows.
//
// Built from figma-export/slide.json (root id 49:4005, "Frame"). Unlike
// the two most recent Figma-export-based slides (Routes to Liquidity,
// Discussion Points), this export does NOT show the "General Sans"
// font-substitution artifact — every text node here reports
// font-family 'Plus Jakarta Sans', matching the deck standard directly, so
// no font override was needed this time.
//
// Background is this slide's own dark green, #0e3a2b — distinct from the
// Cover slide's #104130 (confirmed via the export's root fill:
// r=0.0549, g=0.2275, b=0.1686 -> exactly #0e3a2b, not a rounding
// coincidence with the Cover's color). chrome-year/chrome-footer/
// chrome-page keep the deck's universal muted-chrome color #787878 (the
// same value used on every white-background slide) rather than the
// Cover's #96ac9e — taken directly from the export since, unlike the font
// field, there's no cross-deck majority evidence this is wrong, and the
// export is internally consistent (font sizes/positions for this chrome
// block match every other slide exactly, only the color story differs by
// element). Title/chrome-logo use #f5f5f0 and the chrome-logo-box border
// uses #a9c9b8 — both adapted for contrast against the dark background,
// matching the Cover's approach of lightening only the high-emphasis
// elements.
//
// One coordinate fixed rather than taken literally: the export's
// "chrome-footer" node sits 19px above "chrome-page" (relative top 963 vs
// 982) — every other slide in the deck, including the two screenshots the
// user shared of this exact slide, show "Confidential" and the page
// number aligned on the same row. Treated as a stray export offset and
// forced to top:982 to match chrome-page and the rest of the deck.
//
// The six note paragraphs each open with a bold "lead-in term." (a
// separate styleOverride run in the export, fontWeight 600 vs. the body's
// 400, same white fill) followed by regular explanatory text — reproduced
// here as a <span style="font-weight:600"> wrapping the lead-in inside
// each paragraph's div, rather than a separate positioned element, since
// they're one continuous wrapped paragraph in the design.
//
// chrome-page is forced to "13" (this slide's real deck position as of
// Round 58 — see README.md's changelog for the full renumbering history
// rather than trusting this comment on its own, it is updated on a
// best-effort basis), not the raw export's own "14".

const BOP_COL_W = 847.70;
const BOP_LEFT_X = 68;
const BOP_RIGHT_X = 1004;
const BOP_PARA_FONT = "font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:18.43px;line-height:27.64px;letter-spacing:0.00px;color:#ffffff;text-align:left;white-space:pre-wrap;overflow-wrap:break-word;";

const BOP_NOTES = [
  { x: BOP_LEFT_X, y: 352.00, h: 166,
    lead: 'Strategy categorisation.',
    body: 'Positions are regrouped from the sub asset class recorded in the source data into four strategies: Private Equity, Growth &amp; Venture, Real Estate &amp; Infrastructure, and Private Credit. Buyout and PE Special Situations are reported together as Private Equity. Growth Equity and Venture Capital are taken out of Private Equity and reported separately as Growth &amp; Venture. Real Estate and Infrastructure are combined, with each shown separately where their profiles diverge.' },
  { x: BOP_LEFT_X, y: 539.16, h: 166,
    lead: 'Insight Partners.',
    body: 'All ten vehicles managed by Insight Partners are reported within Growth &amp; Venture, including those recorded in the source data as Buyout or Special Situations: the Fund XII Buyout Annex Fund, Insight Opportunities Fund I, and the Knockout and Honeydew co-investments. Buyers typically view Insight as a VC &amp; Growth manager, given its investment focus on high-growth technology and software companies. The strategy is therefore assessed more through the underlying investment focus than a traditional buyout lens.' },
  { x: BOP_LEFT_X, y: 728.07, h: 83,
    lead: 'Currency conversion.',
    body: 'Each position is converted from the local currency recorded in the source data into US dollars at spot rates as at 31 March 2026. Rates applied are EUR 1.15551, GBP 1.32267, JPY 0.0062992 and CAD 0.71852 per unit of local currency. US dollar positions are unadjusted.' },
  { x: BOP_RIGHT_X, y: 352.00, h: 83,
    lead: 'Inclusion and exclusion.',
    body: 'Of 744 positions reviewed, 363 are included and 381 excluded. A position is excluded where the latest valuation date is missing or falls before 1 October 2025, or where net asset value is nil, negative or nominal, or where commitment or paid-in capital is absent.' },
  { x: BOP_RIGHT_X, y: 464.87, h: 83,
    lead: 'Data source and reference date.',
    body: 'Figures are derived from position level portfolio data provided by the client and are stated as at the reference date shown. No independent verification of the underlying data has been performed.' },
  { x: BOP_RIGHT_X, y: 550.10, h: 140,
    lead: 'Unfunded commitment.',
    body: 'Unfunded percentage is calculated as unfunded commitment divided by total commitment. Where paid-in capital exceeds stated commitment but an unfunded amount remains, the reported unfunded commitment is retained for consistency. Unfunded commitments are stated gross unless noted otherwise.' }
];

function bopNoteHtml(n, i){
  const col = n.x === BOP_LEFT_X ? 0 : 1;
  const row = col === 0 ? i : i - 3;
  return `\n  <div class="fig-text bopIn" data-fig-name="note-para" style="--bop-c:${col};--bop-r:${row};position:absolute;left:${n.x.toFixed(2)}px;top:${n.y.toFixed(2)}px;width:${BOP_COL_W.toFixed(2)}px;height:${n.h.toFixed(2)}px;${BOP_PARA_FONT}"><span style="font-weight:600;">${n.lead} </span>${n.body}</div>`;
}

function renderBasisOfPreparationSlide(){
  const notesHtml = BOP_NOTES.map(bopNoteHtml).join('');

  return `<div class="fig-slide bopSlide${bopPlayed ? ' bop-static' : ''}" style="position:relative;width:1920px;height:1080px;background:#0e3a2b;overflow:hidden;">
  <div class="fig-box" data-fig-name="chrome-logo-box" style="position:absolute;left:1675.00px;top:58.00px;width:177.00px;height:44.00px;border:1px solid #a9c9b8;box-sizing:border-box;"></div>
  <div class="fig-text" data-fig-name="chrome-logo" style="position:absolute;left:1677.00px;top:69.00px;width:177.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:5.00px;color:#f5f5f0;text-align:center;white-space:pre;">TANGIBLE</div>
  <div class="fig-text" data-fig-name="chrome-year" style="position:absolute;left:68.00px;top:64.00px;width:49.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#787878;text-align:left;white-space:pre;">2026</div>
  <div class="fig-text" data-fig-name="chrome-footer" style="position:absolute;left:68.00px;top:982.00px;width:112.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">Confidential</div>
  <div class="fig-text" data-fig-name="chrome-page" style="position:absolute;left:1674.00px;top:982.00px;width:178.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:right;white-space:pre;">11</div>
  <div class="fig-text" data-fig-name="title" style="position:absolute;left:68.00px;top:136.00px;width:535.00px;height:71.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:56.00px;line-height:70.56px;letter-spacing:0.00px;color:#f5f5f0;text-align:left;white-space:pre;">Basis of Preparation</div>
  <div class="fig-text" data-fig-name="intro" style="position:absolute;left:68.00px;top:237.00px;width:1203.00px;height:48.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:28.00px;line-height:24.00px;letter-spacing:0.00px;color:#ffffff;text-align:left;white-space:pre-wrap;overflow-wrap:break-word;">The following notes outline the data preparation steps and analytical assumptions applied throughout this portfolio analysis. Tangible can update the analysis as part of next steps.</div>
  <div class="fig-box" data-fig-name="rule" style="position:absolute;left:68.00px;top:318.00px;width:1784.00px;height:1.00px;background:#dee4df;"></div>${notesHtml}
</div>`;
}

let bopPlayed = false;

function animateBasisOfPreparationSlide(){
  const root = document.querySelector('#slideHtmlCanvas .bopSlide');
  if (!root) return;
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduce || bopPlayed){
    root.classList.add('bop-static');
    return;
  }
  bopPlayed = true;
  root.classList.remove('bop-ready');
  void root.offsetWidth;
  root.classList.add('bop-ready');
}
