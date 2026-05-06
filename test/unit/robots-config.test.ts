import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const nuxtConfig = readFileSync('nuxt.config.ts', 'utf8')
const staticRobots = readFileSync('public/_robots.txt', 'utf8')

describe('crawler access configuration', () => {
  it('does not block Google from fetching pages via robots directives', () => {
    expect(nuxtConfig).not.toMatch(/robots:\s*false/)
    expect(nuxtConfig).toContain('disallow: []')
    expect(staticRobots).not.toMatch(/^Disallow:/m)
  })

  it('keeps private and utility pages out of the sitemap without blocking crawl', () => {
    expect(nuxtConfig).toContain("'/resume/preview/**': { sitemap: false }")
    expect(nuxtConfig).toContain("'/admin/**': { sitemap: false }")
  })
})
