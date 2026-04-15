<script setup lang="ts">
import { useCrmPermissions } from '~/composables/useCrmPermissions'
import { useWorldCrmStore } from '~/stores/worldCrm'

definePageMeta({ title: 'CRM Projects' })

const { t } = useI18n()
const { can } = useCrmPermissions()

const crmNavItems = computed(() => [
  {
    title: t('world.crm.nav.overview', 'Overview CRM'),
    to: '/world/crm',
    icon: 'mdi-view-dashboard-outline',
  },
  {
    title: t('world.crm.nav.projects', 'Projects'),
    to: '/world/crm/projects',
    icon: 'mdi-folder-outline',
  },
  {
    title: t('world.crm.nav.tasks', 'Tasks'),
    to: '/world/crm/tasks',
    icon: 'mdi-format-list-checks',
  },
  {
    title: t('world.crm.nav.sprints', 'Sprints'),
    to: '/world/crm/sprints',
    icon: 'mdi-run-fast',
  },
  {
    title: t('world.crm.nav.company', 'Company'),
    to: '/world/crm/company',
    icon: 'mdi-domain',
  },
  ...(can('crm.admin.manage')
    ? [
        {
          title: t('world.crm.nav.admin', 'Admin'),
          to: '/world/crm/admin',
          icon: 'mdi-shield-crown-outline',
        },
      ]
    : []),
])

const crmStore = useWorldCrmStore()
await crmStore.fetchList('projects', {
  filters: { sortBy: 'id', sortOrder: 'asc' },
  pagination: { page: 1, limit: 10 },
})

const rows = computed<Record<string, string | number>[]>(
  () => crmStore.items as Record<string, string | number>[],
)
const isLoading = computed(() => crmStore.pending)
const hasError = computed(() => !!crmStore.error)
const isEmpty = computed(() => !isLoading.value && !hasError.value && !rows.value.length)
const search = ref('')
const selectedManager = ref('all')
const selectedPhase = ref('all')

const managerOptions = computed(() => {
  const managers = new Set<string>()
  for (const row of rows.value) {
    const manager = String(row.manager ?? '').trim()
    if (manager) managers.add(manager)
  }
  return ['all', ...Array.from(managers)]
})

const phaseOptions = computed(() => {
  const phases = new Set<string>()
  for (const row of rows.value) {
    const phase = String(row.phase ?? '').trim()
    if (phase) phases.add(phase)
  }
  return ['all', ...Array.from(phases)]
})

const filteredRows = computed(() =>
  rows.value.filter((row) => {
    const searchable = Object.values(row).join(' ').toLowerCase()
    const matchesSearch = searchable.includes(search.value.toLowerCase().trim())
    const matchesManager =
      selectedManager.value === 'all' ||
      String(row.manager ?? '') === selectedManager.value
    const matchesPhase =
      selectedPhase.value === 'all' || String(row.phase ?? '') === selectedPhase.value

    return matchesSearch && matchesManager && matchesPhase
  }),
)

function normalizeProgress(value: unknown) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 0
  return Math.min(100, Math.max(0, Math.round(numeric)))
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label', 'CRM')"
      module-icon="mdi-account-group-outline"
      :module-description="
        t(
          'world.crm.moduleDescription',
          'Navigation CRM avec gestion des projets et entreprises.',
        )
      "
      :nav-items="crmNavItems"
      action-label="New project"
      action-icon="mdi-folder-plus-outline"
    >
      <template #right>
        <v-card rounded="xl" class="pa-4 postcard-gradient-card" variant="tonal">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Filters</h3>
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search project"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-3"
          />
          <v-select
            v-model="selectedManager"
            :items="managerOptions"
            label="Manager"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-3"
          />
          <v-select
            v-model="selectedPhase"
            :items="phaseOptions"
            label="Phase"
            variant="outlined"
            density="comfortable"
            hide-details
          />
        </v-card>
      </template>
    </WorldModuleDrawers>

    <v-container fluid>
      <v-alert
        v-if="isLoading"
        data-testid="crm-projects-loading"
        type="info"
        variant="tonal"
        class="mb-4"
        text="Chargement des projets CRM..."
      />
      <v-alert
        v-else-if="hasError"
        data-testid="crm-projects-error"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="crmStore.error ?? undefined"
      />
      <v-alert
        v-else-if="isEmpty"
        data-testid="crm-projects-empty"
        type="warning"
        variant="tonal"
        class="mb-4"
        text="Aucun projet CRM à afficher."
      />

      <v-row>
        <v-col
          v-for="project in filteredRows"
          :key="String(project.id)"
          cols="12"
          md="6"
          xl="4"
        >
          <v-card rounded="xl" class="h-100 postcard-gradient-card">
            <v-card-item>
              <v-card-title class="d-flex align-center justify-space-between">
                <span>{{ project.project || project.name || `Project #${project.id}` }}</span>
                <v-chip size="small" color="primary" variant="tonal">
                  {{ project.phase || 'N/A' }}
                </v-chip>
              </v-card-title>
              <v-card-subtitle>
                Manager: {{ project.manager || 'N/A' }}
              </v-card-subtitle>
            </v-card-item>
            <v-card-text>
              <div class="d-flex justify-space-between text-caption mb-2">
                <span>Progress</span>
                <strong>{{ normalizeProgress(project.progress) }}%</strong>
              </div>
              <v-progress-linear
                :model-value="normalizeProgress(project.progress)"
                color="primary"
                height="8"
                rounded
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
