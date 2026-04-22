<script setup lang="ts">
import type { CrmGithubWorkflow } from '~/types/world/crmGithub'

defineProps<{
  workflows: CrmGithubWorkflow[]
}>()

const { t } = useI18n()
</script>

<template>
  <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
    <h2 class="text-subtitle-1 mb-3">{{ t('world.crm.repositories.sections.workflows', { count: workflows.length }) }}</h2>
    <v-list lines="two" density="compact" class="bg-transparent">
      <v-list-item
        v-for="workflow in workflows"
        :key="workflow.id"
        :title="workflow.name"
        :subtitle="`${workflow.state} • ${workflow.path}`"
      />
    </v-list>
  </v-card>
</template>
