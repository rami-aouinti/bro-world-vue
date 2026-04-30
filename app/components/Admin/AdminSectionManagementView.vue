<script setup lang="ts">
import {
  ADMIN_SECTIONS_BY_KEY,
  PAGE_MANAGEMENT_NAV_ITEMS,
  type AdminSectionKey,
  type PageManagementNavKey,
} from '~/constants/adminManagement'
import { useAdminManagementStore } from '~/stores/adminManagement'

const props = withDefaults(
  defineProps<{
    sectionKey: AdminSectionKey
    pageType?: PageManagementNavKey | null
  }>(),
  {
    pageType: null,
  },
)

const store = useAdminManagementStore()

const section = computed(() => ADMIN_SECTIONS_BY_KEY[props.sectionKey])
const currentPageType = computed<PageManagementNavKey | undefined>(() =>
  props.sectionKey === 'pages'
    ? (props.pageType ?? PAGE_MANAGEMENT_NAV_ITEMS[0].key)
    : undefined,
)

const search = ref('')
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selectedItemId = ref('')
const formState = ref<Record<string, string>>({})

const jsonDialogOpen = ref(false)
const jsonDialogTitle = ref('')
const jsonRows = ref<Array<{ label: string; value: string }>>([])

watchEffect(async () => {
  await store.fetchSection(props.sectionKey, {
    pageType: currentPageType.value,
  })
})

const pending = computed(() => store.pending)
const totalCount = computed(() => store.countBySection[props.sectionKey] ?? 0)
const rows = computed(() => store.rowsBySection[props.sectionKey] ?? [])

const filteredRows = computed(() => {
  if (!search.value.trim()) {
    return rows.value
  }

  const needle = search.value.trim().toLowerCase()
  return rows.value.filter((row) =>
    Object.values(row).join(' ').toLowerCase().includes(needle),
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

const skeletonColumns = computed(() => [
  ...displayedColumns.value,
  { title: 'Actions', key: 'actions' },
])
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

function parseJsonObject(value: unknown): unknown | null {
  if (value !== null && typeof value === 'object') {
    return value
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()

  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return null
  }

  try {
    const parsed = JSON.parse(trimmed)
    return parsed !== null && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function toRows(
  value: unknown,
  parent = '',
): Array<{ label: string; value: string }> {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => {
      const label = parent ? `${parent}[${index}]` : `[${index}]`

      if (item !== null && typeof item === 'object') {
        return toRows(item, label)
      }

      return [{ label, value: String(item ?? '') }]
    })
  }

  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, entryValue]) => {
        const label = parent ? `${parent}.${key}` : key

        if (entryValue !== null && typeof entryValue === 'object') {
          return toRows(entryValue, label)
        }

        return [{ label, value: String(entryValue ?? '') }]
      },
    )
  }

  return [{ label: parent || 'value', value: String(value ?? '') }]
}

function openJsonDialog(columnTitle: string, rawValue: unknown) {
  const parsed = parseJsonObject(rawValue)

  if (!parsed) {
    return
  }

  jsonDialogTitle.value = columnTitle
  jsonRows.value = toRows(parsed)
  jsonDialogOpen.value = true
}

function hasJsonContent(value: unknown) {
  return Boolean(parseJsonObject(value))
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) {
    return '-'
  }

  if (typeof value === 'object') {
    return 'JSON'
  }

  const text = String(value)
  return text.length > 60 ? `${text.slice(0, 60)}...` : text
}

async function submit() {
  const payload = Object.fromEntries(
    Object.entries(formState.value).map(([key, value]) => [key, value]),
  )

  if (dialogMode.value === 'create') {
    await store.createItem(props.sectionKey, payload, {
      pageType: currentPageType.value,
    })
  } else if (selectedItemId.value) {
    await store.updateItem(props.sectionKey, selectedItemId.value, payload, {
      pageType: currentPageType.value,
    })
  }

  dialogOpen.value = false
}

async function removeItem(item: Record<string, unknown>) {
  const id = String(item.id ?? item.role ?? '')

  if (!id) {
    return
  }

  await store.deleteItem(props.sectionKey, id, {
    pageType: currentPageType.value,
  })
}
</script>

<template>
  <v-container fluid>
    <v-card class="pa-4 postcard-gradient-card rounded-xl">
      <div
        class="d-flex justify-space-between align-center flex-wrap ga-3 mb-4"
      >
        <div>
          <h2 class="text-h5 mb-1">{{ section.title }}</h2>
          <p class="text-medium-emphasis mb-0">{{ section.description }}</p>
        </div>
        <div class="d-flex align-center ga-2 flex-wrap">
          <v-chip color="primary" variant="tonal"
            >Count: {{ totalCount }}</v-chip
          >
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

      <template v-if="pending">
        <v-table class="bg-transparent">
          <thead>
            <tr>
              <th
                v-for="column in skeletonColumns"
                :key="`skeleton-head-${column.key}`"
              >
                {{ column.title }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rowIndex in 5" :key="`skeleton-row-${rowIndex}`">
              <td
                v-for="column in skeletonColumns"
                :key="`skeleton-cell-${rowIndex}-${column.key}`"
              >
                <v-skeleton-loader type="text" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </template>
      <v-data-table
        v-else
        :headers="[
          ...displayedColumns,
          { title: 'Actions', key: 'actions', sortable: false },
        ]"
        :items="filteredRows"
        :items-per-page="5"
        density="comfortable"
        class="bg-transparent"
      >
        <template
          v-for="column in displayedColumns"
          :key="`json-column-${column.key}`"
          #[`item.${column.key}`]="{ item }"
        >
          <v-btn
            v-if="hasJsonContent(item[column.key])"
            size="small"
            variant="tonal"
            color="info"
            @click="openJsonDialog(column.title, item[column.key])"
          >
            Show JSON
          </v-btn>
          <span v-else>{{ formatCellValue(item[column.key]) }}</span>
        </template>
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

  <v-dialog v-model="jsonDialogOpen" max-width="920">
    <v-card class="pa-4">
      <h2 class="text-h6 mb-4">{{ jsonDialogTitle }}</h2>

      <v-table density="compact">
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in jsonRows" :key="row.label">
            <td>{{ row.label }}</td>
            <td>{{ row.value }}</td>
          </tr>
        </tbody>
      </v-table>

      <div class="d-flex justify-end mt-4">
        <v-btn color="primary" @click="jsonDialogOpen = false">Close</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
