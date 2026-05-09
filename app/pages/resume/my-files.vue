<script setup lang="ts">
import type { RecruitResume } from '~/types/world/jobs'
import { privateApi } from '~/utils/http/privateApi'
import RandomResumeDrawerCards from '~/components/Resume/RandomResumeDrawerCards.vue'
const { t } = useI18n()

definePageMeta({ layout: 'resume', title: 'resumePreview.myFiles.metaTitle' })

interface RecruitTemplateRef {
  name: string
}

interface RecruitCoverPage {
  id: string
  template: RecruitTemplateRef
  fullName?: string | null
  role?: string | null
  header?: string | null
}

interface RecruitCoverLetter {
  id: string
  template: RecruitTemplateRef
  fullName?: string | null
  role?: string | null
  header?: string | null
}

const resumes = ref<RecruitResume[]>([])
const coverPages = ref<RecruitCoverPage[]>([])
const coverLetters = ref<RecruitCoverLetter[]>([])

const loading = ref(false)
const error = ref('')

const hasResumes = computed(() => resumes.value.length > 0)
const hasCoverPages = computed(() => coverPages.value.length > 0)
const hasCoverLetters = computed(() => coverLetters.value.length > 0)

const openCoverPageShow = (coverPage: RecruitCoverPage) =>
  navigateTo(`/profile/cover-page/${coverPage.template.name}?id=${encodeURIComponent(coverPage.id)}`)

const openCoverLetterShow = (coverLetter: RecruitCoverLetter) =>
  navigateTo(`/profile/cover-letter/${coverLetter.template.name}?id=${encodeURIComponent(coverLetter.id)}`)

async function fetchMyFiles() {
  loading.value = true
  error.value = ''
  try {
    const [resumesResponse, coverPagesResponse, coverLettersResponse] = await Promise.all([
      privateApi.request<RecruitResume[]>('/api/recruit/private/me/resumes'),
      privateApi.request<RecruitCoverPage[]>('/api/recruit/private/me/cover-pages'),
      privateApi.request<RecruitCoverLetter[]>('/api/recruit/private/me/cover-letters'),
    ])

    resumes.value = resumesResponse
    coverPages.value = coverPagesResponse
    coverLetters.value = coverLettersResponse
  } catch {
    error.value = t('resumePreview.myFiles.errors.load')
  } finally {
    loading.value = false
  }
}

onMounted(fetchMyFiles)
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <RandomResumeDrawerCards />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <div class="hero mb-8">
        <h1 class="text-h3 font-weight-bold mb-2">{{ t('resumePreview.myFiles.heading') }}</h1>
        <p class="text-medium-emphasis text-body-1">
          {{ t('resumePreview.myFiles.subheading') }}
        </p>
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-6">{{ error }}</v-alert>
      <v-skeleton-loader v-if="loading" type="article, article, article" />

      <template v-else>
        <v-card class="postcard-gradient-card mb-6" rounded="xl">
          <v-card-title>My CV</v-card-title>
          <v-divider />
          <v-card-text>
            <v-empty-state v-if="!hasResumes" icon="mdi-file-document-outline" :title="t('resumePreview.myFiles.empty.noResume')" />
            <v-row v-else>
              <v-col v-for="resume in resumes" :key="resume.id" cols="12" md="6" lg="4">
                <v-card rounded="xl" class="h-100 postcard-gradient-card my-file-card">
                  <v-card-text>
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ t('resumePreview.myFiles.labels.resumeId', { id: resume.id.slice(0, 8) }) }}</h3>
                    <p class="text-body-2 text-medium-emphasis mb-4">
                      {{ resume.documentUrl ? t('resumePreview.myFiles.labels.resumeUploaded') : t('resumePreview.myFiles.labels.resumeGenerated') }}
                    </p>
                    <div class="actions-row">
                      <v-btn color="primary" variant="tonal" prepend-icon="mdi-eye-outline" :href="resume.documentUrl || undefined" :to="resume.documentUrl ? undefined : '/resume/cv/preview'" target="_blank">Show</v-btn>
                      <v-btn color="primary" prepend-icon="mdi-pencil-outline" to="/resume/cv/template-create">Edit</v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="postcard-gradient-card mb-6" rounded="xl">
          <v-card-title>My Cover Pages</v-card-title>
          <v-divider />
          <v-card-text>
            <v-empty-state v-if="!hasCoverPages" icon="mdi-file-account-outline" :title="t('resumePreview.myFiles.empty.noCoverPage')" />
            <v-row v-else>
              <v-col v-for="coverPage in coverPages" :key="coverPage.id" cols="12" md="6" lg="4">
                <v-card rounded="xl" class="h-100 postcard-gradient-card my-file-card">
                  <v-card-text>
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ coverPage.header || 'My Cover Page' }}</h3>
                    <p class="text-body-2 text-medium-emphasis mb-4">{{ coverPage.fullName }} · {{ coverPage.role }}</p>
                    <div class="actions-row">
                      <v-btn color="primary" variant="tonal" prepend-icon="mdi-eye-outline" @click="openCoverPageShow(coverPage)">Show</v-btn>
                      <v-btn color="primary" prepend-icon="mdi-pencil-outline" to="/resume/cover-page/preview">Edit</v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="postcard-gradient-card" rounded="xl">
          <v-card-title>My Cover Letters</v-card-title>
          <v-divider />
          <v-card-text>
            <v-empty-state v-if="!hasCoverLetters" icon="mdi-email-outline" :title="t('resumePreview.myFiles.empty.noCoverLetter')" />
            <v-row v-else>
              <v-col v-for="coverLetter in coverLetters" :key="coverLetter.id" cols="12" md="6" lg="4">
                <v-card rounded="xl" class="h-100 postcard-gradient-card my-file-card">
                  <v-card-text>
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ coverLetter.header || 'My Cover Letter' }}</h3>
                    <p class="text-body-2 text-medium-emphasis mb-4">{{ coverLetter.fullName }} · {{ coverLetter.role }}</p>
                    <div class="actions-row">
                      <v-btn color="primary" variant="tonal" prepend-icon="mdi-eye-outline" @click="openCoverLetterShow(coverLetter)">Show</v-btn>
                      <v-btn color="primary" prepend-icon="mdi-pencil-outline" to="/resume/cover-letter/preview">Edit</v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </template>
    </v-container>
  </div>
</template>

<style scoped>
.hero {
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding-left: 16px;
}

.my-file-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.my-file-card:hover {
  transform: translateY(-2px);
}

.actions-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
</style>
