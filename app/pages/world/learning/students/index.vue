<script setup lang="ts">
definePageMeta({ title: 'Learning Students' })

const { t } = useI18n()
const { learningNavItems } = useWorldLearningNavItems()
const search = ref('')
const selectedField = ref<string | null>(null)

const { data, pending, error, refresh } = await useAsyncData(
  'learning-school-students',
  () => $fetch<{ items: Record<string, unknown>[] }>('/api/world/learning/public/school/students'),
)

const headers = computed(() => {
  const first = (data.value?.items ?? [])[0] ?? {}
  return Object.keys(first).map(key => ({ title: key, key }))
})

const availableFields = computed(() =>
  headers.value.map(header => ({ title: header.title, value: header.key })),
)

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()
  const items = data.value?.items ?? []

  if (!query) {
    return items
  }

  return items.filter((item) => {
    if (selectedField.value) {
      return String(item[selectedField.value] ?? '').toLowerCase().includes(query)
    }

    return Object.values(item).some(value => String(value ?? '').toLowerCase().includes(query))
  })
})
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.learning.label', 'Learning')"
      module-icon="mdi-school-outline"
      :module-description="'School students catalogue and filters'"
      :nav-items="learningNavItems"
      :show-action="false"
      activate-right-drawer
    >
      <template #right>
        <div class="d-flex flex-column ga-3">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Rechercher"
            clearable
            variant="outlined"
            hide-details
          />
          <AppSelect v-model="selectedField" :items="availableFields" label="Champ" clearable />
        </div>
      </template>
    </WorldModuleDrawers>

    <v-container fluid>
      <v-card rounded="xl" class="pa-5">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h1 class="text-h5">Students</h1>
            <p class="text-medium-emphasis mb-0">Public school endpoint: /school/general/students</p>
          </div>
          <v-btn variant="text" prepend-icon="mdi-refresh" :loading="pending" @click="refresh">
            Refresh
          </v-btn>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error.message" />

        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :loading="pending"
          density="comfortable"
        />
      </v-card>
    </v-container>
  </div>
</template>
