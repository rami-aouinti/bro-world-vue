<script setup lang="ts">
import type { RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { privateApi } from '~/utils/http/privateApi'

const applicationSlug = ref('bro-world')
const jobSlug = ref('backend-engineer-lyon')
const applicationId = ref('')
const interviewId = ref('')
const jobId = ref('')
const offerId = ref('')
const resumeId = ref('')
const applicantId = ref('')
const resumeForApplicantId = ref('')

const loading = ref(false)
const responseBody = ref('')
const errorMessage = ref('')
const { scopedRecruitPath: defaultScopedRecruitPath } = useRecruitScopedApi()

async function runPrivateRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: Record<string, unknown>,
) {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await privateApi.request<RecruitBasicMessageResponse>(
      endpoint,
      {
        method,
        body,
      },
    )
    responseBody.value = JSON.stringify(data, null, 2)
  } catch (error) {
    console.error(error)
    errorMessage.value =
      'Request failed. This endpoint may require authentication or different permissions.'
  } finally {
    loading.value = false
  }
}

async function runPublicGet(endpoint: string) {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await $fetch<RecruitBasicMessageResponse>(endpoint)
    responseBody.value = JSON.stringify(data, null, 2)
  } catch (error) {
    console.error(error)
    errorMessage.value =
      'Request failed. This endpoint may be private or unavailable.'
  } finally {
    loading.value = false
  }
}

function slugRoute(path: string) {
  return `/api/recruit/applications/${encodeURIComponent(applicationSlug.value)}${path}`
}

function defaultRoute(path: string) {
  return defaultScopedRecruitPath(path)
}

function runSlugPrivateGet(path: string) {
  return runPrivateRequest('GET', slugRoute(path))
}

function runSlugPrivatePost(path: string, body?: Record<string, unknown>) {
  return runPrivateRequest('POST', slugRoute(path), body)
}

function runSlugPrivatePatch(path: string, body?: Record<string, unknown>) {
  return runPrivateRequest('PATCH', slugRoute(path), body)
}

function runSlugPrivateDelete(path: string) {
  return runPrivateRequest('DELETE', slugRoute(path))
}

const baseBody = computed(() => ({
  applicantId: applicantId.value,
  jobId: jobId.value,
}))

const hasApplicationId = computed(() => applicationId.value.trim().length > 0)
const hasJobId = computed(() => jobId.value.trim().length > 0)
const hasOfferId = computed(() => offerId.value.trim().length > 0)
const hasResumeId = computed(() => resumeId.value.trim().length > 0)
const hasInterviewId = computed(() => interviewId.value.trim().length > 0)
const hasApplicantId = computed(() => applicantId.value.trim().length > 0)
const hasResumeInput = computed(
  () => (resumeForApplicantId.value || resumeId.value).trim().length > 0,
)
</script>

<template>
  <v-card rounded="xl" class="pa-4 postcard-gradient-card">
    <h3 class="text-h6 mb-3">Recruit endpoints console (all listed routes)</h3>

    <v-row>
      <v-col cols="12" md="3"
        ><v-text-field v-model="applicationSlug" label="applicationSlug"
      /></v-col>
      <v-col cols="12" md="3"
        ><v-text-field v-model="jobSlug" label="jobSlug"
      /></v-col>
      <v-col cols="12" md="3"
        ><v-text-field v-model="applicationId" label="applicationId"
      /></v-col>
      <v-col cols="12" md="3"
        ><v-text-field v-model="interviewId" label="interviewId"
      /></v-col>
      <v-col cols="12" md="3"
        ><v-text-field v-model="jobId" label="jobId"
      /></v-col>
      <v-col cols="12" md="3"
        ><v-text-field v-model="offerId" label="offerId"
      /></v-col>
      <v-col cols="12" md="3"
        ><v-text-field v-model="resumeId" label="resumeId"
      /></v-col>
      <v-col cols="12" md="3"
        ><v-text-field v-model="applicantId" label="applicantId"
      /></v-col>
      <v-col cols="12" md="3"
        ><v-text-field
          v-model="resumeForApplicantId"
          label="resumeId(for applicant create)"
      /></v-col>
    </v-row>

    <v-divider class="my-2" />
    <p class="text-subtitle-2 mb-2">General endpoints</p>
    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="runPublicGet(defaultRoute('/public/jobs'))"
        >GET public/jobs</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="
          runPublicGet(
            defaultRoute(`/public/jobs/${encodeURIComponent(jobSlug)}`),
          )
        "
        >GET public/jobs/:jobSlug</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="runPrivateRequest('GET', defaultRoute('/private/me/jobs'))"
        >GET private/me/jobs</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="runPrivateRequest('GET', defaultRoute('/private/me/resumes'))"
        >GET private/me/resumes</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="
          runPrivateRequest('GET', defaultRoute('/private/job-applications'))
        "
        >GET private/job-applications</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        :disabled="!hasResumeInput"
        @click="
          runPrivateRequest('POST', defaultRoute('/applicants'), {
            resumeId: resumeForApplicantId || resumeId,
            coverLetter: 'Application from endpoint console',
          })
        "
        >POST applicants</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        :disabled="!hasJobId || !hasApplicantId"
        @click="
          runPrivateRequest('POST', defaultRoute('/applications'), baseBody)
        "
        >POST applications</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        :disabled="!hasApplicationId"
        @click="
          runPrivateRequest(
            'PATCH',
            `/api/recruit/general/private/applications/${encodeURIComponent(applicationId)}/status`,
            {
              status: 'INTERVIEW_PLANNED',
              comment: 'Validated from endpoint console',
            },
          )
        "
        >PATCH application status</v-btn
      >
    </div>

    <v-divider class="my-2" />
    <p class="text-subtitle-2 mb-2">Application slug endpoints</p>
    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="runSlugPrivateGet('/private/analytics')"
        >GET private/analytics</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="runSlugPrivateGet('/private/job-applications')"
        >GET private/job-applications</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="
          runPrivateRequest(
            'GET',
            `/api/recruit/private/${encodeURIComponent(applicationSlug)}/pipeline`,
          )
        "
        >GET private/:slug/pipeline</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="runSlugPrivateGet('/private/me/jobs')"
        >GET private/me/jobs</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="runSlugPrivateGet('/private/jobs')"
        >GET private/jobs</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="runSlugPrivateGet('/private/jobs/stats')"
        >GET private/jobs/stats</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="runPublicGet(slugRoute('/public/jobs'))"
        >GET public/jobs</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        @click="
          runPublicGet(slugRoute(`/public/jobs/${encodeURIComponent(jobSlug)}`))
        "
        >GET public/jobs/:jobSlug</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        @click="runSlugPrivatePost('/applicants', baseBody)"
        >POST slug/applicants</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        @click="runSlugPrivatePost('/applications', baseBody)"
        >POST slug/applications</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        @click="runSlugPrivatePost('/jobs', baseBody)"
        >POST slug/jobs</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        :disabled="!hasJobId"
        @click="
          runSlugPrivatePatch(`/jobs/${encodeURIComponent(jobId)}`, baseBody)
        "
        >PATCH slug/jobs/:jobId</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        color="warning"
        :disabled="!hasJobId"
        @click="runSlugPrivateDelete(`/jobs/${encodeURIComponent(jobId)}`)"
        >DELETE slug/jobs/:jobId</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        :disabled="!hasJobId"
        @click="
          runSlugPrivatePatch(
            `/private/jobs/${encodeURIComponent(jobId)}`,
            baseBody,
          )
        "
        >PATCH private/jobs/:jobId</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        @click="runSlugPrivateGet('/private/me/resumes')"
        >GET private/me/resumes</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        @click="
          runSlugPrivatePost('/resumes', {
            skills: [{ title: 'Vue', description: 'Created from console' }],
          })
        "
        >POST slug/resumes</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        :disabled="!hasResumeId"
        @click="
          runSlugPrivatePatch(
            `/private/me/resumes/${encodeURIComponent(resumeId)}`,
            { skills: [{ title: 'TS', description: 'Patched from console' }] },
          )
        "
        >PATCH private/me/resumes/:resumeId</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        color="warning"
        :disabled="!hasResumeId"
        @click="
          runSlugPrivateDelete(
            `/private/me/resumes/${encodeURIComponent(resumeId)}`,
          )
        "
        >DELETE private/me/resumes/:resumeId</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        :disabled="!hasApplicationId"
        @click="
          runSlugPrivateGet(
            `/private/applications/${encodeURIComponent(applicationId)}/status-history`,
          )
        "
        >GET status-history</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        color="secondary"
        :disabled="!hasApplicationId"
        @click="
          runSlugPrivatePost(
            `/private/applications/${encodeURIComponent(applicationId)}/offers`,
            { message: 'Offer created from console' },
          )
        "
        >POST offers</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        color="primary"
        :disabled="!hasOfferId"
        @click="
          runSlugPrivatePost(
            `/private/offers/${encodeURIComponent(offerId)}/send`,
            { message: 'send' },
          )
        "
        >POST offer/send</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        color="success"
        :disabled="!hasOfferId"
        @click="
          runSlugPrivatePost(
            `/private/offers/${encodeURIComponent(offerId)}/accept`,
            { message: 'accept' },
          )
        "
        >POST offer/accept</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        color="error"
        :disabled="!hasOfferId"
        @click="
          runSlugPrivatePost(
            `/private/offers/${encodeURIComponent(offerId)}/decline`,
            { message: 'decline' },
          )
        "
        >POST offer/decline</v-btn
      >
      <v-btn
        :loading="loading"
        variant="outlined"
        color="warning"
        :disabled="!hasOfferId"
        @click="
          runSlugPrivatePost(
            `/private/offers/${encodeURIComponent(offerId)}/withdraw`,
            { message: 'withdraw' },
          )
        "
        >POST offer/withdraw</v-btn
      >
    </div>

    <v-divider class="my-2" />
    <p class="text-subtitle-2 mb-2">Interviews & decision endpoints</p>
    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-btn
        :loading="loading"
        variant="tonal"
        :disabled="!hasApplicationId"
        @click="
          runPrivateRequest(
            'GET',
            `/api/recruit/private/applications/${encodeURIComponent(applicationId)}/interviews`,
          )
        "
        >GET interviews</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        :disabled="!hasApplicationId"
        @click="
          runPrivateRequest(
            'POST',
            `/api/recruit/private/applications/${encodeURIComponent(applicationId)}/interviews`,
            baseBody,
          )
        "
        >POST interviews</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        :disabled="!hasInterviewId"
        @click="
          runPrivateRequest(
            'PATCH',
            `/api/recruit/private/interviews/${encodeURIComponent(interviewId)}`,
            { startsAt: new Date().toISOString(), type: 'VIDEO' },
          )
        "
        >PATCH interview</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        color="warning"
        :disabled="!hasInterviewId"
        @click="
          runPrivateRequest(
            'DELETE',
            `/api/recruit/private/interviews/${encodeURIComponent(interviewId)}`,
          )
        "
        >DELETE interview</v-btn
      >
      <v-btn
        :loading="loading"
        variant="tonal"
        :disabled="!hasApplicationId"
        @click="
          runPrivateRequest(
            'GET',
            `/api/recruit/private/applications/${encodeURIComponent(applicationId)}/decision-summary`,
          )
        "
        >GET decision-summary</v-btn
      >
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-3">{{
      errorMessage
    }}</v-alert>

    <v-textarea
      v-model="responseBody"
      label="Endpoint response"
      rows="12"
      auto-grow
      readonly
      variant="outlined"
    />
  </v-card>
</template>
