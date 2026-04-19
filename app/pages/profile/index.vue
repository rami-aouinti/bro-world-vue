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

const { t, locale } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const { fetch: refreshSession, user } = useUserSession()
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
const selectedProvider = ref<'stripe' | 'paypal'>('stripe')
const transactionState = ref<TransactionState>('idle')
const transactionMessage = ref('')
const buyCoinsStep = ref<BuyCoinsStep>('product')
const receipts = ref<CoinsReceipt[]>([])
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
const resumeForm = reactive<Record<ResumeSectionKey, RecruitResumeSection[]>>({
  experiences: [{ title: '', description: '' }],
  educations: [{ title: '', description: '' }],
  skills: [{ title: '', description: '' }],
  languages: [{ title: '', description: '' }],
  certifications: [{ title: '', description: '' }],
  projects: [{ title: '', description: '' }],
  references: [{ title: '', description: '' }],
  hobbies: [{ title: '', description: '' }],
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
const hasCoinProducts = computed(() => coinProducts.value.length > 0)
const hasResumes = computed(() => resumes.value.length > 0)
const resumeTemplateOptions = [
  { value: 'modern', label: 'Template 1' },
  { value: 'elegant', label: 'Template 2' },
  { value: 'compact', label: 'Template 3' },
] as const
const resumeSectionEntries = computed(() => [
  { key: 'experiences', label: 'Experiences' },
  { key: 'educations', label: 'Educations' },
  { key: 'skills', label: 'Skills' },
  { key: 'languages', label: 'Languages' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'projects', label: 'Projects' },
  { key: 'references', label: 'References' },
  { key: 'hobbies', label: 'Hobbies' },
] as Array<{ key: ResumeSectionKey; label: string }>)
const profileResumeIdentity = computed(() => {
  const currentProfile = profile.value
  const completeName =
    [currentProfile?.firstName, currentProfile?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || currentProfile?.username || 'Anonymous Member'
  const title = currentProfile?.profile?.title || 'Professional Profile'
  const location = currentProfile?.profile?.location || ''
  const email = currentProfile?.email || ''
  const phone = currentProfile?.profile?.phone || ''
  const summary =
    currentProfile?.profile?.information ||
    'Experienced and motivated professional focused on delivering results.'

  return {
    completeName,
    title,
    location,
    email,
    phone,
    summary,
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
const isBusy = computed(() => loading.value || shopPending.value)
const canConfirmCart = computed(
  () => !!selectedProduct.value && transactionState.value !== 'pending',
)
const canPay = computed(() => {
  if (!checkout.value) {
    return false
  }

  return (
    transactionState.value !== 'pending' &&
    checkout.value.status !== 'failed' &&
    checkout.value.status !== 'paid'
  )
})
const transactionTone = computed<'info' | 'success' | 'error' | 'warning'>(
  () => {
    if (transactionState.value === 'success') {
      return 'success'
    }

    if (transactionState.value === 'failure') {
      return 'error'
    }

    if (transactionState.value === 'cancelled') {
      return 'warning'
    }

    return 'info'
  },
)
const transactionLabel = computed(() => {
  if (transactionState.value === 'pending') {
    return t('pages.profile.buyCoins.transaction.pending')
  }

  if (transactionState.value === 'success') {
    return t('pages.profile.buyCoins.transaction.success')
  }

  if (transactionState.value === 'failure') {
    return t('pages.profile.buyCoins.transaction.failure')
  }

  if (transactionState.value === 'cancelled') {
    return t('pages.profile.buyCoins.transaction.cancelled')
  }

  return t('pages.profile.buyCoins.transaction.idle')
})
const flowItems = computed(() => [
  { title: t('pages.profile.buyCoins.flow.product'), value: 'product' },
  {
    title: t('pages.profile.buyCoins.flow.confirmation'),
    value: 'confirmation',
  },
  { title: t('pages.profile.buyCoins.flow.payment'), value: 'payment' },
  { title: t('pages.profile.buyCoins.flow.validation'), value: 'validation' },
])
const checkoutAmountLabel = computed(() => {
  const amount = selectedProduct.value?.amount ?? 0
  const currencyCode = selectedProduct.value?.currencyCode || 'USD'
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount)
})

function buildIdempotencyKey(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

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

function normalizeSections(items: RecruitResumeSection[]) {
  return items
    .map((item) => ({
      title: item.title.trim(),
      description: (item.description || '').trim(),
    }))
    .filter((item) => item.title)
}

function populateResumeFormFromResume(resume: RecruitResume) {
  resumeSectionEntries.value.forEach(({ key }) => {
    const values = resume[key]
    resumeForm[key] = values.length
      ? values.map((item) => ({
          id: item.id,
          title: item.title || '',
          description: item.description || '',
        }))
      : [{ title: '', description: '' }]
  })
}

function resetResumeForm() {
  resumeSectionEntries.value.forEach(({ key }) => {
    resumeForm[key] = [{ title: '', description: '' }]
  })
}

function addResumeLine(section: ResumeSectionKey) {
  resumeForm[section].push({ title: '', description: '' })
}

function removeResumeLine(section: ResumeSectionKey, index: number) {
  resumeForm[section].splice(index, 1)
  if (resumeForm[section].length === 0) {
    resumeForm[section].push({ title: '', description: '' })
  }
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
      '/api/recruit/general/private/me/resumes',
    )
  } catch {
    resumesError.value = 'Impossible de charger vos CV.'
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
      '/api/recruit/general/resumes',
      { method: 'POST', body: formData },
    )
    resumes.value = [
      {
        id: created.id,
        documentUrl: created.documentUrl,
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
    resumesError.value = "Impossible d'ajouter le CV PDF."
  } finally {
    createLoading.value = false
  }
}

async function createResumeFromManual() {
  createLoading.value = true
  resumesError.value = ''
  try {
    const body = Object.fromEntries(
      resumeSectionEntries.value
        .map(({ key }) => [key, normalizeSections(resumeForm[key])] as const)
        .filter(([, value]) => value.length > 0),
    )

    const created = await $fetch<{ id: string; documentUrl: string | null }>(
      '/api/recruit/general/resumes',
      { method: 'POST', body },
    )

    resumes.value = [
      {
        id: created.id,
        documentUrl: null,
        experiences: (body.experiences as RecruitResumeSection[]) || [],
        educations: (body.educations as RecruitResumeSection[]) || [],
        skills: (body.skills as RecruitResumeSection[]) || [],
        languages: (body.languages as RecruitResumeSection[]) || [],
        certifications: (body.certifications as RecruitResumeSection[]) || [],
        projects: (body.projects as RecruitResumeSection[]) || [],
        references: (body.references as RecruitResumeSection[]) || [],
        hobbies: (body.hobbies as RecruitResumeSection[]) || [],
      },
      ...resumes.value,
    ]
    resetResumeForm()
    resumeCreateOpen.value = false
  } catch {
    resumesError.value = "Impossible de créer le CV manuel."
  } finally {
    createLoading.value = false
  }
}

async function updateResume() {
  if (!selectedResume.value || selectedResume.value.documentUrl) return
  updateLoading.value = true
  resumesError.value = ''
  try {
    const body = Object.fromEntries(
      resumeSectionEntries.value
        .map(({ key }) => [key, normalizeSections(resumeForm[key])] as const)
        .filter(([, value]) => value.length > 0),
    )
    await privateApi.request(
      `/api/recruit/general/private/me/resumes/${selectedResume.value.id}`,
      {
        method: 'PATCH',
        body,
      },
    )
    await fetchResumes()
    resumeEditorOpen.value = false
  } catch {
    resumesError.value = 'Modification du CV impossible.'
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

function selectProduct(productId: string) {
  selectedProductId.value = productId
  transactionState.value = 'idle'
  transactionMessage.value = ''
  buyCoinsStep.value = 'confirmation'
}

async function confirmCart() {
  if (!selectedProduct.value) {
    return
  }

  transactionState.value = 'pending'
  transactionMessage.value = t('pages.profile.buyCoins.messages.confirming')
  try {
    const session = await shopStore.createCheckoutSession({
      currency: selectedProduct.value.currencyCode,
      cart: [
        {
          productId: selectedProduct.value.id,
          name: selectedProduct.value.name,
          quantity: 1,
          unitPrice: selectedProduct.value.amount,
        },
      ],
    })
    checkout.value = session
    transactionState.value = 'idle'
    transactionMessage.value = ''
    buyCoinsStep.value = 'payment'
  } catch {
    transactionState.value = 'failure'
    transactionMessage.value = t('pages.profile.buyCoins.messages.confirmError')
  }
}

async function startPayment() {
  if (!checkout.value) {
    return
  }

  transactionState.value = 'pending'
  transactionMessage.value = t('pages.profile.buyCoins.messages.paymentPending')

  try {
    const productSnapshot = selectedProduct.value
    if (!productSnapshot) {
      transactionState.value = 'failure'
      transactionMessage.value = t(
        'pages.profile.buyCoins.messages.paymentFailed',
      )
      return
    }

    const intent = await shopStore.createPaymentIntent({
      checkoutId: checkout.value.id,
      provider: selectedProvider.value,
      idempotencyKey: buildIdempotencyKey('coins_payment'),
    })

    const paymentId =
      intent.attempt.providerPaymentId ||
      intent.checkout.providerPaymentId ||
      `manual_${intent.attempt.id}`

    const confirmedCheckout = await shopStore.confirmPayment({
      checkoutId: intent.checkout.id,
      providerPaymentId: paymentId,
      idempotencyKey: buildIdempotencyKey('coins_confirm'),
    })

    checkout.value = confirmedCheckout
    buyCoinsStep.value = 'validation'

    if (confirmedCheckout.status === 'paid') {
      transactionState.value = 'success'
      transactionMessage.value = t(
        'pages.profile.buyCoins.messages.paymentSuccess',
      )

      await Promise.all([refreshSession(), fetchProfile(true)])
      const sessionUser = user.value as SessionUser | null
      if (typeof sessionUser?.coins === 'number') {
        profileStore.setCoins(sessionUser.coins)
      }

      const nextReceipt: CoinsReceipt = {
        id: confirmedCheckout.id,
        createdAt: new Date().toISOString(),
        status: 'success',
        productName: productSnapshot.name,
        coinsAmount: productSnapshot.coinsAmount,
        amount: confirmedCheckout.totalAmount,
        currency: confirmedCheckout.currency,
      }
      receipts.value = [nextReceipt, ...receipts.value].slice(0, 8)
      return
    }

    if (confirmedCheckout.status === 'failed') {
      transactionState.value = 'failure'
      transactionMessage.value = t(
        'pages.profile.buyCoins.messages.paymentFailed',
      )
      return
    }

    transactionState.value = 'cancelled'
    transactionMessage.value = t(
      'pages.profile.buyCoins.messages.paymentCancelled',
    )
  } catch {
    transactionState.value = 'failure'
    transactionMessage.value = t(
      'pages.profile.buyCoins.messages.paymentFailed',
    )
  }
}

function cancelPurchase() {
  transactionState.value = 'cancelled'
  transactionMessage.value = t(
    'pages.profile.buyCoins.messages.paymentCancelled',
  )
  buyCoinsStep.value = 'validation'
}

function formatReceiptAmount(receipt: CoinsReceipt) {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: receipt.currency,
    maximumFractionDigits: 2,
  }).format(receipt.amount)
}

function formatProductAmount(product: ShopGeneralProduct) {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: product.currencyCode,
    maximumFractionDigits: 2,
  }).format(product.amount)
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
      <template #left>
        <ProfileDrawer />
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
                @{{ profile.username }}
              </p>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ profile.email }}
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
              @click="resumeCreateOpen = true; resumeCreateStep = 'choice'"
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
              title="Aucun CV pour le moment"
              text="Ajoute un CV PDF ou crée-le manuellement."
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
                          ? 'Clique pour prévisualiser le PDF.'
                          : 'Clique pour voir les sections du CV.'
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

    <AppModal v-model="resumeViewerOpen" title="Détail CV" :max-width="980">
      <div v-if="selectedResume">
          <iframe
            v-if="selectedResume.documentUrl"
            :src="selectedResume.documentUrl"
            style="width: 100%; height: 72vh; border: none; border-radius: 12px"
            title="Resume PDF preview"
          />
          <div v-else class="resume-template-shell">
            <div class="d-flex justify-end mb-4">
              <v-btn-toggle
                v-model="selectedResumeTemplate"
                mandatory
                density="comfortable"
                color="primary"
                variant="outlined"
              >
                <v-btn
                  v-for="option in resumeTemplateOptions"
                  :key="option.value"
                  :value="option.value"
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
                <div>
                  <h2 class="text-h4 font-weight-bold mb-1">{{ profileResumeIdentity.completeName }}</h2>
                  <p class="text-subtitle-1 mb-2">{{ profileResumeIdentity.title }}</p>
                  <p class="mb-0">{{ profileResumeIdentity.summary }}</p>
                </div>
                <div class="text-body-2">
                  <p v-if="profileResumeIdentity.location" class="mb-1">{{ profileResumeIdentity.location }}</p>
                  <p v-if="profileResumeIdentity.phone" class="mb-1">{{ profileResumeIdentity.phone }}</p>
                  <p v-if="profileResumeIdentity.email" class="mb-0">{{ profileResumeIdentity.email }}</p>
                </div>
              </header>
              <section class="resume-grid">
                <div>
                  <section
                    v-for="entry in resumeSectionEntries.filter((entry) => ['experiences', 'educations', 'projects', 'certifications'].includes(entry.key))"
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
                        <p class="mb-0">{{ item.description }}</p>
                      </div>
                    </template>
                    <p v-else class="text-medium-emphasis mb-0">Empty</p>
                  </section>
                </div>
                <div>
                  <section
                    v-for="entry in resumeSectionEntries.filter((entry) => ['skills', 'languages', 'hobbies', 'references'].includes(entry.key))"
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
                          <span v-if="item.description"> — {{ item.description }}</span>
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
                <h2 class="text-h3 font-weight-bold mb-2">{{ profileResumeIdentity.completeName }}</h2>
                <p class="text-subtitle-1 mb-2">{{ profileResumeIdentity.title }}</p>
                <p class="mb-0">
                  {{ [profileResumeIdentity.location, profileResumeIdentity.phone, profileResumeIdentity.email].filter(Boolean).join(' • ') }}
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
                    <p class="mb-0">{{ item.description }}</p>
                  </div>
                </template>
                <p v-else class="text-medium-emphasis mb-0">Empty</p>
              </section>
            </article>

            <article v-else class="resume-template resume-template-compact">
              <header class="resume-header">
                <div>
                  <h2 class="text-h4 font-weight-bold mb-1">{{ profileResumeIdentity.completeName }}</h2>
                  <p class="mb-0">{{ profileResumeIdentity.title }}</p>
                </div>
                <p class="mb-0 text-body-2">
                  {{ [profileResumeIdentity.location, profileResumeIdentity.phone, profileResumeIdentity.email].filter(Boolean).join(' | ') }}
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
                          <span v-if="item.description"> — {{ item.description }}</span>
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
              <v-card class="postcard-gradient-card h-100" @click="resumeCreateStep = 'upload'">
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
              <v-card class="postcard-gradient-card h-100" @click="resumeCreateStep = 'manual'">
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

      <div v-else-if="resumeCreateStep === 'upload'">
        <v-file-input
          v-model="resumeUploadFile"
          label="Upload CV file (PDF)"
          accept="application/pdf"
          prepend-icon="mdi-paperclip"
          variant="outlined"
        />
        <div class="d-flex ga-2 justify-end">
          <v-btn variant="tonal" @click="resumeCreateStep = 'choice'">Back</v-btn>
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

      <div v-else>
        <div v-for="entry in resumeSectionEntries" :key="entry.key" class="mb-5">
          <div class="d-flex align-center justify-space-between mb-2">
            <h4 class="text-subtitle-1">{{ entry.label }}</h4>
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
            <v-card-text>
              <v-row>
                <v-col cols="12" md="5">
                  <v-text-field v-model="line.title" label="Title" variant="outlined" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="line.description"
                    label="Description"
                    variant="outlined"
                  />
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
          <v-btn variant="tonal" @click="resumeCreateStep = 'choice'">Back</v-btn>
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
      <div v-for="entry in resumeSectionEntries" :key="`editor-${entry.key}`" class="mb-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <h4 class="text-subtitle-1">{{ entry.label }}</h4>
              <v-btn size="small" variant="tonal" @click="addResumeLine(entry.key)">Add</v-btn>
            </div>
            <v-card
              v-for="(line, index) in resumeForm[entry.key]"
              :key="`editor-${entry.key}-${index}`"
              variant="tonal"
              class="mb-2 postcard-gradient-card"
            >
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="5"><v-text-field v-model="line.title" label="Title" /></v-col>
                  <v-col cols="12" md="6"><v-text-field v-model="line.description" label="Description" /></v-col>
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
        <v-btn color="primary" variant="tonal" :loading="updateLoading" @click="updateResume">
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
  max-height: 75vh;
  overflow: auto;
}

.resume-template {
  border-radius: 16px;
  padding: 20px;
}

.resume-template-modern {
  background: #f5f8ff;
  color: #1d2a52;
}

.resume-template-elegant {
  background: #fff8f4;
  color: #3e2b26;
}

.resume-template-compact {
  background: #f8fbff;
  color: #1e293b;
}

.resume-header {
  border-bottom: 2px solid rgba(106, 125, 175, 0.25);
  margin-bottom: 18px;
  padding-bottom: 12px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.resume-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.resume-block {
  margin-bottom: 14px;
}

.resume-block h3 {
  text-transform: uppercase;
  font-size: 0.86rem;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.resume-line {
  margin-bottom: 8px;
}

.resume-list {
  margin: 0;
  padding-left: 18px;
}

@media (max-width: 960px) {
  .resume-grid {
    grid-template-columns: 1fr;
  }
}
</style>
