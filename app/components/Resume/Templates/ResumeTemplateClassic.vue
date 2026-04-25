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
  <div class="classic-template">
    <aside class="classic-sidebar">
      <h1>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span><br>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
      </h1>
      <p class="job editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>
      <h3>Details</h3>
      <ul>
        <li>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</span>,
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('country', (event.target as HTMLElement).innerText)">{{ resume.country }}</span>
        </li>
        <li class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</li>
        <li class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</li>
      </ul>

      <h3>Skills</h3>
      <ul class="level-list">
        <li v-for="(skill, index) in resume.skills" :key="skill.name">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
          <div class="progress"><i :style="{ width: `${skill.level}%` }" /></div>
        </li>
      </ul>

      <h3>Languages</h3>
      <ul class="level-list">
        <li v-for="(language, index) in resume.languages" :key="language.name">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`languages.${index}.name`, (event.target as HTMLElement).innerText)">{{ language.name }}</span>
          <div class="progress"><i :style="{ width: `${language.level}%` }" /></div>
        </li>
      </ul>
    </aside>

    <main class="classic-content">
      <section>
        <h2>Profile</h2>
        <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile }}</p>
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
      <section>
        <h2>Education</h2>
        <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" class="entry text-dark">
          <h4 class="text-dark">
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.degree`, (event.target as HTMLElement).innerText)">{{ item.degree }}</span>,
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.school`, (event.target as HTMLElement).innerText)">{{ item.school }}</span>
          </h4>
          <p class="dates">
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.start`, (event.target as HTMLElement).innerText)">{{ item.start }}</span> -
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.end`, (event.target as HTMLElement).innerText)">{{ item.end }}</span>
          </p>
          <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.note`, (event.target as HTMLElement).innerText)">{{ item.note }}</p>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.classic-template { display:grid; grid-template-columns:260px 1fr; min-height: calc(100vh - 80px); background: var(--cv-page); border-radius: 14px; overflow:hidden; }
.classic-sidebar { background: var(--cv-sidebar); color:#fff; padding:28px 24px; }
.classic-sidebar h1 { font-size:2rem; line-height:1.2; margin-bottom:18px; }
.job { letter-spacing:.08em; font-size:.8rem; margin-bottom:24px; text-transform: uppercase; }
.classic-sidebar ul { list-style:none; padding:0; }
.classic-sidebar li { margin-bottom:10px; }
.level-list .progress { height:4px; background:rgba(255,255,255,.3); margin-top:4px; }
.level-list .progress i { display:block; height:4px; background:#fff; }
.classic-content { padding:28px; }
.classic-content h2 { color: var(--cv-accent); margin-bottom: 8px; }
.entry { margin-bottom: 16px; }
.dates { font-size:.75rem; text-transform:uppercase; color:#6b7280; letter-spacing:.08em; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 50%, transparent); }
@media (max-width:1120px){ .classic-template{ grid-template-columns:1fr; } }
</style>
