import { describe, expect, it } from 'vitest'
import { RESUME_LAYOUTS } from '~/constants/resumeLayouts'
import { RESUME_SECTION_REGISTRY } from '~/constants/resumeSectionRegistry'
import {
  ALL_RESUME_DOCUMENT_TEMPLATES_CATALOG,
  RESUME_LAYOUTS_CATALOG,
} from '~/constants/resumeTemplates.catalog'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

describe('resume layouts integrity', () => {
  it('contains exactly 9 runtime layouts', () => {
    expect(RESUME_LAYOUTS).toHaveLength(9)
  })

  it('contains exactly 12 catalog layouts', () => {
    expect(RESUME_LAYOUTS_CATALOG).toHaveLength(12)
  })

  it('contains a 3/3/3 runtime structure split', () => {
    const counts = RESUME_LAYOUTS.reduce<Record<string, number>>(
      (acc, layout) => {
        acc[layout.structure] = (acc[layout.structure] ?? 0) + 1
        return acc
      },
      {},
    )

    expect(counts['no-aside']).toBe(3)
    expect(counts['aside-left']).toBe(3)
    expect(counts['aside-right']).toBe(3)
  })

  it('contains a 4/4/4 catalog structure split', () => {
    const counts = RESUME_LAYOUTS_CATALOG.reduce<Record<string, number>>(
      (acc, layout) => {
        acc[layout.structureId] = (acc[layout.structureId] ?? 0) + 1
        return acc
      },
      {},
    )

    expect(counts['no-aside']).toBe(4)
    expect(counts['aside-left']).toBe(4)
    expect(counts['aside-right']).toBe(4)
  })

  it('only uses sections declared in resumeSectionRegistry', () => {
    const known = new Set(Object.keys(RESUME_SECTION_REGISTRY))
    for (const layout of RESUME_LAYOUTS) {
      for (const sectionKey of [...layout.zones.main, ...layout.zones.aside]) {
        expect(
          known.has(sectionKey),
          `${layout.layoutId}: unknown section ${sectionKey}`,
        ).toBe(true)
      }

      for (const rule of layout.fallbackRules) {
        expect(
          known.has(rule.section),
          `${layout.layoutId}: unknown fallback section ${rule.section}`,
        ).toBe(true)
      }
    }
  })

  it('manual catalog templates reference an existing preview image in public/img/cv', () => {
    const manualTemplates = ALL_RESUME_DOCUMENT_TEMPLATES_CATALOG.filter(
      (template) => !template.id.includes('layout-'),
    )

    for (const template of manualTemplates) {
      const diskPath = resolve(process.cwd(), `public${template.image}`)
      expect(
        existsSync(diskPath),
        `${template.id}: missing image ${template.image}`,
      ).toBe(true)
    }
  })

  it('catalog layouts keep one unique ordered entry per section key', () => {
    for (const layout of RESUME_LAYOUTS_CATALOG) {
      const keys = layout.sections.map(({ section }) => section)
      const unique = new Set(keys)
      expect(unique.size, `${layout.id}: duplicate section`).toBe(keys.length)
      expect(unique.size, `${layout.id}: unexpected section count`).toBe(8)

      const orderByZone = layout.sections.reduce<
        Record<'main' | 'aside', number[]>
      >(
        (acc, section) => {
          acc[section.zone].push(section.order)
          return acc
        },
        { main: [], aside: [] },
      )

      expect(orderByZone.main).toEqual(
        [...orderByZone.main].sort((a, b) => a - b),
      )
      expect(orderByZone.aside).toEqual(
        [...orderByZone.aside].sort((a, b) => a - b),
      )
    }
  })
})
