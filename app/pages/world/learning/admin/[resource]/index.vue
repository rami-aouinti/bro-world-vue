<script setup lang="ts">
import axios, { type AxiosError } from 'axios'
import type { SessionUser } from '~/types/session'
import { privateApi } from '~/utils/http/privateApi'

definePageMeta({ layout: 'learning', title: 'Learning Admin Resource' })

type RowItem = Record<string, unknown> & { id?: string }
type SchoolResource =
  | 'classes'
  | 'courses'
  | 'teachers'
  | 'students'
  | 'exams'
  | 'grades'
type SelectOption = { title: string; value: string }

type ResourceConfig = {
  createFields: string[]
  editFields: string[]
  tableFields: string[]
}

const route = useRoute()
const router = useRouter()
const resource = computed(() => String(route.params.resource ?? ''))

const resourceConfig: Record<SchoolResource, ResourceConfig> = {
  classes: {
    createFields: ['name', 'schoolId'],
    editFields: ['name', 'schoolId'],
    tableFields: ['id', 'name', 'schoolId'],
  },
  courses: {
    createFields: ['name', 'classId', 'teacherId', 'contentHtml'],
    editFields: ['name', 'classId', 'teacherId', 'contentHtml'],
    tableFields: ['id', 'name', 'className', 'teacher', 'classId', 'teacherId'],
  },
  teachers: {
    createFields: ['userId'],
    editFields: ['userId'],
    tableFields: ['id', 'name', 'userId', 'user'],
  },
  students: {
    createFields: ['userId', 'classId'],
    editFields: ['userId', 'classId'],
    tableFields: ['id', 'name', 'className', 'userId', 'classId'],
  },
  exams: {
    createFields: [
      'title',
      'classId',
      'courseId',
      'teacherId',
      'type',
      'status',
      'term',
    ],
    editFields: [
      'title',
      'classId',
      'courseId',
      'teacherId',
      'type',
      'status',
      'term',
    ],
    tableFields: [
      'id',
      'title',
      'courseName',
      'className',
      'teacher',
      'courseId',
      'classId',
      'teacherId',
      'type',
      'status',
      'term',
    ],
  },
  grades: {
    createFields: ['score', 'studentId', 'examId'],
    editFields: ['score', 'studentId', 'examId'],
    tableFields: [
      'id',
      'score',
      'student',
      'examTitle',
      'courseName',
      'studentId',
      'examId',
    ],
  },
}

const enumOptions: Record<string, SelectOption[]> = {
  type: [
    { title: 'Oral', value: 'ORAL' },
    { title: 'Written', value: 'WRITTEN' },
    { title: 'Practical', value: 'PRACTICAL' },
  ],
  status: [
    { title: 'Draft', value: 'DRAFT' },
    { title: 'Published', value: 'PUBLISHED' },
    { title: 'Archived', value: 'ARCHIVED' },
  ],
  term: [
    { title: 'Term 1', value: 'TERM_1' },
    { title: 'Term 2', value: 'TERM_2' },
    { title: 'Term 3', value: 'TERM_3' },
  ],
}

const allResources: SchoolResource[] = [
  'classes',
  'courses',
  'teachers',
  'students',
  'exams',
  'grades',
]
if (!allResources.includes(resource.value as SchoolResource)) {
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
const isSavingCreate = ref(false)
const isSavingEdit = ref(false)
const isDeleting = ref(false)
const error = ref<string | null>(null)
const rows = ref<RowItem[]>([])
const retryAction = ref<null | (() => Promise<void>)>(null)

const isCreateDialogOpen = ref(false)
const isEditDialogOpen = ref(false)
const deleteDialogItem = ref<RowItem | null>(null)
const createForm = ref<Record<string, string | number | null>>({})
const editForm = ref<Record<string, string | number | null>>({})
const editingId = ref<string>('')

const usersOptions = ref<SelectOption[]>([])
const linkedOptions = ref<Partial<Record<SchoolResource, SelectOption[]>>>({})

const { learningNavItems } = useWorldLearningNavItems()

const title = computed(
  () => resource.value.charAt(0).toUpperCase() + resource.value.slice(1),
)
const config = computed(() => resourceConfig[resource.value as SchoolResource])
const headers = computed(() => [
  ...config.value.tableFields.map((key) => ({ title: key, key })),
  { title: 'Actions', key: 'actions', sortable: false },
])

function serializePayload(input: Record<string, string | number | null>) {
  return Object.fromEntries(
    Object.entries(input)
      .filter(([, value]) => value !== null && value !== '')
      .map(([key, value]) => {
        const maybeNumeric = typeof value === 'string' ? Number(value) : value
        if (
          typeof maybeNumeric === 'number' &&
          Number.isFinite(maybeNumeric) &&
          key === 'score'
        ) {
          return [key, maybeNumeric]
        }
        return [key, value]
      }),
  )
}

function buildFormFromFields(fields: string[], item?: RowItem) {
  return Object.fromEntries(
    fields.map((key) => [key, item?.[key] == null ? '' : String(item[key])]),
  )
}

function getItemValue(item: RowItem, key: string) {
  const value = item[key]
  if (value && typeof value === 'object') {
    const entity = value as Record<string, unknown>
    return String(entity.name ?? JSON.stringify(value))
  }
  return String(value ?? '—')
}

function isFieldSelect(key: string) {
  return key in enumOptions || key.endsWith('Id')
}

function toEntityOptions(items: Record<string, unknown>[], labelKey = 'name') {
  return items
    .map((item) => ({
      title: String(item[labelKey] ?? item.title ?? item.id ?? 'Unknown'),
      value: String(item.id ?? ''),
    }))
    .filter((entry) => entry.value)
}

function optionsForField(key: string): SelectOption[] {
  if (enumOptions[key]) {
    return enumOptions[key]
  }

  if (key === 'userId') {
    return usersOptions.value
  }

  if (key === 'classId') return linkedOptions.value.classes ?? []
  if (key === 'courseId') return linkedOptions.value.courses ?? []
  if (key === 'teacherId') return linkedOptions.value.teachers ?? []
  if (key === 'studentId') return linkedOptions.value.students ?? []
  if (key === 'examId') return linkedOptions.value.exams ?? []

  return []
}

async function loadSelectOptions() {
  const resourcesToFetch = new Set<SchoolResource>()
  for (const field of [
    ...config.value.createFields,
    ...config.value.editFields,
  ]) {
    if (field === 'classId') resourcesToFetch.add('classes')
    if (field === 'courseId') resourcesToFetch.add('courses')
    if (field === 'teacherId') resourcesToFetch.add('teachers')
    if (field === 'studentId') resourcesToFetch.add('students')
    if (field === 'examId') resourcesToFetch.add('exams')
  }

  const promises = [...resourcesToFetch].map(async (entityResource) => {
    const response = await privateApi.request<{ items: RowItem[] }>(
      `/api/world/learning/admin/school/${entityResource}`,
    )
    const labelKey = entityResource === 'exams' ? 'title' : 'name'
    linkedOptions.value[entityResource] = toEntityOptions(
      response.items,
      labelKey,
    )
  })

  if (
    [...config.value.createFields, ...config.value.editFields].includes(
      'userId',
    )
  ) {
    promises.push(
      $fetch<{
        items?: Record<string, unknown>[]
        data?: Record<string, unknown>[]
      }>('/api/public/users').then((response) => {
        const rows = response.items ?? response.data ?? []
        usersOptions.value = rows
          .map((entry) => ({
            title: String(
              entry.name ?? entry.email ?? entry.username ?? entry.id ?? 'User',
            ),
            value: String(entry.id ?? ''),
          }))
          .filter((entry) => entry.value)
      }),
    )
  }

  await Promise.all(promises)
}

async function load() {
  pending.value = true
  error.value = null
  retryAction.value = null
  try {
    const response = await privateApi.request<{ items: RowItem[] }>(
      `/api/world/learning/admin/school/${resource.value}`,
    )
    rows.value = response.items
    await loadSelectOptions()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load data'
  } finally {
    pending.value = false
  }
}

await load()

function openCreate() {
  createForm.value = buildFormFromFields(config.value.createFields)
  isCreateDialogOpen.value = true
}

function openEdit(item: RowItem) {
  editingId.value = String(item.id ?? '')
  editForm.value = buildFormFromFields(config.value.editFields, item)
  isEditDialogOpen.value = true
}

function extractStatus(err: unknown): number | null {
  if (axios.isAxiosError(err)) {
    return err.response?.status ?? null
  }

  const maybeFetchError = err as { statusCode?: unknown; status?: unknown }
  const statusCode =
    typeof maybeFetchError.statusCode === 'number'
      ? maybeFetchError.statusCode
      : typeof maybeFetchError.status === 'number'
        ? maybeFetchError.status
        : null
  return statusCode
}

async function handleMutationError(
  err: unknown,
  retry: () => Promise<void>,
  options?: { reloadOnNotFound?: boolean },
) {
  const status = extractStatus(err)

  if (status === 401 || status === 403) {
    error.value = 'Session expirée ou accès refusé. Veuillez vous reconnecter.'
    retryAction.value = null
    return
  }

  if (status === 404 && options?.reloadOnNotFound) {
    error.value = 'Ressource introuvable. La liste a été rechargée.'
    retryAction.value = null
    await load()
    return
  }

  if (status !== null && status >= 500) {
    error.value = 'Erreur serveur temporaire. Veuillez réessayer.'
    retryAction.value = retry
    return
  }

  retryAction.value = null
  if (axios.isAxiosError(err)) {
    const axiosError = err as AxiosError<{ message?: string }>
    error.value =
      axiosError.response?.data?.message ??
      axiosError.message ??
      'Erreur inattendue.'
    return
  }

  error.value = err instanceof Error ? err.message : 'Erreur inattendue.'
}

async function submitCreate() {
  if (isSavingCreate.value) return

  isSavingCreate.value = true
  pending.value = true
  error.value = null
  retryAction.value = null
  try {
    await privateApi.request(
      `/api/world/learning/admin/school/${resource.value}`,
      {
        method: 'POST',
        body: serializePayload(createForm.value),
      },
    )
    isCreateDialogOpen.value = false
    await load()
  } catch (err) {
    await handleMutationError(err, submitCreate)
  } finally {
    isSavingCreate.value = false
    pending.value = false
  }
}

async function submitEdit() {
  if (!editingId.value) return
  if (isSavingEdit.value) return

  isSavingEdit.value = true
  pending.value = true
  error.value = null
  retryAction.value = null
  try {
    await privateApi.request(
      `/api/world/learning/admin/school/${resource.value}/${editingId.value}`,
      {
        method: 'PATCH',
        body: serializePayload(editForm.value),
      },
    )
    isEditDialogOpen.value = false
    await load()
  } catch (err) {
    await handleMutationError(err, submitEdit, { reloadOnNotFound: true })
  } finally {
    isSavingEdit.value = false
    pending.value = false
  }
}

async function confirmDelete() {
  const id = deleteDialogItem.value?.id
  if (!id) return
  if (isDeleting.value) return

  isDeleting.value = true
  pending.value = true
  error.value = null
  retryAction.value = null
  try {
    await privateApi.request(
      `/api/world/learning/admin/school/${resource.value}/${String(id)}`,
      {
        method: 'DELETE',
      },
    )
    deleteDialogItem.value = null
    await load()
  } catch (err) {
    await handleMutationError(err, confirmDelete, { reloadOnNotFound: true })
  } finally {
    isDeleting.value = false
    pending.value = false
  }
}

async function retryLastAction() {
  if (!retryAction.value) return
  await retryAction.value()
}
</script>

<template>
  <div>
    <WorldModuleShell
      module-title="Learning"
      module-icon="mdi-school-outline"
      module-description="Administration and school resources management."
      :nav-items="learningNavItems"
      deactivate-right-drawer
      :show-action="false"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-3 postcard-gradient-card">
        <div class="d-flex align-center justify-space-between mb-2">
          <div>
            <h2 class="text-h5">{{ title }}</h2>
          </div>
          <div class="d-flex ga-2">
            <v-btn
              variant="tonal"
              to="/world/learning/admin"
              prepend-icon="mdi-arrow-left"
              >Back to admin</v-btn
            >
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate"
              >Create</v-btn
            >
            <v-btn
              variant="text"
              prepend-icon="mdi-refresh"
              :loading="pending"
              @click="load"
              >Refresh</v-btn
            >
          </div>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          <div class="d-flex align-center justify-space-between ga-3 flex-wrap">
            <span>{{ error }}</span>
            <v-btn
              v-if="retryAction"
              size="small"
              variant="outlined"
              :disabled="isSavingCreate || isSavingEdit || isDeleting"
              @click="retryLastAction"
            >
              Retry
            </v-btn>
          </div>
        </v-alert>

        <v-data-table
          :headers="headers"
          :items="rows"
          items-per-page="5"
          :loading="pending"
          density="comfortable"
          class="bg-transparent"
        >
          <template
            v-for="key in config.tableFields"
            :key="`cell-${key}`"
            #[`item.${key}`]="{ item }"
          >
            <span>{{ getItemValue(item, key) }}</span>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                size="small"
                variant="tonal"
                prepend-icon="mdi-pencil"
                @click="openEdit(item)"
              >
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
          <template v-for="key in config.createFields" :key="`create-${key}`">
            <AppSelect
              v-if="isFieldSelect(key)"
              v-model="createForm[key]"
              :items="optionsForField(key)"
              :label="key"
              class="mb-2"
            />
            <v-text-field
              v-else
              v-model="createForm[key]"
              :label="key"
              variant="outlined"
              class="mb-2"
            />
          </template>
          <div class="d-flex justify-end ga-2 mt-3">
            <v-btn variant="text" @click="isCreateDialogOpen = false"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :loading="isSavingCreate"
              :disabled="isSavingCreate"
              @click="submitCreate"
              >Save</v-btn
            >
          </div>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isEditDialogOpen" max-width="560">
        <v-card class="pa-4">
          <h2 class="text-h6 mb-3">Edit {{ resource.slice(0, -1) }}</h2>
          <template v-for="key in config.editFields" :key="`edit-${key}`">
            <AppSelect
              v-if="isFieldSelect(key)"
              v-model="editForm[key]"
              :items="optionsForField(key)"
              :label="key"
              class="mb-2"
            />
            <v-text-field
              v-else
              v-model="editForm[key]"
              :label="key"
              variant="outlined"
              class="mb-2"
            />
          </template>
          <div class="d-flex justify-end ga-2 mt-3">
            <v-btn variant="text" @click="isEditDialogOpen = false"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :loading="isSavingEdit"
              :disabled="isSavingEdit"
              @click="submitEdit"
              >Update</v-btn
            >
          </div>
        </v-card>
      </v-dialog>

      <v-dialog
        :model-value="!!deleteDialogItem"
        max-width="460"
        @update:model-value="
          (value) => {
            if (!value) deleteDialogItem = null
          }
        "
      >
        <v-card class="pa-4">
          <h2 class="text-h6 mb-2">Delete {{ resource.slice(0, -1) }}</h2>
          <p>Are you sure you want to delete this item?</p>
          <div class="d-flex justify-end ga-2 mt-3">
            <v-btn variant="text" @click="deleteDialogItem = null"
              >Cancel</v-btn
            >
            <v-btn
              color="error"
              :loading="isDeleting"
              :disabled="isDeleting"
              @click="confirmDelete"
              >Delete</v-btn
            >
          </div>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>
