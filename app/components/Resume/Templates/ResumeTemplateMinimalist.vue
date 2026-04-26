<script setup lang="ts">
const props = withDefaults(defineProps<{ resume: any; showPhoto?: boolean; editable?: boolean; onPhotoClick?: () => void }>(), {
  showPhoto: false,
  editable: false,
  onPhotoClick: undefined,
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
  <div class="minimal-template">
    <header class="minimal-header">
      <div>
        <h1>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
        </h1>
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>
      </div>
      <v-avatar v-if="showPhoto && resume.photoUrl" size="72" @click="onPhotoClick?.()">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
    </header>

    <section class="minimal-contact">
      <span class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</span>
      <span class="dot">•</span>
      <span class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</span>
      <span class="dot">•</span>
      <span class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</span>
    </section>

    <section class="minimal-body">
      <article>
        <h2>Summary</h2>
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile }}</p>
      </article>

      <article>
        <h2>Experience</h2>
        <div v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" class="experience-row">
          <p class="meta">
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.start`, (event.target as HTMLElement).innerText)">{{ experience.start }}</span>
            -
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.end`, (event.target as HTMLElement).innerText)">{{ experience.end }}</span>
          </p>
          <h3>
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.role`, (event.target as HTMLElement).innerText)">{{ experience.role }}</span>
            ·
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.company`, (event.target as HTMLElement).innerText)">{{ experience.company }}</span>
          </h3>
        </div>
      </article>

      <article class="split">
        <div>
          <h2>Skills</h2>
          <ul>
            <li v-for="(skill, index) in resume.skills" :key="`skill-${index}`">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
            </li>
          </ul>
        </div>
        <div>
          <h2>Languages</h2>
          <ul>
            <li v-for="(language, index) in resume.languages" :key="`language-${index}`">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`languages.${index}.name`, (event.target as HTMLElement).innerText)">{{ language.name }}</span>
            </li>
          </ul>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
/* Theme convention: use only var(--cv-sidebar), var(--cv-accent), var(--cv-page) (+ color-mix). No hardcoded theme colors. */
.minimal-template { font-family: var(--cv-font-family, 'Inter', 'Segoe UI', Arial, sans-serif); font-style: var(--cv-font-style, normal); font-weight: var(--cv-font-weight, 400); min-height: calc(100vh - 80px); padding: 36px; background: var(--cv-page); color: color-mix(in srgb, var(--cv-sidebar) 78%, black); border-radius: var(--cv-radius, 14px); overflow: hidden; }
.minimal-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 2px solid color-mix(in srgb, var(--cv-accent) 16%, var(--cv-page)); padding-bottom: 18px; }
h1 { margin: 0 0 4px; font-size: 2rem; letter-spacing: -.02em; }
.minimal-contact { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; color: var(--cv-secondary); /* Intentional neutral gray for secondary contact text. */ margin: 14px 0 22px; }
.dot { font-size: .6rem; color: var(--cv-secondary); /* Intentional neutral gray separator. */ }
.minimal-body { display: grid; gap: 22px; }
article h2 { font-size: .9rem; margin-bottom: 9px; text-transform: uppercase; letter-spacing: .08em; color: var(--cv-title); }
.experience-row { padding: 8px 0; border-bottom: 1px solid color-mix(in srgb, var(--cv-accent) 10%, var(--cv-page)); }
.meta { font-size: .75rem; color: var(--cv-secondary); /* Intentional neutral gray metadata. */ margin-bottom: 2px; }
.experience-row h3 { font-size: 1rem; }
.split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
ul { padding-left: 18px; margin: 0; }
li { margin-bottom: 6px; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 45%, transparent); }
@media (max-width: 900px) { .minimal-template { font-family: var(--cv-font-family, 'Inter', 'Segoe UI', Arial, sans-serif); font-style: var(--cv-font-style, normal); font-weight: var(--cv-font-weight, 400); padding: 22px; } .split { grid-template-columns: 1fr; } }
</style>
