<script setup lang="ts">
definePageMeta({ title: 'CRM Endpoints' })
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()

type EndpointGroup = {
  key: string
  title: string
  endpoints: Array<{
    id: string
    title: string
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    path: string
    description?: string
    defaultQuery?: Record<string, unknown>
    defaultBody?: Record<string, unknown>
  }>
}

const endpointGroups: EndpointGroup[] = [
  {
    key: 'companies',
    title: 'world.crm.endpoints.groups.companies',
    endpoints: [
      { id: '1', title: 'List companies', method: 'GET', path: '/api/crm/general/companies', defaultQuery: { page: 1, limit: 20 } },
      { id: '2', title: 'Get company', method: 'GET', path: '/api/crm/general/companies/{company}' },
      { id: '3', title: 'Create company', method: 'POST', path: '/api/crm/general/companies', defaultBody: { crmId: 'crm-uuid', name: 'Acme Corporation', industry: 'SaaS', website: 'https://acme.test', contactEmail: 'contact@acme.test', phone: '+33123456789' } },
      { id: '4', title: 'Update company', method: 'PATCH', path: '/api/crm/general/companies/{company}', defaultBody: { name: 'Acme Intl', industry: 'Software', website: 'https://acme.io', contactEmail: 'hello@acme.io', phone: '+33999999999' } },
      { id: '5', title: 'Delete company', method: 'DELETE', path: '/api/crm/general/companies/{company}' },
    ],
  },
  {
    key: 'contacts',
    title: 'world.crm.endpoints.groups.contacts',
    endpoints: [
      { id: '6', title: 'List contacts', method: 'GET', path: '/api/crm/general/contacts', defaultQuery: { page: 1, limit: 20 } },
      { id: '7', title: 'Get contact', method: 'GET', path: '/api/crm/general/contacts/{contact}' },
    ],
  },
  {
    key: 'projects',
    title: 'world.crm.endpoints.groups.projects',
    endpoints: [
      { id: '8', title: 'List projects', method: 'GET', path: '/api/crm/general/projects', defaultQuery: { page: 1, limit: 20 } },
      { id: '9', title: 'Get project', method: 'GET', path: '/api/crm/general/projects/{project}' },
      { id: '10', title: 'Create project', method: 'POST', path: '/api/crm/general/projects', defaultBody: { companyId: 'company-uuid', name: 'CRM Migration', code: 'CRM-MIG', description: 'Migration project', status: 'planned', startedAt: '2026-05-01T10:00:00+00:00', dueAt: '2026-06-01T10:00:00+00:00' } },
      { id: '11', title: 'Update project', method: 'PATCH', path: '/api/crm/general/projects/{project}', defaultBody: { name: 'Migration CRM v2', code: 'CRM-MIG-V2', description: 'Update', status: 'in_progress', startedAt: '2026-05-10T09:00:00+00:00', dueAt: '2026-06-10T09:00:00+00:00' } },
      { id: '12', title: 'Delete project', method: 'DELETE', path: '/api/crm/general/projects/{project}' },
      { id: '13', title: 'Attach project assignee', method: 'PUT', path: '/api/crm/general/projects/{project}/assignees/{user}' },
      { id: '14', title: 'Detach project assignee', method: 'DELETE', path: '/api/crm/general/projects/{project}/assignees/{user}' },
    ],
  },
  {
    key: 'sprints',
    title: 'world.crm.endpoints.groups.sprints',
    endpoints: [
      { id: '15', title: 'List sprints', method: 'GET', path: '/api/crm/general/sprints', defaultQuery: { page: 1, limit: 20 } },
      { id: '16', title: 'Get sprint', method: 'GET', path: '/api/crm/general/sprints/{sprint}' },
      { id: '17', title: 'Create sprint', method: 'POST', path: '/api/crm/general/sprints', defaultBody: { projectId: 'project-uuid', name: 'Sprint 1', goal: 'Deliver the MVP', status: 'planned', startDate: '2026-05-01T10:00:00+00:00', endDate: '2026-05-15T10:00:00+00:00' } },
      { id: '18', title: 'Update sprint', method: 'PATCH', path: '/api/crm/general/sprints/{sprint}', defaultBody: { name: 'Sprint 1 - updated', goal: 'Stabilize the MVP', status: 'in_progress', startDate: '2026-05-02T10:00:00+00:00', endDate: '2026-05-16T10:00:00+00:00' } },
      { id: '19', title: 'Delete sprint', method: 'DELETE', path: '/api/crm/general/sprints/{sprint}' },
      { id: '20', title: 'Attach sprint assignee', method: 'PUT', path: '/api/crm/general/sprints/{sprint}/assignees/{user}' },
      { id: '21', title: 'Detach sprint assignee', method: 'DELETE', path: '/api/crm/general/sprints/{sprint}/assignees/{user}' },
      { id: '22', title: 'Attach sprint task', method: 'PUT', path: '/api/crm/general/sprints/{sprint}/tasks/{task}' },
      { id: '23', title: 'Detach sprint task', method: 'DELETE', path: '/api/crm/general/sprints/{sprint}/tasks/{task}' },
    ],
  },
  {
    key: 'tasks',
    title: 'world.crm.endpoints.groups.tasks',
    endpoints: [
      { id: '24', title: 'List tasks', method: 'GET', path: '/api/crm/general/tasks', defaultQuery: { page: 1, limit: 20 } },
      { id: '24a', title: 'List tasks by latest sprint', method: 'GET', path: '/api/crm/general/tasks/by-latest-sprint' },
      { id: '24b', title: 'List tasks by sprint', method: 'GET', path: '/api/crm/general/tasks/by-sprint', defaultQuery: { sprintId: 'sprint-uuid' } },
      { id: '25', title: 'Get task', method: 'GET', path: '/api/crm/general/tasks/{task}' },
      { id: '26', title: 'Create task', method: 'POST', path: '/api/crm/general/tasks', defaultBody: { projectId: 'project-uuid', title: 'Implement migration', description: 'Create SQL scripts', status: 'todo', priority: 'medium', dueAt: '2026-05-20T10:00:00+00:00', estimatedHours: 8, sprintId: 'sprint-uuid', parentTaskId: null } },
      { id: '27', title: 'Update task', method: 'PATCH', path: '/api/crm/general/tasks/{task}', defaultBody: { title: 'Implement migration v2', description: 'Update', status: 'in_progress', priority: 'high', dueAt: '2026-05-22T10:00:00+00:00', estimatedHours: 10, projectId: 'project-uuid', parentTaskId: null } },
      { id: '28', title: 'Delete task', method: 'DELETE', path: '/api/crm/general/tasks/{task}' },
      { id: '29', title: 'Attach task assignee', method: 'PUT', path: '/api/crm/general/tasks/{task}/assignees/{user}' },
      { id: '30', title: 'Detach task assignee', method: 'DELETE', path: '/api/crm/general/tasks/{task}/assignees/{user}' },
      { id: '31', title: 'Create subtask', method: 'POST', path: '/api/crm/general/tasks/{task}/subtasks', defaultBody: { title: 'Create users table migration', description: 'DDL + index', status: 'todo', priority: 'medium', dueAt: '2026-05-18T10:00:00+00:00', estimatedHours: 3, sprintId: 'sprint-uuid' } },
      { id: '32', title: 'Update subtask', method: 'PATCH', path: '/api/crm/general/subtasks/{subtask}', defaultBody: { title: 'Create users + roles migration', description: 'Add roles table', status: 'in_progress', priority: 'high', dueAt: '2026-05-19T10:00:00+00:00', estimatedHours: 5, parentTaskId: 'task-uuid' } },
      { id: '33', title: 'Delete subtask', method: 'DELETE', path: '/api/crm/general/subtasks/{subtask}' },
      { id: '34', title: 'Attach subtask to task', method: 'PUT', path: '/api/crm/general/tasks/{task}/subtasks/{subtask}' },
      { id: '35', title: 'Detach subtask from task', method: 'DELETE', path: '/api/crm/general/tasks/{task}/subtasks/{subtask}' },
    ],
  },
  {
    key: 'billings',
    title: 'world.crm.endpoints.groups.billings',
    endpoints: [
      { id: '36', title: 'List billings', method: 'GET', path: '/api/crm/general/billings' },
      { id: '37', title: 'Get billing', method: 'GET', path: '/api/crm/general/billings/{billing}' },
      { id: '38', title: 'Create billing', method: 'POST', path: '/api/crm/general/billings', defaultBody: { companyId: 'company-uuid', label: 'License', amount: 149.9, currency: 'EUR', status: 'pending', dueAt: '2026-05-01T10:00:00+00:00', paidAt: null } },
      { id: '39', title: 'Update billing', method: 'PATCH', path: '/api/crm/general/billings/{billing}', defaultBody: { label: 'Annual license', amount: 199, currency: 'EUR', status: 'paid', dueAt: '2026-05-01T10:00:00+00:00', paidAt: '2026-05-02T12:00:00+00:00' } },
      { id: '40', title: 'Delete billing', method: 'DELETE', path: '/api/crm/general/billings/{billing}' },
    ],
  },
  {
    key: 'task-requests',
    title: 'world.crm.endpoints.groups.taskRequests',
    endpoints: [
      { id: '41', title: 'List task requests', method: 'GET', path: '/api/crm/general/task-requests' },
      { id: '42', title: 'Get task request', method: 'GET', path: '/api/crm/general/task-requests/{taskRequest}' },
      { id: '43', title: 'Create task request', method: 'POST', path: '/api/crm/general/task-requests', defaultBody: { taskId: 'task-uuid', repositoryId: 'repo-uuid', title: 'Create feature branch', description: 'Details', status: 'pending', requestedAt: '2026-05-01T10:00:00+00:00', resolvedAt: null } },
      { id: '44', title: 'Update task request', method: 'PATCH', path: '/api/crm/general/task-requests/{taskRequest}', defaultBody: { title: 'Create feature/login branch', description: 'Clarify naming', status: 'approved', resolvedAt: '2026-05-03T10:00:00+00:00' } },
      { id: '45', title: 'Delete task request', method: 'DELETE', path: '/api/crm/general/task-requests/{taskRequest}' },
    ],
  },
  {
    key: 'dashboard-reports',
    title: 'world.crm.endpoints.groups.dashboardReports',
    endpoints: [
      { id: '46', title: 'Get dashboard', method: 'GET', path: '/api/crm/general/dashboard' },
      { id: '47-json', title: 'Get report JSON', method: 'GET', path: '/api/crm/general/reports', defaultQuery: { format: 'json' } },
      { id: '47-csv', title: 'Get report CSV', method: 'GET', path: '/api/crm/general/reports', defaultQuery: { format: 'csv' } },
      { id: '47-pdf', title: 'Get report PDF', method: 'GET', path: '/api/crm/general/reports', defaultQuery: { format: 'pdf' } },
    ],
  },
]

</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.endpoints.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.endpoints.actions.openAdmin')"
      action-icon="mdi-cog-outline"
      @action="$router.push('/world/crm/admin')"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
        <h2 class="text-h5 mb-2">{{ t('world.crm.endpoints.page.title') }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ t('world.crm.endpoints.page.description') }}
        </p>
      </v-card>

      <div v-for="group in endpointGroups" :key="group.key" class="mb-6">
        <h3 class="text-h6 mb-3">{{ t(group.title) }}</h3>
        <v-row>
          <v-col
            v-for="endpoint in group.endpoints"
            :key="endpoint.id"
            cols="12"
            lg="6"
          >
            <CrmEndpointAction :config="{ ...endpoint, title: t(`world.crm.endpoints.items.${endpoint.id}`) }" />
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>
