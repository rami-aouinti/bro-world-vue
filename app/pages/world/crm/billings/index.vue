<script setup lang="ts">
import type { ApiListResponse, CrmBillingItem } from '~~/server/types/api/crm-general'

const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
definePageMeta({ title: 'CRM Billings' })

const { data, pending, error } = await useFetch<ApiListResponse<CrmBillingItem>>('/api/crm/general/billings')
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.billings.list.title')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.billings.list.title')"
      action-icon="mdi-cash-multiple"
    />
    <v-container fluid>
      <h1 class="text-h5 mb-4">{{ t('world.crm.billings.list.title') }}</h1>
      <CrmPageSkeleton v-if="pending" variant="list" :cards="6" />
      <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.billings.alerts.loadError') }}</v-alert>
      <v-row v-else>
        <v-col v-for="billing in data?.items ?? []" :key="billing.id" cols="12" md="6" lg="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card">
            <p class="text-subtitle-1 mb-1">{{ billing.label }}</p>
            <p class="text-body-2 mb-1">{{ billing.amount }} {{ billing.currency }}</p>
            <p class="text-body-2 mb-3">{{ t('world.crm.billings.list.status') }}: {{ billing.status }}</p>
            <v-btn color="primary" variant="tonal" @click="router.push(`/world/crm/billings/${billing.id}`)">{{ t('world.crm.billings.actions.viewDetails') }}</v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
