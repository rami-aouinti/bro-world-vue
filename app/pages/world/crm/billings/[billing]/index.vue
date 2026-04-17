<script setup lang="ts">
import type { CrmBillingItem, CrmBillingUpdatePayload } from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
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
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/billings')">Retour</v-btn>
    <v-alert v-if="pending" type="info" variant="tonal">Chargement...</v-alert>
    <v-alert v-else-if="error" type="error" variant="tonal">Introuvable.</v-alert>
    <v-card v-else rounded="xl" class="pa-4 postcard-gradient-card">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="payload.label" label="Label" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.amount" label="Amount" type="number" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.currency" label="Currency" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.status" label="Status" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.dueAt" label="DueAt (ISO)" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.paidAt" label="PaidAt (ISO)" /></v-col>
      </v-row>
      <div class="d-flex ga-2">
        <v-btn color="primary" @click="save">Sauvegarder</v-btn>
        <v-btn color="error" variant="tonal" @click="remove">Supprimer</v-btn>
      </div>
    </v-card>
  </v-container>
</template>
