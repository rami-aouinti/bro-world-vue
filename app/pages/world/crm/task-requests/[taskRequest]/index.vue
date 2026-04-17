<script setup lang="ts">
import type { CrmTaskRequestItem, CrmTaskRequestUpdatePayload } from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
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
  <v-container fluid>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/task-requests')">Retour</v-btn>
    <v-alert v-if="pending" type="info" variant="tonal">Chargement...</v-alert>
    <v-alert v-else-if="error" type="error" variant="tonal">Introuvable.</v-alert>
    <v-card v-else rounded="xl" class="pa-4 postcard-gradient-card">
      <v-row>
        <v-col cols="12"><v-text-field v-model="payload.title" label="Titre" /></v-col>
        <v-col cols="12"><v-textarea v-model="payload.description" label="Description" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.status" label="Status" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.resolvedAt" label="ResolvedAt (ISO)" /></v-col>
      </v-row>
      <div class="d-flex ga-2">
        <v-btn color="primary" @click="save">Sauvegarder</v-btn>
        <v-btn color="error" variant="tonal" @click="remove">Supprimer</v-btn>
      </div>
    </v-card>
  </v-container>
</template>
