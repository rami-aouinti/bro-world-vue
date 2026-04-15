import { requireCrmPermission } from '~~/server/utils/crmAccessControl'

export default defineEventHandler(async (event) => {
  await requireCrmPermission(event, 'crm.accounts.delete')

  const companyId = getRouterParam(event, 'companyId')

  return {
    ok: true,
    companyId,
    deletedAt: new Date().toISOString(),
  }
})
