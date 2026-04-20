<script setup lang="ts">
import type { CrmGeneralCollectionResponse } from '~/types/world/crmGeneral'

const props = defineProps<{
  section: 'companies' | 'projects' | 'tasks' | 'task-requests' | 'sprints' | 'billings' | 'contacts'
}>()

const router = useRouter()
const { crmNavItems } = useWorldCrmNavItems()

const sectionMap = {
  companies: { title: 'Companies', icon: 'mdi-domain', endpoint: 'companies' },
  projects: { title: 'Projects', icon: 'mdi-folder-outline', endpoint: 'projects' },
  tasks: { title: 'Tasks', icon: 'mdi-format-list-checks', endpoint: 'tasks' },
  'task-requests': {
    title: 'Task requests',
    icon: 'mdi-file-document-edit-outline',
    endpoint: 'task-requests',
  },
  sprints: { title: 'Sprints', icon: 'mdi-run-fast', endpoint: 'sprints' },
  billings: {
    title: 'Billings',
    icon: 'mdi-receipt-text-outline',
    endpoint: 'billings',
  },
  contacts: {
    title: 'Contacts',
    icon: 'mdi-account-box-multiple-outline',
    endpoint: 'contacts',
  },
} as const

const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 12

const sectionConfig = computed(() => sectionMap[props.section])

const endpoint = computed(
  () => `/api/crm/general/${sectionConfig.value.endpoint}`,
)
const fetchKey = computed(
  () => `crm-admin-section-${sectionConfig.value.endpoint}`,
)

const { data, pending, error, refresh } = await useFetch<
  CrmGeneralCollectionResponse<Record<string, unknown>>
>(endpoint, {
  key: fetchKey,
  watch: [endpoint],
})

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()
  const items = data.value?.items ?? []

  if (!query) return items

  return items.filter((item) =>
    Object.values(item)
      .filter((value) => typeof value !== 'object' && value !== null)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredItems.value.length / itemsPerPage)),
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})

watch([search, filteredItems], () => {
  currentPage.value = 1
})

watch(
  () => props.section,
  () => {
    search.value = ''
    currentPage.value = 1
  },
)

function itemKey(item: Record<string, unknown>) {
  return String(item.id ?? item.crmId ?? JSON.stringify(item))
}

function itemTitle(item: Record<string, unknown>) {
  return String(item.name ?? item.title ?? item.id ?? 'Sans titre')
}

function previewEntries(item: Record<string, unknown>) {
  return Object.entries(item)
    .filter(([key, value]) => key !== 'id' && value !== null && typeof value !== 'object')
    .slice(0, 4)
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      :module-description="`Admin ${sectionConfig.title}`"
      :nav-items="crmNavItems"
      action-label="Actualiser"
      action-icon="mdi-refresh"
      @action="refresh"
    />

    <v-container fluid>
      <div class="d-flex align-center justify-space-between mb-4 ga-3 flex-wrap">
        <div class="d-flex align-center ga-2">
          <v-btn icon="mdi-arrow-left" variant="text" @click="router.push('/world/crm/admin')" />
          <h2 class="text-h5 mb-0">{{ sectionConfig.title }}</h2>
        </div>
      </div>

      <v-text-field
        v-model="search"
        class="mb-4"
        prepend-inner-icon="mdi-magnify"
        :label="`Rechercher dans ${sectionConfig.title}`"
        clearable
        variant="outlined"
        :disabled="pending"
      />

      <CrmPageSkeleton v-if="pending" variant="list" :cards="6" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
        Erreur lors du chargement.
      </v-alert>

      <v-row v-else>
        <v-col v-for="item in paginatedItems" :key="itemKey(item)" cols="12" md="6" xl="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
            <div class="d-flex align-start justify-space-between ga-2 mb-3">
              <h3 class="text-subtitle-1 mb-0">{{ itemTitle(item) }}</h3>
              <v-chip size="small" color="primary" variant="tonal">{{ item.id ?? 'n/a' }}</v-chip>
            </div>

            <p
              v-for="[key, value] in previewEntries(item)"
              :key="key"
              class="text-body-2 mb-1"
            >
              <span class="font-weight-medium">{{ key }}:</span> {{ value }}
            </p>
          </v-card>
        </v-col>

        <v-col v-if="paginatedItems.length === 0" cols="12">
          <v-alert type="info" variant="tonal">Aucun résultat.</v-alert>
        </v-col>
      </v-row>

      <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
        <v-pagination v-model="currentPage" :length="totalPages" rounded="circle" />
      </div>
    </v-container>
  </div>
</template>
