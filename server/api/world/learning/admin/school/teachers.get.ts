import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { listSchoolTeachers } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)
  const items = await listSchoolTeachers(event)
  return { items }
})
