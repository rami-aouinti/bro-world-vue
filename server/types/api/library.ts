import type { ApiObject } from './common'

export interface LibraryApiTreeResponse extends ApiObject {
  children: ApiObject[]
}

export interface LibraryApiFolderMutationPayload extends ApiObject {
  name?: string
  parentId?: string | null
}

export interface LibraryApiFileMutationPayload extends ApiObject {
  name?: string
  folderId?: string | null
}
