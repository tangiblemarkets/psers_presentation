// 13-tangible-contact.js — renumbered to slide 13 (was slide 12) after the
// new "Market Sentiment by Strategy and Vintage" slide was inserted before
// Discussion Points. (Earlier, now-superseded renumbering notes used to
// live here — see README.md's changelog for the full slide-numbering
// history.)
// renderTangibleContactSlide() — extracted from js/app.js into js/pages/ during the
// Round 18 restructure (loaded via a <script> tag in index.html before
// js/app.js; the function declaration is hoisted into global scope so
// app.js's HTML_SLIDES map can reference it regardless of load order).
// renderTangibleContactSlide() — slide 23 ("Tangible"), Round 13. Unlike
// every other converted slide, this one was NOT pulled from Figma JSON — by
// explicit user choice (screenshot vs. JSON was raised directly, and the
// user picked screenshot-only for this slide specifically, since it's just
// text on a plain background and this design system's fonts/colors were
// already fully known from Rounds 7-13). Built instead by measuring the
// user's screenshot pixel-for-pixel:
//   1. Detected the actual Figma-frame boundary inside the screenshot
//      (the light-gray Figma canvas margin around it) to get an exact
//      screenshot-px -> Figma-px scale factor — confirmed clean 1.5x
//      (1280 screenshot px = 1920 Figma px), not assumed.
//   2. Confirmed that scale factor against a KNOWN reference already in
//      this codebase: this slide reuses the exact same chrome elements as
//      slide 22 ("2026" corner label, "TANGIBLE" pill, "Confidential"
//      footer, page-number corner) — measuring those in the screenshot and
//      converting through the 1.5x scale reproduced slide 22's real
//      Figma coordinates almost exactly (e.g. the TANGIBLE pill measured
//      at 177x45 vs. the known 177x44), which validated the measurement
//      approach before trusting it for the new content.
//   3. For the new elements (title, email, address blocks, divider), used
//      Playwright itself as a ruler: rendered "Tangible"/the email/the
//      address strings at candidate font-sizes in the real Plus Jakarta
//      Sans font this deck already uses, rasterized them, and measured the
//      rendered glyph bounding boxes — then solved for the font-size whose
//      rendered width/height matched the screenshot's measured glyph size,
//      and for the box-`top` needed so the same font/line-height renders
//      its glyph at the screenshot's measured position. This means the
//      numbers below (84px title, 30px email, 24px address lines, 18px
//      LONDON/NEW YORK labels, all Plus Jakarta Sans) are back-solved from
//      real rendered measurements, not eyeballed guesses — but they are
//      still an approximation relative to Figma's own source values (no
//      node JSON exists for this slide to check against), unlike every
//      other converted slide's pixel-exact reproduction.
// Text colors: title/pill use the deck's #f5f5f0 near-white; the email and
// both address blocks use a distinct, slightly muted #dce9df (sampled
// directly from the screenshot, consistently different from #f5f5f0 across
// both instances — likely a deliberate lower-emphasis body-copy color in
// this design, not a rendering artifact). LONDON/NEW YORK reuse the same
// #7fa992 muted-caption color as "2026"/"Confidential"/the page number.
// No CFG.hotspots entry exists for slide 23, so no overlay divs are needed.
function renderTangibleContactSlide(){
  return `<div class="fig-slide" style="position:relative;width:1920px;height:1080px;background:#104130;overflow:hidden;">
  <div class="fig-text" data-fig-name="chrome-year" style="position:absolute;left:68.00px;top:64.00px;width:49.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#7fa992;text-align:left;white-space:pre;">2026</div>
  <div class="fig-box" data-fig-name="chrome-logo-box" style="position:absolute;left:1675.00px;top:58.00px;width:177.00px;height:44.00px;border:1px solid #a9c9b8;box-sizing:border-box;"></div>
  <div class="fig-text" data-fig-name="chrome-logo" style="position:absolute;left:1677.00px;top:69.00px;width:177.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:5.00px;color:#f5f5f0;text-align:center;white-space:pre;">TANGIBLE</div>
  <div class="fig-text" data-fig-name="title" style="position:absolute;left:68.00px;top:299.00px;width:400.00px;height:100.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:84.00px;line-height:105.84px;letter-spacing:0.00px;color:#f5f5f0;text-align:left;white-space:pre;">Tangible</div>
  <div class="fig-text" data-fig-name="email" style="position:absolute;left:68.00px;top:433.00px;width:520.00px;height:40.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:30.00px;line-height:37.80px;letter-spacing:0.00px;color:#dce9df;text-align:left;white-space:pre;">dealteam@tangible-markets.com</div>
  <div class="fig-box" data-fig-name="divider" style="position:absolute;left:68.00px;top:555.00px;width:1784.00px;height:1.00px;background:#2c5f4b;"></div>
  <div class="fig-text" data-fig-name="london-label" style="position:absolute;left:68.00px;top:610.00px;width:120.00px;height:22.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:18.00px;line-height:22.68px;letter-spacing:1.50px;color:#7fa992;text-align:left;white-space:pre;">LONDON</div>
  <div class="fig-text" data-fig-name="london-line1" style="position:absolute;left:68.00px;top:653.00px;width:400.00px;height:30.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:24.00px;line-height:36.00px;letter-spacing:0.00px;color:#dce9df;text-align:left;white-space:pre;">3rd Floor, 45 Albemarle Street</div>
  <div class="fig-text" data-fig-name="london-line2" style="position:absolute;left:68.00px;top:689.00px;width:400.00px;height:30.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:24.00px;line-height:36.00px;letter-spacing:0.00px;color:#dce9df;text-align:left;white-space:pre;">London, W1S 4JL</div>
  <div class="fig-text" data-fig-name="london-line3" style="position:absolute;left:68.00px;top:725.00px;width:400.00px;height:30.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:24.00px;line-height:36.00px;letter-spacing:0.00px;color:#dce9df;text-align:left;white-space:pre;">United Kingdom</div>
  <div class="fig-text" data-fig-name="ny-label" style="position:absolute;left:602.00px;top:610.00px;width:150.00px;height:22.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-style:normal;font-size:18.00px;line-height:22.68px;letter-spacing:1.50px;color:#7fa992;text-align:left;white-space:pre;">NEW YORK</div>
  <div class="fig-text" data-fig-name="ny-line1" style="position:absolute;left:602.00px;top:653.00px;width:400.00px;height:30.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:24.00px;line-height:36.00px;letter-spacing:0.00px;color:#dce9df;text-align:left;white-space:pre;">169 Madison Ave, STE 11166</div>
  <div class="fig-text" data-fig-name="ny-line2" style="position:absolute;left:602.00px;top:689.00px;width:400.00px;height:30.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:24.00px;line-height:36.00px;letter-spacing:0.00px;color:#dce9df;text-align:left;white-space:pre;">New York, NY 10016</div>
  <div class="fig-text" data-fig-name="ny-line3" style="position:absolute;left:602.00px;top:725.00px;width:400.00px;height:30.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:24.00px;line-height:36.00px;letter-spacing:0.00px;color:#dce9df;text-align:left;white-space:pre;">USA</div>
  <div class="fig-text" data-fig-name="chrome-footer" style="position:absolute;left:68.00px;top:982.00px;width:112.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">Confidential</div>
  <div class="fig-text" data-fig-name="chrome-page" style="position:absolute;left:1674.00px;top:982.00px;width:178.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:right;white-space:pre;">14</div>
</div>`;
}
