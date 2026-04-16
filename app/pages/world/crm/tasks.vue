<script setup lang="ts">
interface CrmTaskItem {
  id: string
  title: string
  status: string
  priority: string
  projectName: string
  sprintName: string
  dueAt: string
  estimatedHours: number
  updatedAt: string
  attachments: Array<{ id?: string }>
  children: Array<{ id: string; status: string }>
}

interface CrmTaskResponse {
  items: CrmTaskItem[]
}

definePageMeta({ title: 'CRM Tasks' })

const { locale } = useI18n()

const crmNavItems = [
  {
    title: 'Overview CRM',
    to: '/world/crm',
    icon: 'mdi-view-dashboard-outline',
  },
  { title: 'Projects', to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: 'Tasks', to: '/world/crm/tasks', icon: 'mdi-format-list-checks' },
  { title: 'Sprints', to: '/world/crm/sprints', icon: 'mdi-run-fast' },
  { title: 'Company', to: '/world/crm/company', icon: 'mdi-domain' },
  { title: 'Admin', to: '/world/crm/admin', icon: 'mdi-shield-crown-outline' },
]

const { data, pending, error } = await useFetch<CrmTaskResponse>(
  '/api/world/crm/general/tasks',
)

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
  }).format(new Date(value))
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      module-description="Liste publique des tâches CRM"
      :nav-items="crmNavItems"
      action-label="Create task"
      action-icon="mdi-plus"
    />

    <v-container fluid>
      <v-alert v-if="pending" type="info" variant="tonal" class="mb-4"
        >Chargement des tasks...</v-alert
      >
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4"
        >Erreur de chargement des tasks.</v-alert
      >

      <v-row v-else>
        <v-col
          v-for="task in data?.items ?? []"
          :key="task.id"
          cols="12"
          md="6"
          xl="4"
        >
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
            <div class="d-flex align-start justify-space-between ga-2 mb-2">
              <h3 class="text-subtitle-1 mb-0">{{ task.title }}</h3>
              <v-chip size="small" color="primary" variant="tonal">{{
                task.status
              }}</v-chip>
            </div>
            <p class="text-body-2 mb-1">Project: {{ task.projectName }}</p>
            <p class="text-body-2 mb-1">Sprint: {{ task.sprintName }}</p>
            <p class="text-body-2 mb-1">Priority: {{ task.priority }}</p>
            <p class="text-body-2 mb-1">Due: {{ formatDate(task.dueAt) }}</p>
            <p class="text-body-2 mb-0">
              {{ task.estimatedHours }}h ·
              {{ task.attachments.length }} attachments ·
              {{ task.children.length }} subtasks
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
