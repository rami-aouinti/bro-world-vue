import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWorldCrmStore } from '~/stores/worldCrm'
import { useWorldJobsStore } from '~/stores/worldJobs'
import { useWorldLearningStore } from '~/stores/worldLearning'
import { useWorldShopStore } from '~/stores/worldShop'
import {
  getStoreTelemetrySnapshot,
  resetStoreTelemetry,
} from '~/utils/storeTelemetry'

const fetchMock = vi.fn()

vi.stubGlobal('$fetch', fetchMock)

describe('world stores caching / errors / invalidation telemetry', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({})
    resetStoreTelemetry()
  })

  it('tracks CRM cache miss + cache hit and invalidation after transition', async () => {
    const store = useWorldCrmStore()
    fetchMock.mockResolvedValueOnce({
      items: [{ id: 'P-1', project: 'Migration' }],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    })

    await store.fetchList('projects')
    await store.fetchList('projects')

    expect(fetchMock).toHaveBeenCalledTimes(1)

    fetchMock.mockResolvedValueOnce({ items: [] })
    await store.transitionDeal('deal-1', { toStage: 'qualified' })

    fetchMock.mockResolvedValueOnce({
      items: [{ id: 'P-2', project: 'Expansion' }],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    })
    await store.fetchList('projects')

    expect(fetchMock).toHaveBeenCalledTimes(3)

    const telemetry = getStoreTelemetrySnapshot()
    expect(telemetry.crm.cacheHits).toBe(1)
    expect(telemetry.crm.cacheMisses).toBe(2)
  })

  it('tracks Jobs API error telemetry and cache miss', async () => {
    const store = useWorldJobsStore()
    fetchMock.mockRejectedValueOnce(new Error('jobs down'))

    await expect(store.fetchAdminPolicy()).rejects.toThrow('jobs down')

    const telemetry = getStoreTelemetrySnapshot()
    expect(telemetry.jobs.apiErrors).toBe(1)
    expect(telemetry.jobs.cacheMisses).toBe(1)
  })

  it('tracks Learning cache hit/miss and invalidates analytics on progress update', async () => {
    const store = useWorldLearningStore()
    fetchMock.mockResolvedValueOnce({
      items: [{ id: 'course-1', title: 'Vue' }],
    })
    await store.fetchCourses()
    await store.fetchCourses()

    fetchMock.mockResolvedValueOnce({
      items: [{ learner: 'Alice', score: 99, certificate: true }],
    })
    await store.upsertProgress('course-1', {
      learner: 'Alice',
      lessonId: 'lesson-1',
      status: 'completed',
    })

    fetchMock.mockResolvedValueOnce({
      items: { totalLearners: 1, completionRate: 90, dropoutRate: 3 },
    })
    await store.fetchAnalytics()

    const telemetry = getStoreTelemetrySnapshot()
    expect(telemetry.learning.cacheHits).toBe(1)
    expect(telemetry.learning.cacheMisses).toBeGreaterThanOrEqual(2)
  })

  it('tracks Shop success/error with cache hit/miss', async () => {
    const store = useWorldShopStore()
    fetchMock.mockResolvedValueOnce({
      data: [{ id: 'sku-1', name: 'Hoodie', amount: 20, currencyCode: 'EUR' }],
      total: 1,
      meta: {
        pagination: { page: 1, limit: 20, totalItems: 1, totalPages: 1 },
      },
    })

    await store.fetchProducts()
    await store.fetchProducts()

    fetchMock.mockRejectedValue(new Error('shop offline'))
    await expect(store.fetchCategories({ force: true })).rejects.toThrow(
      'shop offline',
    )

    const telemetry = getStoreTelemetrySnapshot()
    expect(telemetry.shop.cacheHits).toBe(1)
    expect(telemetry.shop.cacheMisses).toBe(2)
    expect(telemetry.shop.apiErrors).toBe(3)
  })
})
