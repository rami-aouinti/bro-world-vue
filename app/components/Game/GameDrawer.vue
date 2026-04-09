<script setup lang="ts">
import type { SessionUser } from '~/types/session'

const route = useRoute()
const { t } = useI18n()
const { user } = useUserSession()

const sessionUser = computed(() => user.value as SessionUser | null)
const avatarUrl = computed(() => sessionUser.value?.photo)
const fullName = computed(() => {
  const values = [sessionUser.value?.firstName, sessionUser.value?.lastName]
    .filter(Boolean)
    .join(' ')

  return values || sessionUser.value?.username || t('appbar.user')
})

const coins = computed(() => {
  return sessionUser.value?.coins || 0
})
</script>

<template>
  <NuxtLink
    to="/profile"
    class="d-flex align-center text-center ga-3"
    style="text-decoration: none; color: inherit"
  >
    <div class="d-flex align-center text-center ga-3">
      <v-avatar size="64">
        <v-img :src="avatarUrl" :alt="`${fullName} avatar`" />
      </v-avatar>
      <div>
        <h4 class="mb-0">{{ fullName }}</h4>
        <v-chip class="mb-1" color="amber-darken-2" label>
          {{ coins }} coins
        </v-chip>
      </div>
    </div>
  </NuxtLink>
</template>
<style scoped>
.app-left-drawer-list {
  height: calc(100% - 96px);
  min-height: calc(100% - 96px);
  max-height: calc(100% - 96px);
  overflow-y: auto;
}
.app-left-drawer-list {
  .v-list-item {
    transition: all 0.2s;
    min-height: 40px;
    padding-block: 0;
    padding-inline: 4px 8px;
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
</style>
