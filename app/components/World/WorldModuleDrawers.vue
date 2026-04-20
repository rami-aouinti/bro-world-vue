<script setup lang="ts">
import type { SessionUser } from '~/types/session'
import WorldModuleLeftDrawerContent from '~/components/World/WorldModuleLeftDrawerContent.vue'

type WorldModuleNavItem = {
  title: string
  to: string
  icon: string
  rootOnly?: boolean
}

const emit = defineEmits<{
  action: []
}>()

const props = defineProps<{
  moduleTitle: string
  moduleKey?: string
  modulePath?: string
  moduleIcon: string
  moduleDescription: string
  navItems: WorldModuleNavItem[]
  actionLabel?: string
  actionIcon?: string
  showAction?: boolean
  activateRightDrawer?: boolean
  deactivateRightDrawer?: boolean
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

const resolvedModuleKey = computed(() => {
  if (props.moduleKey) {
    return props.moduleKey
  }

  if (route.path.startsWith('/world/jobs')) {
    return 'recruit'
  }

  if (route.path.startsWith('/world/learning')) {
    return 'school'
  }

  if (route.path.startsWith('/world/shop')) {
    return 'shop'
  }

  return 'crm'
})
const resolvedModulePath = computed(() => {
  if (resolvedModuleKey.value === 'crm') {
    return '/world/crm'
  }

  return props.modulePath || route.path
})

type GeneralPublicItem = {
  title?: string
  photo?: string
  platform?: {
    key?: string
    name?: string
  }
}

const { data: generalApplications } = await useAsyncData(
  'world-public-general-applications',
  () =>
    $fetch<{ items?: GeneralPublicItem[] }>('/api/application/public/general'),
)

const selectedGeneralApplication = computed(() =>
  (generalApplications.value?.items ?? []).find(
    (item) => item.platform?.key === resolvedModuleKey.value,
  ),
)

const moduleIdentityTitle = computed(
  () => selectedGeneralApplication.value?.title || props.moduleTitle,
)
const moduleIdentityPhoto = computed(
  () => selectedGeneralApplication.value?.photo || undefined,
)
const moduleIdentityBadge = computed(
  () => selectedGeneralApplication.value?.platform?.name || props.moduleTitle,
)

const showRightDrawerDesktop = useState('show-right-drawer-desktop', () => true)
const showRightDrawerMobile = useState('show-right-drawer-mobile', () => false)

watchEffect(() => {
  if (props.deactivateRightDrawer) {
    showRightDrawerDesktop.value = false
    showRightDrawerMobile.value = false
    return
  }

  if (!props.activateRightDrawer) {
    return
  }

  showRightDrawerDesktop.value = true
  showRightDrawerMobile.value = false
})

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
  <AppPageDrawers
    :left-component="WorldModuleLeftDrawerContent"
    :left-props="{
      moduleTitle,
      modulePath: resolvedModulePath,
      moduleIdentityPhoto,
      moduleIdentityTitle,
      moduleIdentityBadge,
      navItems: visibleNavItems,
      showAction: showAction !== false,
      actionIcon: actionIcon || 'mdi-plus-circle-outline',
      actionLabel:
        actionLabel ||
        t(
          'world.common.actions.createInModule',
          { module: moduleTitle },
          `Create in ${moduleTitle}`,
        ),
      onAction: () => emit('action'),
    }"
  >
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
