import type { LibraryApiFolderMutationPayload } from '../../../types/api/library'
import { mutatingPrivateApiCall } from '../../../utils/privateApi'

export default defineEventHandler(async (event) => {
  const folder = getRouterParam(event, 'folder')

  if (!folder) {
    throw createError({ statusCode: 400, statusMessage: 'Missing folder id' })
  }

  const body = await readBody<LibraryApiFolderMutationPayload>(event)

  return mutatingPrivateApiCall(event, `/library/folders/${folder}`, {
    method: 'PATCH',
    body,
    mutationKey: 'library:folders:mutate',
  })
})
