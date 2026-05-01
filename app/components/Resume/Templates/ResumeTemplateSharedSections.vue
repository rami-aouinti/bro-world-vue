<script setup lang="ts">
import {
  levelToPercent,
  levelToStars,
  levelToText,
} from '~/utils/resumeLanguageLevel'
import {
  resolveLanguageDisplayName,
  resolveLanguageFallback,
  resolveLanguageFlagClass,
  resolveLanguageFlagSrc,
} from '~/utils/resumeLanguageFlags'
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import { RESUME_SHARED_SECTION_VARIANTS } from '~/types/resumeSectionVariants'
import ResumeSectionHeader from '~/components/Resume/Sections/ResumeSectionHeader.vue'

type SharedSectionKey =
  | 'languages'
  | 'projects'
  | 'courses'
  | 'references'
  | 'hobbies'

type ReorderableSectionKey =
  | 'experience'
  | 'education'
  | 'language'
  | 'project'
  | 'skill'
  | 'certification'
  | 'reference'
  | 'hobby'
type SharedSectionActionKey = ReorderableSectionKey | 'course'
type SectionLayoutEntry<
  K extends ReorderableSectionKey = ReorderableSectionKey,
> = {
  key: K
  label: string
  variant: string
  region?: 'main' | 'aside'
  order?: number
}

const props = withDefaults(
  defineProps<{
    resume: any
    editable?: boolean
    hiddenSections?: SharedSectionKey[]
    tone?: 'light' | 'dark' | 'auto'
    sectionLayout?: SectionLayoutEntry[]
    levelInputMode?: 'percent' | 'stars'
  }>(),
  {
    editable: false,
    hiddenSections: () => [],
    tone: 'auto',
    sectionLayout: () => [],
    levelInputMode: 'percent',
  },
)
const emit = defineEmits<{
  (event: 'add-item', sectionKey: SharedSectionActionKey): void
  (
    event: 'change-variant',
    sectionKey: ReorderableSectionKey,
    variant: string,
  ): void
  (
    event: 'move-section',
    sectionKey: ReorderableSectionKey,
    direction: 'up' | 'down',
  ): void
}>()

const toneClass = computed(() => {
  if (props.tone === 'light') return 'shared-extra--light'
  if (props.tone === 'dark') return 'shared-extra--dark'
  return 'shared-extra--auto'
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

function isVisible(section: SharedSectionKey) {
  return !props.hiddenSections.includes(section)
}

function levelToStarsText(level: number | string) {
  const stars = levelToStars(level)
  return `${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}`
}

const languageVariant = computed<
  'text-level' | 'stars' | 'progress-line' | 'flags'
>(() => {
  const selected = props.sectionLayout.find(
    (section) => section.key === 'language',
  )
  return selected?.variant === 'stars' ||
    selected?.variant === 'progress-line' ||
    selected?.variant === 'text-level' ||
    selected?.variant === 'flags'
    ? selected.variant
    : props.levelInputMode === 'stars'
      ? 'stars'
      : 'text-level'
})

const projectVariant = computed<'list' | 'cards' | 'two-column'>(() => {
  const selected = props.sectionLayout.find(
    (section) => section.key === 'project',
  )
  return selected?.variant === 'cards' ||
    selected?.variant === 'two-column' ||
    selected?.variant === 'list'
    ? selected.variant
    : 'list'
})

function canMove(sectionKey: ReorderableSectionKey, direction: 'up' | 'down') {
  const target = props.sectionLayout.find(
    (section) => section.key === sectionKey,
  )
  if (!target?.region) return false
  const regionSections = [...props.sectionLayout]
    .filter((section) => section.region === target.region)
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
  const index = regionSections.findIndex(
    (section) => section.key === sectionKey,
  )
  if (index < 0) return false
  return direction === 'up' ? index > 0 : index < regionSections.length - 1
}
</script>

<template>
  <section class="shared-extra cv-card-surface" :class="toneClass">
    <div
      v-if="isVisible('languages') && resume.languages?.length"
      class="resume-section-hoverable shared-section"
    >
      <SectionToolbar
        section-key="language"
        :variants="
          RESUME_SHARED_SECTION_VARIANTS.language.map((value) => ({
            label: value,
            value,
          }))
        "
        :current-variant="languageVariant"
        :can-move-up="canMove('language', 'up')"
        :can-move-down="canMove('language', 'down')"
        @add-item="() => emit('add-item', 'language')"
        @change-variant="
          (_, variant) => emit('change-variant', 'language', variant)
        "
        @move-up="() => emit('move-section', 'language', 'up')"
        @move-down="() => emit('move-section', 'language', 'down')"
      />
      <ResumeSectionHeader
        title="Languages"
        icon="mdi-translate"
        in-aside
        class="cv-divider-bottom"
      />
      <ul v-if="languageVariant === 'text-level'">
        <li
          v-for="(language, index) in resume.languages"
          :key="`${resolveLanguageDisplayName(language)}-${index}`"
        >
          <small>{{ levelToText(language.level) }} — </small>
          <span class="language-flag-fallback">{{
            resolveLanguageFallback(language) || '🌐'
          }}</span>
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
            >{{ resolveLanguageDisplayName(language) }}</span
          >
        </li>
      </ul>
      <div v-else-if="languageVariant === 'stars'" class="language-stars-list">
        <div
          v-for="(language, index) in resume.languages"
          :key="`${resolveLanguageDisplayName(language)}-${index}`"
          class="language-stars-item"
        >
          <span class="language-flag-fallback">{{
            resolveLanguageFallback(language) || '🌐'
          }}</span>
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
            >{{ resolveLanguageDisplayName(language) }}</span
          >
          <small class="language-stars-value">{{
            levelToStarsText(language.level)
          }}</small>
        </div>
      </div>
      <div
        v-else-if="languageVariant === 'progress-line'"
        class="language-progress-list"
      >
        <div
          v-for="(language, index) in resume.languages"
          :key="`${resolveLanguageDisplayName(language)}-${index}`"
          class="language-progress-item"
        >
          <div class="d-flex align-center justify-space-between ga-2">
            <div class="d-flex align-center ga-2">
              <small>{{ levelToPercent(language.level) }}% — </small>
              <span class="language-flag-fallback">{{
                resolveLanguageFallback(language) || '🌐'
              }}</span>
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
                >{{ resolveLanguageDisplayName(language) }}</span
              >
            </div>
          </div>
          <v-progress-linear
            :model-value="levelToPercent(language.level)"
            height="8"
            rounded
            color="primary"
          />
        </div>
      </div>
      <div v-else class="language-progress-list">
        <div
          v-for="(language, index) in resume.languages"
          :key="`${resolveLanguageDisplayName(language)}-${index}`"
          class="language-progress-item"
        >
          <div class="d-flex align-center justify-space-between ga-2">
            <div class="d-flex align-center ga-2">
              <img
                v-if="resolveLanguageFlagSrc(language)"
                class="language-flag-image"
                :src="resolveLanguageFlagSrc(language)"
                :alt="`${resolveLanguageDisplayName(language)} flag`"
              />
              <span
                v-else-if="resolveLanguageFlagClass(language)"
                class="language-flag-icon"
                :class="resolveLanguageFlagClass(language)"
                :aria-label="`${resolveLanguageDisplayName(language)} flag`"
                role="img"
              />
              <span
                v-else-if="resolveLanguageFallback(language)"
                class="language-flag"
                >{{ resolveLanguageFallback(language) }}</span
              >
              <span v-else class="language-flag-fallback">🌐</span>
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
                >{{ resolveLanguageDisplayName(language) }}</span
              >
            </div>
            <small
              >{{ levelToText(language.level) }} ·
              {{ levelToStarsText(language.level) }}</small
            >
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isVisible('courses') && resume.courses?.length"
      class="resume-section-hoverable shared-section"
    >
      <SectionToolbar
        section-key="certification"
        :variants="[{ label: 'Classic', value: 'classic' }]"
        current-variant="classic"
        :can-move-up="canMove('certification', 'up')"
        :can-move-down="canMove('certification', 'down')"
        @add-item="() => emit('add-item', 'course')"
        @change-variant="
          (_, variant) => emit('change-variant', 'certification', variant)
        "
        @move-up="() => emit('move-section', 'certification', 'up')"
        @move-down="() => emit('move-section', 'certification', 'down')"
      />
      <ResumeSectionHeader
        title="Certifications"
        icon="mdi-certificate-outline"
        in-aside
        class="cv-divider-bottom"
      />
      <ul>
        <li
          v-for="(course, index) in resume.courses"
          :key="`${course.title}-${index}`"
        >
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `courses.${index}.title`,
                  (event.target as HTMLElement).innerText,
                )
            "
            >{{ course.title }}</span
          >
          <small
            class="ms-2 editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `courses.${index}.school`,
                  (event.target as HTMLElement).innerText,
                )
            "
            >{{ course.school }}</small
          >
        </li>
      </ul>
    </div>

    <div
      v-if="isVisible('projects') && resume.projects?.length"
      class="resume-section-hoverable shared-section"
    >
      <SectionToolbar
        section-key="project"
        :variants="
          RESUME_SHARED_SECTION_VARIANTS.project.map((value) => ({
            label: value,
            value,
          }))
        "
        :current-variant="projectVariant"
        :can-move-up="canMove('project', 'up')"
        :can-move-down="canMove('project', 'down')"
        @add-item="() => emit('add-item', 'project')"
        @change-variant="
          (_, variant) => emit('change-variant', 'project', variant)
        "
        @move-up="() => emit('move-section', 'project', 'up')"
        @move-down="() => emit('move-section', 'project', 'down')"
      />
      <ResumeSectionHeader
        title="Projects"
        icon="mdi-folder-star-outline"
        in-aside
        class="cv-divider-bottom"
      />
      <ul
        v-if="projectVariant === 'list'"
        class="project-list project-list--enhanced"
      >
        <li
          v-for="(project, index) in resume.projects"
          :key="`${project.name}-${index}`"
        >
          <strong
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `projects.${index}.name`,
                  (event.target as HTMLElement).innerText,
                )
            "
            >{{ project.name }}</strong
          >
          <p
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `projects.${index}.summary`,
                  (event.target as HTMLElement).innerText,
                )
            "
          >
            {{ project.summary }}
          </p>
        </li>
      </ul>
      <div
        v-else
        :class="[
          'project-grid',
          { 'project-grid--two-column': projectVariant === 'two-column' },
        ]"
      >
        <article
          v-for="(project, index) in resume.projects"
          :key="`${project.name}-${index}`"
          class="project-card"
          :class="{ 'project-card--soft': projectVariant === 'cards' }"
        >
          <strong
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `projects.${index}.name`,
                  (event.target as HTMLElement).innerText,
                )
            "
            >{{ project.name }}</strong
          >
          <p
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `projects.${index}.summary`,
                  (event.target as HTMLElement).innerText,
                )
            "
          >
            {{ project.summary }}
          </p>
        </article>
      </div>
    </div>

    <div
      v-if="isVisible('references') && resume.references?.length"
      class="resume-section-hoverable shared-section"
    >
      <SectionToolbar
        section-key="reference"
        :variants="[{ label: 'Classic', value: 'classic' }]"
        current-variant="classic"
        :can-move-up="canMove('reference', 'up')"
        :can-move-down="canMove('reference', 'down')"
        @add-item="() => emit('add-item', 'reference')"
        @change-variant="
          (_, variant) => emit('change-variant', 'reference', variant)
        "
        @move-up="() => emit('move-section', 'reference', 'up')"
        @move-down="() => emit('move-section', 'reference', 'down')"
      />
      <ResumeSectionHeader
        title="References"
        icon="mdi-account"
        in-aside
        class="cv-divider-bottom"
      />
      <ul>
        <li
          v-for="(reference, index) in resume.references"
          :key="`${reference.name}-${index}`"
        >
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `references.${index}.name`,
                  (event.target as HTMLElement).innerText,
                )
            "
            >{{ reference.name }}</span
          >
          <small
            class="ms-2 editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText(
                  `references.${index}.company`,
                  (event.target as HTMLElement).innerText,
                )
            "
            >{{ reference.company }}</small
          >
        </li>
      </ul>
    </div>

    <div
      v-if="isVisible('hobbies') && resume.hobbies?.length"
      class="resume-section-hoverable shared-section"
    >
      <SectionToolbar
        section-key="hobby"
        :variants="[{ label: 'Classic', value: 'classic' }]"
        current-variant="classic"
        :can-move-up="canMove('hobby', 'up')"
        :can-move-down="canMove('hobby', 'down')"
        @add-item="() => emit('add-item', 'hobby')"
        @change-variant="
          (_, variant) => emit('change-variant', 'hobby', variant)
        "
        @move-up="() => emit('move-section', 'hobby', 'up')"
        @move-down="() => emit('move-section', 'hobby', 'down')"
      />
      <ResumeSectionHeader
        title="Interests"
        icon="mdi-puzzle-heart-outline"
        in-aside
        class="cv-divider-bottom"
      />
      <ul>
        <li
          v-for="(hobby, index) in resume.hobbies"
          :key="`${hobby}-${index}`"
          class="editable-text"
          :contenteditable="editable"
          @input="
            (event) =>
              updateText(
                `hobbies.${index}`,
                (event.target as HTMLElement).innerText,
              )
          "
        >
          {{ hobby }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
@import '~/assets/styles/flag-icons.scss';
/* Theme convention: use only var(--resume-sidebar, var(--cv-sidebar)), var(--resume-accent, var(--cv-accent)), var(--resume-page, var(--cv-page)), var(--resume-secondary, var(--cv-secondary)) (+ color-mix). */
.shared-extra {
  font-family: var(
    --resume-font-family,
    var(--cv-font-family, 'Inter', 'Segoe UI', Arial, sans-serif)
  );
  font-style: var(--resume-font-style, var(--cv-font-style, normal));
  font-weight: var(--resume-font-weight, var(--cv-font-weight, 400));
  --shared-panel-bg: color-mix(
    in srgb,
    var(--resume-page, var(--cv-page)) 92%,
    var(--resume-sidebar, var(--cv-sidebar))
  );
  --shared-panel-text: var(--resume-secondary, var(--cv-secondary));
  --shared-panel-border: color-mix(
    in srgb,
    var(--resume-accent, var(--cv-accent)) 20%,
    var(--resume-page, var(--cv-page))
  );
  --shared-title-color: var(--cv-title, var(--resume-accent, var(--cv-accent)));
  margin-top: 0;
  border-top: 1px solid
    color-mix(
      in srgb,
      var(--resume-accent, var(--cv-accent)) 22%,
      var(--resume-page, var(--cv-page))
    );
  color: var(--shared-panel-text);
  border-inline: 1px solid var(--shared-panel-border);
  border-bottom: 1px solid var(--shared-panel-border);
  border-radius: 0 0 var(--resume-radius, var(--cv-radius, 14px))
    var(--resume-radius, var(--cv-radius, 14px));
  padding: 16px;
  display: grid;
  gap: 14px;
}
.shared-extra--light {
  --shared-panel-bg: color-mix(
    in srgb,
    var(--resume-page, var(--cv-page)) 95%,
    var(--resume-sidebar, var(--cv-sidebar))
  );
}
.shared-extra--dark {
  --shared-panel-bg: color-mix(
    in srgb,
    var(--resume-page, var(--cv-page)) 86%,
    var(--resume-sidebar, var(--cv-sidebar))
  );
  --shared-panel-text: var(--resume-secondary, var(--cv-secondary));
  --shared-panel-border: color-mix(
    in srgb,
    var(--resume-accent, var(--cv-accent)) 24%,
    var(--resume-page, var(--cv-page))
  );
  --shared-title-color: var(--cv-title, var(--resume-accent, var(--cv-accent)));
}
.shared-extra--auto {
  --shared-panel-bg: color-mix(
    in srgb,
    var(--resume-page, var(--cv-page)) 90%,
    var(--resume-sidebar, var(--cv-sidebar))
  );
}

.shared-extra {
  color: var(--shared-panel-text);
}

.shared-extra h3 {
  color: var(--shared-title-color);
  font-size: 1rem;
  margin-bottom: 6px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--shared-title-color) 24%, transparent);
  padding-bottom: 4px;
}
.shared-extra ul {
  margin: 0;
  padding-left: 18px;
}
.shared-extra p {
  margin: 4px 0 0;
}
.shared-extra small {
  color: color-mix(in srgb, var(--shared-panel-text) 84%, transparent);
}
.project-list--enhanced {
  display: grid;
  gap: 10px;
  list-style: none;
  padding-left: 0;
}
.project-list--enhanced li {
  padding: 10px 12px;
  border: 1px solid
    color-mix(in srgb, var(--shared-panel-border) 78%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--shared-panel-bg) 92%, transparent);
}
.language-stars-list,
.language-progress-list {
  display: grid;
  gap: 8px;
}
.language-progress-item {
  display: grid;
  gap: 4px;
}
.language-stars-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.language-stars-value {
  letter-spacing: 0.04em;
  color: var(--shared-panel-text);
}
.language-flag-image {
  width: 18px;
  height: 12px;
  object-fit: cover;
  border-radius: 2px;
}

.language-flag-icon {
  width: 18px;
  height: 12px;
  display: inline-block;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
}

.language-flag {
  font-size: 1.1em;
  line-height: 1;
}
.language-flag-fallback {
  font-size: 1em;
  line-height: 1;
}
.project-grid {
  display: grid;
  gap: 10px;
}
.project-grid--two-column {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.project-card {
  border: 1px solid
    color-mix(in srgb, var(--resume-accent, var(--cv-accent)) 22%, transparent);
  border-radius: 10px;
  padding: 10px;
}
.project-card--soft {
  background: color-mix(
    in srgb,
    var(--resume-page, var(--cv-page)) 96%,
    var(--resume-sidebar, var(--cv-sidebar))
  );
}
.shared-section {
  position: relative;
}
.editable-text[contenteditable='true'] {
  outline: 1px dashed transparent;
  border-radius: 4px;
  transition: outline-color 0.2s ease;
}
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus {
  outline-color: color-mix(
    in srgb,
    var(--resume-accent, var(--cv-accent)) 42%,
    transparent
  );
}
</style>
