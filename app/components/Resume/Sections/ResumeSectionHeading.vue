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

</style>
