import { mutatingPrivateApiCall } from '../../../utils/privateApi'

export default defineEventHandler(async (event) => {
  const file = getRouterParam(event, 'file')

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Missing file id' })
  }

  return mutatingPrivateApiCall(event, `/library/files/${file}`, {
    method: 'DELETE',
    mutationKey: 'library:files:mutate',
  })
})
