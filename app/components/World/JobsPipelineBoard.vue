<script setup lang="ts">
import type { JobCandidate, JobCandidatesApiResponse, JobPipelineStage } from '~~/server/types/api/jobs'
import type { SessionUser } from '~/types/session'

const props = defineProps<{
  context: 'offers' | 'applications' | 'my-offers'
  title: string
  subtitle: string
}>()

const { data, refresh, pending } = await useFetch<JobCandidatesApiResponse>('/api/jobs/candidates', {
  query: {
    context: props.context,
  },
})
const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const uiRole = computed<'admin' | 'recruiter' | 'hiring_manager' | 'interviewer'>(() => {
  if (sessionUser.value?.roles?.includes('ROLE_ROOT') || sessionUser.value?.roles?.includes('ROLE_ADMIN') || sessionUser.value?.roles?.includes('ROLE_HR_ADMIN')) {
    return 'admin'
  }
  if (sessionUser.value?.roles?.includes('ROLE_RECRUITER')) {
    return 'recruiter'
  }
  if (sessionUser.value?.roles?.includes('ROLE_HIRING_MANAGER')) {
    return 'hiring_manager'
  }
  return 'interviewer'
})
const canTransition = computed(() => uiRole.value !== 'interviewer')
const canEditNotes = computed(() => uiRole.value === 'admin' || uiRole.value === 'recruiter' || uiRole.value === 'hiring_manager')

const candidates = computed(() => data.value?.items ?? [])
const stages = computed(() => data.value?.stages ?? [])
const selectedId = ref('')
const toStage = ref<JobPipelineStage>('Applied')
const recruiterNotes = ref('')
const panelFeedback = ref('')

const selectedCandidate = computed(() =>
  candidates.value.find(candidate => candidate.id === selectedId.value),
)

watch(stages, (value) => {
  if (!toStage.value && value.length > 0) {
    toStage.value = value[0] as JobPipelineStage
  }
}, { immediate: true })

watch(selectedCandidate, (candidate) => {
  if (!candidate) {
    return
  }

  toStage.value = candidate.currentStage
  recruiterNotes.value = candidate.recruiterNotes
  panelFeedback.value = candidate.panelFeedback
}, { immediate: true })

const tableHeaders = [
  { title: 'ID', key: 'id' },
  { title: 'Candidate', key: 'name' },
  { title: 'Offer', key: 'offerTitle' },
  { title: 'Stage', key: 'currentStage' },
  { title: 'Score', key: 'score.total' },
  { title: 'Updated', key: 'updatedAt' },
]

const selectCandidate = (row: { item: JobCandidate }) => {
  selectedId.value = row.item.id
}

const saveTransition = async () => {
  if (!selectedCandidate.value) {
    return
  }

  await $fetch(`/api/jobs/candidates/${selectedCandidate.value.id}/transition`, {
    method: 'PATCH',
    body: {
      toStage: toStage.value,
      recruiterNotes: recruiterNotes.value,
      panelFeedback: panelFeedback.value,
      actor: 'Recruiter UI',
    },
  })

  await refresh()
}
</script>

<template>
  <v-row class="ga-0">
    <v-col cols="12" lg="7" class="pr-lg-3">
      <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
        <h1 class="text-h5 mb-1">{{ title }}</h1>
        <p class="text-medium-emphasis mb-4">{{ subtitle }}</p>

        <v-data-table
          :headers="tableHeaders"
          :items="candidates"
          item-value="id"
          :loading="pending"
          class="bg-transparent"
          @click:row="(_event: MouseEvent, row: unknown) => selectCandidate(row as { item: JobCandidate })"
        />
      </v-card>
    </v-col>

    <v-col cols="12" lg="5" class="pl-lg-3">
      <v-card rounded="xl" class="pa-4 postcard-gradient-card">
        <h2 class="text-h6 mb-1">Transition pipeline</h2>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Applied → Screening → Interview → Offer → Hired / Rejected
        </p>

        <v-select
          v-model="selectedId"
          label="Candidate"
          :items="candidates.map(candidate => ({ title: `${candidate.name} (${candidate.id})`, value: candidate.id }))"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />

        <v-select
          v-model="toStage"
          label="New stage"
          :items="stages"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          :disabled="!canTransition"
        />

        <v-textarea
          v-model="recruiterNotes"
          label="Recruiter notes"
          rows="3"
          auto-grow
          variant="outlined"
          class="mb-3"
          :disabled="!canEditNotes"
        />

        <v-textarea
          v-model="panelFeedback"
          label="Panel feedback"
          rows="3"
          auto-grow
          variant="outlined"
          class="mb-3"
          :disabled="!canEditNotes"
        />

        <v-alert
          v-if="selectedCandidate"
          type="info"
          variant="tonal"
          class="mb-3"
          density="comfortable"
        >
          Score serveur: {{ selectedCandidate.score.total }}/100
          (skills {{ selectedCandidate.score.skillsMatch }}, expérience {{ selectedCandidate.score.experience }}, dispo {{ selectedCandidate.score.availability }})
        </v-alert>

        <v-btn
          block
          color="primary"
          prepend-icon="mdi-content-save-outline"
          :disabled="!selectedCandidate || !canTransition"
          @click="saveTransition"
        >
          Persist transition
        </v-btn>
        <p v-if="!canTransition" class="text-caption text-warning mt-2 mb-0">
          Votre rôle (interviewer) est en lecture seule sur les transitions pipeline.
        </p>

        <v-divider class="my-4" />

        <h3 class="text-subtitle-1 mb-2">Transition history</h3>
        <v-timeline
          v-if="selectedCandidate?.history.length"
          side="end"
          density="compact"
          truncate-line="both"
        >
          <v-timeline-item
            v-for="entry in selectedCandidate.history"
            :key="entry.id"
            dot-color="primary"
            size="small"
          >
            <div class="text-body-2 font-weight-medium">{{ entry.fromStage }} → {{ entry.toStage }}</div>
            <div class="text-caption text-medium-emphasis">{{ entry.changedAt }} • {{ entry.actor }}</div>
            <div class="text-caption mt-1"><strong>Notes:</strong> {{ entry.recruiterNotes || '—' }}</div>
            <div class="text-caption"><strong>Panel:</strong> {{ entry.panelFeedback || '—' }}</div>
          </v-timeline-item>
        </v-timeline>
        <p v-else class="text-body-2 text-medium-emphasis mb-0">
          No transition history yet.
        </p>
      </v-card>
    </v-col>
  </v-row>
</template>
