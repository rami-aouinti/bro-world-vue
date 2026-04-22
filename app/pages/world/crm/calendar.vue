<script setup lang="ts">
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
      <v-card rounded="xl" class="pa-6 postcard-gradient-card">
        <h1 class="text-h5 mb-2">Calendar</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ t('world.crm.comingSoon.calendar') }}
        </p>
      </v-card>
    </v-container>
  </div>
</template>
