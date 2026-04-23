<script setup lang="ts">
import type { PublicPageSlug } from '~~/shared/publicPageSlugs'

definePageMeta({
  layout: 'job',
  title: 'world.jobs.label',
  description: 'world.jobs.seo.metaDescription',
})

type JobsPublicReferencePage = {
  description?: string
}

type ReferenceStatus = 'loading' | 'success' | 'unavailable'
type JobsRoutePath = `/world/jobs${string}`

const JOBS_BASE_PATH = '/world/jobs' as const

function toJobsRoute(path = ''): JobsRoutePath {
  return `${JOBS_BASE_PATH}${path}` as JobsRoutePath
}

// Convention: <module>-<section> slugs are backend-validated public page ids.
const JOBS_REFERENCE_CONFIG = {
  [toJobsRoute('/offers')]: {
    publicPageSlug: 'jobs-offers',
    fallbackI18nKey: 'world.jobs.references.fallback.offers',
  },
  [toJobsRoute('/applications')]: {
    publicPageSlug: 'jobs-applications',
    fallbackI18nKey: 'world.jobs.references.fallback.applications',
  },
} as const satisfies Record<string, { publicPageSlug: PublicPageSlug; fallbackI18nKey: string }>

const { locale, t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl || 'https://bro-world-space.com'
const pageUrl = new URL(JOBS_BASE_PATH, siteUrl).toString()
const seoImage = new URL('/img/platform/general/job.png', siteUrl).toString()
const publicPagesStore = usePublicPagesStore()
const { jobsNavItems } = useWorldJobsNavItems()

useSeoMeta({
  title: t('world.jobs.seo.title'),
  description: t('world.jobs.seo.description'),
  keywords: t('world.jobs.seo.keywords'),
  robots: 'index, follow, max-image-preview:large',
  ogTitle: t('world.jobs.seo.ogTitle'),
  ogDescription: t('world.jobs.seo.ogDescription'),
  ogType: 'website',
  ogUrl: pageUrl,
  ogImage: seoImage,
  ogImageAlt: 'Bro World Jobs recruitment dashboard',
  twitterTitle: t('world.jobs.seo.twitterTitle'),
  twitterDescription: t('world.jobs.seo.twitterDescription'),
  twitterImage: seoImage,
  twitterCard: 'summary_large_image',
})

const quickAccessLinks = computed(() => [
  { label: t('world.jobs.documentation.navigation.offers'), to: toJobsRoute('/offers') },
  { label: t('world.jobs.documentation.navigation.applications'), to: toJobsRoute('/applications') },
  { label: t('world.jobs.documentation.navigation.apply'), to: toJobsRoute('/apply') },
])

const documentationSections = computed(() => [
  {
    key: 'offers',
    to: toJobsRoute('/offers'),
    title: t('world.jobs.documentation.sections.offers.title'),
    description: t('world.jobs.documentation.sections.offers.description'),
  },
  {
    key: 'applications',
    to: toJobsRoute('/applications'),
    title: t('world.jobs.documentation.sections.applications.title'),
    description: t('world.jobs.documentation.sections.applications.description'),
  },
  {
    key: 'pipeline',
    to: JOBS_BASE_PATH,
    title: t('world.jobs.documentation.sections.pipeline.title'),
    description: t('world.jobs.documentation.sections.pipeline.description'),
  },
])

const referenceStatuses = ref<Record<string, ReferenceStatus>>({})
const referenceDescriptions = ref<Record<string, string>>({})

const referenceNavItems = computed(() =>
  jobsNavItems.value.filter((item) => item.to in JOBS_REFERENCE_CONFIG),
)

const referenceCards = computed(() =>
  referenceNavItems.value.map((item) => {
    const config = JOBS_REFERENCE_CONFIG[item.to as keyof typeof JOBS_REFERENCE_CONFIG]
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

const isReferencesLoading = computed(() =>
  referenceNavItems.value.length > 0 &&
  referenceNavItems.value.some((item) => (referenceStatuses.value[item.to] ?? 'loading') === 'loading'),
)

const isPageLoading = computed(() => isPageSkeletonVisible.value || isReferencesLoading.value)

async function loadReferences() {
  const entries = referenceNavItems.value

  await Promise.all(
    entries.map(async (item) => {
      const config = JOBS_REFERENCE_CONFIG[item.to as keyof typeof JOBS_REFERENCE_CONFIG]

      referenceStatuses.value[item.to] = 'loading'

      try {
        const page = await publicPagesStore.fetchPage<JobsPublicReferencePage>(
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
    <template v-if="isPageLoading">
      <v-container fluid>
        <v-skeleton-loader type="card, article, article" />
      </v-container>
    </template>

    <template v-else>
      <WorldModuleDrawers
      :module-title="t('world.jobs.label')"
      :module-path="JOBS_BASE_PATH"
      module-icon="mdi-briefcase-search-outline"
      :module-description="t('world.jobs.moduleDescription')"
      :nav-items="jobsNavItems"
      :action-label="'Create Job'"
      @action="navigateTo('/platform/job/new')"
    >
      <template #right>
        <div class="d-flex flex-column ga-4">
          <v-card rounded="xl" variant="tonal" color="primary">
            <div class="pa-4 d-flex ga-3">
              <v-avatar size="56" rounded="xl" color="primary" variant="tonal">
                <v-icon icon="mdi-briefcase-search-outline" size="28" />
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-subtitle-2 font-weight-bold mb-1">
                  {{ t('world.jobs.label') }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ t('world.jobs.moduleDescription') }}
                </div>
              </div>
            </div>
          </v-card>

          <v-card variant="tonal" color="primary" class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-2">
              {{ t('world.jobs.kpis.openOffers') }}
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip color="primary" variant="tonal" label>
                18 {{ t('world.jobs.kpis.openOffers') }}
              </v-chip>
              <v-chip color="info" variant="tonal" label>
                94 {{ t('world.jobs.kpis.newApplications') }}
              </v-chip>
              <v-chip color="success" variant="tonal" label>
                27 {{ t('world.jobs.kpis.interviewsWeek') }}
              </v-chip>
            </div>
          </v-card>

          <v-card variant="tonal" color="primary" class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-2">
              {{ t('world.jobs.documentation.labels.quickActionsTitle') }}
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
          <v-card rounded="xl" class="pa-6 postcard-gradient-card jobs-doc-hero">
            <div class="d-flex align-center justify-space-between ga-3 flex-wrap">
              <div>
                <h1 class="text-h5 font-weight-bold mb-2">
                  {{ t('world.jobs.documentation.heroTitle') }}
                </h1>
                <p class="text-body-1 mb-0">
                  {{ t('world.jobs.documentation.heroDescription') }}
                </p>
              </div>
              <v-btn color="primary" prepend-icon="mdi-rocket-launch-outline" :to="toJobsRoute('/offers')">
                {{ t('world.jobs.documentation.cta.hero') }}
              </v-btn>
            </div>
          </v-card>
        </v-col>


        <v-col cols="12">
          <v-card rounded="xl" class="pa-5 postcard-gradient-card jobs-doc-card">
            <v-row density="comfortable">
              <v-col
                v-for="section in documentationSections"
                :key="section.key"
                cols="12"
                md="4"
              >
                <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
                  <h2 class="text-subtitle-1 font-weight-bold mb-2">{{ section.title }}</h2>
                  <p class="text-body-2 text-medium-emphasis mb-4">{{ section.description }}</p>
                  <v-btn color="primary" variant="tonal" append-icon="mdi-arrow-right" :to="section.to">
                    {{ t('world.jobs.documentation.cta.openSection', { section: section.title }) }}
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card rounded="xl" class="pa-5 postcard-gradient-card jobs-doc-card">
            <div class="d-flex align-center ga-2 mb-3">
              <v-icon icon="mdi-book-open-page-variant-outline" color="primary" />
              <h2 class="text-h6 mb-0">{{ t('world.jobs.references.title') }}</h2>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ t('world.jobs.references.subtitle') }}
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
                    {{ t('world.jobs.references.cta') }}
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    </template>
  </div>
</template>

<style scoped>
.jobs-doc-hero {
  position: relative;
  overflow: hidden;
}

.jobs-doc-hero::after {
  content: '';
  position: absolute;
  width: 320px;
  height: 320px;
  top: -140px;
  right: -110px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.2) 0%, transparent 70%);
  animation: jobsGlow 8s ease-in-out infinite;
}

.jobs-doc-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: jobsCardIn 0.45s ease both;
}

.jobs-doc-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
}

@keyframes jobsGlow {
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

@keyframes jobsCardIn {
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
