import { createError } from 'h3'
import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { createSchoolResource } from '~~/server/utils/learningPublicSchool'

const editableResources = new Set(['classes', 'teachers', 'students', 'exams', 'grades'])

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)

  const resource = getRouterParam(event, 'resource')
  if (!resource || !editableResources.has(resource)) {
    throw createError({ statusCode: 404, statusMessage: 'Resource not found' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Request body is required' })
  }

  const item = await createSchoolResource(event, resource, body)
  return { item }
})
