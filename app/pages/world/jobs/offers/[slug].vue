<script setup lang="ts">
import type {
  RecruitApplicationSummary,
  RecruitJob,
  RecruitJobDetailResponse,
  RecruitResume,
  RecruitResumeSection,
} from '~/types/world/jobs'
import { privateApi } from '~/utils/http/privateApi'

definePageMeta({ layout: 'job', title: 'Jobs Offer Detail' })

const { t } = useI18n()

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const loading = ref(false)
const job = ref<RecruitJob | null>(null)
const errorMessage = ref('')

const applyOpen = ref(false)
const applyLoading = ref(false)
const applyError = ref('')
const applySuccess = ref('')

const resumes = ref<RecruitResume[]>([])
const selectedResumeId = ref('')
const coverLetter = ref('')
const createResumeMode = ref(false)
const resumeFile = ref<File | null>(null)
const manualResume = reactive({
  experiences: [{ title: '', description: '' }],
  skills: [{ title: '', description: '' }],
})

const canSubmitApplication = computed(
  () =>
    (!createResumeMode.value && !!selectedResumeId.value) ||
    (createResumeMode.value &&
      (!!resumeFile.value ||
        manualResume.experiences.some((e) => e.title.trim()) ||
        manualResume.skills.some((s) => s.title.trim()))),
)

function toSections(items: RecruitResumeSection[]) {
  return items
    .map((item) => ({
      title: item.title.trim(),
      description: (item.description || '').trim(),
    }))
    .filter((item) => item.title)
}

async function fetchDetail() {
  if (!slug.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<RecruitJobDetailResponse>(
      `/api/recruit/general/jobs/${encodeURIComponent(slug.value)}`,
    )
    job.value = response.job
  } catch (error) {
    console.error(error)
    errorMessage.value = t('world.jobs.offers.errors.detailLoading')
  } finally {
    loading.value = false
  }
}

async function fetchMyResumes() {
  resumes.value = await privateApi.request<RecruitResume[]>(
    '/api/recruit/general/private/me/resumes',
  )
  if (!selectedResumeId.value && resumes.value.length) {
    selectedResumeId.value = resumes.value[0].id
  }
}

async function createResume(): Promise<string> {
  if (resumeFile.value) {
    const formData = new FormData()
    formData.append('document', resumeFile.value)
    formData.append(
      'experiences',
      JSON.stringify(toSections(manualResume.experiences)),
    )
    formData.append('skills', JSON.stringify(toSections(manualResume.skills)))
    const response = await $fetch<{ id: string }>(
      '/api/recruit/general/resumes',
      {
        method: 'POST',
        body: formData,
      },
    )
    return response.id
  }

  const response = await $fetch<{ id: string }>(
    '/api/recruit/general/resumes',
    {
      method: 'POST',
      body: {
        experiences: toSections(manualResume.experiences),
        skills: toSections(manualResume.skills),
      },
    },
  )

  return response.id
}

async function submitApplication() {
  if (!job.value || !canSubmitApplication.value) {
    return
  }

  applyLoading.value = true
  applyError.value = ''
  applySuccess.value = ''

  try {
    let resumeId = selectedResumeId.value
    if (createResumeMode.value) {
      resumeId = await createResume()
      await fetchMyResumes()
      selectedResumeId.value = resumeId
    }

    const applicant = await $fetch<{ id: string }>(
      '/api/recruit/general/applicants',
      {
        method: 'POST',
        body: {
          resumeId,
          coverLetter:
            coverLetter.value.trim() ||
            t('world.jobs.offers.apply.defaultCoverLetter'),
        },
      },
    )

    const application = await $fetch<RecruitApplicationSummary>(
      '/api/recruit/general/applications',
      {
        method: 'POST',
        body: {
          applicantId: applicant.id,
          jobId: job.value.id,
        },
      },
    )

    applySuccess.value = t('world.jobs.offers.apply.success', {
      status: application.status,
    })
    coverLetter.value = ''
    createResumeMode.value = false
    resumeFile.value = null
  } catch (error) {
    console.error(error)
    applyError.value = t('world.jobs.offers.apply.errors.submit')
  } finally {
    applyLoading.value = false
  }
}

function addResumeLine(target: 'experiences' | 'skills') {
  manualResume[target].push({ title: '', description: '' })
}

watch(applyOpen, async (isOpen) => {
  if (!isOpen) return

  applyError.value = ''
  applySuccess.value = ''

  try {
    await fetchMyResumes()
  } catch (error) {
    console.error(error)
    applyError.value = t('world.jobs.offers.apply.errors.resumes')
  }
})

await fetchDetail()
</script>

<template>
  <v-container fluid>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      to="/world/jobs/offers"
    >
      {{ t('world.jobs.offers.actions.backToOffers') }}
    </v-btn>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-card rounded="xl" class="postcard-gradient-card">
      <v-card-text>
        <v-progress-linear
          v-if="loading"
          indeterminate
          color="primary"
          class="mb-4"
        />

        <template v-else-if="job">
          <div class="d-flex justify-space-between flex-wrap ga-3 mb-3">
            <div>
              <h1 class="text-h4 mb-2">{{ job.title }}</h1>
              <div class="text-subtitle-1">
                {{ job.company.name }} • {{ job.location }}
              </div>
              <div class="text-caption text-medium-emphasis mt-1">
                {{ job.postedAtLabel }}
              </div>
            </div>

            <div class="d-flex flex-column ga-2 align-end">
              <div class="text-subtitle-1 font-weight-bold">
                {{ job.salary.min }} - {{ job.salary.max }}
                {{ job.salary.currency }}
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-send"
                @click="applyOpen = true"
              >
                {{ t('world.jobs.offers.apply.actions.open') }}
              </v-btn>
            </div>
          </div>

          <div class="d-flex ga-2 flex-wrap mb-4">
            <v-chip size="small" color="primary" variant="tonal">{{
              job.workMode
            }}</v-chip>
            <v-chip size="small" color="secondary" variant="tonal">{{
              job.contractType
            }}</v-chip>
            <v-chip size="small" color="info" variant="tonal">{{
              job.experienceLevel
            }}</v-chip>
            <v-chip size="small" color="warning" variant="tonal">{{
              job.schedule
            }}</v-chip>
          </div>

          <p class="mb-4">{{ job.summary }}</p>

          <h2 class="text-h6 mb-2">
            {{ t('world.jobs.offers.sections.mission') }}
          </h2>
          <p class="mb-4">
            {{
              job.missionDescription || t('world.jobs.offers.placeholder.empty')
            }}
          </p>

          <h2 class="text-h6 mb-2">
            {{ t('world.jobs.offers.sections.responsibilities') }}
          </h2>
          <ul class="pl-5 mb-4">
            <li v-for="item in job.responsibilities || []" :key="item">
              {{ item }}
            </li>
          </ul>

          <h2 class="text-h6 mb-2">
            {{ t('world.jobs.offers.sections.profile') }}
          </h2>
          <ul class="pl-5 mb-4">
            <li v-for="item in job.profile || []" :key="item">{{ item }}</li>
          </ul>

          <h2 class="text-h6 mb-2">
            {{ t('world.jobs.offers.sections.benefits') }}
          </h2>
          <ul class="pl-5 mb-0">
            <li v-for="item in job.benefits || []" :key="item">{{ item }}</li>
          </ul>
        </template>
      </v-card-text>
    </v-card>

    <AppModal
      v-model="applyOpen"
      :title="t('world.jobs.offers.apply.modalTitle')"
      :max-width="700"
    >
      <v-alert
        v-if="applyError"
        type="error"
        variant="tonal"
        class="mb-4"
        density="comfortable"
      >
        {{ applyError }}
      </v-alert>

      <v-alert
        v-if="applySuccess"
        type="success"
        variant="tonal"
        class="mb-4"
        density="comfortable"
      >
        {{ applySuccess }}
      </v-alert>

      <v-switch
        v-model="createResumeMode"
        color="primary"
        :label="t('world.jobs.offers.apply.createResumeMode')"
        inset
        class="mb-2"
      />

      <template v-if="!createResumeMode">
        <AppSelect
          v-model="selectedResumeId"
          :label="t('world.jobs.offers.apply.selectResume')"
          :items="
            resumes.map((resume) => ({ title: resume.id, value: resume.id }))
          "
          item-title="title"
          item-value="value"
          :disabled="applyLoading"
          variant="outlined"
          class="mb-4"
        />
      </template>

      <template v-else>
        <v-file-input
          v-model="resumeFile"
          :label="t('world.jobs.offers.apply.uploadPdf')"
          accept="application/pdf"
          prepend-icon="mdi-file-pdf-box"
          show-size
          variant="outlined"
          class="mb-3"
        />

        <h4 class="text-subtitle-2 mb-2">
          {{ t('world.jobs.offers.apply.experiences') }}
        </h4>
        <div
          v-for="(item, index) in manualResume.experiences"
          :key="`exp-${index}`"
          class="mb-2"
        >
          <v-text-field
            v-model="item.title"
            :label="t('world.jobs.offers.apply.fieldTitle')"
            density="comfortable"
          />
          <v-text-field
            v-model="item.description"
            :label="t('world.jobs.offers.apply.fieldDescription')"
            density="comfortable"
          />
        </div>
        <v-btn
          size="small"
          variant="tonal"
          prepend-icon="mdi-plus"
          class="mb-3"
          @click="addResumeLine('experiences')"
        >
          {{ t('world.jobs.offers.apply.addExperience') }}
        </v-btn>

        <h4 class="text-subtitle-2 mb-2">
          {{ t('world.jobs.offers.apply.skills') }}
        </h4>
        <div
          v-for="(item, index) in manualResume.skills"
          :key="`skill-${index}`"
          class="mb-2"
        >
          <v-text-field
            v-model="item.title"
            :label="t('world.jobs.offers.apply.fieldTitle')"
            density="comfortable"
          />
          <v-text-field
            v-model="item.description"
            :label="t('world.jobs.offers.apply.fieldDescription')"
            density="comfortable"
          />
        </div>
        <v-btn
          size="small"
          variant="tonal"
          prepend-icon="mdi-plus"
          class="mb-4"
          @click="addResumeLine('skills')"
        >
          {{ t('world.jobs.offers.apply.addSkill') }}
        </v-btn>
      </template>

      <v-textarea
        v-model="coverLetter"
        :label="t('world.jobs.offers.apply.coverLetter')"
        auto-grow
        rows="4"
        variant="outlined"
      />

      <template #actions>
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="applyLoading"
          @click="applyOpen = false"
          >{{ t('world.jobs.offers.apply.actions.close') }}</v-btn
        >
        <v-btn
          color="primary"
          :loading="applyLoading"
          :disabled="!canSubmitApplication"
          @click="submitApplication"
        >
          {{ t('world.jobs.offers.apply.actions.submit') }}
        </v-btn>
      </template>
    </AppModal>
  </v-container>
</template>
