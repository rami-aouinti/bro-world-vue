<script setup lang="ts">
const props = withDefaults(defineProps<{ resume: any; showPhoto?: boolean; editable?: boolean; useTimeline?: boolean; onPhotoClick?: () => void }>(), {
  showPhoto: false,
  editable: false,
  useTimeline: false,
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
  <div class="creative-template cv-template-base cv-gradient-page text-dark">
    <header class="hero cv-gradient-hero">
      <div>
        <p class="eyebrow">Creative profile</p>
        <h1>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
        </h1>
        <p class="role editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>
      </div>
      <v-avatar v-if="showPhoto && resume.photoUrl" size="108" class="creative-avatar" @click="onPhotoClick?.()">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
    </header>

    <section class="quick-info">
      <span class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</span>
      <span class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</span>
      <span>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</span>,
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('country', (event.target as HTMLElement).innerText)">{{ resume.country }}</span>
      </span>
    </section>

    <section class="content-grid">
      <article class="cv-card-surface">
        <h2 class="cv-heading-section">Profile</h2>
        <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">
          {{ resume.profile || 'Add your personal summary from the Edit tab.' }}
        </p>
      </article>

      <article class="cv-card-surface">
        <h2 class="cv-heading-section">Experience</h2>
        <div v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" class="timeline-item text-dark" :class="{ 'timeline-mode': useTimeline }">
          <h3>
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.role`, (event.target as HTMLElement).innerText)">{{ experience.role }}</span>
            ·
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.company`, (event.target as HTMLElement).innerText)">{{ experience.company }}</span>
          </h3>
          <p class="dates">
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.start`, (event.target as HTMLElement).innerText)">{{ experience.start }}</span>
            —
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`experiences.${index}.end`, (event.target as HTMLElement).innerText)">{{ experience.end }}</span>
          </p>
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
        </div>
      </article>

      <article class="cv-card-surface">
        <h2 class="cv-heading-section">Skills</h2>
        <div v-for="(skill, index) in resume.skills" :key="skill.name" class="chip-row">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
          <small>{{ skill.level }}%</small>
        </div>
      </article>

      <article class="cv-card-surface">
        <h2 class="cv-heading-section">Education</h2>
        <div v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" class="education-item text-dark" :class="{ 'timeline-mode': useTimeline }">
          <h3>
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.degree`, (event.target as HTMLElement).innerText)">{{ item.degree }}</span>
          </h3>
          <p>
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.school`, (event.target as HTMLElement).innerText)">{{ item.school }}</span>
            ·
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.city`, (event.target as HTMLElement).innerText)">{{ item.city }}</span>
          </p>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
/* Theme convention: use only var(--cv-sidebar), var(--cv-accent), var(--cv-page) (+ color-mix). No hardcoded theme colors. */
.creative-template { font-family: var(--cv-font-family, 'Inter', 'Segoe UI', Arial, sans-serif); font-style: var(--cv-font-style, normal); font-weight: var(--cv-font-weight, 400); min-height: calc(100vh - 80px); background: var(--cv-gradient-page); border-radius: var(--cv-radius, 20px); overflow: hidden; }
.hero { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 28px; background: var(--cv-gradient-hero); color: color-mix(in srgb, var(--cv-page) 95%, white); }
.eyebrow { letter-spacing: .12em; text-transform: uppercase; font-size: .72rem; margin-bottom: 6px; opacity: .9; }
h1 { font-size: 2.25rem; line-height: 1.1; margin: 0; }
.role { margin-top: 10px; font-size: 1.05rem; }
.creative-avatar { border: 4px solid color-mix(in srgb, var(--cv-page) 60%, transparent); box-shadow: 0 15px 28px color-mix(in srgb, var(--cv-sidebar) 30%, transparent); }
.quick-info { display: flex; flex-wrap: wrap; gap: 10px 18px; padding: 14px 28px; font-weight: 500; color: color-mix(in srgb, var(--cv-sidebar) 80%, black); background: color-mix(in srgb, var(--cv-page) 78%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--cv-accent) 18%, var(--cv-page)); }
.content-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; padding: 22px 28px 30px; }
article { background: var(--cv-page); border-radius: 16px; padding: 18px; border: 1px solid color-mix(in srgb, var(--cv-accent) 14%, var(--cv-page)); box-shadow: 0 8px 20px color-mix(in srgb, var(--cv-sidebar) 8%, transparent); }
h2 { margin-bottom: 12px; color: var(--cv-title); }
.timeline-item + .timeline-item { margin-top: 14px; padding-top: 14px; border-top: 1px dashed color-mix(in srgb, var(--cv-accent) 24%, var(--cv-page)); }
.timeline-mode { position: relative; padding-left: 16px; border-top: 0 !important; }
.timeline-mode::before { content: ''; position: absolute; left: 3px; top: 2px; bottom: 2px; width: 2px; background: color-mix(in srgb, var(--cv-accent) 24%, var(--cv-page)); }
.timeline-mode::after { content: ''; position: absolute; left: -1px; top: 6px; width: 10px; height: 10px; border-radius: 50%; background: var(--cv-accent); }
.dates { font-size: .78rem; color: var(--cv-secondary); /* Intentional neutral gray metadata. */ margin-bottom: 6px; }
ul { padding-left: 18px; }
li { margin-bottom: 4px; }
.chip-row { display: flex; justify-content: space-between; align-items: center; background: color-mix(in srgb, var(--cv-accent) 12%, var(--cv-page)); border-radius: 999px; padding: 7px 12px; margin-bottom: 8px; }
.chip-row small { color: var(--cv-title); font-weight: 700; }
.education-item + .education-item { margin-top: 10px; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 45%, transparent); }
@media (max-width: 1080px) { .content-grid { grid-template-columns: 1fr; } }
</style>
