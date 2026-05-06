import { aliases } from 'vuetify/iconsets/mdi'
import { defineNuxtConfig } from 'nuxt/config'

const shouldSplitCss = process.env.NUXT_CSS_CODE_SPLIT === 'true'
const defaultSiteUrl = 'https://bro-world-space.com'
const configuredSiteUrl = process.env.NUXT_PUBLIC_SITE_URL?.trim()
const resolvedSiteUrl =
  configuredSiteUrl && !configuredSiteUrl.includes('.vercel.app')
    ? configuredSiteUrl
    : defaultSiteUrl

const indexablePublicRoutes = [
  '/',
  '/world/crm',
  '/world/learning',
  '/world/jobs',
  '/world/shop',
  '/resume',
  '/service',
  '/about',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/data-deletion',
  '/applications',
  '/applications/quiz',
  '/applications/sports',
  '/games',
  '/platform',
  '/world',
  '/world/jobs/offers',
  '/world/learning/courses',
  '/world/learning/teachers',
  '/world/shop/products',
] as const

const privateRouteRules = {
  '/admin/**': { robots: false, sitemap: false },
  '/dashboard/**': { robots: false, sitemap: false },
  '/login': { robots: false, sitemap: false },
  '/register': { robots: false, sitemap: false },
  '/auth': { robots: false, sitemap: false },
  '/settings': { robots: false, sitemap: false },
  '/calendar': { robots: false, sitemap: false },
  '/inbox/**': { robots: false, sitemap: false },
  '/notification/**': { robots: false, sitemap: false },
  '/profile/**': { robots: false, sitemap: false },
  '/platform/*/new/**': { robots: false, sitemap: false },
  '/resume/preview/**': { robots: false, sitemap: false },
  '/resume/template-capture/**': { robots: false, sitemap: false },
  '/world/**/admin/**': { robots: false, sitemap: false },
  '/world/jobs/admin': { robots: false, sitemap: false },
  '/world/shop/admin': { robots: false, sitemap: false },
} as const

const indexableRouteRules = Object.fromEntries(
  indexablePublicRoutes.map((route) => [
    route,
    {
      robots: true,
      sitemap: {
        changefreq: 'daily',
        priority: route === '/' ? 1 : 0.7,
      },
    },
  ]),
)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  routeRules: {
    ...indexableRouteRules,
    ...privateRouteRules,
    '/quiz': { redirect: '/applications/quiz', robots: false, sitemap: false },
  },
  app: {
    head: {
      title: 'Bro World Space',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Jobs, social network, AI tools and more.',
        },
        {
          name: 'google-site-verification',
          content: process.env.GOOGLE_KEY_INDEX || '',
        },
      ],
    },
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
    'nuxt-schema-org',
  ],
  site: {
    url: resolvedSiteUrl,
    name: 'Bro World Space',
  },
  sitemap: {
    siteUrl: resolvedSiteUrl,
    urls: [...indexablePublicRoutes],
    defaults: {
      changefreq: 'daily',
      priority: 0.7,
    },
  },
  robots: {
    sitemap: `${resolvedSiteUrl}/sitemap.xml`,
    groups: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin',
          '/dashboard',
          '/login',
          '/register',
          '/auth',
          '/settings',
          '/calendar',
          '/inbox',
          '/notification',
          '/profile',
          '/platform/crm/new',
          '/platform/job/new',
          '/platform/school/new',
          '/platform/shop/new',
          '/resume/preview',
          '/resume/template-capture',
          '/world/crm/admin',
          '/world/jobs/admin',
          '/world/learning/admin',
          '/world/shop/admin',
        ],
      },
    ],
  },
  css: [
    'vuetify/styles',
    '~/assets/styles/material-dashboard.scss',
    '~/assets/styles/football-dashboard.scss',
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
    oauth: {
      facebook: {
        clientId:
          process.env.FACEBOOK_APP_ID ||
          process.env.NUXT_OAUTH_FACEBOOK_CLIENT_ID ||
          '',
        clientSecret:
          process.env.FACEBOOK_APP_SECRET ||
          process.env.NUXT_OAUTH_FACEBOOK_CLIENT_SECRET ||
          '',
        redirectURL: process.env.FACEBOOK_REDIRECT_URI || '',
        fields: ['id', 'name', 'email'],
      },
      gitlab: {
        clientId: process.env.NUXT_OAUTH_GITLAB_CLIENT_ID || '',
        clientSecret: process.env.NUXT_OAUTH_GITLAB_CLIENT_SECRET || '',
        redirectURL: process.env.NUXT_OAUTH_GITLAB_REDIRECT_URL || '',
      },
      microsoft: {
        clientId:
          process.env.AZURE_CLIENT_ID ||
          process.env.NUXT_OAUTH_MICROSOFT_CLIENT_ID ||
          '',
        clientSecret:
          process.env.AZURE_CLIENT_SECRET ||
          process.env.NUXT_OAUTH_MICROSOFT_CLIENT_SECRET ||
          '',
        tenant:
          process.env.AZURE_TENANT_ID ||
          process.env.NUXT_OAUTH_MICROSOFT_TENANT ||
          'common',
        redirectURL:
          process.env.AZURE_REDIRECT_URI ||
          process.env.NUXT_OAUTH_MICROSOFT_REDIRECT_URL ||
          `${resolvedSiteUrl}/api/auth/callback/azure-ad`,
      },
    },
    databaseUrl: process.env.DATABASE_URL || '',
    cronSecret: process.env.CRON_SECRET || '',
    blogAutomationUsername: process.env.BLOG_AUTOMATION_USERNAME || '',
    blogAutomationPassword: process.env.BLOG_AUTOMATION_PASSWORD || '',
    redis: {
      url: '',
    },
    public: {
      siteUrl: resolvedSiteUrl,
      apiBaseUrl: 'https://bro-world.org/api/v1',
      mercurePublicUrl:
        process.env.NUXT_PUBLIC_MERCURE_PUBLIC_URL ||
        process.env.MERCURE_PUBLIC_URL ||
        'https://bro-world.org/.well-known/mercure',
      mercureWithCredentials:
        process.env.NUXT_PUBLIC_MERCURE_WITH_CREDENTIALS === 'true',
      mercureSubscriberJwt:
        process.env.NUXT_PUBLIC_MERCURE_SUBSCRIBER_JWT || '',
      shop: {
        globalShopId: process.env.NUXT_PUBLIC_GLOBAL_SHOP_ID || '',
      },
    },
    github: {
      clientId: '',
      clientSecret: '',
    },
    googleCalendar: {
      clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI || '',
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
    basketballApi: {
      baseUrl:
        process.env.BASKETBALL_API_BASE_URL ||
        'https://v1.basketball.api-sports.io',
      host: process.env.BASKETBALL_API_HOST || 'v1.basketball.api-sports.io',
      key: process.env.BASKETBALL_API_KEY || process.env.FOOTBALL_API_KEY || '',
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
  },
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt'],
    },
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
