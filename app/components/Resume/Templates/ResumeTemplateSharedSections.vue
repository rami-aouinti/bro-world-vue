<script setup lang="ts">
const props = withDefaults(defineProps<{ resume: any; editable?: boolean }>(), {
  editable: false,
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
  <section class="shared-extra text-dark">
    <div>
      <h3>Languages</h3>
      <ul>
        <li v-for="(language, index) in resume.languages" :key="`${language.name}-${index}`">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`languages.${index}.name`, (event.target as HTMLElement).innerText)">{{ language.name }}</span>
          <small class="ms-2">({{ language.level }}%)</small>
        </li>
      </ul>
    </div>

    <div>
      <h3>Projects</h3>
      <ul>
        <li v-for="(project, index) in resume.projects" :key="`${project.name}-${index}`">
          <strong class="editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.name`, (event.target as HTMLElement).innerText)">{{ project.name }}</strong>
          <p class="editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.summary`, (event.target as HTMLElement).innerText)">{{ project.summary }}</p>
        </li>
      </ul>
    </div>

    <div>
      <h3>Certifications</h3>
      <ul>
        <li v-for="(course, index) in resume.courses" :key="`${course.title}-${index}`">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.title`, (event.target as HTMLElement).innerText)">{{ course.title }}</span>
          <small class="ms-2 editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.school`, (event.target as HTMLElement).innerText)">{{ course.school }}</small>
        </li>
      </ul>
    </div>

    <div>
      <h3>References</h3>
      <ul>
        <li v-for="(reference, index) in resume.references" :key="`${reference.name}-${index}`">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.name`, (event.target as HTMLElement).innerText)">{{ reference.name }}</span>
          <small class="ms-2 editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.company`, (event.target as HTMLElement).innerText)">{{ reference.company }}</small>
        </li>
      </ul>
    </div>

    <div>
      <h3>Interests</h3>
      <ul>
        <li v-for="(hobby, index) in resume.hobbies" :key="`${hobby}-${index}`" class="editable-text" :contenteditable="editable" @input="event => updateText(`hobbies.${index}`, (event.target as HTMLElement).innerText)">{{ hobby }}</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.shared-extra { margin-top: 16px; background: color-mix(in srgb, var(--cv-page) 90%, white); border: 1px solid color-mix(in srgb, var(--cv-accent) 16%, #d1d5db); border-radius: inherit; padding: 16px; display: grid; gap: 14px; }
.shared-extra h3 { color: var(--cv-accent); font-size: 1rem; margin-bottom: 6px; }
.shared-extra ul { margin: 0; padding-left: 18px; }
.shared-extra p { margin: 4px 0 0; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 42%, transparent); }
</style>
