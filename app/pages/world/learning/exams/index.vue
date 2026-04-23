<script setup lang="ts">
import type { SchoolResource } from '~/stores/worldLearningSchool'
import { useWorldLearningSchoolStore } from '~/stores/worldLearningSchool'
import LearningResourceCards
  from "~/components/World/LearningResourceCards.vue";

definePageMeta({ layout: 'learning', title: 'Learning Exams' })

const { t } = useI18n()
const { learningNavItems } = useWorldLearningNavItems()
const schoolStore = useWorldLearningSchoolStore()
const resource = 'exams' as SchoolResource

const search = ref('')
const selectedClass = ref<string | null>(null)
const selectedTeacher = ref<string | null>(null)
const selectedCourse = ref<string | null>(null)
const selectedType = ref<string | null>(null)
const referenceDialog = ref(false)
const selectedReference = ref<{ resource: SchoolResource; id: string } | null>(null)

await schoolStore.fetchCollection(resource)

const items = computed(() => schoolStore.getCollection(resource))
const loading = computed(() => schoolStore.isLoading(resource))

type SelectOption = {
  title: string
  value: string
  subtitle?: string
  avatar?: string
}

function normalizeName(entry: Record<string, unknown>) {
  const fullName = `${String(entry.firstName ?? '')} ${String(entry.lastName ?? '')}`.trim()
  return String(entry.name ?? fullName ?? entry.username ?? '').trim()
}

const classOptions = computed(() => {
  const byClass = new Map<string, SelectOption>()
  for (const item of items.value) {
    const className = String(item.className ?? '').trim()
    if (!className) continue
    byClass.set(className, { title: className, value: className })
  }
  return Array.from(byClass.values()).sort((a, b) => a.title.localeCompare(b.title))
})

const teacherOptions = computed(() => {
  const byTeacher = new Map<string, SelectOption>()
  for (const item of items.value) {
    const teacherRaw = item.teacher
    if (!teacherRaw || typeof teacherRaw !== 'object') continue
    const teacher = teacherRaw as Record<string, unknown>
    const teacherId = String(teacher.id ?? '').trim()
    const teacherName = normalizeName(teacher)
    if (!teacherId || !teacherName) continue
    byTeacher.set(teacherId, {
      title: teacherName,
      value: teacherId,
      subtitle: String(teacher.username ?? ''),
      avatar: String(teacher.photo ?? teacher.avatar ?? ''),
    })
  }
  return Array.from(byTeacher.values()).sort((a, b) => a.title.localeCompare(b.title))
})

const courseOptions = computed(() => {
  const byCourse = new Map<string, SelectOption>()
  for (const item of items.value) {
    const courseId = String(item.courseId ?? '').trim()
    const courseName = String(item.courseName ?? '').trim()
    if (!courseId || !courseName) continue
    byCourse.set(courseId, { title: courseName, value: courseId })
  }
  return Array.from(byCourse.values()).sort((a, b) => a.title.localeCompare(b.title))
})

const typeOptions = computed(() => {
  const byType = new Map<string, SelectOption>()
  for (const item of items.value) {
    const type = String(item.type ?? '').trim()
    if (!type) continue
    byType.set(type, { title: type, value: type })
  }
  return Array.from(byType.values()).sort((a, b) => a.title.localeCompare(b.title))
})

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()
  return items.value.filter((item) => {
    if (selectedClass.value && String(item.className ?? '').trim() !== selectedClass.value) {
      return false
    }

    if (selectedTeacher.value) {
      const teacherRaw = item.teacher
      const teacherId = teacherRaw && typeof teacherRaw === 'object'
        ? String((teacherRaw as Record<string, unknown>).id ?? '').trim()
        : ''
      if (teacherId !== selectedTeacher.value) {
        return false
      }
    }

    if (selectedCourse.value && String(item.courseId ?? '').trim() !== selectedCourse.value) {
      return false
    }

    if (selectedType.value && String(item.type ?? '').trim() !== selectedType.value) {
      return false
    }

    if (!query) return true
    return Object.values(item).some(value => String(value ?? '').toLowerCase().includes(query))
  })
})

const referenceItem = computed(() => {
  if (!selectedReference.value) {
    return null
  }

  return schoolStore.getDetail(selectedReference.value.resource, selectedReference.value.id)
})

const referenceLoading = computed(() => {
  if (!selectedReference.value) {
    return false
  }

  return schoolStore.isLoading(selectedReference.value.resource, selectedReference.value.id)
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
          <AppSelect v-model="selectedClass" :items="classOptions" label="Class" clearable />
          <AppSelect v-model="selectedTeacher" :items="teacherOptions" label="Teacher" clearable>
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :subtitle="item?.raw?.subtitle">
                <template #prepend>
                  <v-avatar size="24">
                    <v-img :src="item?.raw?.avatar || '/img/avatar_default.svg'" :alt="item?.raw?.title" />
                  </v-avatar>
                </template>
              </v-list-item>
            </template>
            <template #selection="{ item }">
              <div class="d-flex align-center ga-2">
                <v-avatar size="20">
                  <v-img :src="item?.raw?.avatar || '/img/avatar_default.svg'" :alt="item?.raw?.title" />
                </v-avatar>
                <span>{{ item?.raw?.title }}</span>
              </div>
            </template>
          </AppSelect>
          <AppSelect v-model="selectedCourse" :items="courseOptions" label="Course" clearable />
          <AppSelect v-model="selectedType" :items="typeOptions" label="Type" clearable />
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
          <v-btn icon="mdi-close" variant="text" @click="referenceDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <div v-if="referenceLoading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <pre v-else class="text-caption">{{ JSON.stringify(referenceItem, null, 2) }}</pre>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
