import { mutatingPrivateApiCall } from '../../../utils/privateApi'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)

  return mutatingPrivateApiCall(event, '/library/files/upload', {
    method: 'POST',
    body: formData,
    mutationKey: 'library:files:mutate',
  })
})
