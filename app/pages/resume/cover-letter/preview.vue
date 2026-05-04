<script setup lang="ts">
import GENERATED_COVER_LETTER_TEMPLATES from '~/data/resume-templates/generated-20-cover-letter.json'

definePageMeta({ title: 'Resume · Cover Letter Preview', layout: 'resume' })

const route = useRoute()
const { coverLetterTemplates } = useResumeTemplates()
const selectedTemplate = ref(coverLetterTemplates.value[0]?.id || GENERATED_COVER_LETTER_TEMPLATES[0]?.id || '')

const model = reactive({
  date: new Date().toLocaleDateString('en-US'),
  title: 'Cover Letter',
  intro: 'Dear Hiring Manager,',
  bodyA: 'I am excited to apply for your role. I bring strong experience in product delivery, scalable web architecture, and cross-functional collaboration.',
  bodyB: 'I would welcome the opportunity to contribute to your team and discuss how my background aligns with your needs.',
  signature: 'Sincerely,',
  fullName: 'Alex Martin',
})

const activeTemplate = computed(() => GENERATED_COVER_LETTER_TEMPLATES.find((tpl) => tpl.id === selectedTemplate.value) || GENERATED_COVER_LETTER_TEMPLATES[0])
const decorObjects = computed(() => activeTemplate.value?.decor?.objects || [])
const styleVariantClass = computed(() => `variant-${activeTemplate.value?.name?.split('-')[3] || '01'}`)
const layoutMenuOpen = ref(false)
const signatureDialogOpen = ref(false)
const signatureCanvas = ref<HTMLCanvasElement | null>(null)
const drawingSignature = ref(false)
const saveSuccess = ref('')

function goToCreateResume() { navigateTo('/resume/preview') }
function downloadPdf() { window.print() }
function applyPreviewTemplate(templateId: string) { selectedTemplate.value = templateId; layoutMenuOpen.value = false }
function saveFromPreview() {
  localStorage.setItem('resume-cover-preview-letter', JSON.stringify({ template: selectedTemplate.value, model }))
  saveSuccess.value = 'Saved in local storage.'
  setTimeout(() => (saveSuccess.value = ''), 1800)
}
function openSignatureDialog() {
  signatureDialogOpen.value = true
  nextTick(() => {
    const c = signatureCanvas.value
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    c.width = c.clientWidth || 680
    c.height = 200
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    const point = (e: PointerEvent) => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
    c.onpointerdown = (e) => { drawingSignature.value = true; const p = point(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
    c.onpointermove = (e) => { if (!drawingSignature.value) return; const p = point(e); ctx.lineTo(p.x, p.y); ctx.stroke() }
    c.onpointerup = () => { drawingSignature.value = false }
  })
}

onMounted(() => {
  const q = typeof route.query.template === 'string' ? route.query.template : ''
  if (q && coverLetterTemplates.value.some((tpl) => tpl.id === q)) selectedTemplate.value = q
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <v-text-field v-model="model.date" label="Date" variant="outlined" hide-details class="mt-3" />
        <v-text-field v-model="model.title" label="Title" variant="outlined" hide-details class="mt-3" />
        <v-text-field v-model="model.intro" label="Intro" variant="outlined" hide-details class="mt-3" />
        <v-textarea v-model="model.bodyA" label="Paragraph 1" variant="outlined" auto-grow hide-details class="mt-3" />
        <v-textarea v-model="model.bodyB" label="Paragraph 2" variant="outlined" auto-grow hide-details class="mt-3" />
        <v-text-field v-model="model.fullName" label="Full Name" variant="outlined" hide-details class="mt-3" />
      </template>
      <template #right>
        <AppSelect v-model="selectedTemplate" :items="coverLetterTemplates.map((t) => ({ title: t.title, value: t.id }))" label="Template" hide-details class="mt-3" />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <div class="preview-toolbar-wrap">
        <div class="preview-toolbar-row">
          <v-btn class="preview-toolbar-btn" color="primary" size="small" variant="outlined" prepend-icon="mdi-content-save-cog-outline" @click="saveFromPreview">Save</v-btn>
          <v-btn class="preview-toolbar-btn" color="primary" size="small" variant="outlined" prepend-icon="mdi-robot-outline" @click="goToCreateResume">AI</v-btn>
          <v-btn class="preview-toolbar-btn" color="primary" size="small" variant="outlined" prepend-icon="mdi-signature-freehand" @click="openSignatureDialog">Signature</v-btn>
          <v-btn class="preview-toolbar-btn" color="primary" size="small" variant="outlined" prepend-icon="mdi-file-pdf-box" @click="downloadPdf">PDF</v-btn>
          <v-menu v-model="layoutMenuOpen" location="bottom center" origin="top center"><template #activator="{ props }"><v-btn class="preview-toolbar-btn" color="primary" size="small" variant="outlined" prepend-icon="mdi-view-grid-outline" v-bind="props">Templates</v-btn></template><v-list density="compact" min-width="260"><v-list-item v-for="template in coverLetterTemplates" :key="template.id" :title="template.title" @click="applyPreviewTemplate(template.id)" /></v-list></v-menu>
        </div>
      </div>
      <v-alert v-if="saveSuccess" type="success" variant="tonal" class="mb-3" :text="saveSuccess" />
      <div class="py-8 d-flex justify-center">
      <main
        class="capture-cover-letter" :class="styleVariantClass"
        :style="{
          '--cl-primary': activeTemplate.theme.palette.primary,
          '--cl-secondary': activeTemplate.theme.palette.secondary,
          '--cl-text': activeTemplate.theme.palette.text,
          '--cl-muted': activeTemplate.theme.palette.muted,
          '--cl-bg': activeTemplate.theme.palette.pageBackground,
        }"
      >

        <div
          v-for="(obj, index) in decorObjects"
          :key="`decor-${index}`"
          class="decor-object"
          :class="`decor-${obj.type}`"
          :style="{ left: obj.x, top: obj.y, width: `${obj.size}px`, height: `${obj.size}px`, opacity: obj.opacity }"
        />
        <p class="date">{{ model.date }}</p>
        <h1>{{ model.title }}</h1>
        <p class="intro">{{ model.intro }}</p>
        <p>{{ model.bodyA }}</p>
        <p>{{ model.bodyB }}</p>
        <p class="signature">{{ model.signature }}<br>{{ model.fullName }}</p>
      </main>
      </div>
      <v-dialog v-model="signatureDialogOpen" max-width="760"><v-card><v-card-title>Signature</v-card-title><v-card-text><canvas ref="signatureCanvas" style="width:100%;height:200px;border:1px solid rgba(0,0,0,.15);border-radius:10px" /></v-card-text></v-card></v-dialog>
    </v-container>
  </div>
</template>

<style scoped>
.capture-cover-letter { width: 850px; min-height: 1123px; padding: 72px; background: var(--cl-bg); color: var(--cl-text); }
.date { text-align: right; color: var(--cl-muted); }
h1 { color: var(--cl-primary); margin: 24px 0; }
p { font-size: 24px; line-height: 1.5; margin: 20px 0; }
.intro { font-weight: 700; }
.signature { margin-top: 60px; border-top: 2px solid var(--cl-secondary); padding-top: 24px; width: fit-content; }
</style>

<style scoped>
.decor-object { position: absolute; pointer-events: none; background: color-mix(in srgb, var(--cp-primary, var(--cl-primary)) 35%, transparent); filter: blur(0.2px); }
.decor-circle { border-radius: 999px; }
.decor-ring { border-radius: 999px; background: transparent; border: 3px solid color-mix(in srgb, var(--cp-secondary, var(--cl-secondary)) 55%, transparent); }
.decor-blob { border-radius: 40% 60% 55% 45% / 50% 35% 65% 50%; }
.variant-01 .hero, .variant-01 h1 { letter-spacing: 0.5px; }
.variant-02 section, .variant-02 .signature { border-style: dashed; }
.variant-03 h1 { text-transform: uppercase; }
.variant-04 p { font-style: italic; }
.variant-05 .hero, .variant-05 .date { text-align: center; border-left: 0; border-top: 10px solid var(--cp-primary); padding-top: 18px; }
.preview-toolbar-wrap { position: sticky; top: 74px; z-index: 20; display:flex; justify-content:center; margin-bottom:12px; }
.preview-toolbar-row { display:flex; flex-wrap:wrap; gap:8px; padding:10px 12px; border:1px solid rgba(148,163,184,.35); border-radius:999px; background:rgba(255,255,255,.92); backdrop-filter: blur(8px); }
.preview-toolbar-btn { text-transform:none; }
</style>
