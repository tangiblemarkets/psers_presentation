// Visual PDF of the live slides (sorts, filters, dropdowns included).
// html2canvas + jsPDF are vendored; this file:// deck stays offline.

var deckExporting = false;
var deckRgbCtx = null;

function deckWait(ms){
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function deckJsPdf(){
  return (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
}

function deckMarkAnimsDone(){
  const flags = ['strategyMixPlayed','mcPlayed','sddPlayed','marketSentimentPlayed','rtlPlayed','discPlayed','nsPlayed','bopPlayed','dlPlayed'];
  flags.forEach(function (name) { if (typeof window[name] === 'boolean') window[name] = true; });
  try { strategyMixPlayed = true; } catch (e) {}
  try { mcPlayed = true; } catch (e) {}
  try { sddPlayed = true; } catch (e) {}
  try { marketSentimentPlayed = true; } catch (e) {}
  try { rtlPlayed = true; } catch (e) {}
  try { discPlayed = true; } catch (e) {}
  try { nsPlayed = true; } catch (e) {}
  try { bopPlayed = true; } catch (e) {}
  try { dlPlayed = true; } catch (e) {}
  if (typeof countUpPlayed === 'object') {
    countUpPlayed.stats = true;
    countUpPlayed.kc = true;
    countUpPlayed.sdd = true;
  }
}

function deckFileSafe(s){
  return String(s || 'slide').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function deckSetProgress(msg){
  const el = document.getElementById('exportProgressText');
  if (el) el.textContent = msg;
}

function deckShowOverlay(on){
  const el = document.getElementById('exportOverlay');
  if (!el) return;
  el.hidden = !on;
  el.setAttribute('aria-hidden', on ? 'false' : 'true');
}

function deckNewPdf(){
  const JsPDF = deckJsPdf();
  if (!JsPDF) throw new Error('PDF library missing');
  return new JsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1920, 1080],
    compress: true,
    hotfixes: ['px_scaling']
  });
}

function deckReleaseCanvas(canvas){
  if (!canvas) return;
  try {
    canvas.width = 1;
    canvas.height = 1;
  } catch (e) {}
}

function deckCleanupClones(){
  document.querySelectorAll('iframe.html2canvas-container, .deckExportHost').forEach(function (el) {
    el.remove();
  });
}

function deckIsModernColor(v){
  return !!v && /oklch|oklab|lab\(|lch\(|color\(|color-mix/i.test(v);
}

function deckCssToRgb(value){
  if (!value || !deckIsModernColor(value)) return value;
  try {
    if (!deckRgbCtx) deckRgbCtx = document.createElement('canvas').getContext('2d');
    deckRgbCtx.fillStyle = '#000000';
    deckRgbCtx.fillStyle = value;
    const out = deckRgbCtx.fillStyle;
    if (out && !deckIsModernColor(out)) return out;
  } catch (e) {}
  return 'rgb(0, 0, 0)';
}

function deckSanitizeClone(clonedDoc){
  const win = clonedDoc.defaultView;
  if (!win) return;
  const root = clonedDoc.querySelector('.slideCanvasInner') || clonedDoc.querySelector('.fig-slide');
  if (!root) return;
  const props = [
    ['color', 'color'],
    ['backgroundColor', 'background-color'],
    ['borderColor', 'border-color'],
    ['borderTopColor', 'border-top-color'],
    ['borderRightColor', 'border-right-color'],
    ['borderBottomColor', 'border-bottom-color'],
    ['borderLeftColor', 'border-left-color'],
    ['outlineColor', 'outline-color'],
    ['textDecorationColor', 'text-decoration-color'],
    ['columnRuleColor', 'column-rule-color'],
    ['fill', 'fill'],
    ['stroke', 'stroke']
  ];
  const nodes = root.querySelectorAll('*');
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    let cs;
    try { cs = win.getComputedStyle(el); } catch (e) { continue; }
    if (!cs) continue;
    for (let j = 0; j < props.length; j++) {
      const v = cs[props[j][0]];
      if (deckIsModernColor(v)) {
        try { el.style.setProperty(props[j][1], deckCssToRgb(v), 'important'); } catch (e) {}
      }
    }
  }
}

function deckInlineImages(root){
  const map = window.DECK_INLINE_IMAGES || {};
  Array.from(root.querySelectorAll('img')).forEach(function (img) {
    const src = img.getAttribute('src') || '';
    const data = map[src];
    if (!data) {
      img.remove();
      return;
    }
    const div = document.createElement('div');
    div.className = img.className;
    div.setAttribute('style', img.getAttribute('style') || '');
    div.style.backgroundImage = 'url(' + data + ')';
    div.style.backgroundRepeat = 'no-repeat';
    div.style.backgroundPosition = 'center center';
    div.style.backgroundSize = 'contain';
    img.parentNode.replaceChild(div, img);
  });
}

function deckCanvasLooksBlank(canvas){
  try {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) return true;
    const step = Math.max(8, Math.floor(Math.min(w, h) / 40));
    let dark = 0;
    let n = 0;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const p = ctx.getImageData(x, y, 1, 1).data;
        n++;
        if (p[0] < 248 || p[1] < 248 || p[2] < 248) dark++;
      }
    }
    return dark < 3;
  } catch (e) {
    return false;
  }
}

function deckCopyLiveIntoClone(inner, clone){
  const liveFields = inner.querySelectorAll('input, select, textarea');
  const cloneFields = clone.querySelectorAll('input, select, textarea');
  liveFields.forEach(function (el, i) {
    const c = cloneFields[i];
    if (!c) return;
    c.value = el.value;
    if (el.checked != null) c.checked = el.checked;
  });
  const liveScroll = inner.querySelectorAll('.holdScrollBody, .mcChartPanel');
  const cloneScroll = clone.querySelectorAll('.holdScrollBody, .mcChartPanel');
  liveScroll.forEach(function (el, i) {
    if (cloneScroll[i]) cloneScroll[i].scrollTop = el.scrollTop;
  });
  const liveCs = inner.querySelectorAll('canvas');
  const cloneCs = clone.querySelectorAll('canvas');
  liveCs.forEach(function (c, i) {
    const d = cloneCs[i];
    if (!d) return;
    try {
      d.width = c.width;
      d.height = c.height;
      d.getContext('2d').drawImage(c, 0, 0);
    } catch (e) {}
  });
  clone.querySelectorAll('.fig-hotspot, .apexcharts-tooltip').forEach(function (el) { el.remove(); });
  deckInlineImages(clone);
}

function deckAddPage(pdf, canvas, first){
  if (!first) pdf.addPage([1920, 1080], 'landscape');
  const alias = 's' + pdf.internal.getNumberOfPages();
  try {
    pdf.addImage(canvas, 'JPEG', 0, 0, 1920, 1080, alias, 'FAST');
  } catch (e) {
    const img = canvas.toDataURL('image/jpeg', 0.82);
    pdf.addImage(img, 'JPEG', 0, 0, 1920, 1080, alias, 'NONE');
  }
  deckReleaseCanvas(canvas);
}

function deckBlankPage(pdf, first){
  if (!first) pdf.addPage([1920, 1080], 'landscape');
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 1920, 1080, 'F');
}

async function deckHtml2Canvas(el, scale, extra){
  const opts = {
    width: 1920,
    height: 1080,
    windowWidth: 1920,
    windowHeight: 1080,
    scale: scale,
    backgroundColor: '#ffffff',
    useCORS: false,
    allowTaint: false,
    logging: false,
    imageTimeout: 1500,
    removeContainer: true,
    onclone: function (doc) {
      const root = doc.querySelector('.slideCanvasInner') || doc.body;
      deckInlineImages(root);
      deckSanitizeClone(doc);
    }
  };
  if (extra) Object.keys(extra).forEach(function (k) { opts[k] = extra[k]; });
  return html2canvas(el, opts);
}

async function deckCaptureCurrentInner(scale){
  const inner = document.querySelector('#slideHtmlCanvas .slideCanvasInner');
  if (!inner) throw new Error('No slide to export');
  if (typeof html2canvas !== 'function') throw new Error('PDF library missing');
  const tip = document.getElementById('donutTip');
  if (tip) tip.style.display = 'none';
  if (typeof snapCountUp === 'function') {
    snapCountUp(Array.from(document.querySelectorAll('#slideHtmlCanvas [data-count-to]')));
  }
  deckCleanupClones();

  const host = document.createElement('div');
  host.className = 'deckExportHost';
  host.setAttribute('aria-hidden', 'true');
  const clone = inner.cloneNode(true);
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
  deckCopyLiveIntoClone(inner, clone);
  host.appendChild(clone);
  document.body.appendChild(host);
  await deckWait(120);

  const first = scale == null ? 1 : scale;
  async function run(s, extra){
    const canvas = await deckHtml2Canvas(clone, s, extra);
    if (deckCanvasLooksBlank(canvas)) throw new Error('blank capture');
    return canvas;
  }
  try {
    try {
      return await run(first);
    } catch (err) {
      console.warn('export retry', err);
      await deckWait(160);
      return await run(0.55);
    }
  } finally {
    host.remove();
    deckCleanupClones();
  }
}

async function deckShowSlideQuiet(n){
  showSlide(n);
  await deckWait(700);
}

function deckSave(pdf, name){
  try {
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      a.remove();
      URL.revokeObjectURL(url);
    }, 2500);
  } catch (err) {
    pdf.save(name);
  }
}

async function exportCurrentSlidePdf(){
  if (deckExporting) return;
  closeOptionsMenu();
  closeDrawer();
  closeModal();
  deckExporting = true;
  document.body.classList.add('deck-exporting');
  deckShowOverlay(true);
  const n = slide;
  const title = (CFG.titles[n - 1] || ('Slide ' + n));
  deckSetProgress('Exporting this page…');
  try {
    const pdf = deckNewPdf();
    const canvas = await deckCaptureCurrentInner(1.15);
    deckAddPage(pdf, canvas, true);
    deckSave(pdf, 'PSERS-' + String(n).padStart(2, '0') + '-' + deckFileSafe(title) + '.pdf');
  } catch (err) {
    console.error(err);
    deckSetProgress('Export failed. Try again.');
    await deckWait(1600);
  } finally {
    deckCleanupClones();
    document.body.classList.remove('deck-exporting');
    deckShowOverlay(false);
    deckExporting = false;
  }
}

async function exportAllSlidesPdf(){
  if (deckExporting) return;
  closeOptionsMenu();
  closeDrawer();
  closeModal();
  deckExporting = true;
  document.body.classList.add('deck-exporting');
  deckShowOverlay(true);
  const start = slide;
  const total = CFG.titles.length;
  deckMarkAnimsDone();
  try {
    const pdf = deckNewPdf();
    for (let i = 1; i <= total; i++) {
      deckSetProgress('Exporting ' + i + ' of ' + total + '…');
      await deckShowSlideQuiet(i);
      try {
        const canvas = await deckCaptureCurrentInner(1);
        deckAddPage(pdf, canvas, i === 1);
      } catch (err) {
        console.error('export slide ' + i, err);
        await deckWait(400);
        try {
          const canvas = await deckCaptureCurrentInner(0.5);
          deckAddPage(pdf, canvas, i === 1);
        } catch (err2) {
          console.error('export slide skip ' + i, err2);
          deckBlankPage(pdf, i === 1);
        }
      }
      await deckWait(280);
    }
    deckSetProgress('Saving PDF…');
    deckSave(pdf, 'PSERS-presentation.pdf');
  } catch (err) {
    console.error(err);
    deckSetProgress('Export failed. Try again.');
    await deckWait(1600);
  } finally {
    deckCleanupClones();
    await deckShowSlideQuiet(start);
    document.body.classList.remove('deck-exporting');
    deckShowOverlay(false);
    deckExporting = false;
  }
}
