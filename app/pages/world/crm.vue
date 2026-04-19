<script setup lang="ts">
import { useCrmPermissions } from '~/composables/useCrmPermissions'

const { t } = useI18n()
const { can } = useCrmPermissions()

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
  {
    title: t('world.crm.nav.company'),
    to: '/world/crm/company',
    icon: 'mdi-domain',
  },
  ...(can('crm.admin.manage')
    ? [
        {
          title: t('world.crm.nav.admin'),
          to: '/world/crm/admin',
          icon: 'mdi-shield-crown-outline',
        },
      ]
    : []),
])
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.actions.createLead')"
      action-icon="mdi-account-plus-outline"
    />
    <NuxtPage />
  </div>
</template>
