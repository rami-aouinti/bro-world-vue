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

const leftStyle = computed(() => ({
  width: `${props.layoutSettings?.sidebarWidth ?? 320}px`,
}))
const layoutStyle = computed(() => ({
  gridTemplateColumns: `${props.layoutSettings?.sidebarWidth ?? 320}px 1fr`,
}))
const photoStyle = computed(() => ({
  width: `${props.layoutSettings?.photoSize ?? 180}px`,
  height: `${props.layoutSettings?.photoSize ?? 180}px`,
  borderWidth: `${props.layoutSettings?.photoBorderWidth ?? 8}px`,
  marginLeft: props.layoutSettings?.photoPosition === 'left' ? '0' : 'auto',
  marginRight: props.layoutSettings?.photoPosition === 'right' ? '0' : 'auto',
}))
const headingStyle = computed(() => ({
  textTransform: props.layoutSettings?.headingCase === 'uppercase' ? 'uppercase' : 'none',
}))
const sectionStyle = computed(() => ({
  borderBottom: props.layoutSettings?.sectionDividerStyle === 'none'
    ? 'none'
    : `${props.layoutSettings?.sectionDividerStyle === 'thick' ? 3 : 1}px solid rgba(255,255,255,.45)`,
  paddingBottom: '4px',
}))
const articleStyle = computed(() => ({
  marginBottom: props.layoutSettings?.lineDensity === 'compact' ? '6px' : '10px',
}))
</script>

<template>
  <div class="ocean-template" :style="layoutStyle">
    <section class="left" :style="leftStyle">
      <v-avatar v-if="showPhoto && resume.photoUrl" class="ocean-photo" :style="photoStyle" @click="onPhotoClick?.()">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
      <h1>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
      </h1>
      <p class="role editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>
      <p class="summary editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile }}</p>
      <h3 :style="[headingStyle, sectionStyle]">Contact</h3>
      <p class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</p>
      <p class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</p>
    </section>

    <section class="right">
      <div>
        <h2 :style="[headingStyle, sectionStyle]">Education</h2>
        <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" :style="articleStyle">
          <h4 class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.degree`, (event.target as HTMLElement).innerText)">{{ item.degree }}</h4>
          <p class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.school`, (event.target as HTMLElement).innerText)">{{ item.school }}</p>
        </article>
      </div>
      <div>
        <h2 :style="[headingStyle, sectionStyle]">Experience</h2>
        <article v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" :style="articleStyle">
          <h4 class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.company`, (event.target as HTMLElement).innerText)">{{ experience.company }}</h4>
          <p class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.role`, (event.target as HTMLElement).innerText)">{{ experience.role }}</p>
        </article>
      </div>
      <div>
        <h2 :style="[headingStyle, sectionStyle]">Skills</h2>
        <div v-for="(skill, index) in resume.skills" :key="skill.name" class="skill-line">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
          <i :style="{ width: `${skill.level}%` }" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ocean-template { min-height: calc(100vh - 80px); display: grid; grid-template-columns: 1fr 1fr; border-radius: 14px; overflow: hidden; }
.left { background: linear-gradient(147deg, #1f8ca8 0%, #f8fafc 47%); padding: 32px; color: #0b4b63; }
.right { background: linear-gradient(135deg, #0f6f89, #0a4b62); color: #e0f2fe; padding: 34px 26px; display: grid; gap: 24px; }
.ocean-photo { border-radius: 18px; border: 8px solid #fff; margin-bottom: 20px; }
h1 { font-size: 2.1rem; line-height: 1.1; margin-bottom: 4px; }
.role { text-transform: uppercase; letter-spacing: .16em; margin-bottom: 12px; }
.summary { font-size: .92rem; color: #155e75; margin-bottom: 18px; }
h2 { font-size: 1.8rem; text-transform: uppercase; margin-bottom: 10px; color: #fff; }
article { margin-bottom: 10px; }
.skill-line { margin-bottom: 8px; }
.skill-line i { display: block; height: 8px; background: #ecfeff; margin-top: 3px; border-radius: 999px; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, white 35%, transparent); }
@media (max-width:1120px){ .ocean-template{ grid-template-columns:1fr; } }
</style>
