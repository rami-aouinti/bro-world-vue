<script setup lang="ts">
import { mergeProps } from 'vue'
import { useStorage } from '@vueuse/core'
import type { SessionUser } from '~/types/session'
import type { Notification } from '~/stores/notification'

const theme = useTheme()
const drawer = useState('drawer')
const showLeftDrawer = useState('show-left-drawer', () => true)
const showRightDrawer = useState('show-right-drawer', () => true)
const route = useRoute()
const { t } = useI18n()
const vision = useStorage<'light' | 'dark'>('color-scheme', 'dark')

const navMenus = [
  {
    label: 'appbar.feature',
    icon: 'mdi-star-outline',
    description: 'Explore what you can build with Bro World.',
    ctaLabel: 'View features',
    ctaTo: '/service',
    items: [
      {
        label: 'appbar.service',
        to: '/service',
        icon: 'mdi-briefcase-outline',
        detail:
          'Browse our key services and pick the best workflow for your team.',
      },
      {
        label: 'appbar.about',
        to: '/about',
        icon: 'mdi-information-outline',
        detail:
          'Get the story behind Bro World and discover our product vision.',
      },
      {
        label: 'appbar.faq',
        to: '/faq',
        icon: 'mdi-frequently-asked-questions',
        detail:
          'Find quick answers to common setup, account, and product questions.',
      },
    ],
  },
  {
    label: 'appbar.applications',
    icon: 'mdi-apps',
    description: 'Launch products and discover apps ready to scale.',
    ctaLabel: 'View platform',
    ctaTo: '/platform',
    items: [
      {
        label: 'appbar.platform',
        to: '/platform',
        icon: 'mdi-view-dashboard-outline',
        detail:
          'Access your central workspace with projects, metrics, and deployment status.',
      },
      {
        label: 'appbar.games',
        to: '/games',
        icon: 'mdi-gamepad-variant-outline',
        detail: 'Play and manage interactive game experiences from one place.',
      },
      {
        label: 'appbar.sports',
        to: '/applications/sports',
        icon: 'mdi-basketball',
        detail:
          'Track sports apps, scores, and fan-focused modules in real time.',
      },
      {
        label: 'appbar.quiz',
        to: '/applications/quiz',
        icon: 'mdi-help-box',
        detail:
          'Create engaging quizzes for onboarding, training, and community growth.',
      },
    ],
  },
]

const isDark = computed({
  get() {
    return theme.current.value.dark
  },
  set(v) {
    const next = v ? 'dark' : 'light'
    vision.value = next
    theme.change(next)
  },
})

const { fetch: refreshSession, loggedIn, clear, user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const avatarUrl = computed(() => sessionUser.value?.photo)
const loginDialogOpen = ref(false)
const loginLoading = ref(false)

const inboxNotificationsStore = useInboxNotificationsStore()
const notificationStore = useNotificationStore()
const { notificationsSortedDesc, unreadCount } = storeToRefs(
  inboxNotificationsStore,
)
const { notifications: actionNotifications } = storeToRefs(notificationStore)
const notificationMenuOpen = ref(false)

const userLabel = computed(() => {
  const fullName = [sessionUser.value?.firstName, sessionUser.value?.lastName]
    .filter(Boolean)
    .join(' ')

  return fullName || sessionUser.value?.username || t('appbar.user')
})
const allNotificationItems = computed(() => {
  const apiItems = notificationsSortedDesc.value.map((item) => ({
    id: `api-${item.id}`,
    title: item.title,
    createdAt: item.createdAt,
    icon: 'mdi-bell-ring-outline',
    to: `/notification/${item.id}`,
  }))
  const localItems = actionNotifications.value.map((item: Notification) => ({
    id: `local-${item.id}`,
    title: item.text,
    createdAt: item.time.toISOString(),
    icon: 'mdi-check-circle-outline',
    to: null,
  }))

  return [...apiItems, ...localItems].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
})
const unreadTotalCount = computed(
  () => unreadCount.value + actionNotifications.value.length,
)

watch(
  loggedIn,
  async (isLoggedIn) => {
    if (!isLoggedIn) return
    loginDialogOpen.value = false
    await Promise.all([inboxNotificationsStore.fetchNotifications()])
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

async function onLoginSubmit(payload: { username?: string; password: string }) {
  if (!payload.username) {
    Notify.error(t('auth.validation.required'))
    return
  }

  loginLoading.value = true

  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: {
        username: payload.username,
        password: payload.password,
      },
    })

    await refreshSession()

    if (!loggedIn.value) {
      Notify.error(t('auth.notifications.loginError'))
      return
    }

    Notify.success(t('auth.notifications.loginSuccess'))
    loginDialogOpen.value = false
  } catch {
    Notify.error(t('auth.notifications.loginError'))
  } finally {
    loginLoading.value = false
  }
}

function isMenuActive(paths: string[]) {
  return paths.some(
    (path) => route.path === path || route.path.startsWith(`${path}/`),
  )
}
</script>

<template>
  <v-app-bar
    :class="{ 'blur shadow-blur': !isDark }"
    class="app-bar app-bar--kind-glass px-0 border-radius-xl toolbar-content-padding-y-none v-sheet v-toolbar v-toolbar--flat v-app-bar bg-transparent"
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
      <v-menu v-for="menu in navMenus" :key="menu.label" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :prepend-icon="menu.icon"
            variant="text"
            size="small"
            rounded="lg"
            class="app-top-bar__nav-btn"
            :color="
              isMenuActive(menu.items.map((item) => item.to))
                ? 'primary'
                : undefined
            "
          >
            {{ t(menu.label) }}
          </v-btn>
        </template>
        <div class="app-top-bar__mega-menu app-top-bar__menu-surface">
          <div class="app-top-bar__mega-menu-header">
            <p class="text-overline text-primary mb-1">
              {{ t(menu.label) }}
            </p>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ menu.description }}
            </p>
          </div>

          <div class="app-top-bar__mega-menu-grid">
            <NuxtLink
              v-for="item in menu.items"
              :key="item.to"
              :to="item.to"
              class="app-top-bar__mega-menu-card"
            >
              <div class="app-top-bar__mega-menu-icon-wrap">
                <v-icon :icon="item.icon" size="22" />
              </div>
              <div>
                <p class="text-subtitle-1 font-weight-bold mb-1">
                  {{ t(item.label) }}
                </p>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ item.detail }}
                </p>
              </div>
            </NuxtLink>
          </div>

          <div class="app-top-bar__mega-menu-footer">
            <v-btn
              :to="menu.ctaTo"
              variant="text"
              append-icon="mdi-arrow-right"
              class="text-none"
            >
              {{ menu.ctaLabel }}
            </v-btn>
          </div>
        </div>
      </v-menu>
      <v-btn
        to="/contact"
        prepend-icon="mdi-email-outline"
        variant="text"
        size="small"
        rounded="lg"
        class="app-top-bar__nav-btn"
        :color="route.path === '/contact' ? 'primary' : undefined"
      >
        {{ t('appbar.contact') }}
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
        <v-menu
          v-model="notificationMenuOpen"
          location="bottom end"
          content-class="app-top-bar__menu-surface app-top-bar__menu-surface--compact"
        >
          <template #activator="{ props }">
            <v-badge
              :model-value="unreadTotalCount > 0"
              :content="unreadTotalCount"
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
          <v-list min-width="280" class="app-top-bar__menu-list">
            <v-list-item
              v-for="item in allNotificationItems"
              :key="item.id"
              :title="item.title"
              :prepend-icon="item.icon"
              :to="item.to || undefined"
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
        <v-btn
          variant="text"
          icon="mdi-inbox-outline"
          :aria-label="t('appbar.inbox')"
          to="/inbox"
        />
      </template>
      <v-menu
        location="bottom"
        content-class="app-top-bar__menu-surface app-top-bar__menu-surface--compact"
      >
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
        <v-list min-width="220" class="app-top-bar__menu-list">
          <template v-if="!loggedIn">
            <v-list-item
              :title="t('appbar.login')"
              prepend-icon="mdi-login"
              @click="loginDialogOpen = true"
            />
            <v-list-item
              :title="t('appbar.register')"
              prepend-icon="mdi-account-plus"
              to="/register"
            />
          </template>
          <template v-else>
            <v-list-item
              :title="t('appbar.profile')"
              prepend-icon="mdi-account-outline"
              to="/profile"
            />
            <v-divider class="my-1" />
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

    <v-dialog v-model="loginDialogOpen" max-width="560">
      <AuthFormCard
        mode="login"
        :loading="loginLoading"
        @submit="onLoginSubmit"
      >
        <template #switch>
          {{ t('auth.login.switchPrompt') }}
          <NuxtLink to="/register" class="text-primary font-weight-bold">
            {{ t('auth.login.switchCta') }}
          </NuxtLink>
        </template>
      </AuthFormCard>
    </v-dialog>
  </v-app-bar>
</template>

<style scoped>
.app-bar {
  --app-right-drawer-width: 300px;
  --app-right-drawer-gap: 16px;
  position: fixed;
  top: var(--ui-spacing-sm);
  left: var(--ui-spacing-md);
  right: var(--ui-spacing-md);
  z-index: 1100;
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

.app-top-bar__mega-menu {
  width: min(920px, 92vw);
  margin-top: 8px;
  overflow: hidden;
}

.app-top-bar__menu-surface,
:deep(.app-top-bar__menu-surface) {
  border-radius: 18px;
  border: 1px solid rgba(var(--v-border-color), 0.32);
  background:
    linear-gradient(
      240deg,
      rgba(var(--v-theme-primary), 0.16) 0%,
      transparent 24%
    ),
    color-mix(in srgb, rgb(var(--v-theme-surface)) 84%, transparent);
  box-shadow:
    0 22px 54px rgba(0, 0, 0, 0.34),
    0 0 0 1px rgba(var(--v-theme-primary), 0.16) inset;
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  color: rgb(var(--v-theme-on-surface));
}

:deep(.app-top-bar__menu-surface--compact) {
  border-radius: 14px;
  background:
    linear-gradient(
      240deg,
      rgba(var(--v-theme-primary), 0.12) 0%,
      transparent 28%
    ),
    color-mix(in srgb, rgb(var(--v-theme-surface)) 88%, transparent);
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(var(--v-theme-primary), 0.14) inset;
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
}

:deep(.app-top-bar__menu-list) {
  background: transparent !important;
  color: rgb(var(--v-theme-on-surface));
  padding-block: 4px;
}

:deep(.app-top-bar__menu-list .v-list-item) {
  color: rgb(var(--v-theme-on-surface));
}

.app-top-bar__mega-menu-header {
  padding: 18px 22px 10px;
}

.app-top-bar__mega-menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 14px;
  padding: 0 20px 16px;
}

.app-top-bar__mega-menu-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 116px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(255, 255, 255, 0.03);
  text-decoration: none;
  color: rgb(var(--v-theme-on-surface));
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease;
}

.app-top-bar__mega-menu-card:hover {
  transform: translateY(-3px);
  border-color: rgba(var(--v-theme-primary), 0.65);
  background: rgba(var(--v-theme-primary), 0.1);
}

.app-top-bar__mega-menu-icon-wrap {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.14);
  color: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}

.app-top-bar__mega-menu-footer {
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(var(--v-border-color), 0.24);
  padding: 10px;
}

.app-brand {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
}

@media (min-width: 1280px) {
  .app-bar {
    right: calc(
      var(--app-right-drawer-width) + var(--app-right-drawer-gap) +
        var(--ui-spacing-md)
    );
  }
}
@media (max-width: 1100px) {
  .app-top-bar__mega-menu-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}
</style>
