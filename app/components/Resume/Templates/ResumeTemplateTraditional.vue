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
  <article class="traditional-template cv-template-base text-dark">
    <header>
      <v-avatar v-if="showPhoto && resume.photoUrl" size="76" class="mb-3" @click="onPhotoClick?.()">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
      <h1>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
      </h1>
      <p>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</span> ·
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</span>,
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('country', (event.target as HTMLElement).innerText)">{{ resume.country }}</span> ·
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</span> ·
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</span>
      </p>
    </header>

    <section>
      <h2 class="cv-heading-section">Profile</h2>
      <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile || 'Add a professional summary from the Edit tab.' }}</p>
    </section>

    <section>
      <h2 class="cv-heading-section">Employment History</h2>
      <article v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" class="entry text-dark">
        <div class="entry-head">
          <h4 class="text-dark">
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.role`, (event.target as HTMLElement).innerText)">{{ experience.role }}</span>,
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.company`, (event.target as HTMLElement).innerText)">{{ experience.company }}</span>
          </h4>
          <span>
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.start`, (event.target as HTMLElement).innerText)">{{ experience.start }}</span> -
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.end`, (event.target as HTMLElement).innerText)">{{ experience.end }}</span>
          </span>
        </div>
        <ul>
          <li v-for="(bullet, bulletIndex) in experience.bullets" :key="bulletIndex" class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.bullets.${bulletIndex}`, (event.target as HTMLElement).innerText)">{{ bullet }}</li>
        </ul>
      </article>
    </section>

    <section>
      <h2 class="cv-heading-section">Education</h2>
      <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" class="entry text-dark">
        <div class="entry-head text-dark">
          <h4 class="text-dark">
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.degree`, (event.target as HTMLElement).innerText)">{{ item.degree }}</span>,
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.school`, (event.target as HTMLElement).innerText)">{{ item.school }}</span>
          </h4>
          <span>
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.start`, (event.target as HTMLElement).innerText)">{{ item.start }}</span> -
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.end`, (event.target as HTMLElement).innerText)">{{ item.end }}</span>
          </span>
        </div>
        <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.note`, (event.target as HTMLElement).innerText)">{{ item.note }}</p>
      </article>
    </section>
  </article>
</template>

<style scoped>
/* Theme convention: use only var(--cv-sidebar), var(--cv-accent), var(--cv-page) (+ color-mix). No hardcoded theme colors. */
.traditional-template { font-family: var(--cv-font-family, 'Inter', 'Segoe UI', Arial, sans-serif); font-style: var(--cv-font-style, normal); font-weight: var(--cv-font-weight, 400); min-height: calc(100vh - 80px); background: var(--cv-page); color: color-mix(in srgb, var(--cv-sidebar) 78%, black); border-radius: var(--cv-radius, 14px); padding: 34px; }
header { text-align:center; border-bottom:2px solid color-mix(in srgb, var(--cv-accent) 22%, var(--cv-page)); padding-bottom:14px; margin-bottom:20px; }
h1 { font-size: 2rem; letter-spacing: .06em; }
h2 { font-size:1.1rem; letter-spacing: .08em; text-transform: uppercase; border-bottom:1px solid color-mix(in srgb, var(--cv-accent) 18%, var(--cv-page)); padding-bottom:6px; margin-bottom:10px; }
.entry { margin-bottom: 14px; }
.entry-head { display:flex; justify-content:space-between; gap:10px; }
.entry-head span { color:var(--cv-secondary); /* Intentional neutral gray for metadata readability. */ font-size:.85rem; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 50%, transparent); }
</style>
