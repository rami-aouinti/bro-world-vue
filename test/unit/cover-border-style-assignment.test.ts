import { describe, expect, it } from 'vitest'
import GENERATED_COVER_PAGE_TEMPLATES from '../../app/data/resume-templates/generated-20-cover-page.json'
import GENERATED_COVER_LETTER_TEMPLATES from '../../app/data/resume-templates/generated-20-cover-letter.json'
import { COVER_BORDER_STYLE_BY_ID } from '../../app/constants/coverBorderStyles'

const allGeneratedCoverTemplates = [
  ...GENERATED_COVER_PAGE_TEMPLATES,
  ...GENERATED_COVER_LETTER_TEMPLATES,
]

describe('generated cover border style assignments', () => {
  it('assigns a known premium border style to every generated cover template', () => {
    const knownStyleIds = new Set(Object.keys(COVER_BORDER_STYLE_BY_ID))

    for (const template of allGeneratedCoverTemplates) {
      const styleId = template.design?.borderStyle?.id

      expect(
        styleId,
        `${template.id} should define design.borderStyle.id`,
      ).toBeTruthy()
      expect(
        knownStyleIds.has(String(styleId)),
        `${template.id} uses ${styleId}`,
      ).toBe(true)
      expect(template.design?.theme?.pageBorder?.style).toBe(styleId)
      expect(template.design?.borderStyle?.className).toBe(
        `cover-border--${styleId}`,
      )
    }
  })

  it('uses the full 20-style border collection across cover page and cover letter templates', () => {
    const usedStyleIds = new Set(
      allGeneratedCoverTemplates.map(
        (template) => template.design?.borderStyle?.id,
      ),
    )

    expect(usedStyleIds).toEqual(new Set(Object.keys(COVER_BORDER_STYLE_BY_ID)))
  })
})
