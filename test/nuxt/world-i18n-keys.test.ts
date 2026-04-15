import { describe, expect, it } from 'vitest'
import de from '../../i18n/locales/de.json'
import en from '../../i18n/locales/en.json'
import es from '../../i18n/locales/es.json'
import fr from '../../i18n/locales/fr.json'

const locales = { en, fr, es, de }

const criticalKeys = [
  'world.crm.nav.overview',
  'world.shop.nav.overview',
  'world.shop.actions.publishProduct',
  'world.learning.nav.overview',
  'world.learning.home.title',
  'world.jobs.nav.overview',
  'world.jobs.pipeline.title',
  'world.common.quickChecks.title',
  'world.common.actions.saveRecord',
]

function getByPath(object: Record<string, any>, path: string) {
  return path
    .split('.')
    .reduce<any>((acc, key) => (acc == null ? undefined : acc[key]), object)
}

describe('world i18n critical keys', () => {
  for (const [localeName, messages] of Object.entries(locales)) {
    it(`contains critical world keys in ${localeName}`, () => {
      for (const key of criticalKeys) {
        expect(
          getByPath(messages as Record<string, any>, key),
          `missing key ${key}`,
        ).toBeTruthy()
      }
    })
  }
})
