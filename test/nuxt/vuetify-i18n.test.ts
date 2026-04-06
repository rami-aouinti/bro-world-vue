import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

const BadgeHost = defineComponent({
  template: `
    <v-badge :content="3">
      <span>demo</span>
    </v-badge>
  `,
})

describe('vuetify i18n messages', () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

  afterEach(() => {
    warnSpy.mockClear()
  })

  it("doesn't emit missing $vuetify translation warnings for v-badge", async () => {
    await mountSuspended(BadgeHost)

    const intlifyMissingWarnings = warnSpy.mock.calls.filter(([message]) =>
      String(message).includes("[intlify] Not found '$vuetify.badge'"),
    )

    expect(intlifyMissingWarnings).toHaveLength(0)
  })
})
