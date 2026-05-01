<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHeader from '~/components/resume/sections/ResumeSectionHeader.vue'
import ResumeSectionContact from '~/components/resume/sections/ResumeSectionContact.vue'
import ResumeSectionProfile from '~/components/resume/sections/ResumeSectionProfile.vue'
import ResumeSectionRenderer from '~/components/resume/sections/ResumeSectionRenderer.vue'

defineProps<{ resume: ResumeApiItem; template?: any }>()
</script>

<template>
  <div
    class="no-aside"
    :style="{ '--primary': template?.theme?.palette?.primary }"
  >
    <ResumeSectionHeader :resume="resume" :template="template" />
    <ResumeSectionContact :resume="resume" />
    <ResumeSectionProfile :resume="resume" />
    <ResumeSectionRenderer
      section-key="experience"
      :resume="resume"
      :template="template"
    />
    <ResumeSectionRenderer
      section-key="education"
      :resume="resume"
      :template="template"
    />
    <ResumeSectionRenderer
      section-key="skill"
      :resume="resume"
      :template="template"
    />
    <ResumeSectionRenderer
      section-key="project"
      :resume="resume"
      :template="template"
    />
    <ResumeSectionRenderer
      section-key="language"
      :resume="resume"
      :template="template"
    />
    <ResumeSectionRenderer
      section-key="reference"
      :resume="resume"
      :template="template"
    />
    <ResumeSectionRenderer
      section-key="certification"
      :resume="resume"
      :template="template"
    />
    <ResumeSectionRenderer
      section-key="hobby"
      :resume="resume"
      :template="template"
    />
  </div>
</template>
