import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ResumeRenderer from '~/components/Resume/Templates/ResumeRenderer.vue'
import {
  RESUME_TEMPLATE_SKINS,
  type TemplateSkinId,
} from '~/constants/resumeTemplateSkins'

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
  experiences: [
    {
      role: 'Engineer',
      company: 'Analytical Engines',
      city: 'London',
      start: '2020',
      end: 'Now',
      bullets: ['Built robust UI components'],
    },
  ],
  education: [
    {
      degree: 'BSc Computer Science',
      school: 'University',
      city: 'Paris',
      start: '2016',
      end: '2019',
      note: 'Honors',
    },
  ],
  references: [
    {
      name: 'Charles',
      company: 'Analytical Engines',
      email: 'charles@example.com',
      phone: '+33 6 11 11 11 11',
    },
  ],
  courses: [],
  projects: [{ name: 'Renderer QA', summary: 'Reduced preview regressions' }],
}

const templateIds = Object.keys(RESUME_TEMPLATE_SKINS) as TemplateSkinId[]

describe('ResumeRenderer design controls coverage', () => {
  for (const templateId of templateIds) {
    it(`applies palette/rounded/typography/density/divider controls for ${templateId}`, async () => {
      const wrapper = await mountSuspended(ResumeRenderer, {
        props: {
          resume: resumeFixture,
          templateSkin: RESUME_TEMPLATE_SKINS[templateId],
          roundedClass: 'radius-sm',
          textStyleClass: 'text-style-clean',
          density: 'comfortable',
          dividerStyle: 'line',
          themeTokens: {
            '--cv-page': '#ffffff',
            '--cv-accent': '#2563eb',
            '--cv-font-family': 'Inter, sans-serif',
            '--cv-font-weight': '500',
          },
        },
      })

      const root = wrapper.find('article.resume-skin')
      expect(root.exists()).toBe(true)
      expect(root.classes()).toContain('radius-sm')
      expect(root.classes()).toContain('text-style-clean')
      expect(root.classes()).toContain('density-comfortable')
      expect(root.classes()).toContain('divider-line')
      expect(root.attributes('style')).toContain('--cv-page: #ffffff;')
      expect(root.attributes('style')).toContain('--cv-accent: #2563eb;')
      expect(root.attributes('style')).toContain(
        '--cv-font-family: Inter, sans-serif;',
      )
      expect(root.attributes('style')).toContain('--cv-font-weight: 500;')

      await wrapper.setProps({
        roundedClass: 'radius-xl',
        textStyleClass: 'text-style-serif',
        density: 'compact',
        dividerStyle: 'thick',
        themeTokens: {
          '--cv-page': '#0f172a',
          '--cv-accent': '#f97316',
          '--cv-font-family': 'Merriweather, serif',
          '--cv-font-weight': '700',
        },
      })

      expect(root.classes()).toContain('radius-xl')
      expect(root.classes()).toContain('text-style-serif')
      expect(root.classes()).toContain('density-compact')
      expect(root.classes()).toContain('divider-thick')
      expect(root.attributes('style')).toContain('--cv-page: #0f172a;')
      expect(root.attributes('style')).toContain('--cv-accent: #f97316;')
      expect(root.attributes('style')).toContain(
        '--cv-font-family: Merriweather, serif;',
      )
      expect(root.attributes('style')).toContain('--cv-font-weight: 700;')
    })
  }
})
