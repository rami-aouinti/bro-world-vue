import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ResumeRenderer from '~/components/Resume/Templates/ResumeRenderer.vue'
import { RESUME_TEMPLATE_SKINS } from '~/constants/resumeTemplateSkins'

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
    const wrapper = await mountSuspended(ResumeRenderer, {
      props: {
        resume: resumeFixture,
        templateSkin: RESUME_TEMPLATE_SKINS.classic,
      },
    })

    expect(wrapper.find('article.resume-skin').exists()).toBe(true)
    expect(wrapper.find('header.resume-skin__header').exists()).toBe(true)
    expect(wrapper.find('main.resume-skin__main').exists()).toBe(true)
    expect(wrapper.find('aside.resume-skin__aside').exists()).toBe(true)
    expect(wrapper.findAll('main .resume-section').length).toBeGreaterThan(0)
    expect(wrapper.find('aside.resume-skin__aside').text().trim().length).toBeGreaterThan(0)
  })

  it('switches template skin (classic/terra/ocean-split) without blank output', async () => {
    const wrapper = await mountSuspended(ResumeRenderer, {
      props: {
        resume: resumeFixture,
        templateSkin: RESUME_TEMPLATE_SKINS.classic,
      },
    })

    for (const skin of [RESUME_TEMPLATE_SKINS.classic, RESUME_TEMPLATE_SKINS.terra, RESUME_TEMPLATE_SKINS['ocean-split']]) {
      await wrapper.setProps({ templateSkin: skin })

      const root = wrapper.find('article.resume-skin')
      expect(root.exists()).toBe(true)
      expect(root.text().trim().length).toBeGreaterThan(0)
      expect(wrapper.find('header.resume-skin__header').exists()).toBe(true)
    }
  })

  it('renders section toolbars inside hoverable key sections', async () => {
    const wrapper = await mountSuspended(ResumeRenderer, {
      props: {
        resume: resumeFixture,
        templateSkin: RESUME_TEMPLATE_SKINS.classic,
      },
    })

    const hoverableSections = wrapper.findAll('.resume-section-hoverable')
    expect(hoverableSections.length).toBeGreaterThan(0)

    const keySections = ['experience', 'education', 'language']
    for (const sectionKey of keySections) {
      expect(wrapper.find(`.resume-section-hoverable .section-toolbar[aria-label="Actions de la section ${sectionKey}"]`).exists()).toBe(true)
    }
  })

  it('remaps aside sections into main flow in no-aside mode with a stable main-then-aside order', async () => {
    const wrapper = await mountSuspended(ResumeRenderer, {
      props: {
        resume: resumeFixture,
        templateSkin: RESUME_TEMPLATE_SKINS.classic,
        designState: {
          layoutMode: 'no-aside',
        },
      },
    })

    expect(wrapper.find('aside.resume-skin__aside').exists()).toBe(false)

    const renderedToolbars = wrapper.findAll('main .section-toolbar')
    const renderedKeys = renderedToolbars
      .map((toolbar) => {
        const label = toolbar.attributes('aria-label') ?? ''
        const match = label.match(/Actions de la section ([a-z-]+)/)
        return match?.[1]
      })
      .filter((value): value is string => Boolean(value))

    expect(renderedKeys).toEqual([
      'experience',
      'education',
      'project',
      'language',
    ])
  })

  it('keeps visual layout stable across the 3 layout modes for every template skin', async () => {
    const layoutModes = ['aside-left', 'aside-right', 'no-aside'] as const

    for (const skin of Object.values(RESUME_TEMPLATE_SKINS)) {
      const wrapper = await mountSuspended(ResumeRenderer, {
        props: {
          resume: resumeFixture,
          templateSkin: skin,
        },
      })

      for (const layoutMode of layoutModes) {
        await wrapper.setProps({
          designState: {
            layoutMode,
          },
        })

        const root = wrapper.find('article.resume-skin')
        expect(root.exists()).toBe(true)
        expect(wrapper.find(`.layout-mode-${layoutMode}`).exists()).toBe(true)
        expect(wrapper.find('header.resume-skin__header').exists()).toBe(true)
        expect(wrapper.find('main.resume-skin__main').exists()).toBe(true)

        if (layoutMode === 'no-aside') {
          expect(wrapper.find('aside.resume-skin__aside').exists()).toBe(false)
        } else {
          expect(wrapper.find('aside.resume-skin__aside').exists()).toBe(true)
        }
      }
    }
  }, 60000)
})
