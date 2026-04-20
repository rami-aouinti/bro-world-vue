import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { createSchoolClass } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)
  const body = await readBody<{ name?: string; schoolId?: string }>(event)

  const name = body?.name?.trim()
  const schoolId = body?.schoolId?.trim()

  if (!name || !schoolId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'name and schoolId are required',
    })
  }

  const item = await createSchoolClass(event, { name, schoolId })
  return { item }
})
