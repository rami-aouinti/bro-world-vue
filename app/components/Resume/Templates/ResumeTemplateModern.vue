<script setup lang="ts">
const props = withDefaults(defineProps<{ resume: any; showPhoto?: boolean; editable?: boolean }>(), {
  showPhoto: false,
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
  <div class="modern-template">
    <header class="modern-header">
      <v-avatar v-if="showPhoto && resume.photoUrl" size="82" class="mb-3">
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
      <aside>
        <section>
          <h3>Skills</h3>
          <ul class="bars">
            <li v-for="(skill, index) in resume.skills" :key="skill.name" class="text-dark">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
              <div><i :style="{ width: `${skill.level}%` }" /></div>
            </li>
          </ul>
        </section>
        <section>
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
          <h2>Profile</h2>
          <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile || 'Add a professional summary from the Edit tab.' }}</p>
        </section>
        <section>
          <h2>Employment History</h2>
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
      </main>
    </div>
  </div>
</template>

<style scoped>
.modern-template { min-height: calc(100vh - 80px); border-radius:14px; overflow:hidden; background: #fff; }
.modern-header { background: color-mix(in srgb, var(--cv-accent) 85%, white); color: #071325; padding:26px 30px; }
.modern-header h1 { font-size:2.2rem; margin-bottom:4px; }
.modern-grid { display:grid; grid-template-columns: 280px 1fr; }
aside { background:#f8fafc; padding:22px; }
main { padding:24px; }
h2,h3 { color:var(--cv-accent); margin-bottom:8px; }
.bars { list-style:none; padding:0; }
.bars li { margin-bottom:10px; }
.bars div { height:4px; background:#d1d5db; margin-top:4px; }
.bars i { display:block; height:4px; background:var(--cv-accent); }
.dates { font-size:.75rem; color:#6b7280; text-transform: uppercase; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 50%, transparent); }
@media (max-width:1120px){ .modern-grid{ grid-template-columns: 1fr; } }
</style>
