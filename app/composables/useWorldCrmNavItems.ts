import { useCrmPermissions } from '~/composables/useCrmPermissions'

export function useWorldCrmNavItems() {
  const { t } = useI18n()
  const { can, sessionUser } = useCrmPermissions()

  const isRootAdmin = computed(() =>
    (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
  )

  const crmNavItems = computed(() => [
    {
      title: t('world.crm.nav.projects'),
      to: '/world/crm/projects',
      icon: 'mdi-folder-outline',
    },
    {
      title: 'Kanaban',
      to: '/world/crm/kanaban',
      icon: 'mdi-view-column-outline',
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
    {
      title: t('world.crm.taskRequests.list.title'),
      to: '/world/crm/task-requests',
      icon: 'mdi-source-pull',
    },
    {
      title: t('world.crm.nav.repositories', 'Repositories'),
      to: '/world/crm/repositories',
      icon: 'mdi-source-repository',
    },

    {
      title: t('world.crm.endpoints.page.title', 'Endpoints API'),
      to: '/world/crm/endpoints',
      icon: 'mdi-api',
    },
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
