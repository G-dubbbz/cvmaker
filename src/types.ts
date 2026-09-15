export type Lang = 'en' | 'no'

export const LANGS: Lang[] = ['en', 'no']

/** A string that exists in both languages. */
export interface Loc {
  en: string
  no: string
}

export const emptyLoc = (): Loc => ({ en: '', no: '' })

/**
 * Section kinds change how entries are laid out in the PDF, not what they can
 * hold. `skills` renders as "Label: a, b, c"; `text` renders a single prose
 * block; everything else uses the dated role/organization layout.
 */
export type SectionKind =
  | 'experience'
  | 'education'
  | 'verv'
  | 'projects'
  | 'skills'
  | 'text'

export interface Entry {
  id: string
  /** Job title, degree, role in the organisation, project name, skill group. */
  role: Loc
  /** Company / school / organisation. Not translated — proper nouns. */
  organization: string
  location: string
  /** `YYYY-MM`, `YYYY`, or free text. */
  start: string
  end: string
  /** When true the end date renders as "Present" / "nå". */
  current: boolean
  summary: Loc
  bullets: Loc[]
  /** Comma-separated items for `skills`; keyword chips elsewhere. */
  tags: string[]
  visible: boolean
}

export interface Section {
  id: string
  kind: SectionKind
  title: Loc
  entries: Entry[]
  visible: boolean
}

export interface Personal {
  fullName: string
  headline: Loc
  email: string
  phone: string
  location: Loc
  website: string
  linkedin: string
  github: string
  summary: Loc
}

export interface Theme {
  accent: string
  font: 'Helvetica' | 'Times-Roman'
  fontSize: number
  lineHeight: number
  margin: number
  showPageNumbers: boolean
}

export interface CV {
  version: 1
  personal: Personal
  sections: Section[]
  theme: Theme
}

export const uid = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export const newEntry = (): Entry => ({
  id: uid(),
  role: emptyLoc(),
  organization: '',
  location: '',
  start: '',
  end: '',
  current: false,
  summary: emptyLoc(),
  bullets: [],
  tags: [],
  visible: true,
})

export const newSection = (kind: SectionKind, title: Loc): Section => ({
  id: uid(),
  kind,
  title,
  entries: [newEntry()],
  visible: true,
})
