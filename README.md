<p align="center">
  <img alt="Vitify - Opinionated Vuetify Admin Starter Template" src="public/vitify-nuxt.svg" width=100px/>
</p>
<h1 align="center">Vitify Nuxt</h1>

<p align="center">
  <a href="https://github.com/vuejs/vue">
    <img src="https://img.shields.io/badge/nuxt-4-brightgreen.svg" alt="nuxt">
  </a>
  <a href="https://github.com/vuetifyjs/vuetify">
    <img src="https://img.shields.io/badge/vuetify-4-blue.svg" alt="vuetify">
  </a>
  <a href="https://github.com/kingyue737/vitify-admin/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/mashape/apistatus.svg" alt="license">
  </a>
</p>

<p align='center'>
<b>Vuetify</b> + <b>Nuxt</b>, Opinionated Admin Starter Template<br><br>
</p>

<p align='center'>
<a href="https://vitify-nuxt.netlify.app/">Live Demo<br><br></a>
</p>

## Features

- 💚 [Nuxt](https://nuxt.com/) - SPA, ESR, File-based routing, components auto importing, modules, etc

- 💥 SSR out of the box - powered by [Vuetify Nuxt module](https://github.com/vuetifyjs/nuxt-module)

- ⚡️ [Vite](https://github.com/vitejs/vite), [pnpm](https://pnpm.io/), [ESBuild](https://github.com/evanw/esbuild) - born with fastness

- 🍍 [State Management via Pinia](https://pinia.vuejs.org/)

- 📥 APIs auto importing - for Composition API, VueUse and custom composables

- ☁️ Deploy on [Netlify](https://www.netlify.com/), zero-config

- 🦾 TypeScript 100%

- 🧪 Unit, Component and E2E Testing with [@nuxt/test-utils](https://github.com/nuxt/test-utils)

<br>

### Admin Starter Template

- 🪟 Default layout with drawer, header and footer

- 🧭 Auto-generated navigation drawer and breadcrumbs based on routes

- 🔔 Notification store

- 📉 Data visualization with [nuxt-echarts](https://github.com/kingyue737/nuxt-echarts)

- 🎨 Theme color customization and dark mode

- 📱 Responsive layout

- 🛡️ Authentication backed-in using [nuxt-auth-utils](https://github.com/Atinux/nuxt-auth-utils)

## Variants

- [vitify-next](https://github.com/kingyue737/vitify-next) - Lightweight Vue 3 version without Nuxt

- [vitify-electron](https://github.com/kingyue737/vitify-electron) - Vuetify + Nuxt + Electron starter
- [vitify-admin](https://github.com/kingyue737/vitify-admin) - Vue 2.7 with i18n, browser compatibility and mock server

## Pre-packed

### Nuxt Modules

- [Vuetify Nuxt Module](https://github.com/vuetifyjs/nuxt-module) - Zero-config Nuxt Module for Vuetify
- [Nuxt I18n](https://i18n.nuxtjs.org/) - Internationalization module with localized routes and lazy-loaded dictionaries
- [VueUse](https://github.com/vueuse/vueuse) - Collection of useful composition APIs
- [Pinia](https://github.com/vuejs/pinia) - Intuitive, type-safe, light and flexible Store for Vue
- [Nuxt Icon](https://github.com/nuxt/icon) - Icon module for Nuxt with 200,000+ ready to use icons from Iconify
- [Nuxt ECharts](https://github.com/kingyue737/nuxt-echarts) - Nuxt module for Apache ECharts™
- [Nuxt Auth Utils](https://github.com/Atinux/nuxt-auth-utils) - Minimalist Authentication module for Nuxt

### Internationalization (i18n)

The project uses [`@nuxtjs/i18n`](https://i18n.nuxtjs.org/) with lazy-loaded locale files from `i18n/locales`.

- Locales: `en`, `fr`, `es`, `de`
- `defaultLocale`: `en`
- `fallbackLocale`: `en`
- Routing strategy: `no_prefix`
  - All locales share non-prefixed routes (e.g. `/dashboard`)
  - Language switching changes translations without changing the URL path

### Architecture du projet

Le projet suit une organisation Nuxt "full-stack" : l'UI et les stores vivent dans `app/`, tandis que les endpoints backend résident dans `server/`.

- **Dossiers principaux**
  - `app/pages` : pages Nuxt (routing file-based), incluant les espaces métier `world/*` (CRM, jobs, learning, shop).
  - `app/stores` : stores Pinia (état UI + orchestration des appels API), avec des stores dédiés comme `worldCrm`, `worldJobs`, `worldLearning`, `worldShop`.
  - `server/api` : endpoints Nitro (`/api/**`) utilisés par le front et éventuellement par d'autres clients.
  - `server/utils` : utilitaires serveur partagés (clients HTTP, invalidation cache, helpers métier).
  - `i18n/locales` : dictionnaires de traduction chargés en lazy (`en`, `fr`, `es`, `de`).

- **Flux front ↔ API**
  - Les pages/composables déclenchent des actions de stores (`app/stores/*`).
  - Les stores appellent les endpoints dans `server/api/**` via `$fetch`/helpers serveur.
  - Les réponses sont typées (voir `app/types` et `server/types`) puis normalisées dans les stores avant affichage.

- **Modules métier existants**
  - `jobs`
  - `crm`
  - `learning`
  - `shop`

  Ces modules partagent des conventions communes (types dédiés, stores dédiés, clés i18n hiérarchiques et stratégie de cache/invalidation).

- **Point d'entrée de configuration et conventions de nommage**
  - `nuxt.config.ts` est le point central de configuration (modules Nuxt, i18n, runtimeConfig, SSR, build/vite, Nitro).
  - Convention de nommage côté "world" :
    - pages : `app/pages/world/<module>/...`
    - store : `app/stores/world<Module>.ts`
    - types : `app/types/world/<module>.ts`
    - endpoints : `server/api/world/<module>/...`
  - Clés i18n recommandées : `world.<module>.<zone>.<key>`.

### Coding Style

- [Prettier](https://prettier.io/), single quotes, no semi
- [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new) with adapted [@nuxt/eslint](https://github.com/nuxt/eslint), future-proof

### Dev tools

- [TypeScript](https://www.typescriptlang.org/)
- [pnpm](https://pnpm.js.org/) - Fast, disk space efficient package manager
- [Netlify](https://www.netlify.com/) - zero-config deployment
- [VS Code Extensions](./.vscode/extensions.json)
  - [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - TypeScript support inside Vue SFCs
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Find and fix problems in your code
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Code formatter
  - [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

## Try it now!

### GitHub Template

[Create a repo from this template on GitHub](https://github.com/kingyue737/vitify-nuxt/generate).

### Clone to local

If you prefer to do it manually with the cleaner git history

```bash
npx degit kingyue737/vitify-nuxt my-vitify-app
cd my-vitify-app
pnpm i
```

### Authentication Setup

> You can switch to any [OAuth Providers](https://github.com/Atinux/nuxt-auth-utils#supported-oauth-providers) supported by [Nuxt Auth Utils](https://github.com/Atinux/nuxt-auth-utils) or write your own.

Create a [GitHub OAuth Application](https://github.com/settings/applications/new) with:

- Homepage url: `http://localhost:3000`
- Callback url: `http://localhost:3000/api/auth/github`

Add the variables in the `.env` file:

```bash
NUXT_OAUTH_GITHUB_CLIENT_ID="my-github-oauth-app-id"
NUXT_OAUTH_GITHUB_CLIENT_SECRET="my-github-oauth-app-secret"
```

To create sealed sessions, you also need to add `NUXT_SESSION_SECRET` in the `.env` with at least 32 characters:

```bash
NUXT_SESSION_SECRET=your-super-long-secret-for-session-encryption
```

Nuxt Auth Utils generates one for you when running Nuxt in development the first time if no `NUXT_SESSION_PASSWORD` is set.

### Mercure (JWT subscriber + cookie/polyfill)

Configuration côté Nuxt :

```bash
NUXT_PUBLIC_MERCURE_PUBLIC_URL="http://localhost:3100/.well-known/mercure"
NUXT_PUBLIC_MERCURE_WITH_CREDENTIALS="false"
# Optionnel (mode header + polyfill EventSource)
NUXT_PUBLIC_MERCURE_SUBSCRIBER_JWT=""
```

- **Navigateur (recommandé)** : utiliser le cookie `mercureAuthorization` et `withCredentials: true` uniquement si le hub renvoie `Access-Control-Allow-Origin` explicite (pas `*`).
- **Polyfill EventSource** : possible via header `Authorization: Bearer <JWT subscriber>`.
- Le claim `mercure.subscribe` du JWT doit matcher les topics écoutés.
- **Ne jamais exposer `MERCURE_JWT_SECRET` dans Nuxt** : la signature du token reste côté Symfony.

### Contribution (section football)

Avant toute merge sur les évolutions des statistiques football (composable + panel de détail), exécuter la commande suivante :

```bash
pnpm run check:football
```

Cette vérification standardisée couvre :

- le typecheck TypeScript/Vue SFC (`nuxt typecheck`),
- le lint ciblé sur `app/composables/useFootballData.ts` et `app/components/Sports/Football/FixtureDetailsPanel.vue`,
- des règles anti-duplication (`no-redeclare`, `no-dupe-args`, `no-dupe-keys`) et la détection d'erreurs de parsing template (`vue/no-parsing-error`).

### Cron IA (news tech automatisées)

Un endpoint interne `GET /api/internal/cron/ai-news` crée automatiquement **3 posts tech** (Symfony, Nuxt, Vuetify, API, Elasticsearch, RabbitMQ, Redis, MongoDB) en s'appuyant sur un agent IA.

- Déclenchement: réutilise le cron interne existant en ajoutant `runAiNews=1` sur `/api/internal/cron/cache-refresh` (pas besoin d'ajouter un 3ème cron Vercel).
- Sécurité: appel protégé par `Authorization: Bearer <CRON_SECRET>`.
- Publication: utilise un token de service `BLOG_AUTOMATION_TOKEN` pour poster sur le blog privé (`/api/v1/private/blogs/general/posts`).
- Limite d'usage IA: **1 appel IA par jour (UTC)**, les autres déclenchements utilisent un fallback local pour éviter de consommer plus d'un agent IA par jour.
- Exemple: `/api/internal/cron/cache-refresh?mode=warm&scope=public-non-sports&runAiNews=1`.

Variables à définir:

```bash
CRON_SECRET=...
BLOG_AUTOMATION_TOKEN=...
AI_GATEWAY_API_KEY=...
AI_GATEWAY_MODEL=openai/gpt-4o-mini
```

### Development

Start the development server on http://localhost:3000

```bash
pnpm run dev
```

## License

[MIT License](./LICENSE)
