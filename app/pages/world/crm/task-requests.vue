<script setup lang="ts">
import type {
  ApiListResponse,
  CrmIdResponse,
  CrmTaskRequestCreatePayload,
  CrmTaskRequestItem,
} from '~~/server/types/api/crm-general'

const router = useRouter()
definePageMeta({ title: 'CRM Task Requests' })

const createDialog = ref(false)
const payload = reactive<CrmTaskRequestCreatePayload>({
  taskId: '',
  repositoryId: '',
  title: '',
  description: '',
  status: 'pending',
})

const { data, pending, error, refresh } = await useFetch<ApiListResponse<CrmTaskRequestItem>>('/api/crm/general/task-requests')

async function createRequest() {
  await $fetch<CrmIdResponse>('/api/crm/general/task-requests', {
    method: 'POST',
    body: payload,
  })
  createDialog.value = false
  await refresh()
}
</script>

<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5">Task Requests</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="createDialog = true">Nouveau</v-btn>
    </div>

    <v-alert v-if="pending" type="info" variant="tonal">Chargement...</v-alert>
    <v-alert v-else-if="error" type="error" variant="tonal">Erreur de chargement.</v-alert>
    <v-row v-else>
      <v-col v-for="request in data?.items ?? []" :key="request.id" cols="12" md="6" lg="4">
        <v-card rounded="xl" class="pa-4 postcard-gradient-card">
          <p class="text-subtitle-1 mb-1">{{ request.title }}</p>
          <p class="text-body-2 mb-1">{{ request.status }}</p>
          <p class="text-body-2 mb-3">Task: {{ request.taskId }}</p>
          <v-btn color="primary" variant="tonal" @click="router.push(`/world/crm/task-requests/${request.id}`)">Détail</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <AppModal v-model="createDialog" title="Créer une demande" :max-width="720">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="payload.taskId" label="Task ID" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="payload.repositoryId" label="Repository ID" required /></v-col>
        <v-col cols="12"><v-text-field v-model="payload.title" label="Titre" required /></v-col>
        <v-col cols="12"><v-textarea v-model="payload.description" label="Description" /></v-col>
      </v-row>
      <template #actions>
        <v-btn variant="text" @click="createDialog = false">Annuler</v-btn>
        <v-btn color="primary" @click="createRequest">Créer</v-btn>
      </template>
    </AppModal>
  </v-container>
</template>
