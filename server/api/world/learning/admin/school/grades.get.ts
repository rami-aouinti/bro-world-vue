import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { listSchoolGrades } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)
  const items = await listSchoolGrades(event)
  return { items }
})
