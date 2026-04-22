<script setup lang="ts">
import type { CrmGithubCollaborator } from '~/types/world/crmGithub'

defineProps<{
  collaborators: CrmGithubCollaborator[]
}>()

const { t } = useI18n()
</script>

<template>
  <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
    <h2 class="text-subtitle-1 mb-3">{{ t('world.crm.repositories.sections.collaborators', { count: collaborators.length }) }}</h2>
    <v-list lines="two" density="compact" class="bg-transparent">
      <v-list-item
        v-for="collaborator in collaborators"
        :key="collaborator.login"
        :title="collaborator.login"
        :subtitle="`${collaborator.type} • push: ${Boolean(collaborator.permissions?.push)}`"
      />
    </v-list>
  </v-card>
</template>
