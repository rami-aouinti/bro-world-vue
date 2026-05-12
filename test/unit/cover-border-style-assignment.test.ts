import { describe, expect, it } from 'vitest'
import GENERATED_COVER_PAGE_TEMPLATES from '../../app/data/resume-templates/generated-20-cover-page.json'
import GENERATED_COVER_LETTER_TEMPLATES from '../../app/data/resume-templates/generated-20-cover-letter.json'
import { COVER_BORDER_STYLE_BY_ID } from '../../app/constants/coverBorderStyles'

const allGeneratedCoverTemplates = [
  ...GENERATED_COVER_PAGE_TEMPLATES,
  ...GENERATED_COVER_LETTER_TEMPLATES,
]

const newPremiumBorderStyleIds = [
  'monogram-watermark-frame',
  'executive-foil-corners',
  'glassmorphism-orbital',
  'luxury-vertical-ribbon',
  'midnight-neon-trace',
  'botanical-corner-vine',
  'atlas-coordinate-grid',
  'platinum-inset-frame',
  'gradient-silk-sash',
  'architect-blueprint-lines',
  'prism-edge-frame',
  'champagne-corner-filigree',
  'editorial-ink-brackets',
  'aurora-glass-panel',
  'obsidian-gold-gate',
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

  it('uses the full premium border collection across cover page and cover letter templates', () => {
    const usedStyleIds = new Set(
      allGeneratedCoverTemplates.map(
        (template) => template.design?.borderStyle?.id,
      ),
    )

    expect(usedStyleIds).toEqual(new Set(Object.keys(COVER_BORDER_STYLE_BY_ID)))
  })

  it('adds 15 new premium cover page and cover letter templates', () => {
    const coverPageAdditions = GENERATED_COVER_PAGE_TEMPLATES.slice(-15)
    const coverLetterAdditions = GENERATED_COVER_LETTER_TEMPLATES.slice(-15)

    expect(coverPageAdditions.map((template) => template.id)).toEqual(
      Array.from(
        { length: 15 },
        (_, index) => `cpage-${String(index + 43).padStart(3, '0')}`,
      ),
    )
    expect(coverLetterAdditions.map((template) => template.id)).toEqual(
      Array.from(
        { length: 15 },
        (_, index) => `cletter-${String(index + 43).padStart(3, '0')}`,
      ),
    )
    expect(
      coverPageAdditions.map((template) => template.design?.borderStyle?.id),
    ).toEqual(newPremiumBorderStyleIds)
    expect(
      coverLetterAdditions.map((template) => template.design?.borderStyle?.id),
    ).toEqual(newPremiumBorderStyleIds)
  })
})
