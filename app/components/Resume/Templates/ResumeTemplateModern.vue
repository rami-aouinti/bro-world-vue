<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'

type SectionKey = 'experience' | 'education' | 'language' | 'project'
type SectionLayoutEntry = { key: SectionKey; label: string; variant: string }

const props = withDefaults(defineProps<{ resume: any; showPhoto?: boolean; editable?: boolean; onPhotoClick?: () => void; sectionLayout?: SectionLayoutEntry[] }>(), {
  showPhoto: false,
  editable: false,
  onPhotoClick: undefined,
  sectionLayout: () => [],
})
const emit = defineEmits<{
  (event: 'add-item', sectionKey: SectionKey): void
  (event: 'change-variant', sectionKey: SectionKey, variant: string): void
  (event: 'move-section', sectionKey: SectionKey, direction: 'up' | 'down'): void
}>()

const sectionVariantOptions: Record<SectionKey, { label: string; value: string }[]> = {
  experience: [{ label: 'Detailed', value: 'detailed' }, { label: 'Bullets', value: 'bullets' }, { label: 'Compact', value: 'compact' }],
  education: [{ label: 'Classic', value: 'classic' }, { label: 'Timeline', value: 'timeline' }, { label: 'Two columns', value: 'two-column' }],
  language: [{ label: 'Text level', value: 'text-level' }, { label: 'Stars', value: 'stars' }, { label: 'Progress', value: 'progress' }],
  project: [{ label: 'List', value: 'list' }, { label: 'Cards', value: 'cards' }, { label: 'Two columns', value: 'two-column' }],
}
const orderedPreviewSections: SectionKey[] = ['experience', 'education', 'language', 'project']
function currentVariant(sectionKey: SectionKey) {
  return props.sectionLayout.find(section => section.key === sectionKey)?.variant ?? sectionVariantOptions[sectionKey][0]?.value
}
function canMoveUp(sectionKey: SectionKey) {
  return orderedPreviewSections.indexOf(sectionKey) > 0
}
function canMoveDown(sectionKey: SectionKey) {
  const index = orderedPreviewSections.indexOf(sectionKey)
  return index > -1 && index < orderedPreviewSections.length - 1
}

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
  <div class="modern-template cv-template-base text-dark">
    <header class="modern-header">
      <v-avatar v-if="showPhoto && resume.photoUrl" size="82" class="mb-3 modern-avatar" @click="onPhotoClick?.()">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
      <h1>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
      </h1>
      <p class="editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>
      <p>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</span>,
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('country', (event.target as HTMLElement).innerText)">{{ resume.country }}</span>
        · <span class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</span>
        · <span class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</span>
      </p>
    </header>

    <div class="modern-grid">
      <aside class="cv-sidebar-surface">
        <section>
          <h3>Skills</h3>
          <ul class="bars">
            <li v-for="(skill, index) in resume.skills" :key="skill.name" class="text-dark">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
              <div><i :style="{ width: `${skill.level}%` }" /></div>
            </li>
          </ul>
        </section>
        <section class="resume-section-hoverable resume-section-block">
          <SectionToolbar section-key="language" :variants="sectionVariantOptions.language" :current-variant="currentVariant('language')" @add-item="() => emit('add-item', 'language')" @change-variant="(_, variant) => emit('change-variant', 'language', variant)" @move-up="() => emit('move-section', 'language', 'up')" @move-down="() => emit('move-section', 'language', 'down')" />
          <h3>Languages</h3>
          <ul class="bars">
            <li v-for="(language, index) in resume.languages" :key="language.name" class="text-dark">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`languages.${index}.name`, (event.target as HTMLElement).innerText)">{{ language.name }}</span>
              <div><i :style="{ width: `${language.level}%` }" /></div>
            </li>
          </ul>
        </section>
      </aside>

      <main>
        <section>
          <h2 class="cv-heading-section">Profile</h2>
          <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile || 'Add a professional summary from the Edit tab.' }}</p>
        </section>
        <section class="resume-section-hoverable resume-section-block">
          <h2 class="cv-heading-section">Employment History</h2>
          <SectionToolbar section-key="experience" :variants="sectionVariantOptions.experience" :current-variant="currentVariant('experience')" :can-move-up="canMoveUp('experience')" :can-move-down="canMoveDown('experience')" @add-item="() => emit('add-item', 'experience')" @change-variant="(_, variant) => emit('change-variant', 'experience', variant)" @move-up="() => emit('move-section', 'experience', 'up')" @move-down="() => emit('move-section', 'experience', 'down')" />
          <article v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" class="entry text-dark">
            <h4 class="text-dark">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.role`, (event.target as HTMLElement).innerText)">{{ experience.role }}</span>,
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.company`, (event.target as HTMLElement).innerText)">{{ experience.company }}</span>,
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.city`, (event.target as HTMLElement).innerText)">{{ experience.city }}</span>
            </h4>
            <p class="dates">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.start`, (event.target as HTMLElement).innerText)">{{ experience.start }}</span> -
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.end`, (event.target as HTMLElement).innerText)">{{ experience.end }}</span>
            </p>
            <ul>
              <li v-for="(bullet, bulletIndex) in experience.bullets" :key="bulletIndex" class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.bullets.${bulletIndex}`, (event.target as HTMLElement).innerText)">{{ bullet }}</li>
            </ul>
          </article>
        </section>
        <section class="resume-section-hoverable resume-section-block">
          <h2 class="cv-heading-section">Projects</h2>
          <SectionToolbar section-key="project" :variants="sectionVariantOptions.project" :current-variant="currentVariant('project')" :can-move-up="canMoveUp('project')" :can-move-down="canMoveDown('project')" @add-item="() => emit('add-item', 'project')" @change-variant="(_, variant) => emit('change-variant', 'project', variant)" @move-up="() => emit('move-section', 'project', 'up')" @move-down="() => emit('move-section', 'project', 'down')" />
          <article v-for="(project, index) in resume.projects" :key="`project-${index}`" class="entry text-dark">
            <h4 class="text-dark">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.name`, (event.target as HTMLElement).innerText)">{{ project.name }}</span>
            </h4>
            <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.summary`, (event.target as HTMLElement).innerText)">{{ project.summary }}</p>
          </article>
        </section>
        <section>
          <h2 class="cv-heading-section">Certifications</h2>
          <article v-for="(course, index) in resume.courses" :key="`course-${index}`" class="entry text-dark">
            <h4 class="text-dark">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.title`, (event.target as HTMLElement).innerText)">{{ course.title }}</span>
            </h4>
            <p class="dates">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.school`, (event.target as HTMLElement).innerText)">{{ course.school }}</span>
              ·
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.start`, (event.target as HTMLElement).innerText)">{{ course.start }}</span>
              -
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.end`, (event.target as HTMLElement).innerText)">{{ course.end }}</span>
            </p>
          </article>
        </section>
        <section>
          <h2 class="cv-heading-section">References</h2>
          <article v-for="(reference, index) in resume.references" :key="`reference-${index}`" class="entry text-dark">
            <h4 class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.name`, (event.target as HTMLElement).innerText)">{{ reference.name }}</h4>
            <p class="text-dark">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.company`, (event.target as HTMLElement).innerText)">{{ reference.company }}</span>
              ·
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.email`, (event.target as HTMLElement).innerText)">{{ reference.email }}</span>
              ·
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.phone`, (event.target as HTMLElement).innerText)">{{ reference.phone }}</span>
            </p>
          </article>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Theme convention: use only var(--cv-sidebar), var(--cv-accent), var(--cv-page) (+ color-mix). No hardcoded theme colors. */
.modern-template { font-family: var(--cv-font-family, 'Inter', 'Segoe UI', Arial, sans-serif); font-style: var(--cv-font-style, normal); font-weight: var(--cv-font-weight, 400); min-height: calc(100vh - 80px); border-radius: var(--cv-radius, 14px); overflow:hidden; background: var(--cv-page); }
.modern-header { background: color-mix(in srgb, var(--cv-accent) 85%, white); color: color-mix(in srgb, var(--cv-sidebar) 78%, black); padding:26px 30px; }
.modern-avatar { cursor: zoom-in; }
.modern-header h1 { font-size:2.2rem; margin-bottom:4px; }
.modern-grid { display:grid; grid-template-columns: 280px 1fr; }
aside { background:color-mix(in srgb, var(--cv-sidebar) 12%, var(--cv-page)); padding:22px; }
main { padding:24px; }
.resume-section-block { position: relative; }
h2,h3 { color:var(--cv-title); margin-bottom:8px; }
.bars { list-style:none; padding:0; }
.bars li { margin-bottom:10px; }
.bars div { height:4px; background:color-mix(in srgb, var(--cv-accent) 22%, var(--cv-page)); margin-top:4px; }
.bars i { display:block; height:4px; background:var(--cv-accent); }
.dates { font-size:.75rem; color:var(--cv-secondary); /* Intentional neutral gray for dates. */ text-transform: uppercase; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 50%, transparent); }
@media (max-width:1120px){ .modern-grid{ grid-template-columns: 1fr; } }
</style>
