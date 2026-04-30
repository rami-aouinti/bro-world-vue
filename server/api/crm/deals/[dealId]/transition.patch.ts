import type {
  CrmPipelineApiResponse,
  CrmTransitionApiPayload,
} from '../../../../types/api/crm'
import {
  getCrmPipelineSnapshot,
  transitionCrmDeal,
} from '../../../../utils/crmPipelineStore'
import { requireCrmPermission } from '../../../../utils/crmAccessControl'

const VALID_STAGES = new Set([
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'closed',
  'won_lost',
])

function normalizeStage(stage: string) {
  return stage === 'won_lost' ? 'closed' : stage
}

function isIsoDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(value).getTime())
  )
}

export default defineEventHandler(
  async (event): Promise<CrmPipelineApiResponse> => {
    await requireCrmPermission(event, 'crm.opportunities.edit')

    const dealId = getRouterParam(event, 'dealId')

    if (!dealId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing deal id' })
    }

    const body = await readBody<CrmTransitionApiPayload>(event)
    const probability = Number(body.probability)
    const toStage = normalizeStage(String(body.toStage))

    if (
      !VALID_STAGES.has(String(body.toStage)) ||
      !isIsoDate(body.expectedCloseDate)
    ) {
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
      toStage: toStage as CrmTransitionApiPayload['toStage'],
      probability,
    })

    if (!transitionedDeal) {
      throw createError({ statusCode: 404, statusMessage: 'Deal not found' })
    }

    return getCrmPipelineSnapshot()
  },
)
