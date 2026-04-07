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
  { label: 'appbar.platform', to: '/platform' },
  { label: 'appbar.service', to: '/service' },
  { label: 'appbar.about', to: '/about' },
  { label: 'appbar.contact', to: '/contact' },
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
const { inboxLatestThree, notificationsLatestThree, unreadCount } = storeToRefs(inboxNotificationsStore)
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
    await inboxNotificationsStore.fetchNotifications()
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
  <v-app-bar flat class="app-top-bar rounded-pill">
    <div class="app-top-bar__left mx-4">
      <v-icon
        icon="custom:vitify-nuxt"
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
        @click="toggleLeftDrawer"
      />
    </div>

    <v-toolbar-items class="app-top-bar__nav d-none d-md-flex">
      <v-btn
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        variant="text"
        :color="route.path === item.to ? 'primary' : undefined"
      >
        {{ t(item.label) }}
      </v-btn>
    </v-toolbar-items>

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
            <v-badge :model-value="unreadCount > 0" :content="unreadCount" color="error" offset-x="2" offset-y="2">
              <v-btn
                variant="text"
                icon="mdi-bell-outline"
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
          to="/calendar"
        />
      </template>
      <v-menu location="bottom">
        <template #activator="{ props: menu }">
          <v-tooltip location="bottom">
            <template #activator="{ props: tooltip }">
              <v-badge
                dot
                bordered
                :color="loggedIn ? 'success' : 'error'"
                location="bottom end"
                offset-x="6"
                offset-y="6"
              >
                <v-btn icon v-bind="mergeProps(menu, tooltip)">
                  <v-icon
                    v-if="!loggedIn"
                    icon="mdi-account-circle"
                    size="28"
                  />
                  <v-avatar v-else color="primary" size="28" class="cursor-pointer">
                    <v-img :src="avatarUrl" />
                  </v-avatar>
                </v-btn>
              </v-badge>
            </template>
            <span>{{ loggedIn ? userLabel : t('appbar.user') }}</span>
          </v-tooltip>
        </template>
        <v-list>
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
.app-top-bar {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  width: min(1240px, calc(100% - 32px));
  margin: 16px auto 0;
  padding-inline: 8px;
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
  justify-content: center;
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

.app-bar-controls__theme {
  color: rgb(var(--v-theme-primary));
}
</style>
