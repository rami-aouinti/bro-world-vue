<script setup lang="ts">
type LayoutSettings = {
  photoSize?: number
  photoBorderWidth?: number
  photoPosition?: 'left' | 'center' | 'right'
  sidebarWidth?: number
  sectionDividerStyle?: 'none' | 'line' | 'thick'
  headingCase?: 'normal' | 'uppercase'
  dateColumnWidth?: number
  lineDensity?: 'compact' | 'comfortable'
}

const props = withDefaults(defineProps<{ resume: any; showPhoto?: boolean; editable?: boolean; onPhotoClick?: () => void; layoutSettings?: LayoutSettings }>(), {
  showPhoto: true,
  editable: false,
  onPhotoClick: undefined,
  layoutSettings: () => ({}),
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

const sidebarStyle = computed(() => ({
  width: `${props.layoutSettings?.sidebarWidth ?? 300}px`,
}))
const bodyStyle = computed(() => ({
  gridTemplateColumns: `1fr ${props.layoutSettings?.sidebarWidth ?? 300}px`,
}))
const headingStyle = computed(() => ({
  textTransform: props.layoutSettings?.headingCase === 'uppercase' ? 'uppercase' : 'none',
}))
const sectionStyle = computed(() => ({
  borderBottom: props.layoutSettings?.sectionDividerStyle === 'none'
    ? 'none'
    : `${props.layoutSettings?.sectionDividerStyle === 'thick' ? 3 : 1}px solid color-mix(in srgb, var(--cv-accent) 20%, var(--cv-page))`,
}))
const periodStyle = computed(() => ({
  display: 'inline-block',
  minWidth: `${props.layoutSettings?.dateColumnWidth ?? 120}px`,
}))
const articleStyle = computed(() => ({
  marginBottom: props.layoutSettings?.lineDensity === 'compact' ? '8px' : '14px',
}))
const photoStyle = computed(() => ({
  height: `${(props.layoutSettings?.photoSize ?? 140) * 2.2}px`,
  borderWidth: `${props.layoutSettings?.photoBorderWidth ?? 1}px`,
}))
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

    <div class="body" :style="bodyStyle">
      <main>
        <p class="intro editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile }}</p>
        <section>
          <h2 :style="[headingStyle, sectionStyle]">Expérience professionnelle</h2>
          <article v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" :style="articleStyle">
            <h4>
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.company`, (event.target as HTMLElement).innerText)">{{ experience.company }}</span>,
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.city`, (event.target as HTMLElement).innerText)">{{ experience.city }}</span>
            </h4>
            <p class="period" :style="periodStyle">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.start`, (event.target as HTMLElement).innerText)">{{ experience.start }}</span> -
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.end`, (event.target as HTMLElement).innerText)">{{ experience.end }}</span>
            </p>
            <p class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.role`, (event.target as HTMLElement).innerText)">{{ experience.role }}</p>
          </article>
        </section>

        <section>
          <h2 :style="[headingStyle, sectionStyle]">Formation</h2>
          <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" :style="articleStyle">
            <h4 class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.degree`, (event.target as HTMLElement).innerText)">{{ item.degree }}</h4>
            <p class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.school`, (event.target as HTMLElement).innerText)">{{ item.school }}</p>
          </article>
        </section>
      </main>

      <aside :style="sidebarStyle">
        <v-img v-if="showPhoto && resume.photoUrl" :src="resume.photoUrl" class="mb-6 avatar" :style="photoStyle" cover @click="onPhotoClick?.()" />
        <h3 :style="[headingStyle, sectionStyle]">Informations personnelles</h3>
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</p>
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</p>
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</p>

        <h3 :style="[headingStyle, sectionStyle]">Informatique</h3>
        <div v-for="(skill, index) in resume.skills" :key="skill.name" class="dot-row">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
          <b :style="{ '--dots': Math.max(1, Math.round(skill.level / 20)) }" />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* Theme convention: use only var(--cv-sidebar), var(--cv-accent), var(--cv-page) (+ color-mix). No hardcoded theme colors. */
.corporate-template { min-height: calc(100vh - 80px); background: var(--cv-page); border-radius: 14px; overflow: hidden; }
header { background: var(--cv-sidebar); color: color-mix(in srgb, var(--cv-page) 94%, white); padding: 20px 26px; }
header h1 { font-size: 3rem; line-height: 1; margin-bottom: 4px; }
header p { font-size: 1.8rem; }
.body { display: grid; grid-template-columns: 1fr 300px; }
main { padding: 24px; }
.intro { margin-bottom: 16px; color: color-mix(in srgb, var(--cv-sidebar) 70%, black); }
h2 { color: var(--cv-accent); border-bottom: 1px solid color-mix(in srgb, var(--cv-accent) 20%, var(--cv-page)); margin-bottom: 10px; padding-bottom: 6px; }
article { margin-bottom: 14px; }
.period { color: #6b7280; /* Intentional neutral gray metadata. */ font-size: .85rem; }
aside { background: linear-gradient(90deg, color-mix(in srgb, var(--cv-sidebar) 14%, var(--cv-page)), var(--cv-page)); padding: 16px 20px; }
.avatar { border: 1px solid color-mix(in srgb, var(--cv-accent) 20%, var(--cv-page)); height: 310px; }
aside h3 { color: var(--cv-accent); margin: 8px 0; border-bottom: 1px solid color-mix(in srgb, var(--cv-accent) 20%, var(--cv-page)); padding-bottom: 4px; }
.dot-row { margin-bottom: 8px; }
.dot-row b { display: block; margin-top: 4px; height: 12px; background: radial-gradient(circle, color-mix(in srgb, var(--cv-accent) 84%, var(--cv-sidebar)) 6px, transparent 7px) left center / 20% 100% repeat-x; clip-path: inset(0 calc((5 - var(--dots)) * 20%) 0 0); }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 40%, transparent); }
@media (max-width:1120px){ .body{ grid-template-columns:1fr; } }
</style>
