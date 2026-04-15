import { requireCrmPermission } from '~~/server/utils/crmAccessControl'

export default defineEventHandler(async (event) => {
  await requireCrmPermission(event, 'crm.projects.edit')

  const projectId = getRouterParam(event, 'projectId')
  const body = await readBody<Record<string, unknown>>(event)

  return {
    ok: true,
    projectId,
    updatedFields: Object.keys(body ?? {}),
    updatedAt: new Date().toISOString(),
  }
})
