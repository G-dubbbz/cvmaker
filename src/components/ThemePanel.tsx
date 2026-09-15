import type { Theme } from '../types.ts'

const PRESETS = ['#1f4e79', '#0f766e', '#7c2d12', '#3f3f46', '#5b21b6']

export function ThemePanel({
  theme,
  mutate,
}: {
  theme: Theme
  mutate: (recipe: (t: Theme) => void) => void
}) {
  return (
    <section className="section-card">
      <header className="section-head">
        <h2>Document style</h2>
      </header>
      <div className="section-body">
        <div className="row">
          <label className="field">
            <span className="field-label">Accent colour</span>
            <div className="swatches">
              {PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`swatch${theme.accent === c ? ' on' : ''}`}
                  style={{ background: c }}
                  title={c}
                  aria-label={`Accent ${c}`}
                  onClick={() => mutate((t) => void (t.accent = c))}
                />
              ))}
              <input
                type="color"
                value={theme.accent}
                onChange={(e) => mutate((t) => void (t.accent = e.target.value))}
              />
            </div>
          </label>
          <label className="field" style={{ flex: '0 0 36%' }}>
            <span className="field-label">Typeface</span>
            <select
              value={theme.font}
              onChange={(e) => mutate((t) => void (t.font = e.target.value as Theme['font']))}
            >
              <option value="Helvetica">Helvetica (sans)</option>
              <option value="Times-Roman">Times (serif)</option>
            </select>
          </label>
        </div>

        <div className="row">
          <label className="field">
            <span className="field-label">Font size · {theme.fontSize}pt</span>
            <input
              type="range"
              min={8}
              max={13}
              step={0.5}
              value={theme.fontSize}
              onChange={(e) => mutate((t) => void (t.fontSize = Number(e.target.value)))}
            />
          </label>
          <label className="field">
            <span className="field-label">Line height · {theme.lineHeight}</span>
            <input
              type="range"
              min={1.1}
              max={1.7}
              step={0.05}
              value={theme.lineHeight}
              onChange={(e) => mutate((t) => void (t.lineHeight = Number(e.target.value)))}
            />
          </label>
          <label className="field">
            <span className="field-label">Margin · {theme.margin}pt</span>
            <input
              type="range"
              min={24}
              max={72}
              step={2}
              value={theme.margin}
              onChange={(e) => mutate((t) => void (t.margin = Number(e.target.value)))}
            />
          </label>
        </div>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={theme.showPageNumbers}
            onChange={(e) => mutate((t) => void (t.showPageNumbers = e.target.checked))}
          />
          Show page numbers
        </label>
      </div>
    </section>
  )
}
