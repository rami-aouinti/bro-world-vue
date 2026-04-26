<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const theme = useTheme()
provide(
  THEME_KEY,
  computed(() => (theme.current.value.dark ? 'dark' : undefined)),
)

const route = useRoute()
const { locale, t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const rounded = useStorage('theme-rounded', 'md')
const shadow = useStorage('theme-shadow', 'none')
const translateIfKey = (key: unknown) =>
  typeof key === 'string' && key ? t(key) : ''

const siteUrl = computed(
  () => runtimeConfig.public.siteUrl || 'https://bro-world-space.com',
)

const canonicalUrl = computed(() => {
  const normalizedPath =
    route.path === '/' ? '/' : route.path.replace(/\/+$/, '')

  return new URL(normalizedPath || '/', siteUrl.value).toString()
})

const defaultOgImage = computed(() =>
  new URL('/social-bro-world.png', siteUrl.value).toString(),
)

const facebookPageUrl = 'https://www.facebook.com/profile.php?id=61565251736660'

const organizationSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Bro World',
  url: siteUrl.value,
  sameAs: [facebookPageUrl],
}))

if (import.meta.client) {
  watchEffect(() => {
    document.documentElement.dataset.appRounded = rounded.value
    document.documentElement.dataset.appShadow = shadow.value
  })
}

const title = computed(() => {
  const pageTitle = route.meta?.title || route.matched[0]?.meta?.title || ''
  return translateIfKey(pageTitle)
})

const metaDescriptionByLocale = {
  en: {
    withTitle: (pageTitle: string) =>
      `Discover ${pageTitle} on Bro World: games, social network, jobs, CRM and online tools.`,
    fallback:
      'Bro World offers games, a social network, CRM tools, job opportunities, and collaborative experiences.',
  },
  fr: {
    withTitle: (pageTitle: string) =>
      `Discover ${pageTitle} on Bro World: games, social network, jobs, CRM and online tools.`,
    fallback:
      'Bro World offers games, a social network, CRM tools, job opportunities, and collaborative experiences.',
  },
  es: {
    withTitle: (pageTitle: string) =>
      `Descubre ${pageTitle} en Bro World: juegos, red social, empleo, CRM y herramientas online.`,
    fallback:
      'Bro World ofrece juegos, red social, herramientas CRM, ofertas de empleo y experiencias colaborativas.',
  },
  de: {
    withTitle: (pageTitle: string) =>
      `Entdecke ${pageTitle} auf Bro World: Spiele, soziales Netzwerk, Jobs, CRM und Online-Tools.`,
    fallback:
      'Bro World bietet Spiele, ein soziales Netzwerk, CRM-Tools, Jobangebote und kollaborative Erlebnisse.',
  },
} as const

const metaDescription = computed(() => {
  const routeDescription =
    typeof route.meta?.description === 'string' ? route.meta.description : ''

  if (routeDescription) {
    return routeDescription
  }

  const localeDescription =
    metaDescriptionByLocale[locale.value as keyof typeof metaDescriptionByLocale] ??
    metaDescriptionByLocale.en

  if (title.value) {
    return localeDescription.withTitle(title.value)
  }

  return localeDescription.fallback
})

useHead({
  title,
  titleTemplate: (pageTitle) =>
    pageTitle
      ? `${pageTitle} | ${translateIfKey('app.name')}`
      : translateIfKey('app.name'),
  htmlAttrs: { lang: locale.value },
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'canonical', href: canonicalUrl },
    { rel: 'me', href: facebookPageUrl },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(organizationSchema.value),
    },
  ],
})

const isTrackingEnabled = import.meta.client && import.meta.env.PROD

if (isTrackingEnabled) {
  useHead({
    script: [
      {
        innerHTML:
          'window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};',
      },
      {
        defer: true,
        src: '/_vercel/insights/script.js',
      },
      {
        innerHTML:
          'window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments);};',
      },
      {
        defer: true,
        src: '/_vercel/speed-insights/script.js',
      },
    ],
  })
}

useSeoMeta({
  viewport: 'width=device-width, initial-scale=1',
  description: metaDescription,
  ogTitle: title,
  ogDescription: metaDescription,
  ogUrl: canonicalUrl,
  ogType: 'website',
  ogImage: defaultOgImage,
  twitterTitle: title,
  twitterDescription: metaDescription,
  twitterImage: defaultOgImage,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <AppCookieConsent />
</template>
