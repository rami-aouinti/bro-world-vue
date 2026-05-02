<script setup lang="ts">
import type { ResumeEditableSectionKey } from '~/types/resumeDocumentModel'

const props = withDefaults(
  defineProps<{
    title?: string
    icon?: string
    tone?: 'default' | 'on-primary'
    variant?: 'h2' | 'h3' | string
    sectionKey?: ResumeEditableSectionKey
    divider?: boolean
    showIcon?: boolean
  }>(),
  {
    title: undefined,
    icon: undefined,
    tone: 'default',
    variant: 'h3',
    sectionKey: undefined,
    divider: false,
    showIcon: true,
  },
)

const { t } = useI18n()

const fallbackTitleBySection: Record<ResumeEditableSectionKey, string> = {
  experience: 'Experience',
  education: 'Education',
  skill: 'Skills',
  language: 'Languages',
  hobby: 'Hobbies',
  project: 'Projects',
  certification: 'Certifications',
  reference: 'References',
}

const resolvedTitle = computed(() => {
  if (props.title?.trim()) return props.title
  if (!props.sectionKey) return ''
  return (
    t(`resume.registry.sections.${props.sectionKey}`) ||
    fallbackTitleBySection[props.sectionKey]
  )
})

const headingTag = computed(() => (props.variant === 'h2' ? 'h2' : 'h3'))
</script>

<template>
  <component
    :is="headingTag"
    class="resume-section-heading"
    :class="[`resume-section-heading--${tone}`]"
  >
    <span v-if="showIcon && icon" class="resume-section-heading__icon">
      <v-icon :icon="icon" size="18" />
    </span>
    <span class="resume-section-heading__label">{{ resolvedTitle }}</span>
    <span class="resume-section-heading__toolbar" role="toolbar" aria-label="Section actions">
      <button type="button" class="resume-section-heading__tool-btn" aria-label="Add section">
        <v-icon icon="mdi-plus" size="14" />
      </button>
      <button type="button" class="resume-section-heading__tool-btn" aria-label="Remove section">
        <v-icon icon="mdi-minus" size="14" />
      </button>
    </span>
    <span
      v-if="divider"
      class="resume-section-heading__line"
      aria-hidden="true"
    />
  </component>
</template>

<style scoped>
.resume-section-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.65rem;
  font-size: clamp(1rem, 1.4vw, 1.125rem);
  line-height: 1.25;
  letter-spacing: 0.01em;
  font-weight: 650;
}

.resume-section-heading__icon {
  display: inline-flex;
  align-items: center;
}

.resume-section-heading__label {
  font-weight: inherit;
}

.resume-section-heading--on-primary {
  color: rgba(255, 255, 255, 0.96);
}

.resume-section-heading__line {
  flex: 1;
  min-width: 1.5rem;
  height: 1px;
  opacity: 0.5;
  background: currentColor;
}

.resume-section-heading__toolbar {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-4px);
  transition: opacity .15s ease, transform .15s ease;
}

.resume-section-heading:hover .resume-section-heading__toolbar,
.resume-section-heading:focus-within .resume-section-heading__toolbar {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.resume-section-heading__tool-btn {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
  color: inherit;
  background: color-mix(in srgb, currentColor 10%, transparent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .15s ease, transform .15s ease;
}

.resume-section-heading__tool-btn:hover {
  background: color-mix(in srgb, currentColor 18%, transparent);
  transform: translateY(-1px);
}
</style>
