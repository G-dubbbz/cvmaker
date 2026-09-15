import type { Lang, Personal } from '../types.ts'
import { LocalizedField, Text } from './Field.tsx'

export function PersonalForm({
  personal,
  lang,
  mutate,
}: {
  personal: Personal
  lang: Lang
  mutate: (recipe: (p: Personal) => void) => void
}) {
  return (
    <section className="section-card">
      <header className="section-head">
        <h2>Personal details</h2>
      </header>
      <div className="section-body">
        <Text
          label="Full name"
          value={personal.fullName}
          onChange={(v) => mutate((p) => void (p.fullName = v))}
        />
        <LocalizedField
          label="Headline"
          value={personal.headline}
          lang={lang}
          placeholder={{ en: 'Software Engineer', no: 'Systemutvikler' }}
          onChange={(v) => mutate((p) => void (p.headline = v))}
        />
        <div className="row">
          <Text
            label="Email"
            value={personal.email}
            onChange={(v) => mutate((p) => void (p.email = v))}
          />
          <Text
            label="Phone"
            value={personal.phone}
            onChange={(v) => mutate((p) => void (p.phone = v))}
          />
        </div>
        <LocalizedField
          label="Location"
          value={personal.location}
          lang={lang}
          placeholder={{ en: 'Oslo, Norway', no: 'Oslo, Norge' }}
          onChange={(v) => mutate((p) => void (p.location = v))}
        />
        <div className="row">
          <Text
            label="Website"
            value={personal.website}
            onChange={(v) => mutate((p) => void (p.website = v))}
          />
          <Text
            label="LinkedIn"
            value={personal.linkedin}
            onChange={(v) => mutate((p) => void (p.linkedin = v))}
          />
          <Text
            label="GitHub"
            value={personal.github}
            onChange={(v) => mutate((p) => void (p.github = v))}
          />
        </div>
        <LocalizedField
          label="Profile summary"
          value={personal.summary}
          lang={lang}
          multiline
          onChange={(v) => mutate((p) => void (p.summary = v))}
        />
      </div>
    </section>
  )
}
