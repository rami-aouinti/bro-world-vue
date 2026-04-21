<script setup lang="ts">
import type { SchoolResource } from '~/stores/worldLearningSchool'
import { useWorldLearningSchoolStore } from '~/stores/worldLearningSchool'

definePageMeta({ layout: 'learning', title: 'Learning Detail' })

type CourseAttachment = {
  url?: string
  originalName?: string
  mimeType?: string
  size?: number
  extension?: string
  uploadedAt?: string
}

const { t } = useI18n()
const { learningNavItems } = useWorldLearningNavItems()
const route = useRoute()
const schoolStore = useWorldLearningSchoolStore()

const allowedResources: SchoolResource[] = ['exams', 'classes', 'teachers', 'students', 'grades', 'courses']

const resource = computed(() => String(route.params.resource || '').toLowerCase() as SchoolResource)
const id = computed(() => String(route.params.id || ''))

if (!allowedResources.includes(resource.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Resource not found' })
}

await schoolStore.fetchDetail(resource.value, id.value)

const item = computed(() => schoolStore.getDetail(resource.value, id.value))
const loading = computed(() => schoolStore.isLoading(resource.value, id.value))

const isCourse = computed(() => resource.value === 'courses')

const courseTitle = computed(() => String(item.value?.name ?? 'Course'))
const courseClassName = computed(() => String(item.value?.className ?? ''))
const courseContent = computed(() => String(item.value?.contentHtml ?? ''))
const courseTeacher = computed(() => {
  const raw = item.value?.teacher
  if (!raw || typeof raw !== 'object') {
    return null
  }
  const teacher = raw as Record<string, unknown>
  return {
    id: String(teacher.id ?? ''),
    name: String(teacher.name ?? `${String(teacher.firstName ?? '')} ${String(teacher.lastName ?? '')}`.trim()),
    photo: String(teacher.photo ?? ''),
    email: String(teacher.email ?? ''),
  }
})

const courseAttachments = computed(() => {
  const attachments = item.value?.attachments
  if (!Array.isArray(attachments)) {
    return [] as CourseAttachment[]
  }

  return attachments as CourseAttachment[]
})

function formatBytes(value?: number) {
  if (!value || Number.isNaN(value)) {
    return 'Unknown size'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let size = value
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index += 1
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[index]}`
}

function formatDateTimeValue(value?: string) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function fileHref(url?: string) {
  if (!url) {
    return '#'
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return url
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.learning.label', 'Learning')"
      module-icon="mdi-school-outline"
      :module-description="'School resource detail page'"
      :nav-items="learningNavItems"
      :show-action="false"
      :activate-right-drawer="isCourse"
    >
      <template v-if="isCourse" #right>
        <div class="d-flex flex-column ga-3">

          <div v-if="loading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <template v-else>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ courseClassName }}</p>
            <div v-if="courseTeacher" class="d-flex align-center ga-3">
              <v-avatar size="42">
                <v-img :src="courseTeacher.photo" :alt="courseTeacher.name || 'Teacher'"/>
              </v-avatar>
              <div>
                <p class="text-body-2">{{ courseTeacher.name }}</p>
              </div>
            </div>
            <h3 class="text-subtitle-1 mb-0">Attachments</h3>
            <v-card
              v-for="(attachment, index) in courseAttachments"
              :key="`${attachment.url ?? 'attachment'}-${index}`"
              variant="text"
              rounded="lg"
              class="pa-3"
            >
              <div class="d-flex align-center justify-space-between ga-3 mb-2">
                <p class="text-body-2 font-weight-medium mb-0 text-truncate">{{ attachment.originalName ?? 'Attachment' }}</p>
                <v-chip size="x-small" color="primary" variant="tonal">{{ (attachment.extension ?? 'file').toUpperCase() }}</v-chip>
              </div>
              <p class="text-caption text-medium-emphasis mb-3">
                {{ formatBytes(attachment.size) }}
              </p>
              <v-btn
                :href="fileHref(attachment.url)"
                target="_blank"
                rel="noopener noreferrer"
                variant="tonal"
                size="small"
                prepend-icon="mdi-open-in-new"
                block
              >
                Open
              </v-btn>
            </v-card>

            <v-alert v-if="courseAttachments.length === 0" type="info" variant="tonal" :text="t('world.learning.common.noAttachments')" />
          </template>
        </div>
      </template>
    </WorldModuleDrawers>

    <v-container fluid>
      <v-card v-if="isCourse" rounded="xl" class="pa-6 postcard-gradient-card course-detail-card">
        <div class="d-flex flex-wrap align-start justify-space-between ga-4 mb-5">
          <div>
            <h2 class="text-h4 font-weight-bold mb-1">{{ courseTitle }}</h2>
          </div>

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

        <template v-else-if="item">
          <v-card variant="text" rounded="lg" class="pa-4 mb-5 course-content" :class="{ 'text-medium-emphasis': !courseContent }">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="courseContent" v-html="courseContent" />
            <p v-else class="mb-0">{{ t('world.learning.common.noHtmlContent') }}</p>
          </v-card>

        </template>
      </v-card>

      <v-card v-else rounded="xl" class="pa-5 postcard-gradient-card">
        <div class="d-flex align-center justify-space-between mb-3">
          <h1 class="text-h5 text-capitalize">{{ resource.slice(0, -1) }} detail</h1>
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

<style scoped>
.course-detail-card {
  backdrop-filter: blur(8px);
}

.course-content :deep(h1),
.course-content :deep(h2),
.course-content :deep(h3) {
  margin-bottom: 0.5rem;
}

.course-content :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.course-content :deep(ul) {
  padding-left: 1rem;
}
</style>
