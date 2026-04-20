import { listSchoolClasses } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  const items = await listSchoolClasses(event)
  return { items }
})
