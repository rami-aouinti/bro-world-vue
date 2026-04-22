<script setup lang="ts">
import CrmChatPanel from '~/components/crm/CrmChatPanel.vue'

definePageMeta({ layout: 'crm', title: 'CRM Chat' })

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
      <CrmChatPanel />
    </v-container>
  </div>
</template>
