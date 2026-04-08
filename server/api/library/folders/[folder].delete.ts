import { mutatingPrivateApiCall } from '../../../utils/privateApi'

export default defineEventHandler(async (event) => {
  const folder = getRouterParam(event, 'folder')

  if (!folder) {
    throw createError({ statusCode: 400, statusMessage: 'Missing folder id' })
  }

  return mutatingPrivateApiCall(event, `/library/folders/${folder}`, {
    method: 'DELETE',
    mutationKey: 'library:folders:mutate',
  })
})
