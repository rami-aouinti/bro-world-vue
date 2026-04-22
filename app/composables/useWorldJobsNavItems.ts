export function useWorldJobsNavItems() {
  const { t } = useI18n()

  const jobsNavItems = computed(() => [
    {
      title: t('world.jobs.nav.offers'),
      to: '/world/jobs/offers',
      icon: 'mdi-briefcase-outline',
    },
    {
      title: t('world.jobs.nav.myOffers'),
      to: '/world/jobs/my-offers',
      icon: 'mdi-account-tie-outline',
    },
    {
      title: t('world.jobs.nav.applications'),
      to: '/world/jobs/applications',
      icon: 'mdi-file-document-outline',
    },
    {
      title: t('world.jobs.nav.apply'),
      to: '/world/jobs/apply',
      icon: 'mdi-send-outline',
    },
    {
      title: t('world.jobs.nav.admin'),
      to: '/world/jobs/admin',
      icon: 'mdi-shield-crown-outline',
      rootOnly: true,
    },
  ])

  return {
    jobsNavItems,
  }
}
