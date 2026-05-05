<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-20-resume.json'
import CvLayoutAside from '~/components/cv/layouts/CvLayoutAside.vue'
import CvLayoutNoAside from '~/components/cv/layouts/CvLayoutNoAside.vue'
import CvLayoutAsideLeft from '~/components/cv/layouts/CvLayoutAsideLeft.vue'
import CvLayoutAsideRight from '~/components/cv/layouts/CvLayoutAsideRight.vue'
import CvLayoutAsideFullLeft from '~/components/cv/layouts/CvLayoutAsideFullLeft.vue'
import CvLayoutAsideFullRight from '~/components/cv/layouts/CvLayoutAsideFullRight.vue'

import ProfileClassic from '~/components/cv/sections/ProfileClassic.vue'
import ExperienceClassic from '~/components/cv/sections/ExperienceClassic.vue'
import ExperienceList from '~/components/cv/sections/ExperienceList.vue'
import ExperienceDot from '~/components/cv/sections/ExperienceDot.vue'
import ExperienceTimeline from '~/components/cv/sections/ExperienceTimeline.vue'
import ExperienceCards from '~/components/cv/sections/ExperienceCards.vue'
import EducationClassic from '~/components/cv/sections/EducationClassic.vue'
import EducationList from '~/components/cv/sections/EducationList.vue'
import EducationDot from '~/components/cv/sections/EducationDot.vue'
import EducationTimeline from '~/components/cv/sections/EducationTimeline.vue'
import EducationCards from '~/components/cv/sections/EducationCards.vue'
import ProjectsClassic from '~/components/cv/sections/ProjectsClassic.vue'
import ProjectsList from '~/components/cv/sections/ProjectsList.vue'
import ProjectsDot from '~/components/cv/sections/ProjectsDot.vue'
import ProjectsTimeline from '~/components/cv/sections/ProjectsTimeline.vue'
import ProjectsCards from '~/components/cv/sections/ProjectsCards.vue'
import SkillsClassic from '~/components/cv/sections/SkillsClassic.vue'
import SkillsStars from '~/components/cv/sections/SkillsStars.vue'
import SkillsDots from '~/components/cv/sections/SkillsDots.vue'
import SkillsProgressLine from '~/components/cv/sections/SkillsProgressLine.vue'
import SkillsProgressCircle from '~/components/cv/sections/SkillsProgressCircle.vue'

import LanguagesClassic from '~/components/cv/sections/LanguagesClassic.vue'
import LanguagesStars from '~/components/cv/sections/LanguagesStars.vue'
import LanguagesDots from '~/components/cv/sections/LanguagesDots.vue'
import LanguagesProgressLine from '~/components/cv/sections/LanguagesProgressLine.vue'
import LanguagesProgressCircle from '~/components/cv/sections/LanguagesProgressCircle.vue'
import CertificationsClassic from '~/components/cv/sections/CertificationsClassic.vue'
import CertificationsList from '~/components/cv/sections/CertificationsList.vue'
import CertificationsDot from '~/components/cv/sections/CertificationsDot.vue'
import CertificationsCards from '~/components/cv/sections/CertificationsCards.vue'
import ReferencesClassic from '~/components/cv/sections/ReferencesClassic.vue'
import ReferencesList from '~/components/cv/sections/ReferencesList.vue'
import ReferencesDot from '~/components/cv/sections/ReferencesDot.vue'
import ReferencesCards from '~/components/cv/sections/ReferencesCards.vue'
import HobbiesClassic from '~/components/cv/sections/HobbiesClassic.vue'
import HobbiesList from '~/components/cv/sections/HobbiesList.vue'
import HobbiesDot from '~/components/cv/sections/HobbiesDot.vue'
import HobbiesCards from '~/components/cv/sections/HobbiesCards.vue'

definePageMeta({
  title: 'Resume · CV Preview',
  layout: 'resume',
})

const route = useRoute()
const selectedTemplate = ref(GENERATED_RESUME_TEMPLATES[0]?.id || 'tpl-001')
const layoutMenuOpen = ref(false)

const activeTemplate = computed(() =>
  GENERATED_RESUME_TEMPLATES.find((template) => template.id === selectedTemplate.value) || GENERATED_RESUME_TEMPLATES[0],
)

const cvLayoutComponentMap = {
  aside: CvLayoutAside,
  'no-aside': CvLayoutNoAside,
  'aside-left': CvLayoutAsideLeft,
  'aside-right': CvLayoutAsideRight,
  'aside-full-left': CvLayoutAsideFullLeft,
  'aside-full-right': CvLayoutAsideFullRight,
} as const

const activeLayoutComponent = computed(() => cvLayoutComponentMap[activeTemplate.value?.layout as keyof typeof cvLayoutComponentMap] || CvLayoutNoAside)

const structureOneSections = ['Profile', 'Experience', 'Education', 'Skills', 'Projects', 'Languages', 'Certification', 'References', 'Hobby']
const structureTwoTopSections = ['Profile', 'Experience', 'Education']
const structureTwoLeftSections = ['Skills']
const structureTwoRightSections = ['Projects', 'Languages', 'Certification', 'References', 'Hobby']
const isMainStructureLayout = computed(() => ['aside', 'no-aside'].includes(String(activeTemplate.value?.layout || '')))

const structureAsideOneSections = ['Profile', 'Skills', 'Languages', 'Certification', 'References', 'Hobby']
const structureAsideTwoSections = ['Profile', 'Languages', 'Certifications', 'References', 'Hobby']
const structureContentBaseSections = ['Experience', 'Education', 'Projects']
const isSideContentLayout = computed(() => ['aside-left', 'aside-right', 'aside-full-left', 'aside-full-right'].includes(String(activeTemplate.value?.layout || '')))

const sectionVariantMap = computed(() => {
  const sections = (activeTemplate.value as any)?.sections || {}
  return {
    profile: sections.profile || 'classic',
    experience: sections.experience || 'classic',
    education: sections.education || 'classic',
    skills: sections.skills || 'classic',
    projects: sections.projects || 'classic',
    languages: sections.languages || 'classic',
    certification: sections.certifications || 'classic',
    references: sections.references || 'classic',
    hobby: sections.interests || 'classic',
  }
})

const headerType = computed(() => String(activeTemplate.value?.headerType || 'header-left'))

const fakeData = computed(() => ((activeTemplate.value as any)?.fakeData || {}))
const sectionType = (key: keyof ReturnType<typeof sectionVariantMap['value']>) => sectionVariantMap.value[key] || 'classic'

function normalizeSectionKey(raw: string) {
  const key = raw.toLowerCase()
  if (key === 'certification') return 'certifications'
  if (key === 'hobby') return 'hobbies'
  return key
}


const sectionComponentMap: Record<string, any> = {
  profile: { classic: ProfileClassic },
  experience: { classic: ExperienceClassic, list: ExperienceList, dot: ExperienceDot, timeline: ExperienceTimeline, cards: ExperienceCards },
  education: { classic: EducationClassic, list: EducationList, dot: EducationDot, timeline: EducationTimeline, cards: EducationCards },
  projects: { classic: ProjectsClassic, list: ProjectsList, dot: ProjectsDot, timeline: ProjectsTimeline, cards: ProjectsCards },
  skills: { classic: SkillsClassic, stars: SkillsStars, dots: SkillsDots, 'progress-line': SkillsProgressLine, 'progress-circle': SkillsProgressCircle },
  languages: { classic: LanguagesClassic, stars: LanguagesStars, dots: LanguagesDots, 'progress-line': LanguagesProgressLine, 'progress-circle': LanguagesProgressCircle },
  certifications: { classic: CertificationsClassic, list: CertificationsList, dot: CertificationsDot, cards: CertificationsCards },
  references: { classic: ReferencesClassic, list: ReferencesList, dot: ReferencesDot, cards: ReferencesCards },
  hobbies: { classic: HobbiesClassic, list: HobbiesList, dot: HobbiesDot, cards: HobbiesCards },
}
function resolveSectionComponent(section: string, type: string) {
  return sectionComponentMap[section]?.[type] || sectionComponentMap[section]?.classic || 'div'
}

function toSectionKey(section: string) {
  const key = section.toLowerCase()
  if (key === "certification") return "certifications"
  if (key === "hobby") return "hobbies"
  return key
}

function getSectionItems(rawSection: string): string[] {
  const key = normalizeSectionKey(rawSection)
  const data: any = fakeData.value || {}
  if (key === 'experience') return (data.experiences || []).map((item: any) => { const from = item.startDate ? String(item.startDate).slice(0,10) : ''; const to = item.endDate ? String(item.endDate).slice(0,10) : 'Present'; return `${item.title || 'Role'} · ${item.company || ''}${from ? ` (${from} - ${to})` : ''}` })
  if (key === 'education') return (data.educations || []).map((item: any) => { const from = item.startDate ? String(item.startDate).slice(0,10) : ''; const to = item.endDate ? String(item.endDate).slice(0,10) : ''; return `${item.title || 'Degree'} · ${item.school || ''}${from ? ` (${from}${to ? ` - ${to}` : ''})` : ''}` })
  if (key === 'projects') return (data.projects || []).map((item: any) => `${item.title || 'Project'}${item.description ? ` · ${item.description}` : ''}`)
  if (key === 'skills') return (data.skills || []).map((item: any) => typeof item === 'string' ? item : `${item.name || item.title || 'Skill'}${item.level ? ` (${item.level}%)` : ''}`).filter(Boolean)
  if (key === 'languages') return (data.languages || []).map((item: any) => typeof item === 'string' ? item : `${item.name || item.title || 'Language'}${item.level ? ` (${item.level}%)` : ''}`)
  if (key === 'certifications') return (data.certifications || []).map((item: any) => typeof item === 'string' ? item : item.title).filter(Boolean)
  if (key === 'references') return (data.references || []).map((item: any) => typeof item === 'string' ? item : item.title).filter(Boolean)
  if (key === 'hobbies') return (data.hobbies || []).map((item: any) => typeof item === 'string' ? item : item.title).filter(Boolean)
  if (key === 'profile') return [String(data.resumeInformation?.profileText || data.profileDescription || '')].filter(Boolean)
  return []
}
const headerProfile = computed(() => {
  const fake: any = (activeTemplate.value as any)?.fakeData || {}
  const info = fake.resumeInformation || {}
  return {
    fullName: String(info.fullName || fake.fullName || 'John Doe'),
    role: String(info.title || fake.role || 'Senior Developer'),
    image: String(info.photo || fake.image || '/img/default_avatar.svg'),
    contact: [
      { icon: 'mdi-email-outline', type: 'text', label: '', value: String(info.email || fake.email || 'john.doe@email.com') },
      { icon: 'mdi-phone-outline', type: 'text', label: '', value: String(info.phone || fake.phone || '+1 (555) 000-1234') },
      { icon: 'mdi-cake-variant-outline', type: 'text', label: '', value: String(info.birthDate || fake.birthday || '1992-05-12') },
      { icon: 'mdi-map-marker-outline', type: 'text', label: '', value: String(info.adresse || fake.location || 'Paris, France') },
      { icon: 'mdi-home-outline', type: 'link', label: 'Home Page', value: String(info.homepage || fake.homepage || 'https://portfolio.example.com') },
      { icon: 'mdi-github', type: 'link', label: 'Repository Profile', value: String(info.repo_profile || fake.repositoryPage || 'https://github.com/john-doe') },
    ],
  }
})

const asideWidth = ref(850)
const asideHeight = ref(1100)
const asideRadius = ref(0)


function parsePx(value: unknown, fallback: number) {
  const num = Number.parseFloat(String(value ?? ''))
  return Number.isFinite(num) ? num : fallback
}

watch(activeTemplate, (template) => {
  asideWidth.value = parsePx(template?.aside?.width, 850)
  asideHeight.value = parsePx(template?.aside?.height, 1100)
  asideRadius.value = parsePx(template?.aside?.radius, 0)
}, { immediate: true })

function applyPreviewTemplate(templateId: string) {
  selectedTemplate.value = templateId
  layoutMenuOpen.value = false
}

function saveFromPreview() {
  localStorage.setItem('resume-cv-preview', JSON.stringify({ template: selectedTemplate.value }))
}

function goToCapture() {
  navigateTo(`/resume/template-capture/cv/${selectedTemplate.value}`)
}

onMounted(() => {
  const queryTemplate = typeof route.query.template === 'string' ? route.query.template : ''
  if (queryTemplate && GENERATED_RESUME_TEMPLATES.some((template) => template.id === queryTemplate)) {
    selectedTemplate.value = queryTemplate
  }
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <v-card-text>
          <h3 class="text-subtitle-1 font-weight-bold mb-3">CV Toolbar</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Même principe que cover page/cover letter: on garde la toolbar, mais le contenu CV est vide pour le moment.
          </p>
          <v-alert type="info" variant="tonal" density="comfortable">
            Content area volontairement vide (aucune section affichée).
          </v-alert>
        </v-card-text>
      </template>

      <template #right>
        <v-card-text>
          <h3 class="text-subtitle-2 font-weight-bold mb-2">Template actif</h3>
          <p class="text-body-2 mb-1">{{ activeTemplate?.name }}</p>
          <p class="text-caption text-medium-emphasis mb-3">{{ activeTemplate?.id }} · {{ activeTemplate?.layout }}</p>
          <v-slider v-model="asideWidth" label="Aside width (px)" :min="240" :max="1200" :step="2" hide-details class="mb-2"/>
          <v-slider v-model="asideHeight" label="Aside height (px)" :min="120" :max="2600" :step="2" hide-details class="mb-2"/>
          <v-slider v-model="asideRadius" label="Aside radius (px)" :min="0" :max="90" :step="1" hide-details/>
        </v-card-text>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <div class="preview-toolbar-wrap">
        <div class="preview-toolbar-row">
          <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-content-save-cog-outline" @click="saveFromPreview">Save</v-btn>
          <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-camera-outline" @click="goToCapture">Capture</v-btn>
          <v-menu v-model="layoutMenuOpen" location="bottom center" origin="top center">
            <template #activator="{ props }">
              <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-view-grid-outline" v-bind="props">Templates</v-btn>
            </template>
            <v-card class="template-menu-card">
              <div class="template-menu-grid">
                <v-card
                  v-for="template in GENERATED_RESUME_TEMPLATES"
                  :key="`cv-preview-${template.id}`"
                  class="template-menu-item"
                  :class="{ 'template-menu-item--active': selectedTemplate === template.id }"
                  variant="outlined"
                  @click="applyPreviewTemplate(template.id)"
                >
                  <v-img :src="`/img/cv/generated/${template.id}.png`" height="96" cover />
                  <v-card-text class="py-2 text-caption">{{ template.name }}</v-card-text>
                </v-card>
              </div>
            </v-card>
          </v-menu>
        </div>
      </div>

      <div class="py-8">
        <component :is="activeLayoutComponent" class="w-100" :style="{ background: activeTemplate?.theme?.palette?.pageBackground || '#ffffff', '--cv-primary': activeTemplate?.theme?.palette?.primary || '#1d4ed8', '--cv-aside-width': `${asideWidth}px`, '--cv-aside-height': `${asideHeight}px`, '--cv-aside-radius': `${asideRadius}px` }">
          <template #header>
            <div class="cv-header-layout" :class="`cv-header-layout--${headerType}`">
              <template v-if="headerType === 'header-left'">
                <div class="cv-header-contact cv-col-8">
                  <div class="cv-header-contact-grid">
                    <div v-for="(item, idx) in headerProfile.contact" :key="`left-${idx}`" class="cv-contact-item">
                      <v-icon :icon="item.icon" size="16" />
                      <template v-if="item.type === 'link'">
                        <a :href="item.value" target="_blank" rel="noopener" class="cv-contact-link">{{ item.label }}</a>
                      </template>
                      <template v-else>{{ item.value }}</template>
                    </div>
                  </div>
                </div>
                <div class="cv-header-identity cv-col-4">
                  <img :src="headerProfile.image" alt="profile" class="cv-header-avatar">
                  <strong>{{ headerProfile.fullName }}</strong>
                  <span>{{ headerProfile.role }}</span>
                </div>
              </template>
              <template v-else-if="headerType === 'header-right'">
                <div class="cv-header-identity cv-col-4">
                  <img :src="headerProfile.image" alt="profile" class="cv-header-avatar">
                  <strong>{{ headerProfile.fullName }}</strong>
                  <span>{{ headerProfile.role }}</span>
                </div>
                <div class="cv-header-contact cv-col-8">
                  <div class="cv-header-contact-grid">
                    <div v-for="(item, idx) in headerProfile.contact" :key="`right-${idx}`" class="cv-contact-item">
                      <v-icon :icon="item.icon" size="16" />
                      <template v-if="item.type === 'link'">
                        <a :href="item.value" target="_blank" rel="noopener" class="cv-contact-link">{{ item.label }}</a>
                      </template>
                      <template v-else>{{ item.value }}</template>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="cv-col-6 cv-header-split-left">
                  <div class="cv-col-3">
                    <img :src="headerProfile.image" alt="profile" class="cv-header-avatar">
                  </div>
                  <div class="cv-col-3 cv-header-identity cv-header-identity--split">
                    <strong>{{ headerProfile.fullName }}</strong>
                    <span>{{ headerProfile.role }}</span>
                  </div>
                </div>
                <div class="cv-col-6 cv-header-contact">
                  <div class="cv-header-contact-grid">
                    <div v-for="(item, idx) in headerProfile.contact" :key="`split-${idx}`" class="cv-contact-item">
                      <v-icon :icon="item.icon" size="16" />
                      <template v-if="item.type === 'link'">
                        <a :href="item.value" target="_blank" rel="noopener" class="cv-contact-link">{{ item.label }}</a>
                      </template>
                      <template v-else>{{ item.value }}</template>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </template>
          <template #aside>
            <div v-if="isSideContentLayout && activeTemplate?.structure === 'structure-1'" :class="['cv-aside-sections', { 'cv-aside-sections--full': ['aside-full-left', 'aside-full-right'].includes(String(activeTemplate?.layout || '')) }]">
              <div v-for="section in structureAsideOneSections" :key="`aside-s1-${section}`" class="cv-aside-section-item">
                <strong>{{ section }}</strong>
                <component :is="resolveSectionComponent(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getSectionItems(section)" :text="getSectionItems(section)[0]" />
              </div>
            </div>
            <div v-else-if="isSideContentLayout && activeTemplate?.structure === 'structure-2'" :class="['cv-aside-sections', { 'cv-aside-sections--full': ['aside-full-left', 'aside-full-right'].includes(String(activeTemplate?.layout || '')) }]">
              <div v-for="section in structureAsideTwoSections" :key="`aside-s2-${section}`" class="cv-aside-section-item">
                <strong>{{ section }}</strong>
                <component :is="resolveSectionComponent(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getSectionItems(section)" :text="getSectionItems(section)[0]" />
              </div>
            </div>
          </template>

          <template #content>
            <div v-if="isSideContentLayout && activeTemplate?.structure === 'structure-1'" class="cv-sections-list">
              <div class="cv-section-row"><strong>Experience</strong><component :is="resolveSectionComponent('experience', sectionType('experience'))" :items="getSectionItems('experience')" /></div>
              <div class="cv-section-row"><strong>Education</strong><component :is="resolveSectionComponent('education', sectionType('education'))" :items="getSectionItems('education')" /></div>
              <div class="cv-section-row"><strong>Projects</strong><component :is="resolveSectionComponent('projects', sectionType('projects'))" :items="getSectionItems('projects')" /></div>
            </div>
            <div v-else-if="isSideContentLayout && activeTemplate?.structure === 'structure-2'" class="cv-sections-structure-2">
              <div class="cv-section-row"><strong>Experience</strong><component :is="resolveSectionComponent('experience', sectionType('experience'))" :items="getSectionItems('experience')" /></div>
              <div class="cv-section-row"><strong>Education</strong><component :is="resolveSectionComponent('education', sectionType('education'))" :items="getSectionItems('education')" /></div>
              <div class="cv-section-row"><strong>Projects</strong><component :is="resolveSectionComponent('projects', sectionType('projects'))" :items="getSectionItems('projects')" /></div>
              <v-row class="mt-1" dense>
                <v-col cols="6">
                  <div class="cv-section-row"><strong>Skills</strong><component :is="resolveSectionComponent('skills', sectionType('skills'))" :items="getSectionItems('skills').slice(0, Math.ceil(getSectionItems('skills').length/2))" /></div>
                </v-col>
                <v-col cols="6">
                  <div class="cv-section-row"><strong>Skills</strong><component :is="resolveSectionComponent('skills', sectionType('skills'))" :items="getSectionItems('skills').slice(Math.ceil(getSectionItems('skills').length/2))" /></div>
                </v-col>
              </v-row>
            </div>
            <div v-else-if="isMainStructureLayout && activeTemplate?.structure === 'structure-1'" class="cv-sections-list">
              <div v-for="section in structureOneSections" :key="`s1-${section}`" class="cv-section-row"><strong>{{ section }}</strong><component :is="resolveSectionComponent(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getSectionItems(section)" /></div>
            </div>
            <div v-else-if="isMainStructureLayout && activeTemplate?.structure === 'structure-2'" class="cv-sections-structure-2">
              <div v-for="section in structureTwoTopSections" :key="`s2-top-${section}`" class="cv-section-row"><strong>{{ section }}</strong><component :is="resolveSectionComponent(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getSectionItems(section)" /></div>
              <v-row class="mt-1" dense>
                <v-col cols="6">
                  <div v-for="section in structureTwoLeftSections" :key="`s2-left-${section}`" class="cv-section-row"><strong>{{ section }}</strong><component :is="resolveSectionComponent(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getSectionItems(section)" /></div>
                </v-col>
                <v-col cols="6">
                  <div v-for="section in structureTwoRightSections" :key="`s2-right-${section}`" class="cv-section-row"><strong>{{ section }}</strong><component :is="resolveSectionComponent(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getSectionItems(section)" /></div>
                </v-col>
              </v-row>
            </div>
            <div v-else class="empty-state">
              <p class="text-medium-emphasis">Aucune section CV affichée pour le moment.</p>
            </div>
          </template>
        </component>
      </div>
    </v-container>
  </div>
</template>

<style scoped>


.cv-header-layout { display: grid; gap: 12px; align-items: center; }
.cv-header-layout--header-left { grid-template-columns: 2fr 1fr; }
.cv-header-layout--header-right { grid-template-columns: 1fr 2fr; }
.cv-header-layout--header-split { grid-template-columns: 5fr 7fr; }
.cv-header-split-left { display: grid; grid-template-columns: auto 1fr; gap: 6px; align-items: center; justify-content: start; }
.cv-header-contact { display:flex; flex-direction:column; justify-content:center; align-items:stretch; text-align:start; }
.cv-header-contact-grid { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 10px; width:100%; text-align:start; }
.cv-contact-item { display:flex; align-items:center; gap:6px; font-size:13px; }
.cv-contact-link { color: inherit; text-decoration: none; font-weight: 500; }
.cv-contact-link:hover { text-decoration: none; color: inherit; }
.cv-header-identity { display: flex; flex-direction: column; gap: 4px; justify-content:center; align-items:center; text-align:center; }
.cv-header-identity--split { align-items:flex-start; text-align:start; }
.cv-header-avatar { width: 52px; height: 52px; object-fit: cover; border-radius: 999px; }

.empty-state {
  text-align: center;
  max-width: 560px;
  padding: 24px;
}

.cv-sections-list, .cv-sections-structure-2 {
  width: 100%;
}

.cv-aside-sections {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-aside-section-item {
  padding: 8px 10px;
  border-radius: 8px;
  background: transparent;
  color: #1e293b;
  border: 0;
  font-weight: 600;
  font-size: 13px;
}

.cv-aside-section-item :deep(.cv-sec) { padding: 4px 0; }
.cv-aside-section-item :deep(.cv-item) { font-size: 12px; margin-bottom: 4px; }

.cv-aside-sections--full .cv-aside-section-item {
  color: #fff;
}
.cv-aside-sections--full .cv-aside-section-item :deep(.cv-sec),
.cv-aside-sections--full .cv-aside-section-item :deep(.cv-item),
.cv-aside-sections--full .cv-aside-section-item :deep(p) {
  color: #fff;
}

.cv-section-row small { font-weight: 400; opacity: .8; }
.cv-section-row--timeline{border-left:4px solid #6366f1;padding-left:10px}
.cv-section-row--cards{box-shadow:0 4px 10px rgba(15,23,42,.08)}
.cv-section-row--dot::before{content:"• ";font-weight:700}
.cv-section-row--stars::after{content:" ★"}
.cv-section-row--progress-line{background:linear-gradient(90deg,#dbeafe 45%,transparent 45%)}
.cv-section-row--progress-circle{border-style:solid}
.cv-row-items { margin: 6px 0 0; padding-left: 16px; }
.cv-row-items li { font-size: 12px; line-height: 1.35; }
.cv-section-row {
  border: 0;
  border-radius: 0;
  padding: 8px 4px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #334155;
  background: transparent;
}

.template-menu-card {
  width: min(860px, calc(100vw - 48px));
  max-height: 70vh;
  overflow: auto;
}

.template-menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 12px;
}

.template-menu-item {
  cursor: pointer;
}

.template-menu-item--active {
  border: 2px solid rgb(var(--v-theme-primary));
}
</style>
