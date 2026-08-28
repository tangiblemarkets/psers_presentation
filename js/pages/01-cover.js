// renderCoverSlide() — extracted from js/app.js into js/pages/ during the
// Round 18 restructure (loaded via a <script> tag in index.html before
// js/app.js; the function declaration is hoisted into global scope so
// app.js's HTML_SLIDES map can reference it regardless of load order).
// ---- Slide navigation & hotspot rendering ----
// ============================================================
// PROTOTYPE (2026-08-26): render a slide as live HTML instead of a static
// image, for slides where that's worth trying. See README.md's "HTML slide
// prototype" section for the why/how. Only slide 6 ("Strategy Mix") is done
// so far — chosen because it's exactly the slide whose hotspot alignment we
// just spent two rounds fixing (see Round 5 above), and because its content
// is entirely numbers already computed live from CFG.rows via
// weightedMetrics() elsewhere in this file (openStrategy, openMarketTable),
// so nothing here is hand-typed to match the old image — it's the same
// data, rendered a different way. Every other slide is untouched: still
// PNG + CFG.hotspots, exactly as before.
//
// Architecture: showSlide() checks HTML_SLIDES[n]. If present, it hides
// #slideImg and fills #slideHtmlCanvas with that entry's own {width,height}
// "logical canvas" of real HTML — syncSlideCanvasScale() applies one CSS
// `transform:scale(...)` (computed from the canvas's own native width, not
// a hardcoded number) so it resizes exactly like the image did (uniformly,
// text never reflows at a different window size). A row/box you can click
// is a real <button>/[role=button], so there's no percentage coordinate to
// ever drift out of alignment with what it's covering.
function renderCoverSlide(){
  const toc = [
    {label:'About Tangible', slide:2},
    {label:'Routes to Liquidity', slide:4},
    {label:'Portfolio Overview', slide:5},
    {label:'Strategy Deep Dives', slide:8},
    {label:'Market Sentiment', slide:9},
    {label:'Discussion Points', slide:10},
    {label:'Next Steps', slide:11},
    {label:'Portfolio Holdings', slide:14},
    {label:'Contact and Disclaimer', slide:15}
  ];
  const rowH = 44;
  const firstTop = 336;
  const tocHtml = toc.map((item, i) => {
    const top = firstTop + i * rowH;
    const num = String(item.slide - 1).padStart(2, '0');
    const edge = i < toc.length - 1 ? ' coverTocRow--line' : '';
    return `<div class="coverTocRow${edge}" data-action="goSlide" data-value="${item.slide}" role="button" tabindex="0" aria-label="${item.label}" style="position:absolute;left:1161.41px;top:${top.toFixed(2)}px;width:604.99px;height:${rowH}px;"><span class="coverTocLabel">${item.label}</span><span class="coverTocNum">${num}</span></div>`;
  }).join('');
  return `<div class="fig-slide" style="position:relative;width:1920px;height:1080px;background:#104130;overflow:hidden;">
  <div class="fig-text" data-fig-name="title" style="position:absolute;left:68.00px;top:307.00px;width:680.00px;height:92.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:84.00px;line-height:92.40px;letter-spacing:0.00px;color:#f5f5f0;text-align:left;white-space:pre;">Tangible x PSERS</div>
  <div class="fig-text" data-fig-name="eyebrow" style="position:absolute;left:1161.41px;top:307.00px;width:84.00px;height:17.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:13.41px;line-height:16.90px;letter-spacing:1.49px;color:#96ac9e;text-align:left;white-space:pre;">CONTENTS</div>
  <div class="fig-text" data-fig-name="chrome-year" style="position:absolute;left:68.00px;top:64.00px;width:49.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">2026</div>
  <div class="fig-text" data-fig-name="chrome-footer" style="position:absolute;left:68.00px;top:982.00px;width:112.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">Confidential</div>
  <div class="fig-text" data-fig-name="chrome-page" style="position:absolute;left:1674.00px;top:982.00px;width:178.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:right;white-space:pre;">00</div>
  <div class="fig-text" data-fig-name="title" style="position:absolute;left:68.00px;top:517.00px;width:148.00px;height:26.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:italic;font-size:24.00px;line-height:26.40px;letter-spacing:0.00px;color:#969696;text-align:left;white-space:pre;">August 2026</div>
  <div class="fig-text" data-fig-name="title" style="position:absolute;left:68.00px;top:421.00px;width:264.00px;height:33.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:30.00px;line-height:33.00px;letter-spacing:0.00px;color:#f0f0eb;text-align:left;white-space:pre;">Liquidity Solutions</div>
  ${tocHtml}
  <div class="fig-box" data-fig-name="chrome-logo-box" style="position:absolute;left:1675.00px;top:58.00px;width:177.00px;height:44.00px;border:1.0px solid #f5f5f0;box-sizing:border-box;"></div>
  <div class="fig-text" data-fig-name="chrome-logo" style="position:absolute;left:1677.00px;top:67.00px;width:175.00px;height:25.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-style:normal;font-size:20.00px;line-height:25.20px;letter-spacing:5.00px;color:#f5f5f0;text-align:center;white-space:pre;">TANGIBLE</div>
</div>`;
}
