import { listSchoolGrades } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  const items = await listSchoolGrades(event)
  return { items }
})
