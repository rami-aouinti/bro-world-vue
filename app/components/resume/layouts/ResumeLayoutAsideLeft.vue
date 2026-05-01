<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHeader from '~/components/resume/sections/ResumeSectionHeader.vue'
import ResumeSectionContact from '~/components/resume/sections/ResumeSectionContact.vue'
import ResumeSectionProfile from '~/components/resume/sections/ResumeSectionProfile.vue'
import ResumeSectionRenderer from '~/components/resume/sections/ResumeSectionRenderer.vue'

defineProps<{ resume: ResumeApiItem; template?: any; reverse?: boolean }>()
</script>

<template>
  <div
    class="aside-left"
    :class="{ reverse }"
    :style="{
      '--primary': template?.theme?.palette?.primary,
      background: template?.theme?.palette?.pageBackground,
    }"
  >
    <ResumeSectionHeader class="full" :resume="resume" :template="template" />
    <aside>
      <ResumeSectionContact :resume="resume" />
      <ResumeSectionRenderer
        section-key="skill"
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
    </aside>
    <main>
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
        section-key="project"
        :resume="resume"
        :template="template"
      />
    </main>
  </div>
</template>

<style scoped>
.aside-left {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-areas: 'header header' 'aside main';
  gap: 20px;
}
.aside-left.reverse {
  grid-template-columns: 1fr 240px;
  grid-template-areas: 'header header' 'main aside';
}
.full {
  grid-area: header;
}
aside {
  grid-area: aside;
  padding: 12px;
  background: #f1f5f9;
}
main {
  grid-area: main;
  padding: 12px;
}
</style>
