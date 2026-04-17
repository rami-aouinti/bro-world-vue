<script setup lang="ts">
import type { CrmContactItem } from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
const contactId = computed(() => String(route.params.contact ?? ''))

definePageMeta({ title: 'CRM Contact Detail' })

const { data, pending, error } = await useFetch<CrmContactItem>(() => `/api/crm/general/contacts/${contactId.value}`)
</script>

<template>
  <v-container fluid>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/contacts')">Retour</v-btn>
    <v-alert v-if="pending" type="info" variant="tonal">Chargement...</v-alert>
    <v-alert v-else-if="error" type="error" variant="tonal">Introuvable.</v-alert>
    <v-card v-else rounded="xl" class="pa-4 postcard-gradient-card">
      <h2 class="text-h6 mb-3">{{ data?.firstName }} {{ data?.lastName }}</h2>
      <p class="text-body-2 mb-1">Email: {{ data?.email }}</p>
      <p class="text-body-2 mb-1">Téléphone: {{ data?.phone }}</p>
      <p class="text-body-2 mb-1">Ville: {{ data?.city }}</p>
      <p class="text-body-2 mb-0">Score: {{ data?.score }}</p>
    </v-card>
  </v-container>
</template>
