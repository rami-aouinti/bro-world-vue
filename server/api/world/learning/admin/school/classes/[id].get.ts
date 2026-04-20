import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { getSchoolClassById } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing class id' })
  }

  const item = await getSchoolClassById(event, id)
  return { item }
})
