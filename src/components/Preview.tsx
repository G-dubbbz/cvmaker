import { pdf, usePDF } from '@react-pdf/renderer'
import { useEffect, useState } from 'react'
import { LANG_LABEL } from '../i18n.ts'
import { CvDocument } from '../pdf/CvDocument.tsx'
import type { CV, Lang } from '../types.ts'
import { LANGS } from '../types.ts'

/** Hold back rapid edits so the PDF is only re-rendered when typing pauses. */
function useDebounced<T>(value: T, ms: number): T {
  const [held, setHeld] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setHeld(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return held
}

function fileName(cv: CV, lang: Lang): string {
  const base = cv.personal.fullName.trim().replace(/\s+/g, '-') || 'CV'
  return `${base}-CV-${lang.toUpperCase()}.pdf`
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function Preview({ cv, lang }: { cv: CV; lang: Lang }) {
  // Renders trail the edits: the PDF is only rebuilt once typing pauses.
  const debounced = useDebounced(cv, 450)
  const [instance, update] = usePDF()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    update(<CvDocument cv={debounced} lang={lang} />)
  }, [debounced, lang, update])

  // `instance.url` keeps pointing at the previous PDF until the next one is
  // ready, so the pane never flashes empty mid-edit. Caching it here would not
  // help — react-pdf revokes each object URL as soon as it is replaced.
  const stale = debounced !== cv || instance.loading

  async function downloadAll() {
    setBusy(true)
    try {
      for (const l of LANGS) {
        const blob = await pdf(<CvDocument cv={cv} lang={l} />).toBlob()
        saveBlob(blob, fileName(cv, l))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="preview">
      <div className="preview-bar">
        <span className={`status${stale ? ' stale' : ''}`}>
          {stale ? 'Rendering…' : `Live PDF · ${LANG_LABEL[lang]}`}
        </span>
        <div className="spacer" />
        <button
          type="button"
          className="primary"
          disabled={!instance.blob}
          onClick={() => instance.blob && saveBlob(instance.blob, fileName(cv, lang))}
        >
          Download {lang.toUpperCase()}
        </button>
        <button type="button" onClick={downloadAll} disabled={busy}>
          {busy ? 'Working…' : 'Download both'}
        </button>
      </div>

      {instance.error ? (
        <div className="pdf-error">
          <strong>The PDF could not be rendered.</strong>
          <pre>{String(instance.error)}</pre>
        </div>
      ) : instance.url ? (
        <iframe className="pdf-frame" src={instance.url} title="CV preview" />
      ) : (
        <div className="pdf-empty">Preparing preview…</div>
      )}
    </div>
  )
}
