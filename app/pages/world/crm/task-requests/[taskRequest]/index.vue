<script setup lang="ts">
import type { CrmTaskRequestItem, CrmTaskRequestUpdatePayload } from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const id = computed(() => String(route.params.taskRequest ?? ''))

definePageMeta({ title: 'CRM Task Request Detail' })

const payload = reactive<CrmTaskRequestUpdatePayload>({})
const { data, pending, error, refresh } = await useFetch<CrmTaskRequestItem>(() => `/api/crm/general/task-requests/${id.value}`)

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
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/task-requests')">{{ t('world.crm.taskRequests.actions.backToList') }}</v-btn>
      <v-alert v-if="pending" type="info" variant="tonal">{{ t('world.crm.taskRequests.alerts.loadingDetail') }}</v-alert>
      <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.taskRequests.alerts.notFound') }}</v-alert>
      <v-card v-else rounded="xl" class="pa-4 postcard-gradient-card">
        <v-row>
          <v-col cols="12"><v-text-field v-model="payload.title" :label="t('world.crm.taskRequests.form.title')" /></v-col>
          <v-col cols="12"><v-textarea v-model="payload.description" :label="t('world.crm.taskRequests.form.description')" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="payload.status" :label="t('world.crm.taskRequests.form.status')" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="payload.resolvedAt" :label="t('world.crm.taskRequests.form.resolvedAt')" /></v-col>
        </v-row>
        <div class="d-flex ga-2">
          <v-btn color="primary" @click="save">{{ t('world.crm.taskRequests.actions.save') }}</v-btn>
          <v-btn color="error" variant="tonal" @click="remove">{{ t('world.crm.taskRequests.actions.delete') }}</v-btn>
        </div>
      </v-card>
    </v-container>
  </div>
</template>
