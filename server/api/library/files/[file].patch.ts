import type { LibraryApiFileMutationPayload } from '../../../types/api/library'
import { mutatingPrivateApiCall } from '../../../utils/privateApi'

export default defineEventHandler(async (event) => {
  const file = getRouterParam(event, 'file')

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Missing file id' })
  }

  const body = await readBody<LibraryApiFileMutationPayload>(event)

  return mutatingPrivateApiCall(event, `/library/files/${file}`, {
    method: 'PATCH',
    body,
    mutationKey: 'library:files:mutate',
  })
})
