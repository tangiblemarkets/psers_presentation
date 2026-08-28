// Visual PDF of the live slides (sorts, filters, dropdowns included).
// html2canvas + jsPDF are vendored; this file:// deck stays offline.

var deckExporting = false;

function deckWait(ms){
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function deckJsPdf(){
  return (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
}

function deckMarkAnimsDone(){
  const flags = ['strategyMixPlayed','mcPlayed','sddPlayed','marketSentimentPlayed','rtlPlayed','discPlayed','nsPlayed','bopPlayed','dlPlayed'];
  flags.forEach(function (name) { if (typeof window[name] === 'boolean') window[name] = true; });
  // Classic-script `let` flags are not on window — set the known locals.
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

function deckAddPage(pdf, canvas, first){
  const img = canvas.toDataURL('image/jpeg', 0.9);
  if (!first) pdf.addPage([1920, 1080], 'landscape');
  pdf.addImage(img, 'JPEG', 0, 0, 1920, 1080, undefined, 'FAST');
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

  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  // Keep the clone on-screen. Windows Chrome often skips paint for
  // nodes parked far off-canvas (left:-12000px), so export-all failed there.
  host.style.cssText = 'position:fixed;left:0;top:0;width:1920px;height:1080px;overflow:hidden;background:#fff;z-index:90;pointer-events:none;';
  const clone = inner.cloneNode(true);
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
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
  clone.querySelectorAll('.fig-hotspot, .apexcharts-tooltip').forEach(function (el) { el.remove(); });
  host.appendChild(clone);
  document.body.appendChild(host);
  await deckWait(80);

  try {
    return await html2canvas(clone, {
      width: 1920,
      height: 1080,
      windowWidth: 1920,
      windowHeight: 1080,
      scale: scale || 1.15,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 8000,
      removeContainer: true
    });
  } finally {
    host.remove();
  }
}

async function deckShowSlideQuiet(n){
  showSlide(n);
  await deckWait(520);
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
    const canvas = await deckCaptureCurrentInner();
    deckAddPage(pdf, canvas, true);
    deckSave(pdf, 'PSERS-' + String(n).padStart(2, '0') + '-' + deckFileSafe(title) + '.pdf');
  } catch (err) {
    console.error(err);
    deckSetProgress('Export failed. Try again.');
    await deckWait(1600);
  } finally {
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
      const canvas = await deckCaptureCurrentInner(1);
      deckAddPage(pdf, canvas, i === 1);
      await deckWait(120);
    }
    deckSave(pdf, 'PSERS-presentation.pdf');
  } catch (err) {
    console.error(err);
    deckSetProgress('Export failed. Try again.');
    await deckWait(1600);
  } finally {
    await deckShowSlideQuiet(start);
    document.body.classList.remove('deck-exporting');
    deckShowOverlay(false);
    deckExporting = false;
  }
}
