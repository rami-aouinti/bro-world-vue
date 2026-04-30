import { describe, expect, it } from 'vitest'
import {
  RESUME_SECTION_REGISTRY,
  validateResumeSectionVariantSupportMatrix,
} from '~/constants/resumeSectionRegistry'
import {
  RESUME_RENDERER_VARIANTS_BY_SECTION,
  RESUME_SHARED_TEMPLATE_VARIANTS_BY_SECTION,
} from '~/constants/resumeVariantSupportMatrix'

describe('resume section variant support matrix', () => {
  it('keeps registry and renderer variants aligned', () => {
    const result = validateResumeSectionVariantSupportMatrix(
      RESUME_RENDERER_VARIANTS_BY_SECTION,
    )

    expect(result).toEqual({ valid: true, mismatches: [] })
  })

  it('keeps shared template variants within registry-exposed variants', () => {
    for (const [sectionKey, variants] of Object.entries(
      RESUME_SHARED_TEMPLATE_VARIANTS_BY_SECTION,
    )) {
      const exposed = new Set(
        RESUME_SECTION_REGISTRY[
          sectionKey as keyof typeof RESUME_SECTION_REGISTRY
        ].variants.map((variant) => variant.value),
      )

      for (const variant of variants) {
        expect(exposed.has(variant)).toBe(true)
      }
    }
  })
})
