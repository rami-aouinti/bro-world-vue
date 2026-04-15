import type { JobsAdminDashboardResponse } from '~~/server/types/api/jobs'
import { listCandidatesByContext } from '~~/server/utils/jobsPipelineStore'
import type { SessionUser } from '~/types/session'

export default defineEventHandler(
  async (event): Promise<JobsAdminDashboardResponse> => {
    await requireUserSession(event)

    const session = await getUserSession(event)
    const user = (session?.user as SessionUser | null) ?? null

    if (
      !(
        user?.roles?.includes('ROLE_ROOT') ||
        user?.roles?.includes('ROLE_ADMIN') ||
        user?.roles?.includes('ROLE_HR_ADMIN')
      )
    ) {
      throw createError({ statusCode: 403, statusMessage: 'Access denied' })
    }

    const { items } = listCandidatesByContext(undefined, {
      role: 'admin',
    })

    const hired = items.filter(
      (candidate) => candidate.currentStage === 'Hired',
    )
    const offered = items.filter(
      (candidate) =>
        candidate.currentStage === 'Offer' ||
        candidate.currentStage === 'Hired',
    )
    const accepted = hired.length
    const declined = Math.max(offered.length - accepted, 0)

    const stageCycleDays = hired.map((candidate) => {
      const created = new Date(candidate.createdAt).getTime()
      const updated = new Date(candidate.updatedAt).getTime()
      const diff = Math.max(updated - created, 0)
      return Math.max(Math.round(diff / (1000 * 60 * 60 * 24)), 1)
    })

    const average = stageCycleDays.length
      ? Math.round(
          stageCycleDays.reduce((sum, value) => sum + value, 0) /
            stageCycleDays.length,
        )
      : 0

    const sortedDays = [...stageCycleDays].sort((a, b) => a - b)
    const median = sortedDays.length
      ? (sortedDays[Math.floor(sortedDays.length / 2)] ?? 0)
      : 0

    const sourceMap = new Map<string, number>()
    for (const candidate of items) {
      sourceMap.set(
        candidate.source,
        (sourceMap.get(candidate.source) ?? 0) + 1,
      )
    }

    const candidateSources = Array.from(sourceMap.entries()).map(
      ([source, count]) => ({
        source:
          source as JobsAdminDashboardResponse['candidateSources'][number]['source'],
        count,
        ratio: items.length
          ? Number(((count / items.length) * 100).toFixed(1))
          : 0,
      }),
    )

    const diversityCandidates = items.filter(
      (candidate) => candidate.diversityFlags.length > 0,
    ).length

    return {
      timeToHireDays: {
        average,
        median,
        target: 30,
      },
      candidateSources,
      offerAcceptanceRate: {
        accepted,
        declined,
        rate: offered.length
          ? Number(((accepted / offered.length) * 100).toFixed(1))
          : 0,
      },
      diversityPipeline: {
        totalCandidates: items.length,
        selfIdentified: diversityCandidates,
        ratio: items.length
          ? Number(((diversityCandidates / items.length) * 100).toFixed(1))
          : 0,
      },
    }
  },
)
