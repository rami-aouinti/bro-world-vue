<script setup lang="ts">
import { mergeProps } from 'vue'
import { useStorage } from '@vueuse/core'
import type { SessionUser } from '~/types/session'
import type { Notification } from '~/stores/notification'
import type { WorldShopCartLine } from '~/types/world/shop'

type ShopCartResponse = {
  id?: string
  currency?: string
  currencyCode?: string
  totalAmount?: number
  subtotal?: number
  subtotalAmount?: number
  items?: WorldShopCartLine[]
  cart?: WorldShopCartLine[]
}

type ShopCartItem = WorldShopCartLine & {
  id?: string
  photo?: string
  lineTotal?: number
  unitPriceSnapshot?: number
  product?: {
    id?: string
    name?: string
    photo?: string
  }
}

const theme = useTheme()
const drawer = useState('drawer')
const showLeftDrawer = useState('show-left-drawer', () => true)
const showRightDrawerDesktop = useState('show-right-drawer-desktop', () => true)
const showRightDrawerMobile = useState('show-right-drawer-mobile', () => false)
const { mobile } = useDisplay()
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
      {
        label: 'appbar.contact',
        to: '/contact',
        icon: 'mdi-email-outline',
        detail:
          'Reach out to our team for partnerships, support, and collaboration.',
      },
    ],
    twoColumns: true,
    compactCards: true,
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
    twoColumns: true,
    compactCards: true,
  },
  {
    label: 'appbar.world',
    icon: 'mdi-earth',
    description: 'Explore all world business modules.',
    ctaLabel: 'Open World',
    ctaTo: '/world',
    items: [
      {
        label: 'world.crm.label',
        to: '/world/crm',
        icon: 'mdi-account-group-outline',
        detail:
          'Manage projects, companies, pipelines, and governance modules.',
      },
      {
        label: 'world.shop.label',
        to: '/world/shop',
        icon: 'mdi-storefront-outline',
        detail:
          'Run products, categories, checkout, payment, and order operations.',
      },
      {
        label: 'world.learning.label',
        to: '/world/learning',
        icon: 'mdi-school-outline',
        detail:
          'Organize courses, levels, and learning paths for every audience.',
      },
      {
        label: 'world.jobs.label',
        to: '/world/jobs',
        icon: 'mdi-briefcase-search-outline',
        detail: 'Track offers, applications, and personal hiring workflows.',
      },
    ],
    twoColumns: true,
    compactCards: true,
  },
]

const featureMenu = navMenus[0]!
const applicationsMenu = navMenus[1]!
const worldMenu = navMenus[2]!

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
const shopStore = useWorldShopStore()

const inboxNotificationsStore = useInboxNotificationsStore()
const notificationStore = useNotificationStore()
const { notificationsSortedDesc, unreadCount, inboxLatestThree } = storeToRefs(
  inboxNotificationsStore,
)
const { notifications: actionNotifications } = storeToRefs(notificationStore)
const notificationMenuOpen = ref(false)
const inboxMenuOpen = ref(false)
const mobileFeatureMenuOpen = ref(false)
const mobileApplicationsMenuOpen = ref(false)
const mobileWorldMenuOpen = ref(false)

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
const cartPayload = computed(() => shopStore.cart as ShopCartResponse | null)
const cartItems = computed(() => {
  const payload = cartPayload.value
  if (!payload) return []
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.cart)) return payload.cart
  return []
})
const cartCount = computed(() =>
  cartItems.value.reduce((sum, line) => sum + (line.quantity || 0), 0),
)
const cartTotalAmount = computed(() => {
  const payload = cartPayload.value
  if (!payload) return 0
  if (typeof payload.totalAmount === 'number') return payload.totalAmount
  if (typeof payload.subtotal === 'number') return payload.subtotal
  if (typeof payload.subtotalAmount === 'number') return payload.subtotalAmount
  return cartItems.value.reduce(
    (sum, line: ShopCartItem) =>
      sum +
      (typeof line.lineTotal === 'number'
        ? Number(line.lineTotal || 0)
        : Number(line.unitPrice || line.unitPriceSnapshot || 0) *
          Number(line.quantity || 0)),
    0,
  )
})
const cartCurrency = computed(
  () => cartPayload.value?.currency || cartPayload.value?.currencyCode || 'EUR',
)
const showCartMenu = computed(() => loggedIn.value && cartCount.value > 0)

function getCartItemPhoto(line: ShopCartItem) {
  return line.photo || line.product?.photo || ''
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}
const showRightDrawer = computed({
  get: () =>
    mobile.value ? showRightDrawerMobile.value : showRightDrawerDesktop.value,
  set: (value: boolean) => {
    if (mobile.value) {
      showRightDrawerMobile.value = value
      return
    }

    showRightDrawerDesktop.value = value
  },
})

watch(
  loggedIn,
  async (isLoggedIn) => {
    if (!isLoggedIn) return
    loginDialogOpen.value = false
    await Promise.all([
      inboxNotificationsStore.fetchNotifications(),
      inboxNotificationsStore.fetchInboxConversations(),
      shopStore.fetchCart(),
    ])
  },
  { immediate: true },
)

watch(notificationMenuOpen, async (isOpen) => {
  if (!isOpen || unreadCount.value === 0) return
  await inboxNotificationsStore.markAllNotificationsRead()
})

function toggleLeftDrawer() {
  if (!showLeftDrawer.value && !mobile.value) return
  drawer.value = !drawer.value
}

function goToCheckout() {
  void navigateTo('/world/shop/checkout')
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
      <v-btn
        to="/"
        icon
        variant="text"
        class="app-brand-icon"
        aria-label="Home"
        exact
      >
        <v-icon
          icon="custom:world"
          size="x-large"
          class="drawer-header-icon"
          color="primary"
        />
      </v-btn>
      <NuxtLink v-if="!mobile" to="/" class="app-brand text-decoration-none">
        <h2>{{ t('app.name') }}</h2>
      </NuxtLink>
      <v-spacer />
      <v-app-bar-nav-icon
        class="app-top-bar__left-drawer-toggle"
        :disabled="!showLeftDrawer && !mobile"
        aria-label="Toggle left drawer"
        @click="toggleLeftDrawer"
      />
    </div>

    <div v-if="mobile" class="app-top-bar__nav app-top-bar__nav--mobile">
      <v-menu v-model="mobileFeatureMenuOpen" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :icon="featureMenu.icon"
            variant="text"
            size="small"
            rounded="lg"
            class="app-top-bar__nav-icon-btn"
            :aria-label="t(featureMenu.label)"
            :color="
              isMenuActive(featureMenu.items.map((item) => item.to))
                ? 'primary'
                : undefined
            "
          />
        </template>
        <div
          class="app-top-bar__mega-menu app-top-bar__menu-surface app-top-bar__mega-menu--mobile"
        >
          <div class="app-top-bar__mega-menu-header">
            <p class="text-overline text-primary mb-1">
              {{ t(featureMenu.label) }}
            </p>
          </div>
          <div class="app-top-bar__mega-menu-grid">
            <NuxtLink
              v-for="item in featureMenu.items"
              :key="item.to"
              :to="item.to"
              class="app-top-bar__mega-menu-card app-top-bar__mega-menu-card--mobile"
              @click="mobileFeatureMenuOpen = false"
            >
              <div class="app-top-bar__mega-menu-icon-wrap">
                <v-icon :icon="item.icon" size="22" />
              </div>
              <div>
                <p class="text-body-1 font-weight-bold mb-1">
                  {{ t(item.label) }}
                </p>
                <p class="text-caption text-medium-emphasis mb-0">
                  {{ item.detail }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </v-menu>

      <v-menu v-model="mobileApplicationsMenuOpen" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :icon="applicationsMenu.icon"
            variant="text"
            size="small"
            rounded="lg"
            class="app-top-bar__nav-icon-btn"
            :aria-label="t(applicationsMenu.label)"
            :color="
              isMenuActive(applicationsMenu.items.map((item) => item.to))
                ? 'primary'
                : undefined
            "
          />
        </template>
        <div
          class="app-top-bar__mega-menu app-top-bar__menu-surface app-top-bar__mega-menu--mobile"
        >
          <div class="app-top-bar__mega-menu-header">
            <p class="text-overline text-primary mb-1">
              {{ t(applicationsMenu.label) }}
            </p>
          </div>
          <div
            class="app-top-bar__mega-menu-grid app-top-bar__mega-menu-grid--two-columns"
          >
            <NuxtLink
              v-for="item in applicationsMenu.items"
              :key="item.to"
              :to="item.to"
              class="app-top-bar__mega-menu-card app-top-bar__mega-menu-card--mobile"
              @click="mobileApplicationsMenuOpen = false"
            >
              <div class="app-top-bar__mega-menu-icon-wrap">
                <v-icon :icon="item.icon" size="22" />
              </div>
              <div>
                <p class="text-body-1 font-weight-bold mb-1">
                  {{ t(item.label) }}
                </p>
                <p class="text-caption text-medium-emphasis mb-0">
                  {{ item.detail }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </v-menu>

      <v-menu v-model="mobileWorldMenuOpen" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :icon="worldMenu.icon"
            variant="text"
            size="small"
            rounded="lg"
            class="app-top-bar__nav-icon-btn"
            :aria-label="t(worldMenu.label)"
            :color="
              isMenuActive(worldMenu.items.map((item) => item.to))
                ? 'primary'
                : undefined
            "
          />
        </template>
        <div
          class="app-top-bar__mega-menu app-top-bar__menu-surface app-top-bar__mega-menu--mobile"
        >
          <div class="app-top-bar__mega-menu-header">
            <p class="text-overline text-primary mb-1">
              {{ t(worldMenu.label) }}
            </p>
          </div>
          <div
            class="app-top-bar__mega-menu-grid app-top-bar__mega-menu-grid--two-columns"
          >
            <NuxtLink
              v-for="item in worldMenu.items"
              :key="item.to"
              :to="item.to"
              class="app-top-bar__mega-menu-card app-top-bar__mega-menu-card--mobile"
              @click="mobileWorldMenuOpen = false"
            >
              <div class="app-top-bar__mega-menu-icon-wrap">
                <v-icon :icon="item.icon" size="22" />
              </div>
              <div>
                <p class="text-body-1 font-weight-bold mb-1">
                  {{ t(item.label) }}
                </p>
                <p class="text-caption text-medium-emphasis mb-0">
                  {{ item.detail }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </v-menu>
    </div>

    <div v-else class="app-top-bar__nav d-none d-md-flex">
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

          <div
            class="app-top-bar__mega-menu-grid"
            :class="{
              'app-top-bar__mega-menu-grid--two-columns': menu.twoColumns,
            }"
          >
            <NuxtLink
              v-for="item in menu.items"
              :key="item.to"
              :to="item.to"
              class="app-top-bar__mega-menu-card"
              :class="{
                'app-top-bar__mega-menu-card--compact': menu.compactCards,
              }"
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
    </div>

    <div id="app-bar" class="app-top-bar__portal" />

    <div class="app-top-bar__right">
      <v-app-bar-nav-icon
        class="app-top-bar__right-drawer-toggle"
        :aria-label="
          showRightDrawer
            ? t('appbar.hideRightDrawer')
            : t('appbar.showRightDrawer')
        "
        @click="showRightDrawer = !showRightDrawer"
      />
      <div class="app-top-bar__right-controls">
        <template v-if="loggedIn">
          <v-menu
            v-if="!mobile"
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

          <template v-if="!mobile">
            <v-menu
              v-if="showCartMenu"
              location="bottom end"
              content-class="app-top-bar__menu-surface app-top-bar__menu-surface--compact"
            >
              <template #activator="{ props }">
                <v-badge
                  :content="cartCount"
                  color="primary"
                  offset-x="10"
                  offset-y="10"
                >
                  <v-btn
                    variant="text"
                    icon="mdi-cart-outline"
                    :aria-label="t('appbar.cart', 'Cart')"
                    v-bind="props"
                  />
                </v-badge>
              </template>
              <v-list min-width="340" class="app-top-bar__menu-list">
                <v-list-subheader>
                  {{ t('appbar.cart', 'Cart') }}
                </v-list-subheader>
                <v-list-item
                  v-for="line in cartItems"
                  :key="line.productId || line.product?.id || line.id"
                  :title="line.name || line.product?.name || line.productId"
                  :subtitle="`x${line.quantity}`"
                >
                  <template #prepend>
                    <v-avatar rounded="lg" size="40" class="mr-3">
                      <v-img
                        :src="getCartItemPhoto(line)"
                        :alt="line.name || line.product?.name || line.productId"
                        cover
                      >
                        <template #error>
                          <v-icon icon="mdi-image-off-outline" size="20" />
                        </template>
                      </v-img>
                    </v-avatar>
                  </template>
                  <template #append>
                    <span class="text-body-2 font-weight-medium">
                      {{
                        formatMoney(
                          typeof line.lineTotal === 'number'
                            ? Number(line.lineTotal || 0)
                            : Number(line.unitPrice || line.unitPriceSnapshot || 0) *
                                Number(line.quantity || 0),
                          cartCurrency,
                        )
                      }}
                    </span>
                  </template>
                </v-list-item>
                <v-divider class="my-1" />
                <v-list-item :title="t('appbar.total', 'Total')">
                  <template #append>
                    <strong>{{ formatMoney(cartTotalAmount, cartCurrency) }}</strong>
                  </template>
                </v-list-item>
                <v-list-item>
                  <v-btn variant="tonal" block color="primary" prepend-icon="mdi-credit-card-outline" @click="goToCheckout">
                    {{ t('world.shop.actions.checkout', 'Checkout') }}
                  </v-btn>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-menu
              v-model="inboxMenuOpen"
              location="bottom end"
              content-class="app-top-bar__menu-surface app-top-bar__menu-surface--compact"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="text"
                  icon="mdi-message-text-outline"
                  :aria-label="t('appbar.inbox')"
                />
              </template>
              <v-list min-width="300" class="app-top-bar__menu-list">
                <v-list-subheader>
                  {{ t('appbar.inbox') }}
                </v-list-subheader>
                <v-list-item
                  v-for="item in inboxLatestThree"
                  :key="item.id"
                  :title="item.title"
                  :subtitle="item.preview || item.content || '...'
                  "
                  @click="navigateTo({ path: '/inbox', query: { conversation: item.id } }); inboxMenuOpen = false"
                >
                  <template #prepend>
                    <v-avatar size="32">
                      <v-img
                        v-if="item.avatar"
                        :src="item.avatar"
                        :alt="item.title"
                        cover
                      />
                      <v-icon v-else icon="mdi-message-text-outline" />
                    </v-avatar>
                  </template>
                </v-list-item>
                <v-list-item
                  v-if="inboxLatestThree.length === 0"
                  :title="t('notification.none')"
                  prepend-icon="mdi-inbox-outline"
                />
                <v-divider class="my-1" />
                <v-list-item
                  :title="t('appbar.inbox')"
                  append-icon="mdi-arrow-right"
                  to="/inbox"
                  @click="inboxMenuOpen = false"
                />
              </v-list>
            </v-menu>
          </template>
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
              <v-list-item
                :title="t('appbar.calendar')"
                prepend-icon="mdi-calendar-month-outline"
                to="/calendar"
              />
              <v-list-item
                :title="t('world.shop.nav.orders', 'Orders')"
                prepend-icon="mdi-receipt-text-outline"
                to="/world/shop/orders"
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
        <template v-if="!mobile">
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
        </template>
      </div>
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
  --app-right-drawer-width: 340px;
  --app-right-drawer-gap: 16px;
  position: fixed;
  top: var(--ui-spacing-sm);
  left: var(--ui-spacing-md);
  right: var(--ui-spacing-md);
  z-index: 1100;
  padding-inline: var(--ui-spacing-lg);
}

.app-bar--kind-glass {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  box-shadow: 0 12px 24px rgba(var(--v-theme-primary), 0.1);
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
  --app-left-drawer-width: 260px;
  flex: 0 0 var(--app-left-drawer-width);
  width: var(--app-left-drawer-width);
  margin-right: 12px;
}

.app-top-bar__left-drawer-toggle {
  margin-inline-start: auto;
  margin-inline-end: 8px;
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

.app-top-bar__nav-icon-btn {
  min-width: 40px;
}

:deep(.app-top-bar__nav-btn .v-btn__prepend .v-icon) {
  font-size: 18px;
  width: 18px;
  height: 18px;
}

:deep(.app-top-bar__nav-btn .v-btn__content) {
  font-size: 1rem;
  font-weight: 600;
}

.app-top-bar__right {
  --app-right-controls-width: var(--app-right-drawer-width);
  margin-left: auto;
  flex: 0 0 var(--app-right-controls-width);
  width: var(--app-right-controls-width);
  justify-content: space-between;
  max-width: 100%;
  overflow: hidden;
}

.app-top-bar__right-controls {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  min-width: 0;
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

.app-top-bar__mega-menu-grid--two-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.app-top-bar__mega-menu-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 104px;
  padding: 14px;
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

.app-top-bar__mega-menu-card--compact {
  min-height: 96px;
  padding: 12px;
  gap: 10px;
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

.app-brand-icon {
  display: inline-flex;
}

:deep(.app-brand-icon.v-btn--active > .v-btn__overlay) {
  opacity: 0 !important;
}

:deep(.app-brand-icon.v-btn--active) {
  background-color: transparent !important;
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
  .app-top-bar__right {
    flex: 0 1 auto;
    width: auto;
    justify-content: flex-end;
  }

  .app-top-bar__mega-menu-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .app-top-bar__mega-menu-grid--two-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .app-bar {
    left: var(--ui-spacing-sm);
    right: var(--ui-spacing-sm);
    padding-inline: var(--ui-spacing-sm);
  }

  .app-top-bar__left {
    flex: 0 1 auto;
    width: auto;
    margin-right: 0;
  }

  .app-top-bar__nav--mobile {
    flex: 1 1 auto;
    justify-content: center;
    gap: 0;
    min-width: 0;
  }

  .app-top-bar__right {
    flex: 0 1 auto;
    width: auto;
  }

  .app-top-bar__mega-menu-grid--two-columns {
    grid-template-columns: 1fr;
  }

  .app-top-bar__mega-menu--mobile {
    width: min(340px, calc(100vw - 24px));
    padding: 14px;
    border-radius: 14px;
  }

  .app-top-bar__mega-menu-card--mobile {
    padding: 10px;
    gap: 10px;
  }

  .app-top-bar__mega-menu-card--mobile .text-caption {
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
