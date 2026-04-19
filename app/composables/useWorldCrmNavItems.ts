import { useCrmPermissions } from '~/composables/useCrmPermissions'

export function useWorldCrmNavItems() {
  const { t } = useI18n()
  const { can, sessionUser } = useCrmPermissions()

  const isRootAdmin = computed(() =>
    (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
  )

  const crmNavItems = computed(() => [
    {
      title: t('world.crm.nav.overview'),
      to: '/world/crm',
      icon: 'mdi-view-dashboard-outline',
    },
    {
      title: t('world.crm.nav.projects'),
      to: '/world/crm/projects',
      icon: 'mdi-folder-outline',
    },
    {
      title: 'Kanaban',
      to: '/world/crm/kanaban',
      icon: 'mdi-view-kanban',
    },
    {
      title: t('world.crm.nav.tasks'),
      to: '/world/crm/tasks',
      icon: 'mdi-format-list-checks',
    },
    {
      title: t('world.crm.nav.sprints'),
      to: '/world/crm/sprints',
      icon: 'mdi-run-fast',
    },
    ...(isRootAdmin.value
      ? [
          {
            title: t('world.crm.nav.githubSync', 'GitHub Sync'),
            to: '/world/crm/github-sync',
            icon: 'mdi-github',
          },
          {
            title: t('world.crm.taskRequests.list.title'),
            to: '/world/crm/task-requests',
            icon: 'mdi-source-pull',
          },
        ]
      : []),
    ...(isRootAdmin.value && can('crm.admin.manage')
      ? [
          {
            title: t('world.crm.nav.admin'),
            to: '/world/crm/admin',
            icon: 'mdi-shield-crown-outline',
          },
        ]
      : []),
  ])

  return {
    crmNavItems,
  }
}
