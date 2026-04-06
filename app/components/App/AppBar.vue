<script setup lang="ts">
import { mergeProps } from 'vue'

const theme = useTheme()
const drawer = useState('drawer')
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
</script>

<template>
  <v-app-bar flat>
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <v-breadcrumbs :items="breadcrumbs" />
    <v-spacer />
    <div id="app-bar" />
    <v-switch
      v-model="isDark"
      color=""
      hide-details
      density="compact"
      inset
      false-icon="mdi-white-balance-sunny"
      true-icon="mdi-weather-night"
      class="opacity-80"
    />
    <v-btn
      icon
      href="https://github.com/kingyue737/vitify-nuxt"
      size="small"
      class="ml-2"
      target="_blank"
    >
      <v-icon size="30" icon="mdi-github" />
    </v-btn>
    <v-menu location="bottom">
      <template #activator="{ props: menu }">
        <v-tooltip location="bottom">
          <template #activator="{ props: tooltip }">
            <v-btn icon v-bind="mergeProps(menu, tooltip)" class="ml-1">
              <v-icon v-if="!loggedIn" icon="mdi-account-circle" size="36" />
              <v-avatar v-else color="primary" size="36">
                <v-img :src="user?.avatar_url" />
              </v-avatar>
            </v-btn>
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
