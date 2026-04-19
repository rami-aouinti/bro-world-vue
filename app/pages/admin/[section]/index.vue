<script setup lang="ts">
import {
  ADMIN_SECTIONS_BY_KEY,
  type AdminSectionKey,
} from '~/constants/adminManagement'
import { useAdminManagementStore } from '~/stores/adminManagement'

const route = useRoute()
const store = useAdminManagementStore()

const sectionKey = computed(() => route.params.section as AdminSectionKey)
const section = computed(() => ADMIN_SECTIONS_BY_KEY[sectionKey.value])

if (!section.value) {
  throw createError({ statusCode: 404, statusMessage: 'Admin section not found' })
}

const search = ref('')
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selectedItemId = ref('')
const formState = ref<Record<string, string>>({})

await store.fetchSection(sectionKey.value)

const pending = computed(() => store.pending)
const totalCount = computed(() => store.countBySection[sectionKey.value] ?? 0)
const rows = computed(() => store.rowsBySection[sectionKey.value] ?? [])

const filteredRows = computed(() => {
  if (!search.value.trim()) {
    return rows.value
  }

  const needle = search.value.trim().toLowerCase()
  return rows.value.filter((row) =>
    Object.values(row)
      .join(' ')
      .toLowerCase()
      .includes(needle),
  )
})

const displayedColumns = computed(() => {
  const first = rows.value[0]

  if (!first) {
    return [{ title: 'id', key: 'id' }]
  }

  return Object.keys(first)
    .slice(0, 5)
    .map((key) => ({ title: key, key }))
})

const canMutate = computed(() => section.value.capabilities)

function openCreateDialog() {
  dialogMode.value = 'create'
  selectedItemId.value = ''
  formState.value = {}
  dialogOpen.value = true
}

function openEditDialog(item: Record<string, unknown>) {
  dialogMode.value = 'edit'
  selectedItemId.value = String(item.id ?? item.role ?? '')
  formState.value = {}

  Object.entries(item).forEach(([key, value]) => {
    if (key === 'id') {
      return
    }

    formState.value[key] = String(value ?? '')
  })

  dialogOpen.value = true
}

async function submit() {
  const payload = Object.fromEntries(
    Object.entries(formState.value).map(([key, value]) => [key, value]),
  )

  if (dialogMode.value === 'create') {
    await store.createItem(sectionKey.value, payload)
  } else if (selectedItemId.value) {
    await store.updateItem(sectionKey.value, selectedItemId.value, payload)
  }

  dialogOpen.value = false
}

async function removeItem(item: Record<string, unknown>) {
  const id = String(item.id ?? item.role ?? '')

  if (!id) {
    return
  }

  await store.deleteItem(sectionKey.value, id)
}
</script>

<template>
  <div>
    <AdminModuleDrawers />

    <v-container fluid>
      <v-card class="pa-4 postcard-gradient-card rounded-xl">
        <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-4">
          <div>
            <h2 class="text-h5 mb-1">{{ section.title }}</h2>
            <p class="text-medium-emphasis mb-0">{{ section.description }}</p>
          </div>
          <div class="d-flex align-center ga-2 flex-wrap">
            <v-chip color="primary" variant="tonal">Count: {{ totalCount }}</v-chip>
            <v-btn
              v-if="canMutate.create"
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
            >
              Create
            </v-btn>
          </div>
        </div>

        <v-text-field
          v-model="search"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-4"
        />

        <v-data-table
          :loading="pending"
          :headers="[
            ...displayedColumns,
            { title: 'Actions', key: 'actions', sortable: false },
          ]"
          :items="filteredRows"
          :items-per-page="5"
          density="comfortable"
          class="bg-transparent"
        >
          <template #item.actions="{ item }">
            <div class="d-flex ga-1">
              <v-btn
                v-if="canMutate.update"
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="openEditDialog(item)"
              />
              <v-btn
                v-if="canMutate.remove"
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="removeItem(item)"
              />
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <v-dialog v-model="dialogOpen" max-width="720">
      <v-card class="pa-4">
        <h2 class="text-h6 mb-4">
          {{ dialogMode === 'create' ? 'Create item' : 'Update item' }}
        </h2>

        <v-row>
          <v-col
            v-for="column in displayedColumns.filter((item) => item.key !== 'id')"
            :key="column.key"
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="formState[column.key]"
              :label="column.title"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
        </v-row>

        <div class="d-flex justify-end ga-2 mt-3">
          <v-btn variant="text" @click="dialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" @click="submit">Save</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>
