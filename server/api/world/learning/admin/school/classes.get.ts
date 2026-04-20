import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { listSchoolClasses } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)
  const items = await listSchoolClasses(event)
  return { items }
})
