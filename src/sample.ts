import type { CV } from './types.ts'
import { emptyLoc } from './types.ts'

export const defaultTheme = (): CV['theme'] => ({
  accent: '#1f4e79',
  font: 'Helvetica',
  fontSize: 10,
  lineHeight: 1.35,
  margin: 44,
  showPageNumbers: false,
  shortLinks: true,
})

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
