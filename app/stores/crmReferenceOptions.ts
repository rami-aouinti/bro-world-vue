import type {
  ApiListResponse,
  CrmEmployeeItem,
  CrmProjectListItem,
  CrmSprintItem,
  CrmTaskItem,
  CrmTaskRequestItem,
} from '~~/server/types/api/crm-general'

const CRM_REFERENCE_TTL_MS = 3 * 60 * 1000
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 100

type SelectOption = {
  title: string
  value: string
  avatarLabel?: string
}

type EmployeeSelectOption = SelectOption & {
  avatar?: string
  subtitle?: string
}

function isFresh(lastFetchedAt: number | null) {
  return (
    typeof lastFetchedAt === 'number' &&
    Date.now() - lastFetchedAt < CRM_REFERENCE_TTL_MS
  )
}

function truncateLabel(value: string | null | undefined, max = 30) {
  const normalized = String(value ?? '').trim()
  if (!normalized) {
    return '—'
  }

  return normalized.length > max
    ? `${normalized.slice(0, max - 1)}…`
    : normalized
}

function employeeDisplayName(employee: CrmEmployeeItem) {
  return `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim()
}

export const useCrmReferenceOptionsStore = defineStore(
  'crm-reference-options',
  () => {
    const employees = ref<CrmEmployeeItem[]>([])
    const projects = ref<CrmProjectListItem[]>([])
    const tasks = ref<CrmTaskItem[]>([])
    const taskRequests = ref<CrmTaskRequestItem[]>([])
    const sprints = ref<CrmSprintItem[]>([])

    const employeesFetchedAt = ref<number | null>(null)
    const projectsFetchedAt = ref<number | null>(null)
    const tasksFetchedAt = ref<number | null>(null)
    const taskRequestsFetchedAt = ref<number | null>(null)
    const sprintsFetchedAt = ref<number | null>(null)

    async function fetchEmployees(force = false) {
      if (
        !force &&
        isFresh(employeesFetchedAt.value) &&
        employees.value.length
      ) {
        return employees.value
      }

      const response = await $fetch<ApiListResponse<CrmEmployeeItem>>(
        '/api/world/crm/general/employees',
        {
          query: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
        },
      )
      employees.value = response.items ?? []
      employeesFetchedAt.value = Date.now()
      return employees.value
    }

    async function fetchProjects(force = false) {
      if (!force && isFresh(projectsFetchedAt.value) && projects.value.length) {
        return projects.value
      }

      const response = await $fetch<ApiListResponse<CrmProjectListItem>>(
        '/api/world/crm/general/projects',
        {
          query: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
        },
      )
      projects.value = response.items ?? []
      projectsFetchedAt.value = Date.now()
      return projects.value
    }

    async function fetchTasks(force = false) {
      if (!force && isFresh(tasksFetchedAt.value) && tasks.value.length) {
        return tasks.value
      }

      const response = await $fetch<ApiListResponse<CrmTaskItem>>(
        '/api/world/crm/general/tasks',
        {
          query: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
        },
      )
      tasks.value = response.items ?? []
      tasksFetchedAt.value = Date.now()
      return tasks.value
    }

    async function fetchTaskRequests(force = false) {
      if (
        !force &&
        isFresh(taskRequestsFetchedAt.value) &&
        taskRequests.value.length
      ) {
        return taskRequests.value
      }

      const response = await $fetch<ApiListResponse<CrmTaskRequestItem>>(
        '/api/world/crm/general/task-requests',
        {
          query: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
        },
      )
      taskRequests.value = response.items ?? []
      taskRequestsFetchedAt.value = Date.now()
      return taskRequests.value
    }

    async function fetchSprints(force = false) {
      if (!force && isFresh(sprintsFetchedAt.value) && sprints.value.length) {
        return sprints.value
      }

      const response = await $fetch<ApiListResponse<CrmSprintItem>>(
        '/api/world/crm/general/sprints',
        {
          query: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
        },
      )
      sprints.value = response.items ?? []
      sprintsFetchedAt.value = Date.now()
      return sprints.value
    }

    const employeeAssigneeOptions = computed<EmployeeSelectOption[]>(() =>
      employees.value
        .filter((employee) => String(employee.id ?? '').trim().length > 0)
        .map((employee) => ({
          title: employeeDisplayName(employee),
          value: String(employee.id),
          avatar: employee.photo,
          avatarLabel: employeeDisplayName(employee),
          subtitle: employee.email ?? undefined,
        })),
    )

    const projectOptions = computed<SelectOption[]>(() =>
      projects.value.map((project) => ({
        title: truncateLabel(project.name, 30),
        value: project.id,
        avatarLabel: project.name,
      })),
    )

    const taskOptions = computed<SelectOption[]>(() =>
      tasks.value.map((task) => ({
        title: truncateLabel(task.title, 30),
        value: task.id,
        avatarLabel: task.title,
      })),
    )

    const taskRequestOptions = computed<SelectOption[]>(() =>
      taskRequests.value.map((taskRequest) => ({
        title: truncateLabel(taskRequest.title, 30),
        value: taskRequest.id,
        avatarLabel: taskRequest.title,
      })),
    )

    const sprintOptions = computed<SelectOption[]>(() =>
      sprints.value.map((sprint) => ({
        title: truncateLabel(sprint.name, 30),
        value: sprint.id,
        avatarLabel: sprint.name,
      })),
    )

    return {
      employees,
      projects,
      tasks,
      taskRequests,
      sprints,
      fetchEmployees,
      fetchProjects,
      fetchTasks,
      fetchTaskRequests,
      fetchSprints,
      employeeAssigneeOptions,
      projectOptions,
      taskOptions,
      taskRequestOptions,
      sprintOptions,
    }
  },
)
