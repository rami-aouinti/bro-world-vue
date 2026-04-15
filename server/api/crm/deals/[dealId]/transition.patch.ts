import type { CrmPipelineApiResponse, CrmTransitionApiPayload } from '../../../../types/api/crm'
import { getCrmPipelineSnapshot, transitionCrmDeal } from '../../../../utils/crmPipelineStore'

export default defineEventHandler(async (event): Promise<CrmPipelineApiResponse> => {
  const dealId = getRouterParam(event, 'dealId')

  if (!dealId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing deal id' })
  }

  const body = await readBody<CrmTransitionApiPayload>(event)

  if (!body.toStage || !body.expectedCloseDate) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transition payload' })
  }

  const transitionedDeal = transitionCrmDeal(dealId, body)

  if (!transitionedDeal) {
    throw createError({ statusCode: 404, statusMessage: 'Deal not found' })
  }

  return getCrmPipelineSnapshot()
})
