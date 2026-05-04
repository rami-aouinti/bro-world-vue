<script setup lang="ts">
import { listMyResumes } from '~/services/resumeApi'
import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'
import GENERATED_COVER_LETTER_TEMPLATES from '~/data/resume-templates/generated-20-cover-letter.json'

definePageMeta({ title: 'Resume · Cover Letter Preview', layout: 'resume' })
const route = useRoute()
const { coverLetterTemplates } = useResumeTemplates()
const selectedTemplate = ref(coverLetterTemplates.value[0]?.id || GENERATED_COVER_LETTER_TEMPLATES[0]?.id || '')

const selectedPalette = ref<'template' | 'sunset' | 'forest' | 'custom'>('template')
const customPrimary = ref('#0F4C81')
const customSecondary = ref('#5FA8D3')
const customPageBackground = ref('#F8FAFC')
const barRadius = ref(0)
const barLayout = ref<'single' | 'double'>('single')
const letterElementStyles = reactive({ fullName:{size:58,color:'#0f172a',weight:'700'}, role:{size:30,color:'#475569',weight:'500'}, date:{size:18,color:'#475569',weight:'400'}, address:{size:18,color:'#334155',weight:'400'}, heading:{size:34,color:'#0f172a',weight:'700'}, greeting:{size:24,color:'#0f172a',weight:'600'}, paragraphOne:{size:22,color:'#334155',weight:'400'}, paragraphTwo:{size:22,color:'#334155',weight:'400'}, signoff:{size:24,color:'#0f172a',weight:'600'}, email:{size:24,color:'#0f172a',weight:'600'}, phone:{size:24,color:'#0f172a',weight:'500'} })
const fontWeightMap: Record<string, string> = { regular: '400', medium: '500', semibold: '600', bold: '700' }
const primaryBarWidth = ref(10)
const secondaryBarWidth = ref(5)
const letterModel = reactive({ fullName:'Alex Martin', role:'Senior Full Stack Developer', location:'221B Baker Street, London, UK', date:new Date().toLocaleDateString('en-US'), heading:'Cover Letter', company:'Dear Hiring Manager,', companyParagraph:'I am excited to apply for your role. I bring strong experience in product delivery, scalable web architecture, and cross-functional collaboration.', summary:'I would welcome the opportunity to contribute to your team and discuss how my background aligns with your needs.', email:'Sincerely,', phone:'Alex Martin' })
const activeLetterTemplate = computed(() => GENERATED_COVER_LETTER_TEMPLATES.find((tpl) => tpl.id === selectedTemplate.value) || GENERATED_COVER_LETTER_TEMPLATES[0])
const editableDecorObjects = ref<any[]>([])
const defaultDecorPresets = [
  { type: 'circle', x: 8, y: 6, size: 80, opacity: 0.08 },
  { type: 'diamond', x: 70, y: 75, size: 120, opacity: 0.08 },
  { type: 'star', x: 14, y: 84, size: 28, opacity: 0.1 },
  { type: 'square', x: 82, y: 10, size: 24, opacity: 0.08 },
]
const templateDecorPresets = computed(() => {
  const fromTemplate = (activeLetterTemplate.value?.decor?.objects || []).map((obj:any) => normalizeDecorObject(obj))
  return fromTemplate.length ? fromTemplate : defaultDecorPresets.map((obj) => normalizeDecorObject(obj))
})

const model = reactive({
  fullName: 'Alex Martin',
  role: 'Senior Full Stack Developer',
  date: new Date().toLocaleDateString('en-US'),
  location: '221B Baker Street, London, UK',
  heading: 'Cover Letter',
  greeting: 'Dear Hiring Manager,',
  paragraphOne: 'I am excited to apply for your role. I bring strong experience in product delivery, scalable web architecture, and cross-functional collaboration.',
  paragraphTwo: 'I would welcome the opportunity to contribute to your team and discuss how my background aligns with your needs.',
  signoff: 'Sincerely,',
  email: 'alex@example.com',
  phone: '+33 6 00 00 00 00',
})

const activeTemplate = computed(() => GENERATED_COVER_LETTER_TEMPLATES.find((tpl) => tpl.id === selectedTemplate.value) || GENERATED_COVER_LETTER_TEMPLATES[0])
const fontWeightMap: Record<string, string> = { regular: '400', medium: '500', semibold: '600', bold: '700' }

function normalizeDecorObject(obj: any) {
  const rawType = String(obj?.type ?? 'circle')
  const normalizedType = rawType === 'diamand' ? 'diamond' : rawType
  return { ...obj, type: normalizedType, x: Number.parseFloat(String(obj?.x ?? 50)), y: Number.parseFloat(String(obj?.y ?? 50)), size: Number(obj?.size ?? 120), opacity: Number(obj?.opacity ?? 0.15) }
}

function decorObjectStyle(obj: any) {
  const size = Number(obj?.size ?? 120)
  const x = Number(obj?.x ?? 50)
  const y = Number(obj?.y ?? 50)
  const opacity = Number(obj?.opacity ?? 0.15)
  return { left: `${x}%`, top: `${y}%`, opacity, width: `${size}px`, height: `${size}px` }
}

const sectionDividerStyle = computed(() => {
  const showDivider = activeLetterTemplate.value?.layoutOptions?.showDivider ?? true
  if (!showDivider) return 'none'
  return activeLetterTemplate.value?.decor?.divider === 'dashed' ? 'dashed' : 'solid'
})
const sectionSpacing = computed(() => activeLetterTemplate.value?.layoutOptions?.sectionSpacing === 'wide' ? '40px' : '24px')
const activeColors = computed(() => {
  const palette = activeLetterTemplate.value.theme.palette
  if (selectedPalette.value === 'sunset') return { ...palette, primary: '#C2410C', secondary: '#FDBA74', pageBackground: '#FFF7ED' }
  if (selectedPalette.value === 'forest') return { ...palette, primary: '#166534', secondary: '#86EFAC', pageBackground: '#F0FDF4' }
  if (selectedPalette.value === 'custom') return { ...palette, primary: customPrimary.value, secondary: customSecondary.value, pageBackground: customPageBackground.value }
  return palette
})

watch(activeLetterTemplate, (tpl) => { editableDecorObjects.value = (tpl?.decor?.objects || []).map((obj:any)=>normalizeDecorObject(obj)); photoPosition.value = tpl?.hero?.photoPosition || tpl?.sections?.photoPosition || 'left'; const items=(tpl as any)?.items||{}; const aliases: Record<string, string[]> = { fullName:['fullName'], role:['role'], date:['date'], address:['location','address'], heading:['heading'], greeting:['greeting','company'], paragraphOne:['paragraphOne','companyParagraph'], paragraphTwo:['paragraphTwo','summary'], signoff:['signoff','email'], email:['email'], phone:['phone'] }; for (const key of Object.keys(aliases)) { const sourceKey = aliases[key].find((candidate)=>items[candidate]); const cfg = sourceKey ? items[sourceKey] : null; const b=cfg?.size; if (b) (letterElementStyles as any)[key].size=Math.round((b.min+b.max)/2); if (cfg?.colors?.[0]) (letterElementStyles as any)[key].color=cfg.colors[0]; if (cfg?.styles?.[0]) (letterElementStyles as any)[key].weight=fontWeightMap[cfg.styles[0]]||'400' } }, { immediate: true })
function addDecorObject(){ editableDecorObjects.value.push(normalizeDecorObject({ type:'circle', x:50, y:50, size:120, opacity:0.15 })) }
function addDecorObjectFromPreset(preset:any){ editableDecorObjects.value.push(normalizeDecorObject({ ...preset })) }
function removeDecorObject(i:number){ editableDecorObjects.value.splice(i,1) }
function goToCreateResume(){ navigateTo('/resume/preview') }
function applyPreviewTemplate(id:string){ selectedTemplate.value = id; layoutMenuOpen.value = false }
function saveFromPreview(){ localStorage.setItem('resume-cover-preview-letter', JSON.stringify({ template:selectedTemplate.value, letterModel, decor:editableDecorObjects.value, signature:signatureDataUrl.value })) }
async function downloadPdf(){ const node=document.querySelector('.capture-cover-letter') as HTMLElement|null; if(!node) return; const w=window.open('','_blank','width=900,height=1300'); if(!w) return; const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map((el)=>el.outerHTML).join(''); w.document.write(`<html><head>${headStyles}<style>@page{size:A4;margin:0}html,body{margin:0;background:#fff}body{display:flex;justify-content:center;align-items:flex-start}.capture-cover-letter{width:210mm;min-height:297mm;box-sizing:border-box;margin:0}</style></head><body>${node.outerHTML}</body></html>`); w.document.close(); await new Promise((r)=>setTimeout(r,900)); w.focus(); w.print(); w.close() }
function openSignatureDialog(){ signatureDialogOpen.value=true; nextTick(initCanvas) }
function initCanvas(){ const c=signatureCanvas.value; if(!c) return; const ctx=c.getContext('2d'); if(!ctx) return; c.width=c.clientWidth||680; c.height=200; ctx.lineWidth=2; ctx.lineCap='round'; let draw=false; const p=(e:PointerEvent)=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}; c.onpointerdown=(e)=>{draw=true;const x=p(e);ctx.beginPath();ctx.moveTo(x.x,x.y)}; c.onpointermove=(e)=>{if(!draw)return;const x=p(e);ctx.lineTo(x.x,x.y);ctx.stroke()}; c.onpointerup=()=>{draw=false;signatureDataUrl.value=c.toDataURL('image/png')} }
onMounted(async ()=>{ const q=typeof route.query.template==='string'?route.query.template:''; if(q&&coverLetterTemplates.value.some((t)=>t.id===q)) selectedTemplate.value=q; try { const resumes = await listMyResumes(); const info = resumes?.[0]?.resumeInformation; if (info?.fullName) { letterModel.fullName = info.fullName; letterModel.phone = info.fullName } if (info?.title) letterModel.role = info.title; if (info?.profileText) letterModel.companyParagraph = info.profileText; } catch { /* noop */ } })
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
      </v-card-text>
    </template>
  </AppPageDrawers>
  <v-container fluid>
    <div class="py-8 d-flex justify-center"><main class="capture-cover-letter" :style="{'--cp-primary':activeColors.primary,'--cp-secondary':activeColors.secondary,'--cp-text':activeColors.text,'--cp-muted':activeColors.muted,'--cp-bg':activeColors.pageBackground,'--section-divider-style':sectionDividerStyle,'--bar-radius':`${barRadius}px`,'--bar-primary-width':`${primaryBarWidth}px`,'--bar-secondary-width':`${secondaryBarWidth}px`}">
      <div v-for="(obj,index) in editableDecorObjects" :key="`decor-${index}`" class="decor-object" :class="`decor-${obj.type}`" :style="decorObjectStyle(obj)"/>
      <header class="hero" :class="{'hero--double': barLayout === 'double', 'hero--photo-right': photoPosition === 'right'}">
        <HoverRichTextEditor v-model="letterModel.fullName" :font-size="`${letterElementStyles.fullName.size}px`" :color="letterElementStyles.fullName.color" :font-weight="letterElementStyles.fullName.weight" />
        <HoverRichTextEditor v-model="letterModel.role" :font-size="`${letterElementStyles.role.size}px`" :color="letterElementStyles.role.color" :font-weight="letterElementStyles.role.weight" />
        <div class="meta-top-right">
          <HoverRichTextEditor v-model="letterModel.date" :font-size="`${letterElementStyles.date.size}px`" :color="letterElementStyles.date.color" :font-weight="letterElementStyles.date.weight" />
          <HoverRichTextEditor v-model="letterModel.location" :font-size="`${letterElementStyles.address.size}px`" :color="letterElementStyles.address.color" :font-weight="letterElementStyles.address.weight" />
        </div>
      </header>
      <section class="letter-body">
        <HoverRichTextEditor v-model="letterModel.heading" :font-size="`${letterElementStyles.heading.size}px`" :color="letterElementStyles.heading.color" :font-weight="letterElementStyles.heading.weight" />
        <HoverRichTextEditor v-model="letterModel.company" :font-size="`${letterElementStyles.greeting.size}px`" :color="letterElementStyles.greeting.color" :font-weight="letterElementStyles.greeting.weight" />
        <HoverRichTextEditor v-model="letterModel.companyParagraph" :font-size="`${letterElementStyles.paragraphOne.size}px`" :color="letterElementStyles.paragraphOne.color" :font-weight="letterElementStyles.paragraphOne.weight" />
        <HoverRichTextEditor v-model="letterModel.summary" :font-size="`${letterElementStyles.paragraphTwo.size}px`" :color="letterElementStyles.paragraphTwo.color" :font-weight="letterElementStyles.paragraphTwo.weight" />
        <div class="signature-rule" />
        <HoverRichTextEditor v-model="letterModel.email" :font-size="`${letterElementStyles.signoff.size}px`" :color="letterElementStyles.signoff.color" :font-weight="letterElementStyles.signoff.weight" />
        <HoverRichTextEditor v-model="letterModel.phone" :font-size="`${letterElementStyles.phone.size}px`" :color="letterElementStyles.phone.color" :font-weight="letterElementStyles.phone.weight" />
      </section>
      <div class="signature-rule"/>
    </main></div>

    <div class="d-flex flex-wrap ga-2 justify-center">
      <v-btn v-for="template in coverLetterTemplates" :key="template.id" size="small" variant="outlined" @click="applyPreviewTemplate(template.id)">{{ template.title }}</v-btn>
    </div>
  </v-container>
</div>
</template>

<style scoped>
.capture-cover-letter{position:relative;overflow:hidden;width:850px;min-height:1123px;padding:80px;background:var(--cp-bg);color:var(--cp-text)}
.hero{border-left:var(--bar-primary-width) solid var(--cp-primary);padding-left:24px;margin-bottom:48px;border-radius:var(--bar-radius);position:relative}
.hero--double::before{content:'';position:absolute;left:calc(var(--bar-primary-width) + 6px);top:0;bottom:0;width:var(--bar-secondary-width);background:var(--cp-secondary);border-radius:var(--bar-radius)}
.meta-top-right{position:absolute;top:80px;right:80px;display:flex;flex-direction:column;align-items:flex-end;gap:6px;text-align:right}
section{border-top:3px var(--section-divider-style) var(--cp-secondary);padding-top:24px;margin-top:24px}
.signature-rule{margin-top:32px;border-top:2px var(--section-divider-style) var(--cp-secondary);width:180px}
.decor-object{position:absolute;pointer-events:none;background:color-mix(in srgb,var(--cp-primary) 35%,transparent)}
.decor-circle{border-radius:999px}.decor-ring{border-radius:999px;background:transparent;border:3px solid color-mix(in srgb,var(--cp-secondary) 55%,transparent)}.decor-blob{border-radius:40% 60% 55% 45% / 50% 35% 65% 50%}.decor-square{border-radius:10px}.decor-diamond{border-radius:8px;transform:translate(-50%,-50%) rotate(45deg)}.decor-star{-webkit-clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}.decor-triangle{-webkit-clip-path:polygon(50% 0%,0 100%,100% 100%);clip-path:polygon(50% 0%,0 100%,100% 100%)}.decor-pill{border-radius:999px}.decor-bar{border-radius:999px}
</style>
