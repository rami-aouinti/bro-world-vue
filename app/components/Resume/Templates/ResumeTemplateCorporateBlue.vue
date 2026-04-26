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
  <div class="corporate-template">
    <header>
      <h1>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
      </h1>
      <p class="editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>
    </header>

    <div class="body">
      <main>
        <p class="intro editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile }}</p>
        <section>
          <h2>Expérience professionnelle</h2>
          <article v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`">
            <h4>
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.company`, (event.target as HTMLElement).innerText)">{{ experience.company }}</span>,
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.city`, (event.target as HTMLElement).innerText)">{{ experience.city }}</span>
            </h4>
            <p class="period">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.start`, (event.target as HTMLElement).innerText)">{{ experience.start }}</span> -
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.end`, (event.target as HTMLElement).innerText)">{{ experience.end }}</span>
            </p>
            <p class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.role`, (event.target as HTMLElement).innerText)">{{ experience.role }}</p>
          </article>
        </section>

        <section>
          <h2>Formation</h2>
          <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`">
            <h4 class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.degree`, (event.target as HTMLElement).innerText)">{{ item.degree }}</h4>
            <p class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.school`, (event.target as HTMLElement).innerText)">{{ item.school }}</p>
          </article>
        </section>
      </main>

      <aside>
        <v-img v-if="showPhoto && resume.photoUrl" :src="resume.photoUrl" class="mb-6 avatar" cover @click="onPhotoClick?.()" />
        <h3>Informations personnelles</h3>
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</p>
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</p>
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</p>

        <h3>Informatique</h3>
        <div v-for="(skill, index) in resume.skills" :key="skill.name" class="dot-row">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
          <b :style="{ '--dots': Math.max(1, Math.round(skill.level / 20)) }" />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.corporate-template { min-height: calc(100vh - 80px); background: #ebeced; border-radius: 14px; overflow: hidden; }
header { background: #003f7f; color: #fff; padding: 20px 26px; }
header h1 { font-size: 3rem; line-height: 1; margin-bottom: 4px; }
header p { font-size: 1.8rem; }
.body { display: grid; grid-template-columns: 1fr 300px; }
main { padding: 24px; }
.intro { margin-bottom: 16px; color: #374151; }
h2 { color: #003f7f; border-bottom: 1px solid #d1d5db; margin-bottom: 10px; padding-bottom: 6px; }
article { margin-bottom: 14px; }
.period { color: #6b7280; font-size: .85rem; }
aside { background: linear-gradient(90deg, #e5e7eb, #f5f5f5); padding: 16px 20px; }
.avatar { border: 1px solid #d1d5db; height: 310px; }
aside h3 { color: #003f7f; margin: 8px 0; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; }
.dot-row { margin-bottom: 8px; }
.dot-row b { display: block; margin-top: 4px; height: 12px; background: radial-gradient(circle, #004a8f 6px, transparent 7px) left center / 20% 100% repeat-x; clip-path: inset(0 calc((5 - var(--dots)) * 20%) 0 0); }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, #003f7f 40%, transparent); }
@media (max-width:1120px){ .body{ grid-template-columns:1fr; } }
</style>
