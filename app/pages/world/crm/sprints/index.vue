<script setup lang="ts">
import type { CrmIdResponse, CrmSprintCreatePayload } from '~~/server/types/api/crm-general'

interface CrmSprintItem {
  id: string
  name: string
  status: string
  startDate: string
  endDate: string
  projectId: string
}

interface CrmSprintResponse {
  items: CrmSprintItem[]
}

definePageMeta({ title: 'CRM Sprints' })

const { locale, t } = useI18n()
const router = useRouter()
const { crmNavItems } = useWorldCrmNavItems()
const createDialog = ref(false)
const pendingCreate = ref(false)
const createPayload = reactive<CrmSprintCreatePayload>({
  projectId: '',
  name: '',
  goal: '',
  status: 'planned',
})


const { data, pending, error } = await useFetch<CrmSprintResponse>(
  '/api/crm/general/sprints',
)

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

async function createSprint() {
  pendingCreate.value = true
  try {
    await $fetch<CrmIdResponse>('/api/crm/general/sprints', {
      method: 'POST',
      body: createPayload,
    })
    createDialog.value = false
    await refreshNuxtData('/api/crm/general/sprints')
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
      :module-description="t('world.crm.sprints.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.sprints.actions.create')"
      action-icon="mdi-plus"
      @action="createDialog = true"
    />

    <v-container fluid>
      <v-alert v-if="pending" type="info" variant="tonal" class="mb-4"
        >{{ t('world.crm.sprints.alerts.loadingList') }}</v-alert
      >
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4"
        >{{ t('world.crm.sprints.alerts.loadListError') }}</v-alert
      >

      <v-row v-else>
        <v-col
          v-for="sprint in data?.items ?? []"
          :key="sprint.id"
          cols="12"
          md="6"
          xl="4"
        >
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
            <div class="d-flex align-start justify-space-between ga-2 mb-2">
              <h3 class="text-subtitle-1 mb-0">{{ sprint.name }}</h3>
              <v-chip size="small" color="secondary" variant="tonal">{{
                sprint.status
              }}</v-chip>
            </div>
            <p class="text-body-2 mb-1">
              {{ t('world.crm.sprints.list.start') }}: {{ formatDate(sprint.startDate) }}
            </p>
            <p class="text-body-2 mb-0">
              {{ t('world.crm.sprints.list.end') }}: {{ formatDate(sprint.endDate) }}
            </p>
            <v-btn
              class="mt-3"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-arrow-right"
              @click="router.push(`/world/crm/sprints/${sprint.id}`)"
            >
              {{ t('world.crm.sprints.actions.viewDetails') }}
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <AppModal v-model="createDialog" :title="t('world.crm.sprints.modal.createTitle')" :max-width="720">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.projectId" :label="t('world.crm.sprints.form.projectId')" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.name" :label="t('world.crm.sprints.form.name')" required /></v-col>
        <v-col cols="12"><v-textarea v-model="createPayload.goal" :label="t('world.crm.sprints.form.goal')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.status" :label="t('world.crm.sprints.form.status')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.startDate" :label="t('world.crm.sprints.form.startDate')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.endDate" :label="t('world.crm.sprints.form.endDate')" /></v-col>
      </v-row>
      <template #actions>
        <v-btn variant="text" @click="createDialog = false">{{ t('world.crm.sprints.actions.cancel') }}</v-btn>
        <v-btn color="primary" :loading="pendingCreate" @click="createSprint">{{ t('world.crm.sprints.actions.create') }}</v-btn>
      </template>
    </AppModal>
  </div>
</template>
