import { describe, expect, it } from 'vitest'
import { toResumeRendererDesignState } from '~/composables/useResumeTemplateRuntime'
import { RESUME_LAYOUTS } from '~/constants/resumeLayouts'
import { RESUME_SKINS_REGISTRY } from '~/constants/resumeSkins'

const baseTemplate = {
  id: 'qa-template',
  type: 'resume',
  label: 'QA Template',
  image: '',
  structureId: 'aside-left',
  layoutId: RESUME_LAYOUTS[0].layoutId,
  skinId: 'skin-classic',
  sectionLayout: [],
  styleHint: {
    palette: 'classic',
    rounded: 'none',
    typography: 'serif',
  },
} as const

function createFingerprint(skinId: keyof typeof RESUME_SKINS_REGISTRY) {
  const state = toResumeRendererDesignState({ ...baseTemplate, skinId })
  return JSON.stringify({
    themeTokens: state.themeTokens,
    sectionTokens: state.sectionTokens,
    profile: state.profile,
    roundedClass: state.roundedClass,
    textStyleClass: state.textStyleClass,
    sectionIconStyleVariant: state.sectionIconStyleVariant,
    sectionStyleClass: state.sectionStyleClass,
    layoutMode: state.layoutMode,
  })
}

describe('resume skin differentiation QA rule', () => {
  it('ensures two different skins never share exactly the same final renderer token set', () => {
    const seen = new Map<string, string>()

    for (const skinId of Object.keys(RESUME_SKINS_REGISTRY) as Array<
      keyof typeof RESUME_SKINS_REGISTRY
    >) {
      const fingerprint = createFingerprint(skinId)
      const duplicateSkin = seen.get(fingerprint)

      expect(
        duplicateSkin,
        `skin \"${skinId}\" has the same final token set as \"${duplicateSkin}\"`,
      ).toBeUndefined()

      seen.set(fingerprint, skinId)
    }
  })

  it('matches snapshot for classic vs executive skin differentiation', () => {
    expect({
      classic: toResumeRendererDesignState({
        ...baseTemplate,
        skinId: 'skin-classic',
      }),
      executive: toResumeRendererDesignState({
        ...baseTemplate,
        skinId: 'skin-executive-portrait',
      }),
    }).toMatchSnapshot()
  })
})
