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

const titleByResource: Record<SchoolResource, string> = {
  exams: 'Exams',
  classes: 'Classes',
  teachers: 'Teachers',
  students: 'Students',
  grades: 'Grades',
}

const isIdField = (key: string) => /id$/i.test(key)

const relatedResourceByField = (field: string): SchoolResource | null => {
  const normalized = field.replace(/Id$/i, '').toLowerCase()
  if (normalized === 'class') return 'classes'
  if (normalized === 'teacher') return 'teachers'
  if (normalized === 'student') return 'students'
  if (normalized === 'exam') return 'exams'
  if (normalized === 'grade') return 'grades'
  return null
}

const relatedLabelByResource: Record<SchoolResource, string> = {
  exams: 'Exam',
  classes: 'Class',
  teachers: 'Teacher',
  students: 'Student',
  grades: 'Grade',
}

function onValueClick(item: Record<string, unknown>) {
  const id = item.id
  if (!id) {
    return
  }

  router.push(`/world/learning/${props.resource}/${id}`)
}

function onReferenceClick(field: string, value: unknown) {
  const resolvedResource = relatedResourceByField(field)
  if (!resolvedResource || value === null || value === undefined || String(value).trim() === '') {
    return
  }

  emit('openReference', { key: resolvedResource, value: String(value) })
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
          <div class="d-flex flex-column ga-2">
            <div v-for="(value, key) in item" :key="`${String(item.id ?? index)}-${key}`" class="d-flex align-center justify-space-between ga-3">
              <span class="text-caption text-medium-emphasis">{{ key }}</span>

              <v-chip
                v-if="isIdField(key) && key !== 'id'"
                size="small"
                color="secondary"
                variant="outlined"
                @click="onReferenceClick(key, value)"
              >
                {{ relatedLabelByResource[relatedResourceByField(key) ?? resource] }}: {{ value }}
              </v-chip>

              <v-btn
                v-else
                variant="text"
                density="comfortable"
                class="text-none px-1"
                @click="onValueClick(item)"
              >
                {{ value }}
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
