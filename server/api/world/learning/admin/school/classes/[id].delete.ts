import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { deleteSchoolClass } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing class id' })
  }

  await deleteSchoolClass(event, id)
  return { success: true }
})
