<script setup lang="ts">
import type { LibraryDragPayload, LibraryTreeNode } from '~/types/library'

const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const {
  tree,
  pending,
  folderOptions,
  fetchTree,
  createFolder,
  uploadFile,
  moveByDrag,
  removeByDragToTrash,
  renameNode,
} = useLibrary()

definePageMeta({
  title: 'Library',
  middleware: 'auth',
})

const selectedNode = ref<LibraryTreeNode | null>(null)
const draggedNode = ref<LibraryDragPayload | null>(null)
const isTrashDragOver = ref(false)
const isRootDragOver = ref(false)
const folderDialog = reactive({
  open: false,
  name: '',
  parentId: null as string | null,
  saving: false,
})
const renameDialog = reactive({
  open: false,
  name: '',
  saving: false,
  node: null as LibraryTreeNode | null,
})
const fileInput = ref<HTMLInputElement | null>(null)

const findParentId = (nodes: LibraryTreeNode[], targetId: string, parentId: string | null = null): string | null | undefined => {
  for (const node of nodes) {
    if (node.id === targetId) {
      return parentId
    }

    if (node.type === 'folder') {
      const nested = findParentId(node.children, targetId, node.id)
      if (nested !== undefined) {
        return nested
      }
    }
  }

  return undefined
}

onMounted(async () => {
  try {
    await fetchTree({ force: true })
  }
  catch (error) {
    console.error('Failed to load library tree', error)
  }
})

const onStartDrag = (payload: LibraryDragPayload) => {
  draggedNode.value = {
    ...payload,
    parentId: findParentId(tree.value, payload.id) ?? null,
  }
}

const onDropToFolder = async (folderId: string | null) => {
  if (!draggedNode.value) {
    return
  }

  try {
    await moveByDrag(draggedNode.value, folderId)
  }
  catch (error) {
    console.error(error)
  }
  finally {
    draggedNode.value = null
    isRootDragOver.value = false
  }
}

const onDropToRoot = async () => {
  await onDropToFolder(null)
}

const onDropToTrash = async () => {
  if (!draggedNode.value) {
    return
  }

  await removeByDragToTrash(draggedNode.value)
  if (selectedNode.value?.id === draggedNode.value.id) {
    selectedNode.value = null
  }
  draggedNode.value = null
  isTrashDragOver.value = false
}

const openCreateFolder = () => {
  folderDialog.name = ''
  folderDialog.parentId = selectedNode.value?.type === 'folder' ? selectedNode.value.id : null
  folderDialog.open = true
}

const submitCreateFolder = async () => {
  if (!folderDialog.name.trim()) {
    return
  }

  folderDialog.saving = true

  try {
    await createFolder({
      name: folderDialog.name.trim(),
      parentId: folderDialog.parentId,
    })
    folderDialog.open = false
  }
  finally {
    folderDialog.saving = false
  }
}

const onUploadClick = () => {
  fileInput.value?.click()
}

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  const folderId = selectedNode.value?.type === 'folder' ? selectedNode.value.id : null
  await uploadFile(file, folderId)

  input.value = ''
}

const openRenameDialog = (node: LibraryTreeNode) => {
  renameDialog.node = node
  renameDialog.name = node.name
  renameDialog.open = true
}

const submitRename = async () => {
  if (!renameDialog.node || !renameDialog.name.trim()) {
    return
  }

  renameDialog.saving = true
  try {
    await renameNode(renameDialog.node, renameDialog.name.trim())
    renameDialog.open = false
  }
  finally {
    renameDialog.saving = false
  }
}
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible" />
        <ProfileDrawer v-else />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <div class="d-flex flex-wrap ga-3 justify-space-between align-start mb-6">
          <div>
            <h1 class="text-h4 mb-2">{{ t('pages.profileOverview.libraryTitle') }}</h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ t('pages.profileOverview.librarySubtitle') }}
            </p>
          </div>

          <div class="d-flex ga-2">
            <v-btn color="primary" prepend-icon="mdi-folder-plus" @click="openCreateFolder">
              {{ t('pages.profileOverview.libraryCreateFolder') }}
            </v-btn>
            <v-btn color="secondary" variant="outlined" prepend-icon="mdi-upload" @click="onUploadClick">
              {{ t('pages.profileOverview.libraryUploadFile') }}
            </v-btn>
            <input ref="fileInput" type="file" class="d-none" @change="onFileChange">
          </div>
        </div>

        <v-row>
          <v-col cols="12" md="8">
            <v-card
              class="pa-4"
              :loading="pending"
              @dragover.prevent="isRootDragOver = true"
              @dragleave="isRootDragOver = false"
              @drop.prevent="onDropToRoot"
            >
              <div class="d-flex align-center mb-3">
                <v-icon icon="mdi-folder-home" class="me-2" />
                <span class="font-weight-bold">Root</span>
              </div>

              <div class="library-tree" :class="{ 'library-tree--drag-over': isRootDragOver }">
                <LibraryNode
                  v-for="node in tree"
                  :key="node.id"
                  :node="node"
                  :selected-id="selectedNode?.id ?? null"
                  @select="selectedNode = $event"
                  @start-drag="onStartDrag"
                  @drop-on-folder="onDropToFolder"
                  @rename="openRenameDialog"
                />

                <p v-if="tree.length === 0" class="text-medium-emphasis mb-0">
                  {{ t('pages.profileOverview.libraryEmpty') }}
                </p>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="pa-4 mb-4">
              <h3 class="text-h6 mb-2">{{ t('pages.profileOverview.librarySelectedItem') }}</h3>
              <template v-if="selectedNode">
                <div class="d-flex align-center ga-2 mb-2">
                  <v-chip :color="selectedNode.type === 'folder' ? 'primary' : 'info'" size="small">
                    {{ selectedNode.type }}
                  </v-chip>
                  <span class="font-weight-medium">{{ selectedNode.name }}</span>
                </div>
                <p v-if="selectedNode.type === 'file'" class="text-body-2 mb-0 text-medium-emphasis">
                  {{ selectedNode.mimeType || selectedNode.extension || '-' }}
                </p>
              </template>
              <p v-else class="text-medium-emphasis mb-0">{{ t('pages.profileOverview.librarySelectHint') }}</p>
            </v-card>

            <v-card
              class="pa-4 trash-zone"
              :class="{ 'trash-zone--drag-over': isTrashDragOver }"
              @dragover.prevent="isTrashDragOver = true"
              @dragleave="isTrashDragOver = false"
              @drop.prevent="onDropToTrash"
            >
              <div class="d-flex align-center ga-2">
                <v-icon icon="mdi-trash-can-outline" color="error" />
                <span class="font-weight-bold">{{ t('pages.profileOverview.libraryTrash') }}</span>
              </div>
              <p class="text-body-2 text-medium-emphasis mt-2 mb-0">
                {{ t('pages.profileOverview.libraryTrashHint') }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>

    <v-dialog v-model="folderDialog.open" max-width="560">
      <v-card>
        <v-card-title>{{ t('pages.profileOverview.libraryCreateFolder') }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="folderDialog.name"
            :label="t('pages.profileOverview.libraryFolderName')"
            variant="outlined"
            density="comfortable"
          />
          <v-select
            v-model="folderDialog.parentId"
            :items="folderOptions"
            item-title="title"
            item-value="value"
            :label="t('pages.profileOverview.libraryParentFolder')"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="folderDialog.open = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" :loading="folderDialog.saving" @click="submitCreateFolder">
            {{ t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="renameDialog.open" max-width="560">
      <v-card>
        <v-card-title>{{ t('pages.profileOverview.libraryRename') }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="renameDialog.name"
            :label="t('pages.profileOverview.libraryName')"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="renameDialog.open = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" :loading="renameDialog.saving" @click="submitRename">
            {{ t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.library-tree {
  display: grid;
  gap: 10px;
}

.library-tree--drag-over {
  border: 1px dashed rgb(var(--v-theme-primary));
  border-radius: 8px;
  padding: 8px;
}

.trash-zone {
  border: 1px dashed rgba(var(--v-theme-error), 0.4);
  transition: 0.2s ease;
}

.trash-zone--drag-over {
  background: rgba(var(--v-theme-error), 0.08);
  border-color: rgb(var(--v-theme-error));
}
</style>
