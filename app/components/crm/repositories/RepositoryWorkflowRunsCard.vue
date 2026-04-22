<script setup lang="ts">
import type { CrmGithubWorkflowRun } from '~/types/world/crmGithub'

defineProps<{
  runs: CrmGithubWorkflowRun[]
}>()

const { t } = useI18n()
</script>

<template>
  <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
    <h2 class="text-subtitle-1 mb-3">{{ t('world.crm.repositories.sections.workflowRuns', { count: runs.length }) }}</h2>
    <v-list lines="two" density="compact" class="bg-transparent">
      <v-list-item
        v-for="run in runs"
        :key="run.id"
        :title="run.name"
        :subtitle="`${run.status} • ${run.conclusion ?? '-'} • ${run.event}`"
      />
    </v-list>
  </v-card>
</template>
