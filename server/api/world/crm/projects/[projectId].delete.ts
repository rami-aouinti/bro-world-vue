import { requireCrmPermission } from '~~/server/utils/crmAccessControl'

export default defineEventHandler(async (event) => {
  await requireCrmPermission(event, 'crm.projects.delete')

  const projectId = getRouterParam(event, 'projectId')

  return {
    ok: true,
    projectId,
    deletedAt: new Date().toISOString(),
  }
})
