// 10-next-steps.js — renumbered to slide 10 (was slide 9) after the new
// "Market Sentiment by Strategy and Vintage" slide was inserted before
// Discussion Points, shifting this slide up one more. (Earlier,
// now-superseded renumbering notes used to live here — see README.md's
// changelog for the full slide-numbering history.)
// renderNextStepsSlide() — extracted from js/app.js into js/pages/ during the
// Round 18 restructure (loaded via a <script> tag in index.html before
// js/app.js; the function declaration is hoisted into global scope so
// app.js's HTML_SLIDES map can reference it regardless of load order).
// renderNextStepsSlide() — slide 22 ("Next Steps"), converted from real
// Figma data (node 1:4122, Round 13). Structurally the simplest slide
// converted so far: a dark-green full-bleed background, a 5-step timeline
// (a horizontal rule + one small circular "dot" per step, the first one
// filled light/ringed to mark "current progress", the rest dark/hollow),
// and 5 rounded cards each with a status pill (some solid-filled, some
// outline-only — both are literally the same `ns-chip` rectangle, Figma
// just toggles which of fill vs. stroke is visible per card), a big step
// number, a title, and a description.
//
// Two new general converter capabilities came out of this slide (in
// tools/figma_to_html.py), both straightforward gaps rather than anything
// slide-specific:
// 1. `cornerRadius` → CSS `border-radius` in emit_box() — previously
//    unhandled entirely, so the rounded cards (radius 16) and the
//    pill-shaped status chips (radius 14, i.e. >= half the chip's own
//    height, which is what makes it fully round-ended) would have
//    rendered as sharp-cornered rectangles.
// 2. A stroke/ring on an ELLIPSE — emit_ellipse() (added Round 12 for
//    slide 6's donut chart) only ever drew a fill. This slide's 5 small
//    timeline dots each have both a fill AND a stroke (the "current step"
//    dot is filled light with a ring; the other 4 are filled dark, nearly
//    matching the background, with the same ring — reading as "hollow"
//    circles). Added SVG `stroke`/`stroke-width` using the same
//    visibility-checked solid_color() lookup emit_box() already uses for
//    CSS borders, so a stroke present but toggled `visible:false` is
//    still correctly skipped.
//
function nsStepHtml(s, i){
  const chipBox = s.chipFill
    ? `background:#104130;`
    : `border:1px solid #63b28d;box-sizing:border-box;`;
  const chipColor = s.chipFill ? '#f5f5f0' : '#104130';
  const nameWrap = s.nameWrap ? 'white-space:pre-wrap;overflow-wrap:break-word;' : 'white-space:pre;';
  return `<div class="nsStep" data-ns="${i}" style="position:absolute;left:${s.left}px;top:392px;width:326px;height:363px;">
    <div class="nsStepInner">
      <div class="fig-box nsCard" data-fig-name="ns-card" style="position:absolute;left:0;top:0;width:326px;height:363px;border-radius:16px;background:#e7efe8;"></div>
      <div class="fig-text" data-fig-name="ns-num" style="position:absolute;left:206px;top:18px;width:96px;height:55px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:44px;line-height:55.44px;color:#63b28d;text-align:right;white-space:pre;">${s.num}</div>
      <div class="fig-box" data-fig-name="ns-chip" style="position:absolute;left:26px;top:28px;width:${s.chipW}px;height:28px;border-radius:14px;${chipBox}"></div>
      <div class="fig-text" data-fig-name="ns-chiptxt" style="position:absolute;left:26px;top:35px;width:${s.chipW}px;height:15px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:12px;line-height:15.12px;letter-spacing:1px;color:${chipColor};text-align:center;white-space:pre;">${s.chip}</div>
      <div class="fig-text" data-fig-name="ns-name" style="position:absolute;left:26px;top:96px;width:${s.nameW}px;height:${s.nameH}px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:24px;line-height:31.68px;color:#104130;text-align:left;${nameWrap}">${s.name}</div>
      <div class="fig-text" data-fig-name="ns-desc" style="position:absolute;left:${s.descLeft}px;top:${s.descTop}px;width:274px;height:${s.descH}px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-size:19px;line-height:28.88px;color:#1a1a1a;text-align:left;white-space:pre-wrap;overflow-wrap:break-word;">${s.desc}</div>
    </div>
  </div>`;
}

function nsDotHtml(left, i){
  return `<svg class="fig-arc nsDot" data-ns="${i}" data-fig-name="ns-dot" style="position:absolute;left:${left}px;top:341px;width:20px;height:20px;overflow:visible;" viewBox="0 0 20 20"><ellipse class="nsDotHole" cx="10" cy="10" rx="10" ry="10" fill="#0e3a2b" stroke="#a9c9b8" stroke-width="2"/><ellipse class="nsDotOn" cx="10" cy="10" rx="10" ry="10" fill="#f5f5f0" stroke="#a9c9b8" stroke-width="2"/></svg>`;
}

function renderNextStepsSlide(){
  const steps = [
    {left:68, num:'01', chipFill:true, chipW:95.2, chip:'COMPLETE', nameW:274, nameH:32, nameWrap:false, name:'Preliminary analysis', descLeft:25, descTop:188, descH:145, desc:'Portfolio-level review of composition, vintage profile, manager concentration and sellability across all 368 interests.'},
    {left:432, num:'02', chipFill:true, chipW:61.6, chip:'NEXT', nameW:300, nameH:32, nameWrap:false, name:'Discussion of objectives', descLeft:26, descTop:192, descH:116, desc:'Session with PSERS to identify liquidity goals, any DPI profile to be reached, and which GP relationships to retain.'},
    {left:796, num:'03', chipFill:false, chipW:137.2, chip:'DOCS REQUIRED', nameW:274, nameH:64, nameWrap:true, name:'Deep dive on selected assets', descLeft:26, descTop:188, descH:145, desc:'Asset-level analysis on the positions shortlisted for sale. Requires fund documentation from PSERS (CAS, QRs and LPAs).'},
    {left:1160, num:'04', chipFill:false, chipW:112, chip:'PRE-LAUNCH', nameW:274, nameH:64, nameWrap:true, name:'Validation with the market', descLeft:26, descTop:188, descH:116, desc:'Confidential sounding across our buyer universe to establish indicative pricing and confirm appetite before launch.'},
    {left:1524, num:'05', chipFill:false, chipW:112, chip:'IF DESIRED', nameW:274, nameH:32, nameWrap:false, name:'Auction launch', descLeft:26, descTop:184, descH:116, desc:'Formal process launch to the selected buyer group, on the timetable and scope PSERS chooses.'}
  ];
  const dots = [221, 585, 949, 1313, 1677];
  const stepsHtml = steps.map((s, i) => nsDotHtml(dots[i], i + 1) + nsStepHtml(s, i + 1)).join('');
  return `<div class="fig-slide nsSlide" style="position:relative;width:1920px;height:1080px;background:#104130;overflow:hidden;">
  <div class="fig-text" data-fig-name="chrome-year" style="position:absolute;left:68.00px;top:64.00px;width:49.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#7fa992;text-align:left;white-space:pre;">2026</div>
  <div class="fig-box" data-fig-name="chrome-logo-box" style="position:absolute;left:1675.00px;top:58.00px;width:177.00px;height:44.00px;border:1px solid #a9c9b8;box-sizing:border-box;"></div>
  <div class="fig-text" data-fig-name="chrome-logo" style="position:absolute;left:1677.00px;top:69.00px;width:177.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:5.00px;color:#f5f5f0;text-align:center;white-space:pre;">TANGIBLE</div>
  <div class="fig-text" data-fig-name="chrome-footer" style="position:absolute;left:68.00px;top:982.00px;width:112.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">Confidential</div>
  <div class="fig-text" data-fig-name="chrome-page" style="position:absolute;left:1674.00px;top:982.00px;width:178.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:right;white-space:pre;">11</div>
  <div class="fig-text" data-fig-name="title" style="position:absolute;left:68.00px;top:136.00px;width:294.00px;height:71.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:56.00px;line-height:70.56px;letter-spacing:0.00px;color:#f5f5f0;text-align:left;white-space:pre;">Next Steps</div>
  <div class="fig-box nsTl" data-fig-name="ns-tl" style="position:absolute;left:231.00px;top:350.00px;width:1456.00px;height:2.00px;background:#2c5f4b;"></div>
  ${stepsHtml}
</div>`;
}

let nsPlayed = false;

function animateNextStepsSlide(){
  const root = document.querySelector('#slideHtmlCanvas .nsSlide');
  if (!root) return;
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduce || nsPlayed){
    root.classList.add('ns-static');
    return;
  }
  nsPlayed = true;
  root.classList.remove('ns-ready', 'ns-live');
  void root.offsetWidth;
  root.classList.add('ns-ready');
  window.setTimeout(() => { root.classList.add('ns-live'); }, 1620);
}
