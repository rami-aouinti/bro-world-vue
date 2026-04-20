<script setup lang="ts">
import type { SchoolResource } from '~/stores/worldLearningSchool'

definePageMeta({ layout: 'learning', title: 'Learning Detail' })

const { t } = useI18n()
const { learningNavItems } = useWorldLearningNavItems()
const route = useRoute()
const schoolStore = useWorldLearningSchoolStore()

const allowedResources: SchoolResource[] = ['exams', 'classes', 'teachers', 'students', 'grades']

const resource = computed(() => String(route.params.resource || '').toLowerCase() as SchoolResource)
const id = computed(() => String(route.params.id || ''))

if (!allowedResources.includes(resource.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Resource not found' })
}

await schoolStore.fetchDetail(resource.value, id.value)

const item = computed(() => schoolStore.getDetail(resource.value, id.value))
const loading = computed(() => schoolStore.isLoading(resource.value, id.value))
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.learning.label', 'Learning')"
      module-icon="mdi-school-outline"
      :module-description="'School resource detail page'"
      :nav-items="learningNavItems"
      :show-action="false"
    />

    <v-container fluid>
      <v-btn class="mb-4" variant="text" prepend-icon="mdi-arrow-left" @click="$router.back()">
        Retour
      </v-btn>

      <v-card rounded="xl" class="pa-5">
        <div class="d-flex align-center justify-space-between mb-3">
          <h1 class="text-h5 text-capitalize">{{ resource.slice(0, -1) }} — {{ id }}</h1>
        </div>

        <div v-if="loading" class="d-flex justify-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <v-alert
          v-else-if="schoolStore.error"
          type="error"
          variant="tonal"
          class="mb-4"
          :text="schoolStore.error"
        />

        <div v-else-if="item" class="d-flex flex-column ga-3">
          <v-card
            v-for="(value, key) in item"
            :key="key"
            variant="tonal"
            class="pa-3"
          >
            <div class="text-caption text-medium-emphasis">{{ key }}</div>
            <div class="text-body-1">{{ value }}</div>
          </v-card>
        </div>
      </v-card>
    </v-container>
  </div>
</template>
