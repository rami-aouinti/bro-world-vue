<script setup lang="ts">
import GENERATED_COVER_PAGE_TEMPLATES from '~/data/resume-templates/generated-20-cover-page.json'
import { listMyResumes } from '~/services/resumeApi'
import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'
import ResumePreviewToolbar from '~/components/ResumePreviewToolbar.vue'
import ResumePreviewPageBreak from '~/components/ResumePreviewPageBreak.vue'
import { resolveResumeTextFont, useResumeGoogleFonts } from '~/composables/useResumeGoogleFonts'

definePageMeta({ title: 'Resume · Cover Page Preview' })
const { t } = useI18n()
useHead(() => ({
  title: t('resumePreview.coverPage.metaTitle'),
}))
const route = useRoute()
const { coverPageTemplates } = useResumeTemplates()
const selectedTemplate = ref(coverPageTemplates.value[0]?.id || GENERATED_COVER_PAGE_TEMPLATES[0]?.id || '')
const photoOptions = ['/img/team-1.jpg', '/img/team-2.jpg', '/img/team-3.jpg', '/img/team-4.jpg', '/img/team-5.jpg', '/img/team-9.jpeg']
const decorShapeOptions = ['circle', 'ring', 'blob', 'square', 'diamond', 'star', 'triangle', 'pill', 'bar']
const decorColorOptions = ['#0EA5E9', '#2563EB', '#7C3AED', '#EC4899', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#64748B', '#111827']
const imageShape = ref<'circle' | 'square'>('circle')
const imageSize = ref(84)
const imageBorderWidth = ref(2)
const imageBorderColor = ref('#0f172a')
const photoPosition = ref<'left' | 'right'>('left')
const selectedPalette = ref<string>('template')
const paletteMenuOpen = ref(false)
const palettePresetOptions = computed(() => [
  { title: 'Template', value: 'template', primary: activeTemplate.value.theme.palette.primary, dark: activeTemplate.value.theme.palette.secondary, light: activeTemplate.value.theme.palette.pageBackground },
  { title: 'Ocean', value: 'ocean', primary: '#2563EB', dark: '#1D4ED8', light: '#EFF6FF' },
  { title: 'Indigo', value: 'indigo', primary: '#4F46E5', dark: '#3730A3', light: '#EEF2FF' },
  { title: 'Violet', value: 'violet', primary: '#7C3AED', dark: '#5B21B6', light: '#F5F3FF' },
  { title: 'Slate', value: 'slate', primary: '#334155', dark: '#1E293B', light: '#F8FAFC' },
  { title: 'Olive', value: 'olive', primary: '#A3A86C', dark: '#7E8A5B', light: '#F7F8EE' },
  { title: 'Sage', value: 'sage', primary: '#8AA07A', dark: '#647860', light: '#F3F7F1' },
  { title: 'Emerald', value: 'emerald', primary: '#059669', dark: '#047857', light: '#ECFDF5' },
  { title: 'Rose', value: 'rose', primary: '#E11D48', dark: '#BE123C', light: '#FFF1F2' },
  { title: 'Sky', value: 'sky', primary: '#0EA5E9', dark: '#0284C7', light: '#F0F9FF' },
  { title: 'Sunset', value: 'sunset', primary: '#C2410C', dark: '#9A3412', light: '#FFF7ED' },
  { title: 'Amber', value: 'amber', primary: '#D97706', dark: '#B45309', light: '#FFFBEB' },
  { title: 'Charcoal', value: 'charcoal', primary: '#3F3F46', dark: '#27272A', light: '#FAFAFA' },
  { title: 'Plum', value: 'plum', primary: '#7E3F8F', dark: '#5B2C6F', light: '#FAF5FF' },
  { title: 'Teal', value: 'teal', primary: '#0F766E', dark: '#115E59', light: '#F0FDFA' },
  { title: 'Cobalt', value: 'cobalt', primary: '#1D4ED8', dark: '#1E3A8A', light: '#EFF6FF' },
  { title: 'Coral', value: 'coral', primary: '#F97316', dark: '#C2410C', light: '#FFF7ED' },
  { title: 'Mint', value: 'mint', primary: '#10B981', dark: '#047857', light: '#ECFDF5' },
  { title: 'Lavender', value: 'lavender', primary: '#A78BFA', dark: '#6D28D9', light: '#F5F3FF' },
  { title: 'Ruby', value: 'ruby', primary: '#DC2626', dark: '#991B1B', light: '#FEF2F2' },
  { title: 'Forest', value: 'forest', primary: '#166534', dark: '#14532D', light: '#F0FDF4' },
  { title: 'Sand', value: 'sand', primary: '#B45309', dark: '#92400E', light: '#FFFBEB' },
  { title: 'Aqua', value: 'aqua', primary: '#0891B2', dark: '#155E75', light: '#ECFEFF' },
  { title: 'Magenta', value: 'magenta', primary: '#C026D3', dark: '#86198F', light: '#FDF4FF' },
  { title: 'Steel', value: 'steel', primary: '#64748B', dark: '#334155', light: '#F8FAFC' },
  { title: 'Night', value: 'night', primary: '#0F172A', dark: '#020617', light: '#E2E8F0' },
  { title: 'Peach', value: 'peach', primary: '#FB7185', dark: '#BE123C', light: '#FFF1F2' },
  { title: 'Lime', value: 'lime', primary: '#65A30D', dark: '#3F6212', light: '#F7FEE7' },
  { title: 'Orchid', value: 'orchid', primary: '#9333EA', dark: '#6B21A8', light: '#FAF5FF' },
  { title: 'Graphite', value: 'graphite', primary: '#374151', dark: '#111827', light: '#F9FAFB' },
])
const borderColorOptions = ['#0f172a', '#0F4C81', '#166534', '#C2410C', '#7C3AED', '#1D4ED8', '#DC2626']
const dividerTypeOptions = [
  { title: 'Line', value: 'line' },
  { title: 'Dashed', value: 'dashed' },
  { title: 'Gradient', value: 'gradient' },
  { title: 'None', value: 'none' },
]
const selectedDividerType = ref('line')
const textFontSize = ref(24)
const textColor = ref('#475569')
const barRadius = ref(0)
const barLayout = ref<'none' | 'single' | 'double'>('single')

const elementStyles = reactive({
  fullName: { size: 48, color: '#111827', weight: '700' },
  role: { size: 24, color: '#475569', weight: '500' },
  heading: { size: 28, color: '#0F4C81', weight: '600' },
  summary: { size: 18, color: '#475569', weight: '400' },
  email: { size: 15, color: '#475569', weight: '400' },
  phone: { size: 15, color: '#475569', weight: '400' },
})
const fontWeightMap: Record<string, string> = { regular: '400', medium: '500', semibold: '600', bold: '700' }
const primaryBarWidth = ref(10)
const secondaryBarWidth = ref(5)
const model = reactive({ fullName:'Alex Martin', role:'Senior Full Stack Developer', summary:'Driven engineer delivering robust products with strong UX and clean architecture.', location:'Paris, France', email:'alex@example.com', phone:'+33 6 00 00 00 00', date:new Date().toLocaleDateString('en-US'), photoUrl:photoOptions[0], heading:'About Me' })
const activeTemplate = computed(() => GENERATED_COVER_PAGE_TEMPLATES.find((tpl) => tpl.id === selectedTemplate.value) || GENERATED_COVER_PAGE_TEMPLATES[0])
useResumeGoogleFonts(activeTemplate)
function textFontFamily(key: string, fallback: 'sans' | 'serif' | 'mono' | 'display' = 'sans') {
  return resolveResumeTextFont((activeTemplate.value as any)?.textStyles?.[key], fallback)
}
const defaultBarDesignConfig = {
  barRadius: { min: 0, max: 30 },
  barLayout: ['', 'single', 'double'],
  barWidth: { min: 4, max: 24 },
  secondaryBarWidth: { min: 2, max: 20 },
}
const activeTemplateDesignConfig = computed(() => (activeTemplate.value as any)?.designConfig || {})
const activeBarDesignConfig = computed(() => activeTemplateDesignConfig.value || defaultBarDesignConfig)
const editableDecorObjects = ref<any[]>([])
const decorMenuOpenIndex = ref<number | null>(null)

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
  const rawType = String(obj?.type ?? 'circle')
  const normalizedType = rawType === 'diamand' ? 'diamond' : rawType
  return {
    ...obj,
    type: normalizedType,
    x: toPercentNumber(obj?.x, 50),
    y: toPercentNumber(obj?.y, 50),
    size: toNumber(obj?.size, 120),
    opacity: toNumber(obj?.opacity, 0.15),
    color: String(obj?.color ?? ''),
  }
}

function decorObjectStyle(obj: any) {
  const size = toNumber(obj?.size, 120)
  const x = toPercentNumber(obj?.x, 50)
  const y = toPercentNumber(obj?.y, 50)
  const opacity = toNumber(obj?.opacity, 0.15)
  const type = String(obj?.type ?? 'circle')

  const base: Record<string, string | number> = {
    left: `${x}%`,
    top: `${y}%`,
    opacity,
    width: `${size}px`,
    height: `${size}px`,
  }

  const color = String(obj?.color ?? '').trim()
  if (color) base.backgroundColor = color

  if (type === 'ring' && color) {
    base.backgroundColor = 'transparent'
    base.borderColor = color
  }

  if (type === 'bar') {
    base.width = `${Math.round(size * 1.8)}px`
    base.height = `${Math.max(8, Math.round(size * 0.22))}px`
  }

  if (type === 'pill') {
    base.width = `${Math.round(size * 1.8)}px`
    base.height = `${Math.max(14, Math.round(size * 0.62))}px`
  }

  return base
}

function applyTemplateDefaults(tpl: any) {
  const defaults = tpl?.defaultValues || {}
  if (defaults.fullName) model.fullName = String(defaults.fullName)
  if (defaults.role) model.role = String(defaults.role)
  if (defaults.description) model.summary = String(defaults.description)
  if (defaults.image) model.photoUrl = String(defaults.image)
}
const sectionDividerStyle = computed(() => {
  const showDivider = activeTemplate.value?.layoutOptions?.showDivider ?? true
  if (!showDivider) return 'none'
  if (selectedDividerType.value === 'none') return 'none'
  if (selectedDividerType.value === 'dashed') return 'dashed'
  return 'solid'
})
const sectionDividerColor = computed(() => selectedDividerType.value === 'gradient' ? `color-mix(in srgb, ${activeColors.value.primary} 55%, ${activeColors.value.secondary} 45%)` : activeColors.value.secondary)
const sectionSpacing = computed(() => activeTemplate.value?.layoutOptions?.sectionSpacing === 'wide' ? '40px' : '24px')
const activeColors = computed(() => {
  const palette = activeTemplate.value.theme.palette
  const selected = palettePresetOptions.value.find((option) => option.value === selectedPalette.value)
  if (selected && selected.value !== 'template') return { ...palette, primary: selected.primary, secondary: selected.dark, pageBackground: selected.light }
  return palette
})
const isLayoutRight = computed(() => activeTemplate.value?.layout === 'layout-right')
const signatureDataUrl = ref('')
const signatureDialogOpen = ref(false)
const signatureCanvas = ref<HTMLCanvasElement | null>(null)
const photoInput = ref<HTMLInputElement | null>(null)
const layoutMenuOpen = ref(false)
const photoQuickMenuOpen = ref(false)

watch(() => activeColors.value.primary, (primaryColor) => {
  imageBorderColor.value = primaryColor
  elementStyles.heading.color = primaryColor
}, { immediate: true })

watch(activeTemplate, (tpl) => { applyTemplateDefaults(tpl); editableDecorObjects.value = (tpl?.decor?.objects || []).map((obj:any)=>normalizeDecorObject(obj)); selectedDividerType.value = String(tpl?.decor?.divider || 'line'); photoPosition.value = tpl?.hero?.photoPosition || tpl?.sections?.photoPosition || 'left'; imageShape.value = ((tpl as any)?.designConfig?.photoType === 'square' ? 'square' : 'circle'); imageSize.value = Number((tpl as any)?.designConfig?.photoSize ?? imageSize.value); const items=(tpl as any)?.items||{}; const designConfig = (tpl as any)?.designConfig || defaultBarDesignConfig; barRadius.value = designConfig?.barRadius?.min ?? defaultBarDesignConfig.barRadius.min; primaryBarWidth.value = designConfig?.barWidth?.min ?? defaultBarDesignConfig.barWidth.min; secondaryBarWidth.value = designConfig?.secondaryBarWidth?.min ?? defaultBarDesignConfig.secondaryBarWidth.min; barLayout.value = Array.isArray(designConfig?.barLayout) && designConfig.barLayout.includes('double') ? 'double' : (designConfig.barLayout.includes('single') ? 'single' : 'none'); for (const key of ['fullName','role','heading','summary','email','phone']) { const b=items[key]?.size; if (b) elementStyles[key].size=Math.round(((b.min+b.max)/2)*0.78); if (items[key]?.colors?.[0]) elementStyles[key].color=items[key].colors[0]; if (items[key]?.styles?.[0]) elementStyles[key].weight=fontWeightMap[items[key].styles[0]]||'400' } }, { immediate: true })
function addDecorObject(){ editableDecorObjects.value.push({ type:'circle', x:'50%', y:'50%', size:'120', opacity:0.15 }) }
function removeDecorObject(i:number){ editableDecorObjects.value.splice(i,1) }
function goToCreateResume(){ navigateTo('/resume/cv/preview') }
function applyPreviewTemplate(id:string){ selectedTemplate.value = id; layoutMenuOpen.value = false }
function saveFromPreview(){ localStorage.setItem('resume-cover-preview-page', JSON.stringify({ template:selectedTemplate.value, model, decor:editableDecorObjects.value, signature:signatureDataUrl.value })) }
async function downloadPdf(){ const node=document.querySelector('.capture-cover-page') as HTMLElement|null; if(!node) return; const w=window.open('','_blank','width=900,height=1300'); if(!w) return; const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map((el)=>el.outerHTML).join(''); w.document.write(`<html><head>${headStyles}<style>@page{size:A4;margin:0}html,body{margin:0;background:#fff}body{display:flex;justify-content:center;align-items:flex-start}.capture-cover-page{width:210mm;min-height:297mm;box-sizing:border-box;margin:0}</style></head><body>${node.outerHTML}</body></html>`); w.document.close(); await new Promise((r)=>setTimeout(r,900)); w.focus(); w.print(); w.close() }
function openPhotoUpload() { photoInput.value?.click() }
function onPhotoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { model.photoUrl = String(reader.result || model.photoUrl) }
  reader.readAsDataURL(file)
}
function openSignatureDialog(){ signatureDialogOpen.value=true; nextTick(initCanvas) }
function initCanvas(){ const c=signatureCanvas.value; if(!c) return; const ctx=c.getContext('2d'); if(!ctx) return; c.width=c.clientWidth||680; c.height=200; ctx.lineWidth=2; ctx.lineCap='round'; let draw=false; const p=(e:PointerEvent)=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}; c.onpointerdown=(e)=>{draw=true;const x=p(e);ctx.beginPath();ctx.moveTo(x.x,x.y)}; c.onpointermove=(e)=>{if(!draw)return;const x=p(e);ctx.lineTo(x.x,x.y);ctx.stroke()}; c.onpointerup=()=>{draw=false;signatureDataUrl.value=c.toDataURL('image/png')} }
onMounted(async ()=>{ const q=typeof route.query.template==='string'?route.query.template:''; if(q&&coverPageTemplates.value.some((t)=>t.id===q)) selectedTemplate.value=q
  try {
    const resumes = await listMyResumes()
    const info = resumes?.[0]?.resumeInformation
    if (info?.fullName) model.fullName = info.fullName
    if (info?.title) model.role = info.title
    if (info?.profileText) model.summary = info.profileText
    if (info?.email) model.email = info.email
    if (info?.phone) model.phone = info.phone
    if (info?.photo) model.photoUrl = info.photo
  } catch { /* noop */ }
})
</script>
<template>
<div>
  <AppPageDrawers>
    <template #left>
     <v-card-text>
       <AppSelect v-model="barLayout" :items="[{ title: 'No bar', value: 'none' }, { title: 'Single bar', value: 'single' }, { title: 'Double bars', value: 'double' }]" label="Bar layout" hide-details class="mt-3"/>
       <AppSelect v-model="selectedDividerType" :items="dividerTypeOptions" label="Divider type" hide-details class="mt-3"/>
       <p class="text-body-2" >Bar radius</p>
       <v-slider v-model="barRadius" :min="activeBarDesignConfig.barRadius.min" :max="activeBarDesignConfig.barRadius.max" step="1" hide-details class="mt-3"/>
       <p class="text-body-2" >Bar width</p>
       <v-slider v-model="primaryBarWidth" :min="activeBarDesignConfig.barWidth.min" :max="activeBarDesignConfig.barWidth.max" step="1" hide-details class="mt-3"/>
       <p v-if="barLayout==='double'" class="text-body-2" >Sec Bar width"</p>
       <v-slider v-if="barLayout==='double'" v-model="secondaryBarWidth" :min="activeBarDesignConfig.secondaryBarWidth.min" :max="activeBarDesignConfig.secondaryBarWidth.max" step="1" hide-details class="mt-3"/>
     </v-card-text>
    </template>
    <template #right>
      <v-btn class="mt-3" size="small" variant="outlined" @click="addDecorObject">Add decor</v-btn>
      <div class="mt-3 d-flex flex-column ga-2">
        <v-menu
          v-for="(obj,i) in editableDecorObjects"
          :key="`obj-${i}`"
          :model-value="decorMenuOpenIndex === i"
          :close-on-content-click="false"
          location="left start"
          @update:model-value="(isOpen) => { decorMenuOpenIndex = isOpen ? i : (decorMenuOpenIndex === i ? null : decorMenuOpenIndex) }"
        >
          <template #activator="{ props }">
            <v-btn v-bind="props" size="small" variant="tonal" class="justify-space-between" block>
              Decor {{ i + 1 }} · {{ obj.type }}
            </v-btn>
          </template>
          <v-card class="pa-3" min-width="260" @click.stop>
            <AppSelect v-model="obj.type" :items="decorShapeOptions.map((s)=>({title:s,value:s}))" label="Type" hide-details/>
            <p class="text-caption mt-3 mb-1">Color</p>
            <div class="d-flex flex-wrap ga-2">
              <v-btn v-for="color in decorColorOptions" :key="`decor-color-${i}-${color}`" icon size="x-small" :style="{ backgroundColor: color, border: obj.color === color ? '2px solid #111827' : '1px solid #cbd5e1' }" @click="obj.color = color"/>
            </div>
            <v-slider v-model="obj.size" label="Size" min="20" max="420" step="1" hide-details class="mt-3"/>
            <v-slider v-model="obj.opacity" label="Opacity" min="0.02" max="0.4" step="0.01" hide-details class="mt-3"/>
            <v-slider v-model="obj.x" label="X slider" min="0" max="100" step="1" hide-details class="mt-3"/>
            <v-slider v-model="obj.y" label="Y slider" min="0" max="100" step="1" hide-details class="mt-3"/>
            <v-btn size="x-small" color="error" variant="text" class="mt-2" @click="removeDecorObject(i)">remove</v-btn>
          </v-card>
        </v-menu>
      </div>
    </template>
  </AppPageDrawers>
  <v-container fluid>
    <ResumePreviewToolbar
      v-model:menu-open="layoutMenuOpen"
      v-model:palette-menu-open="paletteMenuOpen"
      :palettes="palettePresetOptions"
      :selected-palette="selectedPalette"
      :palette-columns="5"
      :templates="coverPageTemplates"
      :selected-template="selectedTemplate"
      template-key-prefix="cover-page-preview"
      @save="saveFromPreview"
      @ai="goToCreateResume"
      @signature="openSignatureDialog"
      @pdf="downloadPdf"
      @select-template="applyPreviewTemplate"
      @select-palette="selectedPalette = $event"
    />
    <div class="py-8 d-flex justify-center preview-single-page-frame"><main class="capture-cover-page" :style="{'--cp-primary':activeColors.primary,'--cp-secondary':activeColors.secondary,'--cp-text':activeColors.text,'--cp-muted':activeColors.muted,'--cp-bg':activeColors.pageBackground,'--section-divider-style':sectionDividerStyle,'--section-divider-color':sectionDividerColor,'--section-spacing':sectionSpacing,'--body-size':`${textFontSize}px`,'--body-color':textColor,'--bar-radius':`${barRadius}px`,'--bar-primary-width':`${primaryBarWidth}px`,'--bar-secondary-width':`${secondaryBarWidth}px`}">
      <div v-for="(obj,index) in editableDecorObjects" :key="`decor-${index}`" class="decor-object" :class="`decor-${obj.type}`" :style="decorObjectStyle(obj)"/>
      <header
class="hero" :class="{'hero--no-bar': barLayout === 'none', 'hero--double': barLayout === 'double', 'hero--photo-right': photoPosition === 'right', 'hero--ribbon': activeTemplate?.decor?.headerStyle === 'ribbon', 'hero--layout-right': isLayoutRight}"
        :style="activeTemplate?.decor?.gradientStyle && activeTemplate.decor.gradientStyle !== 'none' ? { background: `linear-gradient(135deg, ${activeColors.primary}22, ${activeColors.secondary}33)` } : undefined">
        <div class="hero-row" :class="{ 'hero-row--layout-right': isLayoutRight }">

          <div class="mb-4 avatar-upload hero-avatar photo-shell" :style="{ width: `${imageSize}px`, height: `${imageSize}px`, borderRadius: imageShape === 'circle' ? '999px' : '12px' }" @click="openPhotoUpload">
            <v-menu v-model="photoQuickMenuOpen" location="right start" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  size="x-small"
                  class="photo-quick-trigger"
                  @click.stop
                />
              </template>
              <v-card class="pa-3 photo-quick-menu" min-width="240" @click.stop>
                <v-slider v-model="imageSize" label="Image size" min="48" max="180" step="1" hide-details class="mt-1"/>
                <v-slider v-model="imageBorderWidth" label="Border width" min="0" max="8" step="1" hide-details class="mt-3"/>
                <v-menu location="right start">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" class="mt-3" variant="outlined" block>Border color</v-btn>
                  </template>
                  <v-card class="pa-2">
                    <div class="d-flex flex-wrap ga-2">
                      <v-btn v-for="color in borderColorOptions" :key="`border-${color}`" icon size="x-small" :style="{ backgroundColor: color, border: imageBorderColor === color ? '2px solid #111827' : '1px solid #cbd5e1' }" @click="imageBorderColor = color"/>
                    </div>
                  </v-card>
                </v-menu>
                <AppSelect v-model="imageShape" :items="[{ title: 'Circle', value: 'circle' }, { title: 'Square', value: 'square' }]" label="Image shape" hide-details class="mt-3"/>
              </v-card>
            </v-menu>
            <v-img :src="model.photoUrl" cover class="photo-shell__img" @click.stop="openPhotoUpload"/>
          </div>
          <HoverRichTextEditor v-model="model.fullName" :font-size="`${elementStyles.fullName.size}px`" :color="elementStyles.fullName.color" :font-weight="elementStyles.fullName.weight" :font-family="textFontFamily('fullName', 'serif')" />
          <HoverRichTextEditor v-model="model.role" :font-size="`${elementStyles.role.size}px`" :color="elementStyles.role.color" :font-weight="elementStyles.role.weight" :font-family="textFontFamily('role')" />
        </div>
      </header>
      <section><HoverRichTextEditor v-model="model.heading" :font-size="`${elementStyles.heading.size}px`" :color="elementStyles.heading.color" :font-weight="elementStyles.heading.weight" :font-family="textFontFamily('heading', 'serif')" />
        <HoverRichTextEditor v-model="model.summary" :font-size="`${elementStyles.summary.size}px`" :color="elementStyles.summary.color" :font-weight="elementStyles.summary.weight" :font-family="textFontFamily('summary')" />
        <HoverRichTextEditor v-model="model.email" :font-size="`${elementStyles.email.size}px`" :color="elementStyles.email.color" :font-weight="elementStyles.email.weight" :font-family="textFontFamily('email')" />
        <HoverRichTextEditor v-model="model.phone" :font-size="`${elementStyles.phone.size}px`" :color="elementStyles.phone.color" :font-weight="elementStyles.phone.weight" :font-family="textFontFamily('phone')" />
      </section>
      <footer v-if="signatureDataUrl" class="signature-footer"><img :src="signatureDataUrl" alt="signature" class="signature-image"/></footer>
    </main><ResumePreviewPageBreak :page-number="1" /></div>
    <input ref="photoInput" type="file" accept="image/*" class="d-none" @change="onPhotoUpload">
    <v-dialog v-model="signatureDialogOpen" max-width="760"><v-card><v-card-title>Signature</v-card-title><v-card-text><canvas ref="signatureCanvas" style="width:100%;height:200px;border:1px solid rgba(0,0,0,.15);border-radius:10px"/></v-card-text></v-card></v-dialog>
  </v-container>
</div>
</template>

<style scoped>
.preview-single-page-frame{position:relative;flex-direction:column;align-items:center}
.capture-cover-page{
  position:relative;
  overflow:hidden;
  box-sizing:border-box;
  width:min(100%, 850px);
  min-height:1123px;
  padding:64px;
  background:var(--cp-bg);
  color:var(--cp-text)
}
.hero{
  border-left:var(--bar-primary-width) solid var(--cp-primary);
  padding-left:24px;margin-bottom:48px;
  border-radius:var(--bar-radius);
  position:relative
}
.meta-top-right{position:absolute;top:0;right:0;display:flex;flex-direction:column;align-items:flex-end;gap:6px;text-align:right;color:var(--cp-muted)}
.hero-row{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
.hero-avatar{align-self:flex-start}.hero-avatar--right{align-self:flex-end}
.hero--photo-right{padding-top:8px}
.hero--ribbon{padding-top:16px;padding-bottom:12px}
.hero--no-bar{border-left:0!important;border-right:0!important;padding-left:0;padding-right:0}.hero--double::before{content:'';position:absolute;left:calc(var(--bar-primary-width) + 6px);top:0;bottom:0;width:var(--bar-secondary-width);background:var(--cp-secondary);border-radius:var(--bar-radius)}.hero--layout-right{border-left:0;border-right:var(--bar-primary-width) solid var(--cp-primary);padding-left:0;padding-right:24px;text-align:right}.hero--layout-right.hero--double::before{left:auto;right:calc(var(--bar-primary-width) + 6px)}.hero-row--layout-right{align-items:flex-end}.hero-row--layout-right .hero-avatar{align-self:flex-end}
.avatar-upload{cursor:pointer;border-style:solid;border-color:v-bind(imageBorderColor);border-width:v-bind(imageBorderWidth + 'px');overflow:visible}
.photo-shell{display:block;position:relative}
.photo-quick-trigger{position:absolute;top:-8px;right:-8px;z-index:30;opacity:0;transition:opacity .15s ease;background:#fff;border:1px solid rgba(15,23,42,.2)}
.photo-shell:hover .photo-quick-trigger,.photo-shell:focus-within .photo-quick-trigger,.photo-quick-trigger:focus-visible{opacity:1}
.photo-quick-menu{border:1px solid rgba(148,163,184,.4)}
.photo-shell__img{width:100%;height:100%;overflow:hidden;border-radius:inherit}
.photo-shell__img :deep(.v-img__img)
{
  border-radius:inherit;
  object-fit:cover
}
.avatar-overlay{display:none}
:global(body.print-cover-mode) .preview-toolbar-wrap,:global(body.print-cover-mode) .v-navigation-drawer,:global(body.print-cover-mode) .v-app-bar,:global(body.print-cover-mode)
.app-page-drawers{
  display:none !important
}
@media print{.preview-toolbar-wrap,.app-page-drawers,.avatar-overlay{display:none !important}}h1{font-size:48px;margin:0}p{font-size:var(--body-size);color:var(--body-color)}.meta{font-size:16px}h2{color:var(--cp-primary);font-size:32px;margin:0 0 16px}section{border-top:3px var(--section-divider-style) var(--section-divider-color);padding-top:24px;margin-top:var(--section-spacing)}.decor-object{position:absolute;pointer-events:none;background:color-mix(in srgb,var(--cp-primary) 35%,transparent)}.decor-circle{border-radius:999px}.decor-ring{border-radius:999px;background:transparent;border:3px solid color-mix(in srgb,var(--cp-secondary) 55%,transparent)}.decor-blob{border-radius:40% 60% 55% 45% / 50% 35% 65% 50%}.decor-square{border-radius:10px}.decor-diamond{border-radius:8px;transform:translate(-50%,-50%) rotate(45deg)}.decor-star{-webkit-clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}.decor-triangle{-webkit-clip-path:polygon(50% 0%,0 100%,100% 100%);clip-path:polygon(50% 0%,0 100%,100% 100%)}.decor-pill{border-radius:999px}.decor-bar{border-radius:999px}.preview-toolbar-wrap{position:sticky;top:76px;z-index:20;display:flex;justify-content:center}.preview-toolbar-row{display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px;border:1px solid rgba(148,163,184,.35);border-radius:999px;background:rgba(var(--v-theme-primary))}.signature-footer{margin-top:32px}.signature-image{height:68px;object-fit:contain}

@media (prefers-color-scheme: dark) {
  .capture-cover-page,
  .capture-cover-letter { box-shadow: 0 10px 30px rgba(0,0,0,.45); }
}
</style>

<style scoped>
.template-menu-card {
  margin-top: 8px;
  padding: 12px;
}

.template-menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 168px);
  justify-content: center;
  gap: 12px;
}

.template-menu-item {
  margin: 0;
}

.template-menu-thumb {
  height: 128px;
}

@media (max-width: 1100px) {
  .template-menu-grid {
    grid-template-columns: repeat(2, 148px);
  }

  .template-menu-thumb {
    height: 112px;
  }
}
</style>


<style scoped>
.palette-dot { width: 16px; height: 16px; border-radius: 50%; border: 1px solid rgb(var(--v-theme-on-surface), 0.2); }
</style>
