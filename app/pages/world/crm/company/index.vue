<script setup lang="ts">
import type {
  ApiListResponse,
  CrmCompanyCreatePayload,
  CrmCompanyItem,
  CrmIdResponse,
} from '~~/server/types/api/crm-general'

const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
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
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.company.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.company.actions.addCompany')"
      action-icon="mdi-domain-plus"
      @action="createDialog = true"
    />

    <v-container fluid>
      <v-alert v-if="pending" type="info" variant="tonal">{{ t('world.crm.company.alerts.loadingList') }}</v-alert>
      <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.company.alerts.loadListError') }}</v-alert>

      <v-row v-else>
        <v-col v-for="company in data?.items ?? []" :key="company.id" cols="12" md="6" xl="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
            <h3 class="text-subtitle-1 mb-1">{{ company.name }}</h3>
            <p class="text-body-2 mb-1">{{ company.industry }}</p>
            <p class="text-body-2 mb-1">{{ company.contactEmail }}</p>
            <p class="text-body-2 mb-4">{{ company.phone }}</p>
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-arrow-right" @click="router.push(`/world/crm/company/${company.id}`)">{{ t('world.crm.company.actions.viewDetails') }}</v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <AppModal v-model="createDialog" :title="t('world.crm.company.modal.createTitle')" :max-width="720">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.crmId" :label="t('world.crm.company.form.crmId')" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.name" :label="t('world.crm.company.form.name')" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.industry" :label="t('world.crm.company.form.industry')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.website" :label="t('world.crm.company.form.website')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.contactEmail" :label="t('world.crm.company.form.email')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.phone" :label="t('world.crm.company.form.phone')" /></v-col>
      </v-row>
      <template #actions>
        <v-btn variant="text" @click="createDialog = false">{{ t('world.crm.company.actions.cancel') }}</v-btn>
        <v-btn color="primary" :loading="pendingCreate" @click="createCompany">{{ t('world.crm.company.actions.create') }}</v-btn>
      </template>
    </AppModal>
  </div>
</template>
