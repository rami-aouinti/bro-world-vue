import type { CrmEndpointCatalogResponse } from '~~/app/types/world/crmEndpoints'
import { getCached, privateCacheKey, setCached } from '~~/server/utils/apiCache'
import { resolveCacheTtl } from '~~/server/utils/apiCacheConfig'
import { requireCrmPermission } from '~~/server/utils/crmAccessControl'

export default defineEventHandler(async (event): Promise<CrmEndpointCatalogResponse> => {
  const user = await requireCrmPermission(event, 'crm.opportunities.read')
  const username = user?.username?.trim()

  if (!username) {
    throw createError({ statusCode: 401, statusMessage: 'Missing username' })
  }

  const cacheKey = privateCacheKey(username, '/world/crm/endpoints')
  const cached = await getCached<CrmEndpointCatalogResponse>(cacheKey)

  if (cached) {
    return cached
  }

  const response: CrmEndpointCatalogResponse = {
    groups: [
      {
        key: 'companies',
        title: 'world.crm.endpoints.groups.companies',
        endpoints: [
          { id: '1', title: 'List companies', method: 'GET', path: '/api/v1/crm/companies', defaultQuery: { page: 1, limit: 20 } },
          { id: '2', title: 'Get company', method: 'GET', path: '/api/v1/crm/companies/{company}' },
          { id: '3', title: 'Create company', method: 'POST', path: '/api/v1/crm/companies', defaultBody: { crmId: 'crm-uuid', name: 'Acme Corporation', industry: 'SaaS', website: 'https://acme.test', contactEmail: 'contact@acme.test', phone: '+33123456789' } },
          { id: '4', title: 'Update company', method: 'PATCH', path: '/api/v1/crm/companies/{companyId}', defaultBody: { name: 'Acme Intl', industry: 'Software', website: 'https://acme.io', contactEmail: 'hello@acme.io', phone: '+33999999999' } },
          { id: '5', title: 'Delete company', method: 'DELETE', path: '/api/v1/crm/companies/{company}' },
        ],
      },
      {
        key: 'contacts',
        title: 'world.crm.endpoints.groups.contacts',
        endpoints: [
          { id: '6', title: 'List contacts', method: 'GET', path: '/api/v1/crm/contacts', defaultQuery: { page: 1, limit: 20 } },
          { id: '7', title: 'Get contact', method: 'GET', path: '/api/v1/crm/contacts/{contact}' },
          { id: '7a', title: 'Create contact', method: 'POST', path: '/api/v1/crm/contacts', defaultBody: { companyId: 'company-uuid', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@acme.test', phone: '+33123456789' } },
          { id: '7b', title: 'Update contact', method: 'PATCH', path: '/api/v1/crm/contacts/{id}', defaultBody: { firstName: 'Ada', lastName: 'Byron', email: 'ada@acme.io', phone: '+33999999999' } },
          { id: '7c', title: 'Delete contact', method: 'DELETE', path: '/api/v1/crm/contacts/{id}' },
        ],
      },
      {
        key: 'projects',
        title: 'world.crm.endpoints.groups.projects',
        endpoints: [
          { id: '8', title: 'List projects', method: 'GET', path: '/api/v1/crm/projects', defaultQuery: { page: 1, limit: 20 } },
          { id: '9', title: 'Get project', method: 'GET', path: '/api/v1/crm/projects/{project}' },
          { id: '10', title: 'Create project', method: 'POST', path: '/api/v1/crm/projects', defaultBody: { companyId: 'company-uuid', name: 'CRM Migration', code: 'CRM-MIG', description: 'Migration project', status: 'planned', startedAt: '2026-05-01T10:00:00+00:00', dueAt: '2026-06-01T10:00:00+00:00' } },
          { id: '11', title: 'Update project', method: 'PATCH', path: '/api/v1/crm/projects/{project}', defaultBody: { name: 'Migration CRM v2', code: 'CRM-MIG-V2', description: 'Update', status: 'in_progress', startedAt: '2026-05-10T09:00:00+00:00', dueAt: '2026-06-10T09:00:00+00:00' } },
          { id: '12', title: 'Delete project', method: 'DELETE', path: '/api/v1/crm/projects/{project}' },
          { id: '13', title: 'Attach project assignee', method: 'PUT', path: '/api/v1/crm/projects/{project}/assignees/{user}' },
          { id: '14', title: 'Detach project assignee', method: 'DELETE', path: '/api/v1/crm/projects/{project}/assignees/{user}' },
        ],
      },
      {
        key: 'sprints',
        title: 'world.crm.endpoints.groups.sprints',
        endpoints: [
          { id: '15', title: 'List sprints', method: 'GET', path: '/api/v1/crm/sprints', defaultQuery: { page: 1, limit: 20 } },
          { id: '16', title: 'Get sprint', method: 'GET', path: '/api/v1/crm/sprints/{sprint}' },
          { id: '17', title: 'Create sprint', method: 'POST', path: '/api/v1/crm/sprints', defaultBody: { projectId: 'project-uuid', name: 'Sprint 1', goal: 'Deliver the MVP', status: 'planned', startDate: '2026-05-01T10:00:00+00:00', endDate: '2026-05-15T10:00:00+00:00' } },
          { id: '18', title: 'Update sprint', method: 'PATCH', path: '/api/v1/crm/sprints/{sprint}', defaultBody: { name: 'Sprint 1 - updated', goal: 'Stabilize the MVP', status: 'in_progress', startDate: '2026-05-02T10:00:00+00:00', endDate: '2026-05-16T10:00:00+00:00' } },
          { id: '19', title: 'Delete sprint', method: 'DELETE', path: '/api/v1/crm/sprints/{sprint}' },
          { id: '20', title: 'Attach sprint assignee', method: 'PUT', path: '/api/v1/crm/sprints/{sprint}/assignees/{user}' },
          { id: '21', title: 'Detach sprint assignee', method: 'DELETE', path: '/api/v1/crm/sprints/{sprint}/assignees/{user}' },
          { id: '22', title: 'Attach sprint task', method: 'PUT', path: '/api/v1/crm/sprints/{sprintId}/tasks/{taskId}' },
          { id: '23', title: 'Detach sprint task', method: 'DELETE', path: '/api/v1/crm/sprints/{sprintId}/tasks/{taskId}' },
        ],
      },
      {
        key: 'tasks',
        title: 'world.crm.endpoints.groups.tasks',
        endpoints: [
          { id: '24', title: 'List tasks', method: 'GET', path: '/api/v1/crm/tasks', defaultQuery: { page: 1, limit: 20 } },
          { id: '24a', title: 'List tasks by sprint', method: 'GET', path: '/api/v1/crm/tasks/by-sprint/{sprint}' },
          { id: '24b', title: 'List tasks from sprint', method: 'GET', path: '/api/v1/crm/sprints/{sprint}/tasks' },
          { id: '25', title: 'Get task', method: 'GET', path: '/api/v1/crm/tasks/{task}' },
          { id: '26', title: 'Create task', method: 'POST', path: '/api/v1/crm/tasks', defaultBody: { projectId: 'project-uuid', title: 'Implement migration', description: 'Create SQL scripts', status: 'todo', priority: 'medium', dueAt: '2026-05-20T10:00:00+00:00', estimatedHours: 8, sprintId: 'sprint-uuid', parentTaskId: null } },
          { id: '27', title: 'Update task', method: 'PATCH', path: '/api/v1/crm/tasks/{task}', defaultBody: { title: 'Implement migration v2', description: 'Update', status: 'in_progress', priority: 'high', dueAt: '2026-05-22T10:00:00+00:00', estimatedHours: 10, projectId: 'project-uuid', parentTaskId: null } },
          { id: '28', title: 'Delete task', method: 'DELETE', path: '/api/v1/crm/tasks/{task}' },
          { id: '29', title: 'Attach task assignee', method: 'PUT', path: '/api/v1/crm/tasks/{task}/assignees/{user}' },
          { id: '30', title: 'Detach task assignee', method: 'DELETE', path: '/api/v1/crm/tasks/{task}/assignees/{user}' },
          { id: '31', title: 'Create subtask', method: 'POST', path: '/api/v1/crm/tasks/{task}/subtasks', defaultBody: { title: 'Create users table migration', description: 'DDL + index', status: 'todo', priority: 'medium', dueAt: '2026-05-18T10:00:00+00:00', estimatedHours: 3, sprintId: 'sprint-uuid' } },
          { id: '32', title: 'Update subtask', method: 'PATCH', path: '/api/v1/crm/subtasks/{subtask}', defaultBody: { title: 'Create users + roles migration', description: 'Add roles table', status: 'in_progress', priority: 'high', dueAt: '2026-05-19T10:00:00+00:00', estimatedHours: 5, parentTaskId: 'task-uuid' } },
          { id: '33', title: 'Delete subtask', method: 'DELETE', path: '/api/v1/crm/subtasks/{subtask}' },
          { id: '34', title: 'Attach subtask to task', method: 'PUT', path: '/api/v1/crm/tasks/{task}/subtasks/{subtask}' },
          { id: '35', title: 'Detach subtask from task', method: 'DELETE', path: '/api/v1/crm/tasks/{task}/subtasks/{subtask}' },
        ],
      },
      {
        key: 'billings',
        title: 'world.crm.endpoints.groups.billings',
        endpoints: [
          { id: '36', title: 'List billings', method: 'GET', path: '/api/v1/crm/billings' },
          { id: '37', title: 'Get billing', method: 'GET', path: '/api/v1/crm/billings/{billing}' },
          { id: '38', title: 'Create billing', method: 'POST', path: '/api/v1/crm/billings', defaultBody: { companyId: 'company-uuid', label: 'License', amount: 149.9, currency: 'EUR', status: 'pending', dueAt: '2026-05-01T10:00:00+00:00', paidAt: null } },
          { id: '39', title: 'Update billing', method: 'PATCH', path: '/api/v1/crm/billings/{billing}', defaultBody: { label: 'Annual license', amount: 199, currency: 'EUR', status: 'paid', dueAt: '2026-05-01T10:00:00+00:00', paidAt: '2026-05-02T12:00:00+00:00' } },
          { id: '40', title: 'Delete billing', method: 'DELETE', path: '/api/v1/crm/billings/{billing}' },
        ],
      },
      {
        key: 'task-requests',
        title: 'world.crm.endpoints.groups.taskRequests',
        endpoints: [
          { id: '41', title: 'List task requests', method: 'GET', path: '/api/v1/crm/task-requests' },
          { id: '42', title: 'Get task request', method: 'GET', path: '/api/v1/crm/task-requests/{taskRequest}' },
          { id: '43', title: 'Create task request', method: 'POST', path: '/api/v1/crm/task-requests', defaultBody: { taskId: 'task-uuid', repositoryId: 'repo-uuid', title: 'Create feature branch', description: 'Details', status: 'pending', requestedAt: '2026-05-01T10:00:00+00:00', resolvedAt: null } },
          { id: '44', title: 'Update task request', method: 'PATCH', path: '/api/v1/crm/task-requests/{taskRequest}', defaultBody: { title: 'Create feature/login branch', description: 'Clarify naming', status: 'approved', resolvedAt: '2026-05-03T10:00:00+00:00' } },
          { id: '44a', title: 'Update task request status', method: 'PUT', path: '/api/v1/crm/task-requests/{taskRequest}/status', defaultBody: { status: 'approved' } },
          { id: '44b', title: 'Attach task request assignee', method: 'PUT', path: '/api/v1/crm/task-requests/{taskRequest}/assignees/{user}' },
          { id: '44c', title: 'Detach task request assignee', method: 'DELETE', path: '/api/v1/crm/task-requests/{taskRequest}/assignees/{user}' },
          { id: '45', title: 'Delete task request', method: 'DELETE', path: '/api/v1/crm/task-requests/{taskRequest}' },
        ],
      },
      {
        key: 'dashboard-reports',
        title: 'world.crm.endpoints.groups.dashboardReports',
        endpoints: [
          { id: '46', title: 'Get dashboard', method: 'GET', path: '/api/v1/crm/dashboard' },
          { id: '47-json', title: 'Get report JSON', method: 'GET', path: '/api/v1/crm/reports', defaultQuery: { format: 'json' } },
          { id: '47-csv', title: 'Get report CSV', method: 'GET', path: '/api/v1/crm/reports', defaultQuery: { format: 'csv' } },
          { id: '47-pdf', title: 'Get report PDF', method: 'GET', path: '/api/v1/crm/reports', defaultQuery: { format: 'pdf' } },
        ],
      },
      {
        key: 'github-sync',
        title: 'world.crm.endpoints.groups.githubSync',
        endpoints: [
          { id: '48-jobs', title: 'List GitHub sync jobs', method: 'GET', path: '/api/v1/crm/github/sync/jobs', defaultQuery: { page: 1, limit: 20 } },
          { id: '48-latest', title: 'Get latest GitHub sync job', method: 'GET', path: '/api/v1/crm/github/sync/jobs/latest' },
          { id: '48-bootstrap', title: 'Bootstrap GitHub sync', method: 'POST', path: '/api/v1/crm/github/sync/bootstrap', defaultBody: { applicationSlug: 'bro-world', owner: 'bro-world' } },
          { id: '48-job', title: 'Get GitHub sync job', method: 'GET', path: '/api/v1/crm/github/sync/jobs/{jobId}' },
          { id: '48-webhook', title: 'Trigger GitHub webhook', method: 'POST', path: '/api/v1/crm/github/webhook', defaultBody: { event: 'push' } },
        ],
      },
    ],
  }

  await setCached(cacheKey, response, resolveCacheTtl('crm'))

  return response
})
