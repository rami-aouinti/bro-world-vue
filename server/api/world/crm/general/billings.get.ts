import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

const emptyBillingsResponse: {
  items: unknown[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
  meta: {
    filters: unknown[]
  }
} = {
  items: [],
  pagination: {
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 0,
  },
  meta: {
    filters: [],
  },
}

export default defineEventHandler(async (event): Promise<unknown> => {
  try {
    return await fetchCrmGeneral(event, 'billings')
  } catch {
    return emptyBillingsResponse
  }
})
