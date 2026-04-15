import type { CrmAdminApiResponse } from '~~/server/types/api/crm'

export default defineEventHandler((): CrmAdminApiResponse => {
  return {
    policy: {
      enforceLeadAssignmentRules: true,
      enableAuditLogs: true,
      requireContractTemplate: false,
      defaultSlaHours: 24,
      regionPolicy: 'global',
    },
  }
})
