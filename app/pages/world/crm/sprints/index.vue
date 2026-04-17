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

const { locale } = useI18n()
const router = useRouter()
const createDialog = ref(false)
const pendingCreate = ref(false)
const createPayload = reactive<CrmSprintCreatePayload>({
  projectId: '',
  name: '',
  goal: '',
  status: 'planned',
})

const crmNavItems = [
  {
    title: 'Overview CRM',
    to: '/world/crm',
    icon: 'mdi-view-dashboard-outline',
  },
  { title: 'Projects', to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: 'Tasks', to: '/world/crm/tasks', icon: 'mdi-format-list-checks' },
  { title: 'Sprints', to: '/world/crm/sprints', icon: 'mdi-run-fast' },
  { title: 'Company', to: '/world/crm/company', icon: 'mdi-domain' },
  { title: 'Admin', to: '/world/crm/admin', icon: 'mdi-shield-crown-outline' },
]

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
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      module-description="Liste publique des sprints CRM"
      :nav-items="crmNavItems"
      action-label="Create sprint"
      action-icon="mdi-plus"
      @action="createDialog = true"
    />

    <v-container fluid>
      <v-alert v-if="pending" type="info" variant="tonal" class="mb-4"
        >Chargement des sprints...</v-alert
      >
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4"
        >Erreur de chargement des sprints.</v-alert
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
              Start: {{ formatDate(sprint.startDate) }}
            </p>
            <p class="text-body-2 mb-0">
              End: {{ formatDate(sprint.endDate) }}
            </p>
            <v-btn
              class="mt-3"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-arrow-right"
              @click="router.push(`/world/crm/sprints/${sprint.id}`)"
            >
              Voir détail
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <AppModal v-model="createDialog" title="Créer un sprint" :max-width="720">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.projectId" label="Project ID" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.name" label="Nom" required /></v-col>
        <v-col cols="12"><v-textarea v-model="createPayload.goal" label="Goal" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.status" label="Status" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.startDate" label="StartDate (ISO)" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.endDate" label="EndDate (ISO)" /></v-col>
      </v-row>
      <template #actions>
        <v-btn variant="text" @click="createDialog = false">Annuler</v-btn>
        <v-btn color="primary" :loading="pendingCreate" @click="createSprint">Créer</v-btn>
      </template>
    </AppModal>
  </div>
</template>
