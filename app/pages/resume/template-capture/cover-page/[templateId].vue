<script setup lang="ts">
import GENERATED_COVER_PAGE_TEMPLATES from '~/data/resume-templates/generated-20-cover-page.json'

definePageMeta({ layout: false })

const route = useRoute()
const templateId = computed(() => String(route.params.templateId || 'cpage-001'))

const selectedTemplate = computed(() => {
  return GENERATED_COVER_PAGE_TEMPLATES.find((tpl) => tpl.id === templateId.value) || GENERATED_COVER_PAGE_TEMPLATES[0]
})
</script>

<template>
  <main
    class="capture-cover-page"
    :style="{
      '--cp-primary': selectedTemplate.theme.palette.primary,
      '--cp-secondary': selectedTemplate.theme.palette.secondary,
      '--cp-text': selectedTemplate.theme.palette.text,
      '--cp-muted': selectedTemplate.theme.palette.muted,
      '--cp-bg': selectedTemplate.theme.palette.pageBackground,
    }"
  >
    <header class="hero">
      <img src="/img/team-1.jpg" alt="profile" class="capture-photo">
      <h1>Alex Martin</h1>
      <p>Senior Full Stack Developer</p>
    </header>
    <section>
      <h2>Application Pack</h2>
      <p>Driven engineer delivering robust products with strong UX and clean architecture.</p>
    </section>
  </main>
</template>

<style scoped>
.capture-cover-page { width: 850px; height: 1123px; padding: 80px; background: var(--cp-bg); color: var(--cp-text); }
.hero { border-left: 10px solid var(--cp-primary); padding-left: 24px; margin-bottom: 48px; }
h1 { font-size: 58px; margin: 0; }
p { font-size: 24px; color: var(--cp-muted); }
h2 { color: var(--cp-primary); font-size: 40px; margin: 0 0 16px; }
section { border-top: 3px solid var(--cp-secondary); padding-top: 24px; }
</style>

<style scoped>
.capture-photo{width:92px;height:92px;border-radius:999px;object-fit:cover;margin-bottom:16px}
</style>
