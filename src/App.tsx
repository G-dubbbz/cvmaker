import { useRef, useState } from 'react'
import { PersonalForm } from './components/PersonalForm.tsx'
import { Preview } from './components/Preview.tsx'
import { SectionEditor } from './components/SectionEditor.tsx'
import { ThemePanel } from './components/ThemePanel.tsx'
import { KIND_LABEL, LANG_LABEL, SECTION_TITLES } from './i18n.ts'
import { blankCv } from './sample.ts'
import { move, normalize, useCvStore } from './store.ts'
import type { Lang, SectionKind } from './types.ts'
import { LANGS, newSection } from './types.ts'

const ADDABLE: SectionKind[] = [
  'experience',
  'education',
  'verv',
  'projects',
  'skills',
  'text',
]

type OpenFilePicker = (options: {
  id: string
  types: { description: string; accept: Record<string, string[]> }[]
}) => Promise<{ getFile(): Promise<File> }[]>

export default function App() {
  const { cv, update, replace, undo, canUndo } = useCvStore()
  const [lang, setLang] = useState<Lang>('en')
  const [addOpen, setAddOpen] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  function exportJson() {
    const name = cv.personal.fullName.trim().replace(/\s+/g, '-') || 'cv'
    const blob = new Blob([JSON.stringify(cv, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.cv.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 4000)
  }

  /**
   * Chromium remembers the last directory per picker `id`, so after the first
   * pick the dialog reopens in ./CVs/. A page cannot name a path itself, and
   * browsers without the picker API fall back to the plain file input.
   */
  async function openJson() {
    const pick = (window as unknown as { showOpenFilePicker?: OpenFilePicker }).showOpenFilePicker
    if (!pick) {
      fileInput.current?.click()
      return
    }
    try {
      const [handle] = await pick({
        id: 'cvs',
        types: [{ description: 'CV JSON', accept: { 'application/json': ['.json'] } }],
      })
      void importJson(await handle.getFile())
    } catch {
      // Dialog dismissed.
    }
  }

  async function importJson(file: File) {
    try {
      replace(normalize(JSON.parse(await file.text())))
    } catch {
      alert('That file could not be read as a CV JSON export.')
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          CV<span>maker</span>
        </div>

        <div className="lang-toggle" role="group" aria-label="Preview language">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              className={l === lang ? 'on' : ''}
              onClick={() => setLang(l)}
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>

        <div className="spacer" />

        <button type="button" onClick={undo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" onClick={exportJson}>
          Export JSON
        </button>
        <button type="button" onClick={() => void openJson()}>
          Import JSON
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void importJson(file)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (confirm('Replace everything with an empty CV?')) replace(blankCv())
          }}
        >
          Clear
        </button>
      </header>

      <main className="panes">
        <div className="editor">
          <PersonalForm
            personal={cv.personal}
            lang={lang}
            mutate={(recipe) => update((d) => recipe(d.personal))}
          />

          {cv.sections.map((section, i) => (
            <SectionEditor
              key={section.id}
              section={section}
              lang={lang}
              index={i}
              count={cv.sections.length}
              mutate={(recipe) => update((d) => recipe(d.sections[i]))}
              onMove={(delta) => update((d) => move(d.sections, i, delta))}
              onRemove={() => {
                if (confirm('Delete this whole section?')) {
                  update((d) => void d.sections.splice(i, 1))
                }
              }}
            />
          ))}

          <div className="add-section">
            <button type="button" className="add-btn wide" onClick={() => setAddOpen((v) => !v)}>
              + Add section
            </button>
            {addOpen ? (
              <div className="add-menu">
                {ADDABLE.map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => {
                      update((d) => void d.sections.push(newSection(kind, { ...SECTION_TITLES[kind] })))
                      setAddOpen(false)
                    }}
                  >
                    {KIND_LABEL[kind]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <ThemePanel theme={cv.theme} mutate={(recipe) => update((d) => recipe(d.theme))} />

          <p className="hint">
            Everything is stored in this browser only. Use <strong>Export JSON</strong> to keep a
            backup or move the CV to another machine.
          </p>
        </div>

        <Preview cv={cv} lang={lang} />
      </main>
    </div>
  )
}
