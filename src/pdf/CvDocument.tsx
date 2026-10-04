import {
  Document,
  Font,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
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
    contactIconLink: { flexDirection: 'row', alignItems: 'center', textDecoration: 'none' },
    contactIcon: { width: fs * 0.88, height: fs * 0.88, marginRight: 3.5, marginBottom: fs * 0.1 },
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

// Brand marks from simple-icons (CC0), drawn on a 24×24 grid.
const ICON = {
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
}

const bare = (url: string): string => url.replace(/^https?:\/\//i, '')

/** The site's own name for a personal website: host only, no `www.` or path. */
const host = (url: string): string => bare(url).replace(/^www\./i, '').split(/[/?#]/)[0]

function ContactLine({ cv, lang, s }: { cv: CV; lang: Lang; s: Styles }) {
  const p = cv.personal
  const short = cv.theme.shortLinks
  const parts: Array<{ text: string; link?: string; icon?: string }> = []
  if (p.email.trim()) parts.push({ text: p.email.trim(), link: href(p.email.trim(), 'mail') })
  if (p.phone.trim()) parts.push({ text: p.phone.trim() })
  if (t(p.location, lang)) parts.push({ text: t(p.location, lang) })
  const web: Array<[string, (url: string) => string, string?]> = [
    [p.website, host],
    [p.linkedin, () => 'LinkedIn', ICON.linkedin],
    [p.github, () => 'GitHub', ICON.github],
  ]
  for (const [v, label, icon] of web) {
    const value = v.trim()
    if (!value) continue
    parts.push({ text: short ? label(value) : bare(value), link: href(value, 'web'), icon })
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
          {part.link && part.icon ? (
            <Link src={part.link} style={s.contactIconLink}>
              <Svg viewBox="0 0 24 24" style={s.contactIcon}>
                <Path d={part.icon} fill={MUTED} />
              </Svg>
              <Text style={s.contactText}>{part.text}</Text>
            </Link>
          ) : part.link ? (
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
