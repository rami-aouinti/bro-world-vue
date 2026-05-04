<script setup lang="ts">
import GENERATED_COVER_LETTER_TEMPLATES from '~/data/resume-templates/generated-20-cover-letter.json'

definePageMeta({ layout: false })

const route = useRoute()
const templateId = computed(() => String(route.params.templateId || 'cletter-001'))

const selectedTemplate = computed(() => {
  return GENERATED_COVER_LETTER_TEMPLATES.find((tpl) => tpl.id === templateId.value) || GENERATED_COVER_LETTER_TEMPLATES[0]
})
</script>

<template>
  <main
    class="capture-cover-letter"
    :style="{
      '--cl-primary': selectedTemplate.theme.palette.primary,
      '--cl-secondary': selectedTemplate.theme.palette.secondary,
      '--cl-text': selectedTemplate.theme.palette.text,
      '--cl-muted': selectedTemplate.theme.palette.muted,
      '--cl-bg': selectedTemplate.theme.palette.pageBackground,
    }"
  >
    <p class="date">May 3, 2026</p>
    <h1>Cover Letter</h1>
    <p class="intro">Dear Hiring Manager,</p>
    <p>
      I am excited to apply for your role. I bring strong experience in product delivery, scalable web architecture,
      and cross-functional collaboration.
    </p>
    <p>
      I would welcome the opportunity to contribute to your team and discuss how my background aligns with your needs.
    </p>
    <p class="signature">Sincerely,<br>Alex Martin</p>
  </main>
</template>

<style scoped>
.capture-cover-letter { width: 850px; height: 1123px; padding: 72px; background: var(--cl-bg); color: var(--cl-text); }
.date { text-align: right; color: var(--cl-muted); }
h1 { color: var(--cl-primary); margin: 24px 0; }
p { font-size: 24px; line-height: 1.5; margin: 20px 0; }
.intro { font-weight: 700; }
.signature { margin-top: 60px; border-top: 2px solid var(--cl-secondary); padding-top: 24px; width: fit-content; }
</style>

<style scoped>
.capture-photo{width:92px;height:92px;border-radius:999px;object-fit:cover;margin-bottom:16px}
</style>
