<script setup lang="ts">
import type { CrmProjectItem, CrmSprintItem, CrmTaskItem, CrmTaskRequestItem } from '~~/server/types/api/crm-general'
import { useCrmKanbanStore } from '~/stores/crmKanban'

definePageMeta({ title: 'world.crm.label' })

const { t, locale } = useI18n()
const crmKanbanStore = useCrmKanbanStore()

const draggingCardId = ref<string | null>(null)
const projectModalOpen = ref(false)
const sprintModalOpen = ref(false)
const taskRequestModalOpen = ref(false)
const taskModalOpen = ref(false)
const modalLoading = ref(false)
const selectedProject = ref<CrmProjectItem | null>(null)
const selectedSprint = ref<CrmSprintItem | null>(null)
const selectedTask = ref<CrmTaskItem | null>(null)
const selectedTaskRequest = ref<CrmTaskRequestItem | null>(null)

await crmKanbanStore.hydrate()

const sprintOptions = computed(() =>
  crmKanbanStore.sprints.map((sprint) => ({
    title: sprint.name,
    value: sprint.id,
  })),
)

function formatDate(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function priorityColor(priority: string) {
  if (priority === 'high') return 'error'
  if (priority === 'medium') return 'warning'
  return 'primary'
}

function statusLabel(status: string) {
  return t(`world.crm.kanban.status.${status}`)
}

async function onSprintChange(value: string | null) {
  await crmKanbanStore.setSelectedSprint(value)
}

function onDragStart(cardId: string) {
  draggingCardId.value = cardId
}

async function onDrop(targetStatus: string) {
  if (!draggingCardId.value) return

  const current = crmKanbanStore.cards.find((card) => card.id === draggingCardId.value)
  if (!current || current.status === targetStatus) {
    draggingCardId.value = null
    return
  }

  try {
    await crmKanbanStore.updateSubtaskStatus(current.id, targetStatus)
  } finally {
    draggingCardId.value = null
  }
}

async function openTaskRequest(taskRequestId: string) {
  modalLoading.value = true
  taskRequestModalOpen.value = true

  try {
    selectedTaskRequest.value = await crmKanbanStore.fetchTaskRequest(taskRequestId)
  } finally {
    modalLoading.value = false
  }
}

async function openProject(projectId: string | null) {
  if (!projectId) return

  modalLoading.value = true
  projectModalOpen.value = true

  try {
    selectedProject.value = await crmKanbanStore.fetchProject(projectId)
  } finally {
    modalLoading.value = false
  }
}

async function openTask(taskId: string | null) {
  if (!taskId) return

  modalLoading.value = true
  taskModalOpen.value = true

  try {
    selectedTask.value = await crmKanbanStore.fetchTask(taskId)
  } finally {
    modalLoading.value = false
  }
}

async function openTaskFromRequest(taskId: string | null) {
  if (!taskId) return

  taskRequestModalOpen.value = false
  await openTask(taskId)
}

async function openSprint(sprintId: string | null) {
  if (!sprintId) return

  modalLoading.value = true
  sprintModalOpen.value = true

  try {
    selectedSprint.value = await crmKanbanStore.fetchSprint(sprintId)
  } finally {
    modalLoading.value = false
  }
}

function profileLink(username: string | null) {
  return username ? `/user/${encodeURIComponent(username)}/profile` : null
}
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
      <v-row align="center">
        <v-col cols="12" md="5" lg="4">
          <v-select
            :model-value="crmKanbanStore.selectedSprintId"
            :items="sprintOptions"
            item-title="title"
            item-value="value"
            clearable
            :label="t('world.crm.kanban.selectSprint')"
            :loading="crmKanbanStore.pending"
            @update:model-value="onSprintChange"
          />
        </v-col>
        <v-col cols="12" md="7" lg="8">
          <v-alert
            type="info"
            density="comfortable"
            variant="tonal"
            class="mb-0"
          >
            {{
              crmKanbanStore.currentSprintMeta?.name
                ? t('world.crm.kanban.currentSprint', {
                    name: crmKanbanStore.currentSprintMeta.name,
                    start: formatDate(crmKanbanStore.currentSprintMeta.startDate),
                    end: formatDate(crmKanbanStore.currentSprintMeta.endDate),
                  })
                : t('world.crm.kanban.noSprint')
            }}
          </v-alert>
        </v-col>
      </v-row>
    </v-card>

    <v-alert
      v-if="crmKanbanStore.error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ crmKanbanStore.error }}
    </v-alert>

    <v-row class="kanban-row" no-gutters>
      <v-col
        v-for="status in crmKanbanStore.statuses"
        :key="status"
        cols="12"
        md="3"
        class="pa-2"
      >
        <v-card
          rounded="xl"
          class="pa-3 h-100 postcard-gradient-card"
          @dragover.prevent
          @drop.prevent="onDrop(status)"
        >
          <div class="d-flex align-center justify-space-between mb-3">
            <h3 class="text-subtitle-1 text-capitalize mb-0">{{ statusLabel(status) }}</h3>
            <v-chip size="small" color="primary" variant="tonal">
              {{ crmKanbanStore.cardsByStatus[status]?.length ?? 0 }}
            </v-chip>
          </div>

          <div
            v-if="!(crmKanbanStore.cardsByStatus[status]?.length)"
            class="text-caption text-medium-emphasis"
          >
            {{ t('world.crm.kanban.emptyStatus') }}
          </div>

          <v-card
            v-for="card in crmKanbanStore.cardsByStatus[status]"
            :key="card.id"
            rounded="lg"
            class="pa-3 mb-2 cursor-pointer"
            variant="tonal"
            draggable="true"
            @dragstart="onDragStart(card.id)"
            @click="openTaskRequest(card.id)"
          >
            <div class="d-flex align-start justify-space-between ga-2 mb-2">
              <p class="font-weight-medium mb-0">{{ card.title }}</p>
              <v-chip size="x-small" :color="priorityColor(card.priority)">
                {{ card.priority }}
              </v-chip>
            </div>

            <div class="d-flex flex-wrap ga-2 mb-2">
              <v-chip
                v-if="card.projectId"
                size="small"
                color="secondary"
                variant="outlined"
                @click.stop="openProject(card.projectId)"
              >
                {{ card.projectName ?? t('world.crm.kanban.project') }}
              </v-chip>
              <v-chip
                v-if="card.parentTaskId"
                size="small"
                color="primary"
                variant="outlined"
                @click.stop="openTask(card.parentTaskId)"
              >
                {{ card.parentTaskTitle ?? t('world.crm.kanban.task') }}
              </v-chip>
            </div>

            <p class="text-caption mb-0">
              {{ t('world.crm.kanban.dueAt') }}: {{ formatDate(card.dueAt) }}
            </p>

            <div class="d-flex flex-wrap ga-2">
              <NuxtLink
                v-for="assignee in card.assignees"
                :key="assignee.id"
                :to="profileLink(assignee.username) ?? '#'"
                class="text-decoration-none"
                @click.stop
              >
                <v-avatar size="28">
                  <v-img
                    :src="assignee.photo || '/img/avatar_default.svg'"
                    :alt="assignee.username ?? assignee.id"
                    cover
                  />
                </v-avatar>
              </NuxtLink>
            </div>
          </v-card>
        </v-card>
      </v-col>
    </v-row>

    <AppModal
      v-model="taskRequestModalOpen"
      title="Subtask request detail"
      :max-width="760"
    >
      <v-progress-linear v-if="modalLoading" indeterminate class="mb-3" />
      <div v-else-if="selectedTaskRequest">
        <p><strong>ID:</strong> {{ selectedTaskRequest.id }}</p>
        <p><strong>Title:</strong> {{ selectedTaskRequest.title }}</p>
        <p><strong>Description:</strong> {{ selectedTaskRequest.description || '—' }}</p>
        <p><strong>Status:</strong> {{ selectedTaskRequest.status }}</p>
        <p><strong>Requested at:</strong> {{ selectedTaskRequest.requestedAt }}</p>
        <p><strong>Resolved at:</strong> {{ selectedTaskRequest.resolvedAt || '—' }}</p>
        <p><strong>Repository ID:</strong> {{ selectedTaskRequest.repositoryId }}</p>
        <div class="d-flex align-center ga-2">
          <strong>Task:</strong>
          <v-chip size="small" color="primary" variant="outlined" @click="openTaskFromRequest(selectedTaskRequest.taskId)">
            {{ selectedTaskRequest.taskId }}
          </v-chip>
        </div>
      </div>
    </AppModal>

    <AppModal
      v-model="projectModalOpen"
      :title="t('world.crm.kanban.projectDetail')"
      :max-width="700"
    >
      <v-progress-linear v-if="modalLoading" indeterminate class="mb-3" />
      <div v-else-if="selectedProject">
        <p><strong>ID:</strong> {{ selectedProject.id }}</p>
        <p><strong>{{ t('world.crm.projects.form.name') }}:</strong> {{ selectedProject.name }}</p>
        <p><strong>{{ t('world.crm.projects.form.code') }}:</strong> {{ selectedProject.code || '—' }}</p>
        <p><strong>{{ t('world.crm.projects.form.status') }}:</strong> {{ selectedProject.status }}</p>
        <p><strong>{{ t('world.crm.projects.form.description') }}:</strong> {{ selectedProject.description || '—' }}</p>
      </div>
    </AppModal>

    <AppModal
      v-model="sprintModalOpen"
      title="Sprint detail"
      :max-width="700"
    >
      <v-progress-linear v-if="modalLoading" indeterminate class="mb-3" />
      <div v-else-if="selectedSprint">
        <p><strong>ID:</strong> {{ selectedSprint.id }}</p>
        <p><strong>Name:</strong> {{ selectedSprint.name }}</p>
        <p><strong>Status:</strong> {{ selectedSprint.status }}</p>
        <p><strong>Goal:</strong> {{ selectedSprint.goal || '—' }}</p>
        <p><strong>Start:</strong> {{ selectedSprint.startDate || '—' }}</p>
        <p><strong>End:</strong> {{ selectedSprint.endDate || '—' }}</p>
        <p><strong>Project ID:</strong> {{ selectedSprint.projectId }}</p>
      </div>
    </AppModal>

    <AppModal
      v-model="taskModalOpen"
      :title="t('world.crm.kanban.taskDetail')"
      :max-width="700"
    >
      <v-progress-linear v-if="modalLoading" indeterminate class="mb-3" />
      <div v-else-if="selectedTask">
        <p><strong>ID:</strong> {{ selectedTask.id }}</p>
        <p><strong>{{ t('world.crm.tasks.form.title') }}:</strong> {{ selectedTask.title || '—' }}</p>
        <p><strong>{{ t('world.crm.tasks.form.status') }}:</strong> {{ selectedTask.status || '—' }}</p>
        <p><strong>{{ t('world.crm.tasks.form.priority') }}:</strong> {{ selectedTask.priority || '—' }}</p>
        <p><strong>{{ t('world.crm.tasks.form.description') }}:</strong> {{ selectedTask.description || '—' }}</p>
        <p><strong>{{ t('world.crm.tasks.form.dueAt') }}:</strong> {{ selectedTask.dueAt || '—' }}</p>
        <p><strong>{{ t('world.crm.tasks.form.estimatedHours') }}:</strong> {{ selectedTask.estimatedHours ?? '—' }}</p>
        <div class="d-flex flex-wrap ga-2 mb-2">
          <v-chip
            v-if="selectedTask.projectId"
            size="small"
            color="secondary"
            variant="outlined"
            @click="openProject(selectedTask.projectId)"
          >
            Project {{ selectedTask.projectId }}
          </v-chip>
          <v-chip
            v-if="selectedTask.sprintId"
            size="small"
            color="primary"
            variant="outlined"
            @click="openSprint(selectedTask.sprintId)"
          >
            Sprint {{ selectedTask.sprintId }}
          </v-chip>
        </div>
        <div>
          <strong>Attachments:</strong>
          <v-list density="compact" bg-color="transparent">
            <v-list-item
              v-for="(attachment, index) in selectedTask.attachments"
              :key="index"
              :title="String((attachment as any).originalName ?? (attachment as any).url ?? `Attachment ${index + 1}`)"
              :subtitle="String((attachment as any).mimeType ?? '')"
              :href="(attachment as any).url"
              target="_blank"
              rel="noopener noreferrer"
              prepend-icon="mdi-download"
            />
          </v-list>
        </div>
      </div>
    </AppModal>
  </v-container>
</template>

<style scoped>
.kanban-row {
  flex-wrap: nowrap;
  overflow-x: auto;
}
</style>
