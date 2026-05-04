<script setup lang="ts">
import GENERATED_COVER_PAGE_TEMPLATES from '~/data/resume-templates/generated-20-cover-page.json'

definePageMeta({ layout: false })

const route = useRoute()
const templateId = computed(() => String(route.params.templateId || 'cpage-001'))

const selectedTemplate = computed(() => {
  return GENERATED_COVER_PAGE_TEMPLATES.find((tpl) => tpl.id === templateId.value) || GENERATED_COVER_PAGE_TEMPLATES[0]
})

const itemStyles = computed(() => {
  const items = (selectedTemplate.value as any)?.items || {}
  const build = (key: string, fallbackSize: number) => {
    const cfg = items[key] || {}
    const min = Number(cfg?.size?.min ?? fallbackSize)
    const max = Number(cfg?.size?.max ?? fallbackSize)
    const size = Math.round((min + max) / 2)
    const color = cfg?.colors?.[0] || selectedTemplate.value.theme.palette.text
    const weightMap: Record<string, string> = { regular: '400', medium: '500', semibold: '600', bold: '700' }
    const weight = weightMap[cfg?.styles?.[0]] || '500'
    return { fontSize: `${size}px`, color, fontWeight: weight }
  }
  return {
    fullName: build('fullName', 58),
    role: build('role', 30),
    heading: build('heading', 32),
    summary: build('summary', 24),
    email: build('email', 16),
    phone: build('phone', 16),
  }
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
      <h1 :style="itemStyles.fullName">Alex Martin</h1>
      <p class="role" :style="itemStyles.role">Senior Full Stack Developer</p>
    </header>
    <section>
      <h2 :style="itemStyles.heading">Application Pack</h2>
      <p :style="itemStyles.summary">Driven engineer delivering robust products with strong UX and clean architecture.</p>
      <div class="contact-row">
        <span :style="itemStyles.email">alex@example.com</span>
        <span :style="itemStyles.phone">+33 6 00 00 00 00</span>
      </div>
    </section>
  </main>
</template>

<style scoped>
.capture-cover-page { width: 850px; height: 1123px; padding: 80px; background: var(--cp-bg); color: var(--cp-text); }
.hero { border-left: 10px solid var(--cp-primary); padding-left: 24px; margin-bottom: 48px; }
h1 { font-size: 58px; margin: 0; }
p { font-size: 24px; color: var(--cp-muted); }
.role { margin-top: 8px; }
h2 { color: var(--cp-primary); font-size: 40px; margin: 0 0 16px; }
section { border-top: 3px solid var(--cp-secondary); padding-top: 24px; }
.contact-row { display: flex; gap: 24px; margin-top: 20px; flex-wrap: wrap; }
</style>

<style scoped>
.capture-photo{width:92px;height:92px;border-radius:999px;object-fit:cover;margin-bottom:16px}
</style>
