import type { SessionUser } from '~/types/session'

export const CRM_PERMISSIONS = [
  'crm.projects.read',
  'crm.projects.edit',
  'crm.projects.delete',
  'crm.accounts.read',
  'crm.accounts.edit',
  'crm.accounts.delete',
  'crm.leads.read',
  'crm.leads.edit',
  'crm.contacts.read',
  'crm.contacts.edit',
  'crm.opportunities.read',
  'crm.opportunities.edit',
  'crm.activities.read',
  'crm.activities.edit',
  'crm.notes.read',
  'crm.notes.edit',
  'crm.admin.manage',
] as const

export type CrmPermission = (typeof CRM_PERMISSIONS)[number]

export const CRM_ROLE_PERMISSIONS: Record<string, CrmPermission[]> = {
  ROLE_ROOT: [...CRM_PERMISSIONS],
  ROLE_CRM_ADMIN: [...CRM_PERMISSIONS],
  ROLE_CRM_EDITOR: [
    'crm.projects.read',
    'crm.projects.edit',
    'crm.accounts.read',
    'crm.accounts.edit',
    'crm.leads.read',
    'crm.leads.edit',
    'crm.contacts.read',
    'crm.contacts.edit',
    'crm.opportunities.read',
    'crm.opportunities.edit',
    'crm.activities.read',
    'crm.activities.edit',
    'crm.notes.read',
    'crm.notes.edit',
  ],
  ROLE_CRM_PROJECT_MANAGER: [
    'crm.projects.read',
    'crm.projects.edit',
    'crm.accounts.read',
    'crm.opportunities.read',
    'crm.opportunities.edit',
    'crm.activities.read',
    'crm.activities.edit',
  ],
  ROLE_CRM_ACCOUNT_MANAGER: [
    'crm.accounts.read',
    'crm.accounts.edit',
    'crm.contacts.read',
    'crm.contacts.edit',
    'crm.projects.read',
    'crm.opportunities.read',
    'crm.notes.read',
  ],
  ROLE_CRM_SALES_REP: [
    'crm.leads.read',
    'crm.leads.edit',
    'crm.accounts.read',
    'crm.contacts.read',
    'crm.opportunities.read',
    'crm.opportunities.edit',
    'crm.activities.read',
    'crm.activities.edit',
    'crm.notes.read',
    'crm.notes.edit',
  ],
  ROLE_CRM_VIEWER: [
    'crm.projects.read',
    'crm.accounts.read',
    'crm.leads.read',
    'crm.contacts.read',
    'crm.opportunities.read',
    'crm.activities.read',
    'crm.notes.read',
  ],
}

export const CRM_PERMISSION_LABELS: Record<CrmPermission, string> = {
  'crm.projects.read': 'Projects · Read',
  'crm.projects.edit': 'Projects · Edit',
  'crm.projects.delete': 'Projects · Delete',
  'crm.accounts.read': 'Accounts · Read',
  'crm.accounts.edit': 'Accounts · Edit',
  'crm.accounts.delete': 'Accounts · Delete',
  'crm.leads.read': 'Leads · Read',
  'crm.leads.edit': 'Leads · Edit',
  'crm.contacts.read': 'Contacts · Read',
  'crm.contacts.edit': 'Contacts · Edit',
  'crm.opportunities.read': 'Opportunities · Read',
  'crm.opportunities.edit': 'Opportunities · Edit',
  'crm.activities.read': 'Activities · Read',
  'crm.activities.edit': 'Activities · Edit',
  'crm.notes.read': 'Notes · Read',
  'crm.notes.edit': 'Notes · Edit',
  'crm.admin.manage': 'Admin · Manage policies',
}

export function resolveCrmPermissionsForRoles(
  roles: string[],
): CrmPermission[] {
  const permissions = new Set<CrmPermission>()

  for (const role of roles) {
    const granted = CRM_ROLE_PERMISSIONS[role]

    if (!granted) {
      continue
    }

    for (const permission of granted) {
      permissions.add(permission)
    }
  }

  return Array.from(permissions)
}

export function resolveCrmPermissionsForUser(
  user: SessionUser | null | undefined,
): CrmPermission[] {
  if (!user) {
    return []
  }

  const roleBasedPermissions = resolveCrmPermissionsForRoles(user.roles ?? [])
  const explicitPermissions = (user.permissions ?? []).filter(
    (permission): permission is CrmPermission =>
      CRM_PERMISSIONS.includes(permission as CrmPermission),
  )

  return Array.from(new Set([...roleBasedPermissions, ...explicitPermissions]))
}

export function hasCrmPermission(
  user: SessionUser | null | undefined,
  permission: CrmPermission,
): boolean {
  return resolveCrmPermissionsForUser(user).includes(permission)
}
