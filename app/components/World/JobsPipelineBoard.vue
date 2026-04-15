<script setup lang="ts">
import type { JobCandidate, JobPipelineStage } from '~~/server/types/api/jobs'
import { useWorldJobsStore } from '~/stores/worldJobs'
import type { SessionUser } from '~/types/session'

const props = defineProps<{
  context: 'offers' | 'applications' | 'my-offers'
  title: string
  subtitle: string
}>()

const { t } = useI18n()

const jobsStore = useWorldJobsStore()
await jobsStore.fetchCandidates(props.context)
const data = computed(() => ({ items: jobsStore.items, stages: jobsStore.stages }))
const refresh = () => jobsStore.fetchCandidates(props.context, { force: true })
const pending = computed(() => jobsStore.pending)
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

const tableHeaders = computed(() => [
  { title: t('world.jobs.pipeline.table.id', 'ID'), key: 'id' },
  { title: t('world.jobs.pipeline.table.candidate', 'Candidate'), key: 'name' },
  { title: t('world.jobs.pipeline.table.offer', 'Offer'), key: 'offerTitle' },
  { title: t('world.jobs.pipeline.table.stage', 'Stage'), key: 'currentStage' },
  { title: t('world.jobs.pipeline.table.score', 'Score'), key: 'score.total' },
  { title: t('world.jobs.pipeline.table.updated', 'Updated'), key: 'updatedAt' },
])

const selectCandidate = (row: { item: JobCandidate }) => {
  selectedId.value = row.item.id
}

const saveTransition = async () => {
  if (!selectedCandidate.value) {
    return
  }

  await jobsStore.transitionCandidate(selectedCandidate.value.id, {
    toStage: toStage.value,
    recruiterNotes: recruiterNotes.value,
    panelFeedback: panelFeedback.value,
    actor: 'Recruiter UI',
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
        <h2 class="text-h6 mb-1">{{ t('world.jobs.pipeline.title', 'Transition pipeline') }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ t('world.jobs.pipeline.stagesHint', 'Applied → Screening → Interview → Offer → Hired / Rejected') }}
        </p>

        <v-select
          v-model="selectedId"
          :label="t('world.jobs.pipeline.candidate', 'Candidate')"
          :items="candidates.map(candidate => ({ title: `${candidate.name} (${candidate.id})`, value: candidate.id }))"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />

        <v-select
          v-model="toStage"
          :label="t('world.jobs.pipeline.newStage', 'New stage')"
          :items="stages"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          :disabled="!canTransition"
        />

        <v-textarea
          v-model="recruiterNotes"
          :label="t('world.jobs.pipeline.recruiterNotes', 'Recruiter notes')"
          rows="3"
          auto-grow
          variant="outlined"
          class="mb-3"
          :disabled="!canEditNotes"
        />

        <v-textarea
          v-model="panelFeedback"
          :label="t('world.jobs.pipeline.panelFeedback', 'Panel feedback')"
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
          {{ t('world.jobs.pipeline.serverScore', 'Server score:') }} {{ selectedCandidate.score.total }}/100
          {{ t('world.jobs.pipeline.scoreBreakdown', { skills: selectedCandidate.score.skillsMatch, experience: selectedCandidate.score.experience, availability: selectedCandidate.score.availability }, `skills ${selectedCandidate.score.skillsMatch}, experience ${selectedCandidate.score.experience}, availability ${selectedCandidate.score.availability}`) }}
        </v-alert>

        <v-btn
          block
          color="primary"
          prepend-icon="mdi-content-save-outline"
          :disabled="!selectedCandidate || !canTransition"
          @click="saveTransition"
        >
          {{ t('world.jobs.pipeline.persist', 'Persist transition') }}
        </v-btn>
        <p v-if="!canTransition" class="text-caption text-warning mt-2 mb-0">
          {{ t('world.jobs.pipeline.readOnly', 'Your role (interviewer) has read-only access for pipeline transitions.') }}
        </p>

        <v-divider class="my-4" />

        <h3 class="text-subtitle-1 mb-2">{{ t('world.jobs.pipeline.history', 'Transition history') }}</h3>
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
            <div class="text-caption mt-1"><strong>{{ t('world.jobs.pipeline.notes', 'Notes:') }}</strong> {{ entry.recruiterNotes || '—' }}</div>
            <div class="text-caption"><strong>{{ t('world.jobs.pipeline.panel', 'Panel:') }}</strong> {{ entry.panelFeedback || '—' }}</div>
          </v-timeline-item>
        </v-timeline>
        <p v-else class="text-body-2 text-medium-emphasis mb-0">
          {{ t('world.jobs.pipeline.noHistory', 'No transition history yet.') }}
        </p>
      </v-card>
    </v-col>
  </v-row>
</template>
