<script setup lang="ts">
import type { SessionUser } from '~/types/session'

const { t } = useI18n()
const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)

const jobsNavItems = computed(() => [
  {
    title: t('world.jobs.nav.overview'),
    to: '/world/jobs',
    icon: 'mdi-view-dashboard-outline',
  },
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
  ...(isRoot.value
    ? [
        {
          title: t('world.jobs.nav.admin'),
          to: '/world/jobs/admin',
          icon: 'mdi-shield-crown-outline',
          rootOnly: true,
        },
      ]
    : []),
])
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.jobs.label')"
      module-icon="mdi-briefcase-search-outline"
      :module-description="t('world.jobs.moduleDescription')"
      :nav-items="jobsNavItems"
      :action-label="t('world.jobs.actions.publishOffer')"
      action-icon="mdi-briefcase-plus-outline"
    />
    <NuxtPage />
  </div>
</template>
