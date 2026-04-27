<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'

const props = withDefaults(defineProps<{
  resume: any
  editable?: boolean
  variant?: 'detailed' | 'bullets' | 'compact' | string
  themeTokens?: Record<string, string | number>
  layoutDensity?: 'compact' | 'normal' | 'spacious' | string
  toolbarEnabled?: boolean
  title?: string
  canMoveUp?: boolean
  canMoveDown?: boolean
}>(), {
  editable: false,
  variant: 'detailed',
  themeTokens: () => ({}),
  layoutDensity: 'normal',
  toolbarEnabled: false,
  title: 'Experience',
  canMoveUp: false,
  canMoveDown: false,
})

const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'experience'): void
  (event: 'change-variant', sectionKey: 'experience', variant: string): void
  (event: 'move-section', sectionKey: 'experience', direction: 'up' | 'down'): void
}>()

const sectionStyle = computed(() => ({ ...props.themeTokens }))

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
  <section class="resume-section resume-section-hoverable experience" :class="`density-${layoutDensity}`" :style="sectionStyle">
    <SectionToolbar v-if="toolbarEnabled" section-key="experience" :variants="[{ label: 'Detailed', value: 'detailed' }, { label: 'Bullets', value: 'bullets' }, { label: 'Compact', value: 'compact' }]" :current-variant="variant" :can-move-up="canMoveUp" :can-move-down="canMoveDown" @add-item="() => emit('add-item', 'experience')" @change-variant="(_, next) => emit('change-variant', 'experience', next)" @move-up="() => emit('move-section', 'experience', 'up')" @move-down="() => emit('move-section', 'experience', 'down')" />
    <h2 class="cv-heading-section">{{ title }}</h2>
    <article v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" class="entry text-dark">
      <h4 class="text-dark">
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.role`, (event.target as HTMLElement).innerText)">{{ experience.role }}</span>,
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.company`, (event.target as HTMLElement).innerText)">{{ experience.company }}</span>
        <template v-if="variant !== 'compact' && experience.city">,
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.city`, (event.target as HTMLElement).innerText)">{{ experience.city }}</span>
        </template>
      </h4>
      <p class="dates">
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.start`, (event.target as HTMLElement).innerText)">{{ experience.start }}</span> -
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.end`, (event.target as HTMLElement).innerText)">{{ experience.end }}</span>
      </p>
      <ul v-if="variant !== 'compact'">
        <li v-for="(bullet, bulletIndex) in experience.bullets" :key="bulletIndex" class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.bullets.${bulletIndex}`, (event.target as HTMLElement).innerText)">{{ bullet }}</li>
      </ul>
      <p v-else class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.bullets.0`, (event.target as HTMLElement).innerText)">{{ experience.bullets?.[0] }}</p>
    </article>
  </section>
</template>

<style scoped>
.resume-section {
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
.entry { margin-bottom: var(--entry-gap, 16px); }
.entry {
  position: relative;
  border: var(--rs-card-border, none);
  background: var(--rs-card-bg, transparent);
  border-radius: var(--rs-card-radius, 0);
  padding: var(--rs-card-padding, 0);
  border-left: var(--rs-entry-border-left, none);
  padding-left: var(--rs-entry-padding-left, 0);
}
.entry::before {
  content: '';
  position: absolute;
  left: -10px;
  top: .55rem;
  width: var(--rs-marker-width, var(--rs-marker-size, 0));
  height: var(--rs-marker-height, var(--rs-marker-size, 0));
  border-radius: var(--rs-marker-radius, 0);
  background: color-mix(in srgb, var(--cv-accent) 55%, transparent);
}
.density-compact { --entry-gap: 10px; }
.density-normal { --entry-gap: 16px; }
.density-spacious { --entry-gap: 22px; }
</style>
