<script setup lang="ts">
import { mergeProps } from 'vue'

const theme = useTheme()
const drawer = useState('drawer')
const showLeftDrawer = useState('show-left-drawer', () => true)
const showRightDrawer = useState('show-right-drawer', () => true)
const route = useRoute()
const { t } = useI18n()

function getMetaTitle(title: unknown) {
  if (typeof title !== 'string') return ''
  return t(title)
}

const breadcrumbs = computed(() => {
  return route!.matched
    .filter((item) => item.meta && item.meta.title)
    .map((r) => ({
      title: getMetaTitle(r.meta.title),
      disabled: r.path === route.path || false,
      to: r.path,
    }))
})

const isDark = computed({
  get() {
    return theme.current.value.dark
  },
  set(v) {
    theme.change(v ? 'dark' : 'light')
  },
})

const { loggedIn, clear, user } = useUserSession()

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
      <v-app-bar-nav-icon class="mx-5" :disabled="!showLeftDrawer" @click="toggleLeftDrawer" />
    </div>

    <v-breadcrumbs class="app-top-bar__breadcrumbs d-none d-lg-flex" :items="breadcrumbs" />
    <div id="app-bar" class="app-top-bar__portal" />

    <div class="app-top-bar__right">
      <v-app-bar-nav-icon
        class="app-top-bar__right-drawer-toggle mx-5"
        :aria-label="showRightDrawer ? 'Hide right drawer' : 'Show right drawer'"
        @click="showRightDrawer = !showRightDrawer"
      />

      <v-spacer />
      <v-menu location="bottom">
        <template #activator="{ props: menu }">
          <v-tooltip location="bottom">
            <template #activator="{ props: tooltip }">
              <v-badge
                dot
                :color="loggedIn ? 'success' : 'error'"
                location="bottom end"
                offset-x="8"
                offset-y="8"
              >
                <v-btn icon v-bind="mergeProps(menu, tooltip)">
                  <v-icon v-if="!loggedIn" icon="mdi-account-circle" size="36" />
                  <v-avatar v-else color="primary" size="36">
                    <v-img :src="user?.avatar_url" />
                  </v-avatar>
                </v-btn>
              </v-badge>
            </template>
            <span>{{ loggedIn ? user!.login : t('appbar.user') }}</span>
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
          <v-list-item
            v-else
            :title="t('appbar.logout')"
            prepend-icon="mdi-logout"
            @click="clear"
          />
        </v-list>
      </v-menu>

      <AppLanguageSwitcher />

      <v-btn
        icon
        size="44"
        variant="text"
        class="app-bar-controls__theme"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
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

.app-top-bar__breadcrumbs {
  flex: 1;
  min-width: 0;
  overflow: hidden;
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
