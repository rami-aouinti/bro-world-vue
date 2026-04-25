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
  <div class="aurora-template">
    <div class="aurora-bg" />
    <header>
      <div>
        <h1>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
        </h1>
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>
      </div>
      <v-avatar v-if="showPhoto && resume.photoUrl" size="96" class="aurora-avatar">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
    </header>

    <main>
      <section class="panel">
        <h2>Career highlights</h2>
        <div v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" class="highlight">
          <h3>
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.role`, (event.target as HTMLElement).innerText)">{{ experience.role }}</span>
            @
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.company`, (event.target as HTMLElement).innerText)">{{ experience.company }}</span>
          </h3>
          <ul>
            <li
              v-for="(bullet, bulletIndex) in experience.bullets"
              :key="bulletIndex"
              class="editable-text"
              :contenteditable="editable"
              @input="event => updateText(`experiences.${index}.bullets.${bulletIndex}`, (event.target as HTMLElement).innerText)"
            >
              {{ bullet }}
            </li>
          </ul>
        </div>
      </section>

      <section class="panel small">
        <h2>Core skills</h2>
        <div v-for="(skill, index) in resume.skills" :key="`aurora-skill-${index}`" class="metric">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
          <div class="meter"><i :style="{ width: `${skill.level}%` }" /></div>
        </div>

        <h2 class="mt-4">Education</h2>
        <div v-for="(item, index) in resume.education" :key="`aurora-edu-${index}`" class="education">
          <p>
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.degree`, (event.target as HTMLElement).innerText)">{{ item.degree }}</span>
          </p>
          <small>
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.school`, (event.target as HTMLElement).innerText)">{{ item.school }}</span>
          </small>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.aurora-template { position: relative; min-height: calc(100vh - 80px); color: #e2e8f0; background: #020617; border-radius: 20px; overflow: hidden; }
.aurora-bg { position: absolute; inset: -25%; background: radial-gradient(circle at 20% 30%, rgb(16 185 129 / .35), transparent 45%), radial-gradient(circle at 80% 20%, rgb(59 130 246 / .35), transparent 40%), radial-gradient(circle at 50% 80%, rgb(168 85 247 / .35), transparent 40%); filter: blur(10px); }
header, main { position: relative; z-index: 1; }
header { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 28px; border-bottom: 1px solid rgb(148 163 184 / .25); }
h1 { font-size: 2.15rem; margin: 0 0 6px; }
.aurora-avatar { border: 3px solid rgb(226 232 240 / .35); }
main { display: grid; grid-template-columns: 1.5fr .9fr; gap: 18px; padding: 22px 28px 30px; }
.panel { background: rgb(15 23 42 / .65); border: 1px solid rgb(148 163 184 / .22); border-radius: 18px; padding: 18px; backdrop-filter: blur(8px); }
.panel h2 { font-size: .9rem; text-transform: uppercase; letter-spacing: .08em; color: #a5f3fc; margin-bottom: 10px; }
.highlight + .highlight { margin-top: 14px; padding-top: 14px; border-top: 1px solid rgb(148 163 184 / .2); }
.highlight h3 { font-size: 1rem; margin-bottom: 7px; color: #f8fafc; }
ul { margin: 0; padding-left: 18px; }
li { margin-bottom: 4px; color: #cbd5e1; }
.metric { margin-bottom: 10px; }
.meter { margin-top: 4px; height: 6px; border-radius: 999px; background: rgb(148 163 184 / .2); overflow: hidden; }
.meter i { display: block; height: 100%; background: linear-gradient(90deg, #22d3ee, #c084fc); }
.education + .education { margin-top: 8px; }
.education small { color: #94a3b8; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: rgb(125 211 252 / .7); }
@media (max-width: 1024px) { main { grid-template-columns: 1fr; } }
</style>
