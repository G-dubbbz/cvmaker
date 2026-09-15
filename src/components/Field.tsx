import { useEffect, useRef } from 'react'
import type { Lang, Loc } from '../types.ts'
import { LANGS } from '../types.ts'

export function Text({
  label,
  value,
  onChange,
  placeholder,
  width,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  width?: string
}) {
  return (
    <label className="field" style={width ? { flex: `0 0 ${width}` } : undefined}>
      <span className="field-label">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function AutoTextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

/**
 * Both language variants of one field, side by side. The row for the language
 * currently being previewed is highlighted so it is obvious which text the PDF
 * on the right is showing.
 */
export function LocalizedField({
  label,
  value,
  onChange,
  lang,
  multiline,
  placeholder,
}: {
  label: string
  value: Loc
  onChange: (next: Loc) => void
  lang: Lang
  multiline?: boolean
  placeholder?: Partial<Record<Lang, string>>
}) {
  return (
    <div className="field loc-field">
      {label ? <span className="field-label">{label}</span> : null}
      {LANGS.map((l) => (
        <div key={l} className={`loc-row${l === lang ? ' active' : ''}`}>
          <span className="loc-tag">{l.toUpperCase()}</span>
          {multiline ? (
            <AutoTextArea
              value={value[l]}
              placeholder={placeholder?.[l]}
              onChange={(v) => onChange({ ...value, [l]: v })}
            />
          ) : (
            <input
              value={value[l]}
              placeholder={placeholder?.[l]}
              onChange={(e) => onChange({ ...value, [l]: e.target.value })}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export function IconButton({
  title,
  onClick,
  children,
  disabled,
  danger,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      className={`icon-btn${danger ? ' danger' : ''}`}
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
