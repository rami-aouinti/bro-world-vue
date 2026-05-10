<script setup lang="ts">
import GENERATED_COVER_LETTER_TEMPLATES from '~/data/resume-templates/generated-20-cover-letter.json'
import {
  getGeneratedTemplateDesign,
  getGeneratedTemplateFakeData,
} from '~/utils/generatedTemplateNormalizer'
import { useCoverBorderStyle } from '~/composables/useCoverBorderStyle'

definePageMeta({ layout: false })

const route = useRoute()
const templateId = computed(() => {
  const fromParams =
    typeof route.params.templateId === 'string' ? route.params.templateId : ''
  const fromQuery =
    typeof route.query.template === 'string' ? route.query.template : ''
  return String(fromParams || fromQuery || 'cletter-001')
})

function resolveGeneratedTemplateId(rawTemplateId: string): string {
  const normalized = rawTemplateId.trim()
  if (!normalized) return ''

  const withoutTemplatePrefix = normalized.startsWith('template=')
    ? normalized.slice('template='.length).trim()
    : normalized

  const exactGenerated = GENERATED_COVER_LETTER_TEMPLATES.find(
    (template) => template.id === withoutTemplatePrefix,
  )
  if (exactGenerated) return exactGenerated.id

  const unprefixed = withoutTemplatePrefix.startsWith('cover-letter-')
    ? withoutTemplatePrefix.slice('cover-letter-'.length)
    : withoutTemplatePrefix
  const prefixedGenerated = GENERATED_COVER_LETTER_TEMPLATES.find(
    (template) => template.id === unprefixed,
  )
  if (prefixedGenerated) return prefixedGenerated.id

  const startsWithGenerated = GENERATED_COVER_LETTER_TEMPLATES.find(
    (template) => template.id.startsWith(withoutTemplatePrefix),
  )
  if (startsWithGenerated) return startsWithGenerated.id

  return ''
}

const selectedTemplate = computed(() => {
  const resolvedTemplateId = resolveGeneratedTemplateId(templateId.value)
  return (
    GENERATED_COVER_LETTER_TEMPLATES.find(
      (tpl) => tpl.id === resolvedTemplateId,
    ) || GENERATED_COVER_LETTER_TEMPLATES[0]
  )
})

function getSelectedTemplateDesign() {
  return getGeneratedTemplateDesign(selectedTemplate.value)
}

const selectedTemplateDesign = computed(() => getSelectedTemplateDesign())
const { borderStyleClass, coverBorderCssVars } = useCoverBorderStyle(
  selectedTemplateDesign,
)
const spacingMap: Record<string, number> = {
  compact: 24,
  normal: 30,
  wide: 40,
  relaxed: 42,
}
const radiusMap: Record<string, number> = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}
const defaultBarDesignConfig = {
  barRadius: { min: 0, max: 30 },
  barLayout: ['', 'single', 'double'],
  barWidth: { min: 4, max: 24 },
  secondaryBarWidth: { min: 2, max: 20 },
}

function toPercentNumber(value: unknown, fallback = 50): number {
  if (typeof value === 'number' && Number.isFinite(value))
    return Math.min(100, Math.max(0, value))
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace('%', '').trim())
    if (Number.isFinite(parsed)) return Math.min(100, Math.max(0, parsed))
  }
  return fallback
}

function toNumber(value: unknown, fallback: number): number {
  const parsed =
    typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

const resolvedStyles = computed(() => {
  const tpl = selectedTemplateDesign.value as any
  const designConfig = tpl?.designConfig || defaultBarDesignConfig
  return {
    sectionDividerStyle:
      tpl?.decor?.divider === 'none'
        ? 'none'
        : tpl?.decor?.divider === 'dashed'
          ? 'dashed'
          : 'solid',
    sectionDividerColor:
      tpl?.decor?.divider === 'gradient'
        ? 'color-mix(in srgb,var(--cp-primary) 55%, var(--cp-secondary) 45%)'
        : 'var(--cp-secondary)',
    headerStyle: String(tpl?.decor?.headerStyle || ''),
    heroGradient:
      tpl?.decor?.gradientStyle && tpl?.decor?.gradientStyle !== 'none'
        ? 'linear-gradient(135deg, color-mix(in srgb,var(--cp-primary) 14%, transparent), color-mix(in srgb,var(--cp-secondary) 24%, transparent))'
        : 'transparent',
    paragraphSpacing: spacingMap[tpl?.layoutOptions?.paragraphSpacing] || 30,
    radius: radiusMap[tpl?.designTokens?.borderRadius] || 8,
    barPrimaryWidth: Number(
      designConfig?.barWidth?.min ?? defaultBarDesignConfig.barWidth.min,
    ),
    barSecondaryWidth: Number(
      designConfig?.secondaryBarWidth?.min ??
        defaultBarDesignConfig.secondaryBarWidth.min,
    ),
    barLayout:
      Array.isArray(designConfig?.barLayout) &&
      designConfig.barLayout.includes('double')
        ? 'double'
        : designConfig.barLayout.includes('single')
          ? 'single'
          : 'none',
    barRadius: Number(
      designConfig?.barRadius?.min ?? defaultBarDesignConfig.barRadius.min,
    ),
    photoSize: Number(designConfig?.photoSize ?? 84),
    photoType: designConfig?.photoType === 'square' ? 'square' : 'circle',
    shadow:
      tpl?.designTokens?.shadowDepth === 'none'
        ? 'none'
        : '0 10px 30px rgba(15,23,42,.18)',
  }
})

const itemStyles = computed(() => {
  const items = selectedTemplateDesign.value?.items || {}
  const build = (key: string, fallbackSize: number) => {
    const cfg = items[key] || {}
    const min = Number(cfg?.size?.min ?? fallbackSize)
    const max = Number(cfg?.size?.max ?? fallbackSize)
    const size = Math.round((min + max) / 2)
    const color =
      cfg?.colors?.[0] ||
      selectedTemplateDesign.value?.theme?.palette?.text ||
      '#111827'
    const weightMap: Record<string, string> = {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
    const weight = weightMap[cfg?.styles?.[0]] || '500'
    return { fontSize: `${size}px`, color, fontWeight: weight }
  }
  return {
    date: build('date', 18),
    address: build('address', 18),
  }
})

const decorObjects = computed(() =>
  (
    (selectedTemplateDesign.value?.decor?.objects || []) as Array<
      Record<string, any>
    >
  ).map((object) => ({
    ...object,
    x: `${toPercentNumber(object?.x, 50)}%`,
    y: `${toPercentNumber(object?.y, 50)}%`,
    size: toNumber(object?.size, 120),
    opacity: toNumber(object?.opacity, 0.08),
  })),
)
const defaultValues = computed(() => {
  const defaults = getGeneratedTemplateFakeData(selectedTemplate.value)
  return {
    fullName: String(defaults.fullName || 'Alex Martin'),
    role: String(defaults.role || 'Senior Full Stack Developer'),
    image: String(defaults.image || '/img/team-1.jpg'),
    date: String(defaults.date || 'May 3, 2026'),
    location: String(defaults.location || 'Paris, France'),
    targetCompany: String(defaults.targetCompany || 'NovaTech Solutions'),
    targetRole: String(defaults.targetRole || 'Senior Frontend Engineer'),
    heading: String(defaults.heading || 'Dear Hiring Manager,'),
    companyParagraph: String(
      defaults.companyParagraph ||
        'I am applying for the Senior Frontend Engineer position at NovaTech Solutions. Over the last eight years, I have built and scaled Vue and React products used by more than 2 million monthly users, while partnering closely with design, product, and data teams.',
    ),
    summary: String(
      defaults.summary ||
        'In my current role, I led a redesign that reduced onboarding drop-off by 23% and improved Lighthouse accessibility from 71 to 96. I would be glad to bring the same ownership and delivery mindset to your team.',
    ),
  }
})

const isLayoutRight = computed(
  () => selectedTemplate.value.layout === 'layout-right',
)
</script>

<template>
  <main
    :class="['capture-cover-letter', borderStyleClass]"
    :style="{
      '--cp-primary': selectedTemplateDesign.theme.palette.primary,
      '--cp-secondary': selectedTemplateDesign.theme.palette.secondary,
      '--cp-text': selectedTemplateDesign.theme.palette.text,
      '--cp-muted': selectedTemplateDesign.theme.palette.muted,
      '--cp-bg': selectedTemplateDesign.theme.palette.pageBackground,
      ...coverBorderCssVars,
      '--section-divider-style': resolvedStyles.sectionDividerStyle,
      '--paragraph-spacing': `${resolvedStyles.paragraphSpacing}px`,
      '--cp-radius': `${resolvedStyles.radius}px`,
      '--bar-primary-width': `${resolvedStyles.barPrimaryWidth}px`,
      '--bar-secondary-width': `${resolvedStyles.barSecondaryWidth}px`,
      '--cp-shadow': resolvedStyles.shadow,
      '--bar-radius': `${resolvedStyles.barRadius}px`,
    }"
  >
    <div
      v-for="(object, index) in decorObjects"
      :key="`cover-letter-decor-${index}`"
      class="decor-object"
      :class="`decor-${object.type || 'circle'}`"
      :style="{
        left: object.x,
        top: object.y,
        width: `${object.size}px`,
        height: `${object.size}px`,
        opacity: object.opacity ?? 0.08,
      }"
    />
    <div
      class="meta-top-right"
      :class="{ 'meta-top-right--layout-right': isLayoutRight }"
    >
      <p class="date" :style="itemStyles.date">{{ defaultValues.date }}</p>
      <p class="address" :style="itemStyles.address">
        {{ defaultValues.location }}
      </p>
    </div>
    <header
      class="hero"
      :class="{
        'hero--no-bar': resolvedStyles.barLayout === 'none',
        'hero--double': resolvedStyles.barLayout === 'double',
        'hero--ribbon': resolvedStyles.headerStyle === 'ribbon',
        'hero--layout-right': isLayoutRight,
      }"
      :style="{ background: resolvedStyles.heroGradient }"
    >
      <div
        class="hero-row"
        :class="{ 'hero-row--layout-right': isLayoutRight }"
      >
        <img
          :src="defaultValues.image"
          alt="profile"
          class="capture-photo"
          :class="{
            'capture-photo--square': resolvedStyles.photoType === 'square',
          }"
          :style="{
            width: `${resolvedStyles.photoSize}px`,
            height: `${resolvedStyles.photoSize}px`,
          }"
        />
        <h1>{{ defaultValues.fullName }}</h1>
        <p class="role">{{ defaultValues.role }}</p>
      </div>
    </header>
    <section>
      <p class="intro">{{ defaultValues.heading }}</p>
      <p class="target-role">
        Re: {{ defaultValues.targetRole }} — {{ defaultValues.targetCompany }}
      </p>
      <p>
        {{ defaultValues.companyParagraph }}
      </p>
      <p>
        {{ defaultValues.summary }}
      </p>
      <p class="signature-label">Sincerely,</p>
      <p>{{ defaultValues.fullName }}</p>
    </section>
  </main>
</template>

<style lang="scss">
@use '~/assets/styles/resume-cover-borders';
</style>

<style>
html,
body,
#__nuxt {
  min-height: 1123px;
  margin: 0;
  background: #fff;
}
</style>

<style scoped>
.capture-cover-letter {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  width: 794px;
  min-height: 1123px;
  padding: 56px 64px;
  background: var(--cp-bg);
  color: var(--cp-text);
  border-radius: var(--cp-page-border-radius);
  border: var(--cp-page-border-width) solid var(--cp-page-border-color);
  box-shadow: var(--cp-shadow);
}
.meta-top-right {
  position: absolute;
  top: 64px;
  right: 72px;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-end;
}
.meta-top-right--layout-right {
  right: auto;
  left: 72px;
  text-align: left;
  align-items: flex-start;
}
.date {
  color: var(--cp-muted);
  margin: 0;
}
.address {
  margin: 0;
}
.hero {
  border-left: var(--bar-primary-width) solid var(--cp-primary);
  padding-left: 24px;
  padding-top: 6px;
  margin-bottom: 42px;
  min-height: 140px;
  position: relative;
  border-radius: var(--bar-radius);
}
.hero--ribbon {
  padding-top: 16px;
  padding-bottom: 12px;
}
.hero--no-bar {
  border-left: 0 !important;
  border-right: 0 !important;
  padding-left: 0;
  padding-right: 0;
}
.hero--double::before {
  content: '';
  position: absolute;
  left: calc(var(--bar-primary-width) + 6px);
  top: 0;
  bottom: 0;
  width: var(--bar-secondary-width);
  background: var(--cp-secondary);
  border-radius: var(--bar-radius);
}
.hero-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hero--layout-right {
  border-left: 0;
  border-right: var(--bar-primary-width) solid var(--cp-primary);
  padding-left: 0;
  padding-right: 24px;
  text-align: right;
}
.hero--layout-right.hero--double::before {
  left: auto;
  right: calc(var(--bar-primary-width) + 6px);
}
.hero-row--layout-right {
  align-items: flex-end;
}
.hero-row--layout-right .capture-photo {
  margin-left: auto;
}
h1 {
  color: var(--cp-text);
  margin: 0;
  font-size: 44px;
  line-height: 1.05;
}
.role {
  color: var(--cp-muted);
  margin: 0;
  font-size: 24px;
}
p {
  font-size: 24px;
  line-height: 1.55;
  margin: 0 0 18px;
  color: color-mix(in srgb, var(--cp-text) 78%, #475569);
}
section {
  border-top: 2px var(--section-divider-style) var(--section-divider-color);
  padding-top: 24px;
  margin-top: 24px;
}
.intro {
  font-weight: 700;
  color: var(--cp-text);
  margin-bottom: 10px;
}
.target-role {
  font-weight: 600;
  color: var(--cp-primary);
  margin-bottom: 22px;
}
.signature-label {
  margin-top: 24px;
}
.decor-object {
  position: absolute;
  pointer-events: none;
  background: color-mix(in srgb, var(--cp-primary) 35%, transparent);
}
.decor-circle {
  border-radius: 999px;
}
.decor-ring {
  border-radius: 999px;
  background: transparent;
  border: 3px solid color-mix(in srgb, var(--cp-secondary) 55%, transparent);
}
.decor-blob {
  border-radius: 40% 60% 55% 45% / 50% 35% 65% 50%;
}
.decor-square {
  border-radius: 10px;
}
.decor-diamond {
  border-radius: 8px;
  transform: translate(-50%, -50%) rotate(45deg);
}
.decor-star {
  -webkit-clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
}
.decor-triangle {
  -webkit-clip-path: polygon(50% 0%, 0 100%, 100% 100%);
  clip-path: polygon(50% 0%, 0 100%, 100% 100%);
}
.decor-pill {
  border-radius: 999px;
}
.decor-bar {
  border-radius: 999px;
}
</style>

<style scoped>
.capture-photo {
  width: 84px;
  height: 84px;
  border-radius: 999px;
  object-fit: cover;
  margin-bottom: 8px;
  border: 2px solid #0f172a;
}
.capture-photo--square {
  border-radius: 12px;
}
</style>
