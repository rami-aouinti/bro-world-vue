<script setup lang="ts">
import type {
  ApiListResponse,
  CrmCompanyCreatePayload,
  CrmCompanyItem,
  CrmIdResponse,
} from '~~/server/types/api/crm-general'

const router = useRouter()
definePageMeta({ title: 'CRM Companies' })

const createDialog = ref(false)
const pendingCreate = ref(false)
const createPayload = reactive<CrmCompanyCreatePayload>({
  crmId: '',
  name: '',
  industry: '',
  website: '',
  contactEmail: '',
  phone: '',
})

const { data, pending, error, refresh } = await useFetch<ApiListResponse<CrmCompanyItem>>(
  '/api/crm/general/companies',
)

const crmNavItems = [
  { title: 'Overview CRM', to: '/world/crm', icon: 'mdi-view-dashboard-outline' },
  { title: 'Projects', to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: 'Tasks', to: '/world/crm/tasks', icon: 'mdi-format-list-checks' },
  { title: 'Sprints', to: '/world/crm/sprints', icon: 'mdi-run-fast' },
  { title: 'Company', to: '/world/crm/company', icon: 'mdi-domain' },
  { title: 'Admin', to: '/world/crm/admin', icon: 'mdi-shield-crown-outline' },
]

async function createCompany() {
  pendingCreate.value = true
  try {
    await $fetch<CrmIdResponse>('/api/crm/general/companies', {
      method: 'POST',
      body: createPayload,
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
      module-description="Gestion des entreprises CRM"
      :nav-items="crmNavItems"
      action-label="Ajouter entreprise"
      action-icon="mdi-domain-plus"
      @action="createDialog = true"
    />

    <v-container fluid>
      <v-alert v-if="pending" type="info" variant="tonal">Chargement des entreprises...</v-alert>
      <v-alert v-else-if="error" type="error" variant="tonal">Erreur de chargement des entreprises.</v-alert>

      <v-row v-else>
        <v-col v-for="company in data?.items ?? []" :key="company.id" cols="12" md="6" xl="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
            <h3 class="text-subtitle-1 mb-1">{{ company.name }}</h3>
            <p class="text-body-2 mb-1">{{ company.industry }}</p>
            <p class="text-body-2 mb-1">{{ company.contactEmail }}</p>
            <p class="text-body-2 mb-4">{{ company.phone }}</p>
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-arrow-right" @click="router.push(`/world/crm/company/${company.id}`)">Voir détail</v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <AppModal v-model="createDialog" title="Créer une entreprise" :max-width="720">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.crmId" label="CRM ID" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.name" label="Nom" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.industry" label="Industrie" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.website" label="Website" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.contactEmail" label="Email" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.phone" label="Phone" /></v-col>
      </v-row>
      <template #actions>
        <v-btn variant="text" @click="createDialog = false">Annuler</v-btn>
        <v-btn color="primary" :loading="pendingCreate" @click="createCompany">Créer</v-btn>
      </template>
    </AppModal>
  </div>
</template>
