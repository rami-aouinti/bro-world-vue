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
const primaryBarWidth = ref(10)
const secondaryBarWidth = ref(5)
const editableDecorObjects = ref<any[]>([])

const itemStyles = reactive<Record<string, { size: number, color: string, weight: string }>>({
  fullName: { size: 56, color: '#0F172A', weight: '700' },
  role: { size: 28, color: '#64748B', weight: '500' },
  date: { size: 18, color: '#64748B', weight: '400' },
  address: { size: 18, color: '#0F172A', weight: '500' },
  location: { size: 18, color: '#0F172A', weight: '500' },
  heading: { size: 24, color: '#0F172A', weight: '700' },
  greeting: { size: 24, color: '#0F172A', weight: '600' },
  paragraphOne: { size: 22, color: '#0F172A', weight: '400' },
  paragraphTwo: { size: 22, color: '#0F172A', weight: '400' },
  signoff: { size: 24, color: '#0F172A', weight: '600' },
  email: { size: 18, color: '#0F172A', weight: '500' },
  phone: { size: 18, color: '#0F172A', weight: '500' },
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

const sectionDividerStyle = computed(() => activeTemplate.value?.decor?.divider === 'dashed' ? 'dashed' : 'solid')
const activeColors = computed(() => {
  const palette = activeTemplate.value.theme.palette
  if (selectedPalette.value === 'sunset') return { ...palette, primary: '#C2410C', secondary: '#FDBA74', pageBackground: '#FFF7ED' }
  if (selectedPalette.value === 'forest') return { ...palette, primary: '#166534', secondary: '#86EFAC', pageBackground: '#F0FDF4' }
  if (selectedPalette.value === 'custom') return { ...palette, primary: customPrimary.value, secondary: customSecondary.value, pageBackground: customPageBackground.value }
  return palette
})

watch(activeTemplate, (tpl) => {
  editableDecorObjects.value = (tpl?.decor?.objects || []).map((obj: any) => normalizeDecorObject(obj))
  barLayout.value = tpl?.hero?.barLayout === 'double' ? 'double' : 'single'
  const intensityMap: Record<string, number> = { low: 6, medium: 10, high: 14 }
  primaryBarWidth.value = intensityMap[tpl?.hero?.accentIntensity || tpl?.sections?.accentIntensity] || 10
  secondaryBarWidth.value = Math.max(3, Math.round(primaryBarWidth.value * 0.5))
  const items = (tpl as any)?.items || {}
  for (const key of Object.keys(itemStyles)) {
    const cfg = items[key]
    if (!cfg) continue
    if (cfg?.size) itemStyles[key].size = Math.round((Number(cfg.size.min) + Number(cfg.size.max)) / 2)
    if (cfg?.colors?.[0]) itemStyles[key].color = cfg.colors[0]
    if (cfg?.styles?.[0]) itemStyles[key].weight = fontWeightMap[cfg.styles[0]] || '400'
  }
}, { immediate: true })

function applyPreviewTemplate(id: string) { selectedTemplate.value = id }
onMounted(async () => {
  const q = typeof route.query.template === 'string' ? route.query.template : ''
  if (q && coverLetterTemplates.value.some((t) => t.id === q)) selectedTemplate.value = q
  try {
    const resumes = await listMyResumes()
    const info = resumes?.[0]?.resumeInformation
    if (info?.fullName) model.fullName = info.fullName
    if (info?.title) model.role = info.title
    if (info?.email) model.email = info.email
    if (info?.phone) model.phone = info.phone
    if (info?.profileText) model.paragraphOne = info.profileText
  } catch { /* noop */ }
})
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
      <header class="hero" :class="{ 'hero--double': barLayout === 'double' }">
        <HoverRichTextEditor v-model="model.fullName" :font-size="`${itemStyles.fullName.size}px`" :color="itemStyles.fullName.color" :font-weight="itemStyles.fullName.weight" />
        <HoverRichTextEditor v-model="model.role" :font-size="`${itemStyles.role.size}px`" :color="itemStyles.role.color" :font-weight="itemStyles.role.weight" />
      </header>
      <div class="meta-top-right">
        <HoverRichTextEditor v-model="model.date" :font-size="`${itemStyles.date.size}px`" :color="itemStyles.date.color" :font-weight="itemStyles.date.weight" />
        <HoverRichTextEditor v-model="model.location" :font-size="`${itemStyles.location.size}px`" :color="itemStyles.location.color" :font-weight="itemStyles.location.weight" />
      </div>
      <section>
        <HoverRichTextEditor v-model="model.heading" :font-size="`${itemStyles.heading.size}px`" :color="itemStyles.heading.color" :font-weight="itemStyles.heading.weight" />
        <HoverRichTextEditor v-model="model.greeting" :font-size="`${itemStyles.greeting.size}px`" :color="itemStyles.greeting.color" :font-weight="itemStyles.greeting.weight" />
        <HoverRichTextEditor v-model="model.paragraphOne" :font-size="`${itemStyles.paragraphOne.size}px`" :color="itemStyles.paragraphOne.color" :font-weight="itemStyles.paragraphOne.weight" />
        <HoverRichTextEditor v-model="model.paragraphTwo" :font-size="`${itemStyles.paragraphTwo.size}px`" :color="itemStyles.paragraphTwo.color" :font-weight="itemStyles.paragraphTwo.weight" />
        <HoverRichTextEditor v-model="model.signoff" :font-size="`${itemStyles.signoff.size}px`" :color="itemStyles.signoff.color" :font-weight="itemStyles.signoff.weight" />
        <HoverRichTextEditor v-model="model.email" :font-size="`${itemStyles.email.size}px`" :color="itemStyles.email.color" :font-weight="itemStyles.email.weight" />
        <HoverRichTextEditor v-model="model.phone" :font-size="`${itemStyles.phone.size}px`" :color="itemStyles.phone.color" :font-weight="itemStyles.phone.weight" />
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
