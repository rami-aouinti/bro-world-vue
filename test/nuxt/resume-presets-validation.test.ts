import { describe, expect, it } from 'vitest'
import {
  RESUME_BASE_PRESETS,
  RESUME_COMPOSED_PRESET_METADATA,
  RESUME_STYLE_PACKS,
} from '~/constants/resumePresets'
import { RESUME_TEMPLATES_CATALOG } from '~/constants/resumeTemplates.catalog'
import type { ResumeTemplateConfig } from '~/types/resumeTemplateConfig'

describe('resume presets static validation', () => {
  it('exposes normalized metadata for 90 presets', () => {
    expect(RESUME_BASE_PRESETS).toHaveLength(10)
    expect(RESUME_STYLE_PACKS).toHaveLength(10)
    expect(RESUME_COMPOSED_PRESET_METADATA).toHaveLength(90)

    for (const preset of RESUME_COMPOSED_PRESET_METADATA) {
      expect(preset.id.length).toBeGreaterThan(0)
      expect(preset.name.length).toBeGreaterThan(0)
      expect(preset.thumbnail.startsWith('/img/cv/')).toBe(true)
      expect(preset.tags.length).toBeGreaterThan(0)
      expect(preset.version).toMatch(/^\d+\.\d+\.\d+$/)
    }
  })

  it('keeps every composed preset mapped to a valid ResumeTemplateConfig', () => {
    const resumeTemplates = RESUME_TEMPLATES_CATALOG.filter(
      (template): template is ResumeTemplateConfig =>
        template.type === 'resume',
    )
    const templateByPresetId = new Map(
      resumeTemplates.map((template) => [template.presetId, template]),
    )

    for (const preset of RESUME_COMPOSED_PRESET_METADATA) {
      const template = templateByPresetId.get(preset.id)
      expect(template, `missing template for preset ${preset.id}`).toBeDefined()
      expect(template?.id).toBe(preset.id)
      expect(template?.label).toBe(preset.name)
      expect(template?.image).toBe(preset.thumbnail)
    }
  })
})
