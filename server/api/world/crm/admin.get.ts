import type { CrmAdminApiResponse } from '~~/server/types/api/crm'
import { CRM_ROLE_PERMISSIONS } from '~~/shared/crmAccess'
import {
  getCurrentUserCrmPermissions,
  requireCrmPermission,
} from '~~/server/utils/crmAccessControl'

export default defineEventHandler(async (event): Promise<CrmAdminApiResponse> => {
  await requireCrmPermission(event, 'crm.admin.manage')
  const currentUserPermissions = await getCurrentUserCrmPermissions(event)

  return {
    policy: {
      enforceLeadAssignmentRules: true,
      enableAuditLogs: true,
      requireContractTemplate: false,
      defaultSlaHours: 24,
      regionPolicy: 'global',
    },
    roleMappings: Object.entries(CRM_ROLE_PERMISSIONS).map(([role, permissions]) => ({
      role,
      permissions,
    })),
    auditLogs: [
      {
        id: 'AUD-9004',
        actor: 'n.park',
        action: 'update_permission_mapping',
        targetType: 'role_mapping',
        targetId: 'ROLE_CRM_EDITOR',
        changedAt: '2026-04-13T10:15:00Z',
        details: 'Added crm.accounts.edit permission to ROLE_CRM_EDITOR.',
      },
      {
        id: 'AUD-9003',
        actor: 's.ali',
        action: 'delete_project',
        targetType: 'project',
        targetId: 'P-108',
        changedAt: '2026-04-12T16:40:00Z',
        details: 'Deleted project Referral Automation after consolidation.',
      },
      {
        id: 'AUD-9002',
        actor: 'm.costa',
        action: 'update_account',
        targetType: 'account',
        targetId: 'C-3002',
        changedAt: '2026-04-12T09:05:00Z',
        details: 'Updated account owner and health status.',
      },
      {
        id: 'AUD-9001',
        actor: 'e.stone',
        action: 'update_policy',
        targetType: 'policy',
        targetId: 'crm-global-policy',
        changedAt: '2026-04-11T14:22:00Z',
        details: 'Enabled audit logs and changed default SLA to 24h.',
      },
    ],
    currentUserPermissions,
  }
})
