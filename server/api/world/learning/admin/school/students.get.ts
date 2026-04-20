import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { listSchoolStudents } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)
  const items = await listSchoolStudents(event)
  return { items }
})
