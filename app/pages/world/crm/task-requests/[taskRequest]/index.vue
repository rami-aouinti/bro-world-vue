<script setup lang="ts">
import type { CrmTaskRequestItem, CrmTaskRequestUpdatePayload } from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems, hasBlogPlugin } = useWorldCrmNavItems()
const id = computed(() => String(route.params.taskRequest ?? ''))
const isViewMode = computed(() => route.query.mode === 'view')

definePageMeta({ layout: 'crm', title: 'CRM Task Request Detail' })

const payload = reactive<CrmTaskRequestUpdatePayload>({})
const statusOptions = ['pending', 'in_progress', 'approved', 'rejected']
const { data, pending, error, refresh } = useFetch<CrmTaskRequestItem>(() => `/api/crm/general/task-requests/${id.value}`)

watchEffect(() => {
  if (!data.value) return
  Object.assign(payload, {
    title: data.value.title,
    description: data.value.description,
    status: data.value.status,
    resolvedAt: data.value.resolvedAt,
  })
})

async function save() {
  await $fetch(`/api/crm/general/task-requests/${id.value}`, { method: 'PATCH', body: payload })
  await refresh()
}

async function remove() {
  await $fetch(`/api/crm/general/task-requests/${id.value}`, { method: 'DELETE' })
  await router.push('/world/crm/task-requests')
}
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.actions.createLead')"
      action-icon="mdi-account-plus-outline"
    >
      <template #right>
        <div v-if="isViewMode && data" class="d-flex flex-column ga-2">
          <p class="text-caption mb-1">{{ t('world.crm.taskRequests.form.description') }}</p>
          <p class="text-body-2 mb-0">{{ data.description || '—' }}</p>
        </div>
      </template>
    </WorldModuleShell>
    <v-container fluid>
      <CrmPageSkeleton v-if="pending" variant="detail" />
      <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.taskRequests.alerts.notFound') }}</v-alert>
      <v-row v-else-if="data">
        <v-col cols="12">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card">
            <template v-if="isViewMode && data">
              <div class="d-flex justify-space-between align-start ga-2 mb-4">
                <h2 class="text-h6 mb-0">{{ data.title }}</h2>
                <v-chip color="info" variant="tonal">{{ data.status }}</v-chip>
              </div>
              <div class="d-flex flex-wrap ga-2 mb-4">
                <v-chip color="primary" variant="outlined">Task: {{ data.taskId }}</v-chip>
                <v-chip color="secondary" variant="outlined">Repo: {{ data.repositoryId }}</v-chip>
                <v-chip variant="tonal">Resolved: {{ data.resolvedAt || '—' }}</v-chip>
                <v-chip variant="tonal">Assignees: {{ data.assignees?.length || 0 }}</v-chip>
                <v-chip variant="tonal">Files: {{ data.attachments?.length || 0 }}</v-chip>
              </div>
              <div class="mb-4">
                <h3 class="text-subtitle-1 mb-2">Attachments</h3>
                <v-list
                  v-if="data.attachments?.length"
                  density="compact"
                  class="bg-transparent pa-0"
                >
                  <v-list-item
                    v-for="(attachment, index) in data.attachments || []"
                    :key="attachment.id || attachment.url || attachment.name || index"
                    :title="attachment.originalName || attachment.name || attachment.url || `Attachment ${index + 1}`"
                    :subtitle="attachment.mimeType || ''"
                    :href="attachment.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    prepend-icon="mdi-download"
                    class="px-0"
                  />
                </v-list>
                <v-alert v-else type="info" variant="tonal" density="comfortable">
                  No attachments
                </v-alert>
              </div>
              <v-divider class="my-4" />
              <div>
                <h3 class="text-subtitle-1 mb-2">Blog</h3>
                <p class="text-body-2 mb-3">
                  {{ data.blog?.title || '—' }}
                </p>
                <div v-if="data.blog?.posts?.length" class="d-flex flex-column ga-3">
                  <v-card
                    v-for="post in data.blog.posts"
                    :key="post.id"
                    variant="outlined"
                    rounded="lg"
                    class="pa-3"
                  >
                    <p class="text-subtitle-2 mb-2">{{ post.title }}</p>
                    <v-list density="compact" class="bg-transparent pa-0">
                      <v-list-item
                        v-for="comment in post.comments || []"
                        :key="comment.id"
                        class="px-0"
                      >
                        <template #title>
                          <span class="text-body-2">{{ comment.content }}</span>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </div>
                <v-alert v-else type="info" variant="tonal" density="comfortable">
                  No blog post yet for this task request.
                </v-alert>
              </div>
            </template>
            <template v-else-if="data">
              <v-row>
                <v-col cols="12"><v-text-field v-model="payload.title" :label="t('world.crm.taskRequests.form.title')" /></v-col>
                <v-col cols="12"><v-textarea v-model="payload.description" :label="t('world.crm.taskRequests.form.description')" /></v-col>
                <v-col cols="12" md="6"><AppSelect v-model="payload.status" :items="statusOptions" :label="t('world.crm.taskRequests.form.status')" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="payload.resolvedAt" :label="t('world.crm.taskRequests.form.resolvedAt')" type="date" /></v-col>
              </v-row>
              <div class="d-flex ga-2">
                <v-btn color="primary" @click="save">{{ t('world.crm.taskRequests.actions.save') }}</v-btn>
                <v-btn color="error" variant="tonal" @click="remove">{{ t('world.crm.taskRequests.actions.delete') }}</v-btn>
              </div>
            </template>
          </v-card>
        </v-col>
        <v-col v-if="hasBlogPlugin" cols="12">
          <CrmBlogCard />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
