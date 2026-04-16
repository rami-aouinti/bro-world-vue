<script setup lang="ts">
import type { SessionUser } from '~/types/session'

type WorldModuleNavItem = {
  title: string
  to: string
  icon: string
  rootOnly?: boolean
}

const props = defineProps<{
  moduleTitle: string
  moduleIcon: string
  moduleDescription: string
  navItems: WorldModuleNavItem[]
  actionLabel?: string
  actionIcon?: string
}>()

const { t } = useI18n()
const route = useRoute()
const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)

const visibleNavItems = computed(() =>
  props.navItems.filter((item) => !item.rootOnly || isRoot.value),
)

const quickCheckItems = computed(() => [
  {
    icon: 'mdi-check-circle-outline',
    title: t('world.common.quickChecks.sync', 'Data sync: online'),
  },
  {
    icon: 'mdi-timer-sand',
    title: t(
      'world.common.quickChecks.pendingApprovals',
      'Pending approvals: 3',
    ),
  },
  {
    icon: 'mdi-account-clock-outline',
    title: t('world.common.quickChecks.assignedToMe', 'Assigned to me: 12'),
  },
])
</script>

<template>
  <AppPageDrawers>
    <template #left>
      <div class="d-flex flex-column ga-3">
        <v-btn
          color="primary"
          variant="tonal"
          :prepend-icon="actionIcon || 'mdi-plus-circle-outline'"
          block
        >
          {{
            actionLabel ||
            t(
              'world.common.actions.createInModule',
              { module: moduleTitle },
              `Create in ${moduleTitle}`,
            )
          }}
        </v-btn>
        <v-list nav density="compact" rounded="xl" class="bg-transparent">
          <v-list-item
            v-for="item in visibleNavItems"
            :key="item.to"
            :title="item.title"
            :prepend-icon="item.icon"
            :to="item.to"
            :active="route.path === item.to"
            rounded="lg"
            color="primary"
          />
        </v-list>
      </div>
    </template>

    <template #right>
      <slot name="right">
        <h3 class="text-subtitle-1 font-weight-bold mb-3">
          {{ t('world.common.quickChecks.title', 'Quick checks') }}
        </h3>
        <v-list density="compact" class="bg-transparent">
          <v-list-item
            v-for="item in quickCheckItems"
            :key="item.title"
            :prepend-icon="item.icon"
            :title="item.title"
          />
        </v-list>
      </slot>
    </template>
  </AppPageDrawers>
</template>

<style scoped>
.world-module-drawer-list {
  border: 1px solid rgba(var(--v-border-color), 0.26);
}
</style>
