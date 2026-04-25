import { getCrmGitlabSyncContext } from '~~/server/utils/crmGitlabGeneralApi'

export default defineEventHandler(async (event) => {
  return (await getCrmGitlabSyncContext(event)) ?? null
})
