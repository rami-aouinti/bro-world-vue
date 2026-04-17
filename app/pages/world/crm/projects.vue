<script setup lang="ts">
import type {
  ApiListResponse,
  CrmIdResponse,
  CrmProjectCreatePayload,
  CrmProjectListItem,
} from '~~/server/types/api/crm-general'

definePageMeta({ title: 'CRM Projects' })

const router = useRouter()

const createDialog = ref(false)
const pendingCreate = ref(false)
const createPayload = reactive<CrmProjectCreatePayload>({
  companyId: '',
  name: '',
  code: '',
  description: '',
  status: 'planned',
  startedAt: '',
  dueAt: '',
})

const { data, pending, error, refresh } = await useFetch<ApiListResponse<CrmProjectListItem>>(
  '/api/crm/general/projects',
)

const crmNavItems = [
  { title: 'Overview CRM', to: '/world/crm', icon: 'mdi-view-dashboard-outline' },
  { title: 'Projects', to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: 'Tasks', to: '/world/crm/tasks', icon: 'mdi-format-list-checks' },
  { title: 'Sprints', to: '/world/crm/sprints', icon: 'mdi-run-fast' },
  { title: 'Company', to: '/world/crm/company', icon: 'mdi-domain' },
  { title: 'Admin', to: '/world/crm/admin', icon: 'mdi-shield-crown-outline' },
]

async function createProject() {
  pendingCreate.value = true
  try {
    await $fetch<CrmIdResponse>('/api/crm/general/projects', {
      method: 'POST',
      body: {
        ...createPayload,
        startedAt: createPayload.startedAt || undefined,
        dueAt: createPayload.dueAt || undefined,
      },
    })
    createDialog.value = false
    await refresh()
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
      module-description="Gestion complète des projets CRM"
      :nav-items="crmNavItems"
      action-label="Nouveau projet"
      action-icon="mdi-folder-plus-outline"
      @action="createDialog = true"
    />

    <v-container fluid>
      <v-alert v-if="pending" type="info" variant="tonal" class="mb-4">Chargement des projets...</v-alert>
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">Erreur de chargement des projets.</v-alert>

      <v-row v-else>
        <v-col v-for="project in data?.items ?? []" :key="project.id" cols="12" md="6" xl="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100 d-flex flex-column">
            <div class="d-flex justify-space-between align-start ga-2 mb-2">
              <h3 class="text-subtitle-1 mb-0">{{ project.name }}</h3>
              <v-chip size="small" color="primary" variant="tonal">{{ project.status }}</v-chip>
            </div>
            <p class="text-body-2 mb-1">Repos GitHub: {{ project.githubRepositoriesCount }}</p>
            <p class="text-body-2 mb-4">Provisioning: {{ project.provisioning.state }}</p>
            <v-spacer />
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-arrow-right" @click="router.push(`/world/crm/projects/${project.id}`)">
              Voir détail
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <AppModal v-model="createDialog" title="Créer un projet" :max-width="720">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.companyId" label="Company ID" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.name" label="Nom" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.code" label="Code" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.status" label="Status" /></v-col>
        <v-col cols="12"><v-textarea v-model="createPayload.description" label="Description" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.startedAt" label="StartedAt (ISO)" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.dueAt" label="DueAt (ISO)" /></v-col>
      </v-row>
      <template #actions>
        <v-btn variant="text" @click="createDialog = false">Annuler</v-btn>
        <v-btn color="primary" :loading="pendingCreate" @click="createProject">Créer</v-btn>
      </template>
    </AppModal>
  </div>
</template>
