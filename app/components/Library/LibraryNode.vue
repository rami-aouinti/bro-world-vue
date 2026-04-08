<script setup lang="ts">
import type { LibraryDragPayload, LibraryTreeNode } from '~/types/library'

interface Props {
  node: LibraryTreeNode
  level?: number
  selectedId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  selectedId: null,
})

const emit = defineEmits<{
  select: [node: LibraryTreeNode]
  startDrag: [payload: LibraryDragPayload]
  dropOnFolder: [folderId: string | null]
  rename: [node: LibraryTreeNode]
}>()

const isFolder = computed(() => props.node.type === 'folder')
const isSelected = computed(() => props.selectedId === props.node.id)
const isDragOver = ref(false)

const iconName = computed(() => {
  if (props.node.type === 'folder') {
    return 'mdi-folder'
  }

  switch (props.node.fileType) {
    case 'pdf':
      return 'mdi-file-pdf-box'
    case 'image':
      return 'mdi-file-image'
    default:
      return 'mdi-file-outline'
  }
})

const onDragStart = (event: DragEvent) => {
  const payload: LibraryDragPayload = {
    id: props.node.id,
    type: props.node.type,
    parentId: null,
  }

  emit('startDrag', payload)

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.node.id)
  }
}

const onDragOverFolder = (event: DragEvent) => {
  if (!isFolder.value) {
    return
  }

  event.preventDefault()
  isDragOver.value = true
}

const onDragLeaveFolder = () => {
  isDragOver.value = false
}

const onDropFolder = (event: DragEvent) => {
  if (!isFolder.value) {
    return
  }

  event.preventDefault()
  isDragOver.value = false
  emit('dropOnFolder', props.node.id)
}
</script>

<template>
  <div class="library-node" :style="{ '--node-level': String(level) }">
    <v-card
      variant="tonal"
      class="library-node__row"
      :class="{ 'library-node__row--selected': isSelected, 'library-node__row--drag-over': isDragOver }"
      draggable="true"
      @click="emit('select', node)"
      @dragstart="onDragStart"
      @dragover="onDragOverFolder"
      @dragleave="onDragLeaveFolder"
      @drop="onDropFolder"
    >
      <div class="d-flex align-center ga-3 px-3 py-2">
        <v-icon :icon="iconName" size="20" />
        <span class="text-body-2 font-weight-medium text-truncate">{{ node.name }}</span>
        <v-spacer />
        <v-btn icon="mdi-pencil" variant="text" size="small" @click.stop="emit('rename', node)" />
      </div>
    </v-card>

    <div v-if="node.type === 'folder' && node.children.length > 0" class="library-node__children">
      <LibraryNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-id="selectedId"
        @select="emit('select', $event)"
        @start-drag="emit('startDrag', $event)"
        @drop-on-folder="emit('dropOnFolder', $event)"
        @rename="emit('rename', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.library-node {
  padding-left: calc(var(--node-level) * 16px);
}

.library-node__row {
  border: 1px solid transparent;
  transition: 0.2s ease;
  cursor: pointer;
}

.library-node__row--selected {
  border-color: rgb(var(--v-theme-primary));
}

.library-node__row--drag-over {
  border-color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.1);
}

.library-node__children {
  margin-top: 8px;
  display: grid;
  gap: 8px;
}
</style>
