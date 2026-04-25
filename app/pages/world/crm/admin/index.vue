<script setup lang="ts">
definePageMeta({ layout: 'crm', title: 'CRM Admin' })

const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const { sessionUser } = useCrmPermissions()

const isRootAdmin = computed(() =>
  (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
)

const kpiTiles = [
  {
    title: 'MRR',
    value: '$284,700',
    trend: '+12.4%',
    tone: 'success',
    icon: 'mdi-cash-multiple',
    caption: 'vs month dernier',
  },
  {
    title: 'Nouveaux leads',
    value: '1,482',
    trend: '+8.1%',
    tone: 'success',
    icon: 'mdi-account-multiple-plus-outline',
    caption: '7 derniers jours',
  },
  {
    title: 'Taux de conversion',
    value: '34.8%',
    trend: '-1.7%',
    tone: 'warning',
    icon: 'mdi-chart-line-variant',
    caption: 'pipeline global',
  },
  {
    title: 'Tickets SLA en retard',
    value: '17',
    trend: '-6',
    tone: 'success',
    icon: 'mdi-timer-alert-outline',
    caption: 'objectif: < 20',
  },
]

const funnelStages = [
  { label: 'Prospection', deals: 54, amount: '$410k' },
  { label: 'Qualification', deals: 31, amount: '$295k' },
  { label: 'Proposition', deals: 19, amount: '$188k' },
  { label: 'Négociation', deals: 11, amount: '$121k' },
  { label: 'Closing', deals: 7, amount: '$84k' },
]

const teams = [
  { name: 'Sales Ops', owner: 'Amine', velocity: '92%', status: 'Excellent' },
  { name: 'Customer Success', owner: 'Meriem', velocity: '87%', status: 'Stable' },
  { name: 'Partnerships', owner: 'Yassir', velocity: '73%', status: 'À surveiller' },
  { name: 'Finance CRM', owner: 'Lina', velocity: '95%', status: 'Excellent' },
]

const todayAgenda = [
  { time: '09:00', event: 'QBR - Compte Enterprise Orbitex', owner: 'Account Team A' },
  { time: '11:30', event: 'Validation devis 2026 / segment SaaS', owner: 'Finance CRM' },
  { time: '14:00', event: 'Sprint planning - intégrations API', owner: 'RevOps + Dev' },
  { time: '16:30', event: 'Point risques churn clients premium', owner: 'Customer Success' },
]

const mainAdminNav = computed(() => [
  { label: t('world.crm.admin.sections.companies'), icon: 'mdi-domain', to: '/world/crm/admin/companies' },
  { label: t('world.crm.admin.sections.projects'), icon: 'mdi-folder-outline', to: '/world/crm/admin/projects' },
  { label: t('world.crm.admin.sections.tasks'), icon: 'mdi-format-list-checks', to: '/world/crm/admin/tasks' },
  { label: t('world.crm.admin.sections.taskRequests'), icon: 'mdi-file-document-edit-outline', to: '/world/crm/admin/task-requests' },
  { label: t('world.crm.admin.sections.sprints'), icon: 'mdi-run-fast', to: '/world/crm/admin/sprints' },
  { label: t('world.crm.admin.sections.billings'), icon: 'mdi-receipt-text-outline', to: '/world/crm/admin/billings' },
  { label: t('world.crm.admin.sections.contacts'), icon: 'mdi-account-box-multiple-outline', to: '/world/crm/admin/contacts' },
])

const rightNavItems = computed(() => [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/world/crm/admin' },
  ...mainAdminNav.value,
  {
    title: t('world.crm.endpoints.page.title', 'Endpoints API'),
    icon: 'mdi-api',
    to: '/world/crm/endpoints',
  },
  ...(isRootAdmin.value
    ? [{ title: 'GitHub Sync', icon: 'mdi-github', to: '/world/crm/github-sync' }, { title: 'GitLab Sync', icon: 'mdi-gitlab', to: '/world/crm/gitlab-sync' }]
    : []),
])
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
        <v-card rounded="xl" class="pa-3 postcard-gradient-card">
          <p class="text-subtitle-2 mb-3">Navigation Admin</p>
          <v-list density="comfortable" bg-color="transparent" nav>
            <v-list-item
              v-for="item in rightNavItems"
              :key="item.to"
              :prepend-icon="item.icon"
              :title="item.title || item.label"
              :to="item.to"
              rounded="lg"
              color="primary"
            />
          </v-list>
        </v-card>
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
        <h2 class="text-h5 mb-2">CRM Pro Dashboard</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Vue consolidée (fake data) du revenue, pipeline, delivery, support et activité équipe.
        </p>
      </v-card>

      <v-row class="mb-2">
        <v-col
          v-for="tile in kpiTiles"
          :key="tile.title"
          cols="12"
          sm="6"
          lg="3"
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
      </v-row>

      <v-row>
        <v-col cols="12" lg="8">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
            <div class="d-flex align-center justify-space-between mb-3">
              <h3 class="text-h6 mb-0">Pipeline commercial</h3>
              <v-chip size="small" color="primary" variant="tonal">122 deals actifs</v-chip>
            </div>
            <v-table density="comfortable">
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

        <v-col cols="12" lg="4">
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

        <v-col cols="12">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card">
            <div class="d-flex align-center justify-space-between mb-3">
              <h3 class="text-h6 mb-0">Performance équipes CRM</h3>
              <v-chip size="small" color="info" variant="tonal">Mise à jour toutes les 4h</v-chip>
            </div>
            <v-table density="comfortable">
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
    </v-container>
  </div>
</template>
