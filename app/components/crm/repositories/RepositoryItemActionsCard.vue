<script setup lang="ts">
import type {
  CrmGithubIssuePatchPayload,
  CrmGithubPullRequestCreatePayload,
  CrmGithubPullRequestPatchPayload,
  CrmGithubRepositoryPatchPayload,
} from '~/types/world/crmGithub'

const props = defineProps<{
  projectId: string
  repository: string
  applicationSlug?: string
}>()

const githubStore = useWorldCrmGithubStore()
const { t } = useI18n()

const pending = ref(false)
const errorText = ref('')
const responseText = ref('')
const prNumber = ref('')
const issueNumber = ref('')

const createPrBody = ref<CrmGithubPullRequestCreatePayload>({
  repository: props.repository,
  title: '',
  head: '',
  base: 'main',
  body: '',
  draft: false,
})

const patchPrBody = ref<CrmGithubPullRequestPatchPayload>({
  repository: props.repository,
  title: '',
  body: '',
  state: 'open',
  maintainerCanModify: true,
})

const patchIssueBody = ref<CrmGithubIssuePatchPayload>({
  repository: props.repository,
  state: 'open',
  labels: [],
  assignees: [],
})

const patchRepoBody = ref<CrmGithubRepositoryPatchPayload>({
  repository: props.repository,
  description: '',
  defaultBranch: 'main',
  archived: false,
})

function setResponse(payload: unknown) {
  responseText.value = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)
}

async function execute(action: () => Promise<unknown>) {
  pending.value = true
  errorText.value = ''

  try {
    const payload = await action()
    setResponse(payload)
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : 'Unknown execution error'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
    <h2 class="text-subtitle-1 mb-3">{{ t('world.crm.repositories.sections.itemActions', 'Item actions') }}</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      {{ t('world.crm.repositories.sections.itemActionsDescription', 'Apply POST/PATCH actions on PRs, issues and repository.') }}
    </p>

    <div class="d-flex flex-wrap ga-2 mb-4">
      <v-btn
        color="primary"
        :loading="pending"
        @click="execute(() => githubStore.createPullRequest(projectId, createPrBody, applicationSlug))"
      >
        Create PR
      </v-btn>
      <v-btn
        color="secondary"
        variant="tonal"
        :loading="pending"
        :disabled="!prNumber"
        @click="execute(() => githubStore.patchPullRequest(projectId, prNumber, patchPrBody, applicationSlug))"
      >
        Patch PR
      </v-btn>
      <v-btn
        color="secondary"
        variant="tonal"
        :loading="pending"
        :disabled="!prNumber"
        @click="execute(() => githubStore.getPullRequestCommits(projectId, prNumber, { repo: repository }, applicationSlug))"
      >
        PR commits
      </v-btn>
      <v-btn
        color="warning"
        variant="tonal"
        :loading="pending"
        :disabled="!issueNumber"
        @click="execute(() => githubStore.patchIssueRich(projectId, issueNumber, patchIssueBody, applicationSlug))"
      >
        Patch issue
      </v-btn>
      <v-btn
        color="info"
        variant="tonal"
        :loading="pending"
        @click="execute(() => githubStore.patchRepository(projectId, patchRepoBody, applicationSlug))"
      >
        Patch repository
      </v-btn>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field v-model="prNumber" label="PR number" density="comfortable" variant="outlined" hide-details class="mb-2" />
        <v-text-field v-model="issueNumber" label="Issue number" density="comfortable" variant="outlined" hide-details />
      </v-col>
      <v-col cols="12" md="6">
        <v-textarea v-model="createPrBody.title" label="PR title" rows="2" density="comfortable" variant="outlined" class="mb-2" />
        <v-text-field v-model="createPrBody.head" label="PR head branch" density="comfortable" variant="outlined" hide-details />
      </v-col>
    </v-row>

    <v-alert v-if="errorText" type="error" variant="tonal" class="mb-3">{{ errorText }}</v-alert>
    <v-textarea
      v-if="responseText"
      :model-value="responseText"
      label="Response"
      rows="8"
      auto-grow
      readonly
      variant="outlined"
    />
  </v-card>
</template>
