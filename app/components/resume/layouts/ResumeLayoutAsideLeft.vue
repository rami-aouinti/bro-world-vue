<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import { STRUCTURES, type SectionKey } from './layoutSections'
import ResumeSectionHeader from '~/components/resume/sections/ResumeSectionHeader.vue'
import ResumeSectionContact from '~/components/resume/sections/ResumeSectionContact.vue'
import ResumeSectionExperience from '~/components/resume/sections/ResumeSectionExperience.vue'
import ResumeSectionEducation from '~/components/resume/sections/ResumeSectionEducation.vue'
import ResumeSectionSkill from '~/components/resume/sections/ResumeSectionSkill.vue'
import ResumeSectionLanguage from '~/components/resume/sections/ResumeSectionLanguage.vue'
import ResumeSectionProject from '~/components/resume/sections/ResumeSectionProject.vue'
import ResumeSectionInterest from '~/components/resume/sections/ResumeSectionInterest.vue'
import ResumeSectionReference from '~/components/resume/sections/ResumeSectionReference.vue'
import ResumeSectionCertification from '~/components/resume/sections/ResumeSectionCertification.vue'
const props = defineProps<{ resume: ResumeApiItem; template?: any }>()
const components: Record<SectionKey, any> = { header: ResumeSectionHeader, contact: ResumeSectionContact, experience: ResumeSectionExperience, education: ResumeSectionEducation, skill: ResumeSectionSkill, language: ResumeSectionLanguage, project: ResumeSectionProject, interest: ResumeSectionInterest, reference: ResumeSectionReference, certification: ResumeSectionCertification }
const sections = computed(() => STRUCTURES[props.template?.structure || 'structure-1'] || STRUCTURES['structure-1'])
const asideKeys: SectionKey[] = ['contact','skill','language','interest','reference','certification']
</script>
<template><div class="aside-left" :style="{'--primary': template?.theme?.palette?.primary, background: template?.theme?.palette?.pageBackground}">
  <aside><component :is="components[key]" v-for="key in sections.filter(k=>asideKeys.includes(k))" :key="key" :resume="resume"/></aside>
  <main><component :is="components[key]" v-for="key in sections.filter(k=>!asideKeys.includes(k))" :key="key" :resume="resume"/></main>
</div></template>
<style scoped>.aside-left{display:grid;grid-template-columns:240px 1fr;gap:20px}.aside-left aside{padding:12px;background:#f1f5f9}.aside-left main{padding:12px}.section{margin-bottom:14px}</style>
