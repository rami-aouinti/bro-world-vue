<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHeader from '~/components/resume/sections/ResumeSectionHeader.vue'
import ResumeSectionContact from '~/components/resume/sections/ResumeSectionContact.vue'
import ResumeSectionProfile from '~/components/resume/sections/ResumeSectionProfile.vue'
import ResumeSectionRenderer from '~/components/resume/sections/ResumeSectionRenderer.vue'
import ResumeSectionBlock from '~/components/resume/sections/ResumeSectionBlock.vue'
import { resolveTemplateStyleVars } from '~/modules/resume/template/resolveTemplateStyleVars'

const props = defineProps<{ resume: ResumeApiItem; template?: any; reverse?: boolean }>()

const { t, te } = useI18n()

const SECTION_TITLE_KEYS: Record<string, string> = {
  contact: 'resumeBuilder.create.registry.sections.contact',
  profile: 'resumeBuilder.create.registry.sections.profile',
  experience: 'resumeBuilder.create.registry.sections.experience',
  education: 'resumeBuilder.create.registry.sections.education',
  skills: 'resumeBuilder.create.registry.sections.skill',
  projects: 'resumeBuilder.create.registry.sections.project',
  languages: 'resumeBuilder.create.registry.sections.language',
  certifications: 'resumeBuilder.create.registry.sections.certification',
  references: 'resumeBuilder.create.registry.sections.reference',
  interests: 'resumeBuilder.create.registry.sections.hobby',
}
const SECTION_TITLE_FALLBACKS: Record<string, string> = { contact: 'Contact', profile: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills', projects: 'Projects', languages: 'Languages', certifications: 'Certifications', references: 'References', interests: 'Interests' }
const getSectionTitle = (sectionKey: string) => {
  const i18nKey = SECTION_TITLE_KEYS[sectionKey]
  if (i18nKey && te(i18nKey)) return t(i18nKey)
  return SECTION_TITLE_FALLBACKS[sectionKey] ?? sectionKey
}
const isContactEmpty = computed(() => {
  const info = props.resume.resumeInformation
  return ![info?.email, info?.phone, info?.adresse, info?.birthDate, info?.homepage, info?.repo_profile].some((value) => typeof value === 'string' && value.trim().length > 0)
})
const isProfileEmpty = computed(() => !(props.resume.resumeInformation?.profileText || '').trim())

const styleVars = computed(() => resolveTemplateStyleVars(props.template))
</script>

<template>
  <div class="aside-left" :class="{ reverse }" :style="styleVars">
    <ResumeSectionHeader class="full" :resume="resume" :template="template" />
    <aside>
      <ResumeSectionBlock :title="getSectionTitle('contact')" :is-empty="isContactEmpty"><ResumeSectionContact :resume="resume" :show-title="false" /></ResumeSectionBlock>
      <ResumeSectionBlock :title="getSectionTitle('skills')" :is-empty="!(resume.skills?.length)"><ResumeSectionRenderer section-key="skill" :resume="resume" :template="template" /></ResumeSectionBlock>
      <ResumeSectionBlock :title="getSectionTitle('languages')" :is-empty="!(resume.languages?.length)"><ResumeSectionRenderer section-key="language" :resume="resume" :template="template" /></ResumeSectionBlock>
      <ResumeSectionBlock :title="getSectionTitle('references')" :is-empty="!(resume.references?.length)"><ResumeSectionRenderer section-key="reference" :resume="resume" :template="template" /></ResumeSectionBlock>
      <ResumeSectionBlock :title="getSectionTitle('certifications')" :is-empty="!(resume.certifications?.length)"><ResumeSectionRenderer section-key="certification" :resume="resume" :template="template" /></ResumeSectionBlock>
      <ResumeSectionBlock :title="getSectionTitle('interests')" :is-empty="!(resume.hobbies?.length)"><ResumeSectionRenderer section-key="hobby" :resume="resume" :template="template" /></ResumeSectionBlock>
    </aside>
    <main>
      <ResumeSectionBlock :title="getSectionTitle('profile')" :is-empty="isProfileEmpty"><ResumeSectionProfile :resume="resume" :show-title="false" /></ResumeSectionBlock>
      <ResumeSectionBlock :title="getSectionTitle('experience')" :is-empty="!(resume.experiences?.length)"><ResumeSectionRenderer section-key="experience" :resume="resume" :template="template" /></ResumeSectionBlock>
      <ResumeSectionBlock :title="getSectionTitle('education')" :is-empty="!(resume.educations?.length)"><ResumeSectionRenderer section-key="education" :resume="resume" :template="template" /></ResumeSectionBlock>
      <ResumeSectionBlock :title="getSectionTitle('projects')" :is-empty="!(resume.projects?.length)"><ResumeSectionRenderer section-key="project" :resume="resume" :template="template" /></ResumeSectionBlock>
    </main>
  </div>
</template>

<style scoped>
.aside-left {
  display: grid;
  grid-template-columns: var(--aside-width, 240px) 1fr;
  grid-template-areas: 'header header' 'aside main';
  gap: var(--layout-gap, 20px);
  font-family: var(--font-family, 'Inter', 'Segoe UI', sans-serif);
  letter-spacing: var(--font-letter-spacing, normal);
  font-style: var(--font-style, normal);
}
.aside-left.reverse {
  grid-template-columns: 1fr var(--aside-width, 240px);
  grid-template-areas: 'header header' 'main aside';
}
.full { grid-area: header; }
aside {
  grid-area: aside;
  padding: var(--panel-pad, 12px);
  background: color-mix(in srgb, var(--secondary, #334155) 8%, white);
  border: 1px var(--line-style, solid) var(--line-color, #cbd5e1);
}
main {
  grid-area: main;
  padding: var(--panel-pad, 12px);
}
</style>
