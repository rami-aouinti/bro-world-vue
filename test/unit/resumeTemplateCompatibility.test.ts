import { describe, expect, it } from 'vitest'
import { resolveCompatibilityTemplateConfig } from '../../app/modules/resume/template/templateCompatibility'

describe('resume template compatibility mapping', () => {
  it('maps pilot legacy templates to templateConfig', () => {
    expect(resolveCompatibilityTemplateConfig('classic')?.skinId).toBe(
      'skin-classic',
    )
    expect(resolveCompatibilityTemplateConfig('fugo')?.layoutId).toBe(
      'layout-aside-right-b',
    )
    expect(resolveCompatibilityTemplateConfig('minimal')?.structureId).toBe(
      'no-aside',
    )
  })

  it('returns null for unknown legacy template id', () => {
    expect(resolveCompatibilityTemplateConfig('unknown')).toBeNull()
  })
})
