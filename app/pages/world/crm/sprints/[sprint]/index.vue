<script setup lang="ts">
import type {
  CrmIdResponse,
  CrmSprintItem,
  CrmSprintUpdatePayload,
} from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
const sprintId = computed(() => String(route.params.sprint ?? ''))

definePageMeta({ title: 'CRM Sprint Detail' })

const payload = reactive<CrmSprintUpdatePayload>({})
const assigneeId = ref('')
const taskId = ref('')

const { data, pending, error, refresh } = await useFetch<CrmSprintItem>(
  () => `/api/crm/general/sprints/${sprintId.value}`,
)

watchEffect(() => {
  if (!data.value) return
  Object.assign(payload, {
    name: data.value.name,
    goal: data.value.goal,
    status: data.value.status,
    startDate: data.value.startDate,
    endDate: data.value.endDate,
  })
})

async function save() {
  await $fetch<CrmIdResponse>(`/api/crm/general/sprints/${sprintId.value}`, {
    method: 'PATCH',
    body: payload,
  })
  await refresh()
}

async function remove() {
  await $fetch(`/api/crm/general/sprints/${sprintId.value}`, { method: 'DELETE' })
  await router.push('/world/crm/sprints')
}

async function attachAssignee() {
  if (!assigneeId.value.trim()) return
  await $fetch(`/api/crm/general/sprints/${sprintId.value}/assignees/${encodeURIComponent(assigneeId.value.trim())}`, { method: 'PUT' })
  assigneeId.value = ''
}

async function detachAssignee() {
  if (!assigneeId.value.trim()) return
  await $fetch(`/api/crm/general/sprints/${sprintId.value}/assignees/${encodeURIComponent(assigneeId.value.trim())}`, { method: 'DELETE' })
  assigneeId.value = ''
}

async function attachTask() {
  if (!taskId.value.trim()) return
  await $fetch(`/api/crm/general/sprints/${sprintId.value}/tasks/${encodeURIComponent(taskId.value.trim())}`, { method: 'PUT' })
  taskId.value = ''
}

async function detachTask() {
  if (!taskId.value.trim()) return
  await $fetch(`/api/crm/general/sprints/${sprintId.value}/tasks/${encodeURIComponent(taskId.value.trim())}`, { method: 'DELETE' })
  taskId.value = ''
}
</script>

<template>
  <v-container fluid>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/sprints')">Retour</v-btn>
    <v-alert v-if="pending" type="info" variant="tonal">Chargement du sprint...</v-alert>
    <v-alert v-else-if="error" type="error" variant="tonal">Sprint introuvable.</v-alert>

    <v-row v-else-if="data">
      <v-col cols="12" lg="8">
        <v-card rounded="xl" class="pa-4 postcard-gradient-card">
          <h2 class="text-h6 mb-4">{{ data.name }}</h2>
          <v-row>
            <v-col cols="12" md="6"><v-text-field v-model="payload.name" label="Nom" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="payload.status" label="Status" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="payload.startDate" label="StartDate (ISO)" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="payload.endDate" label="EndDate (ISO)" /></v-col>
            <v-col cols="12"><v-textarea v-model="payload.goal" label="Goal" /></v-col>
          </v-row>
          <div class="d-flex ga-2">
            <v-btn color="primary" @click="save">Sauvegarder</v-btn>
            <v-btn color="error" variant="tonal" @click="remove">Supprimer</v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
          <h3 class="text-subtitle-1 mb-3">Assignees</h3>
          <v-text-field v-model="assigneeId" label="User ID" />
          <div class="d-flex ga-2">
            <v-btn size="small" color="secondary" variant="tonal" @click="attachAssignee">Attach</v-btn>
            <v-btn size="small" color="error" variant="tonal" @click="detachAssignee">Detach</v-btn>
          </div>
        </v-card>

        <v-card rounded="xl" class="pa-4 postcard-gradient-card">
          <h3 class="text-subtitle-1 mb-3">Tasks</h3>
          <v-text-field v-model="taskId" label="Task ID" />
          <div class="d-flex ga-2">
            <v-btn size="small" color="secondary" variant="tonal" @click="attachTask">Attach</v-btn>
            <v-btn size="small" color="error" variant="tonal" @click="detachTask">Detach</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
