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
  <v-app-bar flat class="app-top-bar mx-4 mt-4 rounded-pill">
    <v-app-bar-nav-icon :disabled="!showLeftDrawer" @click="toggleLeftDrawer" />
    <v-breadcrumbs :items="breadcrumbs" />
    <v-spacer />

    <v-btn
      icon
      variant="text"
      :color="showLeftDrawer ? 'primary' : undefined"
      :aria-label="showLeftDrawer ? 'Hide left drawer' : 'Show left drawer'"
      @click="showLeftDrawer = !showLeftDrawer"
    >
      <v-icon icon="mdi-dock-left" />
    </v-btn>

    <v-btn
      icon
      variant="text"
      :color="showRightDrawer ? 'primary' : undefined"
      :aria-label="showRightDrawer ? 'Hide right drawer' : 'Show right drawer'"
      @click="showRightDrawer = !showRightDrawer"
    >
      <v-icon icon="mdi-dock-right" />
    </v-btn>

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

    <v-menu location="bottom">
      <template #activator="{ props: menu }">
        <v-tooltip location="bottom">
          <template #activator="{ props: tooltip }">
            <v-badge
              dot
              color="success"
              location="bottom end"
              offset-x="8"
              offset-y="8"
            >
              <v-btn icon v-bind="mergeProps(menu, tooltip)" class="ml-1">
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
  </v-app-bar>
</template>

<style scoped>
.app-top-bar {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.app-bar-controls__theme {
  color: rgb(var(--v-theme-primary));
}
</style>
