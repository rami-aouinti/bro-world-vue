<script setup lang="ts">
import { mergeProps } from 'vue'
import { useStorage } from '@vueuse/core'
import type { Notification } from '~/stores/notification'

const { t } = useI18n()
const { mobile } = useDisplay()
const { locale, setLocale } = useI18n({ useScope: 'global' })

const theme = useTheme()
const vision = useStorage('color-scheme', 'dark')
const primary = useStorage('theme-primary', '#e91e63')
const primaryGradient = useStorage('theme-primary-gradient', '#f06292')
const rounded = useStorage('theme-rounded', 'md')
const shadow = useStorage('theme-shadow', 'none')

if (import.meta.client) {
  watchEffect(() => {
    document.documentElement.dataset.appRounded = rounded.value
    document.documentElement.dataset.appShadow = shadow.value
  })
}

const roundedOptions = computed(() => [
  { title: t('appbar.rounded.none'), value: 'none' },
  { title: t('appbar.rounded.soft'), value: 'sm' },
  { title: t('appbar.rounded.default'), value: 'md' },
  { title: t('appbar.rounded.large'), value: 'lg' },
])

const shadowOptions = computed(() => [
  { title: t('appbar.shadow.flat'), value: 'none' },
  { title: t('appbar.shadow.soft'), value: 'soft' },
  { title: t('appbar.shadow.default'), value: 'medium' },
  { title: t('appbar.shadow.strong'), value: 'strong' },
])

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function shiftHexColor(hex: string, shift: number) {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return hex

  const channels = [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ]

  if (channels.some((channel) => Number.isNaN(channel))) {
    return hex
  }

  return `#${channels
    .map((channel) =>
      clampChannel(channel + shift)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

function toHexColor(value: string) {
  if (!value.startsWith('rgb')) return value
  const [r = 0, g = 0, b = 0] = value
    .replace(/rgba?\(/, '')
    .replace(')', '')
    .split(',')
    .map((chunk) => Number.parseInt(chunk.trim(), 10))
  return `#${[r, g, b]
    .map((channel) =>
      Math.max(0, Math.min(255, channel)).toString(16).padStart(2, '0'),
    )
    .join('')}`
}

function applyPrimaryColor(value: string) {
  const next = toHexColor(value)
  const nextGradient = shiftHexColor(next, 18)

  primary.value = next
  primaryGradient.value = nextGradient

  if (theme.themes.value.light?.colors) {
    Object.assign(theme.themes.value.light.colors, {
      primary: next,
      'primary-gradient': nextGradient,
    })
  }
  if (theme.themes.value.dark?.colors) {
    Object.assign(theme.themes.value.dark.colors, {
      primary: next,
      'primary-gradient': nextGradient,
    })
  }
  Object.assign(theme.global.current.value.colors, {
    primary: next,
    'primary-gradient': nextGradient,
  })

  if (import.meta.client) {
    document.documentElement.style.setProperty('--color-primary', next)
    document.documentElement.style.setProperty(
      '--color-primary-gradient',
      nextGradient,
    )
  }
}

watch(primary, (value) => applyPrimaryColor(value), { immediate: true })

watch(
  vision,
  (value) => {
    theme.change(value === 'light' ? 'light' : 'dark')
  },
  { immediate: true },
)

const color = computed({
  get() {
    return primary.value
  },
  set(val: string) {
    applyPrimaryColor(val)
  },
})

const colors = [
  ['#0f6ea8', '#ff9800'],
  ['#4CAF50', '#FF5252'],
  ['#9C27b0', '#E91E63'],
  ['#304156', '#3f51b5'],
  ['#002FA7', '#492d22'],
]

const menuShow = ref(false)
const notificationMenuShow = ref(false)
const inboxMenuShow = ref(false)
const languageMenuShow = ref(false)

const { loggedIn } = useUserSession()
const inboxNotificationsStore = useInboxNotificationsStore()
const notificationStore = useNotificationStore()
const { notificationsSortedDesc, unreadCount } = storeToRefs(
  inboxNotificationsStore,
)
const { notifications: actionNotifications } = storeToRefs(notificationStore)

watch(
  loggedIn,
  async (isLoggedIn) => {
    if (!isLoggedIn) return
    await inboxNotificationsStore.fetchNotifications()
  },
  { immediate: true },
)

watch(notificationMenuShow, async (isOpen) => {
  if (!isOpen || unreadCount.value === 0) return
  await inboxNotificationsStore.markAllNotificationsRead()
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

type SupportedLocale = 'en' | 'fr' | 'es' | 'de'

type LocaleOption = {
  title: string
  value: SupportedLocale
  flagClass: string
}

const localeOptions: LocaleOption[] = [
  { title: 'appbar.languages.en', value: 'en', flagClass: 'fi fi-gb' },
  { title: 'appbar.languages.fr', value: 'fr', flagClass: 'fi fi-fr' },
  { title: 'appbar.languages.es', value: 'es', flagClass: 'fi fi-es' },
  { title: 'appbar.languages.de', value: 'de', flagClass: 'fi fi-de' },
]

const selectedLocale = computed<LocaleOption>(() => {
  return (
    localeOptions.find((item) => item.value === locale.value) ??
    localeOptions[0]!
  )
})
</script>

<template>
  <v-menu
    v-model="menuShow"
    :close-on-content-click="false"
    location="top"
    offset="15"
  >
    <template #activator="{ props: menu }">
      <div class="settings-fab-wrap">
        <div v-if="mobile && loggedIn" class="mobile-shortcuts-fab">
          <v-menu v-model="notificationMenuShow" location="top" offset="12">
            <template #activator="{ props }">
              <v-badge
                :model-value="unreadTotalCount > 0"
                :content="unreadTotalCount"
                color="primary"
                offset-x="8"
                offset-y="8"
              >
                <v-btn
                  v-bind="props"
                  icon="mdi-bell-outline"
                  size="48"
                  color="primary"
                  variant="tonal"
                  :aria-label="t('appbar.notification')"
                />
              </v-badge>
            </template>
            <v-card width="300">
              <v-list class="py-1">
                <v-list-item
                  v-for="item in allNotificationItems.slice(0, 5)"
                  :key="item.id"
                  :title="item.title"
                  :prepend-icon="item.icon"
                  :to="item.to || undefined"
                  @click="notificationMenuShow = false"
                />
                <v-list-item
                  v-if="allNotificationItems.length === 0"
                  :title="t('notification.none')"
                  prepend-icon="mdi-bell-off-outline"
                />
                <v-divider class="my-1" />
                <v-list-item
                  :title="t('actions.showAll')"
                  append-icon="mdi-arrow-right"
                  to="/notification"
                  @click="notificationMenuShow = false"
                />
              </v-list>
            </v-card>
          </v-menu>

          <v-menu v-model="inboxMenuShow" location="top" offset="12">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-inbox-outline"
                size="48"
                color="primary"
                variant="tonal"
                :aria-label="t('appbar.inbox')"
              />
            </template>
            <v-card width="260">
              <v-list class="py-1">
                <v-list-item
                  :title="t('appbar.inbox')"
                  prepend-icon="mdi-inbox-outline"
                  to="/inbox"
                  @click="inboxMenuShow = false"
                />
              </v-list>
            </v-card>
          </v-menu>
        </div>
        <div class="settings-fab mobile-right-shortcuts-fab">
          <template v-if="mobile">
            <v-menu v-model="languageMenuShow" location="top" offset="12">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="48"
                  color="primary"
                  variant="tonal"
                  :aria-label="t('appbar.language')"
                >
                  <span
                    class="mobile-shortcuts-fab__flag"
                    :class="selectedLocale.flagClass"
                    :aria-label="t(selectedLocale.title)"
                    role="img"
                  />
                </v-btn>
              </template>
              <v-card width="240">
                <v-list class="py-1">
                  <v-list-item
                    v-for="item in localeOptions"
                    :key="item.value"
                    :active="locale === item.value"
                    @click="
                      setLocale(item.value)
                      languageMenuShow = false
                    "
                  >
                    <template #prepend>
                      <span
                        class="mobile-shortcuts-fab__flag"
                        :class="item.flagClass"
                        :aria-label="t(item.title)"
                        role="img"
                      />
                    </template>
                    <v-list-item-title>{{ t(item.title) }}</v-list-item-title>
                    <template #append>
                      <v-icon
                        v-if="locale === item.value"
                        icon="mdi-check"
                        size="18"
                        color="primary"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>

            <v-tooltip
              location="top"
              :aria-label="
                theme.current.value.dark
                  ? t('appbar.switchToLight')
                  : t('appbar.switchToDark')
              "
              :text="
                theme.current.value.dark
                  ? t('appbar.switchToLight')
                  : t('appbar.switchToDark')
              "
            >
              <template #activator="{ props: tooltip }">
                <v-btn
                  :icon="
                    theme.current.value.dark
                      ? 'mdi-white-balance-sunny'
                      : 'mdi-weather-night'
                  "
                  size="48"
                  color="primary"
                  variant="tonal"
                  :aria-label="
                    theme.current.value.dark
                      ? t('appbar.switchToLight')
                      : t('appbar.switchToDark')
                  "
                  v-bind="tooltip"
                  @click="vision = vision === 'dark' ? 'light' : 'dark'"
                />
              </template>
            </v-tooltip>
          </template>

          <v-tooltip
            location="top"
            :aria-label="t('appbar.themePalette')"
            :text="t('appbar.themePalette')"
            :content-props="{ 'aria-label': t('appbar.themePalette') }"
          >
            <template #activator="{ props: tooltip }">
              <v-btn
                icon="mdi-cog"
                size="48"
                color="primary"
                variant="tonal"
                :aria-label="t('appbar.themePalette')"
                v-bind="mergeProps(menu, tooltip)"
              />
            </template>
          </v-tooltip>
        </div>
      </div>
    </template>

    <v-card width="360">
      <v-card-text>
        <v-label class="mb-2 d-block text-center">{{
          t('appbar.themePalette')
        }}</v-label>

        <v-color-picker
          v-model="color"
          show-swatches
          elevation="0"
          width="320"
          mode="rgb"
          :modes="['rgb', 'hex', 'hsl']"
          :swatches="colors"
        />

        <v-label class="mb-2 d-block text-center">{{
          t('appbar.rounded.label')
        }}</v-label>
        <div class="d-flex justify-center mb-4">
          <v-btn-toggle
            v-model="rounded"
            mandatory
            density="compact"
            class="settings-toggle"
            divided
          >
            <v-btn
              v-for="option in roundedOptions"
              :key="option.value"
              :value="option.value"
              variant="text"
            >
              {{ option.title }}
            </v-btn>
          </v-btn-toggle>
        </div>

        <v-label class="mb-2 d-block text-center">{{
          t('appbar.shadow.label')
        }}</v-label>
        <div class="d-flex justify-center">
          <v-btn-toggle
            v-model="shadow"
            mandatory
            density="compact"
            class="settings-toggle"
            divided
          >
            <v-btn
              v-for="option in shadowOptions"
              :key="option.value"
              :value="option.value"
              variant="text"
            >
              {{ option.title }}
            </v-btn>
          </v-btn-toggle>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<style scoped>
@import '~/assets/styles/flag-icons.scss';

.settings-fab {
  z-index: 1301;
  display: inline-flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.settings-fab-wrap {
  position: fixed;
  right: 16px;
  left: 16px;
  bottom: 16px;
  z-index: 1300;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  pointer-events: none;
}

.settings-fab-wrap > * {
  pointer-events: auto;
}

.mobile-shortcuts-fab {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.mobile-shortcuts-fab__flag {
  border-radius: 999px;
  width: 26px;
  height: 26px;
  display: inline-block;
  vertical-align: middle;
  box-shadow: inset 0 0 0 1px rgba(var(--v-theme-on-surface), 0.12);
}

.settings-toggle {
  flex-wrap: wrap;
  justify-content: center;
}

.settings-toggle :deep(.v-btn) {
  text-transform: none;
}
</style>
