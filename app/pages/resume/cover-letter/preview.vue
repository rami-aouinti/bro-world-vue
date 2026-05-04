<script setup lang="ts">
import { listMyResumes } from '~/services/resumeApi'
import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'
import GENERATED_COVER_LETTER_TEMPLATES from '~/data/resume-templates/generated-20-cover-letter.json'

definePageMeta({ title: 'Resume · Cover Letter Preview', layout: 'resume' })
const route = useRoute()
const { coverLetterTemplates } = useResumeTemplates()
const selectedTemplate = ref(coverLetterTemplates.value[0]?.id || GENERATED_COVER_LETTER_TEMPLATES[0]?.id || '')
const photoOptions = ['/img/team-1.jpg', '/img/team-2.jpg', '/img/team-3.jpg', '/img/team-4.jpg']
const decorShapeOptions = ['circle', 'ring', 'blob']
const imageShape = ref<'circle' | 'square'>('circle')
const imageSize = ref(84)
const imageBorderWidth = ref(2)
const imageBorderColor = ref('#0f172a')
const selectedPalette = ref<'template' | 'sunset' | 'forest' | 'custom'>('template')
const customPrimary = ref('#0F4C81')
const customSecondary = ref('#5FA8D3')
const customPageBackground = ref('#F8FAFC')
const model = reactive({ fullName:'Alex Martin', role:'Senior Full Stack Developer', summary:'Driven engineer delivering robust products with strong UX and clean architecture.', location:'Paris, France', email:'alex@example.com', phone:'+33 6 00 00 00 00', date:new Date().toLocaleDateString('en-US'), photoUrl:photoOptions[0], heading:'Cover Letter' })
const activeTemplate = computed(() => GENERATED_COVER_LETTER_TEMPLATES.find((tpl) => tpl.id === selectedTemplate.value) || GENERATED_COVER_LETTER_TEMPLATES[0])
const editableDecorObjects = ref<any[]>([])
const sectionDividerStyle = computed(() => {
  const showDivider = activeTemplate.value?.layoutOptions?.showDivider ?? true
  if (!showDivider) return 'none'
  return activeTemplate.value?.decor?.divider === 'dashed' ? 'dashed' : 'solid'
})
const sectionSpacing = computed(() => activeTemplate.value?.layoutOptions?.sectionSpacing === 'wide' ? '40px' : '24px')
const activeColors = computed(() => {
  const palette = activeTemplate.value.theme.palette
  if (selectedPalette.value === 'sunset') return { ...palette, primary: '#C2410C', secondary: '#FDBA74', pageBackground: '#FFF7ED' }
  if (selectedPalette.value === 'forest') return { ...palette, primary: '#166534', secondary: '#86EFAC', pageBackground: '#F0FDF4' }
  if (selectedPalette.value === 'custom') return { ...palette, primary: customPrimary.value, secondary: customSecondary.value, pageBackground: customPageBackground.value }
  return palette
})
const signatureDataUrl = ref('')
const signatureDialogOpen = ref(false)
const signatureCanvas = ref<HTMLCanvasElement | null>(null)
const photoInput = ref<HTMLInputElement | null>(null)
const layoutMenuOpen = ref(false)

watch(activeTemplate, (tpl) => { editableDecorObjects.value = JSON.parse(JSON.stringify(tpl?.decor?.objects || [])) }, { immediate: true })
function addDecorObject(){ editableDecorObjects.value.push({ type:'circle', x:'50%', y:'50%', size:'120', opacity:0.15 }) }
function removeDecorObject(i:number){ editableDecorObjects.value.splice(i,1) }
function goToCreateResume(){ navigateTo('/resume/preview') }
function applyPreviewTemplate(id:string){ selectedTemplate.value = id; layoutMenuOpen.value = false }
function saveFromPreview(){ localStorage.setItem('resume-cover-preview-letter', JSON.stringify({ template:selectedTemplate.value, model, decor:editableDecorObjects.value, signature:signatureDataUrl.value })) }
async function downloadPdf(){ const node=document.querySelector('.capture-cover-letter') as HTMLElement|null; if(!node) return; const w=window.open('','_blank','width=950,height=1200'); if(!w) return; w.document.write(`<html><body style="margin:0;display:flex;justify-content:center">${node.outerHTML}</body></html>`); w.document.close(); await new Promise((r)=>setTimeout(r,350)); w.print(); w.close() }
function openPhotoUpload(){ photoInput.value?.click() }
function onPhotoUpload(event: Event){ const input = event.target as HTMLInputElement; const file = input.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{ model.photoUrl = String(reader.result || model.photoUrl); input.value = '' }; reader.readAsDataURL(file) }
function openSignatureDialog(){ signatureDialogOpen.value=true; nextTick(initCanvas) }
function initCanvas(){ const c=signatureCanvas.value; if(!c) return; const ctx=c.getContext('2d'); if(!ctx) return; c.width=c.clientWidth||680; c.height=200; ctx.lineWidth=2; ctx.lineCap='round'; let draw=false; const p=(e:PointerEvent)=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}; c.onpointerdown=(e)=>{draw=true;const x=p(e);ctx.beginPath();ctx.moveTo(x.x,x.y)}; c.onpointermove=(e)=>{if(!draw)return;const x=p(e);ctx.lineTo(x.x,x.y);ctx.stroke()}; c.onpointerup=()=>{draw=false;signatureDataUrl.value=c.toDataURL('image/png')} }
onMounted(async ()=>{ const q=typeof route.query.template==='string'?route.query.template:''; if(q&&coverLetterTemplates.value.some((t)=>t.id===q)) selectedTemplate.value=q; try { const resumes = await listMyResumes(); const info = resumes?.[0]?.resumeInformation; if (info?.fullName) model.fullName = info.fullName; if (info?.title) model.role = info.title; if (info?.profileText) model.summary = info.profileText; if (info?.email) model.email = info.email; if (info?.phone) model.phone = info.phone; if (info?.photo && 'photoUrl' in model) model.photoUrl = info.photo } catch { /* noop */ } })
</script>
<template>
<div>
  <AppPageDrawers>
    <template #left>
      <AppSelect v-model="model.photoUrl" :items="photoOptions.map((value)=>({title:value,value}))" label="Photo" hide-details class="mt-3"/>
      <input ref="photoInput" type="file" accept="image/*" class="d-none" @change="onPhotoUpload">
      <v-text-field v-model="model.date" label="Date" hide-details class="mt-3"/>
      <v-slider v-model="imageSize" label="Image size" min="48" max="180" step="1" hide-details class="mt-3"/>
      <AppSelect v-model="imageShape" :items="[{ title: 'Circle', value: 'circle' }, { title: 'Square', value: 'square' }]" label="Image shape" hide-details class="mt-3"/>
      <v-slider v-model="imageBorderWidth" label="Border width" min="0" max="8" step="1" hide-details class="mt-3"/>
      <v-text-field v-model="imageBorderColor" type="color" label="Border color" hide-details class="mt-3"/>
      <v-menu><template #activator="{ props }"><v-btn v-bind="props" class="mt-3" variant="outlined" block>Palette</v-btn></template><v-list><v-list-item title="Template" @click="selectedPalette='template'"/><v-list-item title="Sunset" @click="selectedPalette='sunset'"/><v-list-item title="Forest" @click="selectedPalette='forest'"/><v-list-item title="Custom" @click="selectedPalette='custom'"/></v-list></v-menu>
      <v-text-field v-if="selectedPalette==='custom'" v-model="customPrimary" label="Custom primary" hide-details class="mt-3"/>
      <v-text-field v-if="selectedPalette==='custom'" v-model="customSecondary" label="Custom secondary" hide-details class="mt-3"/>
      <v-text-field v-if="selectedPalette==='custom'" v-model="customPageBackground" label="Custom page background" hide-details class="mt-3"/>
    </template>
    <template #right>
      <AppSelect v-model="selectedTemplate" :items="coverLetterTemplates.map((t)=>({title:t.title,value:t.id}))" label="Template" hide-details class="mt-3"/>
      <v-btn class="mt-3" size="small" variant="outlined" @click="addDecorObject">Add decor</v-btn>
      <v-card v-for="(obj,i) in editableDecorObjects" :key="`obj-${i}`" class="mt-3 pa-2" variant="outlined">
        <AppSelect v-model="obj.type" :items="decorShapeOptions.map((s)=>({title:s,value:s}))" label="Shape" hide-details class="mt-3"/>
        <v-slider v-model="obj.size" label="Size" min="30" max="260" step="1" hide-details class="mt-3"/>
        <v-slider v-model="obj.opacity" label="Opacity" min="0.02" max="0.4" step="0.01" hide-details class="mt-3"/>
        <v-text-field v-model="obj.x" label="X (50%)" hide-details class="mt-3"/><v-text-field v-model="obj.y" label="Y (50%)" hide-details class="mt-3"/>
        <v-btn size="x-small" color="error" variant="text" @click="removeDecorObject(i)">remove</v-btn>
      </v-card>
    </template>
  </AppPageDrawers>
  <v-container fluid>
    <div class="preview-toolbar-wrap"><div class="preview-toolbar-row">
      <v-btn class="preview-toolbar-btn" size="small" variant="outlined" prepend-icon="mdi-content-save-cog-outline" @click="saveFromPreview">Save</v-btn>
      <v-btn class="preview-toolbar-btn" size="small" variant="outlined" prepend-icon="mdi-robot-outline" @click="goToCreateResume">AI</v-btn>
      <v-btn class="preview-toolbar-btn" size="small" variant="outlined" prepend-icon="mdi-signature-freehand" @click="openSignatureDialog">Signature</v-btn>
      <v-btn class="preview-toolbar-btn" size="small" variant="outlined" prepend-icon="mdi-file-pdf-box" @click="downloadPdf">PDF</v-btn>
      <v-menu v-model="layoutMenuOpen"><template #activator="{ props }"><v-btn class="preview-toolbar-btn" size="small" variant="outlined" prepend-icon="mdi-view-grid-outline" v-bind="props">Templates</v-btn></template><v-list density="compact"><v-list-item v-for="template in coverLetterTemplates" :key="template.id" :title="template.title" @click="applyPreviewTemplate(template.id)"/></v-list></v-menu>
    </div></div>
    <div class="py-8 d-flex justify-center"><main class="capture-cover-letter" :style="{'--cp-primary':activeColors.primary,'--cp-secondary':activeColors.secondary,'--cp-text':activeColors.text,'--cp-muted':activeColors.muted,'--cp-bg':activeColors.pageBackground,'--section-divider-style':sectionDividerStyle,'--section-spacing':sectionSpacing}">
      <div v-for="(obj,index) in editableDecorObjects" :key="`decor-${index}`" class="decor-object" :class="`decor-${obj.type}`" :style="{left:obj.x,top:obj.y,width:`${obj.size}px`,height:`${obj.size}px`,opacity:obj.opacity}"/>
      <header class="hero"><v-avatar :size="imageSize" class="mb-4 avatar-upload" :rounded="imageShape === 'circle' ? 'circle' : 'lg'" @click="openPhotoUpload"><v-img :src="model.photoUrl" cover @click.stop="openPhotoUpload"/><div class="avatar-overlay">Change</div></v-avatar>
        <HoverRichTextEditor v-model="model.fullName" label="Full name" />
        <HoverRichTextEditor v-model="model.role" label="Role" />
        <p class="meta" contenteditable="true" @input="model.date=($event.target as HTMLElement).innerText">{{ model.date }}</p>
        <p class="meta" contenteditable="true" @input="model.location=($event.target as HTMLElement).innerText">{{ model.location }}</p>
      </header>
      <section><h2 contenteditable="true" @input="model.heading=($event.target as HTMLElement).innerText">{{ model.heading }}</h2>
        <HoverRichTextEditor v-model="model.summary" label="Summary" />
        <p class="meta" contenteditable="true" @input="model.email=($event.target as HTMLElement).innerText">{{ model.email }}</p>
        <p class="meta" contenteditable="true" @input="model.phone=($event.target as HTMLElement).innerText">{{ model.phone }}</p>
      </section>
      <footer v-if="signatureDataUrl" class="signature-footer"><img :src="signatureDataUrl" alt="signature" class="signature-image"/></footer>
    </main></div>
    <v-dialog v-model="signatureDialogOpen" max-width="760"><v-card><v-card-title>Signature</v-card-title><v-card-text><canvas ref="signatureCanvas" style="width:100%;height:200px;border:1px solid rgba(0,0,0,.15);border-radius:10px"/></v-card-text></v-card></v-dialog>
  </v-container>
</div>
</template>
<style scoped>.capture-cover-letter{position:relative;overflow:hidden;width:850px;min-height:1123px;padding:80px;background:var(--cp-bg);color:var(--cp-text)}.hero{border-left:10px solid var(--cp-primary);padding-left:24px;margin-bottom:48px}.avatar-upload{cursor:pointer;position:relative;overflow:hidden;border-style:solid;border-color:v-bind(imageBorderColor);border-width:v-bind(imageBorderWidth + 'px')} .avatar-overlay{position:absolute;inset:auto 0 0 0;padding:2px 0;background:rgba(15,23,42,.55);color:#fff;font-size:10px;text-align:center}h1{font-size:58px;margin:0}p{font-size:24px;color:var(--cp-muted)}.meta{font-size:16px}h2{color:var(--cp-primary);font-size:40px;margin:0 0 16px}section{border-top:3px var(--section-divider-style) var(--cp-secondary);padding-top:24px;margin-top:var(--section-spacing)}.decor-object{position:absolute;pointer-events:none;background:color-mix(in srgb,var(--cp-primary) 35%,transparent)}.decor-circle{border-radius:999px}.decor-ring{border-radius:999px;background:transparent;border:3px solid color-mix(in srgb,var(--cp-secondary) 55%,transparent)}.decor-blob{border-radius:40% 60% 55% 45% / 50% 35% 65% 50%}.preview-toolbar-wrap{position:sticky;top:74px;z-index:20;display:flex;justify-content:center}.preview-toolbar-row{display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px;border:1px solid rgba(148,163,184,.35);border-radius:999px;background:rgba(255,255,255,.92)}.signature-footer{margin-top:32px}.signature-image{height:68px;object-fit:contain}</style>

<style scoped>@media (prefers-color-scheme: dark){.preview-toolbar-row{background:rgba(15,23,42,.82);border-color:rgba(148,163,184,.45)} .preview-toolbar-btn{color:#e2e8f0} .capture-cover-page,.capture-cover-letter{box-shadow:0 10px 30px rgba(0,0,0,.45)}}</style>
