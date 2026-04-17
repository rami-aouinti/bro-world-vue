<script setup lang="ts">
import type { CrmBillingItem, CrmBillingUpdatePayload } from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const billingId = computed(() => String(route.params.billing ?? ''))

definePageMeta({ title: 'CRM Billing Detail' })

const payload = reactive<CrmBillingUpdatePayload>({})
const { data, pending, error, refresh } = await useFetch<CrmBillingItem>(() => `/api/crm/general/billings/${billingId.value}`)

watchEffect(() => {
  if (!data.value) return
  Object.assign(payload, {
    label: data.value.label,
    amount: data.value.amount,
    currency: data.value.currency,
    status: data.value.status,
    dueAt: data.value.dueAt,
    paidAt: data.value.paidAt,
  })
})

async function save() {
  await $fetch(`/api/crm/general/billings/${billingId.value}`, { method: 'PATCH', body: payload })
  await refresh()
}

async function remove() {
  await $fetch(`/api/crm/general/billings/${billingId.value}`, { method: 'DELETE' })
  await router.push('/world/crm/billings')
}
</script>

<template>
  <v-container fluid>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/billings')">{{ t('world.crm.billings.actions.backToList') }}</v-btn>
    <v-alert v-if="pending" type="info" variant="tonal">{{ t('world.crm.billings.alerts.loading') }}</v-alert>
    <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.billings.alerts.notFound') }}</v-alert>
    <v-card v-else rounded="xl" class="pa-4 postcard-gradient-card">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="payload.label" :label="t('world.crm.billings.form.label')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.amount" :label="t('world.crm.billings.form.amount')" type="number" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.currency" :label="t('world.crm.billings.form.currency')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.status" :label="t('world.crm.billings.form.status')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.dueAt" :label="t('world.crm.billings.form.dueAt')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.paidAt" :label="t('world.crm.billings.form.paidAt')" /></v-col>
      </v-row>
      <div class="d-flex ga-2">
        <v-btn color="primary" @click="save">{{ t('world.crm.billings.actions.save') }}</v-btn>
        <v-btn color="error" variant="tonal" @click="remove">{{ t('world.crm.billings.actions.delete') }}</v-btn>
      </div>
    </v-card>
  </v-container>
</template>
