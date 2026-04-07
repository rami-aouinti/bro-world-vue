<script setup lang="ts">
import type { SessionUser } from '~/types/session'

const { t } = useI18n()
const route = useRoute()
const { user } = useUserSession()

const sessionUser = computed(() => user.value as SessionUser | null)
const avatarUrl = computed(() => sessionUser.value?.photo)
const fullName = computed(() => {
  const values = [sessionUser.value?.firstName, sessionUser.value?.lastName]
    .filter(Boolean)
    .join(' ')

  return values || sessionUser.value?.username || t('appbar.user')
})

const profileNavItems = [
  {
    label: 'Friends',
    to: '/profile/friends',
    icon: 'mdi-account-group-outline',
  },
]

definePageMeta({
  title: 'appbar.profile',
  middleware: 'auth',
})
</script>

<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12" md="4" lg="3">
        <v-card class="pa-4">
          <div class="d-flex flex-column align-center text-center ga-3">
            <v-avatar size="96" color="primary">
              <v-img :src="avatarUrl" />
            </v-avatar>
            <div>
              <p class="text-h6 mb-1">{{ fullName }}</p>
              <p class="text-body-2 text-medium-emphasis">
                @{{ sessionUser?.username }}
              </p>
            </div>
          </div>

          <v-divider class="my-4" />

          <v-list nav density="comfortable">
            <v-list-item
              v-for="item in profileNavItems"
              :key="item.to"
              :to="item.to"
              :prepend-icon="item.icon"
              :title="item.label"
              :active="route.path === item.to"
              color="primary"
              rounded="lg"
            />
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8" lg="9">
        <v-card class="pa-6">
          <h1 class="text-h4 mb-2">{{ t('appbar.profile') }}</h1>
          <p class="text-body-1 text-medium-emphasis mb-0">
            Utilisez le menu à gauche pour gérer vos amis et vos relations.
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
