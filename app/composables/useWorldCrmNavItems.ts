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
            title: t('world.crm.nav.company'),
            to: '/world/crm/company',
            icon: 'mdi-domain',
          },
          {
            title: t('world.crm.nav.githubSync', 'GitHub Sync'),
            to: '/world/crm/github-sync',
            icon: 'mdi-github',
          },
          {
            title: t('world.crm.endpoints.nav.title'),
            to: '/world/crm/endpoints',
            icon: 'mdi-api',
          },
          {
            title: t('world.crm.taskRequests.list.title'),
            to: '/world/crm/task-requests',
            icon: 'mdi-source-pull',
          },
          {
            title: t('world.crm.billings.list.title'),
            to: '/world/crm/billings',
            icon: 'mdi-cash-multiple',
          },
          {
            title: t('world.crm.contacts.list.title', 'Contacts'),
            to: '/world/crm/contacts',
            icon: 'mdi-card-account-phone-outline',
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
