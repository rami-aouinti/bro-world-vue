<script setup lang="ts">
import type {
  CrmCompanyItem,
  CrmCompanyUpdatePayload,
  CrmIdResponse,
} from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const companyId = computed(() => String(route.params.company ?? ''))

definePageMeta({ title: 'CRM Company Detail' })

const payload = reactive<CrmCompanyUpdatePayload>({})
const pendingSave = ref(false)

const { data, pending, error, refresh } = await useFetch<CrmCompanyItem>(
  () => `/api/crm/general/companies/${companyId.value}`,
)

watchEffect(() => {
  if (!data.value) return
  Object.assign(payload, {
    name: data.value.name,
    industry: data.value.industry,
    website: data.value.website,
    contactEmail: data.value.contactEmail,
    phone: data.value.phone,
  })
})

async function save() {
  pendingSave.value = true
  try {
    await $fetch<CrmIdResponse>(`/api/crm/general/companies/${companyId.value}`, {
      method: 'PATCH',
      body: payload,
    })
    await refresh()
  } finally {
    pendingSave.value = false
  }
}

async function remove() {
  await $fetch(`/api/crm/general/companies/${companyId.value}`, { method: 'DELETE' })
  await router.push('/world/crm/company')
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.actions.createLead')"
      action-icon="mdi-account-plus-outline"
    >
      <template #right />
    </WorldModuleDrawers>
    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/company')">{{ t('world.crm.company.actions.backToList') }}</v-btn>
      <v-alert v-if="pending" type="info" variant="tonal">{{ t('world.crm.company.alerts.loadingDetail') }}</v-alert>
      <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.company.alerts.notFound') }}</v-alert>

      <v-card v-else rounded="xl" class="pa-4 postcard-gradient-card">
        <h2 class="text-h6 mb-4">{{ data?.name }}</h2>
        <v-row>
          <v-col cols="12" md="6"><v-text-field v-model="payload.name" :label="t('world.crm.company.form.name')" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="payload.industry" :label="t('world.crm.company.form.industry')" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="payload.website" :label="t('world.crm.company.form.website')" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="payload.contactEmail" :label="t('world.crm.company.form.email')" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="payload.phone" :label="t('world.crm.company.form.phone')" /></v-col>
        </v-row>
        <div class="d-flex ga-2">
          <v-btn color="primary" :loading="pendingSave" @click="save">{{ t('world.crm.company.actions.save') }}</v-btn>
          <v-btn color="error" variant="tonal" @click="remove">{{ t('world.crm.company.actions.delete') }}</v-btn>
        </div>
      </v-card>
    </v-container>
  </div>
</template>
