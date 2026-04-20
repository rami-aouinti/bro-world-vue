import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { listSchoolExams } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)
  const items = await listSchoolExams(event)
  return { items }
})
