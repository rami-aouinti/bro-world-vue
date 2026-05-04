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
const photoPosition = ref<'left' | 'right'>('left')
const selectedPalette = ref<'template' | 'sunset' | 'forest' | 'custom'>('template')
const customPrimary = ref('#0F4C81')
const customSecondary = ref('#5FA8D3')
const customPageBackground = ref('#F8FAFC')
const textFontSize = ref(24)
const textColor = ref('#475569')
const barRadius = ref(0)
const barLayout = ref<'single' | 'double'>('single')
const letterElementStyles = reactive({ date:{size:18,color:'#475569',weight:'400'}, address:{size:18,color:'#334155',weight:'400'} })
const fontWeightMap: Record<string, string> = { regular: '400', medium: '500', semibold: '600', bold: '700' }
const primaryBarWidth = ref(10)
const secondaryBarWidth = ref(5)
const model = reactive({ fullName:'Alex Martin', role:'Senior Full Stack Developer', summary:'Driven engineer delivering robust products with strong UX and clean architecture.', location:'Paris, France', email:'alex@example.com', phone:'+33 6 00 00 00 00', date:new Date().toLocaleDateString('en-US'), photoUrl:photoOptions[0], heading:'Cover Letter', company:'Company GmbH', companyParagraph:'I am writing to apply for an opportunity at your company.' })
const activeTemplate = computed(() => GENERATED_COVER_LETTER_TEMPLATES.find((tpl) => tpl.id === selectedTemplate.value) || GENERATED_COVER_LETTER_TEMPLATES[0])
const letterItemConfig = computed(() => activeTemplate.value?.items || {})
const letterStyleOptionsFor = (key: 'date' | 'address') => ((letterItemConfig.value as any)?.[key]?.styles || ['regular','medium','semibold','bold']).map((v:string)=>({title:v,value:fontWeightMap[v]||'400'}))
const letterSizeBoundsFor = (key: 'date' | 'address') => ({ min: (letterItemConfig.value as any)?.[key]?.size?.min ?? 16, max: (letterItemConfig.value as any)?.[key]?.size?.max ?? 22 })
const editableDecorObjects = ref<any[]>([])

function toPercentNumber(value: unknown, fallback = 50): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.min(100, Math.max(0, value))
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace('%', '').trim())
    if (Number.isFinite(parsed)) return Math.min(100, Math.max(0, parsed))
  }
  return fallback
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeDecorObject(obj: any) {
  return {
    ...obj,
    x: toPercentNumber(obj?.x, 50),
    y: toPercentNumber(obj?.y, 50),
    size: toNumber(obj?.size, 120),
    opacity: toNumber(obj?.opacity, 0.15),
  }
}
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
const photoQuickMenuOpen = ref(false)

watch(activeTemplate, (tpl) => { editableDecorObjects.value = JSON.parse(JSON.stringify(tpl?.decor?.objects || [])); photoPosition.value = tpl?.hero?.photoPosition || tpl?.sections?.photoPosition || 'left'; const items=(tpl as any)?.items||{}; for (const key of ['date','address']) { const b=items[key]?.size; if (b) letterElementStyles[key].size=Math.round((b.min+b.max)/2); if (items[key]?.colors?.[0]) letterElementStyles[key].color=items[key].colors[0]; if (items[key]?.styles?.[0]) letterElementStyles[key].weight=fontWeightMap[items[key].styles[0]]||'400' } }, { immediate: true })
function addDecorObject(){ editableDecorObjects.value.push({ type:'circle', x:'50%', y:'50%', size:'120', opacity:0.15 }) }
function removeDecorObject(i:number){ editableDecorObjects.value.splice(i,1) }
function goToCreateResume(){ navigateTo('/resume/preview') }
function applyPreviewTemplate(id:string){ selectedTemplate.value = id; layoutMenuOpen.value = false }
function saveFromPreview(){ localStorage.setItem('resume-cover-preview-letter', JSON.stringify({ template:selectedTemplate.value, model, decor:editableDecorObjects.value, signature:signatureDataUrl.value })) }
async function downloadPdf(){ const node=document.querySelector('.capture-cover-letter') as HTMLElement|null; if(!node) return; const w=window.open('','_blank','width=900,height=1300'); if(!w) return; const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map((el)=>el.outerHTML).join(''); w.document.write(`<html><head>${headStyles}<style>@page{size:A4;margin:0}html,body{margin:0;background:#fff}body{display:flex;justify-content:center;align-items:flex-start}.capture-cover-letter{width:210mm;min-height:297mm;box-sizing:border-box;margin:0}</style></head><body>${node.outerHTML}</body></html>`); w.document.close(); await new Promise((r)=>setTimeout(r,900)); w.focus(); w.print(); w.close() }
function openPhotoUpload(){ photoInput.value?.click() }
function onPhotoUpload(event: Event){ const input = event.target as HTMLInputElement; const file = input.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{ model.photoUrl = String(reader.result || model.photoUrl); input.value = '' }; reader.readAsDataURL(file) }
function openSignatureDialog(){ signatureDialogOpen.value=true; nextTick(initCanvas) }
function initCanvas(){ const c=signatureCanvas.value; if(!c) return; const ctx=c.getContext('2d'); if(!ctx) return; c.width=c.clientWidth||680; c.height=200; ctx.lineWidth=2; ctx.lineCap='round'; let draw=false; const p=(e:PointerEvent)=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}; c.onpointerdown=(e)=>{draw=true;const x=p(e);ctx.beginPath();ctx.moveTo(x.x,x.y)}; c.onpointermove=(e)=>{if(!draw)return;const x=p(e);ctx.lineTo(x.x,x.y);ctx.stroke()}; c.onpointerup=()=>{draw=false;signatureDataUrl.value=c.toDataURL('image/png')} }
onMounted(async ()=>{ const q=typeof route.query.template==='string'?route.query.template:''; if(q&&coverLetterTemplates.value.some((t)=>t.id===q)) selectedTemplate.value=q; try { const resumes = await listMyResumes(); const info = resumes?.[0]?.resumeInformation; if (info?.fullName) model.fullName = info.fullName; if (info?.title) model.role = info.title; if (info?.profileText) model.companyParagraph = info.profileText; if (info?.email) model.email = info.email; if (info?.phone) model.phone = info.phone; if (info?.photo && 'photoUrl' in model) model.photoUrl = info.photo } catch { /* noop */ } })
</script>
<template>
<div>
  <AppPageDrawers>
    <template #left>
     <v-card-text>
       <v-menu><template #activator="{ props }"><v-btn v-bind="props" class="mt-3" variant="outlined" block>Palette</v-btn></template><v-list><v-list-item title="Template" @click="selectedPalette='template'"/><v-list-item title="Sunset" @click="selectedPalette='sunset'"/><v-list-item title="Forest" @click="selectedPalette='forest'"/><v-list-item title="Custom" @click="selectedPalette='custom'"/></v-list></v-menu>
       <v-text-field v-if="selectedPalette==='custom'" v-model="customPrimary" label="Custom primary" hide-details class="mt-3"/>
       <v-text-field v-if="selectedPalette==='custom'" v-model="customSecondary" label="Custom secondary" hide-details class="mt-3"/>
       <v-text-field v-if="selectedPalette==='custom'" v-model="customPageBackground" label="Custom page background" hide-details class="mt-3"/>
       <v-slider v-model="barRadius" label="Bar radius" min="0" max="30" step="1" hide-details class="mt-3"/>
       <AppSelect v-model="barLayout" :items="[{ title: 'Single bar', value: 'single' }, { title: 'Double bars', value: 'double' }]" label="Bar layout" hide-details class="mt-3"/>
       <v-slider v-model="primaryBarWidth" label="Bar width" min="4" max="24" step="1" hide-details class="mt-3"/>
       <v-slider v-if="barLayout==='double'" v-model="secondaryBarWidth" label="Sec bar width" min="2" max="20" step="1" hide-details class="mt-3"/>
     </v-card-text>
    </template>
    <template #right>
      <v-btn class="mt-3" size="small" variant="outlined" @click="addDecorObject">Add decor</v-btn>
      <v-card v-for="(obj,i) in editableDecorObjects" :key="`obj-${i}`" class="mt-3 pa-2" variant="outlined">
        <AppSelect v-model="obj.type" :items="decorShapeOptions.map((s)=>({title:s,value:s}))" label="Shape" hide-details class="mt-3"/>
        <v-slider v-model="obj.size" label="Size" min="20" max="420" step="1" hide-details class="mt-3"/>
        <v-slider v-model="obj.opacity" label="Opacity" min="0.02" max="0.4" step="0.01" hide-details class="mt-3"/>
        <v-slider v-model="obj.x" label="X (%)" min="0" max="100" step="1" hide-details class="mt-3"/>
        <v-slider v-model="obj.y" label="Y (%)" min="0" max="100" step="1" hide-details class="mt-3"/>
        <v-btn size="x-small" color="error" variant="text" @click="removeDecorObject(i)">remove</v-btn>
      </v-card>
    </template>
  </AppPageDrawers>
  <v-container fluid>
    <div class="preview-toolbar-wrap"><div class="preview-toolbar-row">
      <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-content-save-cog-outline" @click="saveFromPreview">Save</v-btn>
      <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-robot-outline" @click="goToCreateResume">AI</v-btn>
      <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-signature-freehand" @click="openSignatureDialog">Signature</v-btn>
      <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-file-pdf-box" @click="downloadPdf">PDF</v-btn>
      <v-menu v-model="layoutMenuOpen"><template #activator="{ props }"><v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-view-grid-outline" v-bind="props">Templates</v-btn></template><v-list density="compact"><v-list-item v-for="template in coverLetterTemplates" :key="template.id" :title="template.title" @click="applyPreviewTemplate(template.id)"/></v-list></v-menu>
    </div></div>
    <div class="py-8 d-flex justify-center"><main class="capture-cover-letter" :style="{'--cp-primary':activeColors.primary,'--cp-secondary':activeColors.secondary,'--cp-text':activeColors.text,'--cp-muted':activeColors.muted,'--cp-bg':activeColors.pageBackground,'--section-divider-style':sectionDividerStyle,'--section-spacing':sectionSpacing,'--body-size':`${textFontSize}px`,'--body-color':textColor,'--bar-radius':`${barRadius}px`,'--bar-primary-width':`${primaryBarWidth}px`,'--bar-secondary-width':`${secondaryBarWidth}px`}">
      <div v-for="(obj,index) in editableDecorObjects" :key="`decor-${index}`" class="decor-object" :class="`decor-${obj.type}`" :style="{left:`${obj.x}%`,top:`${obj.y}%`,width:`${obj.size}px`,height:`${obj.size}px`,opacity:obj.opacity}"/>
      <header class="hero" :class="{'hero--double': barLayout === 'double', 'hero--photo-right': photoPosition === 'right'}">
        <div class="hero-row">

          <div class="mb-4 avatar-upload hero-avatar photo-shell" :style="{ width: `${imageSize}px`, height: `${imageSize}px`, borderRadius: imageShape === 'circle' ? '999px' : '12px' }" @click="openPhotoUpload">
            <v-menu v-model="photoQuickMenuOpen" location="bottom start">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-tune-variant"
                  size="x-small"
                  class="photo-quick-trigger"
                  @click.stop
                />
              </template>
              <v-card class="pa-3 photo-quick-menu" min-width="240" @click.stop>
                <v-slider v-model="imageSize" label="Image size" min="48" max="180" step="1" hide-details class="mt-1"/>
                <v-slider v-model="imageBorderWidth" label="Border width" min="0" max="8" step="1" hide-details class="mt-3"/>
                <v-text-field v-model="imageBorderColor" type="color" label="Border color" hide-details class="mt-3"/>
                <AppSelect v-model="imageShape" :items="[{ title: 'Circle', value: 'circle' }, { title: 'Square', value: 'square' }]" label="Image shape" hide-details class="mt-3"/>
              </v-card>
            </v-menu>
            <v-img :src="model.photoUrl" cover @click.stop="openPhotoUpload" class="photo-shell__img"/>
            <div class="avatar-overlay">Change</div>
          </div>
          <HoverRichTextEditor v-model="model.fullName" />
          <HoverRichTextEditor v-model="model.role" />
          <HoverRichTextEditor v-model="model.date" :font-size="`${letterElementStyles.date.size}px`" :color="letterElementStyles.date.color" :font-weight="letterElementStyles.date.weight" />
          <HoverRichTextEditor v-model="model.location" :font-size="`${letterElementStyles.address.size}px`" :color="letterElementStyles.address.color" :font-weight="letterElementStyles.address.weight" />
        </div>
      </header>
      <section><HoverRichTextEditor v-model="model.heading" />
        <HoverRichTextEditor v-model="model.company" />
        <HoverRichTextEditor v-model="model.companyParagraph" />
        <HoverRichTextEditor v-model="model.email" />
        <HoverRichTextEditor v-model="model.phone" />
      </section>
      <footer v-if="signatureDataUrl" class="signature-footer"><img :src="signatureDataUrl" alt="signature" class="signature-image"/></footer>
    </main></div>
    <v-dialog v-model="signatureDialogOpen" max-width="760"><v-card><v-card-title>Signature</v-card-title><v-card-text><canvas ref="signatureCanvas" style="width:100%;height:200px;border:1px solid rgba(0,0,0,.15);border-radius:10px"/></v-card-text></v-card></v-dialog>
  </v-container>
</div>
</template>
<style scoped>
.capture-cover-letter{position:relative;overflow:hidden;width:850px;min-height:1123px;padding:80px;background:var(--cp-bg);color:var(--cp-text)}.hero{border-left:var(--bar-primary-width) solid var(--cp-primary);padding-left:24px;margin-bottom:48px;border-radius:var(--bar-radius);position:relative}.hero-row{display:flex;flex-direction:column;align-items:flex-start;gap:8px}.hero-avatar{align-self:flex-start}.hero-avatar--right{align-self:flex-end}.hero--photo-right{padding-top:8px}.hero--double::before{content:'';position:absolute;left:calc(var(--bar-primary-width) + 6px);top:0;bottom:0;width:var(--bar-secondary-width);background:var(--cp-secondary);border-radius:var(--bar-radius)}.avatar-upload{cursor:pointer;position:relative;overflow:visible;border-style:solid;border-color:v-bind(imageBorderColor);border-width:v-bind(imageBorderWidth + 'px')}.photo-shell{display:block;position:relative}.photo-quick-trigger{position:absolute;top:-10px;left:-10px;z-index:30;opacity:0;transition:opacity .15s ease;background:#fff;border:1px solid rgba(15,23,42,.2)}.photo-shell:hover .photo-quick-trigger,.photo-shell:focus-within .photo-quick-trigger,.photo-quick-trigger:focus-visible{opacity:1}.photo-quick-menu{border:1px solid rgba(148,163,184,.4)} .avatar-overlay{position:absolute;inset:auto 0 0 0;padding:2px 0;background:rgba(15,23,42,.55);color:#fff;font-size:10px;text-align:center}h1{font-size:58px;margin:0}p{font-size:var(--body-size);color:var(--body-color)}.meta{font-size:16px}h2{color:var(--cp-primary);font-size:40px;margin:0 0 16px}section{border-top:3px var(--section-divider-style) var(--cp-secondary);padding-top:24px;margin-top:var(--section-spacing)}.decor-object{position:absolute;pointer-events:none;background:color-mix(in srgb,var(--cp-primary) 35%,transparent)}.decor-circle{border-radius:999px}.decor-ring{border-radius:999px;background:transparent;border:3px solid color-mix(in srgb,var(--cp-secondary) 55%,transparent)}.decor-blob{border-radius:40% 60% 55% 45% / 50% 35% 65% 50%}.preview-toolbar-wrap{position:sticky;top:76px;z-index:20;display:flex;justify-content:center}.preview-toolbar-row{display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px;border:1px solid rgba(148,163,184,.35);border-radius:999px;background: rgba(var(--v-theme-primary))}.signature-footer{margin-top:32px}.signature-image{height:68px;object-fit:contain}</style>

<style scoped>
@media (prefers-color-scheme: dark) {
  .capture-cover-page,
  .capture-cover-letter { box-shadow: 0 10px 30px rgba(0,0,0,.45); }
}
</style>
