<script setup lang="ts">
import { computed } from 'vue'
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHeader from '~/components/resume/sections/ResumeSectionHeader.vue'
import ResumeSectionContact from '~/components/resume/sections/ResumeSectionContact.vue'
import ResumeSectionProfile from '~/components/resume/sections/ResumeSectionProfile.vue'
import ResumeSectionRenderer from '~/components/resume/sections/ResumeSectionRenderer.vue'
import { resolveTemplateStyleVars } from '~/modules/resume/template/resolveTemplateStyleVars'

const props = defineProps<{ resume: ResumeApiItem; template?: any; reverse?: boolean }>()
const styleVars = computed(() => resolveTemplateStyleVars(props.template))
</script>

<template>
  <div class="aside-left" :class="{ reverse }" :style="styleVars">
    <ResumeSectionHeader class="full" :resume="resume" :template="template" />
    <aside>
      <ResumeSectionContact :resume="resume" />
      <ResumeSectionRenderer section-key="skill" :resume="resume" :template="template" />
      <ResumeSectionRenderer section-key="language" :resume="resume" :template="template" />
      <ResumeSectionRenderer section-key="reference" :resume="resume" :template="template" />
      <ResumeSectionRenderer section-key="certification" :resume="resume" :template="template" />
      <ResumeSectionRenderer section-key="hobby" :resume="resume" :template="template" />
    </aside>
    <main>
      <ResumeSectionProfile :resume="resume" />
      <ResumeSectionRenderer section-key="experience" :resume="resume" :template="template" />
      <ResumeSectionRenderer section-key="education" :resume="resume" :template="template" />
      <ResumeSectionRenderer section-key="project" :resume="resume" :template="template" />
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
