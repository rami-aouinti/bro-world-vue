<script setup lang="ts">
import type {
  CrmIdResponse,
  CrmProjectItem,
  CrmProjectUpdatePayload,
} from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
const projectId = computed(() => String(route.params.project ?? ''))

definePageMeta({ title: 'CRM Project Detail' })

const editPayload = reactive<CrmProjectUpdatePayload>({})
const assigneeId = ref('')
const pendingSave = ref(false)

const { data, pending, error, refresh } = await useFetch<CrmProjectItem>(
  () => `/api/crm/general/projects/${projectId.value}`,
)

watchEffect(() => {
  if (!data.value) return
  Object.assign(editPayload, {
    name: data.value.name,
    code: data.value.code,
    description: data.value.description,
    status: data.value.status,
    startedAt: data.value.startedAt ?? undefined,
    dueAt: data.value.dueAt ?? undefined,
  })
})

async function saveProject() {
  pendingSave.value = true
  try {
    await $fetch<CrmIdResponse>(`/api/crm/general/projects/${projectId.value}`, {
      method: 'PATCH',
      body: editPayload,
    })
    await refresh()
  } finally {
    pendingSave.value = false
  }
}

async function deleteProject() {
  await $fetch(`/api/crm/general/projects/${projectId.value}`, { method: 'DELETE' })
  await router.push('/world/crm/projects')
}

async function attachAssignee() {
  if (!assigneeId.value.trim()) return
  await $fetch(`/api/crm/general/projects/${projectId.value}/assignees/${encodeURIComponent(assigneeId.value.trim())}`, { method: 'PUT' })
  assigneeId.value = ''
  await refresh()
}

async function detachAssignee(userId: string) {
  await $fetch(`/api/crm/general/projects/${projectId.value}/assignees/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  })
  await refresh()
}
</script>

<template>
  <v-container fluid>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/projects')">Retour</v-btn>

    <v-alert v-if="pending" type="info" variant="tonal">Chargement du projet...</v-alert>
    <v-alert v-else-if="error" type="error" variant="tonal">Projet introuvable.</v-alert>

    <v-row v-else-if="data">
      <v-col cols="12" lg="8">
        <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
          <h2 class="text-h6 mb-4">{{ data.name }}</h2>
          <v-row>
            <v-col cols="12" md="6"><v-text-field v-model="editPayload.name" label="Nom" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="editPayload.code" label="Code" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="editPayload.status" label="Status" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="editPayload.startedAt" label="StartedAt (ISO)" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="editPayload.dueAt" label="DueAt (ISO)" /></v-col>
            <v-col cols="12"><v-textarea v-model="editPayload.description" label="Description" /></v-col>
          </v-row>
          <div class="d-flex ga-2">
            <v-btn color="primary" :loading="pendingSave" @click="saveProject">Sauvegarder</v-btn>
            <v-btn color="error" variant="tonal" @click="deleteProject">Supprimer</v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card rounded="xl" class="pa-4 postcard-gradient-card">
          <h3 class="text-subtitle-1 mb-3">Assignees</h3>
          <v-text-field v-model="assigneeId" label="User ID" class="mb-2" />
          <v-btn color="secondary" variant="tonal" class="mb-4" @click="attachAssignee">Attacher</v-btn>
          <v-list density="compact" bg-color="transparent">
            <v-list-item
              v-for="assignee in data.assignees"
              :key="String((assignee as any).id ?? assignee)"
              :title="String((assignee as any).username ?? (assignee as any).id ?? assignee)"
            >
              <template #append>
                <v-btn
                  size="small"
                  color="error"
                  variant="text"
                  icon="mdi-close"
                  @click="detachAssignee(String((assignee as any).id ?? assignee))"
                />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
