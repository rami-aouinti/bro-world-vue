export function useWorldCrmAdminNavItems() {
  const { t } = useI18n()
  const { sessionUser } = useCrmPermissions()

  const isRootAdmin = computed(() =>
    (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
  )

  const adminSectionNavItems = computed(() => [
    {
      title: t('world.crm.admin.sections.companies'),
      icon: 'mdi-domain',
      to: '/world/crm/admin/companies',
    },
    {
      title: t('world.crm.admin.sections.projects'),
      icon: 'mdi-folder-outline',
      to: '/world/crm/admin/projects',
    },
    {
      title: t('world.crm.admin.sections.tasks'),
      icon: 'mdi-format-list-checks',
      to: '/world/crm/admin/tasks',
    },
    {
      title: t('world.crm.admin.sections.taskRequests'),
      icon: 'mdi-file-document-edit-outline',
      to: '/world/crm/admin/task-requests',
    },
    {
      title: t('world.crm.admin.sections.sprints'),
      icon: 'mdi-run-fast',
      to: '/world/crm/admin/sprints',
    },
    {
      title: t('world.crm.admin.sections.billings'),
      icon: 'mdi-receipt-text-outline',
      to: '/world/crm/admin/billings',
    },
    {
      title: t('world.crm.admin.sections.contacts'),
      icon: 'mdi-account-box-multiple-outline',
      to: '/world/crm/admin/contacts',
    },
    {
      title: t('world.crm.admin.sections.employees'),
      icon: 'mdi-account-tie-outline',
      to: '/world/crm/admin/employees',
    },
    {
      title: t('world.crm.admin.sections.reports'),
      icon: 'mdi-file-chart-outline',
      to: '/world/crm/admin/reports',
    },
  ])

  const adminRightNavItems = computed(() => [
    {
      title: 'Dashboard',
      icon: 'mdi-view-dashboard-outline',
      to: '/world/crm/admin',
    },
    ...adminSectionNavItems.value,
    {
      title: t('world.crm.endpoints.page.title', 'Endpoints API'),
      icon: 'mdi-api',
      to: '/world/crm/endpoints',
    },
    ...(isRootAdmin.value
      ? [
          {
            title: 'GitHub Sync',
            icon: 'mdi-github',
            to: '/world/crm/github-sync',
          },
          {
            title: 'GitLab Sync',
            icon: 'mdi-gitlab',
            to: '/world/crm/gitlab-sync',
          },
        ]
      : []),
  ])

  return {
    adminSectionNavItems,
    adminRightNavItems,
  }
}
