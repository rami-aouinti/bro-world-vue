import { describe, expect, it } from 'vitest'
import { RESUME_LAYOUTS } from '~/constants/resumeLayouts'
import { RESUME_SKIN_IDS } from '~/constants/resumeSkins'
import { resolveRuntimeLayoutAndSkin } from '~/composables/useResumeTemplateRuntime'

describe('resume layout + skin combinations', () => {
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
