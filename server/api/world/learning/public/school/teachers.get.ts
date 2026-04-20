import { listSchoolTeachers } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  const items = await listSchoolTeachers(event)
  return { items }
})
