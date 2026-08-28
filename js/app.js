/*
 * app.js — PSERS Interactive Presentation
 * ----------------------------------------------------------------------
 * Application logic for the slide deck: navigation, the click-through
 * "hotspots" drawn on top of each slide image, and every drill-down view
 * (drawer / modal panels) that reads live numbers out of data.js (CFG).
 *
 * Load order matters: index.html loads i18n, then data.js, then
 * js/pages/*, then this file. `t()` / `I18N` and `CFG` must exist
 * before app.js runs.
 *
 * Refactor note (2026-08-26): this is a straight structural extraction of
 * the single-file v6 presentation's inline <script> into its own file, with
 * one deliberate cleanup — see "Dead code removed" below. No behavior,
 * wording, or visual output was changed.
 *
 * Dead code removed: the drill-down views for a strategy / manager /
 * multi-strategy / DPI segment / vintage segment were redesigned partway
 * through the original project, from a plain summary drawer
 * (openDrawer + filterSummaryBody) to a richer "data lens" drawer
 * (openDataLens, further down this file). The old versions of
 * openStrategy, openMultiStrategy, openManager, openDpiSegment and
 * openVintageView were left in the v6 file as an earlier `function`
 * declaration; JavaScript lets a later `function` declaration in the same
 * scope silently replace an earlier one, so those first drafts could never
 * actually run — only the versions declared later (near openDataLens) ever
 * fired. They've been deleted here as verified-unreachable duplicates.
 * filterSummaryBody / bindManagerRows / openDrawer are kept because
 * openPortfolioSummary, openConstrained and openMarketTable still use that
 * simpler drawer style — they were never redesigned.
 *
 * Changelog:
 *   2026-08-26  Split out of v6's inline <script>, removed 5 dead
 *               duplicate functions (see above).
 *   2026-08-26  Drawer now has a click-to-close backdrop (openDrawer/
 *               closeDrawer toggle #drawerOverlay). Added the 3-dot
 *               options menu (setupOptionsMenu/toggleOptionsMenu/
 *               closeOptionsMenu/toggleFullscreen/updateFullscreenLabel)
 *               replacing the old always-visible #fullBtn. Escape now
 *               also closes the options menu. All the actual animation
 *               (drawer backdrop fade, modal fade/scale, menu dropdown)
 *               lives in css/styles.css's "v6 polish" section.
 *   2026-08-26  Added drawer back-navigation: openManager/openStrategy/etc
 *               reached by clicking something *inside* the currently-open
 *               drawer (a manager row, a strategy row, a vintage segment)
 *               now push the previous view onto `drawerHistory` via
 *               navigateDrawer(), and #drawerBack (hidden unless there is
 *               history) pops back to it. Hotspot clicks (runAction) always
 *               start a fresh stack. Also: the 3-dot options menu now
 *               hides itself while the drawer or modal is open
 *               (syncOptionsMenuVisibility, toggled via body.popup-open).
 *   2026-08-26  Manager lens (openManager → openDataLens with
 *               singleManager:true): drop the always-1 "Managers" KPI
 *               and the manager-group accordion. Strategy / vintage /
 *               DPI lenses are unchanged.
 *   2026-08-26  KPI grids: manager lens (5 cells) is 2+3 so the 3-col
 *               hole is gone; fund-detail modal (4 cells) is one row.
 *   2026-08-26  Holdings tables: drop the sort dropdown. One shared
 *               bindSortableTable() drives clickable headers (arrow =
 *               active column + asc/desc) and a right-side search. Every
 *               openHoldings() caller uses it.
 *   2026-08-26  Table PDF export: a PDF button sits next to the modal
 *               close control on holdings tables only. It prints the
 *               current table view (search + sort) via the browser
 *               Save-as-PDF dialog — no extra library, stays offline.
 *               Chart / fund-detail modals hide the button.
 *   2026-08-26  PDF header now carries the TANGIBLE boxed wordmark
 *               (same chrome as the slides) at the top right.
 *   2026-08-27  Removed the Manager concentration interactive modal
 *               (openManagerChart, managerDataset, openDpiSegment) and
 *               the "Manager chart" button on the portfolio drawer.
 *

 *   2026-08-26  Bug fix: #drawerBack showed on EVERY drawer view, not just
 *               after navigating within one. Root cause was in
 *               css/styles.css, not here — .navBackBtn's own `display:
 *               inline-flex` was overriding the browser's native
 *               [hidden]{display:none} rule (an author-stylesheet
 *               declaration always beats a user-agent one, regardless of
 *               specificity). Fixed by adding `.navBackBtn[hidden]{display:
 *               none}`. This file's own hidden/history logic was already
 *               correct — confirmed with a real headless-Chromium check,
 *               not just the Node vm smoke tests used elsewhere in this
 *               file's history.
 *   2026-08-26  Bug fix: the hover highlight on slides 7 and 9 ("Strategy
 *               Mix") didn't line up with the row it belonged to — some
 *               rows' hover box floated in the gap below their own label
 *               and crept toward (or into) the next row, and it wasn't
 *               even the same gap consistently, which read as "random."
 *               Root cause: this file's own CFG.hotspots["7"]/["9"] (renumbered from \["6"]/["8"] in Round 18)
 *               overrides (just below) had hand-guessed y/h percentages
 *               that didn't actually match where each row sits in the
 *               slide's own PNG — this pre-dates the v7 refactor, it was
 *               already like this in v6. Fixed by measuring each row
 *               label's real vertical center directly from
 *               assets/images/07-strategy-mix.png and
 *               assets/images/09-strategy-mix.png (renumbered from
 *               06-/08- in Round 18) (a small Python/Pillow
 *               scan for text-row bands), then setting each row's y/h to
 *               span exactly from the midpoint between it and the row
 *               above to the midpoint between it and the row below — so
 *               the six hotspots tile the row list edge-to-edge with zero
 *               gaps and zero overlaps. Slides 7 and 9 look visually
 *               identical but are NOT spaced identically in the export
 *               (9's rows sit ~0.3% lower and 10.0% apart vs 7's ~9.7%),
 *               so they now have their own numbers instead of sharing one
 *               hardcoded set. Verified in real Chromium: hovering each
 *               row now highlights exactly and only that row, on both
 *               slides. NOTE: slide 27 ("Strategy Mix" recap, renumbered from 26 in Round 18) has a
 *               different, nested-category layout (Venture & Growth /
 *               Private Equity / Real Assets / Real Estate, each with
 *               sub-line items) and its hotspots still use the generic,
 *               unmeasured values from data.js — it wasn't touched here
 *               because its hotspot `action`/`value` pairs don't even
 *               match its own labels (a separate, likely pre-existing
 *               issue — flagged for a future round rather than guessed at).
 *   2026-08-26  PROTOTYPE: slide 6 ("Strategy Mix") now renders as live
 *               HTML (see HTML_SLIDES / renderStrategyMixSlide below)
 *               instead of the PNG + hotspot-coordinate approach every
 *               other slide still uses. This was in direct response to
 *               the misalignment bug just above — an HTML row IS its own
 *               click/hover target, so there's no coordinate to ever
 *               drift out of sync with it again. Every number on the
 *               slide is computed live from CFG.rows via the same
 *               weightedMetrics() the drawers already used, so it's
 *               provably the same data, just rendered differently (all
 *               six rows' NAV/%/TVPI matched the original PNG exactly
 *               once formatted the same way — see fmtMoneyM below).
 *               Scope is deliberately narrow: one slide, opt-in via the
 *               HTML_SLIDES map, zero change to any other slide's
 *               behavior. See README.md's "HTML slide prototype" section
 *               for the full writeup, open questions (font, exact
 *               colors, the simplified vintage chart), and what a wider
 *               rollout would take.
 *   2026-08-26  Slide 1 ("00", the cover) now also renders as live HTML,
 *               via renderCoverSlide() below — the first slide built from
 *               real Figma data instead of a guess: the cover's Figma
 *               Slides file was copied into a Design file (Slides files
 *               aren't readable via the Files REST API), then pulled with
 *               GET /v1/files/:key/nodes and run through the new
 *               tools/figma_to_html.py, which walks the node tree and
 *               emits flat, absolutely-positioned divs with Figma's exact
 *               coordinates/fonts/colors (see that script's own header
 *               comment for why the divs are flat siblings rather than
 *               nested — Figma's absoluteBoundingBox is already
 *               root-relative, so nesting under position:absolute parents
 *               would double the offset). This also resolved the "what
 *               font is this" question flagged above: it's Plus Jakarta
 *               Sans (confirmed via the Figma style metadata's
 *               fontPostScriptName), self-hosted from
 *               assets/fonts/ (SIL OFL-licensed, see the @font-face rules
 *               in css/styles.css) rather than linked from Google Fonts,
 *               to keep the deck offline-portable.
 *               HTML_SLIDES entries are now {render, width, height}
 *               instead of a bare render function, since the cover's
 *               native canvas is 1920x1080 (Figma's own frame size) while
 *               the Strategy Mix prototype's is 1600x900 (measured off its
 *               PNG) — showSlide()/syncSlideCanvasScale() read each
 *               slide's own size instead of assuming 1600x900 for every
 *               HTML slide. Slide 6 is unchanged in every other respect.
 */

// ---- Tiny DOM helpers ----
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));

// ---- Deck state + number/text formatting helpers ----
let slide=1;
const fmtMoney=v=>v==null||!isFinite(v)?'—':(Math.abs(v)>=1e9?'$'+(v/1e9).toFixed(2)+'bn':Math.abs(v)>=1e6?'$'+(v/1e6).toFixed(1)+'M':'$'+Math.round(v).toLocaleString());
const fmtPct=v=>v==null||!isFinite(v)?'—':(v*100).toFixed(1)+'%';
function unfundedPct(unfunded,commitment){const c=Number(commitment);if(!c||!isFinite(c))return 0;const p=(Number(unfunded)||0)/c;if(!isFinite(p))return 0;return Math.min(1,p)}
const fmtX=v=>v==null||!isFinite(v)?'—':Number(v).toFixed(2)+'x';
const sum=(arr,key)=>arr.reduce((a,d)=>a+(Number(d[key])||0),0);
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escAttr(s){return esc(s)}
function showHint(msg){console.warn(msg)}
// ---- Portfolio-metric aggregation (sums NAV/paid/dist/etc across a set of fund rows) ----
function weightedMetrics(arr){const paid=sum(arr,'paid');const nav=sum(arr,'nav');return {nav,paid,dist:sum(arr,'dist'),unfunded:sum(arr,'unfunded'),commitment:sum(arr,'commitment'),dpi:paid?sum(arr,'dist')/paid:null,rvpi:paid?nav/paid:null,tvpi:paid?sum(arr,'total_value')/paid:null}}

// Optional third field, `afterRender`: a zero-arg callback run right after
// this slide's markup is inserted into #slideHtmlCanvas (see showSlide()
// below). Added for slide 7's real chart (ApexCharts needs a DOM node to
// mount into, which only exists once render()'s returned HTML string has
// actually been inserted — a plain render() string can't do that itself).
// Every other HTML_SLIDES entry omits it and behaves exactly as before.
const HTML_SLIDES = {
  1: {render: renderCoverSlide, width: 1920, height: 1080},
  2: {render: renderAboutTangibleSlide, width: 1920, height: 1080},
  3: {render: renderTangibleStatsSlide, width: 1920, height: 1080, afterRender: animateTangibleStatsSlide},
  4: {render: renderRoutesToLiquiditySlide, width: 1920, height: 1080, afterRender: animateRoutesToLiquiditySlide},
  5: {render: renderKeyConsiderationsSlide, width: 1920, height: 1080, afterRender: animateKeyConsiderationsSlide},
  6: {render: renderStrategyMixSlide, width: 1920, height: 1080, afterRender: renderStrategyMixSlideAfterRender},
  7: {render: renderManagerConcentrationSlide, width: 1920, height: 1080, afterRender: renderManagerConcentrationSlideAfterRender},
  8: {render: renderStrategyDeepDiveSlide, width: 1920, height: 1080, afterRender: renderStrategyDeepDiveSlideAfterRender},
  9: {render: renderMarketSentimentSlide, width: 1920, height: 1080, afterRender: renderMarketSentimentSlideAfterRender},
  10: {render: renderDiscussionPointsSlide, width: 1920, height: 1080, afterRender: animateDiscussionPointsSlide},
  11: {render: renderNextStepsSlide, width: 1920, height: 1080, afterRender: animateNextStepsSlide},
  12: {render: renderBasisOfPreparationSlide, width: 1920, height: 1080, afterRender: animateBasisOfPreparationSlide},
  13: {render: renderAnnexesDividerSlide, width: 1920, height: 1080},
  14: {render: renderPortfolioHoldingsSlide, width: 1920, height: 1080, afterRender: bindPortfolioHoldingsSort},
  15: {render: renderTangibleContactSlide, width: 1920, height: 1080},
  16: {render: renderDisclaimerSlide, width: 1920, height: 1080, afterRender: animateDisclaimerSlide}
};

function syncSlideCanvasScale(){
  const canvas = $('#slideHtmlCanvas');
  const inner = canvas && canvas.querySelector('.slideCanvasInner');
  if(!inner) return;
  const wrap = $('#slideWrap');
  if(!wrap || !wrap.clientWidth) return;
  // Native width comes from the element's own inline width (set per-slide
  // in showSlide() from HTML_SLIDES[n].width) via offsetWidth, which is
  // unaffected by the transform:scale() we're about to apply — NOT a
  // hardcoded 1600, since slides now use different native canvas sizes
  // (1920 for the Figma-derived cover, 1600 for the PNG-derived prototype).
  const nativeW = inner.offsetWidth || parseFloat(inner.style.width) || 1600;
  inner.style.transform = 'scale('+(wrap.clientWidth/nativeW)+')';
}

// ---- Slide transition (Round 17) ----
// Replaces the old `.slideWrap.changing{opacity:.72}` dip (see the matching
// comment in css/styles.css for the full root-cause writeup of the flash it
// caused) with a two-layer crossfade + directional slide: clone whichever
// element is currently visible into a temporary "ghost" that freezes the
// outgoing frame in place, swap the real content underneath it (invisibly),
// then animate the ghost away while the freshly-swapped real element
// animates in from the opposite side. `cloneNode(true)` does not carry over
// addEventListener-attached handlers (this file never uses inline on*
// attributes), so the ghost is inert by construction; `pointer-events:none`
// in CSS is a second, belt-and-braces guard against it ever intercepting a
// click mid-transition.
const SLIDE_TRANSITION_MS=420;
let hasShownSlide=false; // guards against animating the very first paint
function prefersReducedMotion(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}
function clearSlideGhosts(wrap){wrap.querySelectorAll('.slideGhost').forEach(g=>g.remove())}
function showSlide(n){
  const prevSlide=slide;
  const total=CFG.titles.length;
  slide=Math.max(1,Math.min(total,n));
  if(slide!==prevSlide){closeModal();closeDrawer()}
  const donutTip=$('#donutTip');if(donutTip)donutTip.style.display='none';
  const wrap=$('#slideWrap');
  const canvasEl=$('#slideHtmlCanvas');
  if(canvasEl)canvasEl.classList.remove('slideInFromRight','slideInFromLeft','slideSettling');
  if(wrap)clearSlideGhosts(wrap);
  const direction=(!hasShownSlide||slide===prevSlide)?null:(slide>prevSlide?'next':'prev');
  let outgoingGhost=null;
  if(wrap&&direction&&!prefersReducedMotion()&&canvasEl&&!deckExporting){
    outgoingGhost=canvasEl.cloneNode(true);
    outgoingGhost.removeAttribute('id');
    outgoingGhost.className=(canvasEl.className+' slideGhost').trim();
    wrap.appendChild(outgoingGhost);
    void outgoingGhost.offsetWidth;
  }
  const htmlEntry=HTML_SLIDES[slide];
  if(!htmlEntry){console.error('Missing HTML slide',slide);return}
  canvasEl.hidden=false;
  canvasEl.innerHTML='<div class="slideCanvasInner" style="width:'+htmlEntry.width+'px;height:'+htmlEntry.height+'px">'+htmlEntry.render()+'</div>';
  syncSlideCanvasScale();
  if(htmlEntry.afterRender){try{htmlEntry.afterRender()}catch(err){console.error(err)}}
  $('#prev').disabled=slide===1;$('#next').disabled=slide===total;
  renderDots();
  document.body.classList.toggle('on-cover',slide===1);
  try{history.replaceState(null,'','#slide='+slide)}catch(e){}
  if(outgoingGhost){
    const incomingEl=canvasEl;
    const fromSide=direction==='next'?'slideInFromRight':'slideInFromLeft';
    const toSide=direction==='next'?'slideOutToLeft':'slideOutToRight';
    incomingEl.classList.add(fromSide);
    void incomingEl.offsetWidth;
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        incomingEl.classList.remove(fromSide);
        incomingEl.classList.add('slideSettling');
        outgoingGhost.classList.add(toSide);
      });
    });
    const finish=()=>{incomingEl.classList.remove('slideSettling');outgoingGhost.remove()};
    outgoingGhost.addEventListener('transitionend',finish,{once:true});
    setTimeout(finish,SLIDE_TRANSITION_MS+120);
  }
  hasShownSlide=true;
}
function renderDots(){const nav=$('#nd');if(!nav)return;nav.innerHTML='';for(let i=1;i<=CFG.titles.length;i++){const d=document.createElement('button');d.type='button';d.className='nd'+(i===slide?' on':'');d.title=(CFG.titles[i-1]||t('chrome.slideFallback'))+' · '+String(i).padStart(2,'0');d.setAttribute('aria-label',d.title);d.addEventListener('click',()=>showSlide(i));nav.appendChild(d)}}
function runAction(h){drawerHistory=[];try{switch(h.action){case 'goSlide':return showSlide(Number(h.value));case 'strategy':return openStrategy(h.value);case 'mixStrategy':return openMixStrategy(h.value);case 'multiStrategy':return openMultiStrategy(h.value);case 'holdings':return openHoldings();case 'holdingsStrategy':return openHoldings(d=>d.strategy===h.value,t('table.holdingsSuffix',{title:h.value}));case 'holdingsMulti':return openHoldings(d=>h.value.includes(d.strategy),t('table.holdingsSuffix',{title:h.value.join(' + ')}));case 'vintageView':return openVintageView();case 'vintageSegment':return openDataLens(t('lens.vintageSegTitle',{seg:h.value}),t('lens.vintageSegSub',{seg:h.value}),CFG.rows.filter(d=>d.vintage_segment===h.value),{intro:t('lens.introVintage')});case 'marketTable':return openMarketTable();case 'portfolioSummary':return openPortfolioSummary();case 'constrained':return openConstrained(h.value);default:return openPortfolioSummary()}}catch(err){console.error(err);showHint(t('error.openView'))}}
// ---- Drawer / modal primitives (generic open/close plumbing) ----
// `drawerHistory` holds "how to redraw the previous view" as zero-arg
// thunks, most-recent-last. runAction() clears it on every fresh hotspot
// click; navigateDrawer() pushes onto it when a click *inside* the drawer
// swaps in a new view. See "Drawer back-navigation" further down.
let drawerHistory=[];
function updateDrawerBack(){const btn=$('#drawerBack');if(!btn)return;btn.hidden=drawerHistory.length===0}
function openDrawer(title,sub,body){$('#drawerTitle').textContent=title;$('#drawerSub').textContent=sub||'';$('#drawerBody').innerHTML=body;$('#drawer').classList.add('open');$('#drawer').setAttribute('aria-hidden','false');$('#drawerOverlay').classList.add('open');updateDrawerBack();syncOptionsMenuVisibility()}
function closeDrawer(){$('#drawer').classList.remove('open');$('#drawer').setAttribute('aria-hidden','true');$('#drawerOverlay').classList.remove('open');drawerHistory=[];updateDrawerBack();syncOptionsMenuVisibility()}
function hideTableExport(){const btn=$('#modalExport');if(!btn)return;btn.hidden=true;btn.onclick=null}
function showTableExport(handler){const btn=$('#modalExport');if(!btn)return;btn.hidden=false;btn.onclick=handler}
function openModal(title,sub,body,opts={}){hideTableExport();const card=$('.modalCard');if(card)card.classList.toggle('modalCard-compact',!!opts.compact);$('#modalTitle').textContent=title;$('#modalSub').textContent=sub||'';$('#modalBody').innerHTML=body;$('#modal').classList.add('open');$('#modal').setAttribute('aria-hidden','false');syncOptionsMenuVisibility()}
function closeModal(){hideTableExport();const card=$('.modalCard');if(card)card.classList.remove('modalCard-compact');$('#modal').classList.remove('open');$('#modal').setAttribute('aria-hidden','true');syncOptionsMenuVisibility()}
function navigateDrawer(renderCurrent,openNext){drawerHistory.push(renderCurrent);openNext()}
function drawerBack(){if(!drawerHistory.length)return;const prev=drawerHistory.pop();prev()}
function topManagers(arr,n=7){const m={};arr.forEach(d=>{const k=d.manager||'Unknown';if(!m[k])m[k]={manager:k,nav:0,paid:0,dist:0,unfunded:0,count:0};m[k].nav+=d.nav||0;m[k].paid+=d.paid||0;m[k].dist+=d.dist||0;m[k].unfunded+=d.unfunded||0;m[k].count++});return Object.values(m).sort((a,b)=>b.nav-a.nav).slice(0,n)}
function vintageAgg(arr){const order=['Pre-2013','2013-2015','2016-2018','2019-2021','2022+'];const o={};arr.forEach(d=>{const k=d.vintage_segment||String(d.vintage||'N/A');o[k]=(o[k]||0)+(d.nav||0)});return Object.entries(o).sort((a,b)=>{let ia=order.indexOf(a[0]),ib=order.indexOf(b[0]);return (ia<0?99:ia)-(ib<0?99:ib)})}
// ---- Legacy summary-drawer renderer ----
// Still used by openPortfolioSummary / openConstrained / openMarketTable,
// which were never migrated to the newer openDataLens drawer below.
function filterSummaryBody(arr){const m=weightedMetrics(arr);const tms=topManagers(arr,7);const va=vintageAgg(arr);const maxNav=Math.max(...tms.map(x=>x.nav),1);const maxV=Math.max(...va.map(x=>x[1]),1);return `<div class="kpis"><div class="kpi"><div class="v">${fmtMoney(m.nav)}</div><div class="l">${t('kpi.nav')}</div></div><div class="kpi"><div class="v">${arr.length}</div><div class="l">${t('kpi.interests')}</div></div><div class="kpi"><div class="v">${fmtX(m.dpi)}</div><div class="l">${t('kpi.dpi')}</div></div><div class="kpi"><div class="v">${fmtX(m.rvpi)}</div><div class="l">${t('kpi.rvpi')}</div></div><div class="kpi"><div class="v">${fmtX(m.tvpi)}</div><div class="l">${t('kpi.tvpi')}</div></div><div class="kpi"><div class="v">${fmtPct(unfundedPct(m.unfunded,m.commitment))}</div><div class="l">${t('kpi.unfunded')}</div></div></div><div class="section"><div class="sectionTitle">${t('drawer.largestManagers')}</div>${tms.map(x=>`<div class="dataRow managerRow" data-manager="${escAttr(x.manager)}"><div class="name"><b>${esc(x.manager)}</b><div class="meta">${t('common.interestCount',{n:x.count})} · ${t('kpi.dpi')} ${fmtX(x.paid?x.dist/x.paid:null)}</div><div class="bar"><i style="width:${Math.max(2,x.nav/maxNav*100)}%"></i></div></div><div class="val">${fmtMoney(x.nav)}</div></div>`).join('')}</div><div class="section"><div class="sectionTitle">${t('drawer.vintageNav')}</div>${va.map(([k,v])=>`<div class="dataRow"><div class="name"><b>${esc(k)}</b><div class="bar"><i style="width:${Math.max(2,v/maxV*100)}%"></i></div></div><div class="val">${fmtMoney(v)}<div class="meta">${m.nav?(v/m.nav*100).toFixed(1):0}%</div></div></div>`).join('')}</div>`}
function bindManagerRows(backFn){ $$('.managerRow').forEach(el=>el.addEventListener('click',()=>navigateDrawer(backFn,()=>openManager(el.dataset.manager)))) }

// ---- Action handlers wired to hotspots & drawer/modal buttons ----
function constrainedFilter(name){if(name==='Credit')return d=>d.strategy==='Credit';if(name==='Real Estate')return d=>d.strategy==='Real Estate';if(name==='Tail End')return d=>(Number(d.vintage)||9999)<=2011;if(name==='Early Life Commitments')return d=>[2024,2025,2026].includes(Number(d.vintage))||unfundedPct(d.unfunded,d.commitment)>0.30;return ()=>true}
function openConstrained(name){const fn=constrainedFilter(name);const arr=CFG.rows.filter(fn);openDrawer(name,t('drawer.linkedInterests',{n:arr.length}),filterSummaryBody(arr)+`<div class="actions"><button class="btn" id="viewFiltered">${t('drawer.viewPositions')}</button></div>`);bindManagerRows(()=>openConstrained(name));$('#viewFiltered').onclick=()=>openHoldings(fn,name)}
function openPortfolioSummary(){const arr=CFG.rows;openDrawer(t('drawer.portfolioTitle'),t('drawer.portfolioSub',{n:arr.length}),filterSummaryBody(arr)+`<div class="actions"><button class="btn primary" id="viewFiltered">${t('drawer.openAllHoldings')}</button></div>`);bindManagerRows(()=>openPortfolioSummary());$('#viewFiltered').onclick=()=>openHoldings()}

function openMarketTable(){const strategies=['Buyout','Real Estate','Credit','Infrastructure','Growth & Venture','Special Situations'];let body='<div class="section"><div class="sectionTitle">'+t('drawer.marketSection')+'</div>'+strategies.map(s=>{const a=CFG.rows.filter(d=>d.strategy===s),m=weightedMetrics(a);return `<div class="dataRow stratRow" data-strategy="${escAttr(s)}"><div class="name"><b>${esc(s)}</b><div class="meta">${t('drawer.unfundedMeta',{n:a.length,pct:fmtPct(unfundedPct(m.unfunded,m.commitment))})}</div></div><div class="val">${fmtMoney(m.nav)}<div class="meta">${t('kpi.dpi')} ${fmtX(m.dpi)} · ${t('kpi.tvpi')} ${fmtX(m.tvpi)}</div></div></div>`}).join('')+'</div>';openDrawer(t('drawer.marketTitle'),t('drawer.marketSub'),body);$$('.stratRow').forEach(el=>el.addEventListener('click',()=>navigateDrawer(()=>openMarketTable(),()=>openStrategy(el.dataset.strategy))))}
// Shared sortable table. Column defs are the single source of truth for
// headers, sort type, search fields, and cell markup. Opens in source
// order with no column active. Click a header to sort (numbers default
// desc, text default asc); click again to reverse. Idle columns show a
// faint up/down pair; the active column lights one chevron.
function holdingsCols(){return [
  {key:'investment',label:t('table.col.investment'),type:'text',search:true,render:d=>esc(d.investment)},
  {key:'manager',label:t('table.col.manager'),type:'text',search:true,render:d=>esc(d.manager)},
  {key:'strategy',label:t('table.col.strategy'),type:'text',search:true,render:d=>esc(d.strategy)},
  {key:'vintage',label:t('table.col.vintage'),type:'num',search:true,get:d=>Number(d.vintage)||0,render:d=>esc(d.vintage)},
  {key:'nav',label:t('table.col.nav'),type:'num',align:'num',render:d=>fmtMoney(d.nav)},
  {key:'unfunded_pct',label:t('table.col.unfunded'),type:'num',align:'num',get:d=>unfundedPct(d.unfunded,d.commitment),render:d=>fmtPct(unfundedPct(d.unfunded,d.commitment))},
  {key:'dpi',label:t('table.col.dpi'),type:'num',align:'num',render:d=>fmtX(d.dpi)},
  {key:'rvpi',label:t('table.col.rvpi'),type:'num',align:'num',render:d=>fmtX(d.rvpi)},
  {key:'tvpi',label:t('table.col.tvpi'),type:'num',align:'num',render:d=>fmtX(d.tvpi)}
]}
function colDefaultDir(col){return col.type==='num'?'desc':'asc'}
function colValue(col,d){if(col.get)return col.get(d);const v=d[col.key];if(col.type==='num')return v==null||!isFinite(Number(v))?-Infinity:Number(v);return String(v??'')}
function compareBy(col,dir){const m=dir==='asc'?1:-1;return (a,b)=>{const av=colValue(col,a),bv=colValue(col,b);return col.type==='num'?(av-bv)*m:String(av).localeCompare(String(bv),I18N.locale,{sensitivity:'base'})*m}}
function tableShellHtml(placeholder){return `<div class="tableToolbar"><label class="tableSearch"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16.2 16.2L21 21"/></svg><input id="tableSearch" type="search" placeholder="${esc(placeholder)}" autocomplete="off" spellcheck="false"></label></div><div class="tableWrap"><table class="dataTable"><thead><tr></tr></thead><tbody></tbody><tfoot></tfoot></table></div>`}
function holdingsTotalCells(cols,visible){
  const m=weightedMetrics(visible);
  return cols.map(c=>{
    let v='';
    if(c.key==='investment')v=esc(t('table.grandTotal',{n:visible.length}));
    else if(c.key==='nav')v=fmtMoney(m.nav);
    else if(c.key==='unfunded_pct')v=fmtPct(unfundedPct(m.unfunded,m.commitment));
    else if(c.key==='dpi')v=fmtX(m.dpi);
    else if(c.key==='rvpi')v=fmtX(m.rvpi);
    else if(c.key==='tvpi')v=fmtX(m.tvpi);
    return `<td${c.align==='num'?' class="num"':''}>${v}</td>`;
  }).join('');
}
function sortLabel(col,dir){return col.type==='num'?t(dir==='desc'?'table.sortNumDesc':'table.sortNumAsc',{label:col.label}):t(dir==='asc'?'table.sortTextAsc':'table.sortTextDesc',{label:col.label})}
function exportTablePdf({title,sub,cols,rows,sortNote,searchNote,totalHtml}){
  const font700=new URL('assets/fonts/plus-jakarta-sans-latin-700-normal.woff2',location.href).href;
  const head=cols.map(c=>`<th class="${c.align==='num'?'num':''}">${esc(c.label)}</th>`).join('');
  const body=rows.map(d=>`<tr>${cols.map(c=>`<td class="${c.align==='num'?'num':''}">${c.render(d)}</td>`).join('')}</tr>`).join('');
  const foot=totalHtml?`<tfoot><tr>${totalHtml}</tr></tfoot>`:'';
  const html=`<!doctype html><html><head><meta charset="utf-8"><title></title><style>@font-face{font-family:'Plus Jakarta Sans';src:url('${font700}') format('woff2');font-weight:700;font-style:normal}@page{size:landscape;margin:12mm 10mm}*{box-sizing:border-box}body{margin:0;color:#1a1a1a;font:11px/1.35 Helvetica,Arial,sans-serif}.pdfHead{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin:0 0 14px;padding:0 0 12px;border-bottom:1.5px solid #104130}.tangibleMark{flex-shrink:0;box-sizing:border-box;border:1.5px solid #104130;color:#104130;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:4px;line-height:1;padding:9px 20px 9px 16px;white-space:nowrap}h1{margin:0 0 4px;font-size:18px;font-weight:600;color:#104130}.meta{margin:0;font-size:10px;color:#5a635e}table{width:100%;border-collapse:collapse}th,td{padding:5px 6px;border-bottom:1px solid #dee4df;text-align:left;vertical-align:top}th{background:#104130;color:#f5f5f0;font-size:9px;letter-spacing:.06em;text-transform:uppercase;font-weight:600}td.num,th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}tbody tr:nth-child(even){background:#f6f8f7}thead{display:table-header-group}tfoot{display:table-footer-group}tfoot td{font-weight:700;background:#e7efe8;border-top:1.5px solid #104130;border-bottom:0}</style></head><body><div class="pdfHead"><div><h1>${esc(title)}</h1><p class="meta">${esc(sub||'')} · ${esc(t('common.rows',{n:rows.length}))}${searchNote?` · ${esc(searchNote)}`:''}${sortNote?` · ${esc(sortNote)}`:''} · ${esc(t('pdf.confidential'))}</p></div><div class="tangibleMark">${esc(t('pdf.brand'))}</div></div><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${foot}</table></body></html>`;
  const iframe=document.createElement('iframe');
  iframe.setAttribute('aria-hidden','true');
  iframe.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
  document.body.appendChild(iframe);
  const doc=iframe.contentDocument;doc.open();doc.write(html);doc.close();
  const win=iframe.contentWindow;
  const prevTitle=document.title;
  document.title=' ';
  const done=()=>{document.title=prevTitle;try{iframe.remove()}catch(e){}};
  win.onafterprint=done;
  setTimeout(()=>{try{win.focus();win.print()}catch(e){done()}},80);
  setTimeout(done,120000);
}
function bindSortableTable({cols,rows,defaultKey=null,onRowClick}){
  const table=$('.dataTable');if(!table)return;
  const thead=$('thead tr',table),tbody=$('tbody',table),tfoot=$('tfoot',table),search=$('#tableSearch');
  let sortKey=defaultKey,sortDir=sortKey?colDefaultDir(cols.find(c=>c.key===sortKey)||cols[0]):'desc';
  const searchCols=cols.filter(c=>c.search);
  thead.innerHTML=cols.map(c=>`<th class="thSort${c.align==='num'?' num':''}" data-key="${escAttr(c.key)}" scope="col"><button type="button" class="thSortBtn">${esc(c.label)}<span class="thChevrons" aria-hidden="true"><i class="arr-up"></i><i class="arr-dn"></i></span></button></th>`).join('');
  function syncHeader(){$$('th.thSort',table).forEach(th=>{const on=th.dataset.key===sortKey;th.classList.toggle('is-sorted',on);th.classList.toggle('dir-asc',on&&sortDir==='asc');th.classList.toggle('dir-desc',on&&sortDir==='desc');th.setAttribute('aria-sort',on?(sortDir==='asc'?'ascending':'descending'):'none');const col=cols.find(c=>c.key===th.dataset.key);const btn=$('.thSortBtn',th);if(btn)btn.title=on?t('table.sortActive',{dir:t(sortDir==='asc'?'table.sortDirAsc':'table.sortDirDesc')}):t('table.sortBy',{label:col.label})})}
  function visibleRows(){return tbody._rows||[]}
  function render(){const q=(search?.value||'').trim().toLowerCase();let a=rows.filter(d=>!q||searchCols.some(c=>String(colValue(c,d)).toLowerCase().includes(q)));const col=sortKey&&cols.find(c=>c.key===sortKey);if(col)a.sort(compareBy(col,sortDir));syncHeader();tbody.innerHTML=a.map((d,i)=>`<tr data-i="${i}">${cols.map(c=>`<td${c.align==='num'?' class="num"':''}>${c.render(d)}</td>`).join('')}</tr>`).join('');tbody._rows=a;if(tfoot)tfoot.innerHTML=`<tr class="dataTableTotal">${holdingsTotalCells(cols,a)}</tr>`;if(onRowClick)$$('tr',tbody).forEach(tr=>tr.addEventListener('click',()=>onRowClick(tbody._rows[Number(tr.dataset.i)])))}
  thead.addEventListener('click',e=>{const th=e.target.closest('th.thSort');if(!th)return;const col=cols.find(c=>c.key===th.dataset.key);if(!col)return;if(sortKey===col.key)sortDir=sortDir==='asc'?'desc':'asc';else{sortKey=col.key;sortDir=colDefaultDir(col)}render()});
  if(search)search.addEventListener('input',render);
  showTableExport(()=>{const col=sortKey&&cols.find(c=>c.key===sortKey);const out=visibleRows();const q=(search?.value||'').trim();exportTablePdf({title:$('#modalTitle').textContent,sub:$('#modalSub').textContent,cols,rows:out,searchNote:q?t('table.searchNote',{q}):'',sortNote:col?sortLabel(col,sortDir):'',totalHtml:holdingsTotalCells(cols,out)})});
  render();
}
function openHoldings(filterFn=null,title){const rows=filterFn?CFG.rows.filter(filterFn):CFG.rows.slice();openModal(title||t('table.holdingsTitle'),t('table.holdingsSub',{n:rows.length}),tableShellHtml(t('table.searchPlaceholder')));bindSortableTable({cols:holdingsCols(),rows,onRowClick:d=>{closeModal();openManager(d.manager)}})}
// ---- Current "data lens" drawer implementation ----
// The four functions below (openStrategy, openMultiStrategy, openManager,
// openVintageView) are the ACTIVE drill-down handlers referenced
// by runAction() near the top of this file.
function primaryStrategy(arr){const by={};arr.forEach(d=>by[d.strategy]=(by[d.strategy]||0)+(d.nav||0));return Object.entries(by).sort((a,b)=>b[1]-a[1])[0]?.[0]||''}
function managerGroups(arr){const by={};arr.forEach(d=>{const k=d.manager||'Unknown';if(!by[k])by[k]={manager:k,nav:0,paid:0,dist:0,commitment:0,unfunded:0,items:[]};const x=by[k];x.items.push(d);x.nav+=Number(d.nav)||0;x.paid+=Number(d.paid)||0;x.dist+=Number(d.dist)||0;x.commitment+=Number(d.commitment)||0;x.unfunded+=Number(d.unfunded)||0});return Object.values(by).map(x=>{x.dpi=x.paid?x.dist/x.paid:null;x.tvpi=x.paid?(x.dist+x.nav)/x.paid:null;x.strategy=primaryStrategy(x.items);return x})}
function fundDetail(i){const d=CFG.rows[Number(i)];if(!d)return;const body=`<div class="lensKpis lensKpis-4"><div class="lensKpi"><div class="v">${fmtMoney(d.nav)}</div><div class="l">${t('kpi.nav')}</div></div><div class="lensKpi"><div class="v">${fmtX(d.dpi)}</div><div class="l">${t('kpi.dpi')}</div></div><div class="lensKpi"><div class="v">${fmtX(d.tvpi)}</div><div class="l">${t('kpi.tvpi')}</div></div><div class="lensKpi"><div class="v">${fmtPct(unfundedPct(d.unfunded,d.commitment))}</div><div class="l">${t('kpi.unfunded')}</div></div></div><div class="section"><div class="dataRow"><div class="name">${t('table.col.manager')}</div><div class="val">${esc(d.manager)}</div></div><div class="dataRow"><div class="name">${t('table.col.strategy')}</div><div class="val">${esc(d.strategy)}</div></div><div class="dataRow"><div class="name">${t('table.col.vintage')}</div><div class="val">${esc(d.vintage)}</div></div><div class="dataRow"><div class="name">${t('kpi.paidIn')}</div><div class="val">${fmtMoney(d.paid)}</div></div><div class="dataRow"><div class="name">${t('kpi.distributions')}</div><div class="val">${fmtMoney(d.dist)}</div></div><div class="dataRow"><div class="name">${t('kpi.unfunded')}</div><div class="val">${fmtMoney(d.unfunded)}</div></div></div>`;openModal(d.investment,`${d.manager} · ${d.strategy}`,body,{compact:true})}
function lensFundRow(d,maxFund){const idx=CFG.rows.indexOf(d);return `<div class="fundRow" data-idx="${idx}"><div><div class="fundName">${esc(d.investment)}</div><div class="fundMeta"><span class="chip">${esc(d.strategy)}</span>${t('lens.fundMeta',{vintage:esc(d.vintage),dpi:fmtX(d.dpi),tvpi:fmtX(d.tvpi)})}</div><div class="bar"><i style="width:${Math.max(3,(d.nav||0)/maxFund*100)}%"></i></div></div><div class="fundVal">${fmtMoney(d.nav)}</div></div>`}
// opts.singleManager: manager-lens only. Skip the always-1 "Managers" KPI
// and the manager-group accordion — this view is already one GP. Strategy /
// vintage callers omit this flag and keep grouping by manager.
function openDataLens(title,sub,arr,opts={}){arr=arr.slice();const m=weightedMetrics(arr);const mgrCount=new Set(arr.map(d=>d.manager)).size;const single=!!opts.singleManager;const mgrKpi=single?'':`<div class="lensKpi"><div class="v">${mgrCount}</div><div class="l">${t('kpi.managers')}</div></div>`;const sortChoices=single?[['',t('lens.sortDefault')],['nav',t('lens.sortNav')],['name',t('lens.sortFundAz')],['vintage',t('lens.sortVintage')],['dpi',t('lens.sortDpi')]]:[['',t('lens.sortDefault')],['nav',t('lens.sortNav')],['name',t('lens.sortManagerAz')],['count',t('lens.sortMostFunds')],['dpi',t('lens.sortDpi')]];const sortMenu=sortChoices.map(([v,l])=>`<button type="button" class="lensSortOpt${v===''?' is-on':''}" data-value="${escAttr(v)}">${esc(l)}</button>`).join('');openDrawer(title,sub||t('lens.includedMgrs',{n:arr.length,mgrs:mgrCount}),`${opts.intro?`<div class="lensIntro">${opts.intro}</div>`:''}<div class="lensKpis${single?' lensKpis-5':''}"><div class="lensKpi"><div class="v">${fmtMoney(m.nav)}</div><div class="l">${t('kpi.nav')}</div></div><div class="lensKpi"><div class="v">${arr.length}</div><div class="l">${t('kpi.interests')}</div></div>${mgrKpi}<div class="lensKpi"><div class="v">${fmtX(m.dpi)}</div><div class="l">${t('kpi.dpi')}</div></div><div class="lensKpi"><div class="v">${fmtX(m.tvpi)}</div><div class="l">${t('kpi.tvpi')}</div></div><div class="lensKpi"><div class="v">${fmtPct(unfundedPct(m.unfunded,m.commitment))}</div><div class="l">${t('kpi.unfunded')}</div></div></div><div class="lensTools"><input id="lensSearch" placeholder="${single?t('lens.filterFunds'):t('lens.filterFundsOrManagers')}"><div class="lensSort" id="lensSort"><button type="button" class="lensSortBtn" id="lensSortBtn">${esc(t('lens.sortDefault'))}</button><div class="lensSortMenu" id="lensSortMenu" hidden>${sortMenu}</div></div><button id="lensOpenTable">${t('lens.openTable')}</button></div><div id="lensList"></div>`);const input=$('#lensSearch'),sortBtn=$('#lensSortBtn'),sortMenuEl=$('#lensSortMenu'),sortWrap=$('#lensSort'),list=$('#lensList'),openBtn=$('#lensOpenTable');let sortKey='';function closeSortMenu(){if(sortMenuEl)sortMenuEl.hidden=true}function render(){const q=(input.value||'').trim().toLowerCase();let visible=arr.filter(d=>!q||[d.investment,d.manager,d.strategy,String(d.vintage)].some(v=>String(v||'').toLowerCase().includes(q)));if(!visible.length){list.innerHTML=`<div class="emptyLens">${t('lens.empty')}</div>`;return}const k=sortKey;if(single){if(k)visible.sort((a,b)=>k==='name'?String(a.investment).localeCompare(String(b.investment),I18N.locale):k==='vintage'?(Number(b.vintage)||0)-(Number(a.vintage)||0):k==='dpi'?(b.dpi||-99)-(a.dpi||-99):(b.nav||0)-(a.nav||0));const maxFund=Math.max(...visible.map(d=>d.nav||0),1);list.innerHTML=`<div class="lensFundsFlat">${visible.map(d=>lensFundRow(d,maxFund)).join('')}</div>`}else{let groups=managerGroups(visible);if(k)groups.sort((a,b)=>k==='name'?a.manager.localeCompare(b.manager,I18N.locale):k==='count'?b.items.length-a.items.length:k==='dpi'?(b.dpi||-99)-(a.dpi||-99):b.nav-a.nav);list.innerHTML=groups.map((g,gi)=>{const maxFund=Math.max(...g.items.map(d=>d.nav||0),1);const funds=(k==='nav'?g.items.slice().sort((a,b)=>(b.nav||0)-(a.nav||0)):g.items).map(d=>lensFundRow(d,maxFund)).join('');return `<div class="lensGroup ${gi===0?'open':''}"><div class="lensManager"><div class="lensArrow">›</div><div><div class="lensName">${esc(g.manager)}</div><div class="lensMeta">${t('lens.groupMeta',{count:t('common.interestCount',{n:g.items.length}),strategy:esc(g.strategy),dpi:fmtX(g.dpi),tvpi:fmtX(g.tvpi)})}</div></div><div class="lensValue">${fmtMoney(g.nav)}</div></div><div class="lensFunds">${funds}</div></div>`}).join('');$$('.lensManager',list).forEach(el=>el.addEventListener('click',()=>el.closest('.lensGroup').classList.toggle('open')))}$$('.fundRow',list).forEach(el=>el.addEventListener('click',ev=>{ev.stopPropagation();fundDetail(el.dataset.idx)}))}input.addEventListener('input',render);if(sortBtn&&sortMenuEl&&sortWrap){sortBtn.addEventListener('click',ev=>{ev.stopPropagation();sortMenuEl.hidden=!sortMenuEl.hidden});sortMenuEl.addEventListener('click',ev=>{const opt=ev.target.closest('.lensSortOpt');if(!opt)return;sortKey=opt.getAttribute('data-value')||'';sortBtn.textContent=opt.textContent;$$('.lensSortOpt',sortMenuEl).forEach(el=>el.classList.toggle('is-on',el===opt));closeSortMenu();render()});input.addEventListener('focus',closeSortMenu);list.addEventListener('click',closeSortMenu)}openBtn.addEventListener('click',()=>openHoldings(d=>arr.includes(d),t('table.holdingsSuffix',{title})));render()}
function openStrategy(s){const arr=CFG.rows.filter(d=>d.strategy===s);const m=weightedMetrics(arr);openDataLens(s,t('lens.includedNavShare',{n:arr.length,pct:m.nav&&CFG.totalNav?(m.nav/CFG.totalNav*100).toFixed(1):'0.0'}),arr,{intro:t('lens.introStrategy')});}
function openMixStrategy(name){const arr=CFG.rows.filter(d=>(d.slideStrategy||d.strategy)===name);const m=weightedMetrics(arr);openDataLens(name,t('lens.includedNavShare',{n:arr.length,pct:m.nav&&CFG.totalNav?(m.nav/CFG.totalNav*100).toFixed(1):'0.0'}),arr,{intro:t('lens.introStrategy')});}
function openMultiStrategy(ss){const arr=CFG.rows.filter(d=>ss.includes(d.strategy));openDataLens(ss.join(' + '),t('lens.includedInterests',{n:arr.length}),arr,{intro:t('lens.introMulti')});}
function openManager(name){const arr=CFG.rows.filter(d=>d.manager===name);const dom=primaryStrategy(arr);openDataLens(name,t('lens.managerSub',{count:t('common.interestCount',{n:arr.length}),strategy:dom}),arr,{intro:t('lens.introManager'),singleManager:true});}
function openVintageView(){const segments=['Pre-2013','2013-2015','2016-2018','2019-2021','2022+'];const m=weightedMetrics(CFG.rows);openDrawer(t('lens.vintageTitle'),t('lens.vintageSub'),`<div class="lensKpis"><div class="lensKpi"><div class="v">${fmtMoney(m.nav)}</div><div class="l">${t('kpi.totalNav')}</div></div><div class="lensKpi"><div class="v">${CFG.rows.length}</div><div class="l">${t('kpi.interests')}</div></div><div class="lensKpi"><div class="v">${fmtX(m.tvpi)}</div><div class="l">${t('kpi.tvpi')}</div></div></div><div class="section"><div class="sectionTitle">${t('lens.vintageSection')}</div>${segments.map(seg=>{const arr=CFG.rows.filter(d=>d.vintage_segment===seg),mm=weightedMetrics(arr);return `<div class="dataRow vintageLensRow" data-seg="${escAttr(seg)}"><div class="name"><b>${seg}</b><div class="meta">${t('lens.vintageSegMeta',{count:t('common.interestCount',{n:arr.length}),dpi:fmtX(mm.dpi),tvpi:fmtX(mm.tvpi)})}</div><div class="bar"><i style="width:${Math.max(2,mm.nav/m.nav*100)}%"></i></div></div><div class="val">${fmtMoney(mm.nav)}<div class="meta">${m.nav?(mm.nav/m.nav*100).toFixed(1):'0.0'}%</div></div></div>`}).join('')}</div>`);$$('.vintageLensRow').forEach(el=>el.addEventListener('click',()=>{const seg=el.dataset.seg;navigateDrawer(()=>openVintageView(),()=>openDataLens(t('lens.vintageSegTitle',{seg}),t('lens.vintageSegSub',{seg}),CFG.rows.filter(d=>d.vintage_segment===seg),{intro:t('lens.introVintage')}))}))}

// ---- Options menu (3-dot button, top-right) ----
// Currently holds just "Fullscreen". To add another item: add a
// <button class="menuItem" role="menuitem"> to #menuList in index.html,
// then wire its click handler here alongside menuFullscreen's, following
// the same "run the action, then closeOptionsMenu()" pattern.
function syncOptionsMenuVisibility(){const anyOpen=$('#drawer').classList.contains('open')||$('#modal').classList.contains('open');document.body.classList.toggle('popup-open',anyOpen);if(anyOpen)closeOptionsMenu()}
function closeLensSortMenus(){
  document.querySelectorAll('.lensSortMenu').forEach(function (el) { el.hidden = true; });
}
function setupLensSortOutside(){
  document.addEventListener('pointerdown', function (ev) {
    const wrap = ev.target && ev.target.closest && ev.target.closest('.lensSort');
    if (wrap) return;
    closeLensSortMenus();
  }, true);
}
function closeOptionsMenu(){const list=$('#menuList'),btn=$('#menuBtn');if(!list||!btn)return;list.classList.remove('open');list.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false')}
function toggleOptionsMenu(){const list=$('#menuList'),btn=$('#menuBtn');if(!list||!btn)return;const willOpen=!list.classList.contains('open');list.classList.toggle('open',willOpen);list.setAttribute('aria-hidden',String(!willOpen));btn.setAttribute('aria-expanded',String(willOpen))}
async function toggleFullscreen(){try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch(e){}}
function updateFullscreenLabel(){const label=$('#menuFullscreen span');if(label)label.textContent=document.fullscreenElement?t('chrome.exitFullscreen'):t('chrome.fullscreen')}
function setupOptionsMenu(){
  const btn=$('#menuBtn');
  if(!btn)return;
  btn.addEventListener('click',ev=>{ev.stopPropagation();toggleOptionsMenu()});
  $('#menuFullscreen').addEventListener('click',()=>{toggleFullscreen();closeOptionsMenu()});
  const expCur=$('#menuExportCurrent');
  if(expCur)expCur.addEventListener('click',()=>{closeOptionsMenu();exportCurrentSlidePdf()});
  const expAll=$('#menuExportAll');
  if(expAll)expAll.addEventListener('click',()=>{closeOptionsMenu();exportAllSlidesPdf()});
  document.addEventListener('click',ev=>{const menu=$('#optionsMenu');if(menu&&!menu.contains(ev.target))closeOptionsMenu()});
  document.addEventListener('fullscreenchange',updateFullscreenLabel);
  updateFullscreenLabel();
}

// ---- Event wiring & bootstrap ----
function init(){
I18N.apply(document);
$('#slideHtmlCanvas').addEventListener('click',e=>{
  const row=e.target.closest('.smRow');
  if(row){runAction({action:'strategy',value:row.dataset.strategy});return}
  const vbox=e.target.closest('[data-vintage-box]');
  if(vbox){runAction({action:'vintageView'});return}
  // Generic hotspot overlay for figma_to_html.py-generated slides (added
  // Round 11, first used by slide 4's stat panel / ratio row): any element
  // carrying `data-action` re-runs the same runAction() switch the old
  // PNG-based CFG.hotspots click handler used, so a converted slide can
  // restore whatever hotspot behavior it had before conversion just by
  // adding a `data-action="..."` overlay div in its renderXSlide() markup —
  // no per-slide JS needed. See renderKeyConsiderationsSlide()'s comment for
  // why slide 4 needed this (showSlide() clears the old #hotspots overlay
  // entirely for any HTML_SLIDES entry, so a converted slide's old hotspots
  // silently stop working unless replaced this way).
  // Round 12: generalized with an optional `data-value`, since slide 6's
  // per-row hotspots need to pass which strategy was clicked (the old
  // single-attribute form only ever covered zero-argument actions like
  // "holdings" or "portfolioSummary"). `value` is simply undefined for a
  // hotspot that omits data-value, which every existing zero-arg action
  // already ignores — non-breaking for slide 4's hotspots.
  const hotspot=e.target.closest('[data-action]');
  if(hotspot){runAction({action:hotspot.dataset.action,value:hotspot.dataset.value})}
});
$('#slideHtmlCanvas').addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' ')return;
  const vbox=e.target.closest('[data-vintage-box]');
  if(vbox){e.preventDefault();e.stopPropagation();runAction({action:'vintageView'});return}
  const hotspot=e.target.closest('[data-action]');
  if(hotspot){e.preventDefault();e.stopPropagation();runAction({action:hotspot.dataset.action,value:hotspot.dataset.value})}
});
if(typeof ResizeObserver!=='undefined'){
  new ResizeObserver(syncSlideCanvasScale).observe($('#slideWrap'));
}
showSlide(Number((location.hash.match(/slide=(\d+)/)||[])[1])||1);$('#prev').onclick=()=>showSlide(slide-1);$('#next').onclick=()=>showSlide(slide+1);setupOptionsMenu();setupLensSortOutside();$('#drawerOverlay').addEventListener('click',closeDrawer);$('#drawerClose').onclick=closeDrawer;$('#drawerBack').onclick=drawerBack;$('#modalClose').onclick=closeModal;$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal()});$('#slideWrap').addEventListener('wheel',e=>{if(e.target.closest('.holdScrollBody'))return;if(!$('#modal').classList.contains('open')&&!$('#drawer').classList.contains('open'))e.preventDefault()},{passive:false});document.addEventListener('keydown',e=>{const modal=$('#modal').classList.contains('open'),drawer=$('#drawer').classList.contains('open'),menuList=$('#menuList'),menu=!!(menuList&&menuList.classList.contains('open')),sortOpen=document.querySelector('.lensSortMenu:not([hidden])');if(deckExporting){e.preventDefault();return}if(e.key==='Escape'){if(sortOpen){closeLensSortMenus();return}if(modal)closeModal();else if(drawer)closeDrawer();else if(menu)closeOptionsMenu();return}const typing=e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);if(typing)return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();showSlide(slide+1)}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();showSlide(slide-1)}else if(e.key.toLowerCase()==='d'&&!modal){openHoldings()}})}

try{init()}catch(err){console.error(err);document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;inset:20px;background:#fff;color:#0e4b37;z-index:9999;padding:24px;font-family:Arial;border:1px solid #ddd">'+t('error.load')+'</div>')}
