<script setup lang="ts">
import type { CrmIdResponse, CrmTaskCreatePayload } from '~~/server/types/api/crm-general'

interface CrmTaskItem {
  id: string
  title: string
  status: string
  priority: string
  projectName: string
  sprintName: string
  dueAt: string | null
  estimatedHours: number | null
  updatedAt: string
  attachments: Array<{ id?: string }>
  children: Array<{ id: string; status: string }>
}

interface CrmTaskResponse {
  items: CrmTaskItem[]
}

definePageMeta({ title: 'CRM Tasks' })

const { locale, t } = useI18n()
const router = useRouter()
const { crmNavItems } = useWorldCrmNavItems()
const createDialog = ref(false)
const pendingCreate = ref(false)
const createPayload = reactive<CrmTaskCreatePayload>({
  projectId: '',
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
})


const { data, pending, error } = await useFetch<CrmTaskResponse>(
  '/api/crm/general/tasks',
)

function formatDate(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

async function createTask() {
  pendingCreate.value = true
  try {
    await $fetch<CrmIdResponse>('/api/crm/general/tasks', {
      method: 'POST',
      body: createPayload,
    })
    createDialog.value = false
    await refreshNuxtData('/api/crm/general/tasks')
  } finally {
    pendingCreate.value = false
  }
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.tasks.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.tasks.actions.create')"
      action-icon="mdi-plus"
      @action="createDialog = true"
    />

    <v-container fluid>
      <v-alert v-if="pending" type="info" variant="tonal" class="mb-4"
        >{{ t('world.crm.tasks.alerts.loadingList') }}</v-alert
      >
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4"
        >{{ t('world.crm.tasks.alerts.loadListError') }}</v-alert
      >

      <v-row v-else>
        <v-col
          v-for="task in data?.items ?? []"
          :key="task.id"
          cols="12"
          md="6"
          xl="4"
        >
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
            <div class="d-flex align-start justify-space-between ga-2 mb-2">
              <h3 class="text-subtitle-1 mb-0">{{ task.title }}</h3>
              <v-chip size="small" color="primary" variant="tonal">{{
                task.status
              }}</v-chip>
            </div>
            <p class="text-body-2 mb-1">{{ t('world.crm.tasks.list.project') }}: {{ task.projectName }}</p>
            <p class="text-body-2 mb-1">{{ t('world.crm.tasks.list.sprint') }}: {{ task.sprintName }}</p>
            <p class="text-body-2 mb-1">{{ t('world.crm.tasks.list.priority') }}: {{ task.priority }}</p>
            <p class="text-body-2 mb-1">{{ t('world.crm.tasks.list.due') }}: {{ formatDate(task.dueAt) }}</p>
            <p class="text-body-2 mb-0">
              {{ task.estimatedHours }}h ·
              {{ task.attachments.length }} {{ t('world.crm.tasks.list.attachments') }} ·
              {{ task.children.length }} {{ t('world.crm.tasks.list.subtasks') }}
            </p>
            <v-btn
              class="mt-3"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-arrow-right"
              @click="router.push(`/world/crm/tasks/${task.id}`)"
            >
              {{ t('world.crm.tasks.actions.viewDetails') }}
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <AppModal v-model="createDialog" :title="t('world.crm.tasks.modal.createTitle')" :max-width="720">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.projectId" :label="t('world.crm.tasks.form.projectId')" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.title" :label="t('world.crm.tasks.form.title')" required /></v-col>
        <v-col cols="12"><v-textarea v-model="createPayload.description" :label="t('world.crm.tasks.form.description')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.status" :label="t('world.crm.tasks.form.status')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.priority" :label="t('world.crm.tasks.form.priority')" /></v-col>
      </v-row>
      <template #actions>
        <v-btn variant="text" @click="createDialog = false">{{ t('world.crm.tasks.actions.cancel') }}</v-btn>
        <v-btn color="primary" :loading="pendingCreate" @click="createTask">{{ t('world.crm.tasks.actions.create') }}</v-btn>
      </template>
    </AppModal>
  </div>
</template>
