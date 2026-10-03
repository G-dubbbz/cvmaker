import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import { formatRange, pageLabel, t } from '../i18n.ts'
import type { CV, Entry, Lang, Section, Theme } from '../types.ts'

// Default hyphenation breaks Norwegian compounds in odd places; whole words
// with a ragged right edge read better on a CV.
Font.registerHyphenationCallback((word) => [word])

const bold = (f: Theme['font']) => (f === 'Times-Roman' ? 'Times-Bold' : 'Helvetica-Bold')
const italic = (f: Theme['font']) =>
  f === 'Times-Roman' ? 'Times-Italic' : 'Helvetica-Oblique'

const INK = '#16181d'
const MUTED = '#5c6470'
const RULE = '#d7dbe0'

function makeStyles(theme: Theme) {
  const { fontSize: fs, accent, font } = theme
  // Line height is applied per text style rather than on the page, for two
  // reasons: an inherited page-level lineHeight stops react-pdf from laying out
  // `fixed` elements that use a `render` callback (it silently drops the page
  // footer), and a unitless lineHeight is only resolved against the element's
  // own fontSize. Every style below that sets `lineHeight` therefore also sets
  // `fontSize` explicitly — without it the spacing is computed off an 18pt
  // default instead of the CV's body size.
  const lh = theme.lineHeight
  return StyleSheet.create({
    page: {
      paddingTop: theme.margin,
      paddingBottom: theme.margin,
      paddingHorizontal: theme.margin,
      fontFamily: font,
      fontSize: fs,
      color: INK,
    },
    name: { fontFamily: bold(font), fontSize: fs * 2.1, lineHeight: 1.2, letterSpacing: -0.4 },
    headline: {
      fontFamily: italic(font),
      fontSize: fs * 1.1,
      lineHeight: 1.3,
      color: accent,
      marginTop: 4,
    },
    contact: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
    contactItem: { flexDirection: 'row' },
    contactText: { fontSize: fs * 0.92, lineHeight: lh, color: MUTED, textDecoration: 'none' },
    contactSep: { fontSize: fs * 0.92, lineHeight: lh, color: RULE, paddingHorizontal: 7 },
    headerRule: { borderBottomWidth: 1.2, borderBottomColor: accent, marginTop: 10 },
    summary: { fontSize: fs, lineHeight: lh, marginTop: 10 },

    section: { marginTop: 16 },
    sectionTitle: {
      fontFamily: bold(font),
      fontSize: fs * 0.95,
      letterSpacing: 1.1,
      color: accent,
      textTransform: 'uppercase',
    },
    sectionRule: { borderBottomWidth: 0.6, borderBottomColor: RULE, marginTop: 3 },

    entry: { marginTop: 9 },
    entryTop: { flexDirection: 'row', justifyContent: 'space-between' },
    role: { fontFamily: bold(font), fontSize: fs, lineHeight: lh, flexShrink: 1, paddingRight: 10 },
    dates: { color: MUTED, fontSize: fs * 0.92, lineHeight: lh, flexShrink: 0 },
    org: { color: MUTED, fontSize: fs * 0.95, lineHeight: lh, marginTop: 1 },
    entryText: { fontSize: fs, lineHeight: lh, marginTop: 3 },

    bulletRow: { flexDirection: 'row', marginTop: 2.5 },
    bulletDot: { width: 10, fontSize: fs, lineHeight: lh, color: accent },
    bulletText: { flex: 1, fontSize: fs, lineHeight: lh },

    tags: { fontSize: fs * 0.95, lineHeight: lh, marginTop: 2, color: MUTED },

    skillRow: { flexDirection: 'row', marginTop: 4 },
    skillLabel: { fontFamily: bold(font), fontSize: fs, lineHeight: lh, width: '26%', paddingRight: 8 },
    skillItems: { flex: 1, fontSize: fs, lineHeight: lh },

    footer: {
      position: 'absolute',
      bottom: theme.margin / 2,
      left: theme.margin,
      right: theme.margin,
      textAlign: 'center',
      fontSize: fs * 0.82,
      color: MUTED,
    },
  })
}

type Styles = ReturnType<typeof makeStyles>

const href = (value: string, kind: 'mail' | 'web'): string => {
  if (kind === 'mail') return `mailto:${value}`
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function ContactLine({ cv, lang, s }: { cv: CV; lang: Lang; s: Styles }) {
  const p = cv.personal
  const parts: Array<{ text: string; link?: string }> = []
  if (p.email.trim()) parts.push({ text: p.email.trim(), link: href(p.email.trim(), 'mail') })
  if (p.phone.trim()) parts.push({ text: p.phone.trim() })
  if (t(p.location, lang)) parts.push({ text: t(p.location, lang) })
  for (const v of [p.website, p.linkedin, p.github]) {
    const value = v.trim()
    if (value) parts.push({ text: value.replace(/^https?:\/\//i, ''), link: href(value, 'web') })
  }
  if (parts.length === 0) return null
  // A wrapping row rather than one long string: each item carries its own
  // leading separator inside an atomic cell, so a contact line too long for one
  // line breaks *between* items and never strands a separator at a line end.
  return (
    <View style={s.contact}>
      {parts.map((part, i) => (
        <View key={i} style={s.contactItem} wrap={false}>
          {i > 0 ? <Text style={s.contactSep}>·</Text> : null}
          {part.link ? (
            <Link src={part.link} style={s.contactText}>
              {part.text}
            </Link>
          ) : (
            <Text style={s.contactText}>{part.text}</Text>
          )}
        </View>
      ))}
    </View>
  )
}

function EntryBody({ entry, lang, s }: { entry: Entry; lang: Lang; s: Styles }) {
  const summary = t(entry.summary, lang)
  const bullets = entry.bullets.map((b) => t(b, lang)).filter(Boolean)
  const tags = entry.tags.map((x) => x.trim()).filter(Boolean)
  return (
    <>
      {summary ? <Text style={s.entryText}>{summary}</Text> : null}
      {bullets.map((b, i) => (
        <View key={i} style={s.bulletRow}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>{b}</Text>
        </View>
      ))}
      {tags.length > 0 ? <Text style={s.tags}>{tags.join(' · ')}</Text> : null}
    </>
  )
}

function DatedEntry({ entry, lang, s }: { entry: Entry; lang: Lang; s: Styles }) {
  const role = t(entry.role, lang)
  const dates = formatRange(entry.start, entry.end, entry.current, lang)
  const org = [entry.organization.trim(), entry.location.trim()].filter(Boolean).join(' · ')
  // Short entries stay whole across a page break; long ones may split rather
  // than risk being pushed off a page entirely.
  const keepTogether = entry.bullets.length <= 6
  return (
    <View style={s.entry} wrap={!keepTogether} minPresenceAhead={30}>
      {role || dates ? (
        <View style={s.entryTop}>
          <Text style={s.role}>{role}</Text>
          {dates ? <Text style={s.dates}>{dates}</Text> : null}
        </View>
      ) : null}
      {org ? <Text style={s.org}>{org}</Text> : null}
      <EntryBody entry={entry} lang={lang} s={s} />
    </View>
  )
}

function SkillEntry({ entry, lang, s }: { entry: Entry; lang: Lang; s: Styles }) {
  const label = t(entry.role, lang)
  // Skill items are translated (stored in `summary`), because lists like
  // "Serverdrift" or "Norsk, Engelsk" differ per language. `tags` is kept as a
  // fallback so entries written before items were translatable still render.
  const translated = t(entry.summary, lang)
  const shared = entry.tags.map((x) => x.trim()).filter(Boolean).join(', ')
  return (
    <View style={s.skillRow} wrap={false}>
      <Text style={s.skillLabel}>{label}</Text>
      <Text style={s.skillItems}>{translated || shared}</Text>
    </View>
  )
}

function TextEntry({ entry, lang, s }: { entry: Entry; lang: Lang; s: Styles }) {
  const heading = t(entry.role, lang)
  return (
    <View style={s.entry} minPresenceAhead={30}>
      {heading ? <Text style={s.role}>{heading}</Text> : null}
      <EntryBody entry={entry} lang={lang} s={s} />
    </View>
  )
}

/** True when an entry would render nothing at all in this language. */
function isEmpty(entry: Entry, lang: Lang): boolean {
  return (
    !t(entry.role, lang) &&
    !entry.organization.trim() &&
    !t(entry.summary, lang) &&
    !entry.start.trim() &&
    !entry.end.trim() &&
    entry.bullets.every((b) => !t(b, lang)) &&
    entry.tags.every((x) => !x.trim())
  )
}

function SectionBlock({ section, lang, s }: { section: Section; lang: Lang; s: Styles }) {
  const entries = section.entries.filter((e) => e.visible && !isEmpty(e, lang))
  if (entries.length === 0) return null
  const title = t(section.title, lang)
  return (
    <View style={s.section} break={false}>
      {title ? (
        <View minPresenceAhead={48}>
          <Text style={s.sectionTitle}>{title}</Text>
          <View style={s.sectionRule} />
        </View>
      ) : null}
      {entries.map((entry) =>
        section.kind === 'skills' ? (
          <SkillEntry key={entry.id} entry={entry} lang={lang} s={s} />
        ) : section.kind === 'text' ? (
          <TextEntry key={entry.id} entry={entry} lang={lang} s={s} />
        ) : (
          <DatedEntry key={entry.id} entry={entry} lang={lang} s={s} />
        ),
      )}
    </View>
  )
}

export function CvDocument({ cv, lang }: { cv: CV; lang: Lang }) {
  const s = makeStyles(cv.theme)
  const p = cv.personal
  const headline = t(p.headline, lang)
  const summary = t(p.summary, lang)
  const title = [p.fullName.trim() || 'CV', lang === 'no' ? 'CV' : 'CV'].join(' – ')

  return (
    <Document title={title} author={p.fullName.trim()} language={lang}>
      <Page size="A4" style={s.page}>
        <View>
          {p.fullName.trim() ? <Text style={s.name}>{p.fullName.trim()}</Text> : null}
          {headline ? <Text style={s.headline}>{headline}</Text> : null}
          <ContactLine cv={cv} lang={lang} s={s} />
          <View style={s.headerRule} />
          {summary ? <Text style={s.summary}>{summary}</Text> : null}
        </View>

        {cv.sections
          .filter((section) => section.visible)
          .map((section) => (
            <SectionBlock key={section.id} section={section} lang={lang} s={s} />
          ))}

        {cv.theme.showPageNumbers ? (
          <Text
            style={s.footer}
            fixed
            render={({ pageNumber, totalPages }) => pageLabel(pageNumber, totalPages, lang)}
          />
        ) : null}
      </Page>
    </Document>
  )
}
