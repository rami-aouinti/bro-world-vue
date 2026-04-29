import { describe, expect, it } from 'vitest'
import { RESUME_LAYOUTS } from '~/constants/resumeLayouts'
import { RESUME_SECTION_REGISTRY } from '~/constants/resumeSectionRegistry'

describe('resume layouts integrity', () => {
  it('contains exactly 9 layouts', () => {
    expect(RESUME_LAYOUTS).toHaveLength(9)
  })

  it('contains a 3/3/3 structure split', () => {
    const counts = RESUME_LAYOUTS.reduce<Record<string, number>>((acc, layout) => {
      acc[layout.structure] = (acc[layout.structure] ?? 0) + 1
      return acc
    }, {})

    expect(counts['no-aside']).toBe(3)
    expect(counts['aside-left']).toBe(3)
    expect(counts['aside-right']).toBe(3)
  })

  it('only uses sections declared in resumeSectionRegistry', () => {
    const known = new Set(Object.keys(RESUME_SECTION_REGISTRY))
    for (const layout of RESUME_LAYOUTS) {
      for (const sectionKey of [...layout.zones.main, ...layout.zones.aside]) {
        expect(known.has(sectionKey), `${layout.layoutId}: unknown section ${sectionKey}`).toBe(true)
      }

      for (const rule of layout.fallbackRules) {
        expect(known.has(rule.section), `${layout.layoutId}: unknown fallback section ${rule.section}`).toBe(true)
      }
    }
  })
})
