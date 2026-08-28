# PSERS Interactive Presentation

Open `index.html` in a browser. No build. Works offline (`file://`).

## Source of truth

**Excel only:** `source-data/PSERS_Total Private Market Portfolio_Final.xlsx`

After any Excel edit:

```
python3 tools/export.py
```

That writes `CFG.rows` in `js/data.js`. Every number slide then reads `CFG.rows`.

Do not add another numbers file.

## Present

- Arrow keys or the bottom dots
- Menu → Export current, Export all, Fullscreen
- Cover TOC jumps to a slide
- Charts and tables open the side drawer
- Holdings: search, filter, PDF

## Folders

| Path | What |
|---|---|
| `index.html` | Shell + script order |
| `js/pages/` | One file per slide |
| `js/slide-data/` | Colors, copy, live compute helpers — **not** a second numbers file |
| `js/data.js` | Deck titles + `CFG.rows` (from Excel) |
| `js/app.js` | Nav, drawers, modal |
| `css/styles.css` | All styling |
| `js/vendor/` | ApexCharts, html2canvas, jsPDF (local) |
| `js/export-deck.js` | Menu PDF export (current page / all pages) |
| `assets/` | Fonts + About logos |
| `source-data/` | The Excel workbook |
| `tools/` | `python3 tools/export.py` |
| `cursor.md` | Build log |
