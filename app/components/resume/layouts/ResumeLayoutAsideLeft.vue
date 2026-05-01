<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHeader from '~/components/resume/sections/ResumeSectionHeader.vue'
import ResumeSectionContact from '~/components/resume/sections/ResumeSectionContact.vue'
import ResumeSectionSkill from '~/components/resume/sections/ResumeSectionSkill.vue'
import ResumeSectionLanguage from '~/components/resume/sections/ResumeSectionLanguage.vue'
import ResumeSectionReference from '~/components/resume/sections/ResumeSectionReference.vue'
import ResumeSectionCertification from '~/components/resume/sections/ResumeSectionCertification.vue'
import ResumeSectionInterest from '~/components/resume/sections/ResumeSectionInterest.vue'
import ResumeSectionProfile from '~/components/resume/sections/ResumeSectionProfile.vue'
import ResumeSectionExperience from '~/components/resume/sections/ResumeSectionExperience.vue'
import ResumeSectionEducation from '~/components/resume/sections/ResumeSectionEducation.vue'
import ResumeSectionProject from '~/components/resume/sections/ResumeSectionProject.vue'

defineProps<{ resume: ResumeApiItem; template?: any; reverse?: boolean }>()
</script>

<template>
  <div class="aside-left" :class="{ reverse }" :style="{ '--primary': template?.theme?.palette?.primary, background: template?.theme?.palette?.pageBackground }">
    <ResumeSectionHeader class="full" :resume="resume" :template="template" />
    <aside>
      <ResumeSectionContact :resume="resume" />
      <ResumeSectionSkill :resume="resume" />
      <ResumeSectionLanguage :resume="resume" />
      <ResumeSectionReference :resume="resume" />
      <ResumeSectionCertification :resume="resume" />
      <ResumeSectionInterest :resume="resume" />
    </aside>
    <main>
      <ResumeSectionProfile :resume="resume" />
      <ResumeSectionExperience :resume="resume" />
      <ResumeSectionEducation :resume="resume" />
      <ResumeSectionProject :resume="resume" />
    </main>
  </div>
</template>

<style scoped>
.aside-left { display:grid; grid-template-columns:240px 1fr; grid-template-areas:'header header' 'aside main'; gap:20px; }
.aside-left.reverse { grid-template-columns:1fr 240px; grid-template-areas:'header header' 'main aside'; }
.full { grid-area: header; }
aside { grid-area: aside; padding: 12px; background: #f1f5f9; }
main { grid-area: main; padding: 12px; }
</style>
