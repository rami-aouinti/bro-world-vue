<script setup lang="ts">
definePageMeta({ layout: 'crm', title: 'CRM Endpoints' })

const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const endpointsStore = useWorldCrmEndpointsStore()

await useAsyncData('world-crm-endpoints-catalog', () => endpointsStore.fetchCatalog())
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.endpoints.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.endpoints.actions.openAdmin')"
      action-icon="mdi-cog-outline"
      @action="$router.push('/world/crm/admin')"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
        <h2 class="text-h5 mb-2">{{ t('world.crm.endpoints.page.title') }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ t('world.crm.endpoints.page.description') }}
        </p>
      </v-card>

      <v-alert
        v-if="endpointsStore.error"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ endpointsStore.error }}
      </v-alert>

      <v-row v-if="endpointsStore.pending && !endpointsStore.groups.length" class="mb-4">
        <v-col v-for="item in 6" :key="`endpoint-skeleton-${item}`" cols="12" lg="6">
          <v-skeleton-loader type="article" class="rounded-xl" />
        </v-col>
      </v-row>

      <div v-for="group in endpointsStore.groups" :key="group.key" class="mb-6">
        <h3 class="text-h6 mb-3">{{ t(group.title) }}</h3>
        <v-row>
          <v-col
            v-for="endpoint in group.endpoints"
            :key="endpoint.id"
            cols="12"
            lg="6"
          >
            <CrmEndpointAction :config="{ ...endpoint, title: t(`world.crm.endpoints.items.${endpoint.id}`) }" />
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>
