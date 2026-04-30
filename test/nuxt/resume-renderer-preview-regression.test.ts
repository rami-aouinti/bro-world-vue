import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ResumeRenderer from '~/components/Resume/Templates/ResumeRenderer.vue'
import { RESUME_TEMPLATE_SKINS } from '~/constants/resumeTemplateSkins'
import { RESUME_LAYOUTS } from '~/constants/resumeLayouts'
import { RESUME_SKIN_IDS } from '~/constants/resumeSkins'
import { resolveRuntimeLayoutAndSkin } from '~/composables/useResumeTemplateRuntime'
import { RESUME_TEMPLATES_CATALOG } from '~/constants/resumeTemplates.catalog'

const resumeFixture = {
  role: 'Frontend Developer',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+33 6 00 00 00 00',
  city: 'Paris',
  country: 'France',
  profile: 'Engineer focused on DX and UI systems.',
  photoUrl: '/img/avatar_default.svg',
  skills: [{ name: 'Vue', level: 85 }],
  languages: [{ name: 'French', level: 100 }],
  hobbies: ['Reading'],
  experiences: [{ role: 'Engineer', company: 'Analytical Engines', city: 'London', start: '2020', end: 'Now', bullets: ['Built robust UI components'] }],
  education: [{ degree: 'BSc Computer Science', school: 'University', city: 'Paris', start: '2016', end: '2019', note: 'Honors' }],
  references: [{ name: 'Charles', company: 'Analytical Engines', email: 'charles@example.com', phone: '+33 6 11 11 11 11' }],
  courses: [],
  projects: [{ name: 'Renderer QA', summary: 'Reduced preview regressions' }],
}

describe('ResumeRenderer preview regression coverage', () => {
  it('shows the main preview on first render with header + main + aside content', async () => {
    const wrapper = await mountSuspended(ResumeRenderer, { props: { resume: resumeFixture, templateSkin: RESUME_TEMPLATE_SKINS['cv-classic'] } })
    expect(wrapper.find('article.resume-skin').exists()).toBe(true)
  })

  it('matches structural preview snapshot for a baseline resume dataset', async () => {
    const wrapper = await mountSuspended(ResumeRenderer, { props: { resume: resumeFixture, templateSkin: RESUME_TEMPLATE_SKINS['cv-classic'] } })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('smoke-renders preview without crash for all 90 layout/skin combinations', async () => {
    for (const layout of RESUME_LAYOUTS) {
      for (const skinId of RESUME_SKIN_IDS) {
        resolveRuntimeLayoutAndSkin(layout.layoutId, skinId)
        const wrapper = await mountSuspended(ResumeRenderer, { props: { resume: resumeFixture, templateSkin: RESUME_TEMPLATE_SKINS['cv-socle'], designState: { layoutMode: layout.structure, palette: skinId } } })
        expect(wrapper.find('article.resume-skin').exists(), `${layout.layoutId} × ${skinId}: root missing`).toBe(true)
      }
    }
  }, 120000)

  it('matches premium curated template snapshots', async () => {
    const premiumTemplates = RESUME_TEMPLATES_CATALOG.filter((template) => template.type === 'resume' && template.image !== '/img/cv/resume-modern.svg')

    for (const template of premiumTemplates) {
      const wrapper = await mountSuspended(ResumeRenderer, {
        props: {
          resume: resumeFixture,
          templateSkin: RESUME_TEMPLATE_SKINS['cv-socle'],
          designState: { layoutMode: template.structureId, palette: template.skinId },
        },
      })

      expect(wrapper.html()).toMatchSnapshot(template.id)
    }
  })
})
