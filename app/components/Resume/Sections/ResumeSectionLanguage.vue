<script setup lang="ts">
import {
  levelToPercent,
  levelToStars,
  levelToText,
} from '~/utils/resumeLanguageLevel'
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import { getSectionRegistryEntry } from '~/constants/resumeSectionRegistry'

const props = withDefaults(
  defineProps<{
    resume: any
    editable?: boolean
    variant?: 'classic' | 'text-level' | 'stars' | 'progress' | 'flags' | string
    themeTokens?: Record<string, string | number>
    layoutDensity?: 'compact' | 'normal' | 'spacious' | string
    toolbarEnabled?: boolean
    title?: string
    canMoveUp?: boolean
    canMoveDown?: boolean
    sectionIcon?: string
    showSectionIcon?: boolean
  }>(),
  {
    editable: false,
    variant: 'text-level',
    themeTokens: () => ({}),
    layoutDensity: 'normal',
    toolbarEnabled: false,
    title: 'Languages',
    canMoveUp: false,
    canMoveDown: false,
    sectionIcon: undefined,
    showSectionIcon: true,
  },
)
const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'language'): void
  (event: 'change-variant', sectionKey: 'language', variant: string): void
  (
    event: 'move-section',
    sectionKey: 'language',
    direction: 'up' | 'down',
  ): void
  (event: 'delete-section', sectionKey: 'language'): void
}>()
const sectionStyle = computed(() => ({ ...props.themeTokens }))
const sectionRegistry = getSectionRegistryEntry('language')
const safeVariant = computed<
  'classic' | 'text-level' | 'stars' | 'progress' | 'flags'
>(() => {
  if (
    props.variant === 'classic' ||
    props.variant === 'text-level' ||
    props.variant === 'stars' ||
    props.variant === 'progress' ||
    props.variant === 'flags'
  ) {
    return props.variant
  }
  if (import.meta.dev) {
    console.warn(
      `[resume-section:language] Unknown variant "${String(props.variant)}"; fallback to "classic".`,
    )
  }
  return 'classic'
})
function updateText(path: string, value: unknown) {
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

function toFlagEmoji(countryCode: string) {
  const normalized = countryCode.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return ''
  return normalized
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('')
}

function resolveLanguageFlag(language: Record<string, unknown>) {
  const explicitFlag = String(language.flag || '').trim()
  if (explicitFlag) return explicitFlag
  const countryCode = String(language.countryCode || '').trim()
  if (countryCode) return `/images/flags/${countryCode.toLowerCase()}.svg`
  return toFlagEmoji(countryCode) || ''
}

function removeLanguage(index: number) {
  const languages = Array.isArray(props.resume.languages)
    ? props.resume.languages
    : []
  updateText(
    'languages',
    languages.filter((_: unknown, itemIndex: number) => itemIndex !== index),
  )
}
</script>
<template>
  <section
    :class="[
      'language-section',
      'resume-section-hoverable',
      `density-${layoutDensity}`,
    ]"
    :style="sectionStyle"
  >
    <SectionToolbar
      v-if="toolbarEnabled"
      section-key="language"
      :variants="sectionRegistry.variants"
      :actions="sectionRegistry.toolbarActions"
      :current-variant="safeVariant"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @add-item="() => emit('add-item', 'language')"
      @change-variant="(_, next) => emit('change-variant', 'language', next)"
      @move-up="() => emit('move-section', 'language', 'up')"
      @move-down="() => emit('move-section', 'language', 'down')"
      @delete-section="() => emit('delete-section', 'language')"
    />
    <h3 class="cv-heading-section">
      <span v-if="showSectionIcon && sectionIcon" class="section-icon">
        <v-icon :icon="sectionIcon" size="16" />
      </span>
      <span>{{ title }}</span>
    </h3>
    <ul
      v-if="safeVariant === 'classic' || safeVariant === 'text-level'"
      class="bars"
    >
      <li
        v-for="(language, index) in resume.languages"
        :key="`${language.name}-${index}`"
      >
        <span
          class="editable-text"
          :contenteditable="editable"
          @input="
            (event) =>
              updateText(
                `languages.${index}.name`,
                (event.target as HTMLElement).innerText,
              )
          "
          >{{ language.name }}</span>
        <small class="ms-2">{{ levelToText(language.level) }}</small>
        <v-btn
          v-if="editable"
          class="resume-item-delete"
          icon
          size="x-small"
          variant="text"
          color="error"
          aria-label="Supprimer cette langue"
          @click="removeLanguage(index)"
        >
          <v-icon icon="mdi-close" size="14" />
        </v-btn>
      </li>
    </ul>
    <ul v-else-if="safeVariant === 'stars'" class="bars">
      <li
        v-for="(language, index) in resume.languages"
        :key="`${language.name}-${index}`"
        class="d-flex align-center ga-2"
      >
        <span
          class="editable-text"
          :contenteditable="editable"
          @input="
            (event) =>
              updateText(
                `languages.${index}.name`,
                (event.target as HTMLElement).innerText,
              )
          "
          >{{ language.name }}</span
        >
        <v-rating :model-value="levelToStars(language.level)" readonly length="5" density="compact" class="ms-auto" :color="String(themeTokens['--cv-accent'] || 'primary')" size="16" />
        <v-btn
          v-if="editable"
          class="resume-item-delete"
          icon
          size="x-small"
          variant="text"
          color="error"
          aria-label="Supprimer cette langue"
          @click="removeLanguage(index)"
        >
          <v-icon icon="mdi-close" size="14" />
        </v-btn>
      </li>
    </ul>
    <ul v-else-if="safeVariant === 'progress'" class="bars">
      <li
        v-for="(language, index) in resume.languages"
        :key="`${language.name}-${index}`"
      >
        <div class="d-flex align-center ga-2">
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `languages.${index}.name`,
                  (event.target as HTMLElement).innerText,
                )
            "
            >{{ language.name }}</span>
          <v-progress-circular :model-value="levelToPercent(language.level)" size="24" width="3" :color="String(themeTokens['--cv-accent'] || 'primary')">
            <small>{{ levelToPercent(language.level) }}%</small>
          </v-progress-circular>
        </div>
        <v-progress-linear :model-value="levelToPercent(language.level)" height="8" rounded :color="String(themeTokens['--cv-accent'] || 'primary')" />
        <v-btn
          v-if="editable"
          class="resume-item-delete"
          icon
          size="x-small"
          variant="text"
          color="error"
          aria-label="Supprimer cette langue"
          @click="removeLanguage(index)"
        >
          <v-icon icon="mdi-close" size="14" />
        </v-btn>
      </li>
    </ul>
    <ul v-else class="bars">
      <li
        v-for="(language, index) in resume.languages"
        :key="`${language.name}-${index}`"
      >
        <div class="d-flex align-center ga-2 justify-space-between">
          <div class="d-flex align-center ga-2">
            <img
              v-if="resolveLanguageFlag(language)"
              class="language-flag-image"
              :src="resolveLanguageFlag(language)"
              :alt="`${language.name} flag`"
              width="18"
              height="14"
            />
            <span
              v-else
              class="editable-text"
              :contenteditable="editable"
              @input="
                (event) =>
                  updateText(
                    `languages.${index}.name`,
                    (event.target as HTMLElement).innerText,
                  )
              "
              >{{ language.name }}</span
            >
            <span
              v-if="resolveLanguageFlag(language)"
              class="editable-text"
              :contenteditable="editable"
              @input="
                (event) =>
                  updateText(
                    `languages.${index}.name`,
                    (event.target as HTMLElement).innerText,
                  )
              "
              >{{ language.name }}</span
            >
          </div>
          <v-rating :model-value="levelToStars(language.level)" readonly length="5" density="compact" class="ms-auto" :color="String(themeTokens['--cv-accent'] || 'primary')" size="14" />
        </div>
        <v-btn
          v-if="editable"
          class="resume-item-delete"
          icon
          size="x-small"
          variant="text"
          color="error"
          aria-label="Supprimer cette langue"
          @click="removeLanguage(index)"
        >
          <v-icon icon="mdi-close" size="14" />
        </v-btn>
      </li>
    </ul>
  </section>
</template>
<style scoped>
.language-section {
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
.bars {
  list-style: none;
  padding: 0;
  margin: 0;
}
.bars li {
  position: relative;
  margin-bottom: var(
    --entry-gap,
    calc(var(--cv-space-2) + var(--cv-space-1) / 2)
  );
  border: var(--rs-card-border, none);
  background: var(--rs-card-bg, transparent);
  border-radius: var(--rs-card-radius, 0);
  padding: var(--rs-card-padding, 0);
  border-left: var(--rs-entry-border-left, none);
  padding-left: var(--rs-entry-padding-left, 0);
}
.resume-item-delete {
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease;
}
.bars li:hover .resume-item-delete,
.bars li:focus-within .resume-item-delete {
  opacity: 1;
  pointer-events: auto;
}
.bars li::before {
  content: '';
  position: absolute;
  left: calc((var(--cv-space-2) + var(--cv-space-1)) * -1);
  top: 0.45rem;
  width: var(--rs-marker-width, var(--rs-marker-size, 0));
  height: var(--rs-marker-height, var(--rs-marker-size, 0));
  border-radius: var(--rs-marker-radius, 0);
  background: var(--cv-marker-accent);
}
.bars li:last-child {
  margin-bottom: 0;
}
.progress {
  height: var(--cv-space-1);
  background: var(--cv-progress-bg);
  margin-top: var(--cv-space-1);
}
.progress i {
  display: block;
  height: 4px;
  background: var(--cv-accent);
}
.progress i {
  height: var(--cv-space-1);
}
.language-flag-image {
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid color-mix(in srgb, var(--cv-accent) 12%, transparent);
}
.density-compact {
  --entry-gap: calc(var(--cv-space-2) - var(--cv-space-1) / 2);
}
.density-normal {
  --entry-gap: calc(var(--cv-space-2) + var(--cv-space-1) / 2);
}
.density-spacious {
  --entry-gap: calc(var(--cv-space-3) + var(--cv-space-1) / 2);
}
</style>

<style scoped>
.section-icon { display:inline-flex; align-items:center; justify-content:center; color: var(--resume-section-icon-color, var(--cv-accent)); margin-right: 6px; }
</style>
