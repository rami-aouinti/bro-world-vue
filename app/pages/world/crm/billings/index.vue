<script setup lang="ts">
import type { ApiListResponse, CrmBillingItem } from '~~/server/types/api/crm-general'

const router = useRouter()
definePageMeta({ title: 'CRM Billings' })

const { data, pending, error } = await useFetch<ApiListResponse<CrmBillingItem>>('/api/crm/general/billings')
</script>

<template>
  <v-container fluid>
    <h1 class="text-h5 mb-4">Billings</h1>
    <v-alert v-if="pending" type="info" variant="tonal">Chargement...</v-alert>
    <v-alert v-else-if="error" type="error" variant="tonal">Erreur de chargement.</v-alert>
    <v-row v-else>
      <v-col v-for="billing in data?.items ?? []" :key="billing.id" cols="12" md="6" lg="4">
        <v-card rounded="xl" class="pa-4 postcard-gradient-card">
          <p class="text-subtitle-1 mb-1">{{ billing.label }}</p>
          <p class="text-body-2 mb-1">{{ billing.amount }} {{ billing.currency }}</p>
          <p class="text-body-2 mb-3">Status: {{ billing.status }}</p>
          <v-btn color="primary" variant="tonal" @click="router.push(`/world/crm/billings/${billing.id}`)">Détail</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
