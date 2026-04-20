import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { listSchoolCourses } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)
  const items = await listSchoolCourses(event)
  return { items }
})
