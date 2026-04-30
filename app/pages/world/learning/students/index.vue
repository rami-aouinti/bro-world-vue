<script setup lang="ts">
import type { SchoolResource } from '~/stores/worldLearningSchool'
import { useWorldLearningSchoolStore } from '~/stores/worldLearningSchool'
import LearningResourceCards from '~/components/World/LearningResourceCards.vue'

definePageMeta({ layout: 'learning', title: 'Learning Students' })

const { t } = useI18n()
const { learningNavItems } = useWorldLearningNavItems()
const schoolStore = useWorldLearningSchoolStore()
const resource = 'students' as SchoolResource

const search = ref('')
const selectedClass = ref<string | null>(null)
const referenceDialog = ref(false)
const selectedReference = ref<{ resource: SchoolResource; id: string } | null>(
  null,
)

await schoolStore.fetchCollection(resource)

const items = computed(() => schoolStore.getCollection(resource))
const loading = computed(() => schoolStore.isLoading(resource))

const classOptions = computed(() => {
  const byClass = new Map<string, { title: string; value: string }>()
  for (const item of items.value) {
    const classId = String(item.classId ?? '').trim()
    const className = String(item.className ?? '').trim()
    if (!classId || !className) continue
    byClass.set(classId, { title: className, value: classId })
  }
  return Array.from(byClass.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  )
})

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()
  return items.value.filter((item) => {
    if (
      selectedClass.value &&
      String(item.classId ?? '').trim() !== selectedClass.value
    ) {
      return false
    }
    if (!query) return true
    return Object.values(item).some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(query),
    )
  })
})

const referenceItem = computed(() => {
  if (!selectedReference.value) {
    return null
  }

  return schoolStore.getDetail(
    selectedReference.value.resource,
    selectedReference.value.id,
  )
})

const referenceLoading = computed(() => {
  if (!selectedReference.value) {
    return false
  }

  return schoolStore.isLoading(
    selectedReference.value.resource,
    selectedReference.value.id,
  )
})

async function openReference(payload: { key: string; value: string }) {
  selectedReference.value = {
    resource: payload.key as SchoolResource,
    id: payload.value,
  }
  referenceDialog.value = true
  await schoolStore.fetchDetail(payload.key, payload.value)
}
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.learning.label', 'Learning')"
      module-icon="mdi-school-outline"
      :module-description="'School cards view with linked references'"
      :nav-items="learningNavItems"
      :show-action="false"
      activate-right-drawer
    >
      <template #right>
        <div class="d-flex flex-column ga-3">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :label="t('common.search')"
            clearable
            variant="outlined"
            hide-details
          />
          <AppSelect
            v-model="selectedClass"
            :items="classOptions"
            label="Class"
            clearable
          />
        </div>
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <v-alert
        v-if="schoolStore.error"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="schoolStore.error"
      />

      <LearningResourceCards
        :resource="resource"
        :items="filteredItems"
        :loading="loading"
        @open-reference="openReference"
      />
    </v-container>

    <v-dialog v-model="referenceDialog" max-width="720">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>{{ t('world.learning.common.referenceDetail') }}</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="referenceDialog = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <div v-if="referenceLoading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <pre v-else class="text-caption">{{
            JSON.stringify(referenceItem, null, 2)
          }}</pre>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
