import type { Lang, Loc, SectionKind } from './types.ts'

const MONTHS: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  no: ['jan.', 'feb.', 'mars', 'apr.', 'mai', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'],
}

const PRESENT: Record<Lang, string> = { en: 'Present', no: 'nå' }

export const LANG_LABEL: Record<Lang, string> = { en: 'English', no: 'Norsk' }

/** Read one language out of a Loc, trimmed. */
export const t = (loc: Loc | undefined, lang: Lang): string => (loc ? loc[lang].trim() : '')

/**
 * Format `YYYY-MM` / `YYYY` for the given language. Anything that does not
 * parse is passed through untouched, so free text like "Summer 2024" works.
 */
export function formatDate(value: string, lang: Lang): string {
  const raw = value.trim()
  if (!raw) return ''
  const ym = /^(\d{4})-(\d{1,2})$/.exec(raw)
  if (ym) {
    const month = Number(ym[2])
    if (month >= 1 && month <= 12) return `${MONTHS[lang][month - 1]} ${ym[1]}`
  }
  return raw
}

/** "Aug 2023 – Present", "2019 – 2022", or a single date when only one is set. */
export function formatRange(
  start: string,
  end: string,
  current: boolean,
  lang: Lang,
): string {
  const from = formatDate(start, lang)
  const to = current ? PRESENT[lang] : formatDate(end, lang)
  if (from && to) return `${from} – ${to}`
  return from || to
}

export function pageLabel(page: number, total: number, lang: Lang): string {
  return lang === 'no' ? `Side ${page} av ${total}` : `Page ${page} of ${total}`
}

/** Default heading for a new section, in both languages. */
export const SECTION_TITLES: Record<SectionKind, Loc> = {
  experience: { en: 'Experience', no: 'Arbeidserfaring' },
  education: { en: 'Education', no: 'Utdanning' },
  verv: { en: 'Positions of Trust', no: 'Verv' },
  projects: { en: 'Projects', no: 'Prosjekter' },
  skills: { en: 'Skills', no: 'Ferdigheter' },
  text: { en: 'About', no: 'Om meg' },
}

export const KIND_LABEL: Record<SectionKind, string> = {
  experience: 'Experience',
  education: 'Education',
  verv: 'Verv / positions of trust',
  projects: 'Projects',
  skills: 'Skills (inline list)',
  text: 'Free text',
}

/** Field labels shown in the editor, per section kind. */
export const ROLE_LABEL: Record<SectionKind, string> = {
  experience: 'Job title',
  education: 'Degree / programme',
  verv: 'Role',
  projects: 'Project',
  skills: 'Group label',
  text: 'Heading (optional)',
}

export const ORG_LABEL: Record<SectionKind, string> = {
  experience: 'Company',
  education: 'Institution',
  verv: 'Organisation',
  projects: 'Client / context',
  skills: '',
  text: '',
}
