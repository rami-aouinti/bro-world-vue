<script setup lang="ts">
import type { SchoolResource } from '~/stores/worldLearningSchool'
import { useWorldLearningSchoolStore } from '~/stores/worldLearningSchool'
import LearningResourceCards from '~/components/World/LearningResourceCards.vue'

definePageMeta({
  layout: 'learning',
  title: 'Learning Courses',
  description:
    'Browse Bro World Learning courses with levels, teachers, structured lessons, and training resources.',
  keywords:
    'Bro World Learning courses, online courses, lessons, teachers, education platform, training resources',
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  sitemap: { changefreq: 'weekly', priority: 0.6 },
})

const { t } = useI18n()
const { learningNavItems } = useWorldLearningNavItems()
const schoolStore = useWorldLearningSchoolStore()
const resource = 'courses' as SchoolResource

const search = ref('')
const selectedTeacher = ref<string | null>(null)
const selectedClass = ref<string | null>(null)
const referenceDialog = ref(false)
const selectedReference = ref<{ resource: SchoolResource; id: string } | null>(
  null,
)

await schoolStore.fetchCollection(resource)

const items = computed(() => schoolStore.getCollection(resource))
const loading = computed(() => schoolStore.isLoading(resource))

type TeacherOption = {
  title: string
  value: string
  subtitle?: string
  avatar?: string
}

const teacherOptions = computed(() => {
  const byId = new Map<string, TeacherOption>()
  for (const item of items.value) {
    const teacherRaw = item.teacher
    if (!teacherRaw || typeof teacherRaw !== 'object') {
      continue
    }

    const teacher = teacherRaw as Record<string, unknown>
    const teacherId = String(teacher.id ?? '')
    if (!teacherId) {
      continue
    }

    const fullName =
      `${String(teacher.firstName ?? '')} ${String(teacher.lastName ?? '')}`.trim()
    const teacherName = String(
      teacher.name ?? fullName ?? teacher.username ?? '',
    )
    if (!teacherName) {
      continue
    }

    byId.set(teacherId, {
      title: teacherName,
      value: teacherId,
      subtitle: String(teacher.username ?? ''),
      avatar: String(teacher.photo ?? teacher.avatar ?? ''),
    })
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  )
})

const classOptions = computed(() => {
  const byClass = new Map<string, { title: string; value: string }>()
  for (const item of items.value) {
    const className = String(item.className ?? '').trim()
    if (!className) {
      continue
    }
    byClass.set(className, { title: className, value: className })
  }

  return Array.from(byClass.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  )
})

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()
  return items.value.filter((item) => {
    if (selectedTeacher.value) {
      const teacherRaw = item.teacher
      const teacherId =
        teacherRaw && typeof teacherRaw === 'object'
          ? String((teacherRaw as Record<string, unknown>).id ?? '')
          : ''
      if (teacherId !== selectedTeacher.value) {
        return false
      }
    }

    if (selectedClass.value) {
      const className = String(item.className ?? '').trim()
      if (className !== selectedClass.value) {
        return false
      }
    }

    if (!query) {
      return true
    }

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
            v-model="selectedTeacher"
            :items="teacherOptions"
            label="Teacher"
            clearable
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :subtitle="item.raw.subtitle">
                <template #prepend>
                  <v-avatar size="24">
                    <v-img
                      :src="item.raw.avatar || '/img/avatar_default.svg'"
                      :alt="item.raw.title"
                    />
                  </v-avatar>
                </template>
              </v-list-item>
            </template>
            <template #selection="{ item }">
              <div class="d-flex align-center ga-2">
                <v-avatar size="20">
                  <v-img
                    :src="item.raw.avatar || '/img/avatar_default.svg'"
                    :alt="item.raw.title"
                  />
                </v-avatar>
                <span>{{ item.raw.title }}</span>
              </div>
            </template>
          </AppSelect>
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
