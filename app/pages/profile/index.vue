<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type {
  ShopGeneralProduct,
  WorldShopCheckoutSession,
} from '~/types/world/shop'
import type { SessionUser } from '~/types/session'
import type { RecruitResume, RecruitResumeSection } from '~/types/world/jobs'
import { privateApi } from '~/utils/http/privateApi'

interface UpcomingCalendarEvent {
  id: string
  title: string
  startAt: string
}

type TransactionState = 'idle' | 'pending' | 'success' | 'failure' | 'cancelled'
type BuyCoinsStep = 'product' | 'confirmation' | 'payment' | 'validation'

interface CoinsReceipt {
  id: string
  createdAt: string
  status: Exclude<TransactionState, 'idle'>
  productName: string
  coinsAmount: number
  amount: number
  currency: string
}

type ResumeSectionKey =
  | 'experiences'
  | 'educations'
  | 'skills'
  | 'languages'
  | 'certifications'
  | 'projects'
  | 'references'
  | 'hobbies'
type ResumeTemplate = 'modern' | 'elegant' | 'compact'
type ResumeSectionForm = RecruitResumeSection & {
  attachmentFiles?: File[]
}

const { t, locale } = useI18n()
const { scopedRecruitPath } = useRecruitScopedApi()
const { isPageSkeletonVisible } = usePageSkeleton()
const { user } = useUserSession()
const profileStore = useProfileStore()
const shopStore = useWorldShopStore()
const { profile, loading, error } = storeToRefs(profileStore)
const upcomingEvents = ref<UpcomingCalendarEvent[]>([])
const { pending: shopPending } = storeToRefs(shopStore)

const displayedProverbs = ref<string[]>([])
let typingInterval: ReturnType<typeof setInterval> | null = null

const coinProducts = ref<ShopGeneralProduct[]>([])
const selectedProductId = ref('')
const checkout = ref<WorldShopCheckoutSession | null>(null)
const transactionState = ref<TransactionState>('idle')
const transactionMessage = ref('')
const buyCoinsStep = ref<BuyCoinsStep>('product')
const resumes = ref<RecruitResume[]>([])
const resumesLoading = ref(false)
const resumesError = ref('')
const resumeViewerOpen = ref(false)
const resumeEditorOpen = ref(false)
const resumeCreateOpen = ref(false)
const resumeCreateStep = ref<'choice' | 'upload' | 'manual'>('choice')
const selectedResumeTemplate = ref<ResumeTemplate>('modern')
const selectedResume = ref<RecruitResume | null>(null)
const createLoading = ref(false)
const updateLoading = ref(false)
const resumeUploadFile = ref<File | null>(null)

function createEmptyResumeSection(): ResumeSectionForm {
  return {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    company: '',
    school: '',
    location: '',
    level: '',
    flag: '',
    countryCode: '',
    home_page: '',
    attachments: [],
    attachmentFiles: [],
  }
}

const resumeForm = reactive<Record<ResumeSectionKey, ResumeSectionForm[]>>({
  experiences: [createEmptyResumeSection()],
  educations: [createEmptyResumeSection()],
  skills: [createEmptyResumeSection()],
  languages: [createEmptyResumeSection()],
  certifications: [createEmptyResumeSection()],
  projects: [createEmptyResumeSection()],
  references: [createEmptyResumeSection()],
  hobbies: [createEmptyResumeSection()],
})

const fullName = computed(() => {
  const user = profile.value
  if (!user) {
    return ''
  }

  return (
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username
  )
})

const profileTitle = computed(() => profile.value?.profile?.title || 'Member')
const profileInformation = computed(
  () => profile.value?.profile?.information || '',
)
const proverbTexts = computed(() => [
  t('pages.profile.rightRail.proverbs.0'),
  t('pages.profile.rightRail.proverbs.1'),
  t('pages.profile.rightRail.proverbs.2'),
])

const hasUpcomingEvents = computed(() => upcomingEvents.value.length > 0)
const hasResumes = computed(() => resumes.value.length > 0)
const resumeTemplateOptions = [
  { value: 'modern', label: 'Modern Pro' },
  { value: 'elegant', label: 'Executive' },
  { value: 'compact', label: 'Clean Grid' },
] as const
const resumeLevelOptions = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
  'Native / Bilingual',
] as const
const resumeSectionEntries = computed(
  () =>
    [
      { key: 'experiences', label: 'Experiences' },
      { key: 'educations', label: 'Educations' },
      { key: 'skills', label: 'Skills' },
      { key: 'languages', label: 'Languages' },
      { key: 'certifications', label: 'Certifications' },
      { key: 'projects', label: 'Projects' },
      { key: 'references', label: 'References' },
      { key: 'hobbies', label: 'Hobbies' },
    ] as Array<{ key: ResumeSectionKey; label: string }>,
)
const profileResumeIdentity = computed(() => {
  const currentProfile = profile.value
  const resumeIdentity = selectedResume.value?.resumeInformation
  const completeName =
    resumeIdentity?.fullName ||
    [currentProfile?.firstName, currentProfile?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    currentProfile?.username ||
    'Anonymous Member'
  const title = currentProfile?.profile?.title || 'Professional Profile'
  const location = resumeIdentity?.address || currentProfile?.profile?.location || ''
  const email = resumeIdentity?.email || currentProfile?.email || ''
  const phone = resumeIdentity?.phone || currentProfile?.profile?.phone || ''
  const summary =
    currentProfile?.profile?.information ||
    'Experienced and motivated professional focused on delivering results.'
  const avatar = currentProfile?.photo || ''
  const username = currentProfile?.username || ''
  const homepage = resumeIdentity?.homepage || ''
  const repoProfile = resumeIdentity?.repo_profile || ''

  return {
    completeName,
    title,
    location,
    email,
    phone,
    summary,
    avatar,
    username,
    homepage,
    repoProfile,
  }
})
const selectedProduct = computed(() =>
  coinProducts.value.find((product) => product.id === selectedProductId.value),
)
const nextEventLabel = computed(() =>
  upcomingEvents.value[0]
    ? t('pages.profile.rightRail.nextEvent', {
        title: upcomingEvents.value[0].title,
      })
    : '',
)

function clearTypewriterTimers() {
  if (typingInterval) {
    clearInterval(typingInterval)
    typingInterval = null
  }
}

function startTypewriter() {
  clearTypewriterTimers()
  displayedProverbs.value = proverbTexts.value.map(() => '')
  const charIndexes = proverbTexts.value.map(() => 0)
  typingInterval = setInterval(() => {
    let hasRemainingChars = false
    proverbTexts.value.forEach((text, index) => {
      const cursor = charIndexes[index] ?? 0
      if (cursor < text.length) {
        displayedProverbs.value[index] =
          (displayedProverbs.value[index] ?? '') + text.charAt(cursor)
        charIndexes[index] = cursor + 1
        hasRemainingChars = true
      }
    })

    if (!hasRemainingChars) {
      clearTypewriterTimers()
    }
  }, 45)
}

function resetTransactionState() {
  transactionState.value = 'idle'
  transactionMessage.value = ''
  checkout.value = null
  buyCoinsStep.value = 'product'
}

const sectionSpecificFields: Record<
  ResumeSectionKey,
  Array<
    | 'startDate'
    | 'endDate'
    | 'company'
    | 'school'
    | 'location'
    | 'level'
    | 'flag'
    | 'countryCode'
    | 'home_page'
    | 'attachments'
  >
> = {
  experiences: ['startDate', 'endDate', 'company'],
  educations: ['startDate', 'endDate', 'school', 'location'],
  skills: [],
  languages: ['level', 'flag', 'countryCode'],
  certifications: ['attachments'],
  projects: ['home_page', 'attachments'],
  references: [],
  hobbies: [],
}

function hasSectionField(
  section: ResumeSectionKey,
  field: (typeof sectionSpecificFields)[ResumeSectionKey][number],
) {
  return sectionSpecificFields[section].includes(field)
}

function levelFieldLabel(section: ResumeSectionKey) {
  return section === 'languages' ? 'Language level' : 'Level'
}

function normalizeSections(
  section: ResumeSectionKey,
  items: ResumeSectionForm[],
) {
  const fields = sectionSpecificFields[section]
  return items
    .map((item) => ({
      id: item.id,
      title: item.title.trim(),
      description: (item.description || '').trim(),
      ...(fields.includes('startDate')
        ? { startDate: (item.startDate || '').trim() || null }
        : {}),
      ...(fields.includes('endDate')
        ? { endDate: (item.endDate || '').trim() || null }
        : {}),
      ...(fields.includes('company')
        ? { company: (item.company || '').trim() || null }
        : {}),
      ...(fields.includes('school')
        ? { school: (item.school || '').trim() || null }
        : {}),
      ...(fields.includes('location')
        ? { location: (item.location || '').trim() || null }
        : {}),
      ...(fields.includes('level')
        ? { level: (item.level || '').trim() || null }
        : {}),
      ...(fields.includes('flag')
        ? { flag: (item.flag || '').trim() || null }
        : {}),
      ...(fields.includes('countryCode')
        ? { countryCode: (item.countryCode || '').trim() || null }
        : {}),
      ...(fields.includes('home_page')
        ? { home_page: (item.home_page || '').trim() || null }
        : {}),
      ...(fields.includes('attachments')
        ? {
            attachments: (item.attachments || [])
              .map((attachment) => attachment.trim())
              .filter(Boolean),
          }
        : {}),
    }))
    .filter((item) => item.title)
    .map(({ id, ...item }) => ({
      ...(id ? { id } : {}),
      ...item,
      ...('attachments' in item && item.attachments.length === 0
        ? { attachments: undefined }
        : {}),
    }))
}

function populateResumeFormFromResume(resume: RecruitResume) {
  resumeSectionEntries.value.forEach(({ key }) => {
    const values = resume[key]
    resumeForm[key] = values.length
      ? values.map((item) => ({
          ...createEmptyResumeSection(),
          id: item.id,
          title: item.title || '',
          description: item.description || '',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          company: item.company || '',
          school: item.school || '',
          location: item.location || '',
          level: item.level || '',
          flag: item.flag || '',
          countryCode: item.countryCode || '',
          home_page: item.home_page || '',
          attachments: item.attachments || [],
          attachmentFiles: [],
        }))
      : [createEmptyResumeSection()]
  })
}

function resetResumeForm() {
  resumeSectionEntries.value.forEach(({ key }) => {
    resumeForm[key] = [createEmptyResumeSection()]
  })
}

function addResumeLine(section: ResumeSectionKey) {
  resumeForm[section].push(createEmptyResumeSection())
}

function removeResumeLine(section: ResumeSectionKey, index: number) {
  resumeForm[section].splice(index, 1)
  if (resumeForm[section].length === 0) {
    resumeForm[section].push(createEmptyResumeSection())
  }
}

function formatResumeDateRange(section: RecruitResumeSection) {
  const startDate = section.startDate || ''
  const endDate = section.endDate || ''
  if (!startDate && !endDate) return ''
  if (startDate && endDate) return `${startDate} → ${endDate}`
  if (startDate) return `${startDate} → Present`
  return endDate
}

function sectionMeta(section: RecruitResumeSection) {
  return [section.company, section.school, section.location, section.level]
    .filter(Boolean)
    .join(' • ')
}

function hasAttachmentFiles() {
  return (['certifications', 'projects'] as ResumeSectionKey[]).some(
    (section) =>
      resumeForm[section].some(
        (line) => (line.attachmentFiles || []).length > 0,
      ),
  )
}

function buildResumeMultipartPayload() {
  const normalizedBySection = Object.fromEntries(
    resumeSectionEntries.value
      .map(({ key }) => [key, normalizeSections(key, resumeForm[key])] as const)
      .filter(([, value]) => value.length > 0),
  )

  const formData = new FormData()
  Object.entries(normalizedBySection).forEach(([key, value]) => {
    formData.append(key, JSON.stringify(value))
  })
  ;(['certifications', 'projects'] as ResumeSectionKey[]).forEach(
    (sectionKey) => {
      resumeForm[sectionKey].forEach((line, lineIndex) => {
        ;(line.attachmentFiles || []).forEach((file) => {
          formData.append(`${sectionKey}[${lineIndex}][attachments][]`, file)
        })
      })
    },
  )

  return { normalizedBySection, formData }
}

function openResume(resume: RecruitResume) {
  selectedResume.value = resume
  selectedResumeTemplate.value = 'modern'
  resumeViewerOpen.value = true
}

function hasSectionData(resume: RecruitResume, key: ResumeSectionKey) {
  return resume[key].length > 0
}

function openResumeEdit(resume: RecruitResume) {
  selectedResume.value = resume
  populateResumeFormFromResume(resume)
  resumeEditorOpen.value = true
}

async function fetchResumes() {
  resumesLoading.value = true
  resumesError.value = ''
  try {
    resumes.value = await privateApi.request<RecruitResume[]>(
      '/api/recruit/private/me/resumes',
    )
  } catch {
    resumesError.value = 'Unable to load your resumes.'
  } finally {
    resumesLoading.value = false
  }
}

async function createResumeFromUpload() {
  if (!resumeUploadFile.value) return
  createLoading.value = true
  resumesError.value = ''
  try {
    const formData = new FormData()
    formData.append('document', resumeUploadFile.value)
    formData.append('experiences', JSON.stringify([]))
    formData.append('skills', JSON.stringify([]))
    const created = await $fetch<{ id: string; documentUrl: string | null }>(
      scopedRecruitPath('/resumes'),
      { method: 'POST', body: formData },
    )
    resumes.value = [
      {
        id: created.id,
        documentUrl: created.documentUrl,
        resumeInformation: null,
        experiences: [],
        educations: [],
        skills: [],
        languages: [],
        certifications: [],
        projects: [],
        references: [],
        hobbies: [],
      },
      ...resumes.value,
    ]
    resumeUploadFile.value = null
    resumeCreateOpen.value = false
  } catch {
    resumesError.value = 'Unable to upload PDF resume.'
  } finally {
    createLoading.value = false
  }
}

async function createResumeFromManual() {
  createLoading.value = true
  resumesError.value = ''
  try {
    const { normalizedBySection, formData } = buildResumeMultipartPayload()

    const created = await $fetch<{ id: string; documentUrl: string | null }>(
      scopedRecruitPath('/resumes'),
      {
        method: 'POST',
        body: hasAttachmentFiles() ? formData : normalizedBySection,
      },
    )

    resumes.value = [
      {
        id: created.id,
        documentUrl: null,
        resumeInformation: null,
        experiences:
          (normalizedBySection.experiences as RecruitResumeSection[]) || [],
        educations:
          (normalizedBySection.educations as RecruitResumeSection[]) || [],
        skills: (normalizedBySection.skills as RecruitResumeSection[]) || [],
        languages:
          (normalizedBySection.languages as RecruitResumeSection[]) || [],
        certifications:
          (normalizedBySection.certifications as RecruitResumeSection[]) || [],
        projects:
          (normalizedBySection.projects as RecruitResumeSection[]) || [],
        references:
          (normalizedBySection.references as RecruitResumeSection[]) || [],
        hobbies: (normalizedBySection.hobbies as RecruitResumeSection[]) || [],
      },
      ...resumes.value,
    ]
    resetResumeForm()
    resumeCreateOpen.value = false
  } catch {
    resumesError.value = 'Unable to create manual resume.'
  } finally {
    createLoading.value = false
  }
}

async function updateResume() {
  if (!selectedResume.value || selectedResume.value.documentUrl) return
  updateLoading.value = true
  resumesError.value = ''
  try {
    const { normalizedBySection, formData } = buildResumeMultipartPayload()
    await privateApi.request(
      scopedRecruitPath(
        `/private/me/resumes/${encodeURIComponent(selectedResume.value.id)}`,
      ),
      {
        method: 'PATCH',
        body: hasAttachmentFiles() ? formData : normalizedBySection,
      },
    )
    await fetchResumes()
    resumeEditorOpen.value = false
  } catch {
    resumesError.value = 'Unable to update resume.'
  } finally {
    updateLoading.value = false
  }
}

async function fetchCoinProducts(force = false) {
  try {
    await shopStore.fetchProducts({
      force,
      filters: { status: 'published', page: 1, limit: 50 },
    })

    const normalizedProducts = (shopStore.items as ShopGeneralProduct[]).filter(
      (item) => {
        const category = String(item.category || '').toLowerCase()
        return (
          category.includes('coins') ||
          category.includes('pack coins') ||
          category.includes('packs coins')
        )
      },
    )

    coinProducts.value = normalizedProducts
  } catch {
    coinProducts.value = []
    transactionState.value = 'failure'
    transactionMessage.value = t(
      'pages.profile.buyCoins.messages.productsError',
    )
  }
}

async function fetchProfile(force = false) {
  try {
    await profileStore.fetchProfile(force)
  } catch {
    // Error state handled by store.
  }
}

async function fetchUpcomingEvents() {
  try {
    const response = await $fetch<UpcomingCalendarEvent[]>(
      '/api/calendar/events/upcoming',
    )
    upcomingEvents.value = (response || [])
      .slice()
      .sort(
        (first, second) =>
          new Date(first.startAt).getTime() -
          new Date(second.startAt).getTime(),
      )
      .slice(0, 5)
  } catch (fetchError) {
    console.error(fetchError)
    upcomingEvents.value = []
  }
}

definePageMeta({
  title: 'appbar.profile',
  middleware: 'auth',
  layout: 'profile',
})

onMounted(async () => {
  await Promise.all([
    fetchProfile(),
    fetchUpcomingEvents(),
    fetchCoinProducts(),
    fetchResumes(),
  ])
  startTypewriter()
})

watch([proverbTexts, locale], () => {
  startTypewriter()
})

onUnmounted(() => {
  clearTypewriterTimers()
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <v-card-title>{{ t('pages.profile.rightRail.title') }}</v-card-title>
        <v-card-text>
          <p v-if="nextEventLabel" class="text-body-2 mb-3">
            {{ nextEventLabel }}
          </p>
          <p
            v-for="(proverb, index) in displayedProverbs"
            :key="`proverb-${index}`"
            class="text-body-2 text-medium-emphasis mb-2"
          >
            {{ proverb }}
          </p>

          <v-list v-if="hasUpcomingEvents" density="compact" class="pa-0">
            <v-list-item
              v-for="event in upcomingEvents"
              :key="event.id"
              prepend-icon="mdi-calendar-clock-outline"
              :title="event.title"
              :subtitle="new Date(event.startAt).toLocaleString(locale)"
            />
          </v-list>
          <p v-else class="text-body-2 text-medium-emphasis mb-0">
            {{ t('pages.profile.rightRail.emptyUpcoming') }}
          </p>
        </v-card-text>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible && loading" />
      <template v-else>
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
        >
          {{ error }}
        </v-alert>
        <v-card v-if="profile" variant="text" class="postcard-gradient-card">
          <v-card-text
            class="d-flex flex-column flex-md-row ga-4 align-start align-md-center"
          >
            <v-avatar size="84">
              <v-img :src="profile.photo" :alt="fullName" />
            </v-avatar>

            <div class="flex-grow-1">
              <h2 class="text-h5 mb-1">{{ fullName }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-1">
                {{ profile?.description }}
              </p>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-chip color="amber-darken-2" label>
                {{ profile.coins }} coins
              </v-chip>
              <v-chip color="primary" variant="outlined" label>
                {{ profileTitle }}
              </v-chip>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-text>
            <p class="text-body-1 mb-0">
              {{ profileInformation || 'No profile information yet.' }}
            </p>
          </v-card-text>
        </v-card>

        <v-card class="postcard-gradient-card mt-6" rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>My CV</span>
            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-file-plus-outline"
              @click="() => { resumeCreateOpen = true; resumeCreateStep = 'choice' }"
            >
              New CV
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-alert
              v-if="resumesError"
              type="error"
              variant="tonal"
              density="comfortable"
              class="mb-4"
            >
              {{ resumesError }}
            </v-alert>

            <v-skeleton-loader
              v-if="resumesLoading"
              type="list-item-three-line, list-item-three-line"
            />

            <v-empty-state
              v-else-if="!hasResumes"
              icon="mdi-file-document-outline"
              title="No resumes yet"
              text="Add a PDF resume or create one manually."
            />

            <v-row v-else>
              <v-col
                v-for="resume in resumes"
                :key="resume.id"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card
                  rounded="xl"
                  class="h-100 postcard-gradient-card resume-card"
                  @click="openResume(resume)"
                >
                  <v-card-text>
                    <div class="d-flex justify-space-between align-center mb-3">
                      <v-chip
                        size="small"
                        :color="resume.documentUrl ? 'info' : 'primary'"
                        variant="tonal"
                      >
                        {{ resume.documentUrl ? 'PDF' : 'Data CV' }}
                      </v-chip>
                      <v-btn
                        v-if="!resume.documentUrl"
                        size="small"
                        icon="mdi-pencil-outline"
                        variant="text"
                        @click.stop="openResumeEdit(resume)"
                      />
                    </div>
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">
                      CV #{{ resume.id.slice(0, 8) }}
                    </h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{
                        resume.documentUrl
                          ? 'Click to preview the PDF.'
                          : 'Click to view resume sections.'
                      }}
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </template>
    </v-container>

    <AppModal v-model="resumeViewerOpen" title="Resume details" :max-width="980">
      <div v-if="selectedResume">
        <iframe
          v-if="selectedResume.documentUrl"
          :src="selectedResume.documentUrl"
          style="width: 100%; height: 72vh; border: none; border-radius: 12px"
          title="Resume PDF preview"
        />
        <div v-else class="resume-template-shell">
          <div class="resume-template-picker mb-4">
            <v-btn-toggle
              v-model="selectedResumeTemplate"
              mandatory
              divided
              color="primary"
              variant="outlined"
              class="resume-template-toggle"
            >
              <v-btn
                v-for="option in resumeTemplateOptions"
                :key="option.value"
                :value="option.value"
                class="text-none px-5"
              >
                {{ option.label }}
              </v-btn>
            </v-btn-toggle>
          </div>

          <article
            v-if="selectedResumeTemplate === 'modern'"
            class="resume-template resume-template-modern"
          >
            <header class="resume-header">
              <div class="d-flex ga-3 align-start">
                <v-avatar
                  v-if="profileResumeIdentity.avatar"
                  size="76"
                  class="resume-avatar"
                >
                  <v-img
                    :src="profileResumeIdentity.avatar"
                    :alt="profileResumeIdentity.completeName"
                  />
                </v-avatar>
                <v-avatar
                  v-else
                  size="76"
                  color="primary"
                  class="resume-avatar"
                >
                  {{
                    profileResumeIdentity.completeName.slice(0, 2).toUpperCase()
                  }}
                </v-avatar>
                <h2 class="resume-name">
                  {{ profileResumeIdentity.completeName }}
                </h2>
              </div>
              <div class="resume-header-main">
                <p class="resume-role">
                  {{ profileResumeIdentity.title }}
                </p>
                <p class="resume-meta mb-0">
                  {{ profileResumeIdentity.summary }}
                </p>
              </div>
              <div class="text-body-2 resume-contact-card">
                <p v-if="profileResumeIdentity.location" class="mb-1">
                  {{ profileResumeIdentity.location }}
                </p>
                <p v-if="profileResumeIdentity.phone" class="mb-1">
                  {{ profileResumeIdentity.phone }}
                </p>
                <p v-if="profileResumeIdentity.email" class="mb-0">
                  {{ profileResumeIdentity.email }}
                </p>
                <p v-if="profileResumeIdentity.homepage" class="mb-0">
                  {{ profileResumeIdentity.homepage }}
                </p>
                <p v-if="profileResumeIdentity.repoProfile" class="mb-0">
                  {{ profileResumeIdentity.repoProfile }}
                </p>
              </div>
            </header>
            <section class="resume-grid">
              <div>
                <section
                  v-for="entry in resumeSectionEntries.filter((entry) =>
                    [
                      'experiences',
                      'educations',
                      'projects',
                      'certifications',
                    ].includes(entry.key),
                  )"
                  :key="entry.key"
                  class="resume-block"
                >
                  <h3>{{ entry.label }}</h3>
                  <template v-if="hasSectionData(selectedResume, entry.key)">
                    <div
                      v-for="item in selectedResume[entry.key]"
                      :key="item.id || `${entry.key}-${item.title}`"
                      class="resume-line"
                    >
                      <p class="font-weight-bold mb-1">{{ item.title }}</p>
                      <p
                        v-if="formatResumeDateRange(item)"
                        class="mb-1 text-caption"
                      >
                        {{ formatResumeDateRange(item) }}
                      </p>
                      <p v-if="sectionMeta(item)" class="mb-1 text-caption">
                        {{ sectionMeta(item) }}
                      </p>
                      <p class="mb-0">{{ item.description }}</p>
                      <p v-if="item.home_page" class="mb-0 text-caption">
                        {{ item.home_page }}
                      </p>
                      <p
                        v-if="item.attachments?.length"
                        class="mb-0 text-caption"
                      >
                        Attachments: {{ item.attachments.join(', ') }}
                      </p>
                    </div>
                  </template>
                  <p v-else class="text-medium-emphasis mb-0">Empty</p>
                </section>
              </div>
              <div>
                <section
                  v-for="entry in resumeSectionEntries.filter((entry) =>
                    ['skills', 'languages', 'hobbies', 'references'].includes(
                      entry.key,
                    ),
                  )"
                  :key="entry.key"
                  class="resume-block"
                >
                  <h3>{{ entry.label }}</h3>
                  <template v-if="hasSectionData(selectedResume, entry.key)">
                    <ul class="resume-list">
                      <li
                        v-for="item in selectedResume[entry.key]"
                        :key="item.id || `${entry.key}-${item.title}`"
                      >
                        <span class="font-weight-medium">{{ item.title }}</span>
                        <span v-if="item.description">
                          — {{ item.description }}</span
                        >
                        <span v-if="formatResumeDateRange(item)">
                          ({{ formatResumeDateRange(item) }})</span
                        >
                        <span v-if="sectionMeta(item)">
                          • {{ sectionMeta(item) }}</span
                        >
                      </li>
                    </ul>
                  </template>
                  <p v-else class="text-medium-emphasis mb-0">Empty</p>
                </section>
              </div>
            </section>
          </article>

          <article
            v-else-if="selectedResumeTemplate === 'elegant'"
            class="resume-template resume-template-elegant"
          >
            <header class="resume-header text-center">
              <div class="d-flex flex-column align-center mb-3">
                <v-avatar
                  v-if="profileResumeIdentity.avatar"
                  size="90"
                  class="resume-avatar-elegant mb-3"
                >
                  <v-img
                    :src="profileResumeIdentity.avatar"
                    :alt="profileResumeIdentity.completeName"
                  />
                </v-avatar>
                <v-avatar
                  v-else
                  size="90"
                  color="brown-lighten-1"
                  class="resume-avatar-elegant mb-3"
                >
                  {{
                    profileResumeIdentity.completeName.slice(0, 2).toUpperCase()
                  }}
                </v-avatar>
              </div>
              <h2 class="resume-name">
                {{ profileResumeIdentity.completeName }}
              </h2>
              <p class="resume-role">
                {{ profileResumeIdentity.title }}
              </p>
              <p class="resume-meta mb-0">
                {{
                  [
                    profileResumeIdentity.location,
                    profileResumeIdentity.phone,
                    profileResumeIdentity.email,
                  ]
                    .filter(Boolean)
                    .join(' • ')
                }}
              </p>
              <p class="resume-meta mb-0">
                {{
                  [
                    profileResumeIdentity.homepage,
                    profileResumeIdentity.repoProfile,
                  ]
                    .filter(Boolean)
                    .join(' • ')
                }}
              </p>
            </header>
            <section class="resume-block">
              <h3>Professional Summary</h3>
              <p class="mb-0">{{ profileResumeIdentity.summary }}</p>
            </section>
            <section
              v-for="entry in resumeSectionEntries"
              :key="`elegant-${entry.key}`"
              class="resume-block"
            >
              <h3>{{ entry.label }}</h3>
              <template v-if="hasSectionData(selectedResume, entry.key)">
                <div
                  v-for="item in selectedResume[entry.key]"
                  :key="item.id || `${entry.key}-${item.title}`"
                  class="resume-line"
                >
                  <p class="font-weight-bold mb-1">{{ item.title }}</p>
                  <p
                    v-if="formatResumeDateRange(item)"
                    class="mb-1 text-caption"
                  >
                    {{ formatResumeDateRange(item) }}
                  </p>
                  <p v-if="sectionMeta(item)" class="mb-1 text-caption">
                    {{ sectionMeta(item) }}
                  </p>
                  <p class="mb-0">{{ item.description }}</p>
                  <p v-if="item.home_page" class="mb-0 text-caption">
                    {{ item.home_page }}
                  </p>
                  <p v-if="item.attachments?.length" class="mb-0 text-caption">
                    Attachments: {{ item.attachments.join(', ') }}
                  </p>
                </div>
              </template>
              <p v-else class="text-medium-emphasis mb-0">Empty</p>
            </section>
          </article>

          <article v-else class="resume-template resume-template-compact">
            <header class="resume-header">
              <div class="d-flex ga-3 align-center">
                <v-avatar
                  v-if="profileResumeIdentity.avatar"
                  size="64"
                  class="resume-avatar"
                >
                  <v-img
                    :src="profileResumeIdentity.avatar"
                    :alt="profileResumeIdentity.completeName"
                  />
                </v-avatar>
                <v-avatar
                  v-else
                  size="64"
                  color="blue-grey"
                  class="resume-avatar"
                >
                  {{
                    profileResumeIdentity.completeName.slice(0, 2).toUpperCase()
                  }}
                </v-avatar>
                <h2 class="resume-name">
                  {{ profileResumeIdentity.completeName }}
                </h2>
              </div>
              <p class="resume-role">{{ profileResumeIdentity.title }}</p>
              <p class="resume-meta mb-0">
                {{
                  [
                    profileResumeIdentity.location,
                    profileResumeIdentity.phone,
                    profileResumeIdentity.email,
                  ]
                    .filter(Boolean)
                    .join(' | ')
                }}
              </p>
              <p class="resume-meta mb-0">
                {{
                  [
                    profileResumeIdentity.homepage,
                    profileResumeIdentity.repoProfile,
                  ]
                    .filter(Boolean)
                    .join(' | ')
                }}
              </p>
            </header>
            <section class="resume-block">
              <h3>Summary</h3>
              <p class="mb-0">{{ profileResumeIdentity.summary }}</p>
            </section>
            <v-row>
              <v-col
                v-for="entry in resumeSectionEntries"
                :key="`compact-${entry.key}`"
                cols="12"
                md="6"
              >
                <section class="resume-block h-100">
                  <h3>{{ entry.label }}</h3>
                  <template v-if="hasSectionData(selectedResume, entry.key)">
                    <ul class="resume-list">
                      <li
                        v-for="item in selectedResume[entry.key]"
                        :key="item.id || `${entry.key}-${item.title}`"
                      >
                        <span class="font-weight-medium">{{ item.title }}</span>
                        <span v-if="item.description">
                          — {{ item.description }}</span
                        >
                        <span v-if="formatResumeDateRange(item)">
                          ({{ formatResumeDateRange(item) }})</span
                        >
                        <span v-if="sectionMeta(item)">
                          • {{ sectionMeta(item) }}</span
                        >
                        <span v-if="item.home_page">
                          • {{ item.home_page }}</span
                        >
                        <span v-if="item.attachments?.length">
                          • {{ item.attachments.join(', ') }}</span
                        >
                      </li>
                    </ul>
                  </template>
                  <p v-else class="text-medium-emphasis mb-0">Empty</p>
                </section>
              </v-col>
            </v-row>
          </article>
        </div>
      </div>
    </AppModal>

    <AppModal v-model="resumeCreateOpen" title="Create new CV" :max-width="980">
      <v-row v-if="resumeCreateStep === 'choice'">
        <v-col cols="12" md="6">
          <v-card
            class="postcard-gradient-card h-100"
            @click="resumeCreateStep = 'upload'"
          >
            <v-card-text class="text-center py-10">
              <v-icon icon="mdi-file-upload-outline" size="42" class="mb-3" />
              <h3 class="text-h6 mb-2">Upload PDF</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Importer directement ton CV en PDF.
              </p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card
            class="postcard-gradient-card h-100"
            @click="resumeCreateStep = 'manual'"
          >
            <v-card-text class="text-center py-10">
              <v-icon icon="mdi-form-select" size="42" class="mb-3" />
              <h3 class="text-h6 mb-2">Create manually</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Renseigne les sections (experience, skills, projects...).
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <div
        v-else-if="resumeCreateStep === 'upload'"
        class="resume-upload-panel"
      >
        <v-file-upload
          v-model="resumeUploadFile"
          label="Upload CV file (PDF)"
          accept="application/pdf"
          clearable
          density="default"
        />
        <div class="d-flex ga-2 justify-end">
          <v-btn variant="tonal" @click="resumeCreateStep = 'choice'"
            >Back</v-btn
          >
          <v-btn
            color="primary"
            variant="tonal"
            :loading="createLoading"
            :disabled="!resumeUploadFile"
            @click="createResumeFromUpload"
          >
            Save PDF CV
          </v-btn>
        </div>
      </div>

      <div v-else class="manual-resume-form">
        <div
          v-for="entry in resumeSectionEntries"
          :key="entry.key"
          class="manual-section mb-5"
        >
          <div class="d-flex align-center justify-space-between mb-3">
            <h4 class="text-subtitle-1 font-weight-bold mb-0">
              {{ entry.label }}
            </h4>
            <v-btn
              size="small"
              variant="tonal"
              prepend-icon="mdi-plus"
              @click="addResumeLine(entry.key)"
            >
              Add line
            </v-btn>
          </div>
          <v-card
            v-for="(line, index) in resumeForm[entry.key]"
            :key="`${entry.key}-${index}`"
            class="mb-2 postcard-gradient-card"
            variant="tonal"
            rounded="lg"
          >
            <v-card-text class="manual-section-card-text">
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="line.title"
                    label="Title"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="line.description"
                    label="Description"
                    variant="outlined"
                  />
                </v-col>
                <v-col
                  v-if="hasSectionField(entry.key, 'startDate')"
                  cols="12"
                  md="2"
                >
                  <v-text-field
                    v-model="line.startDate"
                    label="Start date"
                    placeholder="YYYY-MM-DD"
                    variant="outlined"
                  />
                </v-col>
                <v-col
                  v-if="hasSectionField(entry.key, 'endDate')"
                  cols="12"
                  md="2"
                >
                  <v-text-field
                    v-model="line.endDate"
                    label="End date"
                    placeholder="YYYY-MM-DD"
                    variant="outlined"
                  />
                </v-col>
                <v-col
                  v-if="hasSectionField(entry.key, 'company')"
                  cols="12"
                  md="3"
                >
                  <v-text-field
                    v-model="line.company"
                    label="Company"
                    variant="outlined"
                  />
                </v-col>
                <v-col
                  v-if="hasSectionField(entry.key, 'school')"
                  cols="12"
                  md="3"
                >
                  <v-text-field
                    v-model="line.school"
                    label="School"
                    variant="outlined"
                  />
                </v-col>
                <v-col
                  v-if="hasSectionField(entry.key, 'location')"
                  cols="12"
                  md="3"
                >
                  <v-text-field
                    v-model="line.location"
                    label="Location"
                    variant="outlined"
                  />
                </v-col>
                <v-col
                  v-if="hasSectionField(entry.key, 'level')"
                  cols="12"
                  md="2"
                >
                  <AppSelect
                    v-model="line.level"
                    :items="resumeLevelOptions"
                    :label="levelFieldLabel(entry.key)"
                    variant="outlined"
                    clearable
                  />
                </v-col>
                <v-col
                  v-if="hasSectionField(entry.key, 'countryCode')"
                  cols="12"
                  md="2"
                >
                  <v-text-field
                    v-model="line.countryCode"
                    label="Country code"
                    placeholder="FR, US, ES..."
                    variant="outlined"
                  />
                </v-col>
                <v-col
                  v-if="hasSectionField(entry.key, 'flag')"
                  cols="12"
                  md="2"
                >
                  <v-text-field
                    v-model="line.flag"
                    label="Flag"
                    placeholder="🇫🇷 or URL"
                    variant="outlined"
                  />
                </v-col>
                <v-col
                  v-if="hasSectionField(entry.key, 'home_page')"
                  cols="12"
                  md="10"
                >
                  <v-text-field
                    v-model="line.home_page"
                    label="Home page URL"
                    variant="outlined"
                  />
                </v-col>
                <v-col
                  v-if="hasSectionField(entry.key, 'attachments')"
                  cols="12"
                  md="11"
                >
                  <v-file-upload
                    v-model="line.attachmentFiles"
                    label="Attachments files"
                    multiple
                    clearable
                    density="default"
                    hint="Upload files (PDF/JPG/PNG...)"
                    persistent-hint
                  />
                  <p
                    v-if="line.attachments?.length"
                    class="text-caption text-medium-emphasis mt-1 mb-0"
                  >
                    Existing files: {{ line.attachments.join(', ') }}
                  </p>
                </v-col>
                <v-col cols="12" md="1" class="d-flex align-center">
                  <v-btn
                    size="small"
                    icon="mdi-delete-outline"
                    variant="text"
                    color="error"
                    @click="removeResumeLine(entry.key, index)"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
        <div class="d-flex ga-2 justify-end">
          <v-btn variant="tonal" @click="resumeCreateStep = 'choice'"
            >Back</v-btn
          >
          <v-btn
            color="primary"
            variant="tonal"
            :loading="createLoading"
            @click="createResumeFromManual"
          >
            Save manual CV
          </v-btn>
        </div>
      </div>
    </AppModal>

    <AppModal v-model="resumeEditorOpen" title="Edit CV" :max-width="980">
      <div
        v-for="entry in resumeSectionEntries"
        :key="`editor-${entry.key}`"
        class="manual-section mb-4"
      >
        <div class="d-flex align-center justify-space-between mb-2">
          <h4 class="text-subtitle-1 font-weight-bold mb-0">
            {{ entry.label }}
          </h4>
          <v-btn size="small" variant="tonal" @click="addResumeLine(entry.key)"
            >Add</v-btn
          >
        </div>
        <v-card
          v-for="(line, index) in resumeForm[entry.key]"
          :key="`editor-${entry.key}-${index}`"
          variant="tonal"
          class="mb-2 postcard-gradient-card"
        >
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4"
                ><v-text-field v-model="line.title" label="Title"
              /></v-col>
              <v-col cols="12" md="4"
                ><v-text-field v-model="line.description" label="Description"
              /></v-col>
              <v-col
                v-if="hasSectionField(entry.key, 'startDate')"
                cols="12"
                md="2"
                ><v-text-field
                  v-model="line.startDate"
                  label="Start date"
                  placeholder="YYYY-MM-DD"
              /></v-col>
              <v-col
                v-if="hasSectionField(entry.key, 'endDate')"
                cols="12"
                md="2"
                ><v-text-field
                  v-model="line.endDate"
                  label="End date"
                  placeholder="YYYY-MM-DD"
              /></v-col>
              <v-col
                v-if="hasSectionField(entry.key, 'company')"
                cols="12"
                md="3"
                ><v-text-field v-model="line.company" label="Company"
              /></v-col>
              <v-col
                v-if="hasSectionField(entry.key, 'school')"
                cols="12"
                md="3"
                ><v-text-field v-model="line.school" label="School"
              /></v-col>
              <v-col
                v-if="hasSectionField(entry.key, 'location')"
                cols="12"
                md="3"
                ><v-text-field v-model="line.location" label="Location"
              /></v-col>
              <v-col
                v-if="hasSectionField(entry.key, 'level')"
                cols="12"
                md="2"
              >
                <AppSelect
                  v-model="line.level"
                  :items="resumeLevelOptions"
                  :label="levelFieldLabel(entry.key)"
                  clearable
                />
              </v-col>
              <v-col
                v-if="hasSectionField(entry.key, 'countryCode')"
                cols="12"
                md="2"
                ><v-text-field
                  v-model="line.countryCode"
                  label="Country code"
                  placeholder="FR, US, ES..."
              /></v-col>
              <v-col
                v-if="hasSectionField(entry.key, 'flag')"
                cols="12"
                md="2"
                ><v-text-field
                  v-model="line.flag"
                  label="Flag"
                  placeholder="🇫🇷 or URL"
              /></v-col>
              <v-col
                v-if="hasSectionField(entry.key, 'home_page')"
                cols="12"
                md="10"
                ><v-text-field v-model="line.home_page" label="Home page URL"
              /></v-col>
              <v-col
                v-if="hasSectionField(entry.key, 'attachments')"
                cols="12"
                md="11"
              >
                <v-file-upload
                  v-model="line.attachmentFiles"
                  label="Attachments files"
                  multiple
                  clearable
                  density="default"
                  hint="Upload files (PDF/JPG/PNG...)"
                  persistent-hint
                />
                <p
                  v-if="line.attachments?.length"
                  class="text-caption text-medium-emphasis mt-1 mb-0"
                >
                  Existing files: {{ line.attachments.join(', ') }}
                </p>
              </v-col>
              <v-col cols="12" md="1" class="d-flex align-center">
                <v-btn
                  icon="mdi-delete-outline"
                  size="small"
                  color="error"
                  variant="text"
                  @click="removeResumeLine(entry.key, index)"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
      <div class="d-flex justify-end">
        <v-btn
          color="primary"
          variant="tonal"
          :loading="updateLoading"
          @click="updateResume"
        >
          Save changes
        </v-btn>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.coin-products-row {
  row-gap: 12px;
}

.coin-product-card {
  border-color: rgba(255, 255, 255, 0.16);
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.01)
  );
}

.coin-product-image {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.resume-card {
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.resume-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.18);
}

.resume-template-shell {
  --resume-space-xs: 8px;
  --resume-space-sm: 12px;
  --resume-space-md: 16px;
  --resume-space-lg: 24px;
  max-height: 75vh;
  overflow: auto;
  padding-right: var(--resume-space-xs);
  padding-bottom: var(--resume-space-md);
}

.resume-template-picker {
  display: flex;
  justify-content: flex-end;
}

.resume-template-toggle {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
}

.resume-template {
  border-radius: 18px;
  padding: var(--resume-space-lg);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: 0 16px 35px rgba(16, 24, 40, 0.08);
}

.resume-template-modern {
  background: linear-gradient(180deg, #fbfcff 0%, #f5f8ff 100%);
  color: #16264a;
}

.resume-template-elegant {
  background: linear-gradient(180deg, #fcf7f3 0%, #fdfaf7 100%);
  color: #35231d;
}

.resume-template-compact {
  background: linear-gradient(180deg, #fcfdff 0%, #f6f9ff 100%);
  color: #172536;
}

.resume-template-elegant .resume-role {
  color: rgba(67, 43, 34, 0.9);
}

.resume-template-elegant .resume-meta {
  color: rgba(67, 43, 34, 0.8);
}

.resume-header {
  border-bottom: 2px solid rgba(86, 106, 156, 0.35);
  margin-bottom: var(--resume-space-lg);
  padding-bottom: var(--resume-space-md);
  display: flex;
  justify-content: space-between;
  gap: var(--resume-space-md);
  flex-wrap: wrap;
}

.resume-avatar,
.resume-avatar-elegant {
  border: 3px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.resume-header-main {
  flex: 1;
  min-width: 240px;
}

.resume-name {
  font-size: clamp(1.45rem, 2.2vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0.01em;
  margin: 0 0 6px;
  color: inherit;
}

.resume-role {
  font-size: 1.03rem;
  font-weight: 650;
  line-height: 1.35;
  margin: 0 0 8px;
  color: rgba(24, 42, 78, 0.92);
}

.resume-meta {
  font-size: 0.92rem;
  line-height: 1.5;
  color: rgba(24, 42, 78, 0.8);
}

.resume-contact-card {
  min-width: 200px;
  border-radius: 12px;
  border: 1px solid rgba(85, 104, 148, 0.3);
  background: rgba(255, 255, 255, 0.96);
  color: #1a2a4f;
  padding: var(--resume-space-md);
}

.resume-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--resume-space-md);
}

.resume-block {
  margin-bottom: var(--resume-space-lg);
  border-radius: 12px;
  padding: var(--resume-space-md);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(84, 104, 150, 0.28);
  color: #1a2a4d;
}

.resume-block h3 {
  text-transform: uppercase;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  line-height: 1.35;
  margin: 0 0 var(--resume-space-md);
  color: rgba(17, 35, 70, 0.92);
}

.resume-line {
  margin-bottom: var(--resume-space-md);
  padding-bottom: var(--resume-space-sm);
  line-height: 1.5;
  border-bottom: 1px dashed rgba(78, 97, 140, 0.42);
  color: #25365d;
}

.resume-line p {
  margin: 0;
}

.resume-line p + p {
  margin-top: var(--resume-space-xs);
}

.resume-line:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.resume-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.5;
}

.resume-upload-panel,
.manual-resume-form {
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(
    160deg,
    rgba(73, 108, 255, 0.08) 0%,
    rgba(159, 108, 255, 0.05) 100%
  );
}

.manual-section {
  border-radius: 14px;
  padding: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  background: rgba(13, 17, 33, 0.14);
}

.manual-section-card-text {
  padding-bottom: 8px;
}

@media (max-width: 960px) {
  .resume-template {
    padding: var(--resume-space-md);
  }

  .resume-template-picker {
    justify-content: stretch;
  }

  .resume-template-toggle {
    width: 100%;
  }

  .resume-grid {
    grid-template-columns: 1fr;
  }
}
</style>
