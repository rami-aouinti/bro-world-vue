import { mountSuspended } from '@nuxt/test-utils/runtime'
import { reactive, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const crmStore = reactive({
  items: [] as Array<Record<string, unknown>>,
  pending: false,
  error: null as string | null,
  fetchList: vi.fn(async () => undefined),
})

const jobsStore = reactive({
  policy: null,
  dashboard: null,
  pending: false,
  error: null as string | null,
  fetchAdminPolicy: vi.fn(async () => undefined),
  fetchAdminDashboard: vi.fn(async () => undefined),
  updateAdminPolicy: vi.fn(async () => undefined),
  updateRolePermission: vi.fn(async () => undefined),
})

const learningStore = reactive({
  items: [] as Array<Record<string, unknown>>,
  pending: false,
  error: null as string | null,
  progressByCourse: {} as Record<string, unknown[]>,
  detail: null,
  fetchCourses: vi.fn(async () => undefined),
  fetchProgress: vi.fn(async () => []),
  mutateCourses: vi.fn(async () => undefined),
})
const shopStore = reactive({
  items: [] as Array<Record<string, unknown>>,
  error: null as string | null,
  filters: {},
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  fetchProducts: vi.fn(async () => undefined),
  fetchProductById: vi.fn(async () => ({ product: null, similarProducts: [] })),
})

vi.mock('~/stores/worldCrm', () => ({
  useWorldCrmStore: () => crmStore,
}))

vi.mock('~/stores/worldJobs', () => ({
  useWorldJobsStore: () => jobsStore,
}))

vi.mock('~/stores/worldLearning', () => ({
  useWorldLearningStore: () => learningStore,
}))
vi.mock('~/stores/worldShop', () => ({
  useWorldShopStore: () => shopStore,
}))

vi.mock('~/composables/useCrmPermissions', () => ({
  useCrmPermissions: () => ({ can: () => true }),
}))

vi.stubGlobal('useI18n', () => ({
  t: (_key: string, fallback?: string) => fallback ?? '',
}))
vi.stubGlobal('useUserSession', () => ({ user: ref({ roles: ['ROLE_ROOT'] }) }))
vi.stubGlobal(
  'navigateTo',
  vi.fn(async () => undefined),
)

describe('world major pages states', () => {
  beforeEach(() => {
    crmStore.items = []
    crmStore.pending = false
    crmStore.error = null

    jobsStore.pending = false
    jobsStore.error = null
    jobsStore.dashboard = null
    jobsStore.policy = null

    learningStore.pending = false
    learningStore.error = null
    learningStore.items = []

    shopStore.items = []
    shopStore.error = null
    shopStore.fetchProducts = vi.fn(async () => undefined)
  })

  it('renders CRM projects loading/empty/error states', async () => {
    const component = (await import('~/pages/world/crm/projects.vue')).default

    crmStore.pending = true
    let wrapper = await mountSuspended(component)
    expect(wrapper.find('[data-testid="crm-projects-loading"]').exists()).toBe(
      true,
    )

    crmStore.pending = false
    crmStore.items = []
    wrapper = await mountSuspended(component)
    expect(wrapper.find('[data-testid="crm-projects-empty"]').exists()).toBe(
      true,
    )

    crmStore.error = 'CRM failure'
    wrapper = await mountSuspended(component)
    expect(wrapper.find('[data-testid="crm-projects-error"]').exists()).toBe(
      true,
    )
  })

  it('renders Jobs admin loading/empty/error states', async () => {
    const component = (await import('~/pages/world/jobs/admin.vue')).default

    jobsStore.pending = true
    let wrapper = await mountSuspended(component)
    expect(wrapper.find('[data-testid="jobs-admin-loading"]').exists()).toBe(
      true,
    )

    jobsStore.pending = false
    jobsStore.dashboard = null
    wrapper = await mountSuspended(component)
    expect(wrapper.find('[data-testid="jobs-admin-empty"]').exists()).toBe(true)

    jobsStore.error = 'HR failure'
    wrapper = await mountSuspended(component)
    expect(wrapper.find('[data-testid="jobs-admin-error"]').exists()).toBe(true)
  })

  it('renders Learning courses loading/empty/error states', async () => {
    const component = (await import('~/pages/world/learning/courses.vue'))
      .default

    learningStore.pending = true
    let wrapper = await mountSuspended(component)
    expect(
      wrapper.find('[data-testid="learning-courses-loading"]').exists(),
    ).toBe(true)

    learningStore.pending = false
    learningStore.items = []
    wrapper = await mountSuspended(component)
    expect(
      wrapper.find('[data-testid="learning-courses-empty"]').exists(),
    ).toBe(true)

    learningStore.error = 'LMS failure'
    wrapper = await mountSuspended(component)
    expect(
      wrapper.find('[data-testid="learning-courses-error"]').exists(),
    ).toBe(true)
  })

  it('renders Shop products error and empty states', async () => {
    const component = (await import('~/pages/world/shop/products/index.vue'))
      .default

    let wrapper = await mountSuspended(component)
    expect(wrapper.find('[data-testid="shop-products-empty"]').exists()).toBe(
      true,
    )

    shopStore.error = 'Shop failure'
    wrapper = await mountSuspended(component)
    expect(wrapper.find('[data-testid="shop-products-error"]').exists()).toBe(
      true,
    )
  })
})
