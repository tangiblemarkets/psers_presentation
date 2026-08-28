// 14-disclaimer.js — renumbered to slide 14 (was slide 13) after the new
// "Market Sentiment by Strategy and Vintage" slide was inserted before
// Discussion Points. (Earlier, now-superseded renumbering notes used to
// live here — see README.md's changelog for the full slide-numbering
// history.)
// renderDisclaimerSlide() — extracted from js/app.js into js/pages/ during the
// Round 18 restructure (loaded via a <script> tag in index.html before
// js/app.js; the function declaration is hoisted into global scope so
// app.js's HTML_SLIDES map can reference it regardless of load order).
// renderStrategyMixSlide() — rebuilt from the real Figma node 1:687 (Round
// 12), replacing the Round 5/6 PNG-measured prototype entirely. That
// prototype's STRATEGY_ORDER/STRATEGY_BAR_COLOR/VINTAGE_ORDER/VINTAGE_COLOR
// constants, fmtMoneyM/fmtMoneyMWhole formatters, and live weightedMetrics()
// aggregation are all gone with it — every number/color on this slide is now
// literal text baked into the converter output below (like slides 1-4),
// since the design's own NAV/%/TVPI/DPI figures don't actually match what
// weightedMetrics(CFG.rows) computes (see the discrepancy note just below).
// Kept only the interactivity: each strategy row and the vintage box still
// open the same live drawers they did before, via hotspot overlays mapped to
// the closest matching CFG.rows `strategy` key.
//
// Getting this slide's source data required a workaround: the Figma REST API
// was rate-limited (starter-tier lockout, ~4.5 days) partway through this
// round, so node 1:687 was pulled via a small custom Figma plugin using
// `exportAsync({format:"JSON_REST_V1"})` instead of curl — see README.md's
// Round 12 section for the full story. That export's JSON shape differs
// from the REST nodes-endpoint's (`document` at the top level, not nested
// under `nodes[id]`), which figma_to_html.py's main() now detects and
// handles alongside the original shape.
//
// Two structural things this slide needed that no earlier slide did, both
// now general converter features (figma_to_html.py), not slide-6-specific
// hacks:
// 1. Whole-node `visible:false` — the design has a 6th strategy row,
//    "Special Situations" ($1,418M/5.7%/1.40x TVPI/0.92x DPI, node 1:745
//    and siblings), switched off at the node level (kept for a future
//    update, per the same pattern as a component's unused hover state).
//    walk() now skips any such node (and everything nested under it)
//    entirely, rather than only checking fill/stroke-level visibility as it
//    did before (Round 9's stroke-visibility fix was narrower than this).
// 2. ELLIPSE nodes carrying `arcData` — the half-donut "Share of NAV by
//    vintage" gauge (5 ring segments, node group 1:750) and the small solid
//    legend dots are both this node type. New emit_ellipse() renders each
//    as a standalone inline SVG (a donut/annular-sector <path> for the ring
//    segments, a plain <ellipse> for the full-circle dots) — see its
//    docstring for the angle-convention and bbox-quirk details worked out
//    while building it.
//
// *** Data discrepancy worth flagging (same pattern as the Round 10 slide 4
// note): the Figma numbers below do NOT match live weightedMetrics(CFG.rows)
// for the strategy this design calls "Private Equity" — Figma shows
// $5,864M/23.6%, but CFG.rows' "Buyout" strategy (the closest match, and
// where this row's hotspot still links to) sums to $14,383.1M, 2.4x larger.
// "Growth & Venture" is also off ($3,441M in Figma vs. $3,231.2M live) and
// so, consequently, is Total NAV ($24,832M in Figma vs. $34,426.4M live).
// Real Estate, Private Credit→Credit, Infrastructure, and the hidden
// Special Situations row are all within a few $M of the live data — so this
// isn't a wholesale re-cut, just "Private Equity" (and NAV/TVPI/DPI actually
// look like a genuinely different, smaller slice of Buyout than the full
// strategy, not a renamed duplicate). Reproduced exactly as Figma has it,
// on the same "the design frame is the current source of truth, not
// reconciled by guessing" basis as every earlier discrepancy this project
// has hit — flagging here rather than silently overriding either number.
// renderDisclaimerSlide() — slide 24 ("Disclaimer"), Round 14, converted
// from real Figma node 1:8676. Four columns of legal/compliance copy — the
// densest text this deck has needed, and the first slide to actually
// require pulling real JSON data for text this project initially assumed
// (correctly, per the user's own call) could NOT be safely approximated
// from a screenshot alone, unlike slide 23. That caution paid off: this
// slide surfaced THREE genuinely new Figma text capabilities that no
// earlier slide ever exercised, all implemented generically in
// tools/figma_to_html.py's emit_text()/emit_rich_text() rather than as
// slide-24-specific hacks:
//   1. A second typeface. Every column's `style.fontFamily` reads "General
//      Sans", not this deck's usual Plus Jakarta Sans — confirmed via the
//      JSON, not assumed just because every earlier slide happened to be
//      Plus Jakarta Sans. The converter previously hardcoded 'Plus Jakarta
//      Sans' into every text node's CSS regardless of what the JSON said;
//      it now reads style.fontFamily per node (see font_stack() in the
//      converter). General Sans is self-hosted the same way as Plus
//      Jakarta Sans (Fontshare's ITF Free Font License permits it) — see
//      css/styles.css's @font-face comment for the licensing note and
//      PENDING status: the actual woff2 file couldn't be downloaded from
//      this sandboxed environment (font CDNs are outside its network
//      allowlist), so this renders on a sans-serif fallback until that
//      file is added to assets/fonts/.
//   2. Mixed-style "rich" text within a single Figma text node. Each
//      column is ONE node that mixes a larger 19px header run (e.g.
//      "General", "United States Investors") with 13px title-cased body
//      copy — Figma's characterStyleOverrides/styleOverrideTable fields,
//      never populated with anything meaningful on any earlier slide.
//      textCase:"TITLE" (title-cases every word — the actual reason this
//      slide's body paragraphs render capitalized like "This Document And
//      Its Contents Are Confidential", not a mistake) maps straight onto
//      CSS text-transform:capitalize. One column (Securities Disclosure)
//      even carries a real embedded hyperlink override on "Laven Advisors
//      LLP", linking to its FCA register entry — reproduced as an actual
//      `<a>` with no visual styling change, matching how Figma itself
//      shows it (no underline/color difference from the surrounding text).
//   3. Bulleted lines. Figma's lineTypes/lineIndentations fields (not a
//      literal "•" character in the text) mark which lines are bullet
//      list items and at what indent depth — synthesized in HTML as a
//      hanging-indent block with a literal bullet + two spaces prepended,
//      so a long bullet's wrapped continuation line lands under the text,
//      not under the dot. Also handles Figma's shift-Enter soft line break
//      (U+2028, found inside the "(i)/(ii)/(iii)/(iv)" list under Forward-
//      Looking Statements) as a literal <br> within that bullet.
// See emit_rich_text()'s own docstring in tools/figma_to_html.py for the
// full mechanics, and README.md's "Slide 24: Disclaimer" section for the
// full writeup including the font-licensing research and verification.
// No CFG.hotspots entry exists for slide 24, so no click-behavior overlay
// was needed.
function renderDisclaimerSlide(){
  return `<div class="fig-slide dlSlide${dlPlayed ? ' dl-static' : ''}" style="position:relative;width:1920px;height:1080px;background:#104130;overflow:hidden;">
  <div class="fig-text" data-fig-name="Header 3" style="position:absolute;left:68.00px;top:214.00px;width:637.00px;height:68.00px;font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:57.00px;line-height:68.40px;letter-spacing:-1.14px;color:#ffffff;text-align:left;white-space:pre;">Disclaimer</div>
  <div class="fig-text fig-rich-text dlIn" data-fig-name="Footer" style="--dl-i:1;position:absolute;left:527.00px;top:334.00px;width:407.00px;height:598.00px;color:#ffffff;text-align:left;white-space:normal;overflow-wrap:break-word;"><div style="line-height:22.80px;"><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:19.00px;line-height:22.80px;letter-spacing:-0.19px;">General</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">This document and its contents are confidential and should not be copied, distributed, or disclosed without prior written consent. It is for informational purposes only and does not constitute an offer to sell or the solicitation of an offer to buy any securities and should not be interpreted as financial, legal, tax, or accounting advice.</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">This presentation may include statements that represent opinions, estimates, and forecasts that may not be realized. We believe the information provided herein is reliable as of the date hereof, but do not warrant its accuracy or completeness. In preparing these materials, we have relied upon and assumed, without independent verification, the accuracy and completeness of all information derived from public sources. Nothing in this document contains a commitment from us to subscribe for securities, to provide debt, to arrange any debt facility, to invest in any way in any transaction, or to provide advice related thereto.</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">This document does not constitute an offer of securities. Such an offer may only be made by means of confidential offering materials. The information contained in this summary is not complete and is only intended to provide prospective investors with a basic understanding of the Company and its prospects. There are substantial risks associated with the Company’s ability to achieve its prospects, including, without limitation, changes in applicable laws, rules, and regulations; risks associated with the economic environment or the financing markets; and risks associated with the Company’s ability to execute its business plan. </span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">An investment in the Company is illiquid and speculative and is subject to a risk of loss, including a risk of loss of principal.</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">The opinions expressed herein are those of the Company, and there is no guarantee that any predictions or projections as to certain market activity or events will come to fruition or that past market or transaction performance referenced within will yield the same results as transactions previously conducted by the Company.</span></div></div>
  <div class="fig-text fig-rich-text dlIn" data-fig-name="Footer" style="--dl-i:0;position:absolute;left:68.00px;top:334.00px;width:406.00px;height:364.00px;color:#ffffff;text-align:left;white-space:normal;overflow-wrap:break-word;"><div style="line-height:15.60px;"><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">These disclaimers are a part of and are incorporated into those materials (each, the “Materials”) that reference these disclaimer provisions. Capitalized terms used herein without definition shall have the meanings ascribed to them in the Materials. Tangible Markets Ltd reserves the right to amend these provisions without notice to the extent permitted by applicable law.</span></div><div style="height:15.60px;"></div><div style="line-height:22.80px;"><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:19.00px;line-height:22.80px;letter-spacing:-0.19px;">United States Investors</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">The Materials are for the exclusive use of U.S. Persons (as defined in Rule 902(k) under the Securities Act of 1933, as amended (the “Securities Act”)) who are Qualified Purchasers (as defined in Section 2(a)(51) of the Investment Company Act of 1940, and certain rules thereunder) and Accredited Investors (as defined in Rule 501(a) (only clauses (1), (2), (3), (7), (9), (12), and (13)) under the Securities Act).</span></div><div style="height:15.60px;"></div><div style="line-height:22.80px;"><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:19.00px;line-height:22.80px;letter-spacing:-0.19px;">Foreign Investors</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">The Materials are for the exclusive use of, and the underlying securities are offered only to, investors outside the United States that are considered institutional investors in the jurisdictions of their residence.</span></div></div>
  <div class="fig-text fig-rich-text dlIn" data-fig-name="Footer" style="--dl-i:2;position:absolute;left:986.00px;top:334.00px;width:407.00px;height:502.00px;color:#ffffff;text-align:left;white-space:normal;overflow-wrap:break-word;"><div style="line-height:22.80px;"><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:19.00px;line-height:22.80px;letter-spacing:-0.19px;">Presentation</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">This presentation (this “Presentation”) is being furnished by or on behalf of the Company (which term includes its affiliates, subsidiaries, successors, and assigns) based on information provided or furnished by the Company or from publicly available sources. Any information contained in this Presentation is being furnished for informational purposes only. The information contained herein is confidential and is provided for the exclusive use of the recipient and may not be reproduced, provided, or disclosed to others, or used for any other purpose, without written authorization by Tangible Markets Ltd and the Company, and upon request must be returned to the Company.</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">This Presentation is general in nature and not specific to any recipient. Recipients are responsible for their own investment research and investment decisions. This Presentation is for informational purposes only.</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">Recipients should not construe any such information or other material as legal, tax, investment, financial, or other advice. Nothing contained in this Presentation constitutes a solicitation, recommendation, endorsement, or offer by the Company, Tangible Markets Ltd, or any third-party service provider to buy or sell any securities or other financial instruments in this or in any other jurisdiction in which such solicitation or offer would be unlawful under the securities laws of such jurisdiction.</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">The information in this Presentation does not constitute a comprehensive or complete statement of the matters discussed or the law relating thereto. Tangible Markets Ltd is not a fiduciary by virtue of any person’s use of or access to this Presentation or the information contained herein.</span></div></div>
  <div class="fig-text fig-rich-text dlIn" data-fig-name="Footer" style="--dl-i:3;position:absolute;left:1445.00px;top:334.00px;width:407.00px;height:637.00px;color:#ffffff;text-align:left;white-space:normal;overflow-wrap:break-word;"><div style="line-height:22.80px;"><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:19.00px;line-height:22.80px;letter-spacing:-0.19px;">Securities Disclosure &amp; Regulatory Compliance</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">Securities are offered through Finalis Securities LLC, a registered broker-dealer and member FINRA/SIPC. Tangible Markets Ltd is an Appointed Representative of </span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;"><a href="https://register.fca.org.uk/s/firm?id=001b000000MfghYAAR" target="_blank" rel="noopener" style="color:inherit;text-decoration:inherit;">Laven Advisors LLP</a></span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">, which is authorised and regulated by the Financial Conduct Authority (FCA).</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">This material is intended only for qualified institutional investors and accredited investors as defined under applicable securities laws. Any transaction contemplated herein is subject to the completion of required due diligence and regulatory approvals.</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;"><br></span></div><div style="line-height:22.80px;"><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:19.00px;line-height:22.80px;letter-spacing:-0.19px;">Forward-Looking Statements</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">Certain information set forth in this presentation contains “forward-looking information”, including “future-oriented financial information” and “financial outlook” under applicable securities laws. Except for statements of historical fact, the information contained herein constitutes forward-looking statements and includes, but is not limited to:</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">(i) Projected financial performance of the Company.<br> (ii) Expected development of the Company’s business, projects, and joint ventures.<br> (iii) Execution of the Company’s growth strategy, including future M&amp;A activity.<br> (iv) Future liquidity, working capital, and capital requirements of the Company.</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">These statements are not guarantees of future performance, and undue reliance should not be placed on them. Forward-looking statements necessarily involve known and unknown risks and uncertainties, which may cause actual performance and financial results in future periods to differ materially from any projections.</span></div><div style="padding-left:16px;text-indent:-16px;line-height:15.60px;"><span aria-hidden="true" style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">&bull;&nbsp;&nbsp;</span><span style="font-family:'General Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.00px;line-height:15.60px;letter-spacing:0.00px;text-transform:capitalize;">Although forward-looking statements contained in this presentation are based upon what the Company’s management believes are reasonable assumptions, there can be no assurance that forward-looking statements will prove to be accurate. The Company undertakes no obligation to update forward-looking statements except as required by applicable securities laws.</span></div></div>
  <div class="fig-text" data-fig-name="chrome-year" style="position:absolute;left:68.00px;top:64.00px;width:49.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">2026</div>
  <div class="fig-box" data-fig-name="chrome-logo-box" style="position:absolute;left:1675.00px;top:58.00px;width:177.00px;height:44.00px;border:1px solid #f5f5f0;box-sizing:border-box;"></div>
  <div class="fig-text" data-fig-name="chrome-logo" style="position:absolute;left:1677.00px;top:69.00px;width:177.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:5.00px;color:#f5f5f0;text-align:center;white-space:pre;">TANGIBLE</div>
  <div class="fig-text" data-fig-name="chrome-footer" style="position:absolute;left:68.00px;top:982.00px;width:112.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">Confidential</div>
  <div class="fig-text" data-fig-name="chrome-page" style="position:absolute;left:1674.00px;top:982.00px;width:178.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:right;white-space:pre;">15</div>
</div>`;
}

let dlPlayed = false;

function animateDisclaimerSlide(){
  const root = document.querySelector('#slideHtmlCanvas .dlSlide');
  if (!root) return;
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduce || dlPlayed){
    root.classList.add('dl-static');
    return;
  }
  dlPlayed = true;
  root.classList.remove('dl-ready');
  void root.offsetWidth;
  root.classList.add('dl-ready');
}
