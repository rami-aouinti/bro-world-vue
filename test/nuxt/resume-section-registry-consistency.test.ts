import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RESUME_LAYOUTS } from '~/constants/resumeLayouts'
import { RESUME_SECTION_REGISTRY } from '~/constants/resumeSectionRegistry'
import {
  collectSupportedSectionsByLayout,
  RESUME_LAYOUT_OPTIONAL_SECTIONS,
  RESUME_LAYOUT_REQUIRED_SECTIONS,
  RESUME_RENDERER_SUPPORTED_SECTIONS,
  RESUME_RENDERER_VARIANTS_BY_SECTION,
  RESUME_SHARED_TEMPLATE_VARIANTS_BY_SECTION,
} from '~/constants/resumeVariantSupportMatrix'

function readComponentSource(filename: string) {
  return readFileSync(
    resolve(process.cwd(), 'app/components/Resume/Sections', filename),
    'utf-8',
  )
}

describe('resume section registry consistency', () => {
  it('ensures each defaultVariant is declared in variants', () => {
    for (const [sectionKey, entry] of Object.entries(RESUME_SECTION_REGISTRY)) {
      const available = new Set(entry.variants.map((variant) => variant.value))
      expect(
        available.has(entry.defaultVariant),
        `${sectionKey}: defaultVariant \"${entry.defaultVariant}\" missing from variants`,
      ).toBe(true)
    }
  })

  it('ensures language/project/experience variants are supported by target components', () => {
    const sectionSources = {
      language: readComponentSource('ResumeSectionLanguage.vue'),
      project: readComponentSource('ResumeSectionProject.vue'),
      experience: readComponentSource('ResumeSectionExperience.vue'),
    } as const

    for (const [sectionKey, source] of Object.entries(sectionSources) as Array<
      [keyof typeof sectionSources, string]
    >) {
      const expectedVariants = RESUME_SECTION_REGISTRY[sectionKey].variants.map(
        ({ value }) => value,
      )

      for (const variant of expectedVariants) {
        expect(
          source.includes(`'${variant}'`) || source.includes(`\"${variant}\"`),
          `${sectionKey}: variant \"${variant}\" not found in component source`,
        ).toBe(true)
      }
    }
  })

  it('ensures renderer and shared-template variant declarations stay within registry variants', () => {
    const matrices = [
      RESUME_RENDERER_VARIANTS_BY_SECTION,
      RESUME_SHARED_TEMPLATE_VARIANTS_BY_SECTION,
    ]

    for (const matrix of matrices) {
      for (const [sectionKey, variants] of Object.entries(matrix)) {
        const allowed = new Set(
          RESUME_SECTION_REGISTRY[
            sectionKey as keyof typeof RESUME_SECTION_REGISTRY
          ].variants.map(({ value }) => value),
        )

        for (const variant of variants ?? []) {
          expect(
            allowed.has(variant),
            `${sectionKey}: unsupported variant \"${variant}\" in matrix`,
          ).toBe(true)
        }
      }
    }
  })

  it('ensures declared renderer sections exist in SectionRenderer mapping', () => {
    const rendererSource = readFileSync(
      resolve(
        process.cwd(),
        'app/components/Resume/Sections/SectionRenderer.vue',
      ),
      'utf-8',
    )

    for (const sectionKey of RESUME_RENDERER_SUPPORTED_SECTIONS) {
      expect(
        rendererSource.includes(`${sectionKey}:`),
        `section \"${sectionKey}\" missing from SectionRenderer component map`,
      ).toBe(true)
    }
  })

  it('ensures every section used by layouts is supported by SectionRenderer', () => {
    const rendererSupported = new Set(RESUME_RENDERER_SUPPORTED_SECTIONS)

    for (const layout of RESUME_LAYOUTS) {
      for (const sectionKey of [...layout.zones.main, ...layout.zones.aside]) {
        expect(
          rendererSupported.has(sectionKey),
          `${layout.layoutId}: section \"${sectionKey}\" is used by layout but not supported by SectionRenderer`,
        ).toBe(true)
      }
    }
  })

  it('ensures every layout supports mandatory and optional section constraints', () => {
    const mandatory = new Set(RESUME_LAYOUT_REQUIRED_SECTIONS)
    const optional = new Set(RESUME_LAYOUT_OPTIONAL_SECTIONS)

    for (const layout of RESUME_LAYOUTS) {
      const supported = new Set(collectSupportedSectionsByLayout(layout))

      for (const sectionKey of mandatory) {
        expect(
          supported.has(sectionKey),
          `${layout.layoutId}: missing required section \"${sectionKey}\"`,
        ).toBe(true)
      }

      for (const sectionKey of optional) {
        expect(
          supported.has(sectionKey),
          `${layout.layoutId}: optional section \"${sectionKey}\" should be recoverable by fallback`,
        ).toBe(true)
      }
    }
  })

  it('ensures resume template preview images are unique', async () => {
    const { RESUME_TEMPLATES_CATALOG } =
      await import('~/constants/resumeTemplates.catalog')
    const resumeTemplates = RESUME_TEMPLATES_CATALOG.filter(
      ({ type }) => type === 'resume',
    )
    const images = resumeTemplates.map(({ image }) => image)
    expect(
      new Set(images).size,
      `duplicate resume images found: ${images.join(', ')}`,
    ).toBe(images.length)
  })

  it('ensures expected toolbar actions are coherent with section props and emits (language/project/experience)', () => {
    const sectionSources = {
      language: readComponentSource('ResumeSectionLanguage.vue'),
      project: readComponentSource('ResumeSectionProject.vue'),
      experience: readComponentSource('ResumeSectionExperience.vue'),
    } as const

    for (const [sectionKey, source] of Object.entries(sectionSources) as Array<
      [keyof typeof sectionSources, string]
    >) {
      const toolbarActions = RESUME_SECTION_REGISTRY[sectionKey].toolbarActions

      if (toolbarActions.includes('change-variant')) {
        expect(
          source.includes("(event: 'change-variant'"),
          `${sectionKey}: missing change-variant emit declaration`,
        ).toBe(true)
        expect(
          source.includes('@change-variant='),
          `${sectionKey}: missing SectionToolbar change-variant wiring`,
        ).toBe(true)
      }

      if (toolbarActions.includes('move-up')) {
        expect(
          source.includes('canMoveUp?: boolean'),
          `${sectionKey}: missing canMoveUp prop`,
        ).toBe(true)
        expect(
          source.includes(':can-move-up="canMoveUp"'),
          `${sectionKey}: missing can-move-up binding`,
        ).toBe(true)
        expect(
          source.includes('@move-up='),
          `${sectionKey}: missing move-up wiring`,
        ).toBe(true)
      }

      if (toolbarActions.includes('move-down')) {
        expect(
          source.includes('canMoveDown?: boolean'),
          `${sectionKey}: missing canMoveDown prop`,
        ).toBe(true)
        expect(
          source.includes(':can-move-down="canMoveDown"'),
          `${sectionKey}: missing can-move-down binding`,
        ).toBe(true)
        expect(
          source.includes('@move-down='),
          `${sectionKey}: missing move-down wiring`,
        ).toBe(true)
      }

      if (toolbarActions.includes('add-item')) {
        expect(
          source.includes("(event: 'add-item'"),
          `${sectionKey}: missing add-item emit declaration`,
        ).toBe(true)
        expect(
          source.includes('@add-item='),
          `${sectionKey}: missing add-item wiring`,
        ).toBe(true)
      }

      if (toolbarActions.includes('delete-section')) {
        expect(
          source.includes("(event: 'delete-section'"),
          `${sectionKey}: missing delete-section emit declaration`,
        ).toBe(true)
        expect(
          source.includes('@delete-section='),
          `${sectionKey}: missing delete-section wiring`,
        ).toBe(true)
      }
    }
  })
})
