import type { CrmPipelineApiResponse, CrmTransitionApiPayload } from '../../../../types/api/crm'
import { getCrmPipelineSnapshot, transitionCrmDeal } from '../../../../utils/crmPipelineStore'
import { requireCrmPermission } from '../../../../utils/crmAccessControl'

const VALID_STAGES = new Set(['lead', 'qualified', 'proposal', 'negotiation', 'closed'])

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime())
}

export default defineEventHandler(
  async (event): Promise<CrmPipelineApiResponse> => {
    await requireCrmPermission(event, 'crm.opportunities.edit')

    const opportunityId = getRouterParam(event, 'opportunityId')

    if (!opportunityId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing opportunity id' })
    }

    const body = await readBody<CrmTransitionApiPayload>(event)
    const probability = Number(body.probability)

    if (!VALID_STAGES.has(body.toStage) || !isIsoDate(body.expectedCloseDate)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid transition payload' })
    }

    if (Number.isNaN(probability) || probability < 0 || probability > 100) {
      throw createError({ statusCode: 400, statusMessage: 'Probability must be between 0 and 100' })
    }

    const transitionedDeal = transitionCrmDeal(opportunityId, { ...body, probability })

    if (!transitionedDeal) {
      throw createError({ statusCode: 404, statusMessage: 'Opportunity not found' })
    }

    return getCrmPipelineSnapshot()
  },
)
