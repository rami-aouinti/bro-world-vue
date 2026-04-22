<script setup lang="ts">
import type { SchoolResource } from '~/stores/worldLearningSchool'
import WorldCard from '~/components/World/WorldCard.vue'

const props = defineProps<{
  resource: SchoolResource
  items: Record<string, unknown>[]
  loading?: boolean
}>()

const emit = defineEmits<{
  openReference: [payload: { key: string; value: string }]
}>()

const router = useRouter()

type FieldConfig = {
  key: string
  label: string
  type?: 'text' | 'reference' | 'user-avatar'
  referenceResource?: SchoolResource
}

const fieldConfigByResource: Record<SchoolResource, FieldConfig[]> = {
  classes: [
    { key: 'name', label: 'Name' },
  ],
  courses: [
    { key: 'name', label: 'Name' },
    { key: 'className', label: 'Class' },
    { key: 'teacher', label: 'Teacher', type: 'user-avatar' },
  ],
  exams: [
    { key: 'title', label: 'Title' },
    { key: 'courseName', label: 'Course' },
    { key: 'courseId', label: 'Course', type: 'reference', referenceResource: 'courses' },
    { key: 'className', label: 'Class' },
    { key: 'teacher', label: 'Teacher', type: 'user-avatar' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'term', label: 'Term' },
  ],
  grades: [
    { key: 'score', label: 'Score' },
    { key: 'student', label: 'Student' },
    { key: 'studentId', label: 'Student', type: 'reference', referenceResource: 'students' },
    { key: 'examTitle', label: 'Exam' },
    { key: 'examId', label: 'Exam', type: 'reference', referenceResource: 'exams' },
    { key: 'courseName', label: 'Course' },
    { key: 'courseId', label: 'Course', type: 'reference', referenceResource: 'courses' },
  ],
  students: [
    { key: 'user', label: 'Student', type: 'user-avatar' },
    { key: 'className', label: 'Class' },
    { key: 'classId', label: 'Class', type: 'reference', referenceResource: 'classes' },
  ],
  teachers: [
    { key: 'user', label: 'Profile', type: 'user-avatar' },
  ],
}

const fields = computed(() => fieldConfigByResource[props.resource] ?? [])

function onValueClick(item: Record<string, unknown>) {
  const id = item.id
  if (!id) return
  router.push(`/world/learning/${props.resource}/${id}`)
}

function onReferenceClick(resource: SchoolResource, value: unknown) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return
  }

  emit('openReference', { key: resource, value: String(value) })
}

function asUser(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null
  }

  const user = value as Record<string, unknown>
  return {
    id: String(user.id ?? ''),
    username: String(user.username ?? ''),
    photo: String(user.photo ?? user.avatar ?? ''),
    name: String(user.name ?? `${String(user.firstName ?? '')} ${String(user.lastName ?? '')}`.trim() ?? 'User'),
  }
}

function profilePathFor(user: ReturnType<typeof asUser>) {
  if (!user) {
    return null
  }

  const identifier = user.username || user.id
  if (!identifier) {
    return null
  }

  return `/user/${identifier}/profile`
}

function openProfile(user: ReturnType<typeof asUser>) {
  const path = profilePathFor(user)
  if (!path) {
    return
  }

  router.push(path)
}

function formatDefaultValue(value: unknown) {
  if (value && typeof value === 'object') {
    const entity = value as Record<string, unknown>
    if (entity.name) {
      return String(entity.name)
    }

    return JSON.stringify(value)
  }

  return String(value ?? '—')
}
</script>

<template>
  <div>
    <v-row>
      <v-col
        v-for="(item, index) in items"
        :key="String(item.id ?? index)"
        cols="12"
        md="6"
        lg="4"
      >
        <WorldCard rounded="xl" extra-class="h-100 pa-4">
          <div class="text-caption text-medium-emphasis mb-2 text-capitalize">{{ resource.slice(0, -1) }}</div>
          <div class="d-flex flex-column ga-3">
            <div v-for="field in fields" :key="`${String(item.id ?? index)}-${field.key}`" class="d-flex align-center justify-space-between ga-3">
              <span class="text-caption text-medium-emphasis">{{ field.label }}</span>

              <v-btn
                v-if="field.type === 'reference' && field.referenceResource"
                size="x-small"
                color="secondary"
                variant="outlined"
                class="text-none"
                @click="onReferenceClick(field.referenceResource, item[field.key])"
              >
                Open
              </v-btn>

              <v-btn
                v-else-if="field.type === 'user-avatar' && asUser(item[field.key])"
                icon
                variant="text"
                size="x-small"
                @click="openProfile(asUser(item[field.key]))"
              >
                <v-avatar size="28">
                  <v-img :src="asUser(item[field.key])?.photo" :alt="asUser(item[field.key])?.name || 'User'" />
                </v-avatar>
              </v-btn>

              <v-btn
                v-else
                variant="text"
                density="comfortable"
                class="text-none px-1"
                @click="onValueClick(item)"
              >
                {{ formatDefaultValue(item[field.key]) }}
              </v-btn>
            </div>
          </div>
        </WorldCard>
      </v-col>

      <v-col v-if="!loading && items.length === 0" cols="12">
        <v-alert type="info" variant="tonal" text="No data found." />
      </v-col>
    </v-row>
  </div>
</template>
