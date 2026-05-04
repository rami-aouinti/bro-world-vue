<script setup lang="ts">
import GENERATED_COVER_LETTER_TEMPLATES from '~/data/resume-templates/generated-20-cover-letter.json'

definePageMeta({ layout: false })

const route = useRoute()
const templateId = computed(() => String(route.params.templateId || 'cletter-001'))

const selectedTemplate = computed(() => {
  return GENERATED_COVER_LETTER_TEMPLATES.find((tpl) => tpl.id === templateId.value) || GENERATED_COVER_LETTER_TEMPLATES[0]
})

const dividerStyleMap: Record<string, string> = { solid: 'solid', dashed: 'dashed', dotted: 'dotted' }
const spacingMap: Record<string, number> = { compact: 20, normal: 30, relaxed: 42 }
const radiusMap: Record<string, number> = { none: 0, sm: 8, md: 16, lg: 24, xl: 32 }
const barIntensityMap: Record<string, number> = { low: 6, medium: 10, high: 14 }

const resolvedStyles = computed(() => {
  const tpl = selectedTemplate.value as any
  return {
    sectionDividerStyle: dividerStyleMap[tpl?.decor?.divider] || 'solid',
    paragraphSpacing: spacingMap[tpl?.layoutOptions?.paragraphSpacing] || 30,
    radius: radiusMap[tpl?.designTokens?.borderRadius] || 8,
    barPrimaryWidth: barIntensityMap[tpl?.hero?.accentIntensity || tpl?.sections?.accentIntensity] || 10,
    barSecondaryWidth: 4,
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
    fullName: build('fullName', 56),
    role: build('role', 28),
    date: build('date', 18),
    address: build('address', 18),
    heading: build('heading', 24),
    greeting: build('greeting', 24),
    paragraphOne: build('paragraphOne', 22),
    paragraphTwo: build('paragraphTwo', 22),
    signoff: build('signoff', 24),
    email: build('email', 18),
    phone: build('phone', 18),
  }
})

const decorObjects = computed(() => ((selectedTemplate.value as any)?.decor?.objects || []) as Array<Record<string, any>>)
</script>

<template>
  <main
    class="capture-cover-letter"
    :style="{
      '--cp-primary': selectedTemplate.theme.palette.primary,
      '--cp-secondary': selectedTemplate.theme.palette.secondary,
      '--cp-text': selectedTemplate.theme.palette.text,
      '--cp-muted': selectedTemplate.theme.palette.muted,
      '--cp-bg': selectedTemplate.theme.palette.pageBackground,
      '--section-divider-style': resolvedStyles.sectionDividerStyle,
      '--paragraph-spacing': `${resolvedStyles.paragraphSpacing}px`,
      '--cp-radius': `${resolvedStyles.radius}px`,
      '--bar-primary-width': `${resolvedStyles.barPrimaryWidth}px`,
      '--bar-secondary-width': `${resolvedStyles.barSecondaryWidth}px`,
      '--cl-shadow': resolvedStyles.shadow,
    }"
  >
    <div
      v-for="(object, index) in decorObjects"
      :key="`cover-letter-decor-${index}`"
      class="decor-object"
      :class="`decor-${object.type || 'circle'}`"
      :style="{ left: object.x, top: object.y, width: `${object.size}px`, height: `${object.size}px`, opacity: object.opacity ?? 0.08 }"
    />
    <div class="meta-top-right">
      <p class="date" :style="itemStyles.date">May 3, 2026</p>
      <p class="address" :style="itemStyles.address">Paris, France</p>
    </div>
    <header class="hero" :class="{ 'hero--double': selectedTemplate.hero?.barLayout === 'double' }">
      <img v-if="selectedTemplate.hero?.showPhoto !== false" src="/img/team-1.jpg" alt="profile" class="capture-photo">
      <h1 :style="itemStyles.fullName">Alex Martin</h1>
      <p class="role" :style="itemStyles.role">Senior Full Stack Developer</p>
    </header>
    <p class="intro" :style="itemStyles.greeting">Dear Hiring Manager,</p>
    <p :style="itemStyles.paragraphOne">
      I am excited to apply for your role. I bring strong experience in product delivery, scalable web architecture,
      and cross-functional collaboration.
    </p>
    <p :style="itemStyles.paragraphTwo">
      I would welcome the opportunity to contribute to your team and discuss how my background aligns with your needs.
    </p>
    <p class="signature" :style="itemStyles.signoff">Sincerely,<br><span :style="itemStyles.phone">Alex Martin</span></p>
  </main>
</template>

<style scoped>
.capture-cover-letter { position: relative; overflow: hidden; width: 850px; height: 1123px; padding: 72px; background: var(--cp-bg); color: var(--cp-text); border-radius: var(--cp-radius); box-shadow: var(--cl-shadow); }
.meta-top-right { position: absolute; top: 72px; right: 72px; text-align: right; }
.date { color: var(--cp-muted); margin: 0; }
.address { margin-top: 8px; }
.hero { border-left: var(--bar-primary-width) solid var(--cp-primary);position:relative;border-radius:var(--cp-radius); padding-left: 24px; margin-bottom: 48px; }
h1 { color: var(--cp-text); margin: 0; }
.role { color: var(--cp-muted); margin-top: 8px; font-size: 24px; }
p { font-size: 24px; line-height: 1.5; margin: var(--paragraph-spacing) 0; }
.intro { font-weight: 700; }
.signature { margin-top: 60px; border-top: 2px var(--section-divider-style) var(--cp-secondary); padding-top: 24px; width: fit-content; }
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
.hero--double::before{content:"";position:absolute;left:calc(var(--bar-primary-width) + 6px);top:0;bottom:0;width:var(--bar-secondary-width);background:var(--cp-secondary);border-radius:var(--cp-radius)}
</style>

<style scoped>
.capture-photo{width:92px;height:92px;border-radius:999px;object-fit:cover;margin-bottom:16px}
</style>
