import { SECTION_TITLES } from './i18n.ts'
import type { CV } from './types.ts'
import { emptyLoc, uid } from './types.ts'

export const defaultTheme = (): CV['theme'] => ({
  accent: '#1f4e79',
  font: 'Helvetica',
  fontSize: 10,
  lineHeight: 1.35,
  margin: 44,
  showPageNumbers: false,
})

/** Shown on first run so the preview is never an empty page. */
export function sampleCv(): CV {
  return {
    version: 1,
    personal: {
      fullName: 'Ola Nordmann',
      headline: { en: 'Software Engineer', no: 'Systemutvikler' },
      email: 'ola@example.com',
      phone: '+47 400 00 000',
      location: { en: 'Oslo, Norway', no: 'Oslo, Norge' },
      website: '',
      linkedin: 'linkedin.com/in/olanordmann',
      github: 'github.com/olanordmann',
      summary: {
        en: 'Engineer with a background in distributed systems and a habit of shipping small, well-tested changes.',
        no: 'Utvikler med bakgrunn fra distribuerte systemer og vane for å levere små, godt testede endringer.',
      },
    },
    sections: [
      {
        id: uid(),
        kind: 'experience',
        title: SECTION_TITLES.experience,
        visible: true,
        entries: [
          {
            id: uid(),
            role: { en: 'Backend Developer', no: 'Backendutvikler' },
            organization: 'Eksempel AS',
            location: 'Oslo',
            start: '2023-08',
            end: '',
            current: true,
            summary: emptyLoc(),
            bullets: [
              {
                en: 'Rebuilt the billing pipeline, cutting month-end processing from 6 hours to 20 minutes.',
                no: 'Bygget om faktureringsflyten og kuttet månedskjøringen fra 6 timer til 20 minutter.',
              },
              {
                en: 'Mentored two interns through their first production deploys.',
                no: 'Veiledet to sommerstudenter gjennom deres første produksjonsleveranser.',
              },
            ],
            tags: [],
            visible: true,
          },
        ],
      },
      {
        id: uid(),
        kind: 'education',
        title: SECTION_TITLES.education,
        visible: true,
        entries: [
          {
            id: uid(),
            role: { en: 'MSc Computer Science', no: 'Master i informatikk' },
            organization: 'NTNU',
            location: 'Trondheim',
            start: '2018',
            end: '2023',
            current: false,
            summary: {
              en: 'Specialisation in databases and search.',
              no: 'Spesialisering i databaser og søk.',
            },
            bullets: [],
            tags: [],
            visible: true,
          },
        ],
      },
      {
        id: uid(),
        kind: 'verv',
        title: SECTION_TITLES.verv,
        visible: true,
        entries: [
          {
            id: uid(),
            role: { en: 'Board Member', no: 'Styremedlem' },
            organization: 'Studentersamfundet',
            location: 'Trondheim',
            start: '2021',
            end: '2022',
            current: false,
            summary: {
              en: 'Ran the volunteer budget for a 200-person organisation.',
              no: 'Hadde ansvar for frivillighetsbudsjettet i en organisasjon med 200 medlemmer.',
            },
            bullets: [],
            tags: [],
            visible: true,
          },
        ],
      },
      {
        id: uid(),
        kind: 'skills',
        title: SECTION_TITLES.skills,
        visible: true,
        entries: [
          {
            id: uid(),
            role: { en: 'Languages', no: 'Språk' },
            organization: '',
            location: '',
            start: '',
            end: '',
            current: false,
            summary: emptyLoc(),
            bullets: [],
            tags: ['TypeScript', 'Go', 'Python', 'SQL'],
            visible: true,
          },
          {
            id: uid(),
            role: { en: 'Spoken', no: 'Muntlig' },
            organization: '',
            location: '',
            start: '',
            end: '',
            current: false,
            summary: emptyLoc(),
            bullets: [],
            tags: ['Norsk (morsmål)', 'English (fluent)'],
            visible: true,
          },
        ],
      },
    ],
    theme: defaultTheme(),
  }
}

export function blankCv(): CV {
  return {
    version: 1,
    personal: {
      fullName: '',
      headline: emptyLoc(),
      email: '',
      phone: '',
      location: emptyLoc(),
      website: '',
      linkedin: '',
      github: '',
      summary: emptyLoc(),
    },
    sections: [],
    theme: defaultTheme(),
  }
}
