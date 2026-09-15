import { useState } from 'react'
import { KIND_LABEL, t } from '../i18n.ts'
import { move } from '../store.ts'
import type { Entry, Lang, Section, SectionKind } from '../types.ts'
import { newEntry, uid } from '../types.ts'
import { IconButton, LocalizedField } from './Field.tsx'
import { EntryEditor } from './EntryEditor.tsx'

const KINDS: SectionKind[] = ['experience', 'education', 'verv', 'projects', 'skills', 'text']

export function SectionEditor({
  section,
  lang,
  index,
  count,
  mutate,
  onMove,
  onRemove,
}: {
  section: Section
  lang: Lang
  index: number
  count: number
  mutate: (recipe: (s: Section) => void) => void
  onMove: (delta: number) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(true)
  const heading = t(section.title, lang) || '(untitled section)'

  const mutateEntry = (i: number) => (recipe: (e: Entry) => void) =>
    mutate((s) => recipe(s.entries[i]))

  return (
    <section className={`section-card${section.visible ? '' : ' hidden-entry'}`}>
      <header className="section-head">
        <button
          type="button"
          className="disclose"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? '▾' : '▸'}
        </button>
        <h2>{heading}</h2>
        <span className="pill">{KIND_LABEL[section.kind]}</span>
        <div className="spacer" />
        <IconButton
          title={section.visible ? 'Hide section from PDF' : 'Show section in PDF'}
          onClick={() => mutate((s) => void (s.visible = !s.visible))}
        >
          {section.visible ? '👁' : '🚫'}
        </IconButton>
        <IconButton title="Move section up" disabled={index === 0} onClick={() => onMove(-1)}>
          ↑
        </IconButton>
        <IconButton
          title="Move section down"
          disabled={index === count - 1}
          onClick={() => onMove(1)}
        >
          ↓
        </IconButton>
        <IconButton title="Delete section" danger onClick={onRemove}>
          ✕
        </IconButton>
      </header>

      {open ? (
        <div className="section-body">
          <div className="row">
            <LocalizedField
              label="Section heading"
              value={section.title}
              lang={lang}
              onChange={(v) => mutate((s) => void (s.title = v))}
            />
            <label className="field" style={{ flex: '0 0 34%' }}>
              <span className="field-label">Layout</span>
              <select
                value={section.kind}
                onChange={(e) =>
                  mutate((s) => void (s.kind = e.target.value as SectionKind))
                }
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {section.entries.map((entry, i) => (
            <EntryEditor
              key={entry.id}
              entry={entry}
              kind={section.kind}
              lang={lang}
              index={i}
              count={section.entries.length}
              mutate={mutateEntry(i)}
              onMove={(delta) => mutate((s) => move(s.entries, i, delta))}
              onRemove={() => mutate((s) => void s.entries.splice(i, 1))}
              onDuplicate={() =>
                mutate((s) => {
                  const copy = structuredClone(s.entries[i])
                  copy.id = uid()
                  s.entries.splice(i + 1, 0, copy)
                })
              }
            />
          ))}

          <button
            type="button"
            className="add-btn wide"
            onClick={() => mutate((s) => void s.entries.push(newEntry()))}
          >
            + Add entry
          </button>
        </div>
      ) : null}
    </section>
  )
}
