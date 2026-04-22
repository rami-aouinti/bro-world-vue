<script setup lang="ts">
import CrmCalendarPanel from '~/components/crm/CrmCalendarPanel.vue'

definePageMeta({ layout: 'crm', title: 'CRM Calendar' })

const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription')"
      :nav-items="crmNavItems"
    />

    <v-container fluid>
      <CrmCalendarPanel />
    </v-container>
  </div>
</template>
