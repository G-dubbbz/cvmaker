# CV Maker

A local, bilingual (English / Norwegian) CV builder. You fill in a form, the
right-hand pane shows the real PDF as it will be downloaded, and one click saves
it.

```bash
npm install
npm run dev     # http://localhost:5173
```

No server, no account, no network calls. The CV lives in your browser's
`localStorage`; **Export JSON** writes a backup you can keep in git or move to
another machine.

## How the two languages work

A CV has **one structure** and **two texts**. Every prose field — job title,
section heading, description, each bullet — has an `EN` and a `NO` box side by
side in the editor. Dates, employers, schools and locations are shared, because
they do not need translating.

The language toggle in the top bar picks which text the PDF preview renders. The
row being previewed is highlighted in the editor, so it is always clear which
half you are looking at. **Download both** writes `Name-CV-EN.pdf` and
`Name-CV-NO.pdf` in one go.

Untranslated entries are simply skipped for that language — an entry with only
English text does not leave a hole in the Norwegian PDF.

## Sections

Add as many sections as you like. The *layout* dropdown decides how entries are
drawn, independently of what you call the section:

| Layout | Renders as |
| --- | --- |
| Experience / Education / Verv / Projects | Bold role, right-aligned dates, organisation · location, then description and bullets |
| Skills | `Label: item, item, item` in two columns |
| Free text | A heading and a paragraph, no dates |

Sections and entries can be reordered, duplicated, or hidden from the PDF
without deleting them (the eye button).

Dates accept `YYYY-MM` or `YYYY` and are formatted per language
(`Aug 2023 – Present` / `aug. 2023 – nå`). Anything else is passed through
verbatim, so `Summer 2024` works too.

## Document style

Accent colour, serif or sans typeface, body size, line height, and page margins
are adjustable at the bottom of the editor, with optional page numbers. Web
links in the header show as short clickable labels (`LinkedIn`, `GitHub`, the
website's domain) unless you switch back to full URLs. Output is
A4 with selectable, searchable text and live links — not an image.

## Layout notes

Two react-pdf behaviours the renderer works around, both in
`src/pdf/CvDocument.tsx`:

- A unitless `lineHeight` is only resolved against the **same** style object's
  `fontSize`. Inherited from an ancestor it silently computes against an 18pt
  default, so every style that sets `lineHeight` sets `fontSize` next to it.
- A page-level `lineHeight` stops `fixed` elements with a `render` callback from
  laying out at all, which silently drops the page-number footer.

## Project layout

```
src/
  types.ts              data model (Loc = {en, no})
  i18n.ts               UI labels, date formatting, default section titles
  store.ts              localStorage persistence, undo, JSON normalisation
  sample.ts             blank CV and default theme
  pdf/CvDocument.tsx    the PDF — this is both preview and download
  components/           editor form, live preview pane, style controls
CVs/
  example.json          starter CV shown on first run; keep your own CVs here
```
