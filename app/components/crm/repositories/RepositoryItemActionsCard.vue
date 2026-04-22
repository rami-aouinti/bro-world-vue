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
  pullRequestOptions?: Array<{ title: string; value: string }>
  issueOptions?: Array<{ title: string; value: string }>
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

    <v-row>
      <v-col cols="12" md="6">
        <v-card variant="tonal" color="primary" class="pa-3 h-100">
          <h3 class="text-subtitle-2 mb-2">Create PR</h3>
          <v-text-field v-model="createPrBody.title" label="PR title" density="comfortable" variant="outlined" class="mb-2" hide-details />
          <v-text-field v-model="createPrBody.head" label="PR head branch" density="comfortable" variant="outlined" class="mb-2" hide-details />
          <v-text-field v-model="createPrBody.base" label="PR base branch" density="comfortable" variant="outlined" class="mb-2" hide-details />
          <v-btn color="primary" :loading="pending" @click="execute(() => githubStore.createPullRequest(projectId, createPrBody, applicationSlug))">Create PR</v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="tonal" color="secondary" class="pa-3 h-100">
          <h3 class="text-subtitle-2 mb-2">Patch PR</h3>
          <AppSelect
            v-model="prNumber"
            :items="pullRequestOptions ?? []"
            item-title="title"
            item-value="value"
            label="Pull request"
            density="comfortable"
            variant="outlined"
            class="mb-2"
            hide-details
          />
          <v-text-field v-model="patchPrBody.title" label="New title (optional)" density="comfortable" variant="outlined" class="mb-2" hide-details />
          <AppSelect v-model="patchPrBody.state" :items="['open', 'closed']" label="State" density="comfortable" variant="outlined" class="mb-2" hide-details />
          <v-btn color="secondary" variant="tonal" :loading="pending" :disabled="!prNumber" @click="execute(() => githubStore.patchPullRequest(projectId, prNumber, patchPrBody, applicationSlug))">Patch PR</v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="tonal" color="info" class="pa-3 h-100">
          <h3 class="text-subtitle-2 mb-2">PR commits</h3>
          <AppSelect
            v-model="prNumber"
            :items="pullRequestOptions ?? []"
            item-title="title"
            item-value="value"
            label="Pull request"
            density="comfortable"
            variant="outlined"
            class="mb-2"
            hide-details
          />
          <v-btn color="info" variant="tonal" :loading="pending" :disabled="!prNumber" @click="execute(() => githubStore.getPullRequestCommits(projectId, prNumber, { repo: repository }, applicationSlug))">Get PR commits</v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="tonal" color="warning" class="pa-3 h-100">
          <h3 class="text-subtitle-2 mb-2">Patch issue</h3>
          <AppSelect
            v-model="issueNumber"
            :items="issueOptions ?? []"
            item-title="title"
            item-value="value"
            label="Issue"
            density="comfortable"
            variant="outlined"
            class="mb-2"
            hide-details
          />
          <AppSelect v-model="patchIssueBody.state" :items="['open', 'closed']" label="State" density="comfortable" variant="outlined" class="mb-2" hide-details />
          <v-btn color="warning" variant="tonal" :loading="pending" :disabled="!issueNumber" @click="execute(() => githubStore.patchIssueRich(projectId, issueNumber, patchIssueBody, applicationSlug))">Patch issue</v-btn>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card variant="tonal" color="success" class="pa-3 h-100">
          <h3 class="text-subtitle-2 mb-2">Patch repository</h3>
          <v-text-field v-model="patchRepoBody.description" label="Description" density="comfortable" variant="outlined" class="mb-2" hide-details />
          <v-text-field v-model="patchRepoBody.defaultBranch" label="Default branch" density="comfortable" variant="outlined" class="mb-2" hide-details />
          <v-btn color="success" variant="tonal" :loading="pending" @click="execute(() => githubStore.patchRepository(projectId, patchRepoBody, applicationSlug))">Patch repository</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="errorText" type="error" variant="tonal" class="mt-3">{{ errorText }}</v-alert>
    <v-textarea
      v-if="responseText"
      :model-value="responseText"
      label="Response"
      rows="8"
      auto-grow
      readonly
      variant="outlined"
      class="mt-3"
    />
  </v-card>
</template>
