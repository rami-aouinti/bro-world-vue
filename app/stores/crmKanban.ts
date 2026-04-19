import type {
  ApiListResponse,
  CrmProjectItem,
  CrmSprintItem,
  CrmTaskItem,
} from '~~/server/types/api/crm-general'

interface CrmSprintMeta {
  id: string | null
  name: string | null
  status: string | null
  startDate: string | null
  endDate: string | null
}

interface CrmTasksBySprintBucket {
  sprint: CrmSprintMeta
  tasks: CrmTaskItem[]
}

interface CrmTasksBySprintResponse {
  items: CrmTasksBySprintBucket[]
  meta?: {
    sprint: CrmSprintMeta | null
  }
}

interface KanbanAssignee {
  id: string
  username: string | null
  firstName: string | null
  lastName: string | null
  photo: string | null
}

interface KanbanCardItem {
  id: string
  title: string
  status: string
  priority: string
  dueAt: string | null
  updatedAt: string
  estimatedHours: number | null
  projectId: string | null
  projectName: string | null
  parentTaskId: string | null
  parentTaskTitle: string | null
  assignees: KanbanAssignee[]
}

const KANBAN_STATUSES = ['todo', 'in_progress', 'review', 'done'] as const

function normalizeStatus(status: string | null | undefined) {
  if (!status) return 'todo'
  if (KANBAN_STATUSES.includes(status as (typeof KANBAN_STATUSES)[number])) {
    return status
  }

  if (status === 'open') return 'todo'
  if (status === 'closed') return 'done'

  return 'todo'
}

function mapAssignees(assignees: unknown): KanbanAssignee[] {
  if (!Array.isArray(assignees)) return []

  return assignees
    .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object')
    .map((entry) => ({
      id: String(entry.id ?? ''),
      username: typeof entry.username === 'string' ? entry.username : null,
      firstName: typeof entry.firstName === 'string' ? entry.firstName : null,
      lastName: typeof entry.lastName === 'string' ? entry.lastName : null,
      photo: typeof entry.photo === 'string' ? entry.photo : null,
    }))
    .filter((entry) => entry.id)
}

function flattenSubtasks(payload: CrmTasksBySprintResponse): KanbanCardItem[] {
  const cards: KanbanCardItem[] = []

  for (const bucket of payload.items ?? []) {
    for (const task of bucket.tasks ?? []) {
      for (const subtask of task.subTasks ?? []) {
        cards.push({
          id: subtask.id,
          title: subtask.title,
          status: normalizeStatus(subtask.status),
          priority: subtask.priority,
          dueAt: subtask.dueAt,
          updatedAt: subtask.updatedAt,
          estimatedHours: subtask.estimatedHours,
          projectId: subtask.projectId ?? null,
          projectName: subtask.projectName ?? null,
          parentTaskId: task.id,
          parentTaskTitle: task.title,
          assignees: mapAssignees(subtask.assignees),
        })
      }
    }
  }

  return cards
}

export const useCrmKanbanStore = defineStore('crm-kanban', () => {
  const sprints = ref<CrmSprintItem[]>([])
  const selectedSprintId = ref<string | null>(null)
  const currentSprintMeta = ref<CrmSprintMeta | null>(null)
  const cards = ref<KanbanCardItem[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  const projectCache = ref<Record<string, CrmProjectItem>>({})
  const taskCache = ref<Record<string, CrmTaskItem>>({})
  const sprintCardsCache = ref<Record<string, KanbanCardItem[]>>({})
  const sprintMetaCache = ref<Record<string, CrmSprintMeta | null>>({})

  const cardsByStatus = computed(() => {
    const grouped: Record<string, KanbanCardItem[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    }

    for (const card of cards.value) {
      grouped[normalizeStatus(card.status)]?.push(card)
    }

    return grouped
  })

  async function fetchSprints() {
    const response = await $fetch<ApiListResponse<CrmSprintItem>>('/api/crm/general/sprints')
    sprints.value = response.items ?? []
    return sprints.value
  }

  async function fetchLatestSprintCards(force = false) {
    const cacheKey = '__latest__'
    if (!force && sprintCardsCache.value[cacheKey]) {
      cards.value = sprintCardsCache.value[cacheKey]
      currentSprintMeta.value = sprintMetaCache.value[cacheKey]
      selectedSprintId.value = currentSprintMeta.value?.id ?? null
      return
    }

    const response = await $fetch<CrmTasksBySprintResponse>('/api/crm/general/tasks/by-latest-sprint')
    const flattened = flattenSubtasks(response)
    cards.value = flattened
    currentSprintMeta.value = response.meta?.sprint ?? response.items?.[0]?.sprint ?? null
    selectedSprintId.value = currentSprintMeta.value?.id ?? null
    sprintCardsCache.value[cacheKey] = flattened
    sprintMetaCache.value[cacheKey] = currentSprintMeta.value

    if (currentSprintMeta.value?.id) {
      sprintCardsCache.value[currentSprintMeta.value.id] = flattened
      sprintMetaCache.value[currentSprintMeta.value.id] = currentSprintMeta.value
    }
  }

  async function fetchCardsBySprint(sprintId: string, force = false) {
    if (!force && sprintCardsCache.value[sprintId]) {
      cards.value = sprintCardsCache.value[sprintId]
      currentSprintMeta.value = sprintMetaCache.value[sprintId] ?? null
      selectedSprintId.value = sprintId
      return
    }

    const response = await $fetch<CrmTasksBySprintResponse>('/api/crm/general/tasks/by-sprint', {
      query: { sprintId },
    })

    const flattened = flattenSubtasks(response)
    cards.value = flattened
    currentSprintMeta.value = response.items?.[0]?.sprint ?? null
    selectedSprintId.value = sprintId
    sprintCardsCache.value[sprintId] = flattened
    sprintMetaCache.value[sprintId] = currentSprintMeta.value
  }

  async function hydrate() {
    pending.value = true
    error.value = null

    try {
      await fetchSprints()
      await fetchLatestSprintCards()

      if (!selectedSprintId.value && sprints.value[0]?.id) {
        await fetchCardsBySprint(sprints.value[0].id)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load CRM kanban data'
    } finally {
      pending.value = false
    }
  }

  async function setSelectedSprint(sprintId: string | null) {
    pending.value = true
    error.value = null

    try {
      if (!sprintId) {
        await fetchLatestSprintCards()
        return
      }

      await fetchCardsBySprint(sprintId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load sprint cards'
    } finally {
      pending.value = false
    }
  }

  async function updateSubtaskStatus(subtaskId: string, status: string) {
    const nextStatus = normalizeStatus(status)
    await $fetch(`/api/crm/general/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: { status: nextStatus },
    })

    cards.value = cards.value.map((card) =>
      card.id === subtaskId ? { ...card, status: nextStatus } : card,
    )

    const activeKey = selectedSprintId.value ?? '__latest__'
    sprintCardsCache.value[activeKey] = cards.value
    if (selectedSprintId.value) {
      sprintCardsCache.value[selectedSprintId.value] = cards.value
    }
  }

  async function fetchProject(projectId: string) {
    if (projectCache.value[projectId]) {
      return projectCache.value[projectId]
    }

    const project = await $fetch<CrmProjectItem>(`/api/crm/general/projects/${projectId}`)
    projectCache.value[projectId] = project
    return project
  }

  async function fetchTask(taskId: string) {
    if (taskCache.value[taskId]) {
      return taskCache.value[taskId]
    }

    const task = await $fetch<CrmTaskItem>(`/api/crm/general/tasks/${taskId}`)
    taskCache.value[taskId] = task
    return task
  }

  return {
    statuses: KANBAN_STATUSES,
    sprints,
    selectedSprintId,
    currentSprintMeta,
    cards,
    cardsByStatus,
    pending,
    error,
    hydrate,
    setSelectedSprint,
    updateSubtaskStatus,
    fetchProject,
    fetchTask,
  }
})
