# Cursor change log

Living log of changes made in Cursor. Newest first.

## 2026-08-28 — Market Sentiment two pick buttons

- Removed the title gear.
- Strategy and vintage are two gray pills with the popup icon.
- Both open the same choose-view drawer.

**Files:** `js/pages/09-market-sentiment.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Deep Dive strategy button

- Title strategy name is a `#f5f5f5` pill button with a popup icon.
- Click still opens the choose-strategy drawer.

**Files:** `js/pages/10-strategy-deep-dive.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Windows drawer sort + Export all

- Replaced the native sort `<select>` with a dark custom menu (Windows paints native lists white).
- Export all no longer parks the clone at `left:-12000px` (Windows Chrome often skips that paint).
- PDF save uses a blob download first.

**Files:** `js/app.js`, `css/styles.css`, `js/export-deck.js`, `README.md`.

## 2026-08-28 — Drop Liquidity Options

- Removed the Liquidity Options divider (old footer 09).
- Cover TOC and chrome page numbers after it each dropped by one.
- Deck is 16 slides (00–15).

**Files:** `js/app.js`, `js/data.js`, `js/pages/01-cover.js`, `index.html`, later page chrome numbers, deleted `js/pages/11-liquidity-options-divider.js`, `README.md`.

## 2026-08-28 — Market Sentiment hardcoded

- Stopped computing this slide from Excel.
- 19 strategy + vintage combos copied from the source slides.
- Settings drawer only lists combos we have.

**Files:** `js/slide-data/09-market-sentiment.data.js`, `js/pages/09-market-sentiment.js`, `README.md`.

## 2026-08-28 — Routes subtitle type

- Slide 03 subtitle matches Deep Dive (footer 08): 19px, regular, `#808582`.

**Files:** `js/pages/05-routes-to-liquidity.js`, `README.md`.

## 2026-08-28 — DPI segment GP click

- Click a GP-count header (`16 GPs`, etc.), the % line, or the band label to open that DPI group in the side drawer.
- Dots still open one manager.

**Files:** `js/pages/08-manager-concentration.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Keep every Excel row

- Removed the Polaris drop from Manager Concentration and Strategy Deep Dive.
- Slide + drawer now use all `CFG.rows` (363 interests, full NAV).
- Footnote no longer says a manager was left out.

**Files:** `js/slide-data/08-manager-concentration.data.js`, `js/pages/08-manager-concentration.js`, `js/slide-data/10-strategy-deep-dive.data.js`, `README.md`.

## 2026-08-28 — Market Sentiment subtitle type

- Subtitle (`Private Credit, 2022+`) is `#787878`, 40px, semibold (600).

**Files:** `js/pages/09-market-sentiment.js`, `README.md`.

## 2026-08-28 — Market Sentiment settings picker

- Removed the Strategy / Vintage dropdowns.
- Title is two lines: green title + grey `Strategy, Vintage` subtitle.
- Settings icon (same as Deep Dive) opens a drawer to pick both.
- Drawer stays open so you can pick strategy and vintage.
- Slide still updates live.

**Files:** `js/pages/09-market-sentiment.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Deep Dive settings polish

- Settings icon has no box/border and sits on the title line.
- Drawer list has no line above the first strategy.

**Files:** `js/pages/10-strategy-deep-dive.js`, `css/styles.css`.

## 2026-08-28 — Deep Dive settings picker

- Removed the Strategy dropdown from the title.
- A settings icon opens the side drawer to pick a strategy.
- The slide still updates live (title, table, vintage, notes).

**Files:** `js/pages/10-strategy-deep-dive.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Export current / Export all

- Menu has **Export current** (this page) and **Export all** (every page).
- PDF is a picture of the live slides, so sorts, filters, and dropdowns stay.
- Export all then returns to the page you were on.

**Files:** `js/export-deck.js`, `js/vendor/html2canvas.min.js`, `js/vendor/jspdf.umd.min.js`, `index.html`, `js/app.js`, `css/styles.css`, `js/i18n/en.js`, `README.md`.

## 2026-08-28 — Strategy Mix Total = Portfolio source data

- Total NAV and the strategy table title open the same **Portfolio source data** drawer as the right-side click.
- Strategy rows still open that strategy.

**Files:** `js/pages/07-strategy-mix.js`, `js/app.js`, `README.md`.

## 2026-08-28 — Manager Concentration Remaining / Total / legend

- Remaining and Total rows open the side drawer, grouped by manager.
- The 6 numbered legend points open that manager’s fund list.
- Named table rows and bubbles still open that one manager.

**Files:** `js/pages/08-manager-concentration.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Deep Dive Remaining / Total open drawer

- Remaining managers and Total rows on Strategy Deep Dive open the side drawer.
- Grouped by manager (same as the strategy lens). Remaining = funds not in the top 5.
- Named manager rows still open that manager’s fund list.

**Files:** `js/pages/10-strategy-deep-dive.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Holdings row opens fund drawer

- Click a Portfolio Holdings row to open the side drawer.
- Numbers come from the same `CFG.rows` as the table (millions + `x`).
- Shows NAV / DPI / TVPI / RVPI plus commitment, called, distributed, total value, unfunded, manager, vintage, vehicle.
- Search, filter, and PDF are unchanged. Empty row and grand total do not open.

**Files:** `js/pages/16-portfolio-holdings.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Added .gitignore

- Ignores `.DS_Store`, Excel lock files, Python cache, `.scratch`.

**Files:** `.gitignore`, `README.md`.

## 2026-08-28 — Excel is the only numbers source

- Holdings and Key Considerations now read `CFG.rows`.
- Deleted extra number files and `clean_data.json`.
- `python3 tools/export.py` only writes `CFG.rows` from the Excel file.

**Files:** `js/pages/16-portfolio-holdings.js`, `js/pages/06-key-considerations.js`, `js/data.js`, `tools/export.py`, `index.html`, `README.md`.

## 2026-08-28 — Strategy Mix uses one data source

- Table and drawer both read `CFG.rows` (`slideStrategy`).
- Baked Strategy Mix numbers removed.

**Files:** `js/slide-data/07-strategy-mix.data.js`, `js/pages/07-strategy-mix.js`, `tools/export_strategy_mix.py`, `README.md`.

## 2026-08-28 — Strategy Mix drawer matches the table

- Private Equity no longer opens as Buyout.
- Drawer NAV / DPI / TVPI now use the same 5 buckets as the table.

**Files:** `js/app.js`, `js/pages/07-strategy-mix.js`, `js/data.js`, `tools/export_cfg_rows.py`, `README.md`.

## 2026-08-28 — Delivery cleanup

- Removed unused: Figma export, `figma_to_html.py`, Excel lock, `.scratch`, pycache.
- Removed dead shell: counter, title, showLinks, dataBtn, hint.
- Divider helper is now `js/pages/section-divider.js`.
- README is a short delivery guide. Older rounds stay here.

**Files:** `index.html`, `js/app.js`, `js/pages/section-divider.js`, `README.md`, `.gitignore`.

## 2026-08-28 — Holdings filter: all number columns

- Filter now covers Commitment, Called, Distributed, NAV, Total value, DPI, RVPI, TVPI.
- Same All / Greater / Less / Between. No not-equal.

**Files:** `js/pages/16-portfolio-holdings.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Between waits for both numbers

- Between does not filter until both boxes have a value.

**Files:** `js/pages/16-portfolio-holdings.js`, `README.md`.

## 2026-08-28 — Filter number fields show by operator

- All = no boxes.
- Greater / less = one box.
- Between = two boxes and “and”.

**Files:** `js/pages/16-portfolio-holdings.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Filter drawer uses champagne accent

- Dropped `#4ade80` again.
- Chips and focus now use `--accent` (`#c9b896`).

**Files:** `css/styles.css`, `README.md`.

## 2026-08-28 — Holdings filter step 1

- Filter button opens the side drawer.
- Strategy chips, plus NAV and DPI (greater / less / between).
- Live apply. Table, total, and PDF follow.

**Files:** `js/pages/16-portfolio-holdings.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Holdings search + PDF

- Portfolio Holdings has search and PDF export.
- Light theme: gray search field, green PDF button.
- Filter and sort apply to the table, total, and PDF.

**Files:** `js/pages/16-portfolio-holdings.js`, `css/styles.css`, `js/i18n/en.js`, `README.md`.

## 2026-08-28 — Manager bars + no default sort

- Manager Concentration bars grow like Deep Dive.
- No table starts with a sort arrow. Click a header to sort.

**Files:** `js/pages/08-manager-concentration.js`, `js/pages/10-strategy-deep-dive.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Deep Dive table bars

- Manager bars grow left to right on first view and strategy change.

**Files:** `css/styles.css`, `js/pages/10-strategy-deep-dive.js`, `README.md`.

## 2026-08-28 — Deep Dive narratives

- Added 3-point copy for Credit, Real Estate & Infrastructure, and Growth & Venture.

**Files:** `js/slide-data/10-strategy-deep-dive-narratives.data.js`, `README.md`.

## 2026-08-28 — Deep Dive vintage gap

- Small gap between the gray table and NAV BY VINTAGE.

**Files:** `js/pages/10-strategy-deep-dive.js`, `README.md`.

## 2026-08-28 — Deep Dive chart titles

- NAV BY VINTAGE and DPI VS RVPI are `#787878` 13 / 600.

**Files:** `js/pages/10-strategy-deep-dive.js`, `README.md`.

## 2026-08-28 — Deep Dive gap after KPI line

- Small gap between the KPI line and the notes/table.

**Files:** `css/styles.css`, `js/pages/10-strategy-deep-dive.js`, `README.md`.

## 2026-08-28 — Deep Dive table Total line

- Line above Total is visible again.
- Less space under Total.
- `% OF TOT.` header is right-aligned.

**Files:** `css/styles.css`, `README.md`.

## 2026-08-28 — Table style shared

- Strategy Mix, Manager Concentration, and Deep Dive tables now match.
- Only two lines: under headers, above Total.
- Box: `#F5F5F5`, radius 4.
- Headers: `#787878` 15 / 600.

**Files:** `css/styles.css`, `js/pages/07-strategy-mix.js`, `README.md`.

## 2026-08-28 — Deep Dive DPI bar height

- DPI vs RVPI bars are 11px tall.

**Files:** `css/styles.css`, `README.md`.

## 2026-08-28 — Deep Dive DPI vs RVPI

- Equal-width split bars, same as the design.
- Labels use `1.51 / 0.09`.

**Files:** `js/pages/10-strategy-deep-dive.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Deep Dive table right edge

- Last column (`% OF TOT.`) is no longer clipped.

**Files:** `css/styles.css`, `js/pages/10-strategy-deep-dive.js`, `README.md`.

## 2026-08-28 — Deep Dive table box

- Gray box covers every row, including Total.
- Less rounding (8px).

**Files:** `css/styles.css`, `README.md`.

## 2026-08-28 — Deep Dive KPI padding

- More space around the four KPIs.
- Vertical lines stop short of the baseline.

**Files:** `js/pages/10-strategy-deep-dive.js`, `README.md`.

## 2026-08-28 — Deep Dive KPI type

- KPI number `#104130` 38 medium. Label `#787878` 24 regular.

**Files:** `js/pages/10-strategy-deep-dive.js`, `README.md`.

## 2026-08-28 — Deep Dive gaps

- More space between left and right.
- More space between the number and the title.

**Files:** `css/styles.css`, `README.md`.

## 2026-08-28 — Deep Dive left type

- Number 18 semibold. Title `#104130` 22 medium. Body `#808582` 16 regular.

**Files:** `css/styles.css`, `README.md`.

## 2026-08-28 — Deep Dive left copy

- Left notes now use the design text, not the old 40% / 82% / 61% lines.

**Files:** `js/slide-data/10-strategy-deep-dive.data.js`, `js/pages/10-strategy-deep-dive.js`, `README.md`.

## 2026-08-28 — Deep Dive left notes

- Left side is now 01 / 02 / 03 circles, green heading, gray body.

**Files:** `js/pages/10-strategy-deep-dive.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Strategy Deep Dive layout

- Four KPIs sit full-width under the title.
- Left notes and the table start on the same row.
- Remaining + Total stay last. Only the top 5 sort.
- Extra table and insight lines are gone. Table sits in a gray box.

**Files:** `js/pages/10-strategy-deep-dive.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Basis + Disclaimer anim

- First visit only. Basis notes: left column, then right.
- Disclaimer columns move L→R.

**Files:** `js/pages/14-basis-of-preparation.js`, `js/pages/18-disclaimer.js`, `js/app.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Sell vs Hold tooltip

- Apex tooltip is visible again. The global hide was only meant for Manager leftover arrows.

**Files:** `css/styles.css`, `README.md`.

## 2026-08-28 — Strategy Mix card gaps

- Title → subtitle: 10px. Subtitle → body: 22px.

**Files:** `js/pages/07-strategy-mix.js`, `README.md`.

## 2026-08-28 — Strategy Mix right type

- Title `#5E5E5E` 26 semibold.
- Subtitle `#104130` 25 regular.
- Body `#808582` 16 regular. Highlights stay same color, just bold.

**Files:** `js/pages/07-strategy-mix.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Key considerations polish

- Bold phrases stay `#5E5E5E`, just heavier.
- Card gap is 38px.

**Files:** `js/pages/06-key-considerations.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Key considerations type

- Numbers `#104130` 25 semibold. Point text `#5E5E5E` 24.
- Portfolio Summary `#5E5E5E` 26 medium.
- Summary cards: 22px gap + thin `#dee4df` border.

**Files:** `css/styles.css`, `README.md`.

## 2026-08-28 — PDF search note

- PDF meta now says `Filtered by search “…”` when a search is on, same place as the sort note.

**Files:** `js/app.js`, `js/i18n/en.js`, `README.md`.

## 2026-08-28 — PDF title date

- Removed the date next to the PDF title. Chrome already prints it.

**Files:** `js/app.js`, `README.md`.

## 2026-08-28 — PDF print chrome

- Date + “PSERS Portfolio…” at the top are Chrome headers, not our layout.
- We blank the page title while printing so the right-hand title drops.
- The left date only goes away if Headers and footers is off in the print dialog.

**Files:** `js/app.js`, `README.md`.

## 2026-08-28 — PDF header

- No repeat title in the print chrome.
- Date/time sits small beside the real title, in parentheses.
- Extra right padding so TANGIBLE is not clipped.

**Files:** `js/app.js`, `README.md`.

## 2026-08-28 — Holdings popup

- Subtitle is just the count. No Excel mention.
- Sticky Grand total row, same weighted math as slide 14.
- PDF exports the current search + sort view, plus the total.
- Left/right (and prev/next) close the modal or drawer.

**Files:** `js/app.js`, `js/i18n/en.js`, `css/styles.css`, `index.html`, `README.md`.

## 2026-08-28 — Discussion Points animation

- First visit only. Each row moves L→R: question, then implication, then transaction.
- Later visits stay still.

**Files:** `js/pages/12-discussion-points.js`, `js/app.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Discussion Points copy

- New questions, implications, and transactions.
- Middle column has no bold. Right column bolds the lead phrase only.

**Files:** `js/pages/12-discussion-points.js`, `README.md`.

## 2026-08-28 — Manager hover tip

- Apex tooltip is off. Hover uses `#donutTip` — no arrow, no square.

**Files:** `js/pages/08-manager-concentration.js`, `css/styles.css`.

## 2026-08-28 — Manager legend + tooltip

- Legend is two columns, teal badges, gray names.
- Bar radius is 3px. Tooltip caret hidden globally. No line on Total.

**Files:** `js/pages/08-manager-concentration.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Manager table polish

- No line under Total. Bars are 10px and rounded.
- Callout numbers and badge ranks are centered. Tooltip caret is gone.

**Files:** `js/pages/08-manager-concentration.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Manager table (06)

- Gray box around the table. Bars sit beside the name.
- Remaining row stays last when sorting. `drawndown` → drawn down.

**Files:** `js/pages/08-manager-concentration.js`, `js/slide-data/08-manager-concentration.data.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Routes type tokens

- `01` `#006C5C` 32 medium. Title `#393939` 40 medium.
- Body `#393939` 19 regular. Arrow points `#787878` 15 regular. All four columns.

**Files:** `css/styles.css`, `js/pages/05-routes-to-liquidity.js`, `README.md`.

## 2026-08-28 — Routes list spacing restored

- Paragraph-to-list gap is back.
- Tight rows inside each group. Extra gap before the red arrows.

**Files:** `js/pages/05-routes-to-liquidity.js`, `css/styles.css`.

## 2026-08-28 — Routes (03) type and copy

- Numbers are dark green and bold. Titles are dark gray and bold.
- Body and bullets are gray. GP Consolidation has the 5th upside line.

**Files:** `js/pages/05-routes-to-liquidity.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Strategy Mix left/right align

- Right rules lock to the left box edges: top, mid, and bottom.
- PE / RE sit under the top rule. Credit / G&V sit under the mid rule.

**Files:** `js/pages/07-strategy-mix.js`, `js/slide-data/07-strategy-mix.data.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Strategy Mix (05) redesign

- Left table and vintage chart sit in matching `#F5F5F5` boxes.
- Title is now the design line. Commentary copy updated; typos fixed.
- Thin row lines in the strategy table. One hairline between the right-side pairs.

**Files:** `js/pages/07-strategy-mix.js`, `js/slide-data/07-strategy-mix.data.js`, `tools/export_strategy_mix.py`, `css/styles.css`, `README.md`.

## 2026-08-28 — Key considerations list spacing

- Gaps between points are tight.
- Gray box ends with point 05. Space under 05 matches the design.

**Files:** `js/pages/06-key-considerations.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Key considerations list align

- Number sits on the first line of the text.
- Line-height tightened to match the new slide.

**Files:** `js/pages/06-key-considerations.js`, `css/styles.css`.

## 2026-08-28 — Key considerations redesign

- List lines removed.
- Right side is one gray Portfolio Summary box.
- Click the box → portfolio source data. No holdings click on the bottom row.

**Files:** `js/pages/06-key-considerations.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Remove TOC 03 divider

- PSERS Portfolio Overview slide is gone.
- Cover index and later page numbers shifted. Deck is 17 slides.

**Files:** `js/pages/01-cover.js`, `js/data.js`, `js/app.js`, later `chrome-page` values, `README.md`.

## 2026-08-28 — Vintage title click

- Expand icon removed on Strategy Mix.
- Click "SHARE OF NAV BY VINTAGE" to open the vintage popup.

**Files:** `js/pages/07-strategy-mix.js`, `css/styles.css`, `README.md`.

## 2026-08-28 — Routes first-visit animation

- Four columns fade/rise L→R on first landing only.
- Dividers grow down. Later visits stay still.

**Files:** `js/pages/05-routes-to-liquidity.js`, `js/app.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — Manager chart popup removed

- No more "Manager concentration · interactive" modal.
- Portfolio drawer no longer has a Manager chart button.

**Files:** `js/app.js`, `js/i18n/en.js`, `index.html`, `css/styles.css`, `js/pages/07-strategy-mix.js`, `README.md`.

## 2026-08-27 — Holdings count lockstep

- Grand total and disclaimer use `rows.length`.
- Table, total row, and footnote stay the same N.

**Files:** `js/pages/16-portfolio-holdings.js`, `tools/export_portfolio_holdings.py`, `README.md`.

## 2026-08-27 — Count-up menu item removed

- 3-dot menu is Fullscreen only.

**Files:** `index.html`, `js/app.js`, `js/pages/03-tangible-stats.js`, `js/i18n/en.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — How to change this deck

- Edit guide added at the top of README (no extra .md file).

**Files:** `README.md`, `index.html`.

## 2026-08-27 — Deep Dive stat row count-up

- Four headline stats count up on first visit.

**Files:** `js/pages/10-strategy-deep-dive.js`, `js/pages/03-tangible-stats.js`, `js/app.js`, `README.md`.

## 2026-08-27 — Deep Dive bar grow on first visit

- NAV columns grow up on first visit.
- DPI Apex draw still plays once.

**Files:** `js/pages/10-strategy-deep-dive.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — Deep Dive vintage columns aligned

- NAV and DPI rows share one 5-column grid.
- Top-bar hover is a full-height hit box + fixed tooltip.
- Bottom DPI bars have no tooltip.

**Files:** `js/pages/10-strategy-deep-dive.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — Holdings no default sort

- Table starts unsorted. Click a header to sort.

**Files:** `js/pages/13-portfolio-holdings.js`, `README.md`.

## 2026-08-27 — Intro animations play once

- Strategy Mix bars/donut play on first visit only.
- Market Sentiment: range fill grows, markers slide in, chart draws once.

**Files:** `js/pages/07-strategy-mix.js`, `js/pages/09-market-sentiment.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — Strategy Mix load animation

- Bars grow left to right.
- Donut wipes left to right after it mounts.

**Files:** `js/pages/07-strategy-mix.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — Footer chrome one color

- Confidential and slide number are `#96AC9E` on every slide.

**Files:** all `js/pages/*.js` chrome-footer / chrome-page, `css/styles.css`, `README.md`.

## 2026-08-27 — Liquidity Options + Annexes dividers

- Liquidity Options divider before Discussion Points.
- Annexes divider before Portfolio Holdings.
- Cover CONTENTS updated. Later footer numbers shifted.

**Files:** `js/pages/04-psers-portfolio-overview-divider.js`, `js/pages/10-liquidity-options-divider.js`, `js/pages/14-annexes-divider.js`, `js/pages/01-cover.js`, `js/app.js`, `js/data.js`, `index.html`, later slide chrome-page numbers, `README.md`.

## 2026-08-27 — Sell vs Hold lines smoother

- Fewer points and a monotone curve so the lines are not jagged.

**Files:** `js/pages/09-market-sentiment.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — Manager Concentration title between lines

- Title now sits in the table header row, between the two lines.

**Files:** `js/pages/08-manager-concentration.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — Count-up on Key portfolio considerations

- Four panel figures count up the first time you open slide 05.
- Same menu toggle as the stats slide.

**Files:** `js/pages/06-key-considerations.js`, `js/pages/03-tangible-stats.js`, `js/app.js`, `README.md`.

## 2026-08-27 — Next Steps smoother, once, hover shift

- Card and matching dot move on the same beat.
- Slower, softer ease.
- Hover lifts one card; the others ease down a little.
- Intro plays only the first visit. Hover always works.

**Files:** `js/pages/10-next-steps.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — Next Steps place + hover

- Cards drop in one by one on visit.
- Matching dot turns white after each card lands.
- Hover lifts the card a little.

**Files:** `js/pages/10-next-steps.js`, `js/app.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — Next Steps: no popup, dots centered

- Removed the click overlay that opened a data popup.
- Timeline dots sit on the center of each card.

**Files:** `js/pages/10-next-steps.js`, `README.md`.

## 2026-08-27 — Count-up shorter, mixed starts, once

- Deal cards start from different values, not all from 0.
- Plays once the first time you open the slide.
- Faster (~0.5s).

**Files:** `js/pages/03-tangible-stats.js`, `README.md`.

## 2026-08-27 — Count-up numbers on stats slide

- Headline figures and deal values count up on slide 02.
- Toggle from the 3-dot menu. Saved in the browser.
- Skips if the OS asks for less motion.

**Files:** `js/pages/03-tangible-stats.js`, `js/app.js`, `index.html`, `js/i18n/en.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — Slider + menu same on every slide

- One slider look: white pill, light dots, ghost arrows.
- Dark chip behind the slider so it works on light slides too.
- Cover menu is the same frosted white button, not faded out.
- No blue browser ring on the next button.

**Files:** `index.html`, `css/styles.css`, `README.md`.

## 2026-08-27 — No green line under totals

- Bottom green rule was leftover from the footer split.
- Only the header line stays.

**Files:** `css/styles.css`, `README.md`.

## 2026-08-27 — Fixed header line + totals

- Green header line stays put while the table scrolls.
- Grand total sits below the scroll, so no tiny rows peek under it.

**Files:** `js/pages/09-portfolio-holdings.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — Holdings on cover + table scroll + more rows

- Cover CONTENTS now has Portfolio Holdings as 08.
- Table scroll was blocked by a wheel preventDefault on the slide. Fixed.
- Screenshot funds added on top of the existing 30 rows (225 funds now).

**Files:** `js/pages/01-cover.js`, `js/app.js`, `css/styles.css`, `js/slide-data/09-portfolio-holdings.data.js`, `README.md`.

## 2026-08-27 — Routes slide copy match

- Title, intro, and all 4 columns now match the source page.
- Footer stays 04.

**Files:** `js/pages/05-routes-to-liquidity.js`, `README.md`.

## 2026-08-27 — No default table sort

- Cause: table opened with `defaultKey: 'nav'` (desc), so NAV lit up.
- Holdings table now keeps source order until a header is clicked.
- Drawer sort starts on "Original order", not NAV.

**Files:** `js/app.js`, `js/i18n/en.js`, `README.md`.

## 2026-08-27 — Accent palette (champagne)

- Dropped neon mint `#4ade80`.
- New accent: champagne `#c9b896`.
- Tokens live in `:root` — `--accent` and `--accent-rgb`.
- Change those two lines to try another color.

**Files:** `css/styles.css`, `README.md`.

## 2026-08-27 — TOC align + 00 then 01

- Cover is 00. CONTENTS is 01–09.
- Number sits on the same row as the title (centered).
- Slide footers match 00–09.

**Files:** `js/pages/01-cover.js`, `css/styles.css`, `js/pages/02–10`, `README.md`.

## 2026-08-27 — Cover is 00, TOC jumps to slides

- Cover footer is 00.
- Click a CONTENTS row → go to that slide (same transition as Next/Prev).
- Other slides stay 02–10.

**Files:** `js/pages/01-cover.js`, `js/app.js`, `css/styles.css`, `README.md`.

## 2026-08-27 — Reorder slides + footer numbers

- New order: Cover → About → Stats → Divider → Routes → Key considerations → Strategy Mix → Next Steps → Contact → Disclaimer.
- Bottom-right numbers are now 01–10.
- Cover TOC matches that list.

**Files:** `js/data.js`, `js/app.js`, `index.html`, `js/pages/*`, `js/slide-data/07-strategy-mix.data.js`, `README.md`.

## 2026-08-27 — Remove last slide (Conclusion)

- Dropped slide 11, Conclusion & Recommendations.
- Deck is 10 slides. Last slide is Disclaimer.

**Files:** `js/data.js`, `js/app.js`, `index.html`, deleted `js/pages/11-conclusion-recommendations.js`, `README.md`.

## 2026-08-27 — HTML-only deck, drop unused image slides

- Deck is **10 HTML slides**. Dropped 17 PNG-only slides.
- Deleted unused `assets/images/*.png`. Kept `02-about-tangible-client-logos.png` (inside slide 2).
- Removed `#slideImg`, `CFG.images`, `CFG.hotspots`.
- Compacted remaining slides to 1–10. Renamed `js/pages/` to match.

**Files:** `js/data.js`, `js/app.js`, `index.html`, `js/pages/*`, `js/slide-data/`, `assets/images/`, `css/styles.css`, `README.md`.

## 2026-08-26 — Localization setup (English only)

- Tiny engine: `js/i18n/i18n.js` (`t()`, `I18N.register` / `setLocale` / `apply`).
- Strings live in `js/i18n/en.js`. UI is still English.
- Shell chrome uses `data-i18n`. Drawers, tables, chart, PDF use `t()`.
- No language picker. Adding a language later: copy `en.js`, translate, register, add a script tag.
- Not translated: slide copy in `js/pages/`, fund/manager names, strategy keys.

**Files:** `js/i18n/i18n.js`, `js/i18n/en.js`, `index.html`, `js/app.js`, `README.md`.

## 2026-08-26 — Table PDF export

- PDF button next to the close (X) on holdings tables only.
- Exports **every row**, not the search filter. Keeps the current sort.
- Opens the browser print dialog — pick Save as PDF.
- Chart and fund-detail popups do not show the button.
- TANGIBLE boxed wordmark at the top right of the PDF (same as the slides).

**Files:** `index.html`, `js/app.js`, `css/styles.css`.

## 2026-08-26 — Holdings table: header sort + search on the right

- Removed the SORT dropdown.
- Click any column header to sort. Click again to flip asc/desc.
- Green chevron = active column and direction. Faint pair on the rest.
- Search moved right, with an icon and a focus ring.
- Shared `bindSortableTable()` + `HOLDINGS_COLS` — every holdings table uses this (ratio-row popup, Open all holdings, Open table from a lens).

**Files:** `js/app.js`, `css/styles.css`.

## 2026-08-26 — KPI grid: no empty cell

The hole was the 3-column grid's gap background showing through leftover cells.

- Manager lens (5 KPIs): first 2 stretch on row 1, then 3 on row 2.
- Fund-detail modal (4 KPIs): all 4 on one row.
- 3-KPI and 6-KPI views stay 3-column.

**Files:** `css/styles.css` (`.lensKpis-5`, `.lensKpis-4`), `js/app.js`.

## 2026-08-26 — Manager lens: drop redundant manager grouping

**Where:** click green box on Key portfolio considerations → pick a manager.

- Hide the "Managers: 1" KPI (always 1 on this view).
- Show funds as a flat list, not grouped under that one manager.
- Strategy / vintage / DPI lenses still group by manager.

**Files:** `js/app.js` (`openDataLens` `singleManager` flag, used only by `openManager`), `css/styles.css`.
