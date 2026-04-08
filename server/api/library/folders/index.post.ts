import type { LibraryApiFolderMutationPayload } from '../../../types/api/library'
import { mutatingPrivateApiCall } from '../../../utils/privateApi'

export default defineEventHandler(async (event) => {
  const body = await readBody<LibraryApiFolderMutationPayload>(event)

  return mutatingPrivateApiCall(event, '/library/folders', {
    method: 'POST',
    body,
    mutationKey: 'library:folders:mutate',
  })
})
