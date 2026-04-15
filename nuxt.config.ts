import { aliases } from 'vuetify/iconsets/mdi'
import { defineNuxtConfig } from 'nuxt/config'

const shouldSplitCss = process.env.NUXT_CSS_CODE_SPLIT === 'true'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  app: {
    head: {
      title: 'Bro World Space',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Jobs, social network, AI tools and more.' },
        {
          name: 'google-site-verification',
          content: process.env.GOOGLE_KEY_INDEX || ''
        }
      ],
      link: [
        { rel: 'canonical', href: 'https://bro-world-space.com' }
      ]
    }
  },
  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'vuetify-nuxt-module',
    'nuxt-auth-utils',
    'nuxt-echarts',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-schema-org'
  ],
  sitemap: {
    siteUrl: 'https://bro-world-space.com',
    sources: ['/api/__sitemap__/urls']
  },
  robots: {
    UserAgent: '*',
    Allow: '/',
    Disallow: ['/admin', '/dashboard'],
    Sitemap: 'https://bro-world-space.com/sitemap.xml'
  },
  css: [
    'vuetify/styles',
    '~/assets/styles/material-dashboard.scss',
    '~/assets/styles/index.css',
  ],
  experimental: { typedPages: true },
  typescript: {
    shim: false,
    strict: true,
    tsConfig: {
      include: ['../test/**/*.ts'],
    },
  },
  vue: { propsDestructure: true },
  vueuse: { ssrHandlers: true },
  vuetify: {
    moduleOptions: {
      ssrClientHints: {
        viewportSize: true,
        prefersColorScheme: true,
        prefersColorSchemeOptions: {},
        reloadOnFirstRequest: true,
      },
    },
  },
  icon: {
    clientBundle: {
      icons: Object.values(aliases).map((v) =>
        (v as string).replace(/^mdi-/, 'mdi:'),
      ),
      scan: true,
    },
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons',
      },
    ],
  },
  echarts: {
    charts: ['LineChart', 'BarChart', 'PieChart', 'RadarChart'],
    renderer: 'svg',
    components: [
      'DataZoomComponent',
      'LegendComponent',
      'TooltipComponent',
      'ToolboxComponent',
      'GridComponent',
      'TitleComponent',
      'DatasetComponent',
      'VisualMapComponent',
    ],
  },
  vite: {
    build: {
      sourcemap: false,
      // Test strategy: default to a single CSS bundle to reduce many small render-blocking requests.
      // Set NUXT_CSS_CODE_SPLIT=true to re-enable chunked CSS.
      cssCodeSplit: shouldSplitCss,
    },
  },
  runtimeConfig: {
    redis: {
      url: '',
    },
    public: {
      apiBaseUrl: 'https://bro-world.org/api/v1',
    },
    github: {
      clientId: '',
      clientSecret: '',
    },
    session: {
      name: 'nuxt-session',
      password: '',
    },
    aiGatewayApiKey: process.env.AI_GATEWAY_API_KEY || '',
    aiGatewayModel: process.env.AI_GATEWAY_MODEL || 'openai/gpt-4o-mini',
    footballApi: {
      baseUrl:
        process.env.FOOTBALL_API_BASE_URL ||
        'https://v3.football.api-sports.io',
      host: process.env.FOOTBALL_API_HOST || 'v3.football.api-sports.io',
      key: process.env.FOOTBALL_API_KEY || '',
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
  },
  nitro: {
    storage: process.env.REDIS_URL
      ? {
          redis: {
            driver: 'redis',
            url: process.env.REDIS_URL,
          },
        }
      : {},
  },
  i18n: {
    defaultLocale: 'en',
    fallbackLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'fr', file: 'fr.json', name: 'Français' },
      { code: 'es', file: 'es.json', name: 'Español' },
      { code: 'de', file: 'de.json', name: 'Deutsch' },
    ],
    lazy: true,
    langDir: 'locales',
  },
  compatibilityDate: '2024-08-05',
})
