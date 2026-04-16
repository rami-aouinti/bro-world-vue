<script setup lang="ts">
import type {
  LibraryFileNode,
  LibraryFolderNode,
  LibraryTreeNode,
} from '~/types/library'

const { t, te } = useI18n()

const tOrFallback = (key: string, fallback: string) =>
  te(key) ? t(key) : fallback
const { isPageSkeletonVisible } = usePageSkeleton()
const {
  tree,
  folderOptions,
  fetchTree,
  createFolder,
  uploadFile,
  renameNode,
  moveByDrag,
} = useLibrary()

definePageMeta({
  title: 'pages.profileOverview.libraryTitle',
  middleware: 'auth',
})

const currentFolderId = ref<string | null>(null)
const selectedNode = ref<LibraryTreeNode | null>(null)
const selectedFile = ref<LibraryFileNode | null>(null)
const filePreviewOpen = ref(false)
const dragPayload = ref<{
  id: string
  type: 'folder' | 'file'
  parentId: string | null
} | null>(null)
const dragOverFolderId = ref<string | null>(null)

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

const rootNode = computed<LibraryFolderNode>(() => ({
  id: 'root',
  name: 'Root',
  type: 'folder',
  children: tree.value,
}))

const isFolder = (node: LibraryTreeNode): node is LibraryFolderNode =>
  node.type === 'folder'

const findFolderById = (
  nodes: LibraryTreeNode[],
  folderId: string,
): LibraryFolderNode | null => {
  for (const node of nodes) {
    if (node.type !== 'folder') {
      continue
    }

    if (node.id === folderId) {
      return node
    }

    const nested = findFolderById(node.children, folderId)
    if (nested) {
      return nested
    }
  }

  return null
}

const findFolderPath = (
  nodes: LibraryTreeNode[],
  folderId: string,
  path: LibraryFolderNode[] = [],
): LibraryFolderNode[] | null => {
  for (const node of nodes) {
    if (node.type !== 'folder') {
      continue
    }

    const nextPath = [...path, node]

    if (node.id === folderId) {
      return nextPath
    }

    const nested = findFolderPath(node.children, folderId, nextPath)
    if (nested) {
      return nested
    }
  }

  return null
}

const currentFolder = computed(() => {
  if (!currentFolderId.value) {
    return rootNode.value
  }

  return findFolderById(tree.value, currentFolderId.value) ?? rootNode.value
})

const currentItems = computed(() => currentFolder.value.children)

const breadcrumbFolders = computed(() => {
  if (!currentFolderId.value) {
    return [rootNode.value]
  }

  const path = findFolderPath(tree.value, currentFolderId.value)
  return [rootNode.value, ...(path ?? [])]
})

const sidebarFolders = computed(() => {
  const onlyFolders = (nodes: LibraryTreeNode[]): LibraryFolderNode[] => {
    return nodes.filter(isFolder).map((folder) => ({
      ...folder,
      children: onlyFolders(folder.children),
    }))
  }

  return onlyFolders(tree.value)
})

onMounted(async () => {
  try {
    await fetchTree({ force: true })
  } catch (error) {
    console.error('Failed to load library tree', error)
  }
})

const openCreateFolder = () => {
  folderDialog.name = ''
  folderDialog.parentId = currentFolderId.value
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
  } finally {
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

  await uploadFile(file, currentFolderId.value)
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
  } finally {
    renameDialog.saving = false
  }
}

const openFolder = (folderId: string | null) => {
  currentFolderId.value = folderId
  selectedNode.value = folderId
    ? findFolderById(tree.value, folderId)
    : rootNode.value
}

const openNode = (node: LibraryTreeNode) => {
  selectedNode.value = node

  if (node.type === 'folder') {
    openFolder(node.id)
    return
  }

  selectedFile.value = node
  filePreviewOpen.value = true
}

const onStartDragNode = (node: LibraryTreeNode, parentId: string | null) => {
  dragPayload.value = {
    id: node.id,
    type: node.type,
    parentId,
  }
}

const onDragOverFolder = (event: DragEvent, folderId: string) => {
  if (!dragPayload.value) {
    return
  }

  event.preventDefault()
  dragOverFolderId.value = folderId
}

const onDragLeaveFolder = (folderId: string) => {
  if (dragOverFolderId.value !== folderId) {
    return
  }

  dragOverFolderId.value = null
}

const onDropToFolder = async (destinationParentId: string | null) => {
  if (!dragPayload.value) {
    return
  }

  try {
    await moveByDrag(dragPayload.value, destinationParentId)
  } catch (error) {
    console.error('Failed to move node', error)
  } finally {
    dragPayload.value = null
    dragOverFolderId.value = null
  }
}

const onDragEnd = () => {
  dragPayload.value = null
  dragOverFolderId.value = null
}

const isPreviewImage = computed(
  () => selectedFile.value?.mimeType?.startsWith('image/') ?? false,
)
const isPreviewPdf = computed(
  () => selectedFile.value?.mimeType === 'application/pdf',
)
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible" />
        <v-list v-else density="comfortable" nav>
          <v-list-item
            prepend-icon="mdi-home"
            color="primary"
            title="Root"
            :active="currentFolderId === null"
            @click="openFolder(null)"
            @dragover.prevent="
              dragPayload ? $event.preventDefault() : undefined
            "
            @drop.prevent="onDropToFolder(null)"
          />
          <LibraryNode
            v-for="folder in sidebarFolders"
            :key="folder.id"
            :node="folder"
            :selected-id="currentFolderId"
            @select="openFolder($event.id)"
            @start-drag="dragPayload = $event"
            @drop-on-folder="onDropToFolder"
            @rename="openRenameDialog"
          />
        </v-list>
      </template>
      <template #left>
        <ProfileDrawer />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <v-card class="library-card" variant="text">
          <div
            class="d-flex flex-wrap justify-space-between align-center ga-3 mb-4"
          >
            <v-breadcrumbs :items="breadcrumbFolders" class="pa-0">
              <template #item="{ item }">
                <v-btn
                  variant="text"
                  size="small"
                  @click="openFolder(item.id === 'root' ? null : item.id)"
                >
                  {{ item.name }}
                </v-btn>
              </template>
            </v-breadcrumbs>

            <div class="d-flex text-end">
              <input
                ref="fileInput"
                type="file"
                class="d-none"
                @change="onFileChange"
              />
              <v-btn
                v-if="selectedNode"
                variant="text"
                icon="mdi-pencil"
                @click="openRenameDialog(selectedNode)"
              />
              <v-btn
                variant="text"
                color="primary"
                icon="mdi-upload"
                @click="onUploadClick"
              />
              <v-btn
                variant="text"
                color="warning"
                icon="mdi-folder-plus"
                @click="openCreateFolder"
              />
            </div>
          </div>

          <div class="library-grid">
            <v-btn
              v-for="node in currentItems"
              :key="node.id"
              variant="text"
              block
              class="library-grid__item"
              :class="{
                'library-grid__item--selected': selectedNode?.id === node.id,
                'library-grid__item--drag-over':
                  node.type === 'folder' && dragOverFolderId === node.id,
              }"
              draggable="true"
              @click="openNode(node)"
              @dragstart="onStartDragNode(node, currentFolderId)"
              @dragover="
                node.type === 'folder'
                  ? onDragOverFolder($event, node.id)
                  : undefined
              "
              @dragleave="
                node.type === 'folder' ? onDragLeaveFolder(node.id) : undefined
              "
              @drop="
                node.type === 'folder' ? onDropToFolder(node.id) : undefined
              "
              @dragend="onDragEnd"
            >
              <v-icon
                :color="node.type === 'folder' ? 'warning' : 'primary'"
                :icon="
                  node.type === 'folder' ? 'mdi-folder' : 'mdi-file-outline'
                "
                size="48"
              />
              <span class="library-grid__name text-truncate">{{
                node.name
              }}</span>
            </v-btn>
          </div>

          <p
            v-if="currentItems.length === 0"
            class="text-medium-emphasis mb-0 mt-2"
          >
            {{ t('pages.profileOverview.libraryEmpty') }}
          </p>
        </v-card>
      </template>
    </v-container>

    <v-dialog v-model="filePreviewOpen" max-width="900">
      <v-card v-if="selectedFile">
        <v-card-title class="d-flex align-center justify-space-between ga-3">
          <span class="text-truncate">{{ selectedFile.name }}</span>
          <div class="d-flex align-center ga-2">
            <v-btn
              color="primary"
              variant="outlined"
              icon="mdi-download"
              :href="selectedFile.url"
              :download="selectedFile.name"
              target="_blank"
              rel="noopener"
              :aria-label="
                tOrFallback(
                  'pages.profileOverview.libraryPreviewDownload',
                  'Download',
                )
              "
            />
            <v-btn
              variant="text"
              icon="mdi-close"
              aria-label="Close preview"
              @click="filePreviewOpen = false"
            />
          </div>
        </v-card-title>
        <v-card-text>
          <div v-if="isPreviewImage" class="file-preview">
            <img
              :src="selectedFile.url"
              :alt="selectedFile.name"
              class="file-preview__image"
            />
          </div>
          <iframe
            v-else-if="isPreviewPdf"
            :src="selectedFile.url"
            class="file-preview__frame"
            title="PDF preview"
          />
          <div v-else class="text-medium-emphasis">
            {{
              tOrFallback(
                'pages.profileOverview.libraryPreviewUnsupported',
                'Preview is not available for this file type.',
              )
            }}
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="folderDialog.open" max-width="560">
      <v-card>
        <v-card-title>{{
          t('pages.profileOverview.libraryCreateFolder')
        }}</v-card-title>
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
          <v-btn variant="text" @click="folderDialog.open = false">{{
            t('common.cancel')
          }}</v-btn>
          <v-btn
            color="primary"
            :loading="folderDialog.saving"
            @click="submitCreateFolder"
          >
            {{ t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="renameDialog.open" max-width="560">
      <v-card>
        <v-card-title>{{
          t('pages.profileOverview.libraryRename')
        }}</v-card-title>
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
          <v-btn variant="text" @click="renameDialog.open = false">{{
            t('common.cancel')
          }}</v-btn>
          <v-btn
            color="primary"
            :loading="renameDialog.saving"
            @click="submitRename"
          >
            {{ t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.library-card {
  padding: 16px;
  min-height: calc(85vh - var(--v-layout-top, 0px));
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.library-explorer {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  min-height: 560px;
}

.library-explorer__sidebar {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  overflow: auto;
}

.library-explorer__content {
  padding: 16px;
}

.library-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 220px));
  justify-content: start;
}

.library-grid__item {
  min-height: 76px;
  padding: 10px 12px;
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  align-items: start;
  text-align: start;
  cursor: pointer;
  transition: 0.2s ease;
}

.library-grid__item:hover {
  border-color: rgba(var(--v-theme-primary), 0.55);
}

.library-grid__item--selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.library-grid__item--drag-over {
  border-color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.1);
}

.library-grid__name {
  display: inline-block;
  width: 100%;
  max-width: 140px;
  padding-left: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.file-preview {
  display: flex;
  justify-content: center;
}

.file-preview__image {
  max-height: 70vh;
  max-width: 100%;
  object-fit: contain;
}

.file-preview__frame {
  width: 100%;
  height: 70vh;
  border: none;
}

@media (max-width: 960px) {
  .library-explorer {
    grid-template-columns: 1fr;
  }

  .library-explorer__sidebar {
    border-right: none;
    border-bottom: 1px solid
      rgba(var(--v-border-color), var(--v-border-opacity));
    max-height: 280px;
  }
}
</style>
