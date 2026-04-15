import type {
  CrmProject,
  CrmProjectPhase,
  CrmProjectsApiResponse,
  CrmProjectsListQuery,
  SortOrder,
} from '~~/server/types/api/crm'

const PROJECTS: CrmProject[] = [
  { id: 'P-104', project: 'Migration B2B', manager: 'S. Ali', phase: 'Build', progress: '62%' },
  { id: 'P-108', project: 'Referral Automation', manager: 'E. Stone', phase: 'QA', progress: '81%' },
  { id: 'P-113', project: 'Contract Workspace', manager: 'J. Reid', phase: 'Design', progress: '29%' },
  { id: 'P-117', project: 'Renewal Tracking', manager: 'S. Ali', phase: 'Build', progress: '44%' },
  { id: 'P-120', project: 'Lead Scoring v2', manager: 'E. Stone', phase: 'QA', progress: '72%' },
]

const ALLOWED_SORT_FIELDS = ['id', 'project', 'manager', 'phase', 'progress'] as const

const normalizeSortOrder = (value: unknown): SortOrder => (value === 'desc' ? 'desc' : 'asc')

const normalizePhase = (value: unknown): CrmProjectPhase | undefined => {
  if (value === 'Build' || value === 'QA' || value === 'Design') {
    return value
  }

  return undefined
}

export default defineEventHandler((event): CrmProjectsApiResponse => {
  const query = getQuery(event) as CrmProjectsListQuery
  const page = Math.max(1, Number(query.page ?? 1) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10) || 10))
  const sortBy: string = ALLOWED_SORT_FIELDS.includes(query.sortBy as typeof ALLOWED_SORT_FIELDS[number])
    ? String(query.sortBy)
    : 'id'
  const sortOrder = normalizeSortOrder(query.sortOrder)
  const phase = normalizePhase(query.phase)
  const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : ''
  const manager = typeof query.manager === 'string' ? query.manager.trim().toLowerCase() : ''

  const filtered = PROJECTS.filter((project) => {
    const matchesSearch = search.length === 0
      || project.id.toLowerCase().includes(search)
      || project.project.toLowerCase().includes(search)
      || project.manager.toLowerCase().includes(search)
    const matchesPhase = !phase || project.phase === phase
    const matchesManager = manager.length === 0 || project.manager.toLowerCase().includes(manager)

    return matchesSearch && matchesPhase && matchesManager
  })

  const sorted = [...filtered].sort((a, b) => {
    const left = String(a[sortBy as keyof CrmProject]).toLowerCase()
    const right = String(b[sortBy as keyof CrmProject]).toLowerCase()
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
      ...(phase ? { phase } : {}),
      ...(manager ? { manager: query.manager } : {}),
    },
  }
})
