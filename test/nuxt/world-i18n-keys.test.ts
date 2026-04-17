import { describe, expect, it } from 'vitest'
import de from '../../i18n/locales/de.json'
import en from '../../i18n/locales/en.json'
import es from '../../i18n/locales/es.json'
import fr from '../../i18n/locales/fr.json'

const locales = { en, fr, es, de }

const criticalKeys = [
  // world common
  'world.common.quickChecks.title',
  'world.common.actions.saveRecord',

  // CRM
  'world.crm.label',
  'world.crm.nav.overview',
  'world.crm.nav.admin',
  'world.crm.actions.createLead',
  'world.crm.projects.moduleDescription',

  // Shop
  'world.shop.label',
  'world.shop.nav.overview',
  'world.shop.nav.admin',
  'world.shop.actions.publishProduct',
  'world.shop.home.title',
  'world.shop.orders.title',

  // Jobs
  'world.jobs.label',
  'world.jobs.nav.overview',
  'world.jobs.nav.admin',
  'world.jobs.home.title',
  'world.jobs.pipeline.title',
  'world.jobs.actions.publishOffer',
  'world.jobs.offers.total',

  // Learning
  'world.learning.nav.overview',
  'world.learning.home.title',
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
