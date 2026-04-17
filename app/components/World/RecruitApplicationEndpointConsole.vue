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

async function runPrivateRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: Record<string, unknown>,
) {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await privateApi.request<RecruitBasicMessageResponse>(endpoint, {
      method,
      body,
    })
    responseBody.value = JSON.stringify(data, null, 2)
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Private request failed.'
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
    errorMessage.value = 'Public request failed.'
  } finally {
    loading.value = false
  }
}

function slugRoute(path: string) {
  return `/api/recruit/applications/${encodeURIComponent(applicationSlug.value)}${path}`
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
      <v-col cols="12" md="3"><v-text-field v-model="applicationSlug" label="applicationSlug" /></v-col>
      <v-col cols="12" md="3"><v-text-field v-model="jobSlug" label="jobSlug" /></v-col>
      <v-col cols="12" md="3"><v-text-field v-model="applicationId" label="applicationId" /></v-col>
      <v-col cols="12" md="3"><v-text-field v-model="interviewId" label="interviewId" /></v-col>
      <v-col cols="12" md="3"><v-text-field v-model="jobId" label="jobId" /></v-col>
      <v-col cols="12" md="3"><v-text-field v-model="offerId" label="offerId" /></v-col>
      <v-col cols="12" md="3"><v-text-field v-model="resumeId" label="resumeId" /></v-col>
      <v-col cols="12" md="3"><v-text-field v-model="applicantId" label="applicantId" /></v-col>
      <v-col cols="12" md="3"><v-text-field v-model="resumeForApplicantId" label="resumeId(for applicant create)" /></v-col>
    </v-row>

    <v-divider class="my-2" />
    <p class="text-subtitle-2 mb-2">General endpoints</p>
    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-btn :loading="loading" variant="tonal" @click="runPublicGet('/api/recruit/general/jobs')">GET general/jobs</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runPublicGet(`/api/recruit/general/jobs/${encodeURIComponent(jobSlug)}`)">GET general/jobs/:jobSlug</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runPrivateRequest('GET', '/api/recruit/general/private/me/jobs')">GET private/me/jobs</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runPrivateRequest('GET', '/api/recruit/general/private/me/resumes')">GET private/me/resumes</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runPrivateRequest('GET', '/api/recruit/general/applicants')">GET applicants</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runPrivateRequest('GET', `/api/recruit/general/private/job-applications?jobId=${encodeURIComponent(jobId)}`)" :disabled="!hasJobId">GET private/job-applications</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="runPrivateRequest('POST', '/api/recruit/general/applicants', { resumeId: resumeForApplicantId || resumeId, coverLetter: 'Application from endpoint console' })" :disabled="!hasResumeInput">POST applicants</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="runPrivateRequest('POST', '/api/recruit/general/applications', baseBody)" :disabled="!hasJobId || !hasApplicantId">POST applications</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="runPrivateRequest('PATCH', `/api/recruit/general/private/applications/${encodeURIComponent(applicationId)}/status`, { status: 'INTERVIEW_PLANNED', comment: 'Validated from endpoint console' })" :disabled="!hasApplicationId">PATCH application status</v-btn>
    </div>

    <v-divider class="my-2" />
    <p class="text-subtitle-2 mb-2">Application slug endpoints</p>
    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-btn :loading="loading" variant="tonal" @click="runSlugPrivateGet('/private/analytics')">GET private/analytics</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runSlugPrivateGet('/private/job-applications')">GET private/job-applications</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runPrivateRequest('GET', `/api/recruit/private/${encodeURIComponent(applicationSlug)}/pipeline`)">GET private/:slug/pipeline</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runSlugPrivateGet('/private/me/jobs')">GET private/me/jobs</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runSlugPrivateGet('/private/jobs')">GET private/jobs</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runSlugPrivateGet('/private/jobs/stats')">GET private/jobs/stats</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runPublicGet(slugRoute('/public/jobs'))">GET public/jobs</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runPublicGet(slugRoute(`/public/jobs/${encodeURIComponent(jobSlug)}`))">GET public/jobs/:jobSlug</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="runSlugPrivatePost('/applicants', baseBody)">POST slug/applicants</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="runSlugPrivatePost('/applications', baseBody)">POST slug/applications</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="runSlugPrivatePost('/jobs', baseBody)">POST slug/jobs</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="runSlugPrivatePatch(`/jobs/${encodeURIComponent(jobId)}`, baseBody)" :disabled="!hasJobId">PATCH slug/jobs/:jobId</v-btn>
      <v-btn :loading="loading" variant="outlined" color="warning" @click="runSlugPrivateDelete(`/jobs/${encodeURIComponent(jobId)}`)" :disabled="!hasJobId">DELETE slug/jobs/:jobId</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="runSlugPrivatePatch(`/private/jobs/${encodeURIComponent(jobId)}`, baseBody)" :disabled="!hasJobId">PATCH private/jobs/:jobId</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="runSlugPrivateGet('/private/me/resumes')">GET private/me/resumes</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="runSlugPrivatePost('/resumes', { skills: [{ title: 'Vue', description: 'Created from console' }] })">POST slug/resumes</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="runSlugPrivatePatch(`/private/me/resumes/${encodeURIComponent(resumeId)}`, { skills: [{ title: 'TS', description: 'Patched from console' }] })" :disabled="!hasResumeId">PATCH private/me/resumes/:resumeId</v-btn>
      <v-btn :loading="loading" variant="outlined" color="warning" @click="runSlugPrivateDelete(`/private/me/resumes/${encodeURIComponent(resumeId)}`)" :disabled="!hasResumeId">DELETE private/me/resumes/:resumeId</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="runSlugPrivateGet(`/private/applications/${encodeURIComponent(applicationId)}/status-history`)" :disabled="!hasApplicationId">GET status-history</v-btn>
      <v-btn :loading="loading" variant="outlined" color="secondary" @click="runSlugPrivatePost(`/private/applications/${encodeURIComponent(applicationId)}/offers`, { message: 'Offer created from console' })" :disabled="!hasApplicationId">POST offers</v-btn>
      <v-btn :loading="loading" variant="outlined" color="primary" @click="runSlugPrivatePost(`/private/offers/${encodeURIComponent(offerId)}/send`, { message: 'send' })" :disabled="!hasOfferId">POST offer/send</v-btn>
      <v-btn :loading="loading" variant="outlined" color="success" @click="runSlugPrivatePost(`/private/offers/${encodeURIComponent(offerId)}/accept`, { message: 'accept' })" :disabled="!hasOfferId">POST offer/accept</v-btn>
      <v-btn :loading="loading" variant="outlined" color="error" @click="runSlugPrivatePost(`/private/offers/${encodeURIComponent(offerId)}/decline`, { message: 'decline' })" :disabled="!hasOfferId">POST offer/decline</v-btn>
      <v-btn :loading="loading" variant="outlined" color="warning" @click="runSlugPrivatePost(`/private/offers/${encodeURIComponent(offerId)}/withdraw`, { message: 'withdraw' })" :disabled="!hasOfferId">POST offer/withdraw</v-btn>
    </div>

    <v-divider class="my-2" />
    <p class="text-subtitle-2 mb-2">Interviews & decision endpoints</p>
    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-btn :loading="loading" variant="tonal" @click="runPrivateRequest('GET', `/api/recruit/private/applications/${encodeURIComponent(applicationId)}/interviews`)" :disabled="!hasApplicationId">GET interviews</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runPrivateRequest('POST', `/api/recruit/private/applications/${encodeURIComponent(applicationId)}/interviews`, baseBody)" :disabled="!hasApplicationId">POST interviews</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runPrivateRequest('PATCH', `/api/recruit/private/interviews/${encodeURIComponent(interviewId)}`, { startsAt: new Date().toISOString(), type: 'VIDEO' })" :disabled="!hasInterviewId">PATCH interview</v-btn>
      <v-btn :loading="loading" variant="tonal" color="warning" @click="runPrivateRequest('DELETE', `/api/recruit/private/interviews/${encodeURIComponent(interviewId)}`)" :disabled="!hasInterviewId">DELETE interview</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="runPrivateRequest('GET', `/api/recruit/private/applications/${encodeURIComponent(applicationId)}/decision-summary`)" :disabled="!hasApplicationId">GET decision-summary</v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-3">{{ errorMessage }}</v-alert>

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
