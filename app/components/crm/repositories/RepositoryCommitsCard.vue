<script setup lang="ts">
import type { CrmGithubCommitDetail, CrmGithubCommitSummary } from '~/types/world/crmGithub'

defineProps<{
  commits: CrmGithubCommitSummary[]
  selectedSha: string
  commitDetail: CrmGithubCommitDetail | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (event: 'select', sha: string): void
}>()

const { t } = useI18n()
</script>

<template>
  <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
    <h2 class="text-subtitle-1 mb-3">{{ t('world.crm.repositories.sections.commits', { count: commits.length }) }}</h2>
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

    <v-divider class="my-3" />

    <div v-if="loading" class="text-medium-emphasis">
      {{ t('world.crm.repositories.sections.loadingCommitDetails', 'Loading commit details...') }}
    </div>
    <div v-else-if="commitDetail">
      <p class="text-body-2 mb-2">
        <strong>{{ t('world.crm.repositories.labels.sha', 'SHA') }}:</strong> {{ commitDetail.sha }}
      </p>
      <v-list lines="one" density="compact" class="bg-transparent">
        <v-list-item
          v-for="file in commitDetail.files"
          :key="file.filename"
          :title="file.filename"
          :subtitle="`${file.status} • +${file.additions} / -${file.deletions} (${file.changes})`"
        />
      </v-list>
    </div>
  </v-card>
</template>
