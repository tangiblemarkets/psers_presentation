// renderPortfolioHoldingsSlide() — slide 11 ("Portfolio Holdings"),
// inserted right before the Contact section per the user's original
// request (screenshot of a full data table: FUND / STRATEGY / COMMITMENT /
// CALLED / DISTRIBUTED / NAV / TOTAL VALUE / DPI / RVPI / TVPI, plus a
// "Total" row). NOTE: this slide's own position has shifted several times
// since it was first built — when "Discussion Points" was inserted before
// Next Steps, again when "Basis of Preparation" was inserted right after
// Next Steps, and again this round (now slide 11) when "Market Sentiment
// by Strategy and Vintage" was inserted before Discussion Points. See
// README.md's changelog (Rounds 35-41) for the full history, including
// the Cursor-side follow-ups (more rows added, sticky header/total row
// fixes) made after this slide was first built.
//
// Chrome (logo/year/footer/title/subtitle) built the same way as every
// other real-HTML slide (compare 05-routes-to-liquidity.js) from the
// freshly-exported figma-export/slide.json (root id 49:4027). Two chrome
// notes specific to this slide:
//   - There's a second, wider "chrome-footer"-named text node beyond the
//     usual "Confidential" one — a data/methodology footnote unique to
//     this slide ("All figures in US$ millions, converted at 31 March
//     2026 spot rates..."). Rendered as its own element right after the
//     usual footer text, same row.
//   - chrome-page is forced to this slide's real deck position (now "15"
//     as of Round 58 — see README.md's changelog for the full
//     renumbering history rather than trusting this comment on its own),
//     not whatever arbitrary number the raw Figma export happens to
//     carry.
//
// The table itself is a REAL <table> (not absolutely-positioned divs like
// the rest of this deck's fig-* conversions) — the user explicitly asked
// for a working, sortable, scrollable table, which a pile of positioned
// divs can't do cleanly. Column widths below reproduce the Figma export's
// pixel grid exactly (see PORTFOLIO_HOLDINGS_DATA in
// js/slide-data/12-portfolio-holdings.data.js for why the row data itself
// lives in its own file rather than reusing CFG.rows, and for the one
// deliberate correction made to the export's "Total" row).
//
// No default sort — rows stay in file order until a header is clicked.
// bindPortfolioHoldingsSort() (the afterRender hook, wired in
// js/app.js's HTML_SLIDES) re-renders just the <tbody> so the
// header/total row/chrome never re-render on a re-sort.

const HOLD_COLS = [
  {key:'fund',        label:'FUND',         type:'str', align:'left',  width:414},
  {key:'strategy',     label:'STRATEGY',     type:'str', align:'left',  width:170},
  {key:'commitment',   label:'COMMITMENT',   type:'num', align:'right', width:150},
  {key:'called',       label:'CALLED',       type:'num', align:'right', width:150},
  {key:'distributed',  label:'DISTRIBUTED',  type:'num', align:'right', width:150},
  {key:'nav',          label:'NAV',          type:'num', align:'right', width:150},
  {key:'totalValue',   label:'TOTAL VALUE',  type:'num', align:'right', width:150},
  {key:'dpi',          label:'DPI',          type:'num', align:'right', width:150},
  {key:'rvpi',         label:'RVPI',         type:'num', align:'right', width:150},
  {key:'tvpi',         label:'TVPI',         type:'num', align:'right', width:150}
];

// Green cols (dpi/rvpi/tvpi) get the accent text color per the Figma
// export; every other data column is near-black.
const HOLD_GREEN_COLS = new Set(['dpi', 'rvpi', 'tvpi']);

let holdSortKey = null;
let holdSortDir = null;
let holdSearchQ = '';

const HOLD_FILTER_NUMS = [
  {key:'commitment',  label:'Commitment',   hint:'US$ millions', phA:'e.g. 100', phB:'e.g. 400'},
  {key:'called',      label:'Called',       hint:'US$ millions', phA:'e.g. 100', phB:'e.g. 400'},
  {key:'distributed', label:'Distributed',  hint:'US$ millions', phA:'e.g. 50',  phB:'e.g. 300'},
  {key:'nav',         label:'NAV',          hint:'US$ millions', phA:'e.g. 100', phB:'e.g. 300'},
  {key:'totalValue',  label:'Total value',  hint:'US$ millions', phA:'e.g. 150', phB:'e.g. 500'},
  {key:'dpi',         label:'DPI',          hint:'Multiple',     phA:'e.g. 0.5', phB:'e.g. 1.2'},
  {key:'rvpi',        label:'RVPI',         hint:'Multiple',     phA:'e.g. 0.8', phB:'e.g. 1.5'},
  {key:'tvpi',        label:'TVPI',         hint:'Multiple',     phA:'e.g. 1.0', phB:'e.g. 2.0'}
];

function holdEmptyNums(){
  const nums = {};
  HOLD_FILTER_NUMS.forEach(c => { nums[c.key] = {op:'', a:'', b:''}; });
  return nums;
}

function holdEmptyFilters(){
  return { strategies: [], nums: holdEmptyNums() };
}

let holdFilters = holdEmptyFilters();

function holdFiltId(key, part){
  return 'holdFilt-' + key + '-' + part;
}

function holdNumState(key){
  return holdFilters.nums[key] || (holdFilters.nums[key] = {op:'', a:'', b:''});
}

function holdNumFromCell(v){
  if (v == null || v === '') return -Infinity;
  const n = parseFloat(String(v).replace(/x$/i, ''));
  return isFinite(n) ? n : -Infinity;
}

function holdCellValue(col, row){
  const raw = row[col.key];
  return col.type === 'num' ? holdNumFromCell(raw) : String(raw || '');
}

function holdParseAmt(v){
  if (v == null || v === '') return 0;
  const n = parseFloat(String(v).replace(/x$/i, '').replace(/,/g, ''));
  return isFinite(n) ? n : 0;
}

function holdFmtAmt(n){
  return (Math.round(n * 100) / 100).toFixed(2);
}

function holdStrategyLabel(r){
  const s = r.slideStrategy || r.strategy || '';
  if (s === 'Real Estate' || s === 'Infrastructure') return 'Real Estate & Infra';
  return s;
}

function holdX(n){
  return (Math.round(n * 100) / 100).toFixed(2) + 'x';
}

function holdFromSrc(r, i){
  return {
    _i: i,
    fund: r.investment,
    strategy: holdStrategyLabel(r),
    commitment: holdFmtAmt((r.commitment || 0) / 1e6),
    called: holdFmtAmt((r.paid || 0) / 1e6),
    distributed: holdFmtAmt((r.dist || 0) / 1e6),
    nav: holdFmtAmt((r.nav || 0) / 1e6),
    totalValue: holdFmtAmt((r.total_value || 0) / 1e6),
    dpi: holdX(r.dpi || 0),
    rvpi: holdX(r.rvpi || 0),
    tvpi: holdX(r.tvpi || 0)
  };
}

function holdAllRows(){
  return CFG.rows.map((r, i) => holdFromSrc(r, i)).sort((a, b) => holdParseAmt(b.nav) - holdParseAmt(a.nav));
}

function holdStrategyOptions(){
  const set = {};
  holdAllRows().forEach(r => { if (r.strategy) set[r.strategy] = 1; });
  return Object.keys(set).sort();
}

function holdNumFilterOn(op, a, b){
  if (!op) return false;
  if (op === 'between') return a !== '' && b !== '' && a != null && b != null;
  return a !== '' && a != null;
}

function holdHasFilters(){
  if (holdFilters.strategies.length) return true;
  return HOLD_FILTER_NUMS.some(c => {
    const n = holdNumState(c.key);
    return holdNumFilterOn(n.op, n.a, n.b);
  });
}

function holdMatchNum(val, op, a, b){
  if (!holdNumFilterOn(op, a, b)) return true;
  const n = holdParseAmt(val);
  const x = Number(a);
  if (!isFinite(x)) return true;
  if (op === 'gt') return n > x;
  if (op === 'lt') return n < x;
  if (op === 'between') {
    const y = Number(b);
    if (!isFinite(y)) return true;
    const lo = Math.min(x, y), hi = Math.max(x, y);
    return n >= lo && n <= hi;
  }
  return true;
}

function holdVisibleRows(){
  const q = holdSearchQ.trim().toLowerCase();
  const f = holdFilters;
  let rows = holdAllRows();
  if (q) {
    rows = rows.filter(r =>
      String(r.fund || '').toLowerCase().includes(q) ||
      String(r.strategy || '').toLowerCase().includes(q)
    );
  }
  if (f.strategies.length) {
    rows = rows.filter(r => f.strategies.indexOf(r.strategy) !== -1);
  }
  HOLD_FILTER_NUMS.forEach(c => {
    const n = holdNumState(c.key);
    rows = rows.filter(r => holdMatchNum(r[c.key], n.op, n.a, n.b));
  });
  const col = HOLD_COLS.find(c => c.key === holdSortKey);
  if (!col) return rows;
  const dir = holdSortDir === 'asc' ? 1 : -1;
  return rows.sort((a, b) => {
    const av = holdCellValue(col, a), bv = holdCellValue(col, b);
    return col.type === 'num' ? (av - bv) * dir : String(av).localeCompare(String(bv), undefined, {sensitivity:'base'}) * dir;
  });
}

function holdTotalFromRows(rows){
  const commitment = rows.reduce((s, r) => s + holdParseAmt(r.commitment), 0);
  const called = rows.reduce((s, r) => s + holdParseAmt(r.called), 0);
  const distributed = rows.reduce((s, r) => s + holdParseAmt(r.distributed), 0);
  const nav = rows.reduce((s, r) => s + holdParseAmt(r.nav), 0);
  const totalValue = rows.reduce((s, r) => s + holdParseAmt(r.totalValue), 0);
  return {
    label: 'Grand total (' + rows.length + ' funds)',
    commitment: holdFmtAmt(commitment),
    called: holdFmtAmt(called),
    distributed: holdFmtAmt(distributed),
    nav: holdFmtAmt(nav),
    totalValue: holdFmtAmt(totalValue),
    dpi: called ? (distributed / called).toFixed(2) + 'x' : '',
    rvpi: called ? (nav / called).toFixed(2) + 'x' : '',
    tvpi: called ? (totalValue / called).toFixed(2) + 'x' : ''
  };
}

function holdRowHtml(row){
  return `<tr class="holdFundRow" data-hold-i="${row._i}">${HOLD_COLS.map(col => {
    const v = row[col.key] == null ? '' : row[col.key];
    const cls = HOLD_GREEN_COLS.has(col.key) ? ' class="hold-green"' : '';
    return `<td style="text-align:${col.align};"${cls}>${v === '' ? '' : String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</td>`;
  }).join('')}</tr>`;
}

function holdRenderTbody(){
  const rows = holdVisibleRows();
  if (!rows.length) {
    return '<tr class="holdEmpty"><td colspan="' + HOLD_COLS.length + '">No funds match this search or filter</td></tr>';
  }
  return rows.map(holdRowHtml).join('');
}

function holdTotalCellsHtml(){
  const rows = holdVisibleRows();
  const tot = holdTotalFromRows(rows);
  return HOLD_COLS.map(col => {
    let v;
    if (col.key === 'fund') v = tot.label || ('Grand total (' + rows.length + ' funds)');
    else if (col.key === 'strategy') v = '';
    else v = tot[col.key] || '';
    const cls = HOLD_GREEN_COLS.has(col.key) ? ' class="hold-green"' : '';
    return `<td style="text-align:${col.align};"${cls}>${v}</td>`;
  }).join('');
}

function holdM(formatted){
  const n = holdParseAmt(formatted);
  return '$' + n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + 'M';
}

function holdDetailRow(label, value){
  return '<div class="dataRow"><div class="name">' + label + '</div><div class="val">' + value + '</div></div>';
}

function openHoldFund(i){
  const src = CFG.rows[i];
  if (!src) return;
  const row = holdFromSrc(src, i);
  const unfunded = holdFmtAmt((src.unfunded || 0) / 1e6);
  const body =
    '<div class="lensKpis lensKpis-4 holdFundKpis">' +
      '<div class="lensKpi"><div class="v">' + holdM(row.nav) + '</div><div class="l">NAV</div></div>' +
      '<div class="lensKpi"><div class="v">' + row.dpi + '</div><div class="l">DPI</div></div>' +
      '<div class="lensKpi"><div class="v">' + row.tvpi + '</div><div class="l">TVPI</div></div>' +
      '<div class="lensKpi"><div class="v">' + row.rvpi + '</div><div class="l">RVPI</div></div>' +
    '</div>' +
    '<div class="section">' +
      holdDetailRow('Strategy', esc(row.strategy)) +
      holdDetailRow('Manager', esc(src.manager || '')) +
      holdDetailRow('Vintage', esc(String(src.vintage || ''))) +
      holdDetailRow('Vehicle', esc(src.vehicle || '')) +
      holdDetailRow('Commitment', holdM(row.commitment)) +
      holdDetailRow('Called', holdM(row.called)) +
      holdDetailRow('Distributed', holdM(row.distributed)) +
      holdDetailRow('Total value', holdM(row.totalValue)) +
      holdDetailRow('Unfunded', holdM(unfunded)) +
    '</div>';
  openDrawer(row.fund, row.strategy + (src.vintage ? ' · ' + src.vintage : ''), body);
}

function holdBindRows(){
  const tbody = document.querySelector('#holdTable tbody');
  if (!tbody || tbody.dataset.holdClick) return;
  tbody.dataset.holdClick = '1';
  tbody.addEventListener('click', e => {
    const tr = e.target.closest('tr[data-hold-i]');
    if (!tr) return;
    openHoldFund(Number(tr.getAttribute('data-hold-i')));
  });
}

function holdRefresh(){
  const tbody = document.querySelector('#holdTable tbody');
  const foot = document.getElementById('holdFootRow');
  if (tbody) tbody.innerHTML = holdRenderTbody();
  if (foot) foot.innerHTML = holdTotalCellsHtml();
  holdRenderHeadArrows();
  holdSyncFilterBtn();
  holdBindRows();
}

function holdFilterCount(){
  let n = holdFilters.strategies.length ? 1 : 0;
  HOLD_FILTER_NUMS.forEach(c => {
    const s = holdNumState(c.key);
    if (holdNumFilterOn(s.op, s.a, s.b)) n += 1;
  });
  return n;
}

function holdSyncFilterBtn(){
  const btn = document.getElementById('holdFilter');
  const badge = document.getElementById('holdFilterBadge');
  if (!btn) return;
  const n = holdFilterCount();
  btn.classList.toggle('is-on', n > 0);
  if (badge) {
    badge.hidden = n === 0;
    badge.textContent = String(n);
  }
}

function holdReadDrawer(){
  holdFilters.strategies = Array.from(document.querySelectorAll('.holdFiltChip.is-on')).map(el => el.getAttribute('data-strategy'));
  HOLD_FILTER_NUMS.forEach(c => {
    const op = document.getElementById(holdFiltId(c.key, 'op'));
    const a = document.getElementById(holdFiltId(c.key, 'a'));
    const b = document.getElementById(holdFiltId(c.key, 'b'));
    const n = holdNumState(c.key);
    n.op = op ? op.value : '';
    n.a = a ? a.value.trim() : '';
    n.b = b ? b.value.trim() : '';
  });
}

function holdSyncNumFields(key){
  const op = document.getElementById(holdFiltId(key, 'op'));
  const aWrap = document.getElementById(holdFiltId(key, 'aWrap'));
  const bWrap = document.getElementById(holdFiltId(key, 'bWrap'));
  const v = op ? op.value : '';
  if (aWrap) aWrap.hidden = !v;
  if (bWrap) bWrap.hidden = v !== 'between';
}

function holdApplyDrawer(){
  holdReadDrawer();
  HOLD_FILTER_NUMS.forEach(c => holdSyncNumFields(c.key));
  holdRefresh();
  const sub = document.getElementById('drawerSub');
  if (sub) sub.textContent = holdVisibleRows().length + ' of ' + holdRowCount() + ' funds';
}

function holdClearFilters(){
  holdFilters = holdEmptyFilters();
  openHoldFilterDrawer();
  holdRefresh();
}

function holdNumRow(spec){
  const n = holdNumState(spec.key);
  const op = n.op, a = n.a, b = n.b;
  return '<div class="holdFiltBlock">' +
    '<div class="holdFiltLabel">' + spec.label + '</div>' +
    '<div class="holdFiltHint">' + spec.hint + '</div>' +
    '<div class="holdFiltRow">' +
      '<select id="' + holdFiltId(spec.key, 'op') + '" class="holdFiltSelect">' +
        '<option value=""' + (op ? '' : ' selected') + '>All</option>' +
        '<option value="gt"' + (op === 'gt' ? ' selected' : '') + '>Greater than</option>' +
        '<option value="lt"' + (op === 'lt' ? ' selected' : '') + '>Less than</option>' +
        '<option value="between"' + (op === 'between' ? ' selected' : '') + '>Between</option>' +
      '</select>' +
      '<span id="' + holdFiltId(spec.key, 'aWrap') + '" class="holdFiltA"' + (op ? '' : ' hidden') + '>' +
        '<input id="' + holdFiltId(spec.key, 'a') + '" class="holdFiltInput" type="number" step="any" inputmode="decimal" value="' + String(a || '').replace(/"/g, '') + '" placeholder="' + spec.phA + '">' +
      '</span>' +
      '<span id="' + holdFiltId(spec.key, 'bWrap') + '" class="holdFiltB"' + (op === 'between' ? '' : ' hidden') + '>' +
        '<span class="holdFiltAnd">and</span>' +
        '<input id="' + holdFiltId(spec.key, 'b') + '" class="holdFiltInput" type="number" step="any" inputmode="decimal" value="' + String(b || '').replace(/"/g, '') + '" placeholder="' + spec.phB + '">' +
      '</span>' +
    '</div>' +
  '</div>';
}

function openHoldFilterDrawer(){
  const chips = holdStrategyOptions().map(s =>
    '<button type="button" class="holdFiltChip' + (holdFilters.strategies.indexOf(s) !== -1 ? ' is-on' : '') + '" data-strategy="' + s.replace(/"/g, '') + '">' + s + '</button>'
  ).join('');
  const body =
    '<div class="holdFilt">' +
      '<div class="holdFiltBlock">' +
        '<div class="holdFiltLabel">Strategy</div>' +
        '<div class="holdFiltHint">Pick one or more. Empty means all.</div>' +
        '<div class="holdFiltChips">' + chips + '</div>' +
      '</div>' +
      HOLD_FILTER_NUMS.map(holdNumRow).join('') +
      '<div class="holdFiltActions">' +
        '<button type="button" class="holdFiltClear" id="holdFiltClear">Clear all</button>' +
      '</div>' +
    '</div>';
  openDrawer('Filter holdings', holdVisibleRows().length + ' of ' + holdRowCount() + ' funds', body);
  document.querySelectorAll('.holdFiltChip').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('is-on');
      holdApplyDrawer();
    });
  });
  document.querySelectorAll('.holdFiltSelect').forEach(el => el.addEventListener('change', holdApplyDrawer));
  document.querySelectorAll('.holdFiltInput').forEach(el => el.addEventListener('input', holdApplyDrawer));
  const clear = document.getElementById('holdFiltClear');
  if (clear) clear.addEventListener('click', holdClearFilters);
}

function holdOpLabel(op, a, b){
  if (op === 'gt') return '> ' + a;
  if (op === 'lt') return '< ' + a;
  if (op === 'between') return a + '–' + (b || '…');
  return String(a);
}

function holdFilterNote(){
  const parts = [];
  if (holdFilters.strategies.length) parts.push(holdFilters.strategies.join(', '));
  HOLD_FILTER_NUMS.forEach(c => {
    const n = holdNumState(c.key);
    if (holdNumFilterOn(n.op, n.a, n.b)) parts.push(c.label + ' ' + holdOpLabel(n.op, n.a, n.b));
  });
  return parts.length ? 'Filter: ' + parts.join(' · ') : '';
}

function holdExportPdf(){
  const rows = holdVisibleRows();
  const q = holdSearchQ.trim();
  const col = holdSortKey && HOLD_COLS.find(c => c.key === holdSortKey);
  const pdfCols = HOLD_COLS.map(c => ({
    label: c.label,
    align: c.align === 'right' ? 'num' : '',
    render: d => {
      const v = d[c.key];
      return v == null || v === '' ? '' : String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }
  }));
  const notes = [q ? t('table.searchNote', { q: q }) : '', holdFilterNote()].filter(Boolean).join(' · ');
  exportTablePdf({
    title: 'Portfolio Holdings',
    sub: 'All fund interests included in the analysis. Figures in US$ millions as at an assumed reference date of Q1 2026.',
    cols: pdfCols,
    rows: rows,
    searchNote: notes,
    sortNote: col && holdSortDir ? sortLabel({ label: col.label, type: col.type }, holdSortDir) : '',
    totalHtml: holdTotalCellsHtml()
  });
}

function holdRenderHeadArrows(){
  const head = document.getElementById('holdHeadTable');
  if (!head) return;
  head.querySelectorAll('th[data-key]').forEach(th => {
    const isSorted = th.getAttribute('data-key') === holdSortKey;
    th.classList.toggle('is-sorted', isSorted);
    th.classList.toggle('dir-asc', isSorted && holdSortDir === 'asc');
    th.classList.toggle('dir-desc', isSorted && holdSortDir === 'desc');
  });
}

function bindPortfolioHoldingsSort(){
  const head = document.getElementById('holdHeadTable');
  if (head && !head.dataset.boundSort) {
    head.dataset.boundSort = '1';
    holdRenderHeadArrows();
    head.querySelectorAll('th[data-key]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.getAttribute('data-key');
        const col = HOLD_COLS.find(c => c.key === key);
        if (key === holdSortKey) {
          holdSortDir = holdSortDir === 'asc' ? 'desc' : 'asc';
        } else {
          holdSortKey = key;
          holdSortDir = col.type === 'num' ? 'desc' : 'asc';
        }
        holdRefresh();
      });
    });
  }
  const search = document.getElementById('holdSearch');
  if (search && !search.dataset.bound) {
    search.dataset.bound = '1';
    search.value = holdSearchQ;
    search.addEventListener('input', () => {
      holdSearchQ = search.value;
      holdRefresh();
    });
  }
  const exp = document.getElementById('holdExport');
  if (exp && !exp.dataset.bound) {
    exp.dataset.bound = '1';
    exp.addEventListener('click', holdExportPdf);
  }
  const filt = document.getElementById('holdFilter');
  if (filt && !filt.dataset.bound) {
    filt.dataset.bound = '1';
    filt.addEventListener('click', openHoldFilterDrawer);
  }
  holdSyncFilterBtn();
  holdBindRows();
}

function holdRowCount(){
  return CFG.rows.length;
}

function holdFootnote(){
  return 'All figures in US$ millions, converted at 31 March 2026 spot rates. Analysis covers the ' + holdRowCount() + ' included positions.';
}

function renderPortfolioHoldingsSlide(){
  const headHtml = HOLD_COLS.map(col =>
    `<th data-key="${col.key}" style="width:${col.width}px;text-align:${col.align};">${col.label}<span class="hold-arrow" aria-hidden="true"></span></th>`
  ).join('');

  const searchPh = (typeof t === 'function') ? t('table.holdSearchPlaceholder') : 'Search funds or strategy…';

  return `<div class="fig-slide" style="position:relative;width:1920px;height:1080px;background:#ffffff;overflow:hidden;">
  <div class="fig-box" data-fig-name="chrome-logo-box" style="position:absolute;left:1675.00px;top:58.00px;width:177.00px;height:44.00px;border:1px solid #0f0f0f;box-sizing:border-box;"></div>
  <div class="fig-text" data-fig-name="chrome-logo" style="position:absolute;left:1677.00px;top:69.00px;width:177.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:5.00px;color:#0f0f0f;text-align:center;white-space:pre;">TANGIBLE</div>
  <div class="fig-text" data-fig-name="chrome-year" style="position:absolute;left:68.00px;top:64.00px;width:49.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#787878;text-align:left;white-space:pre;">2026</div>
  <div class="fig-text" data-fig-name="chrome-footer" style="position:absolute;left:68.00px;top:982.00px;width:112.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:left;white-space:pre;">Confidential</div>
  <div class="fig-text" data-fig-name="chrome-footer-note" style="position:absolute;left:219.00px;top:984.00px;width:1052.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:14.00px;line-height:17.64px;letter-spacing:0.00px;color:#a0a0a0;text-align:left;white-space:pre;">${holdFootnote()}</div>
  <div class="fig-text" data-fig-name="chrome-page" style="position:absolute;left:1674.00px;top:982.00px;width:178.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#96ac9e;text-align:right;white-space:pre;">13</div>
  <div class="fig-text" data-fig-name="title" style="position:absolute;left:68.00px;top:136.00px;width:980.00px;height:71.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-style:normal;font-size:56.00px;line-height:70.56px;letter-spacing:0.00px;color:#104130;text-align:left;white-space:pre;">Portfolio Holdings</div>
  <div class="holdTools">
    <label class="holdSearch">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16.2 16.2L21 21"/></svg>
      <input id="holdSearch" type="search" placeholder="${searchPh.replace(/"/g, '&quot;')}" autocomplete="off" spellcheck="false">
    </label>
    <button id="holdFilter" class="holdFilter" type="button" title="Filter the table" aria-label="Filter the table">
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
      <span>Filter</span>
      <span id="holdFilterBadge" class="holdFilterBadge" hidden>0</span>
    </button>
    <button id="holdExport" class="holdExport" type="button" title="Export the current table as PDF" aria-label="Export the current table as PDF">
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 4v10"/><path d="M8 10l4 4 4-4"/><path d="M5 18h14"/></svg>
      <span>PDF</span>
    </button>
  </div>
  <div class="fig-text" data-fig-name="tldr-0" style="position:absolute;left:68.00px;top:222.00px;width:1400.00px;height:24.00px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-style:normal;font-size:19.00px;line-height:23.94px;letter-spacing:0.00px;color:#808582;text-align:left;white-space:pre;">All fund interests included in the analysis. Figures in US$ millions as at an assumed reference date of Q1 2026.</div>
  <div class="holdWrap" style="position:absolute;left:68.00px;top:282.00px;width:1784.00px;">
    <div class="holdHead">
      <table class="holdTable" id="holdHeadTable">
        <colgroup>${HOLD_COLS.map(c => `<col style="width:${c.width}px;">`).join('')}</colgroup>
        <thead><tr>${headHtml}</tr></thead>
      </table>
    </div>
    <div class="holdScrollBody">
      <table class="holdTable" id="holdTable">
        <colgroup>${HOLD_COLS.map(c => `<col style="width:${c.width}px;">`).join('')}</colgroup>
        <tbody>${holdRenderTbody()}</tbody>
      </table>
    </div>
    <div class="holdFoot">
      <table class="holdTable">
        <colgroup>${HOLD_COLS.map(c => `<col style="width:${c.width}px;">`).join('')}</colgroup>
        <tbody><tr class="holdTotalRow" id="holdFootRow">${holdTotalCellsHtml()}</tr></tbody>
      </table>
    </div>
  </div>
</div>`;
}
