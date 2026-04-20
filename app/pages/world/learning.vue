<script setup lang="ts">
import type { SessionUser } from '~/types/session'
definePageMeta({ layout: 'learning' })

const { t } = useI18n()
const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)
const isAdmin = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ADMIN') ?? false,
)

const { learningNavItems } = useWorldLearningNavItems()
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
