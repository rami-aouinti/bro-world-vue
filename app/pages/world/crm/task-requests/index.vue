<script setup lang="ts">
import type {
  ApiListResponse,
  CrmIdResponse,
  CrmTaskRequestCreatePayload,
  CrmTaskRequestItem,
} from '~~/server/types/api/crm-general'

const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
definePageMeta({ title: 'CRM Task Requests' })

const createDialog = ref(false)
const payload = reactive<CrmTaskRequestCreatePayload>({
  taskId: '',
  repositoryId: '',
  title: '',
  description: '',
  status: 'pending',
})

const { data, pending, error, refresh } = await useFetch<ApiListResponse<CrmTaskRequestItem>>('/api/crm/general/task-requests')

async function createRequest() {
  await $fetch<CrmIdResponse>('/api/crm/general/task-requests', {
    method: 'POST',
    body: payload,
  })
  createDialog.value = false
  await refresh()
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.taskRequests.list.title')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.taskRequests.actions.new')"
      action-icon="mdi-plus"
      @action="createDialog = true"
    />
    <v-container fluid>
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h5">{{ t('world.crm.taskRequests.list.title') }}</h1>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="createDialog = true">{{ t('world.crm.taskRequests.actions.new') }}</v-btn>
      </div>

    <v-alert v-if="pending" type="info" variant="tonal">{{ t('world.crm.taskRequests.alerts.loadingList') }}</v-alert>
    <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.taskRequests.alerts.loadListError') }}</v-alert>
    <v-row v-else>
      <v-col v-for="request in data?.items ?? []" :key="request.id" cols="12" md="6" lg="4">
        <v-card rounded="xl" class="pa-4 postcard-gradient-card">
          <p class="text-subtitle-1 mb-1">{{ request.title }}</p>
          <p class="text-body-2 mb-1">{{ request.status }}</p>
          <p class="text-body-2 mb-3">{{ t('world.crm.taskRequests.list.task') }}: {{ request.taskId }}</p>
          <v-btn color="primary" variant="tonal" @click="router.push(`/world/crm/task-requests/${request.id}`)">{{ t('world.crm.taskRequests.actions.viewDetails') }}</v-btn>
        </v-card>
      </v-col>
    </v-row>

      <AppModal v-model="createDialog" :title="t('world.crm.taskRequests.modal.createTitle')" :max-width="720">
        <v-row>
          <v-col cols="12" md="6"><v-text-field v-model="payload.taskId" :label="t('world.crm.taskRequests.form.taskId')" required /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="payload.repositoryId" :label="t('world.crm.taskRequests.form.repositoryId')" required /></v-col>
          <v-col cols="12"><v-text-field v-model="payload.title" :label="t('world.crm.taskRequests.form.title')" required /></v-col>
          <v-col cols="12"><v-textarea v-model="payload.description" :label="t('world.crm.taskRequests.form.description')" /></v-col>
        </v-row>
        <template #actions>
          <v-btn variant="text" @click="createDialog = false">{{ t('world.crm.taskRequests.actions.cancel') }}</v-btn>
          <v-btn color="primary" @click="createRequest">{{ t('world.crm.taskRequests.actions.create') }}</v-btn>
        </template>
      </AppModal>
    </v-container>
  </div>
</template>
