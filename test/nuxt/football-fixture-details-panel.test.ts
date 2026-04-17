import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FixtureDetailsPanel from '~/components/Sports/Football/FixtureDetailsPanel.vue'

vi.stubGlobal('visualViewport', new EventTarget())

describe('component FixtureDetailsPanel.vue', () => {
  it('renders with a minimal fixture payload (smoke)', async () => {
    const wrapper = await mountSuspended(FixtureDetailsPanel, {
      props: {
        mode: 'single',
        initialTab: 'statistics',
        events: [],
        lineups: [],
        playerStats: [],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toContain('Shots total')
  })
})
