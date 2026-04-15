import type {
  CrmCompaniesApiResponse,
  CrmCompaniesListQuery,
  CrmCompany,
  CrmCompanyHealth,
  SortOrder,
} from '~~/server/types/api/crm'
import { requireCrmPermission } from '~~/server/utils/crmAccessControl'

const COMPANIES: CrmCompany[] = [
  { id: 'C-3001', company: 'Atlas Dynamics', industry: 'Fintech', owner: 'N. Park', health: 'Great' },
  { id: 'C-3002', company: 'Blue Harbor', industry: 'Retail', owner: 'M. Costa', health: 'At risk' },
  { id: 'C-3003', company: 'Kite Labs', industry: 'Education', owner: 'R. Silva', health: 'Stable' },
  { id: 'C-3004', company: 'Sunset Works', industry: 'Fintech', owner: 'M. Costa', health: 'Great' },
  { id: 'C-3005', company: 'Open Atlas', industry: 'Retail', owner: 'N. Park', health: 'Stable' },
]

const ALLOWED_SORT_FIELDS = ['id', 'company', 'industry', 'owner', 'health'] as const

const normalizeSortOrder = (value: unknown): SortOrder => (value === 'desc' ? 'desc' : 'asc')

const normalizeHealth = (value: unknown): CrmCompanyHealth | undefined => {
  if (value === 'Great' || value === 'At risk' || value === 'Stable') {
    return value
  }

  return undefined
}

export default defineEventHandler(async (event): Promise<CrmCompaniesApiResponse> => {
  await requireCrmPermission(event, 'crm.accounts.read')

  const query = getQuery(event) as CrmCompaniesListQuery
  const page = Math.max(1, Number(query.page ?? 1) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10) || 10))
  const sortBy: string = ALLOWED_SORT_FIELDS.includes(query.sortBy as typeof ALLOWED_SORT_FIELDS[number])
    ? String(query.sortBy)
    : 'id'
  const sortOrder = normalizeSortOrder(query.sortOrder)
  const health = normalizeHealth(query.health)
  const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : ''
  const industry = typeof query.industry === 'string' ? query.industry.trim().toLowerCase() : ''

  const filtered = COMPANIES.filter((company) => {
    const matchesSearch = search.length === 0
      || company.id.toLowerCase().includes(search)
      || company.company.toLowerCase().includes(search)
      || company.owner.toLowerCase().includes(search)
    const matchesHealth = !health || company.health === health
    const matchesIndustry = industry.length === 0 || company.industry.toLowerCase().includes(industry)

    return matchesSearch && matchesHealth && matchesIndustry
  })

  const sorted = [...filtered].sort((a, b) => {
    const left = String(a[sortBy as keyof CrmCompany]).toLowerCase()
    const right = String(b[sortBy as keyof CrmCompany]).toLowerCase()
    const compared = left.localeCompare(right, undefined, { numeric: true })

    return sortOrder === 'asc' ? compared : -compared
  })

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit

  return {
    items: sorted.slice(start, start + limit),
    page,
    limit,
    total,
    totalPages,
    sortBy,
    sortOrder,
    filters: {
      ...(search ? { search: query.search } : {}),
      ...(industry ? { industry: query.industry } : {}),
      ...(health ? { health } : {}),
    },
  }
})
