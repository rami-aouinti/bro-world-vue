<script setup lang="ts">
import type { SessionUser } from '~/types/session'

const { t } = useI18n()
const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)
const isAdmin = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ADMIN') ?? false,
)

const learningNavItems = computed(() => [
  {
    title: t('world.learning.nav.courses'),
    to: '/world/learning/courses',
    icon: 'mdi-book-open-page-variant-outline',
  },
  {
    title: 'Classes',
    to: '/world/learning/classes',
    icon: 'mdi-google-classroom',
  },
  {
    title: 'Teachers',
    to: '/world/learning/teachers',
    icon: 'mdi-account-tie',
  },
  {
    title: 'Students',
    to: '/world/learning/students',
    icon: 'mdi-account-school',
  },
  {
    title: 'Exams',
    to: '/world/learning/exams',
    icon: 'mdi-file-document-outline',
  },
  {
    title: 'Grades',
    to: '/world/learning/grades',
    icon: 'mdi-check-decagram-outline',
  },
  {
    title: t('world.learning.nav.levels'),
    to: '/world/learning/levels',
    icon: 'mdi-stairs',
  },
  {
    title: t('world.learning.nav.paths'),
    to: '/world/learning/paths',
    icon: 'mdi-map-marker-path',
  },
  ...(isRoot.value || isAdmin.value
    ? [
        {
          title: t('world.learning.nav.admin'),
          to: '/world/learning/admin',
          icon: 'mdi-shield-crown-outline',
        },
      ]
    : []),
])
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.learning.label')"
      module-key="school"
      module-path="/world/learning"
      module-icon="mdi-school-outline"
      :module-description="t('world.learning.moduleDescription')"
      :nav-items="learningNavItems"
      :action-label="t('world.learning.actions.refreshDashboard')"
      action-icon="mdi-refresh"
    />
    <NuxtPage />
  </div>
</template>
