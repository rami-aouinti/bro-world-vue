<script setup lang="ts">
import type { PublicPageSlug } from '~~/shared/publicPageSlugs'
import { useWorldLearningStore } from '~/stores/worldLearning'

definePageMeta({
  layout: 'learning',
  title: 'world.learning.label',
  description: 'world.learning.seo.metaDescription',
})

type LearningPublicReferencePage = {
  description?: string
}

type ReferenceStatus = 'loading' | 'success' | 'unavailable'

// Convention: <module>-<section> slugs are backend-validated public page ids.
const LEARNING_REFERENCE_CONFIG = {
  '/world/learning/courses': {
    publicPageSlug: 'learning-courses',
    fallbackI18nKey: 'world.learning.references.fallback.courses',
  },
  '/world/learning/teachers': {
    publicPageSlug: 'learning-teachers',
    fallbackI18nKey: 'world.learning.references.fallback.teachers',
  },
} as const satisfies Record<string, { publicPageSlug: PublicPageSlug; fallbackI18nKey: string }>

const { locale, t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl || 'https://bro-world-space.com'
const pageUrl = new URL('/world/learning', siteUrl).toString()
const seoImage = new URL('/img/platform/general/learning.png', siteUrl).toString()
const { learningNavItems } = useWorldLearningNavItems()
const publicPagesStore = usePublicPagesStore()

useSeoMeta({
  title: t('world.learning.seo.title', 'Bro World Learning | Learning platform and learner tracking'),
  description: t(
    'world.learning.seo.description',
    'Bro World Learning helps you manage courses, learning paths, analytics, and learner progress.',
  ),
  keywords: t(
    'world.learning.seo.keywords',
    'bro world learning, lms, e-learning platform, online training, learner tracking, learning analytics',
  ),
  robots: 'index, follow, max-image-preview:large',
  ogTitle: t('world.learning.seo.ogTitle', 'Bro World Learning | Learning platform'),
  ogDescription: t(
    'world.learning.seo.ogDescription',
    'Track your courses, performance, and certifications with Bro World Learning.',
  ),
  ogType: 'website',
  ogUrl: pageUrl,
  ogImage: seoImage,
  ogImageAlt: 'Bro World Learning analytics',
  twitterTitle: t('world.learning.seo.twitterTitle', 'Bro World Learning | Learning platform'),
  twitterDescription: t(
    'world.learning.seo.twitterDescription',
    'Track your courses, performance, and certifications with Bro World Learning.',
  ),
  twitterImage: seoImage,
  twitterCard: 'summary_large_image',
})

const learningStore = useWorldLearningStore()
await learningStore.fetchCourses()
await learningStore.fetchAnalytics()

const firstCourseId = computed(() => learningStore.items[0]?.id ?? '')
watch(
  firstCourseId,
  async (courseId) => {
    if (!courseId) return
    await learningStore.fetchProgress(courseId)
  },
  { immediate: true },
)

const analytics = computed(() => learningStore.detail)
const progressItems = computed(() =>
  firstCourseId.value
    ? (learningStore.progressByCourse[firstCourseId.value] ?? [])
    : [],
)
const certifiedCount = computed(
  () => progressItems.value.filter((item) => item.certificate).length,
)

const quickAccessLinks = computed(() => [
  { label: t('world.learning.nav.courses', 'Courses'), to: '/world/learning/courses' },
  { label: t('world.learning.nav.students', 'Students'), to: '/world/learning/students' },
  { label: t('world.learning.nav.exams', 'Exams'), to: '/world/learning/exams' },
])

const referenceStatuses = ref<Record<string, ReferenceStatus>>({})
const referenceDescriptions = ref<Record<string, string>>({})

const referenceNavItems = computed(() =>
  learningNavItems.value.filter((item) => item.to in LEARNING_REFERENCE_CONFIG),
)

const referenceCards = computed(() =>
  referenceNavItems.value.map((item) => {
    const config = LEARNING_REFERENCE_CONFIG[item.to as keyof typeof LEARNING_REFERENCE_CONFIG]
    const status = referenceStatuses.value[item.to] ?? 'loading'
    const fallback = t(config.fallbackI18nKey)

    return {
      ...item,
      status,
      description:
        status === 'success'
          ? referenceDescriptions.value[item.to] ?? fallback
          : fallback,
    }
  }),
)

async function loadReferences() {
  const entries = referenceNavItems.value

  await Promise.all(
    entries.map(async (item) => {
      const config = LEARNING_REFERENCE_CONFIG[item.to as keyof typeof LEARNING_REFERENCE_CONFIG]
      referenceStatuses.value[item.to] = 'loading'

      try {
        const page = await publicPagesStore.fetchPage<LearningPublicReferencePage>(
          config.publicPageSlug,
          locale.value,
        )

        const description =
          typeof page.description === 'string' ? page.description.trim() : ''

        if (description) {
          referenceDescriptions.value[item.to] = description
          referenceStatuses.value[item.to] = 'success'
          return
        }

        referenceStatuses.value[item.to] = 'unavailable'
      } catch {
        referenceStatuses.value[item.to] = 'unavailable'
      }
    }),
  )
}

watch([locale, referenceNavItems], () => {
  loadReferences()
}, { immediate: true })
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.learning.label', 'Learning')"
      module-path="/world/learning"
      module-icon="mdi-school-outline"
      :module-description="t('world.learning.moduleDescription', 'School cards view with linked references')"
      :nav-items="learningNavItems"
      :show-action="false"
      activate-right-drawer
    >
      <template #right>
        <div class="d-flex flex-column ga-4">
          <v-card rounded="xl" variant="tonal" color="primary">
            <div class="pa-4 d-flex ga-3">
              <v-avatar size="56" rounded="xl" color="primary" variant="tonal">
                <v-icon icon="mdi-school-outline" size="28" />
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-subtitle-2 font-weight-bold mb-1">
                  {{ t('world.learning.label', 'Learning') }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ t('world.learning.moduleDescription', 'School cards view with linked references') }}
                </div>
              </div>
            </div>
          </v-card>

          <v-card variant="tonal" color="primary" class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-2">
              {{ t('world.learning.documentation.platformSummaryTitle', 'Platform summary') }}
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip color="primary" variant="tonal" label>
                {{ analytics?.totalLearners ?? 0 }} {{ t('world.learning.kpis.activeLearners') }}
              </v-chip>
              <v-chip color="info" variant="tonal" label>
                {{ analytics?.completionRate ?? 0 }}% {{ t('world.learning.kpis.courseCompletion') }}
              </v-chip>
              <v-chip color="success" variant="tonal" label>
                {{ certifiedCount }} {{ t('world.learning.kpis.certificatesIssued') }}
              </v-chip>
            </div>
          </v-card>

          <v-card variant="tonal" color="primary" class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-2">
              {{ t('world.learning.documentation.quickActionsTitle', 'Quick actions') }}
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="link in quickAccessLinks"
                :key="link.to"
                color="primary"
                variant="tonal"
                label
                :to="link.to"
              >
                {{ link.label }}
              </v-chip>
            </div>
          </v-card>
        </div>
      </template>
    </WorldModuleDrawers>

    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card rounded="xl" class="pa-6 postcard-gradient-card learning-doc-hero">
            <div class="d-flex align-center justify-space-between ga-3 flex-wrap">
              <div>
                <h1 class="text-h5 font-weight-bold mb-2">
                  {{ t('world.learning.documentation.heroTitle', 'Centralize your learning journeys') }}
                </h1>
                <p class="text-body-1 mb-0">
                  {{ t('world.learning.documentation.heroDescription', 'Coordinate courses, learners, and performance from a single operational hub.') }}
                </p>
              </div>
              <v-btn color="primary" prepend-icon="mdi-compass-outline" to="/world/learning/courses">
                {{ t('world.learning.documentation.heroCta', 'Explore courses') }}
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card rounded="xl" class="pa-5 postcard-gradient-card learning-doc-card">
            <div class="d-flex align-center ga-2 mb-3">
              <v-icon icon="mdi-book-open-page-variant-outline" color="primary" />
              <h2 class="text-h6 mb-0">{{ t('world.learning.references.title') }}</h2>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ t('world.learning.references.subtitle') }}
            </p>

            <v-row density="comfortable">
              <v-col
                v-for="reference in referenceCards"
                :key="reference.to"
                cols="12"
                md="6"
              >
                <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
                  <div class="d-flex align-center ga-2 mb-2">
                    <v-icon :icon="reference.icon" color="primary" />
                    <h3 class="text-subtitle-1 mb-0">{{ reference.title }}</h3>
                    <v-spacer />
                    <v-progress-circular
                      v-if="reference.status === 'loading'"
                      size="16"
                      width="2"
                      indeterminate
                      color="primary"
                    />
                  </div>

                  <p class="text-body-2 text-medium-emphasis mb-4">
                    {{ reference.description }}
                  </p>

                  <v-btn
                    color="primary"
                    variant="tonal"
                    append-icon="mdi-arrow-right"
                    :to="reference.to"
                    :disabled="reference.status === 'unavailable'"
                  >
                    {{ t('world.learning.references.cta') }}
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.learning-doc-hero {
  position: relative;
  overflow: hidden;
}

.learning-doc-hero::after {
  content: '';
  position: absolute;
  width: 320px;
  height: 320px;
  top: -140px;
  right: -110px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.2) 0%, transparent 70%);
  animation: learningGlow 8s ease-in-out infinite;
}

.learning-doc-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: learningCardIn 0.45s ease both;
}

.learning-doc-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
}

@keyframes learningGlow {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.45;
  }
}

@keyframes learningCardIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
