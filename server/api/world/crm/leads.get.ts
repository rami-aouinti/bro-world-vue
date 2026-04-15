import type {
  CrmLead,
  CrmLeadStatus,
  CrmLeadsApiResponse,
  CrmLeadsListQuery,
  SortOrder,
} from '~~/server/types/api/crm'

const LEADS: CrmLead[] = [
  { id: 'CRM-001', project: 'Neon Replatform', owner: 'A. Martin', status: 'In progress', budget: '$84,000' },
  { id: 'CRM-002', project: 'Enterprise Onboarding', owner: 'L. Diaz', status: 'Blocked', budget: '$46,500' },
  { id: 'CRM-003', project: 'Partner Success', owner: 'S. Ahmed', status: 'Review', budget: '$22,700' },
  { id: 'CRM-004', project: 'Procurement Renewal', owner: 'M. Chen', status: 'In progress', budget: '$18,300' },
  { id: 'CRM-005', project: 'SMB Expansion', owner: 'L. Diaz', status: 'Review', budget: '$12,000' },
]

const ALLOWED_SORT_FIELDS = ['id', 'project', 'owner', 'status', 'budget'] as const

const normalizeSortOrder = (value: unknown): SortOrder => (value === 'desc' ? 'desc' : 'asc')

const normalizeStatus = (value: unknown): CrmLeadStatus | undefined => {
  if (value === 'In progress' || value === 'Blocked' || value === 'Review') {
    return value
  }

  return undefined
}

export default defineEventHandler((event): CrmLeadsApiResponse => {
  const query = getQuery(event) as CrmLeadsListQuery
  const page = Math.max(1, Number(query.page ?? 1) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10) || 10))
  const sortBy: string = ALLOWED_SORT_FIELDS.includes(query.sortBy as typeof ALLOWED_SORT_FIELDS[number])
    ? String(query.sortBy)
    : 'id'
  const sortOrder = normalizeSortOrder(query.sortOrder)
  const status = normalizeStatus(query.status)
  const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : ''
  const owner = typeof query.owner === 'string' ? query.owner.trim().toLowerCase() : ''

  const filtered = LEADS.filter((lead) => {
    const matchesSearch = search.length === 0
      || lead.id.toLowerCase().includes(search)
      || lead.project.toLowerCase().includes(search)
      || lead.owner.toLowerCase().includes(search)
    const matchesStatus = !status || lead.status === status
    const matchesOwner = owner.length === 0 || lead.owner.toLowerCase().includes(owner)

    return matchesSearch && matchesStatus && matchesOwner
  })

  const sorted = [...filtered].sort((a, b) => {
    const left = String(a[sortBy as keyof CrmLead]).toLowerCase()
    const right = String(b[sortBy as keyof CrmLead]).toLowerCase()
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
      ...(status ? { status } : {}),
      ...(owner ? { owner: query.owner } : {}),
    },
  }
})
