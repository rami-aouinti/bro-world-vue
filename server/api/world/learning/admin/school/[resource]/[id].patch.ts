import { createError } from 'h3'
import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { updateSchoolResource } from '~~/server/utils/learningPublicSchool'

const editableResources = new Set([
  'classes',
  'courses',
  'teachers',
  'students',
  'exams',
  'grades',
])

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)

  const resource = getRouterParam(event, 'resource')
  const id = getRouterParam(event, 'id')

  if (!resource || !editableResources.has(resource)) {
    throw createError({ statusCode: 404, statusMessage: 'Resource not found' })
  }

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing item id' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one field is required',
    })
  }

  const item = await updateSchoolResource(event, resource, id, body)
  return { item }
})
