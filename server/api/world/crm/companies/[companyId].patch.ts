import { requireCrmPermission } from '~~/server/utils/crmAccessControl'

export default defineEventHandler(async (event) => {
  await requireCrmPermission(event, 'crm.accounts.edit')

  const companyId = getRouterParam(event, 'companyId')
  const body = await readBody<Record<string, unknown>>(event)

  return {
    ok: true,
    companyId,
    updatedFields: Object.keys(body ?? {}),
    updatedAt: new Date().toISOString(),
  }
})
