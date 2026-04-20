<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Learning Admin Resource' })

type RowItem = Record<string, unknown> & { id?: string }
type SchoolResource = 'classes' | 'teachers' | 'students' | 'exams' | 'grades'

const route = useRoute()
const router = useRouter()
const resource = computed(() => String(route.params.resource ?? ''))

const allowedResources = new Set(['teachers', 'students', 'exams', 'grades'])
if (!allowedResources.has(resource.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Resource not found' })
}

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const canAccess = computed(() => {
  const roles = sessionUser.value?.roles ?? []
  return roles.includes('ROLE_ROOT') || roles.includes('ROLE_ADMIN')
})
if (!canAccess.value) {
  await router.replace('/world/learning')
}

const pending = ref(false)
const error = ref<string | null>(null)
const rows = ref<RowItem[]>([])

const isEntityDialogOpen = ref(false)
const entityModalLoading = ref(false)
const selectedEntity = ref<Record<string, unknown> | null>(null)
const selectedEntityTitle = ref('')
const selectedEntityError = ref<string | null>(null)

const isCreateDialogOpen = ref(false)
const isEditDialogOpen = ref(false)
const deleteDialogItem = ref<RowItem | null>(null)
const createForm = ref<Record<string, string | number | null>>({})
const editForm = ref<Record<string, string | number | null>>({})
const editingId = ref<string>('')

const formFieldDefaults: Record<string, string[]> = {
  teachers: ['name'],
  students: ['name', 'classId'],
  exams: ['title', 'classId', 'teacherId', 'type', 'status', 'term'],
  grades: ['score', 'studentId', 'examId'],
}

const learningNavItems = [
  {
    title: 'Overview Learning',
    to: '/world/learning',
    icon: 'mdi-view-dashboard-outline',
  },
  {
    title: 'Courses',
    to: '/world/learning/courses',
    icon: 'mdi-book-open-page-variant-outline',
  },
  { title: 'Classes', to: '/world/learning/classes', icon: 'mdi-google-classroom' },
  { title: 'Teachers', to: '/world/learning/teachers', icon: 'mdi-account-tie' },
  { title: 'Students', to: '/world/learning/students', icon: 'mdi-account-school' },
  { title: 'Exams', to: '/world/learning/exams', icon: 'mdi-file-document-outline' },
  { title: 'Grades', to: '/world/learning/grades', icon: 'mdi-check-decagram-outline' },
  { title: 'Levels', to: '/world/learning/levels', icon: 'mdi-stairs' },
  { title: 'Paths', to: '/world/learning/paths', icon: 'mdi-map-marker-path' },
  {
    title: 'Admin',
    to: '/world/learning/admin',
    icon: 'mdi-shield-crown-outline',
  },
]

const title = computed(
  () => resource.value.charAt(0).toUpperCase() + resource.value.slice(1),
)

const fieldKeys = computed(() => {
  const keys = rows.value.length > 0
    ? Array.from(
      rows.value.reduce((set, row) => {
        Object.keys(row).forEach((key) => {
          if (key !== 'id') {
            set.add(key)
          }
        })
        return set
      }, new Set<string>()),
    )
    : formFieldDefaults[resource.value] ?? []

  return keys
})

const headers = computed(() => [
  ...fieldKeys.value.map((key) => ({ title: key, key })),
  { title: 'Actions', key: 'actions', sortable: false },
])

function serializePayload(input: Record<string, string | number | null>) {
  return Object.fromEntries(
    Object.entries(input)
      .filter(([, value]) => value !== null && value !== '')
      .map(([key, value]) => {
        const maybeNumeric = typeof value === 'string' ? Number(value) : value
        if (typeof maybeNumeric === 'number' && Number.isFinite(maybeNumeric) && key.toLowerCase().includes('score')) {
          return [key, maybeNumeric]
        }
        return [key, value]
      }),
  )
}

function buildFormFromItem(item?: RowItem) {
  return Object.fromEntries(
    fieldKeys.value.map((key) => [key, item?.[key] == null ? '' : String(item[key])]),
  )
}

function isIdField(key: string) {
  return /id$/i.test(key)
}

function resolveEntityResource(fieldKey: string): SchoolResource | null {
  const normalized = fieldKey.replace(/id$/i, '').toLowerCase()
  if (!normalized) return null

  if (normalized === 'class') return 'classes'
  if (normalized === 'teacher') return 'teachers'
  if (normalized === 'student') return 'students'
  if (normalized === 'exam') return 'exams'
  if (normalized === 'grade') return 'grades'
  return null
}

function entityLabelFromField(fieldKey: string) {
  const normalized = fieldKey.replace(/id$/i, '')
  if (!normalized) return 'Entity'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function isBooleanValue(value: unknown) {
  return typeof value === 'boolean'
}

function formatEntityValue(value: unknown) {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2)
  }
  return String(value ?? '—')
}

async function openEntityModal(fieldKey: string, entityId: string) {
  const targetResource = resolveEntityResource(fieldKey)
  if (!targetResource || !entityId) return

  selectedEntityTitle.value = `${entityLabelFromField(fieldKey)} #${entityId}`
  selectedEntity.value = null
  selectedEntityError.value = null
  entityModalLoading.value = true
  isEntityDialogOpen.value = true

  try {
    const response = await $fetch<{ item: Record<string, unknown> }>(
      `/api/world/learning/admin/school/${targetResource}/${entityId}`,
    )
    selectedEntity.value = response.item
  } catch (err) {
    selectedEntityError.value = err instanceof Error ? err.message : 'Unable to load entity'
  } finally {
    entityModalLoading.value = false
  }
}

async function load() {
  pending.value = true
  error.value = null
  try {
    const response = await $fetch<{ items: RowItem[] }>(
      `/api/world/learning/admin/school/${resource.value}`,
    )
    rows.value = response.items
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load data'
  } finally {
    pending.value = false
  }
}

await load()

function openCreate() {
  createForm.value = buildFormFromItem()
  isCreateDialogOpen.value = true
}

function openEdit(item: RowItem) {
  editingId.value = String(item.id ?? '')
  editForm.value = buildFormFromItem(item)
  isEditDialogOpen.value = true
}

async function submitCreate() {
  pending.value = true
  error.value = null
  try {
    await $fetch(`/api/world/learning/admin/school/${resource.value}`, {
      method: 'POST',
      body: serializePayload(createForm.value),
    })
    isCreateDialogOpen.value = false
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to create item'
  } finally {
    pending.value = false
  }
}

async function submitEdit() {
  if (!editingId.value) return

  pending.value = true
  error.value = null
  try {
    await $fetch(`/api/world/learning/admin/school/${resource.value}/${editingId.value}`, {
      method: 'PATCH',
      body: serializePayload(editForm.value),
    })
    isEditDialogOpen.value = false
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to update item'
  } finally {
    pending.value = false
  }
}

async function confirmDelete() {
  const id = deleteDialogItem.value?.id
  if (!id) return

  pending.value = true
  error.value = null
  try {
    await $fetch(`/api/world/learning/admin/school/${resource.value}/${String(id)}`, {
      method: 'DELETE',
    })
    deleteDialogItem.value = null
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to delete item'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Learning"
      module-icon="mdi-school-outline"
      module-description="Administration and school resources management."
      :nav-items="learningNavItems"
      deactivate-right-drawer
      :show-action="false"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-5">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h1 class="text-h5">{{ title }}</h1>
            <p class="text-medium-emphasis mb-0">Manage {{ resource }} with create, edit and delete actions.</p>
          </div>
          <div class="d-flex ga-2">
            <v-btn variant="tonal" to="/world/learning/admin" prepend-icon="mdi-arrow-left">Back to admin</v-btn>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Create</v-btn>
            <v-btn variant="text" prepend-icon="mdi-refresh" :loading="pending" @click="load">Refresh</v-btn>
          </div>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

        <v-data-table :headers="headers" :items="rows" :loading="pending" density="comfortable">
          <template
            v-for="key in fieldKeys"
            :key="`cell-${key}`"
            #[`item.${key}`]="{ item }"
          >
            <v-switch
              v-if="isBooleanValue(item[key])"
              :model-value="Boolean(item[key])"
              color="primary"
              density="compact"
              hide-details
              inset
              disabled
            />
            <v-chip
              v-else-if="isIdField(key) && item[key]"
              size="small"
              color="primary"
              variant="tonal"
              class="cursor-pointer"
              @click="openEntityModal(key, String(item[key]))"
            >
              {{ entityLabelFromField(key) }}
            </v-chip>
            <span v-else>{{ item[key] }}</span>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-2">
              <v-btn size="small" variant="tonal" prepend-icon="mdi-pencil" @click="openEdit(item)">
                Edit
              </v-btn>
              <v-btn
                size="small"
                color="error"
                variant="tonal"
                prepend-icon="mdi-delete"
                @click="deleteDialogItem = item"
              >
                Delete
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <v-dialog v-model="isCreateDialogOpen" max-width="560">
        <v-card class="pa-4">
          <h2 class="text-h6 mb-3">Create {{ resource.slice(0, -1) }}</h2>
          <v-text-field
            v-for="key in fieldKeys"
            :key="`create-${key}`"
            v-model="createForm[key]"
            :label="key"
            variant="outlined"
            class="mb-2"
          />
          <div class="d-flex justify-end ga-2 mt-3">
            <v-btn variant="text" @click="isCreateDialogOpen = false">Cancel</v-btn>
            <v-btn color="primary" :loading="pending" @click="submitCreate">Save</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isEditDialogOpen" max-width="560">
        <v-card class="pa-4">
          <h2 class="text-h6 mb-3">Edit {{ resource.slice(0, -1) }}</h2>
          <v-text-field
            v-for="key in fieldKeys"
            :key="`edit-${key}`"
            v-model="editForm[key]"
            :label="key"
            variant="outlined"
            class="mb-2"
          />
          <div class="d-flex justify-end ga-2 mt-3">
            <v-btn variant="text" @click="isEditDialogOpen = false">Cancel</v-btn>
            <v-btn color="primary" :loading="pending" @click="submitEdit">Update</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <v-dialog :model-value="!!deleteDialogItem" max-width="460" @update:model-value="(value) => { if (!value) deleteDialogItem = null }">
        <v-card class="pa-4">
          <h2 class="text-h6 mb-2">Delete {{ resource.slice(0, -1) }}</h2>
          <p>Are you sure you want to delete this item?</p>
          <div class="d-flex justify-end ga-2 mt-3">
            <v-btn variant="text" @click="deleteDialogItem = null">Cancel</v-btn>
            <v-btn color="error" :loading="pending" @click="confirmDelete">Delete</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <v-dialog
        v-model="isEntityDialogOpen"
        max-width="640"
        @update:model-value="(value) => {
          if (!value) {
            selectedEntity = null
            selectedEntityError = null
          }
        }"
      >
        <v-card class="pa-4">
          <h2 class="text-h6 mb-3">{{ selectedEntityTitle }}</h2>
          <v-progress-linear
            v-if="entityModalLoading"
            indeterminate
            color="primary"
            class="mb-3"
          />
          <v-alert
            v-else-if="selectedEntityError"
            type="error"
            variant="tonal"
            :text="selectedEntityError"
          />
          <div v-else-if="selectedEntity" class="d-flex flex-column ga-2">
            <v-card
              v-for="(value, key) in selectedEntity"
              :key="key"
              variant="outlined"
              class="pa-3"
            >
              <div class="text-caption text-medium-emphasis">{{ key }}</div>
              <div class="text-body-2">
                {{ formatEntityValue(value) }}
              </div>
            </v-card>
          </div>
          <div class="d-flex justify-end mt-4">
            <v-btn variant="text" @click="isEntityDialogOpen = false">Close</v-btn>
          </div>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>
