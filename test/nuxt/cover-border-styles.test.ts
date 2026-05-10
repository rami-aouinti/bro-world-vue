import { describe, expect, it } from 'vitest'
import GENERATED_COVER_PAGE_TEMPLATES from '~/data/resume-templates/generated-20-cover-page.json'
import GENERATED_COVER_LETTER_TEMPLATES from '~/data/resume-templates/generated-20-cover-letter.json'
import {
  COVER_BORDER_STYLE_IDS,
  COVER_BORDER_STYLES,
} from '~/constants/coverBorderStyles'
import {
  COVER_BORDER_SIMPLE_CLASS,
  resolveCoverBorderStyle,
} from '~/composables/useCoverBorderStyle'

type GeneratedCoverTemplate = {
  id: string
  design?: {
    borderStyle?: {
      id?: string
      className?: string
      accentPlacement?: string
    }
  }
}

const generatedCoverSuites = [
  {
    type: 'cover page',
    templates: GENERATED_COVER_PAGE_TEMPLATES as GeneratedCoverTemplate[],
  },
  {
    type: 'cover letter',
    templates: GENERATED_COVER_LETTER_TEMPLATES as GeneratedCoverTemplate[],
  },
]

const borderStyleById: Map<string, (typeof COVER_BORDER_STYLES)[number]> =
  new Map(COVER_BORDER_STYLES.map((style) => [style.id, style]))

const templatesWithBorderStyles = (templates: GeneratedCoverTemplate[]) =>
  templates.filter((template) => template.design?.borderStyle?.id)

describe('cover template border styles', () => {
  it.each(generatedCoverSuites)(
    'references only registered borderStyle ids in generated $type JSON',
    ({ templates }) => {
      for (const template of templatesWithBorderStyles(templates)) {
        const borderStyleId = template.design?.borderStyle?.id

        expect(
          borderStyleById.has(String(borderStyleId)),
          `${template.id} references unknown borderStyle.id "${borderStyleId}"`,
        ).toBe(true)
      }
    },
  )

  it.each(generatedCoverSuites)(
    'assigns the 20 expected border styles to generated $type templates',
    ({ templates }) => {
      const assignedStyleIds = templatesWithBorderStyles(templates).map(
        (template) => template.design?.borderStyle?.id,
      )

      expect(assignedStyleIds).toHaveLength(COVER_BORDER_STYLE_IDS.length)
      expect(new Set(assignedStyleIds)).toEqual(new Set(COVER_BORDER_STYLE_IDS))
    },
  )

  it.each(generatedCoverSuites)(
    'keeps generated $type JSON classes aligned with COVER_BORDER_STYLES',
    ({ templates }) => {
      for (const template of templatesWithBorderStyles(templates)) {
        const borderStyle = template.design?.borderStyle
        const expected = borderStyleById.get(String(borderStyle?.id))

        expect(borderStyle?.className).toBe(expected?.className)
        expect(borderStyle?.accentPlacement).toBe(expected?.accentPlacement)
        expect(resolveCoverBorderStyle(template.design).className).toBe(
          expected?.className,
        )
      }
    },
  )

  it('falls back to the simple cover border class when a template has no borderStyle', () => {
    const templateWithoutBorderStyle = GENERATED_COVER_PAGE_TEMPLATES.find(
      (template) => !template.design?.borderStyle,
    )

    expect(templateWithoutBorderStyle?.id).toBeTruthy()
    expect(resolveCoverBorderStyle(templateWithoutBorderStyle?.design)).toEqual(
      {
        styleId: 'simple',
        className: COVER_BORDER_SIMPLE_CLASS,
      },
    )
  })
})
