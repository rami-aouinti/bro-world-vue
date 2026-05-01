<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHeader from '~/components/resume/sections/ResumeSectionHeader.vue'
import ResumeSectionContact from '~/components/resume/sections/ResumeSectionContact.vue'
import ResumeSectionProfile from '~/components/resume/sections/ResumeSectionProfile.vue'
import ResumeSectionExperience from '~/components/resume/sections/ResumeSectionExperience.vue'
import ResumeSectionEducation from '~/components/resume/sections/ResumeSectionEducation.vue'
import ResumeSectionSkill from '~/components/resume/sections/ResumeSectionSkill.vue'
import ResumeSectionProject from '~/components/resume/sections/ResumeSectionProject.vue'
import ResumeSectionLanguage from '~/components/resume/sections/ResumeSectionLanguage.vue'
import ResumeSectionReference from '~/components/resume/sections/ResumeSectionReference.vue'
import ResumeSectionCertification from '~/components/resume/sections/ResumeSectionCertification.vue'
import ResumeSectionInterest from '~/components/resume/sections/ResumeSectionInterest.vue'

defineProps<{ resume: ResumeApiItem; template?: any }>()
</script>

<template>
  <div class="no-aside" :style="{ '--primary': template?.theme?.palette?.primary }">
    <ResumeSectionHeader :resume="resume" :template="template" />
    <ResumeSectionContact :resume="resume" />
    <ResumeSectionProfile :resume="resume" />
    <ResumeSectionExperience :resume="resume" />
    <ResumeSectionEducation :resume="resume" />
    <ResumeSectionSkill :resume="resume" />
    <ResumeSectionProject :resume="resume" />
    <ResumeSectionLanguage :resume="resume" />
    <ResumeSectionReference :resume="resume" />
    <ResumeSectionCertification :resume="resume" />
    <ResumeSectionInterest :resume="resume" />
  </div>
</template>
