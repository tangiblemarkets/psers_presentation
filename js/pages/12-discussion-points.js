// renderDiscussionPointsSlide() — new slide, inserted right before "Next
// Steps" per the user's request. A 4-row x 3-column table: STRATEGIC
// QUESTION -> STRATEGIC IMPLICATION -> POTENTIAL TRANSACTION, each pair of
// columns joined by a small arrow glyph.
//
// Built from figma-export/slide.json (root id 49:3876, "Discussion
// Points"). One content note: this export's copy is genuinely different
// from the screenshot the user first shared (same layout/design, different
// questions — GP roster focus / AI-led value creation / liquidity-vs-DPI
// priority / portfolio scale, rather than the screenshot's secondary-
// transaction-objective questions). Confirmed with the user which content
// to build from: the fresh Figma export (this file), since that's what
// they said they'd just updated.
//
// One deliberate deviation from a literal per-node conversion: this
// export's title, column-header labels, chrome-year, and chrome-footer
// nodes all report font-family "General Sans" — but every other slide in
// this deck (9 of 11) uses 'Plus Jakarta Sans' for every one of those
// elements, and "General Sans" only shows up here and in
// 05-routes-to-liquidity.js/14-disclaimer.js, which prior rounds already
// established is a Figma-export font-substitution artifact, not real
// design intent (see psers_v7_round34_routes_rebuild.md memory). Built
// with 'Plus Jakarta Sans' throughout instead, matching the deck standard.
// Everything else (positions, sizes, weights, colors, card fills/corner
// radius/stroke) is taken directly from the export.
//
// Bold sub-phrases (caught by the user re-comparing against the design —
// "i see a lot of diffrenece specially in some font weight"): the export's
// STRATEGIC IMPLICATION and POTENTIAL TRANSACTION paragraphs are NOT one
// uniform weight each — the raw JSON's characterStyleOverrides show
// specific sub-phrases set to Semibold/600 against a Regular/400 body
// (e.g. row 1's implication ends in a bolded question, "Relationship
// carve-out" opens row 1's transaction, row 4's transaction is bold in
// full with no override at all — its own top-level style is weight 600).
// The first implementation dropped all of this and rendered every i/t
// paragraph as one plain weight-400 string. Fixed by wrapping the exact
// bold sub-phrases (read off both the override table and the design
// screenshot, which agree) in inline <span style="font-weight:600;">
// spans, matching the same pattern already used for the bold lead-ins on
// js/pages/12-basis-of-preparation.js. Font-family stays 'Plus Jakarta
// Sans' for these spans (not 'General Sans', which is what the override
// table's own fontFamily field says) — same reasoning as the paragraph
// above: this deck already treats 'General Sans' showing up in this
// export as a substitution artifact, and only Plus Jakarta Sans 400/500/
// 700 are actually self-hosted (see css/styles.css's font-face comments),
// so weight 600 on 'Plus Jakarta Sans' reproduces the intended emphasis
// without requesting a family/weight pair this deck doesn't ship.
//
// chrome-page is forced to "11" (this slide's real deck position as of
// Round 58 — Cover=00 ... Manager Concentration=07, Market Sentiment=08,
// Strategy Deep Dive: Private Equity=09, Liquidity Options=10, this
// slide=11, Next Steps=12, Basis of Preparation=13, Annexes=14, Portfolio
// Holdings=15, Contact=16, Disclaimer=17), not the raw export's own "24".
// Renumbered repeatedly as the deck has grown — see README.md's
// changelog for the full history rather than trusting this comment on
// its own; it is updated on a best-effort basis, not the source of truth.

const DISC_ROWS = [
  {
    qcardY: 267, qcardH: 189, qtextX: 96, qtextY: 315, qtextH: 93,
    icardY: 267, icardH: 189, itextY: 289, itextH: 145,
    tcardY: 267, tcardH: 189, ttextY: 333, ttextH: 87,
    arrowY: 348,
    q: 'What should a secondary transaction achieve for the portfolio?',
    i: 'The objective may be to accelerate DPI, reduce the number of relationships, rebalance strategy exposure or realise positions where the hold case is less compelling. The priorities and their timing will determine the appropriate sale perimeter.',
    t: '<span style="font-weight:600;">Targeted portfolio sale</span>, with the perimeter defined by the preferred portfolio mix and PSERS’ short and long-term objectives.'
  },
  {
    qcardY: 470, qcardH: 160, qtextX: 96, qtextY: 504, qtextH: 93,
    icardY: 470, icardH: 160, itextY: 492, itextH: 116,
    tcardY: 470, tcardH: 160, ttextY: 507, ttextH: 87,
    arrowY: 536,
    q: 'Which GP relationships should PSERS retain, reduce or exit?',
    i: 'GP exposure can be managed at both the relationship and individual fund level. Full exits can reduce the number of managers requiring ongoing oversight, while partial sales rebalance exposure by strategy, vintage or fund maturity while retaining the broader GP relationship.',
    t: '<span style="font-weight:600;">Full or partial GP carve-out</span>, comprising entire relationships or selected fund positions based on the preferred exposure.'
  },
  {
    qcardY: 644, qcardH: 160, qtextX: 96, qtextY: 678, qtextH: 93,
    icardY: 644, icardH: 160, itextY: 666, itextH: 116,
    tcardY: 644, tcardH: 160, ttextY: 681, ttextH: 87,
    arrowY: 710,
    q: 'Where is the case for selling stronger than the case for holding?',
    i: 'Mature positions with limited remaining upside may offer more value through a sale, while assets with credible growth or near-term exits may warrant continued ownership. This assessment should be made position by position.',
    t: '<span style="font-weight:600;">Prioritise mature, low-upside positions</span> for sale and retain assets where the remaining value creation justifies the holding period.'
  },
  {
    qcardY: 818, qcardH: 137, qtextX: 93, qtextY: 840, qtextH: 93,
    icardY: 818, icardH: 137, itextY: 843, itextH: 87,
    tcardY: 818, tcardH: 137, ttextY: 843, ttextH: 87,
    arrowY: 873,
    q: 'Should the portfolio be addressed through one process or in stages?',
    i: 'Bringing selected groups of positions to market provides price discovery without committing to a broader sale. The results can inform the perimeter and timing of any subsequent transactions.',
    t: '<span style="font-weight:600;">Phased secondary sales</span>, beginning with selected positions and expanding only where pricing meets expectations.'
  }
];

// Column x-geometry — constant across all 4 rows.
const DISC_Q_CARD_X = 68, DISC_Q_CARD_W = 360, DISC_Q_TEXT_W = 304;
const DISC_I_CARD_X = 488, DISC_I_CARD_W = 680, DISC_I_TEXT_X = 516, DISC_I_TEXT_W = 624;
const DISC_T_CARD_X = 1228, DISC_T_CARD_W = 624, DISC_T_TEXT_X = 1256, DISC_T_TEXT_W = 568;
const DISC_ARROW1_X = 440, DISC_ARROW2_X = 1180, DISC_ARROW_W = 56, DISC_ARROW_H = 22;

function discArrow(left, top, row, col){
  return `\n  <div class="fig-text discIn" data-fig-name="ns-arrow" style="--disc-r:${row};--disc-c:${col};position:absolute;left:${left.toFixed(2)}px;top:${top.toFixed(2)}px;width:${DISC_ARROW_W.toFixed(2)}px;height:${DISC_ARROW_H.toFixed(2)}px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:22.00px;line-height:22.00px;letter-spacing:0.00px;color:#969696;text-align:center;white-space:pre;">→</div>`;
}

function discRowHtml(r, i){
  return `
  <div class="fig-box discIn" data-fig-name="ns-qcard" style="--disc-r:${i};--disc-c:0;position:absolute;left:${DISC_Q_CARD_X.toFixed(2)}px;top:${r.qcardY.toFixed(2)}px;width:${DISC_Q_CARD_W.toFixed(2)}px;height:${r.qcardH.toFixed(2)}px;background:#ffffff;border:0.5px solid #b0b0b0;border-radius:14px;box-sizing:border-box;"></div>
  <div class="fig-text discIn" data-fig-name="ns-q" style="--disc-r:${i};--disc-c:0;position:absolute;left:${r.qtextX.toFixed(2)}px;top:${r.qtextY.toFixed(2)}px;width:${DISC_Q_TEXT_W.toFixed(2)}px;height:${r.qtextH.toFixed(2)}px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:21.00px;line-height:31.08px;letter-spacing:0.00px;color:#1a1a1a;text-align:left;white-space:pre-wrap;overflow-wrap:break-word;">${r.q}</div>
  <div class="fig-box discIn" data-fig-name="ns-icard" style="--disc-r:${i};--disc-c:2;position:absolute;left:${DISC_I_CARD_X.toFixed(2)}px;top:${r.icardY.toFixed(2)}px;width:${DISC_I_CARD_W.toFixed(2)}px;height:${r.icardH.toFixed(2)}px;background:#f5f5f5;border-radius:14px;box-sizing:border-box;"></div>
  <div class="fig-text discIn" data-fig-name="ns-i" style="--disc-r:${i};--disc-c:2;position:absolute;left:${DISC_I_TEXT_X.toFixed(2)}px;top:${r.itextY.toFixed(2)}px;width:${DISC_I_TEXT_W.toFixed(2)}px;height:${r.itextH.toFixed(2)}px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:28.88px;letter-spacing:0.00px;color:#393939;text-align:left;white-space:pre-wrap;overflow-wrap:break-word;">${r.i}</div>
  <div class="fig-box discIn" data-fig-name="ns-tcard" style="--disc-r:${i};--disc-c:4;position:absolute;left:${DISC_T_CARD_X.toFixed(2)}px;top:${r.tcardY.toFixed(2)}px;width:${DISC_T_CARD_W.toFixed(2)}px;height:${r.tcardH.toFixed(2)}px;background:#e7efe8;border-radius:14px;box-sizing:border-box;"></div>
  <div class="fig-text discIn" data-fig-name="ns-t" style="--disc-r:${i};--disc-c:4;position:absolute;left:${DISC_T_TEXT_X.toFixed(2)}px;top:${r.ttextY.toFixed(2)}px;width:${DISC_T_TEXT_W.toFixed(2)}px;height:${r.ttextH.toFixed(2)}px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:28.88px;letter-spacing:0.00px;color:#104130;text-align:left;white-space:pre-wrap;overflow-wrap:break-word;">${r.t}</div>${discArrow(DISC_ARROW1_X, r.arrowY, i, 1)}${discArrow(DISC_ARROW2_X, r.arrowY, i, 3)}`;
}

function renderDiscussionPointsSlide(){
  const rowsHtml = DISC_ROWS.map(discRowHtml).join('\n');

  return `<div class="fig-slide discSlide${discPlayed ? ' disc-static' : ''}" style="position:relative;width:1920px;height:1080px;background:#ffffff;overflow:hidden;">
  <div class="fig-box" data-fig-name="chrome-logo-box" style="position:absolute;left:1675.00px;top:58.00px;width:177.00px;height:44.00px;border:1px solid #0f0f0f;box-sizing:border-box;"></div>
  <div class="fig-text" data-fig-name="chrome-logo" style="position:absolute;left:1677.00px;top:69.00px;width:177.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:5.00px;color:#0f0f0f;text-align:center;white-space:pre;">TANGIBLE</div>
  <div class="fig-text" data-fig-name="chrome-year" style="position:absolute;left:68.00px;top:64.00px;width:49.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#787878;text-align:left;white-space:pre;">2026</div>
  <div class="fig-text" data-fig-name="chrome-footer" style="position:absolute;left:68.00px;top:982.00px;width:112.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">Confidential</div>
  <div class="fig-text" data-fig-name="chrome-page" style="position:absolute;left:1674.00px;top:982.00px;width:178.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:right;white-space:pre;">10</div>
  <div class="fig-text" data-fig-name="title" style="position:absolute;left:68.00px;top:148.00px;width:992.00px;height:52.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:52.00px;line-height:65.52px;letter-spacing:0.00px;color:#104130;text-align:left;white-space:pre;">Discussion Points</div>
  <div class="fig-text discIn" data-fig-name="header-q" style="--disc-r:0;--disc-c:0;position:absolute;left:70.00px;top:240.00px;width:170.91px;height:18.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:13.16px;line-height:17.76px;letter-spacing:1.21px;color:#787878;text-align:left;white-space:pre;">STRATEGIC QUESTION</div>
  <div class="fig-text discIn" data-fig-name="header-i" style="--disc-r:0;--disc-c:2;position:absolute;left:491.74px;top:240.00px;width:193.63px;height:18.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:13.16px;line-height:17.76px;letter-spacing:1.21px;color:#787878;text-align:left;white-space:pre;">STRATEGIC IMPLICATION</div>
  <div class="fig-text discIn" data-fig-name="header-t" style="--disc-r:0;--disc-c:4;position:absolute;left:1231.46px;top:240.00px;width:201.54px;height:18.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:13.16px;line-height:17.76px;letter-spacing:1.21px;color:#787878;text-align:left;white-space:pre;">POTENTIAL TRANSACTION</div>${rowsHtml}
</div>`;
}

let discPlayed = false;

function animateDiscussionPointsSlide(){
  const root = document.querySelector('#slideHtmlCanvas .discSlide');
  if (!root) return;
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduce || discPlayed){
    root.classList.add('disc-static');
    return;
  }
  discPlayed = true;
  root.classList.remove('disc-ready');
  void root.offsetWidth;
  root.classList.add('disc-ready');
}
