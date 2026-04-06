<script setup lang="ts">
import { mergeProps } from 'vue'

const theme = useTheme()
const drawer = useState('drawer')
const route = useRoute()
const { t, locale } = useI18n()

function getMetaTitle(title: unknown) {
  if (typeof title !== 'string') return ''
  return t(title)
}

const breadcrumbs = computed(() => {
  locale.value
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
</script>

<template>
  <v-app-bar flat>
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <v-breadcrumbs :items="breadcrumbs" />
    <v-spacer />
    <div id="app-bar" />
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
.app-bar-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 14px;
  margin-inline-end: 8px;
  background-color: rgba(var(--v-theme-surface), 1);
}

.app-bar-controls__theme {
  color: rgb(var(--v-theme-primary));
}
</style>
