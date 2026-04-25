<script setup lang="ts">
import { useWorldCrmAdminNavItems } from '~/composables/useWorldCrmAdminNavItems'

definePageMeta({ layout: 'crm', title: 'CRM Admin reports' })

const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const { adminRightNavItems } = useWorldCrmAdminNavItems()

const { data, pending, error, refresh } = useFetch<Record<string, any>>(
  '/api/crm/general/reports',
  { query: { format: 'json' } },
)
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      module-description="Admin Reports"
      :nav-items="crmNavItems"
      action-label="Refresh"
      action-icon="mdi-refresh"
      @action="refresh()"
    >
      <template #right>
        <v-list density="comfortable" bg-color="transparent" nav>
          <v-list-item
            v-for="item in adminRightNavItems"
            :key="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
            rounded="lg"
            color="primary"
          />
        </v-list>
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <div class="d-flex align-center justify-space-between mb-4 ga-3 flex-wrap">
        <h2 class="text-h5 mb-0">Reports</h2>
        <div class="d-flex ga-2 flex-wrap">
          <v-btn color="primary" variant="tonal" href="/api/crm/general/reports?format=json" target="_blank">
            Export JSON
          </v-btn>
          <v-btn color="primary" variant="tonal" href="/api/crm/general/reports?format=csv" target="_blank">
            Export CSV
          </v-btn>
          <v-btn color="primary" variant="tonal" href="/api/crm/general/reports?format=pdf" target="_blank">
            Export PDF
          </v-btn>
        </div>
      </div>

      <CrmPageSkeleton v-if="pending" variant="list" :cards="4" />
      <v-alert v-else-if="error" type="error" variant="tonal">Unable to load reports.</v-alert>

      <v-row v-else>
        <v-col cols="12" md="6">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
            <h3 class="text-h6 mb-3">KPIs</h3>
            <v-table density="comfortable" class="bg-transparent">
              <tbody>
                <tr v-for="(value, key) in data?.kpis ?? {}" :key="String(key)">
                  <td class="font-weight-medium">{{ key }}</td>
                  <td>{{ value }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
            <h3 class="text-h6 mb-3">Counts</h3>
            <v-table density="comfortable" class="bg-transparent">
              <tbody>
                <tr v-for="(value, key) in data?.counts ?? {}" :key="String(key)">
                  <td class="font-weight-medium">{{ key }}</td>
                  <td>{{ value }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
