import { describe, expect, it } from 'vitest'
import { normalizeModel } from '~/composables/useResumeDocumentState'
import { RESUME_LAYOUTS } from '~/constants/resumeLayouts'
import { RESUME_SKIN_IDS } from '~/constants/resumeSkins'

describe('resume document normalization combinations', () => {
  it('normalizes without crash for all 90 layout × skin combinations', () => {
    let normalized = 0

    for (const layout of RESUME_LAYOUTS) {
      for (const skinId of RESUME_SKIN_IDS) {
        const model = normalizeModel({
          presetId: 'socle-classic',
          sectionOrder: [
            { key: 'experience', region: 'main', order: 0, variant: 'classic' },
            { key: 'education', region: 'main', order: 1, variant: 'classic' },
            { key: 'project', region: 'main', order: 2, variant: 'classic' },
          ],
          style: {
            layoutMode: layout.structure,
            palette: skinId,
          },
        }, 'socle-classic')

        expect(model.style.layoutMode).toBe(layout.structure)
        expect(model.sectionOrder).toHaveLength(8)
        normalized += 1
      }
    }

    expect(normalized).toBe(90)
  })
})
