export type LibraryItemType = 'folder' | 'file'

export interface LibraryTreeNodeBase {
  id: string
  name: string
  type: LibraryItemType
}

export interface LibraryFileNode extends LibraryTreeNodeBase {
  type: 'file'
  fileType?: string
  mimeType?: string
  size?: number
  extension?: string
  url?: string
}

export interface LibraryFolderNode extends LibraryTreeNodeBase {
  type: 'folder'
  children: LibraryTreeNode[]
}

export type LibraryTreeNode = LibraryFolderNode | LibraryFileNode

export interface LibraryTreeResponse {
  children: LibraryTreeNode[]
}

export interface CreateFolderPayload {
  name: string
  parentId?: string | null
}

export interface CreateFolderResponse {
  id: string
  name: string
  parentId: string | null
}

export interface PatchFolderPayload {
  name?: string
  parentId?: string | null
}

export interface PatchFilePayload {
  name?: string
  folderId?: string | null
}

export interface UploadFileResponse {
  id: string
  folderId: string | null
  name: string
  url: string
  mimeType?: string
  size?: number
  extension?: string
  fileType?: string
}

export interface LibraryDragPayload {
  id: string
  type: LibraryItemType
  parentId: string | null
}
