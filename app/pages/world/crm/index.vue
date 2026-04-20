<script setup lang="ts">
import { useWorldCrmNavItems } from '~/composables/useWorldCrmNavItems'

definePageMeta({
  title: 'world.crm.label',
  description: 'world.crm.seo.metaDescription',
})

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl || 'https://bro-world-space.com'
const pageUrl = new URL('/world/crm', siteUrl).toString()
const seoImage = new URL('/img/platform/general/crm.png', siteUrl).toString()

useSeoMeta({
  title: t('world.crm.seo.title', 'Bro World CRM | Project, task, and customer management'),
  description: t(
    'world.crm.seo.description',
    'Bro World CRM centralizes project management, contacts, sprints, tasks, and GitHub sync for your teams.',
  ),
  keywords: t(
    'world.crm.seo.keywords',
    'bro world crm, online crm, project management, task management, customer tracking, kanban, sprint, github sync',
  ),
  robots: 'index, follow, max-image-preview:large',
  ogTitle: t('world.crm.seo.ogTitle', 'Bro World CRM | Project, task, and customer management'),
  ogDescription: t(
    'world.crm.seo.ogDescription',
    'Manage your projects, contacts, and CRM workflows with Bro World CRM.',
  ),
  ogType: 'website',
  ogUrl: pageUrl,
  ogImage: seoImage,
  ogImageAlt: 'Bro World CRM dashboard',
  twitterTitle: t('world.crm.seo.twitterTitle', 'Bro World CRM | Project, task, and customer management'),
  twitterDescription: t(
    'world.crm.seo.twitterDescription',
    'Manage your projects, contacts, and CRM workflows with Bro World CRM.',
  ),
  twitterImage: seoImage,
  twitterCard: 'summary_large_image',
})

const { crmNavItems } = useWorldCrmNavItems()
const { fetch: refreshSession, loggedIn } = useUserSession()

const loginDialogOpen = ref(false)
const loginLoading = ref(false)

async function onLoginSubmit(payload: {
  username?: string
  email: string
  password: string
  remember?: boolean
}) {
  loginLoading.value = true
  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: {
        username: payload.username ?? payload.email,
        password: payload.password,
        remember: payload.remember ?? true,
      },
    })
    await refreshSession()
    loginDialogOpen.value = false
    Notify.success(t('auth.notifications.loginSuccess'))
  } catch {
    Notify.error(t('auth.notifications.loginError'))
  } finally {
    loginLoading.value = false
  }
}

const documentationSections = [
  {
    title: t('world.crm.documentation.sections.projects.title'),
    icon: 'mdi-folder-multiple-outline',
    description: t('world.crm.documentation.sections.projects.description'),
    to: '/world/crm/projects',
  },
  {
    title: t('world.crm.documentation.sections.kanaban.title'),
    icon: 'mdi-view-kanban-outline',
    description: t('world.crm.documentation.sections.kanaban.description'),
    to: '/world/crm/kanaban',
  },
  {
    title: t('world.crm.documentation.sections.tasks.title'),
    icon: 'mdi-format-list-checks',
    description: t('world.crm.documentation.sections.tasks.description'),
    to: '/world/crm/tasks',
  },
  {
    title: t('world.crm.documentation.sections.taskRequests.title'),
    icon: 'mdi-source-pull',
    description: t('world.crm.documentation.sections.taskRequests.description'),
    to: '/world/crm/task-requests',
  }
]
const githubSyncSteps = [
  t('world.crm.documentation.githubSync.steps.step1'),
  t('world.crm.documentation.githubSync.steps.step2'),
  t('world.crm.documentation.githubSync.steps.step3'),
  t('world.crm.documentation.githubSync.steps.step4'),
  t('world.crm.documentation.githubSync.steps.step5'),
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="loggedIn ? t('world.crm.actions.createCrm') : t('appbar.login')"
      action-icon="mdi-plus-circle-outline"
      @action="loggedIn ? navigateTo('/platform/crm/new') : (loginDialogOpen = true)"
    >
      <template #right />
    </WorldModuleDrawers>

    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card rounded="xl" class="pa-6 postcard-gradient-card crm-doc-hero">
            <div class="d-flex align-center justify-space-between ga-3 flex-wrap">
              <div>
                <h1 class="text-h5 font-weight-bold mb-2">{{ t('world.crm.documentation.heroTitle') }}</h1>
                <p class="text-body-1 mb-0">
                  {{ t('world.crm.documentation.heroDescription') }}
                </p>
              </div>
              <v-btn
                color="primary"
                :variant="loggedIn ? 'elevated' : 'tonal'"
                :prepend-icon="loggedIn ? 'mdi-rocket-launch-outline' : 'mdi-login'"
                @click="loggedIn ? navigateTo('/platform/crm/new') : (loginDialogOpen = true)"
              >
                {{ loggedIn ? t('world.crm.actions.createCrm') : t('appbar.login') }}
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <v-col v-for="section in documentationSections" :key="section.title" cols="12" md="6">
          <v-card rounded="xl" class="pa-5 postcard-gradient-card crm-doc-card h-100">
            <div class="d-flex align-center ga-2 mb-2">
              <v-icon :icon="section.icon" color="primary" />
              <h2 class="text-h6 mb-0">{{ section.title }}</h2>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">{{ section.description }}</p>
            <v-btn color="primary" variant="tonal" append-icon="mdi-arrow-right" :to="section.to">
              {{ t('world.crm.documentation.openSection', { section: section.title }) }}
            </v-btn>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card rounded="xl" class="pa-5 postcard-gradient-card crm-doc-card h-100">
            <div class="d-flex align-center ga-2 mb-3">
              <v-icon icon="mdi-github" color="primary" />
              <h2 class="text-h6 mb-0">{{ t('world.crm.documentation.githubSync.title') }}</h2>
            </div>
            <v-timeline side="end" density="compact" class="crm-sync-timeline">
              <v-timeline-item
                v-for="step in githubSyncSteps"
                :key="step"
                dot-color="primary"
                fill-dot
                size="small"
              >
                <div class="text-body-2">{{ step }}</div>
              </v-timeline-item>
            </v-timeline>
            <div class="d-flex ga-2 flex-wrap mt-2">
              <v-btn color="primary" variant="tonal" append-icon="mdi-arrow-right" to="/world/crm/repositories">
                {{ t('world.crm.nav.repositories') }}
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <AppModal
      v-model="loginDialogOpen"
      :title="t('auth.login.title')"
      :max-width="560"
    >
      <AuthFormCard
        mode="login"
        :loading="loginLoading"
        @submit="onLoginSubmit"
      />
    </AppModal>
  </div>
</template>

<style scoped>
.crm-doc-hero {
  position: relative;
  overflow: hidden;
}

.crm-doc-hero::after {
  content: '';
  position: absolute;
  width: 320px;
  height: 320px;
  top: -140px;
  right: -110px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.2) 0%, transparent 70%);
  animation: crmGlow 8s ease-in-out infinite;
}

.crm-doc-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: crmCardIn 0.45s ease both;
}

.crm-doc-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
}

.crm-sync-timeline {
  max-height: 260px;
  overflow: auto;
}

@keyframes crmGlow {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(24px);
  }
}

@keyframes crmCardIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
