import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { updateSchoolClass } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing class id' })
  }

  const body = await readBody<{ name?: string; schoolId?: string }>(event)
  const payload: { name?: string; schoolId?: string } = {}

  if (typeof body?.name === 'string' && body.name.trim().length > 0) {
    payload.name = body.name.trim()
  }

  if (typeof body?.schoolId === 'string' && body.schoolId.trim().length > 0) {
    payload.schoolId = body.schoolId.trim()
  }

  if (!payload.name && !payload.schoolId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one field is required',
    })
  }

  const item = await updateSchoolClass(event, id, payload)
  return { item }
})
