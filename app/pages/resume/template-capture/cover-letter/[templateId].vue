<script setup lang="ts">
import GENERATED_COVER_LETTER_TEMPLATES from '~/data/resume-templates/generated-20-cover-letter.json'

definePageMeta({ layout: false })

const route = useRoute()
const templateId = computed(() => {
  const fromParams = typeof route.params.templateId === 'string' ? route.params.templateId : ''
  const fromQuery = typeof route.query.template === 'string' ? route.query.template : ''
  return String(fromParams || fromQuery || 'cletter-001')
})

function resolveGeneratedTemplateId(rawTemplateId: string): string {
  const normalized = rawTemplateId.trim()
  if (!normalized) return ''

  const withoutTemplatePrefix = normalized.startsWith('template=')
    ? normalized.slice('template='.length).trim()
    : normalized

  const exactGenerated = GENERATED_COVER_LETTER_TEMPLATES.find((template) => template.id === withoutTemplatePrefix)
  if (exactGenerated) return exactGenerated.id

  const unprefixed = withoutTemplatePrefix.startsWith('cover-letter-')
    ? withoutTemplatePrefix.slice('cover-letter-'.length)
    : withoutTemplatePrefix
  const prefixedGenerated = GENERATED_COVER_LETTER_TEMPLATES.find((template) => template.id === unprefixed)
  if (prefixedGenerated) return prefixedGenerated.id

  const startsWithGenerated = GENERATED_COVER_LETTER_TEMPLATES.find((template) => template.id.startsWith(withoutTemplatePrefix))
  if (startsWithGenerated) return startsWithGenerated.id

  return ''
}

const selectedTemplate = computed(() => {
  const resolvedTemplateId = resolveGeneratedTemplateId(templateId.value)
  return GENERATED_COVER_LETTER_TEMPLATES.find((tpl) => tpl.id === resolvedTemplateId) || GENERATED_COVER_LETTER_TEMPLATES[0]
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
    sectionDividerColor: tpl?.decor?.divider === 'gradient' ? 'color-mix(in srgb,var(--cl-primary) 55%, var(--cl-secondary) 45%)' : 'var(--cl-secondary)',
    headerStyle: String(tpl?.decor?.headerStyle || ''),
    heroGradient: tpl?.decor?.gradientStyle && tpl?.decor?.gradientStyle !== 'none' ? 'linear-gradient(135deg, color-mix(in srgb,var(--cl-primary) 14%, transparent), color-mix(in srgb,var(--cl-secondary) 24%, transparent))' : 'transparent',
    paragraphSpacing: spacingMap[tpl?.layoutOptions?.paragraphSpacing] || 30,
    radius: radiusMap[tpl?.designTokens?.borderRadius] || 8,
    barPrimaryWidth: Number(designConfig?.barWidth?.min ?? defaultBarDesignConfig.barWidth.min),
    barSecondaryWidth: Number(designConfig?.secondaryBarWidth?.min ?? defaultBarDesignConfig.secondaryBarWidth.min),
    barLayout: Array.isArray(designConfig?.barLayout) && designConfig.barLayout.includes('double') ? 'double' : (designConfig.barLayout.includes('single') ? 'single' : 'none'),
    barRadius: Number(designConfig?.barRadius?.min ?? defaultBarDesignConfig.barRadius.min),
    photoSize: Number(designConfig?.photoSize ?? 84),
    photoType: designConfig?.photoType === 'square' ? 'square' : 'circle',
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
    date: build('date', 18),
    address: build('address', 18),
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
    class="capture-cover-letter"
    :style="{
      '--cl-primary': selectedTemplate.theme.palette.primary,
      '--cl-secondary': selectedTemplate.theme.palette.secondary,
      '--cl-text': selectedTemplate.theme.palette.text,
      '--cl-muted': selectedTemplate.theme.palette.muted,
      '--cl-bg': selectedTemplate.theme.palette.pageBackground,
      '--section-divider-style': resolvedStyles.sectionDividerStyle,
      '--paragraph-spacing': `${resolvedStyles.paragraphSpacing}px`,
      '--cl-radius': `${resolvedStyles.radius}px`,
      '--cl-bar-primary-width': `${resolvedStyles.barPrimaryWidth}px`,
      '--cl-bar-secondary-width': `${resolvedStyles.barSecondaryWidth}px`,
      '--cl-shadow': resolvedStyles.shadow,
      '--cl-bar-radius': `${resolvedStyles.barRadius}px`,
    }"
  >
    <div
      v-for="(object, index) in decorObjects"
      :key="`cover-letter-decor-${index}`"
      class="decor-object"
      :class="`decor-${object.type || 'circle'}`"
      :style="{ left: object.x, top: object.y, width: `${object.size}px`, height: `${object.size}px`, opacity: object.opacity ?? 0.08 }"
    />
    <div class="meta-top-right" :class="{ 'meta-top-right--layout-right': isLayoutRight }">
      <p class="date" :style="itemStyles.date">May 3, 2026</p>
      <p class="address" :style="itemStyles.address">Paris, France</p>
    </div>
    <header class="hero" :class="{ 'hero--no-bar': resolvedStyles.barLayout === 'none', 'hero--double': resolvedStyles.barLayout === 'double', 'hero--ribbon': resolvedStyles.headerStyle === 'ribbon', 'hero--layout-right': isLayoutRight }" :style="{ background: resolvedStyles.heroGradient }">
      <div class="hero-row" :class="{ 'hero-row--layout-right': isLayoutRight }">
        <img src="/img/team-1.jpg" alt="profile" class="capture-photo" :class="{ 'capture-photo--square': resolvedStyles.photoType === 'square' }" :style="{ width: `${resolvedStyles.photoSize}px`, height: `${resolvedStyles.photoSize}px` }">
        <h1>Alex Martin</h1>
        <p class="role">Senior Full Stack Developer</p>
      </div>
    </header>
    <section>
      <p class="intro">Dear Hiring Manager,</p>
      <p>
        I am excited to apply for your role. I bring strong experience in product delivery, scalable web architecture,
        and cross-functional collaboration.
      </p>
      <p>
        I would welcome the opportunity to contribute to your team and discuss how my background aligns with your needs.
      </p>
      <p class="signature-label">Sincerely,</p>
      <p>Alex Martin</p>
    </section>
  </main>
</template>

<style scoped>
.capture-cover-letter { position: relative; overflow: hidden; width: 850px; height: 1123px; padding: 64px 72px; background: var(--cl-bg); color: var(--cl-text); border-radius: var(--cl-radius); box-shadow: var(--cl-shadow); }
.meta-top-right { position: absolute; top: 64px; right: 72px; text-align: right; display: flex; flex-direction: column; gap: 2px; align-items: flex-end; }
.meta-top-right--layout-right { right: auto; left: 72px; text-align: left; align-items: flex-start; }
.date { color: var(--cl-muted); margin: 0; }
.address { margin: 0; }
.hero { border-left: var(--cl-bar-primary-width) solid var(--cl-primary); padding-left: 24px; padding-top: 6px; margin-bottom: 42px; min-height: 140px; position: relative; border-radius: var(--cl-bar-radius); }
.hero--ribbon{padding-top:16px;padding-bottom:12px}
.hero--no-bar{border-left:0!important;border-right:0!important;padding-left:0;padding-right:0}.hero--double::before{content:'';position:absolute;left:calc(var(--cl-bar-primary-width) + 6px);top:0;bottom:0;width:var(--cl-bar-secondary-width);background:var(--cl-secondary);border-radius:var(--cl-bar-radius)}
.hero-row { display: flex; flex-direction: column; gap: 6px; }
.hero--layout-right { border-left: 0; border-right: var(--cl-bar-primary-width) solid var(--cl-primary); padding-left: 0; padding-right: 24px; text-align: right; }
.hero--layout-right.hero--double::before { left: auto; right: calc(var(--cl-bar-primary-width) + 6px); }
.hero-row--layout-right { align-items: flex-end; }
.hero-row--layout-right .capture-photo { margin-left: auto; }
h1 { color: var(--cl-text); margin: 0; font-size: 44px; line-height: 1.05; }
.role { color: var(--cl-muted); margin: 0; font-size: 24px; }
p { font-size: 24px; line-height: 1.55; margin: 0 0 18px; color: color-mix(in srgb,var(--cl-text) 78%, #475569); }
section { border-top: 2px var(--section-divider-style) var(--section-divider-color); padding-top: 24px; margin-top: 24px; }
.intro { font-weight: 700; color: var(--cl-text); margin-bottom: 24px; }
.signature-label { margin-top: 24px; }
.decor-object{position:absolute;pointer-events:none;background:color-mix(in srgb,var(--cl-primary) 35%,transparent)}
.decor-circle{border-radius:999px}
.decor-ring{border-radius:999px;background:transparent;border:3px solid color-mix(in srgb,var(--cl-secondary) 55%,transparent)}
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
.capture-photo--square{border-radius:12px}
</style>
