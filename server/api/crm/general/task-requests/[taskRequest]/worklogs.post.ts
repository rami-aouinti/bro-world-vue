import { getRouterParam, readBody } from 'h3'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event) => {
  const taskRequest = getRouterParam(event, 'taskRequest')

  if (!taskRequest) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task request id' })
  }

  const body = await readBody<Record<string, unknown>>(event)

  return mutateCrmGeneral<Record<string, unknown>>(event, `task-requests/${taskRequest}/worklogs`, {
    method: 'POST',
    body,
  })
})
