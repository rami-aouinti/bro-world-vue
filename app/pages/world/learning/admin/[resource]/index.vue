<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Learning Admin Resource' })

type RowItem = Record<string, unknown> & { id?: string }

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
  </v-container>
</template>
