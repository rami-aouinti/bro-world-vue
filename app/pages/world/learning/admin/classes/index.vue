<script setup lang="ts">
import type { SessionUser } from '~/types/session'
import { useWorldLearningAdminSchoolStore } from '~/stores/worldLearningAdminSchool'

definePageMeta({ layout: 'learning', title: 'Learning Admin Classes' })

const router = useRouter()
const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const canAccess = computed(() => {
  const roles = sessionUser.value?.roles ?? []
  return roles.includes('ROLE_ROOT') || roles.includes('ROLE_ADMIN')
})

if (!canAccess.value) {
  await router.replace('/world/learning')
}

const store = useWorldLearningAdminSchoolStore()
await store.fetchClasses()

const isCreateDialogOpen = ref(false)
const isEditDialogOpen = ref(false)
const isShowDialogOpen = ref(false)
const deleteDialogClass = ref<{ id: string; name: string } | null>(null)

const createForm = ref({ name: '', schoolId: '' })
const editForm = ref({ id: '', name: '', schoolId: '' })
const showItem = ref<{ id: string; name: string; schoolId: string } | null>(null)

const headers = [
  { title: 'Class', key: 'name' },
  { title: 'School ID', key: 'schoolId' },
  { title: 'Actions', key: 'actions', sortable: false },
]

async function refresh() {
  await store.fetchClasses({ force: true })
}

async function submitCreate() {
  await store.createClass({
    name: createForm.value.name,
    schoolId: createForm.value.schoolId,
  })
  isCreateDialogOpen.value = false
  createForm.value = { name: '', schoolId: '' }
}

function openEdit(item: { id: string; name: string; schoolId: string }) {
  editForm.value = { ...item }
  isEditDialogOpen.value = true
}

async function submitEdit() {
  await store.updateClass(editForm.value.id, {
    name: editForm.value.name,
    schoolId: editForm.value.schoolId,
  })
  isEditDialogOpen.value = false
}

async function openShow(itemId: string) {
  const item = await store.fetchClass(itemId, { force: true })
  showItem.value = item
  isShowDialogOpen.value = true
}
const { learningNavItems } = useWorldLearningNavItems()
async function confirmDelete() {
  if (!deleteDialogClass.value) return
  await store.removeClass(deleteDialogClass.value.id)
  deleteDialogClass.value = null
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
      <v-card class="pa-5" rounded="xl">
        <div class="d-flex flex-wrap align-center justify-space-between mb-4 ga-2">
          <div>
            <h1 class="text-h5">Classes</h1>
            <p class="text-medium-emphasis mb-0">
              Manage classes from the school/general endpoint.
            </p>
          </div>
          <div class="d-flex ga-2">
            <v-btn variant="tonal" prepend-icon="mdi-arrow-left" to="/world/learning/admin">
              Back to admin
            </v-btn>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="isCreateDialogOpen = true">
              Add class
            </v-btn>
            <v-btn variant="text" prepend-icon="mdi-refresh" :loading="store.pending" @click="refresh">
              Refresh
            </v-btn>
          </div>
        </div>

        <v-alert
          v-if="store.error"
          type="error"
          variant="tonal"
          class="mb-4"
          :text="store.error"
        />

        <v-data-table
          :headers="headers"
          :items="store.classes"
          :loading="store.pending"
          density="comfortable"
        >
          <template #item.actions="{ item }">
            <div class="d-flex ga-2">
              <v-btn size="small" variant="tonal" prepend-icon="mdi-eye" @click="openShow(item.id)">
                Show
              </v-btn>
              <v-btn size="small" variant="tonal" prepend-icon="mdi-pencil" @click="openEdit(item)">
                Edit
              </v-btn>
              <v-btn
                size="small"
                color="error"
                variant="tonal"
                prepend-icon="mdi-delete"
                @click="deleteDialogClass = { id: item.id, name: item.name }"
              >
                Delete
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <v-dialog v-model="isCreateDialogOpen" max-width="560">
        <v-card class="pa-4">
          <h2 class="text-h6 mb-3">Create class</h2>
          <v-text-field v-model="createForm.name" label="Name" variant="outlined" class="mb-2" />
          <v-text-field v-model="createForm.schoolId" label="School ID" variant="outlined" />
          <div class="d-flex justify-end ga-2 mt-3">
            <v-btn variant="text" @click="isCreateDialogOpen = false">Cancel</v-btn>
            <v-btn color="primary" :loading="store.pending" @click="submitCreate">Save</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isEditDialogOpen" max-width="560">
        <v-card class="pa-4">
          <h2 class="text-h6 mb-3">Edit class</h2>
          <v-text-field v-model="editForm.name" label="Name" variant="outlined" class="mb-2" />
          <v-text-field v-model="editForm.schoolId" label="School ID" variant="outlined" />
          <div class="d-flex justify-end ga-2 mt-3">
            <v-btn variant="text" @click="isEditDialogOpen = false">Cancel</v-btn>
            <v-btn color="primary" :loading="store.pending" @click="submitEdit">Update</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isShowDialogOpen" max-width="560">
        <v-card class="pa-4">
          <h2 class="text-h6 mb-3">Class details</h2>
          <v-list density="comfortable">
            <v-list-item title="ID" :subtitle="showItem?.id" />
            <v-list-item title="Name" :subtitle="showItem?.name" />
            <v-list-item title="School ID" :subtitle="showItem?.schoolId" />
          </v-list>
          <div class="d-flex justify-end mt-3">
            <v-btn color="primary" @click="isShowDialogOpen = false">Close</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <v-dialog :model-value="!!deleteDialogClass" max-width="460" @update:model-value="(value) => { if (!value) deleteDialogClass = null }">
        <v-card class="pa-4">
          <h2 class="text-h6 mb-2">Delete class</h2>
          <p>
            Are you sure you want to delete
            <strong>{{ deleteDialogClass?.name }}</strong>?
          </p>
          <div class="d-flex justify-end ga-2 mt-3">
            <v-btn variant="text" @click="deleteDialogClass = null">Cancel</v-btn>
            <v-btn color="error" :loading="store.pending" @click="confirmDelete">Delete</v-btn>
          </div>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>
