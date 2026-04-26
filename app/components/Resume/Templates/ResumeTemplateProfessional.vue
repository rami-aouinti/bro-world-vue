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
  <div class="professional-template">
    <aside>
      <v-avatar v-if="showPhoto && resume.photoUrl" size="92" class="mb-4" @click="onPhotoClick?.()">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
      <h1>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
      </h1>
      <p class="role editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>
      <h3>Contact</h3>
      <p>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</span>,
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('country', (event.target as HTMLElement).innerText)">{{ resume.country }}</span>
      </p>
      <p class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</p>
      <p class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</p>
      <h3>Skills</h3>
      <ul>
        <li v-for="(skill, index) in resume.skills" :key="skill.name" class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</li>
      </ul>
    </aside>

    <main>
      <section>
        <h2>Profile</h2>
        <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile || 'Add a professional summary from the Edit tab.' }}</p>
      </section>
      <section>
        <h2>Experience</h2>
        <article v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" class="entry text-dark">
          <h4 class="text-dark">
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.role`, (event.target as HTMLElement).innerText)">{{ experience.role }}</span> ·
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.company`, (event.target as HTMLElement).innerText)">{{ experience.company }}</span>
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
      <section>
        <h2>Education</h2>
        <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" class="entry text-dark">
          <h4 class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.degree`, (event.target as HTMLElement).innerText)">{{ item.degree }}</h4>
          <p class="text-dark">
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.school`, (event.target as HTMLElement).innerText)">{{ item.school }}</span> ·
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.city`, (event.target as HTMLElement).innerText)">{{ item.city }}</span>
          </p>
          <p class="dates">
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.start`, (event.target as HTMLElement).innerText)">{{ item.start }}</span> -
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.end`, (event.target as HTMLElement).innerText)">{{ item.end }}</span>
          </p>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Theme convention: use only var(--cv-sidebar), var(--cv-accent), var(--cv-page) (+ color-mix). No hardcoded theme colors. */
.professional-template { font-family: var(--cv-font-family, 'Inter', 'Segoe UI', Arial, sans-serif); font-style: var(--cv-font-style, normal); font-weight: var(--cv-font-weight, 400); min-height: calc(100vh - 80px); display:grid; grid-template-columns: 300px 1fr; border-radius: var(--cv-radius, 14px); overflow:hidden; background:var(--cv-page); }
aside { background: var(--cv-sidebar); color: color-mix(in srgb, var(--cv-page) 92%, white); padding: 30px 24px; }
aside h1 { font-size: 2rem; line-height: 1.2; }
.role { text-transform: uppercase; letter-spacing: .08em; margin: 8px 0 22px; }
aside ul { padding-left: 16px; }
main { padding: 28px; }
main h2 { color: var(--cv-title); margin-bottom: 8px; }
.entry { margin-bottom: 16px; }
.dates { color:var(--cv-secondary); /* Intentional neutral gray for dates. */ font-size:.75rem; text-transform:uppercase; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 50%, transparent); }
@media (max-width:1120px){ .professional-template{ grid-template-columns: 1fr; } }
</style>
