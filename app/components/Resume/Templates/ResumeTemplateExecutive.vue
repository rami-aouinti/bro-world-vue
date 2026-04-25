<script setup lang="ts">
const props = withDefaults(defineProps<{ resume: any; showPhoto?: boolean; editable?: boolean; useTimeline?: boolean }>(), {
  showPhoto: false,
  editable: false,
  useTimeline: false,
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
  <div class="executive-template">
    <aside class="executive-sidebar">
      <v-avatar v-if="showPhoto && resume.photoUrl" size="92" class="mb-4">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
      <h1>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span><br>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
      </h1>
      <p class="title editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>

      <div class="contact">
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</p>
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</p>
        <p>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</span>,
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('country', (event.target as HTMLElement).innerText)">{{ resume.country }}</span>
        </p>
      </div>

      <h3>Languages</h3>
      <ul>
        <li v-for="(language, index) in resume.languages" :key="`executive-language-${index}`" class="editable-text" :contenteditable="editable" @input="event => updateText(`languages.${index}.name`, (event.target as HTMLElement).innerText)">
          {{ language.name }}
        </li>
      </ul>
    </aside>

    <main class="executive-main">
      <section>
        <h2>Executive summary</h2>
        <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile }}</p>
      </section>

      <section>
        <h2>Professional experience</h2>
        <article v-for="(experience, index) in resume.experiences" :key="`executive-exp-${index}`" class="entry text-dark" :class="{ 'timeline-entry': useTimeline }">
          <div class="entry-header text-dark">
            <h4>
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.role`, (event.target as HTMLElement).innerText)">{{ experience.role }}</span>
              -
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.company`, (event.target as HTMLElement).innerText)">{{ experience.company }}</span>
            </h4>
            <p class="text-dark">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.start`, (event.target as HTMLElement).innerText)">{{ experience.start }}</span>
              to
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.end`, (event.target as HTMLElement).innerText)">{{ experience.end }}</span>
            </p>
          </div>
          <ul>
            <li
              v-for="(bullet, bulletIndex) in experience.bullets"
              :key="bulletIndex"
              class="text-dark editable-text"
              :contenteditable="editable"
              @input="event => updateText(`experiences.${index}.bullets.${bulletIndex}`, (event.target as HTMLElement).innerText)"
            >
              {{ bullet }}
            </li>
          </ul>
        </article>
      </section>

      <section class="skills-grid">
        <div>
          <h2>Core skills</h2>
          <ul>
            <li v-for="(skill, index) in resume.skills" :key="`executive-skill-${index}`">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
            </li>
          </ul>
        </div>
        <div>
          <h2>Education</h2>
          <ul>
            <li v-for="(item, index) in resume.education" :key="`executive-edu-${index}`" class="text-dark" :class="{ 'timeline-entry': useTimeline }">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.degree`, (event.target as HTMLElement).innerText)">{{ item.degree }}</span>
              —
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.school`, (event.target as HTMLElement).innerText)">{{ item.school }}</span>
            </li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.executive-template { min-height: calc(100vh - 80px); display: grid; grid-template-columns: 280px 1fr; border-radius: 18px; overflow: hidden; background: #fff; }
.executive-sidebar { background: linear-gradient(180deg, var(--cv-sidebar), color-mix(in srgb, var(--cv-sidebar) 82%, black)); color: #f8fafc; padding: 28px 22px; }
.executive-sidebar h1 { line-height: 1.1; margin-bottom: 10px; font-size: 1.9rem; }
.title { font-size: .95rem; opacity: .9; margin-bottom: 20px; }
.contact p { margin-bottom: 7px; color: #dbeafe; }
h3 { margin-top: 22px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .08em; font-size: .78rem; color: #bfdbfe; }
.executive-sidebar ul { list-style: none; padding: 0; }
.executive-sidebar li { padding: 6px 0; border-bottom: 1px solid rgb(191 219 254 / .2); }
.executive-main { padding: 28px; color: #111827; }
section + section { margin-top: 22px; }
h2 { color: var(--cv-accent); margin-bottom: 9px; font-size: 1rem; text-transform: uppercase; letter-spacing: .08em; }
.entry + .entry { margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
.entry-header { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; flex-wrap: wrap; }
.entry-header p { color: #6b7280; font-size: .8rem; }
.timeline-entry { position: relative; padding-left: 18px; }
.timeline-entry::before { content: ''; position: absolute; left: 2px; top: 6px; bottom: 2px; width: 2px; background: #d1d5db; }
.timeline-entry::after { content: ''; position: absolute; left: -2px; top: 6px; width: 10px; height: 10px; border-radius: 50%; background: var(--cv-accent); }
.skills-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
ul { margin: 0; padding-left: 18px; }
li { margin-bottom: 6px; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 40%, transparent); }
@media (max-width: 1080px) { .executive-template { grid-template-columns: 1fr; } .skills-grid { grid-template-columns: 1fr; } }
</style>
