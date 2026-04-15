import type {
  CrmPipelineApiResponse,
  CrmTransitionApiPayload,
} from '../../../../types/api/crm'
import {
  getCrmPipelineSnapshot,
  transitionCrmDeal,
} from '../../../../utils/crmPipelineStore'

const VALID_STAGES = new Set([
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'won_lost',
])

function isIsoDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(value).getTime())
  )
}

export default defineEventHandler(
  async (event): Promise<CrmPipelineApiResponse> => {
    const dealId = getRouterParam(event, 'dealId')

    if (!dealId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing deal id' })
    }

    const body = await readBody<CrmTransitionApiPayload>(event)
    const probability = Number(body.probability)

    if (!VALID_STAGES.has(body.toStage) || !isIsoDate(body.expectedCloseDate)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid transition payload',
      })
    }

    if (Number.isNaN(probability) || probability < 0 || probability > 100) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Probability must be between 0 and 100',
      })
    }

    const transitionedDeal = transitionCrmDeal(dealId, {
      ...body,
      probability,
    })

    if (!transitionedDeal) {
      throw createError({ statusCode: 404, statusMessage: 'Deal not found' })
    }

    return getCrmPipelineSnapshot()
  },
)
