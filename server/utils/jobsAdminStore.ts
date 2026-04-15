import type {
  JobAccessRole,
  JobPermissionMatrix,
  JobsAdminPolicyResponse,
  JobsDataRetentionPolicy,
} from '~~/server/types/api/jobs'
import type { SessionUser } from '~/types/session'

const rolesPriority: JobAccessRole[] = ['admin', 'recruiter', 'hiring_manager', 'interviewer']

const permissions: Record<JobAccessRole, JobPermissionMatrix> = {
  recruiter: {
    canViewPii: true,
    canViewCompensation: true,
    canTransitionStage: true,
    canEditNotes: true,
    canViewDiversity: false,
    canManagePolicy: false,
  },
  hiring_manager: {
    canViewPii: true,
    canViewCompensation: true,
    canTransitionStage: true,
    canEditNotes: true,
    canViewDiversity: true,
    canManagePolicy: false,
  },
  interviewer: {
    canViewPii: false,
    canViewCompensation: false,
    canTransitionStage: false,
    canEditNotes: false,
    canViewDiversity: false,
    canManagePolicy: false,
  },
  admin: {
    canViewPii: true,
    canViewCompensation: true,
    canTransitionStage: true,
    canEditNotes: true,
    canViewDiversity: true,
    canManagePolicy: true,
  },
}

const policy: JobsDataRetentionPolicy = {
  retentionDays: 730,
  anonymizeAfterDays: 180,
  restrictedAccessEnabled: true,
  autoDeleteRejectedAfterDays: 365,
  legalHoldEnabled: true,
}

export const getJobsPolicy = (): JobsDataRetentionPolicy => policy

export const getJobsAdminPolicy = (): JobsAdminPolicyResponse => ({
  policy,
  permissions,
})

export const updateJobsPolicy = (nextPolicy: Partial<JobsDataRetentionPolicy>): JobsDataRetentionPolicy => {
  if (typeof nextPolicy.retentionDays === 'number') {
    policy.retentionDays = Math.max(30, Math.round(nextPolicy.retentionDays))
  }

  if (typeof nextPolicy.anonymizeAfterDays === 'number') {
    policy.anonymizeAfterDays = Math.max(7, Math.round(nextPolicy.anonymizeAfterDays))
  }

  if (typeof nextPolicy.autoDeleteRejectedAfterDays === 'number') {
    policy.autoDeleteRejectedAfterDays = Math.max(30, Math.round(nextPolicy.autoDeleteRejectedAfterDays))
  }

  if (typeof nextPolicy.restrictedAccessEnabled === 'boolean') {
    policy.restrictedAccessEnabled = nextPolicy.restrictedAccessEnabled
  }

  if (typeof nextPolicy.legalHoldEnabled === 'boolean') {
    policy.legalHoldEnabled = nextPolicy.legalHoldEnabled
  }

  return policy
}

export const updateRolePermission = (
  role: JobAccessRole,
  partial: Partial<JobPermissionMatrix>,
): JobPermissionMatrix => {
  permissions[role] = {
    ...permissions[role],
    ...partial,
  }

  return permissions[role]
}

export const resolveJobAccessRole = (user: SessionUser | null): JobAccessRole => {
  const roles = new Set(user?.roles ?? [])

  if (roles.has('ROLE_ROOT') || roles.has('ROLE_ADMIN') || roles.has('ROLE_HR_ADMIN')) {
    return 'admin'
  }

  if (roles.has('ROLE_RECRUITER')) {
    return 'recruiter'
  }

  if (roles.has('ROLE_HIRING_MANAGER')) {
    return 'hiring_manager'
  }

  if (roles.has('ROLE_INTERVIEWER')) {
    return 'interviewer'
  }

  return 'interviewer'
}

export const getResolvedPermissions = (role: JobAccessRole): JobPermissionMatrix => {
  return permissions[role]
}

export const getHighestRoleFromMany = (roles: JobAccessRole[]): JobAccessRole => {
  for (const role of rolesPriority) {
    if (roles.includes(role)) {
      return role
    }
  }

  return 'interviewer'
}
