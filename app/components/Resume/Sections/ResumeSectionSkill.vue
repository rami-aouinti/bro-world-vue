<script setup lang="ts">
import { levelToPercent, levelToStars, levelToText } from '~/utils/resumeLanguageLevel'
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import { getSectionRegistryEntry } from '~/constants/resumeSectionRegistry'

type SkillVariant = 'classic' | 'text-level' | 'stars' | 'dots' | 'progress'

const props = withDefaults(defineProps<{
  resume: any
  editable?: boolean
  variant?: SkillVariant | string
  themeTokens?: Record<string, string | number>
  layoutDensity?: 'compact' | 'normal' | 'spacious' | string
  toolbarEnabled?: boolean
  title?: string
  canMoveUp?: boolean
  canMoveDown?: boolean
}>(), {
  editable: false,
  variant: 'classic',
  themeTokens: () => ({}),
  layoutDensity: 'normal',
  toolbarEnabled: false,
  title: 'Skills',
  canMoveUp: false,
  canMoveDown: false,
})

const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'skill'): void
  (event: 'change-variant', sectionKey: 'skill', variant: string): void
  (event: 'move-section', sectionKey: 'skill', direction: 'up' | 'down'): void
}>()

const sectionStyle = computed(() => ({ ...props.themeTokens }))
const sectionRegistry = getSectionRegistryEntry('skill')

const safeVariant = computed<SkillVariant>(() => {
  if (
    props.variant === 'classic' ||
    props.variant === 'text-level' ||
    props.variant === 'stars' ||
    props.variant === 'dots' ||
    props.variant === 'progress'
  ) {
    return props.variant
  }

  if (import.meta.dev) {
    console.warn(`[resume-section:skill] Unknown variant "${String(props.variant)}"; fallback to "classic".`)
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

function levelToDots(level: number | string) {
  return `${'●'.repeat(levelToStars(level))}${'○'.repeat(5 - levelToStars(level))}`
}
</script>

<template>
  <section :class="['skill-section', 'resume-section-hoverable', `density-${layoutDensity}`]" :style="sectionStyle">
    <SectionToolbar
      v-if="toolbarEnabled"
      section-key="skill"
      :variants="sectionRegistry.variants"
      :actions="sectionRegistry.toolbarActions"
      :current-variant="safeVariant"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @add-item="() => emit('add-item', 'skill')"
      @change-variant="(_, next) => emit('change-variant', 'skill', next)"
      @move-up="() => emit('move-section', 'skill', 'up')"
      @move-down="() => emit('move-section', 'skill', 'down')"
    />

    <h3 class="cv-heading-section">{{ title }}</h3>

    <ul v-if="safeVariant === 'classic' || safeVariant === 'progress'" class="bars">
      <li v-for="(skill, index) in resume.skills" :key="`${skill.name}-${index}`">
        <div class="d-flex align-center ga-2 justify-space-between">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
          <small>{{ levelToPercent(skill.level) }}%</small>
        </div>
        <div class="progress"><i :style="{ width: `${levelToPercent(skill.level)}%` }" /></div>
      </li>
    </ul>

    <ul v-else-if="safeVariant === 'text-level'" class="bars">
      <li v-for="(skill, index) in resume.skills" :key="`${skill.name}-${index}`">
        <small>{{ levelToText(skill.level) }} — </small>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
      </li>
    </ul>

    <ul v-else-if="safeVariant === 'stars'" class="bars">
      <li v-for="(skill, index) in resume.skills" :key="`${skill.name}-${index}`" class="d-flex align-center ga-2 justify-space-between">
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
        <small>{{ `${'★'.repeat(levelToStars(skill.level))}${'☆'.repeat(5 - levelToStars(skill.level))}` }}</small>
      </li>
    </ul>

    <ul v-else class="bars">
      <li v-for="(skill, index) in resume.skills" :key="`${skill.name}-${index}`" class="d-flex align-center ga-2 justify-space-between">
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
        <small>{{ levelToDots(skill.level) }}</small>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.skill-section {
  --cv-space-1: var(--cv-space-1, 4px);
  --cv-space-2: var(--cv-space-2, 8px);
  --cv-space-3: var(--cv-space-3, 12px);
  --cv-space-4: var(--cv-space-4, 16px);
  --cv-marker-accent: color-mix(in srgb, var(--cv-accent) 55%, transparent);
  --cv-progress-bg: color-mix(in srgb, var(--cv-accent) 22%, var(--cv-page));

  position: relative;
  border-bottom: var(--rs-section-separator, none);
  padding-bottom: var(--rs-section-padding-bottom, 0);
}

.cv-heading-section {
  display: inline-flex;
  align-items: center;
  gap: var(--cv-space-2);
  border-bottom: var(--rs-heading-border-bottom, 0);
  background: var(--rs-heading-bg, transparent);
  border-radius: var(--rs-heading-radius, 0);
  padding: var(--rs-heading-padding, 0);
}

.bars { list-style: none; padding: 0; margin: 0; }

.bars li {
  position: relative;
  margin-bottom: var(--entry-gap, calc(var(--cv-space-2) + var(--cv-space-1) / 2));
  border: var(--rs-card-border, none);
  background: var(--rs-card-bg, transparent);
  border-radius: var(--rs-card-radius, 0);
  padding: var(--rs-card-padding, 0);
  border-left: var(--rs-entry-border-left, none);
  padding-left: var(--rs-entry-padding-left, 0);
}
.bars li:last-child {
  margin-bottom: 0;
}

.bars li::before {
  content: '';
  position: absolute;
  left: calc((var(--cv-space-2) + var(--cv-space-1)) * -1);
  top: .45rem;
  width: var(--rs-marker-width, var(--rs-marker-size, 0));
  height: var(--rs-marker-height, var(--rs-marker-size, 0));
  border-radius: var(--rs-marker-radius, 0);
  background: var(--cv-marker-accent);
}

.progress { height: var(--cv-space-1); background: var(--cv-progress-bg); margin-top: var(--cv-space-1); }
.progress i { display: block; height: var(--cv-space-1); background: var(--cv-accent); }

.density-compact { --entry-gap: calc(var(--cv-space-2) - var(--cv-space-1) / 2); }
.density-normal { --entry-gap: calc(var(--cv-space-2) + var(--cv-space-1) / 2); }
.density-spacious { --entry-gap: calc(var(--cv-space-3) + var(--cv-space-1) / 2); }
</style>
