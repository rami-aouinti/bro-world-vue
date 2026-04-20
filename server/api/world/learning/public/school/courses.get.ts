import { listSchoolCourses } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  const items = await listSchoolCourses(event)
  return { items }
})
