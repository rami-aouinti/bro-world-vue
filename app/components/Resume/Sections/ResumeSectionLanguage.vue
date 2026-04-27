<script setup lang="ts">
import { levelToPercent, levelToStars, levelToText } from '~/utils/resumeLanguageLevel'
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'

const props = withDefaults(defineProps<{
  resume: any
  editable?: boolean
  variant?: 'classic' | 'text-level' | 'stars' | 'progress' | string
  themeTokens?: Record<string, string | number>
  layoutDensity?: 'compact' | 'normal' | 'spacious' | string
  toolbarEnabled?: boolean
  title?: string
  canMoveUp?: boolean
  canMoveDown?: boolean
}>(), {
  editable: false,
  variant: 'text-level',
  themeTokens: () => ({}),
  layoutDensity: 'normal',
  toolbarEnabled: false,
  title: 'Languages',
  canMoveUp: false,
  canMoveDown: false,
})
const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'language'): void
  (event: 'change-variant', sectionKey: 'language', variant: string): void
  (event: 'move-section', sectionKey: 'language', direction: 'up' | 'down'): void
}>()
const sectionStyle = computed(() => ({ ...props.themeTokens }))
const safeVariant = computed<'classic' | 'text-level' | 'stars' | 'progress'>(() => {
  if (props.variant === 'classic' || props.variant === 'text-level' || props.variant === 'stars' || props.variant === 'progress') {
    return props.variant
  }
  if (import.meta.dev) {
    console.warn(`[resume-section:language] Unknown variant "${String(props.variant)}"; fallback to "classic".`)
  }
  return 'classic'
})
function updateText(path: string, value: string) {
  const segments = path.split('.')
  const last = segments.pop()
  if (!last) return
  let target: Record<string, any> = props.resume
  for (const segment of segments) {
    if (!(segment in target)) return
    target = target[segment]
  }
  target[last] = value
}
</script>
<template>
  <section :class="['language-section', 'resume-section-hoverable', `density-${layoutDensity}`]" :style="sectionStyle">
    <SectionToolbar v-if="toolbarEnabled" section-key="language" :variants="[{ label: 'Text level', value: 'text-level' }, { label: 'Stars', value: 'stars' }, { label: 'Progress', value: 'progress' }]" :current-variant="safeVariant" :can-move-up="canMoveUp" :can-move-down="canMoveDown" @add-item="() => emit('add-item', 'language')" @change-variant="(_, next) => emit('change-variant', 'language', next)" @move-up="() => emit('move-section', 'language', 'up')" @move-down="() => emit('move-section', 'language', 'down')" />
    <h3 class="cv-heading-section">{{ title }}</h3>
    <ul v-if="safeVariant === 'classic' || safeVariant === 'text-level'" class="bars">
      <li v-for="(language, index) in resume.languages" :key="`${language.name}-${index}`">
        <small>{{ levelToText(language.level) }} — </small>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`languages.${index}.name`, (event.target as HTMLElement).innerText)">{{ language.name }}</span>
      </li>
    </ul>
    <ul v-else-if="safeVariant === 'stars'" class="bars">
      <li v-for="(language, index) in resume.languages" :key="`${language.name}-${index}`" class="d-flex align-center ga-2">
        <v-rating :model-value="levelToStars(language.level)" readonly length="5" density="compact" color="amber" size="16" />
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`languages.${index}.name`, (event.target as HTMLElement).innerText)">{{ language.name }}</span>
      </li>
    </ul>
    <ul v-else class="bars">
      <li v-for="(language, index) in resume.languages" :key="`${language.name}-${index}`">
        <div class="d-flex align-center ga-2">
          <small>{{ levelToPercent(language.level) }}%</small>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`languages.${index}.name`, (event.target as HTMLElement).innerText)">{{ language.name }}</span>
        </div>
        <div class="progress"><i :style="{ width: `${levelToPercent(language.level)}%` }" /></div>
      </li>
    </ul>
  </section>
</template>
<style scoped>
.language-section {
  position: relative;
  border-bottom: var(--rs-section-separator, none);
  padding-bottom: var(--rs-section-padding-bottom, 0);
}
.cv-heading-section {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-bottom: var(--rs-heading-border-bottom, 0);
  background: var(--rs-heading-bg, transparent);
  border-radius: var(--rs-heading-radius, 0);
  padding: var(--rs-heading-padding, 0);
}
.bars { list-style: none; padding: 0; margin: 0; }
.bars li {
  position: relative;
  margin-bottom: var(--entry-gap, 10px);
  border: var(--rs-card-border, none);
  background: var(--rs-card-bg, transparent);
  border-radius: var(--rs-card-radius, 0);
  padding: var(--rs-card-padding, 0);
  border-left: var(--rs-entry-border-left, none);
  padding-left: var(--rs-entry-padding-left, 0);
}
.bars li::before {
  content: '';
  position: absolute;
  left: -10px;
  top: .45rem;
  width: var(--rs-marker-width, var(--rs-marker-size, 0));
  height: var(--rs-marker-height, var(--rs-marker-size, 0));
  border-radius: var(--rs-marker-radius, 0);
  background: color-mix(in srgb, var(--cv-accent) 55%, transparent);
}
.progress { height: 4px; background: color-mix(in srgb, var(--cv-accent) 22%, var(--cv-page)); margin-top: 4px; }
.progress i { display: block; height: 4px; background: var(--cv-accent); }
.density-compact { --entry-gap: 6px; }
.density-normal { --entry-gap: 10px; }
.density-spacious { --entry-gap: 14px; }
</style>
