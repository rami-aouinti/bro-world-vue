<script setup lang="ts">
import { mergeProps } from 'vue'
import type { SessionUser } from '~/types/session'

const theme = useTheme()
const drawer = useState('drawer')
const showLeftDrawer = useState('show-left-drawer', () => true)
const showRightDrawer = useState('show-right-drawer', () => true)
const route = useRoute()
const { t } = useI18n()

const navItems = [
  { label: 'appbar.platform', to: '/platform', icon: 'mdi-view-dashboard-outline' },
  { label: 'appbar.games', to: '/games', icon: 'mdi-gamepad-variant-outline' },
  { label: 'appbar.about', to: '/about', icon: 'mdi-information-outline' },
  { label: 'appbar.contact', to: '/contact', icon: 'mdi-email-outline' },
]

const isDark = computed({
  get() {
    return theme.current.value.dark
  },
  set(v) {
    theme.change(v ? 'dark' : 'light')
  },
})

const { loggedIn, clear, user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const avatarUrl = computed(() => sessionUser.value?.photo)

const inboxNotificationsStore = useInboxNotificationsStore()
const { inboxLatestThree, notificationsLatestThree, unreadCount } = storeToRefs(
  inboxNotificationsStore,
)
const notificationMenuOpen = ref(false)

const userLabel = computed(() => {
  const fullName = [sessionUser.value?.firstName, sessionUser.value?.lastName]
    .filter(Boolean)
    .join(' ')

  return fullName || sessionUser.value?.username || t('appbar.user')
})

watch(
  loggedIn,
  async (isLoggedIn) => {
    if (!isLoggedIn) return
    await Promise.all([
      inboxNotificationsStore.fetchNotifications(),
      inboxNotificationsStore.fetchInboxConversations(),
    ])
  },
  { immediate: true },
)

watch(notificationMenuOpen, async (isOpen) => {
  if (!isOpen || unreadCount.value === 0) return
  await inboxNotificationsStore.markAllNotificationsRead()
})

function toggleLeftDrawer() {
  if (!showLeftDrawer.value) return
  drawer.value = !drawer.value
}
</script>

<template>
  <v-app-bar
    :class="{ 'blur shadow-blur': !isDark }"
    class="app-bar app-bar--kind-glass px-0 border-radius-xl toolbar-content-padding-y-none v-sheet v-toolbar v-toolbar--flat v-app-bar bg-transparent position-sticky top-1 z-index-sticky"
  >
    <div class="app-top-bar__left mx-4">
      <v-icon
        icon="custom:world"
        size="x-large"
        class="drawer-header-icon"
        color="primary"
        to="/"
      />
      <NuxtLink to="/" class="app-brand text-decoration-none">
        <h2>{{ t('app.name') }}</h2>
      </NuxtLink>
      <v-spacer />
      <v-app-bar-nav-icon
        class="mx-5"
        :disabled="!showLeftDrawer"
        aria-label="Toggle left drawer"
        @click="toggleLeftDrawer"
      />
    </div>

    <div class="app-top-bar__nav d-none d-md-flex">
      <v-btn
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        variant="text"
        size="small"
        rounded="lg"
        class="app-top-bar__nav-btn"
        :color="route.path === item.to ? 'primary' : undefined"
      >
        {{ t(item.label) }}
      </v-btn>
    </div>

    <div id="app-bar" class="app-top-bar__portal" />

    <div class="app-top-bar__right">
      <v-app-bar-nav-icon
        class="app-top-bar__right-drawer-toggle mx-5"
        :aria-label="
          showRightDrawer
            ? t('appbar.hideRightDrawer')
            : t('appbar.showRightDrawer')
        "
        @click="showRightDrawer = !showRightDrawer"
      />

      <v-spacer />
      <template v-if="loggedIn">
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn
              variant="text"
              icon="mdi-chat-outline"
              :aria-label="t('actions.showAll')"
              v-bind="props"
            />
          </template>
          <v-list min-width="280">
            <v-list-item
              v-for="item in inboxLatestThree"
              :key="item.id"
              :title="item.title"
              prepend-icon="mdi-email-outline"
              :to="`/inbox/${item.id}`"
            />
            <v-divider class="my-1" />
            <v-list-item
              :title="t('actions.showAll')"
              append-icon="mdi-arrow-right"
              to="/inbox"
            />
          </v-list>
        </v-menu>

        <v-menu v-model="notificationMenuOpen" location="bottom end">
          <template #activator="{ props }">
            <v-badge
              :model-value="unreadCount > 0"
              :content="unreadCount"
              color="primary"
              offset-x="10"
              offset-y="10"
            >
              <v-btn
                variant="text"
                icon="mdi-bell-outline"
                :aria-label="t('appbar.notification')"
                v-bind="props"
              />
            </v-badge>
          </template>
          <v-list min-width="280">
            <v-list-item
              v-for="item in notificationsLatestThree"
              :key="item.id"
              :title="item.title"
              prepend-icon="mdi-bell-ring-outline"
              :to="`/notification/${item.id}`"
            />
            <v-divider class="my-1" />
            <v-list-item
              :title="t('actions.showAll')"
              append-icon="mdi-arrow-right"
              to="/notification"
            />
          </v-list>
        </v-menu>

        <v-btn
          variant="text"
          icon="mdi-calendar-month-outline"
          :aria-label="t('appbar.calendar')"
          to="/calendar"
        />
      </template>
      <AppNotification />
      <v-menu location="bottom">
        <template #activator="{ props: menu }">
          <v-tooltip
            location="bottom"
            :aria-label="loggedIn ? userLabel : t('appbar.user')"
            :text="loggedIn ? userLabel : t('appbar.user')"
            :content-props="{
              'aria-label': loggedIn ? userLabel : t('appbar.user'),
            }"
          >
            <template #activator="{ props: tooltip }">
              <v-badge
                dot
                bordered
                :color="loggedIn ? 'success' : 'error'"
                location="bottom end"
                offset-x="6"
                offset-y="6"
              >
                <v-btn
                  icon
                  :aria-label="loggedIn ? userLabel : t('appbar.user')"
                  v-bind="mergeProps(menu, tooltip)"
                >
                  <v-icon
                    v-if="!loggedIn"
                    icon="mdi-account-circle"
                    size="28"
                  />
                  <v-avatar
                    v-else
                    color="primary"
                    size="28"
                    class="cursor-pointer"
                  >
                    <v-img :src="avatarUrl" :alt="`${userLabel} avatar`" />
                  </v-avatar>
                </v-btn>
              </v-badge>
            </template>
          </v-tooltip>
        </template>
        <v-list min-width="220">
          <v-list-item
            v-if="!loggedIn"
            :title="t('appbar.login')"
            prepend-icon="mdi-login"
            to="/login"
          />
          <v-list-item
            v-if="!loggedIn"
            :title="t('appbar.register')"
            prepend-icon="mdi-account-plus"
            to="/register"
          />
          <template v-else>
            <v-list-item
              :title="t('appbar.profile')"
              prepend-icon="mdi-account-outline"
              to="/profile"
            />
            <v-list-item
              :title="t('appbar.settings')"
              prepend-icon="mdi-cog-outline"
              to="/profile/settings"
            />
            <v-list-item
              :title="t('appbar.logout')"
              prepend-icon="mdi-logout"
              @click="clear"
            />
          </template>
        </v-list>
      </v-menu>
      <AppLanguageSwitcher />

      <v-btn
        icon
        size="44"
        variant="text"
        class="app-bar-controls__theme"
        :aria-label="
          isDark ? t('appbar.switchToLight') : t('appbar.switchToDark')
        "
        @click="isDark = !isDark"
      >
        <v-icon
          :icon="isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night'"
          size="28"
        />
      </v-btn>
    </div>
  </v-app-bar>
</template>

<style scoped>
.app-bar {
  margin: var(--ui-spacing-sm) var(--ui-spacing-md);
  padding-inline: var(--ui-spacing-lg);
}

.app-bar--kind-glass {
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 82%, transparent);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  box-shadow: 0 12px 24px rgba(var(--v-theme-primary), 0.28);
  backdrop-filter: blur(8px);
}

.app-bar--dark {
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 88%, #000 12%);
}

.app-top-bar__left,
.app-top-bar__right {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.app-top-bar__left {
  margin-right: 12px;
}

.app-top-bar__nav {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.app-top-bar__nav-btn {
  height: 44px;
  min-height: 44px;
  padding-inline: 14px;
}

.app-top-bar__right {
  margin-left: auto;
  max-width: 100%;
  overflow: hidden;
}

.app-top-bar__portal {
  display: flex;
  align-items: center;
}

.app-top-bar__right-drawer-toggle {
  margin-inline-end: 2px;
}

.app-brand {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
}
</style>
