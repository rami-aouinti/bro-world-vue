<script setup lang="ts">
import type { SchoolResource } from '~/stores/worldLearningSchool'

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
  type?: 'text' | 'reference' | 'teacher-card'
  referenceResource?: SchoolResource
}

const fieldConfigByResource: Record<SchoolResource, FieldConfig[]> = {
  classes: [
    { key: 'name', label: 'Name' },
  ],
  courses: [
    { key: 'name', label: 'Name' },
    { key: 'className', label: 'Class' },
    { key: 'teacher', label: 'Teacher', type: 'teacher-card' },
    { key: 'teacherId', label: 'Teacher', type: 'reference', referenceResource: 'teachers' },
  ],
  exams: [
    { key: 'title', label: 'Title' },
    { key: 'courseName', label: 'Course' },
    { key: 'courseId', label: 'Course', type: 'reference', referenceResource: 'courses' },
    { key: 'className', label: 'Class' },
    { key: 'teacher', label: 'Teacher', type: 'teacher-card' },
    { key: 'teacherId', label: 'Teacher', type: 'reference', referenceResource: 'teachers' },
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
    { key: 'name', label: 'Name' },
    { key: 'className', label: 'Class' },
    { key: 'classId', label: 'Class', type: 'reference', referenceResource: 'classes' },
  ],
  teachers: [
    { key: 'name', label: 'Name' },
    { key: 'user', label: 'Profile' },
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

function asTeacher(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null
  }

  const teacher = value as Record<string, unknown>
  return {
    name: String(teacher.name ?? 'Unknown'),
    photo: String(teacher.photo ?? ''),
  }
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
        <v-card rounded="xl" class="h-100 pa-4 postcard-gradient-card">
          <div class="text-caption text-medium-emphasis mb-2">{{ resource.slice(0, -1) }} #{{ item.id ?? index + 1 }}</div>
          <div class="d-flex flex-column ga-3">
            <div v-for="field in fields" :key="`${String(item.id ?? index)}-${field.key}`" class="d-flex align-center justify-space-between ga-3">
              <span class="text-caption text-medium-emphasis">{{ field.label }}</span>

              <v-chip
                v-if="field.type === 'reference' && field.referenceResource"
                size="small"
                color="secondary"
                variant="outlined"
                @click="onReferenceClick(field.referenceResource, item[field.key])"
              >
                {{ item[field.key] }}
              </v-chip>

              <div
                v-else-if="field.type === 'teacher-card' && asTeacher(item[field.key])"
                class="d-flex flex-column align-center"
              >
                <v-avatar size="36" class="mb-1">
                  <img :src="asTeacher(item[field.key])?.photo" alt="Teacher" />
                </v-avatar>
                <span class="text-caption">{{ asTeacher(item[field.key])?.name }}</span>
              </div>

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
        </v-card>
      </v-col>

      <v-col v-if="!loading && items.length === 0" cols="12">
        <v-alert type="info" variant="tonal" text="Aucune donnée trouvée." />
      </v-col>
    </v-row>
  </div>
</template>
