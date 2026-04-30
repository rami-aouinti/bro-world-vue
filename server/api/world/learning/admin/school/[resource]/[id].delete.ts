import { createError } from 'h3'
import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { deleteSchoolResource } from '~~/server/utils/learningPublicSchool'

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

  await deleteSchoolResource(event, resource, id)
  return { success: true }
})
