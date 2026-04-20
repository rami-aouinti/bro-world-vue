import { useCrmPermissions } from '~/composables/useCrmPermissions'

type GeneralApplicationItem = {
  platform?: {
    key?: string
  }
  configurations?: Array<{
    key?: string
    value?: {
      migrations?: {
        github?: boolean
        google?: boolean
        azure?: boolean
      }
    }
  }>
  plugins?: Array<{
    key?: string
    name?: string
  }>
}

export function useWorldCrmNavItems() {
  const { t } = useI18n()
  const { can, sessionUser } = useCrmPermissions()
  const { data: generalApplications } = useAsyncData(
    'world-public-general-applications-crm-nav',
    () => $fetch<{ items?: GeneralApplicationItem[] }>('/api/application/public/general'),
  )

  const isRootAdmin = computed(() =>
    (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
  )

  const crmGeneralApplication = computed(() =>
    (generalApplications.value?.items ?? []).find(
      item => item.platform?.key === 'crm',
    ),
  )

  const crmMigrations = computed(() => {
    const config = (crmGeneralApplication.value?.configurations ?? []).find(
      item => item.key === 'application.crm.general',
    )

    return {
      github: Boolean(config?.value?.migrations?.github),
      google: Boolean(config?.value?.migrations?.google),
      azure: Boolean(config?.value?.migrations?.azure),
    }
  })

  const shouldShowRepositoriesNav = computed(() => {
    const { github, google, azure } = crmMigrations.value
    return github || google || azure
  })

  const pluginKeys = computed(() => {
    return new Set(
      (crmGeneralApplication.value?.plugins ?? [])
        .map(plugin => (plugin.key || plugin.name || '').toLowerCase().trim())
        .filter(Boolean),
    )
  })

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
    ...(pluginKeys.value.has('chat')
      ? [
          {
            title: 'Chat',
            to: '/world/crm/chat',
            icon: 'mdi-chat-outline',
          },
        ]
      : []),
    ...(pluginKeys.value.has('calendar')
      ? [
          {
            title: 'Calendar',
            to: '/world/crm/calendar',
            icon: 'mdi-calendar-month-outline',
          },
        ]
      : []),
    ...(shouldShowRepositoriesNav.value
      ? [
          {
            title: t('world.crm.nav.repositories', 'Repositories'),
            to: '/world/crm/repositories',
            icon: 'mdi-source-repository',
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
    hasBlogPlugin: computed(() => pluginKeys.value.has('blog')),
  }
}
