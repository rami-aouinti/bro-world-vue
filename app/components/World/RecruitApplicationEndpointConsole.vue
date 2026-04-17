<script setup lang="ts">
import type { RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { privateApi } from '~/utils/http/privateApi'

const applicationSlug = ref('bro-world')
const applicationId = ref('')
const jobId = ref('')
const offerId = ref('')
const resumeId = ref('')
const applicantId = ref('')

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
    errorMessage.value = 'Request failed.'
  } finally {
    loading.value = false
  }
}

async function fetchAnalytics() {
  await runPrivateRequest(
    'GET',
    `/api/recruit/applications/${encodeURIComponent(applicationSlug.value)}/private/analytics`,
  )
}

async function fetchPipeline() {
  await runPrivateRequest(
    'GET',
    `/api/recruit/private/${encodeURIComponent(applicationSlug.value)}/pipeline`,
  )
}

async function fetchStatusHistory() {
  if (!applicationId.value) return

  await runPrivateRequest(
    'GET',
    `/api/recruit/applications/${encodeURIComponent(applicationSlug.value)}/private/applications/${encodeURIComponent(applicationId.value)}/status-history`,
  )
}

async function createOffer() {
  if (!applicationId.value) return

  await runPrivateRequest(
    'POST',
    `/api/recruit/applications/${encodeURIComponent(applicationSlug.value)}/private/applications/${encodeURIComponent(applicationId.value)}/offers`,
    { message: 'offer generated from world jobs console' },
  )
}

async function offerAction(action: 'send' | 'accept' | 'decline' | 'withdraw') {
  if (!offerId.value) return

  await runPrivateRequest(
    'POST',
    `/api/recruit/applications/${encodeURIComponent(applicationSlug.value)}/private/offers/${encodeURIComponent(offerId.value)}/${action}`,
    { message: `offer action ${action}` },
  )
}

async function patchPrivateJob() {
  if (!jobId.value) return

  await runPrivateRequest(
    'PATCH',
    `/api/recruit/applications/${encodeURIComponent(applicationSlug.value)}/private/jobs/${encodeURIComponent(jobId.value)}`,
    { applicantId: applicantId.value || undefined, jobId: jobId.value },
  )
}

async function patchResume() {
  if (!resumeId.value) return

  await runPrivateRequest(
    'PATCH',
    `/api/recruit/applications/${encodeURIComponent(applicationSlug.value)}/private/me/resumes/${encodeURIComponent(resumeId.value)}`,
    { skills: [{ title: 'TypeScript', description: 'updated from console' }] },
  )
}
</script>

<template>
  <v-card rounded="xl" class="pa-4 postcard-gradient-card">
    <h3 class="text-h6 mb-3">Recruit application endpoints console</h3>

    <v-row>
      <v-col cols="12" md="4">
        <v-text-field v-model="applicationSlug" label="applicationSlug" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="applicationId" label="applicationId" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="jobId" label="jobId" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="offerId" label="offerId" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="resumeId" label="resumeId" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="applicantId" label="applicantId" />
      </v-col>
    </v-row>

    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-btn :loading="loading" variant="tonal" @click="fetchAnalytics">Analytics</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="fetchPipeline">Pipeline</v-btn>
      <v-btn :loading="loading" variant="tonal" @click="fetchStatusHistory">Status History</v-btn>
      <v-btn :loading="loading" variant="tonal" color="secondary" @click="createOffer">Create Offer</v-btn>
      <v-btn :loading="loading" variant="tonal" color="primary" @click="offerAction('send')">Send Offer</v-btn>
      <v-btn :loading="loading" variant="tonal" color="success" @click="offerAction('accept')">Accept Offer</v-btn>
      <v-btn :loading="loading" variant="tonal" color="error" @click="offerAction('decline')">Decline Offer</v-btn>
      <v-btn :loading="loading" variant="tonal" color="warning" @click="offerAction('withdraw')">Withdraw Offer</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="patchPrivateJob">Patch Private Job</v-btn>
      <v-btn :loading="loading" variant="outlined" @click="patchResume">Patch Resume</v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-3">{{ errorMessage }}</v-alert>

    <v-textarea
      v-model="responseBody"
      label="Endpoint response"
      rows="10"
      auto-grow
      readonly
      variant="outlined"
    />
  </v-card>
</template>
