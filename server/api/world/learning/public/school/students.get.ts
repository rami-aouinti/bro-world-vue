import { listSchoolStudents } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  const items = await listSchoolStudents(event)
  return { items }
})
