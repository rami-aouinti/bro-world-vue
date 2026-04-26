<script setup lang="ts">
const props = withDefaults(defineProps<{ resume: any; showPhoto?: boolean; editable?: boolean; onPhotoClick?: () => void }>(), {
  showPhoto: true,
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
  <div class="terra-template">
    <aside>
      <v-avatar v-if="showPhoto && resume.photoUrl" size="140" class="mb-5 terra-photo" @click="onPhotoClick?.()">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
      <h3>Contact</h3>
      <p class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</p>
      <p class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</p>
      <p>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</span>,
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('country', (event.target as HTMLElement).innerText)">{{ resume.country }}</span>
      </p>

      <h3>Compétences</h3>
      <ul>
        <li v-for="(skill, index) in resume.skills" :key="skill.name" class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</li>
      </ul>
    </aside>

    <main>
      <header>
        <h1>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
        </h1>
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>
      </header>

      <section>
        <h2>Expériences professionnelles</h2>
        <article v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`">
          <h4>
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.role`, (event.target as HTMLElement).innerText)">{{ experience.role }}</span>
            –
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.company`, (event.target as HTMLElement).innerText)">{{ experience.company }}</span>
          </h4>
          <p class="period">
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.start`, (event.target as HTMLElement).innerText)">{{ experience.start }}</span>
            ·
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.end`, (event.target as HTMLElement).innerText)">{{ experience.end }}</span>
          </p>
        </article>
      </section>

      <section>
        <h2>Formations & diplômes</h2>
        <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`">
          <h4 class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.degree`, (event.target as HTMLElement).innerText)">{{ item.degree }}</h4>
          <p>
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.school`, (event.target as HTMLElement).innerText)">{{ item.school }}</span>
            —
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.city`, (event.target as HTMLElement).innerText)">{{ item.city }}</span>
          </p>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.terra-template { min-height: calc(100vh - 80px); display: grid; grid-template-columns: 270px 1fr; background: #f4f4f5; border-radius: 14px; overflow: hidden; }
aside { background: #d4d4d8; padding: 28px 20px; }
.terra-photo { border: 6px solid #fff; box-shadow: 0 10px 20px rgba(0, 0, 0, .12); }
aside h3 { margin: 18px 0 8px; padding: 8px; background: #fff; font-size: .88rem; text-transform: uppercase; letter-spacing: .07em; }
aside ul { padding-left: 16px; }
main { padding: 28px 34px; background: linear-gradient(165deg, #b67f72 0 14%, #f4f4f5 14%); }
header h1 { color: #b67f72; font-size: 2.5rem; line-height: 1; margin-bottom: 6px; }
header p { color: #9d6f63; margin-bottom: 18px; }
h2 { color: #b67f72; border-top: 1px solid #d4d4d8; padding-top: 12px; margin-bottom: 12px; }
article { margin-bottom: 14px; }
.period { color: #71717a; font-size: .8rem; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 45%, transparent); }
@media (max-width:1120px){ .terra-template{ grid-template-columns:1fr; } }
</style>
