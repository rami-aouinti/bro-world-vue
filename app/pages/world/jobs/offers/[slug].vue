<script setup lang="ts">
import type { RecruitJob, RecruitJobDetailResponse } from '~/types/world/jobs'

definePageMeta({ title: 'Jobs Offer Detail' })

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const loading = ref(false)
const job = ref<RecruitJob | null>(null)
const errorMessage = ref('')
const applyOpen = ref(false)

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
    errorMessage.value = "Impossible de charger le détail de l'offre."
  } finally {
    loading.value = false
  }
}

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
      Retour aux offres
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
                Apply
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

          <h2 class="text-h6 mb-2">Mission</h2>
          <p class="mb-4">{{ job.missionDescription || '—' }}</p>

          <h2 class="text-h6 mb-2">Responsabilités</h2>
          <ul class="pl-5 mb-4">
            <li v-for="item in job.responsibilities || []" :key="item">
              {{ item }}
            </li>
          </ul>

          <h2 class="text-h6 mb-2">Profil</h2>
          <ul class="pl-5 mb-4">
            <li v-for="item in job.profile || []" :key="item">{{ item }}</li>
          </ul>

          <h2 class="text-h6 mb-2">Bénéfices</h2>
          <ul class="pl-5 mb-0">
            <li v-for="item in job.benefits || []" :key="item">{{ item }}</li>
          </ul>
        </template>
      </v-card-text>
    </v-card>

    <AppModal v-model="applyOpen" title="Apply to this job" :max-width="560">
      <p class="mb-0">
        Le flow d'application sera branché ici. Pour le moment ce bouton ouvre
        ce modal comme demandé.
      </p>

      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="applyOpen = false">Fermer</v-btn>
        <v-btn color="primary" @click="applyOpen = false">Compris</v-btn>
      </template>
    </AppModal>
  </v-container>
</template>
