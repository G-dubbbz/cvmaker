import { ORG_LABEL, ROLE_LABEL } from '../i18n.ts'
import { move } from '../store.ts'
import type { Entry, Lang, SectionKind } from '../types.ts'
import { emptyLoc } from '../types.ts'
import { IconButton, LocalizedField, Text } from './Field.tsx'

export function EntryEditor({
  entry,
  kind,
  lang,
  index,
  count,
  mutate,
  onMove,
  onRemove,
  onDuplicate,
}: {
  entry: Entry
  kind: SectionKind
  lang: Lang
  index: number
  count: number
  mutate: (recipe: (e: Entry) => void) => void
  onMove: (delta: number) => void
  onRemove: () => void
  onDuplicate: () => void
}) {
  const dated = kind !== 'skills' && kind !== 'text'
  const roleLabel = ROLE_LABEL[kind]
  const orgLabel = ORG_LABEL[kind]

  return (
    <div className={`entry${entry.visible ? '' : ' hidden-entry'}`}>
      <div className="entry-bar">
        <span className="entry-index">{index + 1}</span>
        <div className="spacer" />
        <IconButton
          title={entry.visible ? 'Hide from PDF' : 'Show in PDF'}
          onClick={() => mutate((e) => void (e.visible = !e.visible))}
        >
          {entry.visible ? '👁' : '🚫'}
        </IconButton>
        <IconButton title="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
          ↑
        </IconButton>
        <IconButton
          title="Move down"
          disabled={index === count - 1}
          onClick={() => onMove(1)}
        >
          ↓
        </IconButton>
        <IconButton title="Duplicate entry" onClick={onDuplicate}>
          ⧉
        </IconButton>
        <IconButton title="Delete entry" danger onClick={onRemove}>
          ✕
        </IconButton>
      </div>

      <LocalizedField
        label={roleLabel}
        value={entry.role}
        lang={lang}
        onChange={(v) => mutate((e) => void (e.role = v))}
      />

      {orgLabel ? (
        <div className="row">
          <Text
            label={orgLabel}
            value={entry.organization}
            onChange={(v) => mutate((e) => void (e.organization = v))}
          />
          <Text
            label="Location"
            value={entry.location}
            width="34%"
            onChange={(v) => mutate((e) => void (e.location = v))}
          />
        </div>
      ) : null}

      {dated ? (
        <div className="row dates-row">
          <Text
            label="From"
            placeholder="2023-08"
            value={entry.start}
            onChange={(v) => mutate((e) => void (e.start = v))}
          />
          <Text
            label="To"
            placeholder="2025-01"
            value={entry.end}
            onChange={(v) => mutate((e) => void (e.end = v))}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={entry.current}
              onChange={(ev) => mutate((e) => void (e.current = ev.target.checked))}
            />
            Ongoing
          </label>
        </div>
      ) : null}

      {kind === 'skills' ? (
        <Text
          label="Items (comma separated)"
          value={entry.tags.join(', ')}
          onChange={(v) =>
            mutate((e) => {
              e.tags = v.split(',').map((x) => x.trim())
            })
          }
        />
      ) : (
        <>
          <LocalizedField
            label="Description"
            value={entry.summary}
            lang={lang}
            multiline
            onChange={(v) => mutate((e) => void (e.summary = v))}
          />

          <div className="bullets">
            <span className="field-label">Bullet points</span>
            {entry.bullets.map((bullet, i) => (
              <div className="bullet" key={i}>
                <LocalizedField
                  label=""
                  value={bullet}
                  lang={lang}
                  multiline
                  onChange={(v) => mutate((e) => void (e.bullets[i] = v))}
                />
                <div className="bullet-tools">
                  <IconButton
                    title="Move bullet up"
                    disabled={i === 0}
                    onClick={() => mutate((e) => move(e.bullets, i, -1))}
                  >
                    ↑
                  </IconButton>
                  <IconButton
                    title="Move bullet down"
                    disabled={i === entry.bullets.length - 1}
                    onClick={() => mutate((e) => move(e.bullets, i, 1))}
                  >
                    ↓
                  </IconButton>
                  <IconButton
                    title="Delete bullet"
                    danger
                    onClick={() => mutate((e) => void e.bullets.splice(i, 1))}
                  >
                    ✕
                  </IconButton>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="add-btn"
              onClick={() => mutate((e) => void e.bullets.push(emptyLoc()))}
            >
              + Add bullet
            </button>
          </div>

          <Text
            label="Keywords (comma separated, optional)"
            value={entry.tags.join(', ')}
            onChange={(v) =>
              mutate((e) => {
                e.tags = v.split(',').map((x) => x.trim())
              })
            }
          />
        </>
      )}
    </div>
  )
}
