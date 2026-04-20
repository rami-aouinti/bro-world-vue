<script setup lang="ts">
definePageMeta({ title: 'CRM Calendar' })

const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
</script>

<template>
  <div>
    <WorldModuleDrawers
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
          Cette page CRM est prête pour le futur module Calendar.
        </p>
      </v-card>
    </v-container>
  </div>
</template>
