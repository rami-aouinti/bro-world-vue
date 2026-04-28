<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import {
  RESUME_CONTENT_STYLE_OPTIONS,
  getSectionRegistryEntry,
} from '~/constants/resumeSectionRegistry'
import type { ResumeSectionIconStyle } from '~/constants/resumeTemplateSkins'
import { formatResumeMonthYear } from '~/utils/resumeDateFormat'


const props = withDefaults(
  defineProps<{
    resume: any
    editable?: boolean
    variant?: 'detailed' | 'bullets' | 'compact' | 'timeline' | string
    layoutSettings?: {
      dateColumnWidth?: number | string
    }
    themeTokens?: Record<string, string | number>
    layoutDensity?: 'compact' | 'normal' | 'spacious' | string
    toolbarEnabled?: boolean
    title?: string
    canMoveUp?: boolean
    canMoveDown?: boolean
    sectionIcon?: string
    showSectionIcon?: boolean
    sectionIconStyle?: ResumeSectionIconStyle
  }>(),
  {
    editable: false,
    variant: 'detailed',
    layoutSettings: () => ({}),
    themeTokens: () => ({}),
    layoutDensity: 'normal',
    toolbarEnabled: false,
    title: 'Experience',
    canMoveUp: false,
    canMoveDown: false,
    sectionIcon: undefined,
    showSectionIcon: true,
    sectionIconStyle: undefined,
  },
)

const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'experience'): void
  (event: 'change-variant', sectionKey: 'experience', variant: string): void
  (
    event: 'move-section',
    sectionKey: 'experience',
    direction: 'up' | 'down',
  ): void
  (event: 'delete-section', sectionKey: 'experience'): void
}>()

const brokenLogoByKey = reactive<Record<string, boolean>>({})
const iconVariantClass = computed(() =>
  props.sectionIconStyle?.variant
    ? `section-icon--${props.sectionIconStyle.variant}`
    : 'section-icon--outline',
)
const iconStyle = computed(() => ({
  '--resume-section-icon-size': `${props.sectionIconStyle?.size ?? 18}px`,
  '--resume-section-icon-color':
    props.sectionIconStyle?.color ?? 'var(--cv-accent)',
  '--resume-section-icon-gap': `${props.sectionIconStyle?.spacing ?? 8}px`,
}))
const sectionLayoutStyle = computed(() => {
  const width = props.layoutSettings?.dateColumnWidth
  const normalized = typeof width === 'number' ? `${width}px` : width
  return {
    ...props.themeTokens,
    '--resume-date-column-width': normalized || '140px',
  }
})
const isTimelineVariant = computed(() => props.variant === 'timeline')
const sectionRegistry = getSectionRegistryEntry('experience')
const contentStyles = computed(() =>
  RESUME_CONTENT_STYLE_OPTIONS.filter((option) =>
    sectionRegistry.contentStyles.includes(option.value),
  ),
)

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

function updateDateText(path: string, value: string) {
  updateText(path, formatResumeMonthYear(value))
}

function resolveContentStyle(item: Record<string, unknown>) {
  return item.contentStyle === 'dashes' || item.contentStyle === 'timeline'
    ? item.contentStyle
    : 'points'
}

function resolvePoints(item: Record<string, unknown>) {
  if (Array.isArray(item.points) && item.points.length) return item.points
  if (Array.isArray(item.bullets) && item.bullets.length) return item.bullets
  return []
}

function resolveDashes(item: Record<string, unknown>) {
  if (Array.isArray(item.dashes) && item.dashes.length) return item.dashes
  return resolvePoints(item)
}

function resolveTimelineEvents(item: Record<string, unknown>) {
  if (Array.isArray(item.timelineEvents) && item.timelineEvents.length)
    return item.timelineEvents
  return resolvePoints(item).map((detail) => ({ label: '', detail }))
}

function logoKey(index: number, url: unknown) {
  return `${index}-${String(url)}`
}

function showCompanyLogo(index: number, companyImageUrl?: unknown) {
  const normalizedUrl = String(companyImageUrl || '').trim()
  if (!normalizedUrl) return false
  return !brokenLogoByKey[logoKey(index, normalizedUrl)]
}

function onCompanyLogoError(index: number, companyImageUrl?: unknown) {
  const normalizedUrl = String(companyImageUrl || '').trim()
  if (!normalizedUrl) return
  brokenLogoByKey[logoKey(index, normalizedUrl)] = true
}

function removeExperience(index: number) {
  const experiences = Array.isArray(props.resume.experiences)
    ? props.resume.experiences
    : []
  updateText(
    'experiences',
    experiences.filter((_: unknown, itemIndex: number) => itemIndex !== index),
  )
}
</script>

<template>
  <section
    class="resume-section resume-section-hoverable experience"
    :class="[
      `density-${layoutDensity}`,
      { 'experience--timeline': isTimelineVariant },
    ]"
    :style="sectionLayoutStyle"
  >
    <SectionToolbar
      v-if="toolbarEnabled"
      section-key="experience"
      :variants="sectionRegistry.variants"
      :content-styles="contentStyles"
      :actions="sectionRegistry.toolbarActions"
      :current-variant="variant"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @add-item="() => emit('add-item', 'experience')"
      @change-variant="(_, next) => emit('change-variant', 'experience', next)"
      @move-up="() => emit('move-section', 'experience', 'up')"
      @move-down="() => emit('move-section', 'experience', 'down')"
      @delete-section="() => emit('delete-section', 'experience')"
    />
    <h2 class="cv-heading-section">
      <span
        v-if="showSectionIcon && sectionIcon"
        class="section-icon"
        :class="iconVariantClass"
        :style="iconStyle"
      >
        <v-icon :icon="sectionIcon" :size="sectionIconStyle?.size ?? 18" />
      </span>
      <span>{{ title }}</span>
    </h2>
    <article
      v-for="(experience, index) in resume.experiences"
      :key="`${experience.company}-${index}`"
      class="entry text-dark"
    >
      <v-btn
        v-if="editable"
        class="resume-item-delete"
        icon
        size="x-small"
        variant="text"
        color="error"
        aria-label="Supprimer cette expérience"
        @click="removeExperience(index)"
      >
        <v-icon icon="mdi-close" size="14" />
      </v-btn>
      <div class="date-column dates">
        <h4 class="text-dark experience-heading">
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `experiences.${index}.role`,
                  (event.target as HTMLElement).innerText,
                )
            "
            >{{ experience.role }}</span
          >,
          <span class="company-line">
            <img
              v-if="showCompanyLogo(index, experience.companyImageUrl)"
              :src="experience.companyImageUrl"
              alt=""
              class="company-logo"
              @error="onCompanyLogoError(index, experience.companyImageUrl)"
            />
            <span
              class="editable-text"
              :contenteditable="editable"
              @input="
                (event) =>
                  updateText(
                    `experiences.${index}.company`,
                    (event.target as HTMLElement).innerText,
                  )
              "
              >{{ experience.company }}</span
            >
          </span>
          <template v-if="variant !== 'compact' && experience.city"
            >,
            <span
              class="editable-text"
              :contenteditable="editable"
              @input="
                (event) =>
                  updateText(
                    `experiences.${index}.city`,
                    (event.target as HTMLElement).innerText,
                  )
              "
              >{{ experience.city }}</span
            >
          </template>
        </h4>
        <p class="dates">
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateDateText(
                  `experiences.${index}.start`,
                  (event.target as HTMLElement).innerText,
                )
            "
            >{{ formatResumeMonthYear(experience.start) }}</span
          >
          -
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateDateText(
                  `experiences.${index}.end`,
                  (event.target as HTMLElement).innerText,
                )
            "
            >{{ formatResumeMonthYear(experience.end) }}</span
          >
        </p>
      </div>
      <div class="content-column">
        <h4 class="text-dark">
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `experiences.${index}.role`,
                  (event.target as HTMLElement).innerText,
                )
            "
            >{{ experience.role }}</span
          >,
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `experiences.${index}.company`,
                  (event.target as HTMLElement).innerText,
                )
            "
            >{{ experience.company }}</span
          >
          <template v-if="variant !== 'compact' && experience.city"
            >,
            <span
              class="editable-text"
              :contenteditable="editable"
              @input="
                (event) =>
                  updateText(
                    `experiences.${index}.city`,
                    (event.target as HTMLElement).innerText,
                  )
              "
              >{{ experience.city }}</span
            >
          </template>
        </h4>
        <template v-if="resolveContentStyle(experience) === 'timeline'">
          <div class="timeline-block">
            <div
              v-for="(event, eventIndex) in resolveTimelineEvents(experience)"
              :key="eventIndex"
              class="timeline-event"
            >
              <strong
                class="editable-text"
                :contenteditable="editable"
                @input="
                  (entry) =>
                    updateText(
                      `experiences.${index}.timelineEvents.${eventIndex}.label`,
                      (entry.target as HTMLElement).innerText,
                    )
                "
                >{{ event.label }}</strong
              >
              <span
                class="editable-text"
                :contenteditable="editable"
                @input="
                  (entry) =>
                    updateText(
                      `experiences.${index}.timelineEvents.${eventIndex}.detail`,
                      (entry.target as HTMLElement).innerText,
                    )
                "
                >{{ event.detail }}</span
              >
            </div>
          </div>
        </template>
        <ul
          v-else-if="resolveContentStyle(experience) === 'dashes'"
          class="dash-list"
        >
          <li
            v-for="(dash, dashIndex) in resolveDashes(experience)"
            :key="dashIndex"
            class="text-dark editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `experiences.${index}.dashes.${dashIndex}`,
                  (event.target as HTMLElement).innerText,
                )
            "
          >
            {{ dash }}
          </li>
        </ul>
        <ul v-else-if="variant !== 'compact'">
          <li
            v-for="(bullet, bulletIndex) in resolvePoints(experience)"
            :key="bulletIndex"
            class="text-dark editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `experiences.${index}.points.${bulletIndex}`,
                  (event.target as HTMLElement).innerText,
                )
            "
          >
            {{ bullet }}
          </li>
        </ul>
        <p
          v-else
          class="text-dark editable-text"
          :contenteditable="editable"
          @input="
            (event) =>
              updateText(
                `experiences.${index}.bullets.0`,
                (event.target as HTMLElement).innerText,
              )
          "
        >
          {{ resolvePoints(experience)?.[0] }}
        </p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.resume-section {
  --cv-space-1: var(--cv-space-1, 4px);
  --cv-space-2: var(--cv-space-2, 8px);
  --cv-space-3: var(--cv-space-3, 12px);
  --cv-space-4: var(--cv-space-4, 16px);
  --cv-space-6: var(--cv-space-6, 24px);
  --cv-marker-accent: color-mix(in srgb, var(--cv-accent) 55%, transparent);
  --cv-body-line-height: 1.52;
  --cv-list-indent: calc(var(--cv-space-4) + var(--cv-space-2));
  --cv-dash-marker-width: 1.35em;
  --entry-title-to-date-gap: var(--cv-space-1);
  --entry-date-to-description-gap: var(--cv-space-2);
  --entry-description-to-list-gap: var(--cv-space-2);

  position: relative;
  border-bottom: var(--rs-section-separator, none);
  padding-bottom: var(--rs-section-padding-bottom, 0);
}
.cv-heading-section {
  display: inline-flex;
  align-items: center;
  gap: var(--resume-section-icon-gap, var(--cv-space-2));
  border-bottom: var(--rs-heading-border-bottom, 0);
  background: var(--rs-heading-bg, transparent);
  border-radius: var(--rs-heading-radius, 0);
  padding: var(--rs-heading-padding, 0);
}
.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--resume-section-icon-size, 18px) + 8px);
  height: calc(var(--resume-section-icon-size, 18px) + 8px);
  color: var(--resume-section-icon-color, var(--cv-accent));
}
.section-icon--outline {
  border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
  border-radius: var(--resume-section-icon-radius, 999px);
}
.section-icon--filled {
  border-radius: var(--resume-section-icon-radius, 999px);
  background: color-mix(in srgb, currentColor 88%, white);
  color: #fff;
}
.section-icon--rounded {
  border-radius: calc(var(--resume-section-icon-radius, 8px) + 2px);
  background: color-mix(in srgb, currentColor 18%, transparent);
}
.entry {
  margin-bottom: var(--entry-gap, var(--cv-space-4));
  display: grid;
  grid-template-columns:
    minmax(140px, var(--resume-date-column-width, 140px))
    minmax(0, 1fr);
  column-gap: var(--cv-space-4);
  align-items: start;
  position: relative;
  border: var(--rs-card-border, none);
  background: var(--rs-card-bg, transparent);
  border-radius: var(--rs-card-radius, 0);
  padding: var(--rs-card-padding, 0);
}
.entry:last-child {
  margin-bottom: 0;
}
.resume-item-delete {
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease;
}
.entry:hover .resume-item-delete,
.entry:focus-within .resume-item-delete {
  opacity: 1;
  pointer-events: auto;
}
.date-column {
  color: color-mix(in srgb, var(--cv-text, currentColor) 78%, transparent);
}
.experience-heading {
  margin: 0;
}
.entry .date-column > .dates {
  margin: var(--entry-title-to-date-gap) 0 0;
}
.content-column > h4 {
  margin: 0;
}
.content-column > p {
  margin: var(--entry-date-to-description-gap) 0 0;
}
.content-column {
  position: relative;
  min-width: 0;
  border-left: var(--rs-entry-border-left, none);
  padding-left: var(--rs-entry-padding-left, 0);
}
.content-column::before {
  content: '';
  position: absolute;
  left: calc((var(--cv-space-2) + var(--cv-space-1)) * -1);
  top: 0.55rem;
  width: var(--rs-marker-width, var(--rs-marker-size, 0));
  height: var(--rs-marker-height, var(--rs-marker-size, 0));
  border-radius: var(--rs-marker-radius, 0);
  background: var(--cv-marker-accent);
}
.experience--timeline .content-column {
  border-left: 2px solid color-mix(in srgb, var(--cv-accent) 38%, transparent);
  padding-left: calc(var(--cv-space-2) + var(--cv-space-1) / 2);
}
.experience--timeline .content-column::before {
  width: max(8px, var(--rs-marker-width, var(--rs-marker-size, 8px)));
  height: max(8px, var(--rs-marker-height, var(--rs-marker-size, 8px)));
  border-radius: 999px;
  background: var(--cv-accent);
}
@media (max-width: 900px) {
  .entry {
    grid-template-columns: minmax(0, 1fr);
    row-gap: var(--cv-space-2);
  }
}
.entry li,
.entry p,
.entry strong {
  max-width: none;
  min-width: 0;
}
.entry p,
.entry li {
  line-height: var(--cv-body-line-height);
}
.entry ul {
  margin: var(--entry-description-to-list-gap) 0 0;
  padding-inline-start: var(--cv-list-indent);
}
.density-compact {
  --entry-gap: calc(var(--cv-space-2) + var(--cv-space-1) / 2);
  --entry-title-to-date-gap: calc(var(--cv-space-1) - 1px);
  --entry-date-to-description-gap: calc(var(--cv-space-1) + 1px);
  --entry-description-to-list-gap: calc(var(--cv-space-1) + 1px);
}
.density-normal {
  --entry-gap: var(--cv-space-4);
  --entry-title-to-date-gap: var(--cv-space-1);
  --entry-date-to-description-gap: var(--cv-space-2);
  --entry-description-to-list-gap: var(--cv-space-2);
}
.density-spacious {
  --entry-gap: calc(
    var(--cv-space-4) + var(--cv-space-2) - var(--cv-space-1) / 2
  );
  --entry-title-to-date-gap: calc(var(--cv-space-1) + 1px);
  --entry-date-to-description-gap: var(--cv-space-3);
  --entry-description-to-list-gap: var(--cv-space-3);
}
.dash-list {
  list-style: none;
  padding-inline-start: var(--cv-list-indent);
}
.dash-list li {
  position: relative;
  padding-inline-start: var(--cv-dash-marker-width);
}
.dash-list li::before {
  content: '—';
  position: absolute;
  inset-inline-start: 0;
  width: var(--cv-dash-marker-width);
}
.timeline-block {
  display: grid;
  gap: 6px;
}
.timeline-event {
  display: grid;
  gap: 2px;
  border-left: 2px solid var(--cv-marker-accent);
  padding-left: 8px;
}
.experience-heading {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.company-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.company-logo {
  width: 18px;
  height: 18px;
  object-fit: contain;
  border-radius: 4px;
}
</style>
