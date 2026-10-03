# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server on :5173
npm run typecheck  # tsc -b --noEmit
npm run build      # tsc -b && vite build
```

There is no test runner. Changes are verified by typechecking and by rendering
the PDF headlessly (see below).

## The central constraint

`src/pdf/CvDocument.tsx` is the **only** renderer. There is no HTML version of
the CV — the right-hand pane is an `<iframe>` pointing at the real PDF's blob
URL, so preview and download cannot drift apart. Any change to how a CV looks
happens in that one file.

This also means **layout bugs are invisible to the typechecker and to the
browser console**. Both react-pdf bugs documented below failed silently, with
correct-looking code and no error anywhere.

## Verifying PDF output

react-pdf runs in Node, so render to a file and measure it. Put the bundle
output *inside* the project directory — Node resolves `node_modules` from the
bundle's location, so a bundle written to `/tmp` cannot find `@react-pdf/renderer`.

```bash
cat > src/__render.tsx <<'EOF'
import { renderToFile } from '@react-pdf/renderer'
import { readFileSync } from 'node:fs'
import { CvDocument } from './pdf/CvDocument.tsx'
import { normalize } from './store.ts'
import type { Lang } from './types.ts'
const cv = normalize(JSON.parse(readFileSync(process.argv[2], 'utf8')))
await renderToFile(<CvDocument cv={cv} lang={process.argv[4] as Lang} />, process.argv[3])
EOF

cat > /tmp/r.config.mjs <<EOF
export default {
  input: '$(pwd)/src/__render.tsx',
  output: { file: '$(pwd)/.render.mjs', format: 'esm', codeSplitting: false },
  platform: 'node',
  external: (id) => !id.startsWith('.') && !id.startsWith('/'),
}
EOF

npx rolldown -c /tmp/r.config.mjs && node .render.mjs some.cv.json /tmp/out.pdf no
```

`rolldown` is the only bundler available (a Vite 8 dependency); there is no
esbuild binary. Delete `src/__render.tsx` and `.render.mjs` afterwards —
`src/__render.tsx` uses Node globals and will fail `npm run typecheck`.

Then inspect, via poppler (`pdftotext`, `pdftoppm`, `pdffonts`):

- `pdftotext -layout out.pdf -` — reading order, localized dates, `æøå`
- `pdftotext -bbox out.pdf -` — exact glyph positions; the **only** way to catch
  wrong line spacing, since it renders without error
- `pdftoppm -png -r 110 out.pdf prefix` — page images to look at
- `pdffonts out.pdf` — confirms which font variants actually resolved

## react-pdf (v4) landmines

Both of these produce no error and no warning.

**A unitless `lineHeight` only resolves against `fontSize` on the same style
object.** Inherited from an ancestor it computes against react-pdf's 18pt
default instead, making the theme's line-height control silently inert. Every
style in `CvDocument.tsx` that sets `lineHeight` sets `fontSize` next to it.
Keep that pairing when adding styles.

**A page-level `lineHeight` stops `fixed` elements with a `render` callback from
laying out at all** — it silently drops the page-number footer. This is why line
height lives on the text styles and never on the `page` style.

**Standard font variants are separate family names.** Use `Helvetica-Bold` /
`Helvetica-Oblique` / `Times-Bold` / `Times-Italic` (see the `bold()` and
`italic()` helpers), not `fontWeight`/`fontStyle`.

**A nested `<Link>` creates a line-break opportunity** that a non-breaking space
cannot suppress. The contact line is a `flexWrap` row of atomic cells for this
reason, so a wrap never strands a `·` at a line end.

## Data model (`src/types.ts`)

Everything translatable is `Loc = { en, no }`. A `CV` is
`{ personal, sections[], theme }`; a `Section` has a `kind` plus `entries[]`.

The split is deliberate: `role`, `title`, `summary` and `bullets` are `Loc`,
while `organization`, `location`, `start` and `end` are plain shared strings —
employers and dates don't get translated. **A consequence worth knowing: there
is no way to localize an organisation name**, so spelled-out Norwegian
institution names will appear verbatim in the English PDF.

`Section.kind` controls **layout only**, never meaning. The heading is a
user-editable `Loc`, so "Verv" is not a special case — it is an ordinary section
whose title happens to say Verv. `SectionBlock` dispatches on `kind` to
`DatedEntry`, `SkillEntry` or `TextEntry`.

Skill items live in `Entry.summary` (translated), *not* in `tags`. `tags` is a
shared, untranslated string list kept as a render fallback for entries written
before items were translatable.

## State (`src/store.ts`)

Every edit goes through one function, a minimal hand-rolled Immer:

```ts
update(draft => { draft.sections[i].entries[j].role = value })
```

It deep-clones via `structuredClone`, lets you mutate the clone freely, and
returns it as the new state. This is why editors mutate directly
(`mutate(e => void e.bullets.splice(i, 1))`) and why `move()` uses plain
`splice`. Nesting composes by partial application — each layer narrows the
draft to its own slice before passing the setter down.

`normalize()` rebuilds a `CV` field by field with fallbacks. All external input
(JSON import, `localStorage`) must pass through it so a truncated or
hand-edited file cannot crash the renderer.

## Preview loop (`src/components/Preview.tsx`)

Edits are debounced 450ms before react-pdf is re-invoked. `usePDF()`'s `update`
is `useCallback(…, [])`, so it is safe as an effect dependency.

**Do not cache `instance.url`.** react-pdf revokes each blob URL as soon as it
is replaced, so a cached URL is already dead. It already retains the previous
PDF until the next finishes, which is what keeps the pane from flashing empty
mid-edit.

## Browser automation note

The `computer` tool's `type` action fails with *"Cannot access a
chrome-extension:// URL of different extension"* on this app — Chrome's built-in
PDF viewer renders the preview iframe. The keystrokes land anyway, but the
action reports an error and aborts the rest of a batch. Prefer `form_input` with
an element ref when driving the editor.
