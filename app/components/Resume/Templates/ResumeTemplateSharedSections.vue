<script setup lang="ts">
type SharedSectionKey =
  | 'languages'
  | 'projects'
  | 'courses'
  | 'references'
  | 'hobbies'

const props = withDefaults(defineProps<{ resume: any; editable?: boolean; hiddenSections?: SharedSectionKey[]; tone?: 'light' | 'dark' | 'auto' }>(), {
  editable: false,
  hiddenSections: () => [],
  tone: 'auto',
})

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
</script>

<template>
  <section class="shared-extra cv-card-surface text-dark" :class="toneClass">
    <div v-if="isVisible('languages') && resume.languages?.length">
      <h3 class="cv-heading-section cv-divider-bottom">Languages</h3>
      <ul>
        <li v-for="(language, index) in resume.languages" :key="`${language.name}-${index}`">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`languages.${index}.name`, (event.target as HTMLElement).innerText)">{{ language.name }}</span>
          <small class="ms-2">({{ language.level }}%)</small>
        </li>
      </ul>
    </div>

    <div v-if="isVisible('projects') && resume.projects?.length">
      <h3 class="cv-heading-section cv-divider-bottom">Projects</h3>
      <ul>
        <li v-for="(project, index) in resume.projects" :key="`${project.name}-${index}`">
          <strong class="editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.name`, (event.target as HTMLElement).innerText)">{{ project.name }}</strong>
          <p class="editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.summary`, (event.target as HTMLElement).innerText)">{{ project.summary }}</p>
        </li>
      </ul>
    </div>

    <div v-if="isVisible('courses') && resume.courses?.length">
      <h3 class="cv-heading-section cv-divider-bottom">Certifications</h3>
      <ul>
        <li v-for="(course, index) in resume.courses" :key="`${course.title}-${index}`">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.title`, (event.target as HTMLElement).innerText)">{{ course.title }}</span>
          <small class="ms-2 editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.school`, (event.target as HTMLElement).innerText)">{{ course.school }}</small>
        </li>
      </ul>
    </div>

    <div v-if="isVisible('references') && resume.references?.length">
      <h3 class="cv-heading-section cv-divider-bottom">References</h3>
      <ul>
        <li v-for="(reference, index) in resume.references" :key="`${reference.name}-${index}`">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.name`, (event.target as HTMLElement).innerText)">{{ reference.name }}</span>
          <small class="ms-2 editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.company`, (event.target as HTMLElement).innerText)">{{ reference.company }}</small>
        </li>
      </ul>
    </div>

    <div v-if="isVisible('hobbies') && resume.hobbies?.length">
      <h3 class="cv-heading-section cv-divider-bottom">Interests</h3>
      <ul>
        <li v-for="(hobby, index) in resume.hobbies" :key="`${hobby}-${index}`" class="editable-text" :contenteditable="editable" @input="event => updateText(`hobbies.${index}`, (event.target as HTMLElement).innerText)">{{ hobby }}</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* Theme convention: use only var(--cv-sidebar), var(--cv-accent), var(--cv-page) (+ color-mix). No hardcoded theme colors. */
.shared-extra { font-family: var(--cv-font-family, 'Inter', 'Segoe UI', Arial, sans-serif); font-style: var(--cv-font-style, normal); font-weight: var(--cv-font-weight, 400);
  --shared-panel-bg: color-mix(in srgb, var(--cv-page) 92%, white);
  --shared-panel-text: var(--cv-secondary, color-mix(in srgb, var(--cv-sidebar) 70%, black));
  --shared-panel-border: color-mix(in srgb, var(--cv-accent) 20%, var(--cv-page));
  --shared-title-color: var(--cv-title, var(--cv-accent));
  margin-top: 0;
  padding-top: 18px;
  border-top: 1px solid color-mix(in srgb, var(--cv-accent) 22%, var(--cv-page));
  background: var(--shared-panel-bg);
  color: var(--shared-panel-text);
  border-inline: 1px solid var(--shared-panel-border);
  border-bottom: 1px solid var(--shared-panel-border);
  border-radius: 0 0 var(--cv-radius, 14px) var(--cv-radius, 14px);
  padding: 16px;
  display: grid;
  gap: 14px;
}
.shared-extra--light {
  --shared-panel-bg: color-mix(in srgb, var(--cv-page) 95%, white);
}
.shared-extra--dark {
  --shared-panel-bg: color-mix(in srgb, var(--cv-sidebar) 70%, black);
  --shared-panel-text: var(--cv-on-sidebar, color-mix(in srgb, var(--cv-page) 92%, white));
  --shared-panel-border: color-mix(in srgb, var(--cv-page) 26%, transparent);
  --shared-title-color: var(--cv-on-sidebar, var(--cv-accent));
}
.shared-extra--auto {
  --shared-panel-bg: color-mix(in srgb, var(--cv-page) 90%, white);
}
.shared-extra h3 {
  color: var(--shared-title-color);
  font-size: 1rem;
  margin-bottom: 6px;
  border-bottom: 1px solid color-mix(in srgb, var(--shared-title-color) 24%, transparent);
  padding-bottom: 4px;
}
.shared-extra ul { margin: 0; padding-left: 18px; }
.shared-extra p { margin: 4px 0 0; }
.shared-extra small { color: color-mix(in srgb, var(--shared-panel-text) 84%, transparent); }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 42%, transparent); }
</style>
