<script setup lang="ts">
import GENERATED_COVER_PAGE_TEMPLATES from '~/data/resume-templates/generated-20-cover-page.json'

definePageMeta({ layout: false })

const route = useRoute()
const templateId = computed(() => {
  const fromParams = typeof route.params.templateId === 'string' ? route.params.templateId : ''
  const fromQuery = typeof route.query.template === 'string' ? route.query.template : ''
  return String(fromParams || fromQuery || 'cpage-001')
})

function resolveGeneratedTemplateId(rawTemplateId: string): string {
  const normalized = rawTemplateId.trim()
  if (!normalized) return ''

  const withoutTemplatePrefix = normalized.startsWith('template=')
    ? normalized.slice('template='.length).trim()
    : normalized

  const exactGenerated = GENERATED_COVER_PAGE_TEMPLATES.find((template) => template.id === withoutTemplatePrefix)
  if (exactGenerated) return exactGenerated.id

  const unprefixed = withoutTemplatePrefix.startsWith('cover-page-')
    ? withoutTemplatePrefix.slice('cover-page-'.length)
    : withoutTemplatePrefix
  const prefixedGenerated = GENERATED_COVER_PAGE_TEMPLATES.find((template) => template.id === unprefixed)
  if (prefixedGenerated) return prefixedGenerated.id

  const startsWithGenerated = GENERATED_COVER_PAGE_TEMPLATES.find((template) => template.id.startsWith(withoutTemplatePrefix))
  if (startsWithGenerated) return startsWithGenerated.id

  return ''
}

const selectedTemplate = computed(() => {
  const resolvedTemplateId = resolveGeneratedTemplateId(templateId.value)
  return GENERATED_COVER_PAGE_TEMPLATES.find((tpl) => tpl.id === resolvedTemplateId) || GENERATED_COVER_PAGE_TEMPLATES[0]
})

const spacingMap: Record<string, number> = { compact: 24, normal: 30, wide: 40, relaxed: 42 }
const radiusMap: Record<string, number> = { none: 0, sm: 8, md: 16, lg: 24, xl: 32 }
const defaultBarDesignConfig = {
  barRadius: { min: 0, max: 30 },
  barLayout: ['', 'single', 'double'],
  barWidth: { min: 4, max: 24 },
  secondaryBarWidth: { min: 2, max: 20 },
}

function toPercentNumber(value: unknown, fallback = 50): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.min(100, Math.max(0, value))
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace('%', '').trim())
    if (Number.isFinite(parsed)) return Math.min(100, Math.max(0, parsed))
  }
  return fallback
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

const resolvedStyles = computed(() => {
  const tpl = selectedTemplate.value as any
  const items = tpl?.items || {}
  const designConfig = tpl?.designConfig || defaultBarDesignConfig
  return {
    sectionDividerStyle: tpl?.decor?.divider === 'none' ? 'none' : tpl?.decor?.divider === 'dashed' ? 'dashed' : 'solid',
    sectionDividerColor: tpl?.decor?.divider === 'gradient' ? 'color-mix(in srgb,var(--cp-primary) 55%, var(--cp-secondary) 45%)' : 'var(--cp-secondary)',
    headerStyle: String(tpl?.decor?.headerStyle || ''),
    heroGradient: tpl?.decor?.gradientStyle && tpl?.decor?.gradientStyle !== 'none' ? 'linear-gradient(135deg, color-mix(in srgb,var(--cp-primary) 14%, transparent), color-mix(in srgb,var(--cp-secondary) 24%, transparent))' : 'transparent',
    sectionSpacing: spacingMap[tpl?.layoutOptions?.sectionSpacing] || 30,
    radius: radiusMap[tpl?.designTokens?.borderRadius] || 8,
    barWidth: Number(designConfig?.barWidth?.min ?? defaultBarDesignConfig.barWidth.min),
    barSecondaryWidth: Number(designConfig?.secondaryBarWidth?.min ?? defaultBarDesignConfig.secondaryBarWidth.min),
    barLayout: Array.isArray(designConfig?.barLayout) && designConfig.barLayout.includes('double') ? 'double' : (designConfig.barLayout.includes('single') ? 'single' : 'none'),
    barRadius: Number(designConfig?.barRadius?.min ?? defaultBarDesignConfig.barRadius.min),
    shadow: tpl?.designTokens?.shadowDepth === 'none' ? 'none' : '0 10px 30px rgba(15,23,42,.18)',
  }
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

const decorObjects = computed(() =>
  (((selectedTemplate.value as any)?.decor?.objects || []) as Array<Record<string, any>>).map((object) => ({
    ...object,
    x: `${toPercentNumber(object?.x, 50)}%`,
    y: `${toPercentNumber(object?.y, 50)}%`,
    size: toNumber(object?.size, 120),
    opacity: toNumber(object?.opacity, 0.08),
  })),
)

const isLayoutRight = computed(() => selectedTemplate.value.layout === 'layout-right')
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
      '--section-divider-style': resolvedStyles.sectionDividerStyle,
      '--section-spacing': `${resolvedStyles.sectionSpacing}px`,
      '--section-divider-color': resolvedStyles.sectionDividerColor,
      '--cp-radius': `${resolvedStyles.radius}px`,
      '--cp-bar-width': `${resolvedStyles.barWidth}px`,
      '--cp-bar-secondary-width': `${resolvedStyles.barSecondaryWidth}px`,
      '--cp-shadow': resolvedStyles.shadow,
      '--cp-bar-radius': `${resolvedStyles.barRadius}px`,
    }"
  >
    <div
      v-for="(object, index) in decorObjects"
      :key="`cover-page-decor-${index}`"
      class="decor-object"
      :class="`decor-${object.type || 'circle'}`"
      :style="{ left: object.x, top: object.y, width: `${object.size}px`, height: `${object.size}px`, opacity: object.opacity ?? 0.08 }"
    />
    <header class="hero" :class="{ 'hero--no-bar': resolvedStyles.barLayout === 'none', 'hero--double': resolvedStyles.barLayout === 'double', 'hero--ribbon': resolvedStyles.headerStyle === 'ribbon', 'hero--layout-right': isLayoutRight }" :style="{ background: resolvedStyles.heroGradient }">
      <img src="/img/team-1.jpg" alt="profile" class="capture-photo">
      <h1 :style="itemStyles.fullName">Alex Martin</h1>
      <p class="role" :style="itemStyles.role">Senior Full Stack Developer</p>
    </header>
    <section>
      <h2 :style="itemStyles.heading">About Me</h2>
      <p :style="itemStyles.summary">Driven engineer delivering robust products with strong UX and clean architecture.</p>
      <div class="contact-row">
        <span :style="itemStyles.email">alex@example.com</span>
        <span :style="itemStyles.phone">+33 6 00 00 00 00</span>
      </div>
    </section>
  </main>
</template>

<style scoped>
.capture-cover-page { position: relative; overflow: hidden; width: 850px; height: 1123px; padding: 80px; background: var(--cp-bg); color: var(--cp-text); border-radius: var(--cp-radius); box-shadow: var(--cp-shadow); }
.hero { border-left: var(--cp-bar-width) solid var(--cp-primary); padding-left: 24px; margin-bottom: 48px; border-radius: var(--cp-bar-radius); min-height: 148px; position:relative; }
.hero--ribbon{padding-top:16px;padding-bottom:12px}
.hero--no-bar{border-left:0!important;border-right:0!important;padding-left:0;padding-right:0}.hero--double::before{content:'';position:absolute;left:calc(var(--cp-bar-width) + 6px);top:0;bottom:0;width:var(--cp-bar-secondary-width);background:var(--cp-secondary);border-radius:var(--cp-bar-radius)}
.hero--layout-right { border-left: 0; border-right: var(--cp-bar-width) solid var(--cp-primary); padding-left: 0; padding-right: 24px; text-align: right; }
.hero--layout-right.hero--double::before { left: auto; right: calc(var(--cp-bar-width) + 6px); }
.hero--layout-right .capture-photo { margin-left: auto; }
h1 { font-size: 58px; margin: 0; }
p { font-size: 24px; color: var(--cp-muted); }
.role { margin-top: 8px; }
h2 { color: var(--cp-primary); font-size: 40px; margin: 0 0 16px; }
section { border-top: 3px var(--section-divider-style) var(--section-divider-color); padding-top: 24px; margin-top: var(--section-spacing); }
.contact-row { display: flex; gap: 24px; margin-top: 20px; flex-wrap: wrap; }
.decor-object{position:absolute;pointer-events:none;background:color-mix(in srgb,var(--cp-primary) 35%,transparent)}
.decor-circle{border-radius:999px}
.decor-ring{border-radius:999px;background:transparent;border:3px solid color-mix(in srgb,var(--cp-secondary) 55%,transparent)}
.decor-blob{border-radius:40% 60% 55% 45% / 50% 35% 65% 50%}
.decor-square{border-radius:10px}
.decor-diamond{border-radius:8px;transform:translate(-50%,-50%) rotate(45deg)}
.decor-star{-webkit-clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}
.decor-triangle{-webkit-clip-path:polygon(50% 0%,0 100%,100% 100%);clip-path:polygon(50% 0%,0 100%,100% 100%)}
.decor-pill{border-radius:999px}
.decor-bar{border-radius:999px}
</style>

<style scoped>
.capture-photo{width:84px;height:84px;border-radius:999px;object-fit:cover;margin-bottom:8px;border:2px solid #0f172a}
</style>
