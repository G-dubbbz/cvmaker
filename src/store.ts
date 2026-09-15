import { useCallback, useEffect, useRef, useState } from 'react'
import { defaultTheme, sampleCv } from './sample.ts'
import type { CV, Entry, Section } from './types.ts'

const KEY = 'cvmaker:cv:v1'

/**
 * Fill in anything a hand-edited or older JSON file is missing, so importing a
 * partial file can never crash the renderer.
 */
export function normalize(input: unknown): CV {
  const raw = (input ?? {}) as Partial<CV>
  const p = (raw.personal ?? {}) as Partial<CV['personal']>
  const loc = (v: unknown) => {
    const o = (v ?? {}) as { en?: unknown; no?: unknown }
    return { en: String(o.en ?? ''), no: String(o.no ?? '') }
  }
  return {
    version: 1,
    personal: {
      fullName: String(p.fullName ?? ''),
      headline: loc(p.headline),
      email: String(p.email ?? ''),
      phone: String(p.phone ?? ''),
      location: loc(p.location),
      website: String(p.website ?? ''),
      linkedin: String(p.linkedin ?? ''),
      github: String(p.github ?? ''),
      summary: loc(p.summary),
    },
    sections: (Array.isArray(raw.sections) ? raw.sections : []).map(
      (s: Partial<Section>, i): Section => ({
        id: String(s.id ?? `s${i}`),
        kind: s.kind ?? 'experience',
        title: loc(s.title),
        visible: s.visible !== false,
        entries: (Array.isArray(s.entries) ? s.entries : []).map(
          (e: Partial<Entry>, j): Entry => ({
            id: String(e.id ?? `s${i}e${j}`),
            role: loc(e.role),
            organization: String(e.organization ?? ''),
            location: String(e.location ?? ''),
            start: String(e.start ?? ''),
            end: String(e.end ?? ''),
            current: Boolean(e.current),
            summary: loc(e.summary),
            bullets: (Array.isArray(e.bullets) ? e.bullets : []).map(loc),
            tags: (Array.isArray(e.tags) ? e.tags : []).map((x) => String(x)),
            visible: e.visible !== false,
          }),
        ),
      }),
    ),
    theme: { ...defaultTheme(), ...(raw.theme ?? {}) },
  }
}

function load(): CV {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored) return normalize(JSON.parse(stored))
  } catch {
    // Corrupt or unreadable storage: fall through to the sample CV.
  }
  return sampleCv()
}

export interface Store {
  cv: CV
  /** Mutate a structural clone of the CV; the draft is safe to edit in place. */
  update: (recipe: (draft: CV) => void) => void
  replace: (next: CV) => void
  undo: () => void
  canUndo: boolean
}

export function useCvStore(): Store {
  const [cv, setCv] = useState<CV>(load)
  const history = useRef<CV[]>([])
  const [canUndo, setCanUndo] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(cv))
      } catch {
        // Quota exceeded or storage disabled — editing still works in-memory.
      }
    }, 300)
    return () => clearTimeout(id)
  }, [cv])

  const push = useCallback((prev: CV) => {
    history.current = [...history.current.slice(-49), prev]
    setCanUndo(true)
  }, [])

  const update = useCallback(
    (recipe: (draft: CV) => void) => {
      setCv((prev) => {
        push(prev)
        const draft = structuredClone(prev)
        recipe(draft)
        return draft
      })
    },
    [push],
  )

  const replace = useCallback(
    (next: CV) => {
      setCv((prev) => {
        push(prev)
        return next
      })
    },
    [push],
  )

  const undo = useCallback(() => {
    setCv((prev) => {
      const last = history.current.pop()
      setCanUndo(history.current.length > 0)
      return last ?? prev
    })
  }, [])

  return { cv, update, replace, undo, canUndo }
}

/** Move an item within an array by `delta`, clamped to the bounds. */
export function move<T>(list: T[], index: number, delta: number): void {
  const target = index + delta
  if (target < 0 || target >= list.length) return
  const [item] = list.splice(index, 1)
  list.splice(target, 0, item)
}
