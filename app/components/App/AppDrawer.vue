<script setup lang="ts">
const { t } = useI18n()

const router = useRouter()
const { user } = useUserSession()
const isRoot = computed(() => {
  const roles = (user.value as { roles?: string[] } | null)?.roles ?? []
  return roles.includes('root')
})
const routes = computed(() => {
  const rootRoutes = router.getRoutes().filter((r) => r.path.lastIndexOf('/') === 0)
  const sortedRoutes = rootRoutes.toSorted((a, b) => (a.meta?.drawerIndex ?? 99) - (b.meta?.drawerIndex ?? 98))
  const dashboardRoute = sortedRoutes.find((route) => route.name === 'dashboard')
  const filteredRoutes = sortedRoutes.filter((route) => route.name !== 'dashboard')

  if (!filteredRoutes.some((route) => route.name === 'admin') && dashboardRoute) {
    filteredRoutes.push({
      ...dashboardRoute,
      name: 'admin',
      path: '/admin',
      meta: {
        ...dashboardRoute.meta,
        title: 'appbar.admin',
      },
    })
  }

  if (isRoot.value) {
    return filteredRoutes.toSorted((a, b) => (a.meta?.drawerIndex ?? 99) - (b.meta?.drawerIndex ?? 98))
  }

  return rootRoutes
    .filter((route) => route.name !== 'dashboard')
    .toSorted((a, b) => (a.meta?.drawerIndex ?? 99) - (b.meta?.drawerIndex ?? 98))
})
const drawerState = useState('drawer', () => true)

const { mobile } = useDisplay()
const registry = useDrawerSlotRegistry()
const drawer = computed({
  get() {
    return drawerState.value || !mobile.value
  },
  set(val: boolean) {
    drawerState.value = val
  },
})
const rail = computed(() => !drawerState.value && !mobile.value)
const leftDrawerRenderer = computed(() => registry?.left.value ?? null)

</script>

<template>
  <v-navigation-drawer
    v-model="drawer"
    :expand-on-hover="rail"
    :rail="rail"
    width="260"
    permanent
    floating
    class="app-left-drawer"
  >
    <component :is="{ render: leftDrawerRenderer }" v-if="leftDrawerRenderer" class="app-left-drawer-list" />
    <v-list v-else nav density="compact" class="app-left-drawer-list">
      <AppDrawerItem v-for="route in routes" :key="route.name" :item="route" />
    </v-list>
    <v-spacer />
    <template #append>
      <v-list-item class="drawer-footer px-0 d-flex flex-column justify-center">
        <div class="text-body-small pt-6 pt-md-0 text-center text-no-wrap">
          {{ t('appbar.copyright') }}
          <a
            href="https://github.com/kingyue737"
            class="font-weight-bold text-primary"
            target="_blank"
            >Yue JIN</a
          >
          <span> & </span>
          <a
            href="https://www.nustarnuclear.com/"
            class="font-weight-bold text-primary"
            target="_blank"
            >NuStar</a
          >
        </div>
      </v-list-item>
    </template>
  </v-navigation-drawer>
</template>

<style>
.v-navigation-drawer {
  &.app-left-drawer {
    border-radius: 24px;
    margin-top: 56px;
    margin-left: 16px;
    height: calc(100% - 10px);
  }
  transition-property:
    box-shadow, transform, visibility, width, height, left, right, top, bottom,
    border-radius;
  overflow: hidden;
  &.v-navigation-drawer--rail {
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
    &.v-navigation-drawer--is-hovering {
      border-top-right-radius: 15px;
      border-bottom-right-radius: 15px;
      box-shadow:
        0px 1px 2px 0px rgb(0 0 0 / 30%),
        0px 1px 3px 1px rgb(0 0 0 / 15%);
    }
    &:not(.v-navigation-drawer--is-hovering) {
      .drawer-footer {
        transform: translateX(-160px);
      }
      .drawer-header-icon {
        height: 1em;
        width: 1em;
      }
      .v-list-group__items .v-list-item {
        padding-inline-start: 8px;
      }
    }
  }
  .v-navigation-drawer__content {
    overflow-y: hidden;
    @supports (scrollbar-gutter: stable) {
      scrollbar-gutter: stable;
      > .v-list--nav {
        padding-right: 0;
      }
    }
    &:hover {
      overflow-y: auto;
    }
  }
  .drawer-footer {
    transition: all 0.2s;
    min-height: 30px;
  }
  .app-left-drawer-list {
    height: calc(100% - 96px);
    min-height: calc(100% - 96px);
    max-height: calc(100% - 96px);
    overflow-y: auto;
  }
  .drawer-header-icon {
    opacity: 1;
    height: 1.2em;
    width: 1.2em;
    transition: all 0.2s;
    margin-right: -4px;
  }
  .v-list-group__items {
    --v-list-indent: 20px;
    margin-inline-start: 0;
    padding-inline-start: 0;
  }
  .app-left-drawer-list {
    .v-list-item {
      transition: all 0.2s;
      min-height: 40px;
      padding-block: 0;
      padding-inline: 12px 8px;
    }
    .v-list-item__prepend {
      margin-inline-end: 12px;
    }
    .v-list-group__items {
      padding-block: 0;
    }
    .v-list-group__items .v-list-item {
      min-height: 36px;
      padding-inline-start: calc(var(--v-list-indent) + 24px) !important;
    }
  }
}
</style>
