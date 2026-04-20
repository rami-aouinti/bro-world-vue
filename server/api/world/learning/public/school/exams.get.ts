import { listSchoolExams } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  const items = await listSchoolExams(event)
  return { items }
})
