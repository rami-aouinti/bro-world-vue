<script setup lang="ts">
import { useWorldCrmAdminNavItems } from '~/composables/useWorldCrmAdminNavItems'
import type {
  CrmDashboardExecutiveResponse,
  CrmDashboardResponse,
} from '~/types/world/crmGeneral'

definePageMeta({ layout: 'crm', title: 'CRM Admin' })

const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const { adminRightNavItems } = useWorldCrmAdminNavItems()

const {
  data: dashboard,
  pending: pendingDashboard,
  error: errorDashboard,
} = useFetch<CrmDashboardResponse>('/api/crm/general/dashboard')
const {
  data: executive,
  pending: pendingExecutive,
  error: errorExecutive,
} = useFetch<CrmDashboardExecutiveResponse>('/api/crm/general/dashboard/executive')

const pending = computed(() => pendingDashboard.value || pendingExecutive.value)
const error = computed(() => errorDashboard.value || errorExecutive.value)

const kpiTiles = computed(() => executive.value?.kpiTiles ?? [])
const funnelStages = computed(() => executive.value?.funnelStages ?? [])
const teams = computed(() => executive.value?.teams ?? [])
const todayAgenda = computed(() => executive.value?.todayAgenda ?? [])
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.admin.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="'Rafraîchir le dashboard'"
      action-icon="mdi-refresh"
      @action="reloadNuxtApp()"
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

      <CrmPageSkeleton v-if="pending" variant="dashboard" />
      <v-alert v-else-if="error" type="error" variant="tonal">
        Une erreur est survenue lors du chargement du dashboard CRM.
      </v-alert>
      <template v-else>
        <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
          <h2 class="text-h5 mb-2">CRM Pro Dashboard</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Vue consolidée temps réel du revenue, pipeline, delivery, support et activité équipe.
          </p>
        </v-card>

        <v-row class="mb-1">
          <v-col cols="12" sm="6" lg="3">
            <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
              <p class="text-caption text-medium-emphasis mb-1">Companies</p>
              <p class="text-h5 font-weight-bold mb-0">{{ dashboard?.companies ?? 0 }}</p>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
              <p class="text-caption text-medium-emphasis mb-1">Projects</p>
              <p class="text-h5 font-weight-bold mb-0">{{ dashboard?.projects ?? 0 }}</p>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
              <p class="text-caption text-medium-emphasis mb-1">Tasks</p>
              <p class="text-h5 font-weight-bold mb-0">{{ dashboard?.tasks ?? 0 }}</p>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
              <p class="text-caption text-medium-emphasis mb-1">Task requests pending</p>
              <p class="text-h5 font-weight-bold mb-0">{{ dashboard?.taskRequests?.pending ?? 0 }}</p>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" lg="6">
            <v-col
              v-for="tile in kpiTiles"
              :key="tile.title"
              cols="12"
              lg="6"
              class="mb-2"
            >
              <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <p class="text-caption text-medium-emphasis mb-1">{{ tile.title }}</p>
                    <p class="text-h5 font-weight-bold mb-1">{{ tile.value }}</p>
                    <v-chip :color="tile.tone" size="small" label>{{ tile.trend }}</v-chip>
                    <p class="text-caption text-medium-emphasis mt-2 mb-0">{{ tile.caption }}</p>
                  </div>
                  <v-avatar color="primary" variant="tonal" size="42">
                    <v-icon>{{ tile.icon }}</v-icon>
                  </v-avatar>
                </div>
              </v-card>
            </v-col>
          </v-col>
          <v-col cols="12" lg="6">

            <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
              <h3 class="text-h6 mb-3">Agenda aujourd'hui</h3>
              <v-timeline density="compact" side="end" align="start">
                <v-timeline-item
                  v-for="item in todayAgenda"
                  :key="`${item.time}-${item.event}`"
                  dot-color="primary"
                  size="small"
                >
                  <div class="text-caption text-medium-emphasis">{{ item.time }}</div>
                  <div class="text-body-2 font-weight-medium">{{ item.event }}</div>
                  <div class="text-caption">{{ item.owner }}</div>
                </v-timeline-item>
              </v-timeline>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" lg="12">
            <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
              <div class="d-flex align-center justify-space-between mb-3">
                <h3 class="text-h6 mb-0">Pipeline commercial</h3>
                <v-chip size="small" color="primary" variant="tonal">122 deals actifs</v-chip>
              </div>
              <v-table density="comfortable" class="bg-transparent">
                <thead>
                  <tr>
                    <th>Étape</th>
                    <th>Opportunités</th>
                    <th>Valeur estimée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="stage in funnelStages" :key="stage.label">
                    <td>{{ stage.label }}</td>
                    <td>{{ stage.deals }}</td>
                    <td>{{ stage.amount }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card rounded="xl" class="pa-4 postcard-gradient-card">
              <div class="d-flex align-center justify-space-between mb-3">
                <h3 class="text-h6 mb-0">Performance équipes CRM</h3>
                <v-chip size="small" color="info" variant="tonal">Mise à jour toutes les 4h</v-chip>
              </div>
              <v-table density="comfortable" class="bg-transparent">
                <thead>
                  <tr>
                    <th>Equipe</th>
                    <th>Owner</th>
                    <th>Velocity</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="team in teams" :key="team.name">
                    <td>{{ team.name }}</td>
                    <td>{{ team.owner }}</td>
                    <td>{{ team.velocity }}</td>
                    <td>{{ team.status }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>
