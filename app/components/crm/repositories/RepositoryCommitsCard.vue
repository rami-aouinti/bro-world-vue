<script setup lang="ts">
import type { CrmGithubCommitSummary } from '~/types/world/crmGithub'

defineProps<{
  commits: CrmGithubCommitSummary[]
  selectedSha?: string
}>()

const emit = defineEmits<{
  (event: 'select', sha: string): void
}>()

const { t } = useI18n()
</script>

<template>
  <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
    <h2 class="text-subtitle-1 mb-3">
      {{
        t('world.crm.repositories.sections.commits', { count: commits.length })
      }}
    </h2>
    <v-list lines="two" density="compact" class="bg-transparent">
      <v-list-item
        v-for="commit in commits"
        :key="commit.sha"
        :active="selectedSha === commit.sha"
        :title="commit.message || commit.sha"
        :subtitle="`${commit.author} • ${new Date(commit.date).toLocaleString()}`"
        @click="emit('select', commit.sha)"
      />
    </v-list>
  </v-card>
</template>
