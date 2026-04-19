import { getCrmGithubSyncContext } from '~~/server/utils/crmGithubGeneralApi'

export default defineEventHandler(async (event) => {
  return (await getCrmGithubSyncContext(event)) ?? null
})
