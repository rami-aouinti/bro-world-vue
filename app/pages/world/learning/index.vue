<script setup lang="ts">
import { useWorldLearningStore } from '~/stores/worldLearning'

definePageMeta({
  layout: 'learning',
  title: 'world.learning.label',
  description: 'world.learning.seo.metaDescription',
})

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl || 'https://bro-world-space.com'
const pageUrl = new URL('/world/learning', siteUrl).toString()
const seoImage = new URL('/img/platform/general/learning.png', siteUrl).toString()
const { learningNavItems } = useWorldLearningNavItems()

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

const documentationSections = computed(() => [
  {
    title: t('world.learning.nav.courses', 'Courses'),
    icon: 'mdi-book-open-page-variant-outline',
    description: t('world.learning.documentation.coursesDescription', 'Browse available courses and learning paths for each cohort.'),
    to: '/world/learning/courses',
  },
  {
    title: t('world.learning.nav.classes', 'Classes'),
    icon: 'mdi-google-classroom',
    description: t('world.learning.documentation.classesDescription', 'Organize classes, sessions, and progression milestones.'),
    to: '/world/learning/classes',
  },
  {
    title: t('world.learning.nav.students', 'Students'),
    icon: 'mdi-account-group-outline',
    description: t('world.learning.documentation.studentsDescription', 'Track student engagement, scores, and completion status.'),
    to: '/world/learning/students',
  },
  {
    title: t('world.learning.nav.grades', 'Grades'),
    icon: 'mdi-chart-box-outline',
    description: t('world.learning.documentation.gradesDescription', 'Review assessments, grades, and certification readiness.'),
    to: '/world/learning/grades',
  },
])

const quickAccessLinks = computed(() => [
  { label: t('world.learning.nav.courses', 'Courses'), to: '/world/learning/courses' },
  { label: t('world.learning.nav.students', 'Students'), to: '/world/learning/students' },
  { label: t('world.learning.nav.exams', 'Exams'), to: '/world/learning/exams' },
])
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

        <v-col v-for="section in documentationSections" :key="section.title" cols="12" md="6">
          <v-card rounded="xl" class="pa-5 postcard-gradient-card learning-doc-card h-100">
            <div class="d-flex align-center ga-2 mb-2">
              <v-icon :icon="section.icon" color="primary" />
              <h2 class="text-h6 mb-0">{{ section.title }}</h2>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">{{ section.description }}</p>
            <v-btn color="primary" variant="tonal" append-icon="mdi-arrow-right" :to="section.to">
              {{ t('world.learning.documentation.openSection', { section: section.title }) }}
            </v-btn>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card rounded="xl" class="pa-5 postcard-gradient-card learning-doc-card">
            <div class="d-flex align-center ga-2 mb-3">
              <v-icon icon="mdi-lightning-bolt-outline" color="primary" />
              <h2 class="text-h6 mb-0">{{ t('world.learning.documentation.quickNavigationTitle', 'Quick navigation') }}</h2>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ t('world.learning.documentation.quickNavigationDescription', 'Jump directly to the pages used daily by instructors and learners.') }}
            </p>
            <div class="d-flex ga-2 flex-wrap">
              <v-btn
                v-for="link in quickAccessLinks"
                :key="`quick-${link.to}`"
                color="primary"
                variant="tonal"
                append-icon="mdi-arrow-right"
                :to="link.to"
              >
                {{ link.label }}
              </v-btn>
            </div>
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
    transform: translateY(0);
  }

  50% {
    transform: translateY(24px);
  }
}

@keyframes learningCardIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
