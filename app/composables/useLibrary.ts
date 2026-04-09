import type {
  CreateFolderPayload,
  LibraryDragPayload,
  LibraryFolderNode,
  LibraryTreeNode,
  LibraryTreeResponse,
  PatchFilePayload,
  PatchFolderPayload,
} from '~/types/library'

const LIBRARY_CACHE_TTL_MS = 45_000

function isFolder(node: LibraryTreeNode): node is LibraryFolderNode {
  return node.type === 'folder'
}

function isFolderDescendant(
  nodes: LibraryTreeNode[],
  sourceId: string,
  destinationId: string,
): boolean {
  if (!destinationId) {
    return false
  }

  const findNode = (
    children: LibraryTreeNode[],
    id: string,
  ): LibraryTreeNode | null => {
    for (const node of children) {
      if (node.id === id) {
        return node
      }
      if (isFolder(node)) {
        const nested = findNode(node.children, id)
        if (nested) {
          return nested
        }
      }
    }
    return null
  }

  const sourceNode = findNode(nodes, sourceId)

  if (!sourceNode || sourceNode.type !== 'folder') {
    return false
  }

  const queue = [...sourceNode.children]

  while (queue.length > 0) {
    const current = queue.shift()

    if (!current) {
      continue
    }

    if (current.id === destinationId) {
      return true
    }

    if (isFolder(current)) {
      queue.push(...current.children)
    }
  }

  return false
}

export function useLibrary() {
  const api = $fetch.create({
    baseURL: '/api/library',
    headers: {
      accept: 'application/json',
    },
  })
  const tree = useState<LibraryTreeNode[]>('library-tree', () => [])
  const lastFetchedAt = useState<number>('library-last-fetched-at', () => 0)
  const pending = ref(false)

  const fetchTree = async (opts?: { force?: boolean }) => {
    const now = Date.now()
    const shouldUseCache =
      !opts?.force &&
      tree.value.length > 0 &&
      now - lastFetchedAt.value < LIBRARY_CACHE_TTL_MS

    if (shouldUseCache) {
      return tree.value
    }

    pending.value = true

    try {
      const response = await api<LibraryTreeResponse>('/tree')
      tree.value = response.children ?? []
      lastFetchedAt.value = now
      return tree.value
    } finally {
      pending.value = false
    }
  }

  const createFolder = async (payload: CreateFolderPayload) => {
    const response = await api('/folders', {
      method: 'POST',
      body: payload,
    })

    await fetchTree({ force: true })
    return response
  }

  const uploadFile = async (file: File, folderId: string | null) => {
    const formData = new FormData()
    formData.append('file', file)

    if (folderId) {
      formData.append('folderId', folderId)
    }

    const response = await api('/files/upload', {
      method: 'POST',
      body: formData,
    })

    await fetchTree({ force: true })
    return response
  }

  const patchFolder = async (folderId: string, payload: PatchFolderPayload) => {
    const response = await api(`/folders/${folderId}`, {
      method: 'PATCH',
      body: payload,
    })

    await fetchTree({ force: true })
    return response
  }

  const patchFile = async (fileId: string, payload: PatchFilePayload) => {
    const response = await api(`/files/${fileId}`, {
      method: 'PATCH',
      body: payload,
    })

    await fetchTree({ force: true })
    return response
  }

  const deleteFolder = async (folderId: string) => {
    await api(`/folders/${folderId}`, {
      method: 'DELETE',
    })

    await fetchTree({ force: true })
  }

  const deleteFile = async (fileId: string) => {
    await api(`/files/${fileId}`, {
      method: 'DELETE',
    })

    await fetchTree({ force: true })
  }

  const moveByDrag = async (
    payload: LibraryDragPayload,
    destinationParentId: string | null,
  ) => {
    if (payload.parentId === destinationParentId) {
      return
    }

    if (
      payload.type === 'folder' &&
      destinationParentId &&
      isFolderDescendant(tree.value, payload.id, destinationParentId)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'A folder cannot be moved into one of its children.',
      })
    }

    if (payload.type === 'folder') {
      await patchFolder(payload.id, { parentId: destinationParentId })
      return
    }

    await patchFile(payload.id, { folderId: destinationParentId })
  }

  const removeByDragToTrash = async (payload: LibraryDragPayload) => {
    if (payload.type === 'folder') {
      await deleteFolder(payload.id)
      return
    }

    await deleteFile(payload.id)
  }

  const renameNode = async (node: LibraryTreeNode, name: string) => {
    if (node.type === 'folder') {
      await patchFolder(node.id, { name })
      return
    }

    await patchFile(node.id, { name })
  }

  const folderOptions = computed(() => {
    const options: Array<{ title: string; value: string | null }> = [
      { title: 'Root', value: null },
    ]

    const walk = (nodes: LibraryTreeNode[], depth = 0) => {
      for (const node of nodes) {
        if (node.type !== 'folder') {
          continue
        }

        options.push({
          title: `${'— '.repeat(depth)}${node.name}`,
          value: node.id,
        })

        walk(node.children, depth + 1)
      }
    }

    walk(tree.value)

    return options
  })

  return {
    tree,
    pending,
    folderOptions,
    fetchTree,
    createFolder,
    uploadFile,
    patchFolder,
    patchFile,
    deleteFolder,
    deleteFile,
    moveByDrag,
    removeByDragToTrash,
    renameNode,
  }
}
