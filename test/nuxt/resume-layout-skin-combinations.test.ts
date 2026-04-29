import { describe, expect, it } from 'vitest'
import { RESUME_LAYOUTS } from '~/constants/resumeLayouts'
import { RESUME_SKIN_IDS } from '~/constants/resumeSkins'
import { resolveRuntimeLayoutAndSkin } from '~/composables/useResumeTemplateRuntime'
import {
  RESUME_LAYOUTS_CATALOG,
  RESUME_SKINS_CATALOG,
  RESUME_STRUCTURES_CATALOG,
  RESUME_TEMPLATES_CATALOG,
} from '~/constants/resumeTemplates.catalog'

describe('resume layout + skin combinations', () => {
  it('contains 3 structures, 9 layouts, 10 CV skins, and 90 generated CV templates', () => {
    const resumeTemplates = RESUME_TEMPLATES_CATALOG.filter(({ type }) => type === 'resume')

    expect(RESUME_STRUCTURES_CATALOG).toHaveLength(3)
    expect(RESUME_LAYOUTS_CATALOG).toHaveLength(9)
    expect(RESUME_SKINS_CATALOG).toHaveLength(10)
    expect(resumeTemplates).toHaveLength(90)
  })

  it('contains a 3 layouts per structure split', () => {
    const counts = RESUME_LAYOUTS_CATALOG.reduce<Record<string, number>>((acc, layout) => {
      acc[layout.structureId] = (acc[layout.structureId] ?? 0) + 1
      return acc
    }, {})

    for (const structure of RESUME_STRUCTURES_CATALOG) {
      expect(counts[structure.id]).toBe(3)
    }
  })

  it('keeps resume template references valid (layoutId/skinId/structure compatibility)', () => {
    const layoutsById = new Map(RESUME_LAYOUTS_CATALOG.map((layout) => [layout.id, layout]))
    const skinsById = new Set(RESUME_SKINS_CATALOG.map((skin) => skin.id))

    for (const template of RESUME_TEMPLATES_CATALOG.filter(({ type }) => type === 'resume')) {
      const layout = layoutsById.get(template.layoutId)
      expect(layout, `${template.id}: unknown layoutId \"${template.layoutId}\"`).toBeDefined()
      expect(skinsById.has(template.skinId), `${template.id}: unknown skinId \"${template.skinId}\"`).toBe(true)
      expect(layout?.structureId, `${template.id}: structure/layout mismatch`).toBe(template.structureId)
    }
  })

  it('generates 9 layouts × 10 skins without crash', () => {
    expect(RESUME_LAYOUTS).toHaveLength(9)
    expect(RESUME_SKIN_IDS).toHaveLength(10)

    let generated = 0
    for (const layout of RESUME_LAYOUTS) {
      for (const skinId of RESUME_SKIN_IDS) {
        const runtime = resolveRuntimeLayoutAndSkin(layout.layoutId, skinId)
        expect((runtime.layout as { layoutId?: string; id?: string }).layoutId ?? (runtime.layout as { id?: string }).id).toBe(layout.layoutId)
        expect(runtime.skin.id).toBe(skinId)
        generated += 1
      }
    }

    expect(generated).toBe(90)
  })
})
