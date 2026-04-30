import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event) => {
  const taskRequest = getRouterParam(event, 'taskRequest')
  const branchId = getRouterParam(event, 'branchId')

  if (!taskRequest || !branchId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing task request id or branch id',
    })
  }

  await mutateCrmGeneral(
    event,
    `task-requests/${taskRequest}/github/branches/${branchId}`,
    {
      method: 'DELETE',
    },
  )

  return { success: true }
})
