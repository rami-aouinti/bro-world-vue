<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { FriendUser } from '~/stores/profile'

const { t } = useI18n()
const profileStore = useProfileStore()
const { profile, loading, error: storeError } = storeToRefs(profileStore)

type FriendAction =
  | 'request'
  | 'cancel'
  | 'accept'
  | 'reject'
  | 'block'
  | 'unblock'

const api = $fetch.create({
  headers: {
    accept: 'application/json',
  },
})

const { isPageSkeletonVisible } = usePageSkeleton()
const actionLoadingUserId = ref<string | null>(null)
const actionLoadingType = ref<FriendAction | null>(null)
const globalError = ref<string>('')

const friends = computed(() => profile.value?.friends ?? [])
const requests = computed(() => profile.value?.incomingRequests ?? [])
const invitations = computed(() => profile.value?.friendRequests ?? [])
const blockedUsers = computed(() => profile.value?.blockedUsers ?? [])

const sectionConfigs = computed(() => [
  {
    title: t('pages.friends.sections.friends.title'),
    subtitle: t('pages.friends.sections.friends.subtitle'),
    icon: 'mdi-account-group-outline',
    items: friends.value,
    emptyText: t('pages.friends.sections.friends.emptyText'),
    actions: [
      {
        label: t('pages.friends.actions.block'),
        action: 'block' as const,
        color: 'error',
        variant: 'tonal' as const,
      },
    ],
  },
  {
    title: t('pages.friends.sections.requests.title'),
    subtitle: t('pages.friends.sections.requests.subtitle'),
    icon: 'mdi-account-arrow-right-outline',
    items: requests.value,
    emptyText: t('pages.friends.sections.requests.emptyText'),
    actions: [
      {
        label: t('pages.friends.actions.accept'),
        action: 'accept' as const,
        color: 'success',
        variant: 'flat' as const,
      },
      {
        label: t('pages.friends.actions.reject'),
        action: 'reject' as const,
        color: 'error',
        variant: 'tonal' as const,
      },
      {
        label: t('pages.friends.actions.block'),
        action: 'block' as const,
        color: 'error',
        variant: 'text' as const,
      },
    ],
  },
  {
    title: t('pages.friends.sections.invitations.title'),
    subtitle: t('pages.friends.sections.invitations.subtitle'),
    icon: 'mdi-account-arrow-left-outline',
    items: invitations.value,
    emptyText: t('pages.friends.sections.invitations.emptyText'),
    actions: [
      {
        label: t('pages.friends.actions.cancel'),
        action: 'cancel' as const,
        color: 'warning',
        variant: 'tonal' as const,
      },
      {
        label: t('pages.friends.actions.block'),
        action: 'block' as const,
        color: 'error',
        variant: 'text' as const,
      },
    ],
  },
  {
    title: t('pages.friends.sections.blocked.title'),
    subtitle: t('pages.friends.sections.blocked.subtitle'),
    icon: 'mdi-block-helper',
    items: blockedUsers.value,
    emptyText: t('pages.friends.sections.blocked.emptyText'),
    actions: [
      {
        label: t('pages.friends.actions.unblock'),
        action: 'unblock' as const,
        color: 'primary',
        variant: 'tonal' as const,
      },
    ],
  },
])

function userName(item: FriendUser) {
  return (
    [item.firstName, item.lastName].filter(Boolean).join(' ') || item.username
  )
}

function isActionLoading(userId: string, action: FriendAction) {
  return (
    actionLoadingUserId.value === userId && actionLoadingType.value === action
  )
}

async function fetchFriendsData(force = false) {
  globalError.value = ''

  try {
    await profileStore.fetchProfile(force)
  } catch (error) {
    globalError.value =
      error instanceof Error ? error.message : t('pages.friends.errors.load')
  }
}

async function applyAction(userId: string, action: FriendAction) {
  actionLoadingUserId.value = userId
  actionLoadingType.value = action

  try {
    if (action === 'unblock') {
      await api(`/api/users/${userId}/block`, { method: 'DELETE' })
    } else {
      const endpoint =
        action === 'block'
          ? `/api/users/${userId}/block`
          : `/api/users/${userId}/friends/${action}`

      await api(endpoint, { method: 'POST' })
    }

    await fetchFriendsData(true)
  } catch (error) {
    globalError.value =
      error instanceof Error
        ? error.message
        : t('pages.friends.errors.action', { action })
  } finally {
    actionLoadingUserId.value = null
    actionLoadingType.value = null
  }
}

watch(storeError, (value) => {
  if (value && !globalError.value) {
    globalError.value = value
  }
})

definePageMeta({
  layout: 'profile',
  title: 'appbar.profile',
  middleware: 'auth',
})

onMounted(() => fetchFriendsData())
</script>

<template>
  <div>
    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible && loading" />
      <template v-else>
        <v-alert
          v-if="globalError"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
        >
          {{ globalError }}
        </v-alert>

        <v-row>
          <v-col
            v-for="section in sectionConfigs"
            :key="section.title"
            cols="12"
          >
            <v-card variant="text" class="postcard-gradient-card">
              <v-card-title class="d-flex align-center ga-2">
                <v-icon :icon="section.icon" />
                {{ section.title }}
              </v-card-title>
              <v-divider />
              <v-list v-if="section.items.length" class="bg-transparent">
                <v-list-item
                  v-for="item in section.items"
                  :key="item.id"
                  :title="userName(item)"
                  :subtitle="`@${item.username}`"
                >
                  <template #prepend>
                    <v-avatar size="40" color="primary">
                      <v-img
                        :src="item.photo"
                        :alt="`Avatar of ${userName(item)}`"
                      />
                    </v-avatar>
                  </template>

                  <template #append>
                    <div class="d-flex ga-2 flex-wrap justify-end">
                      <v-btn
                        v-for="btn in section.actions"
                        :key="`${item.id}-${btn.action}`"
                        :color="btn.color"
                        :variant="btn.variant"
                        size="small"
                        :loading="isActionLoading(item.id, btn.action)"
                        @click="applyAction(item.id, btn.action)"
                      >
                        {{ btn.label }}
                      </v-btn>
                      <v-btn
                        v-if="
                          section.title !==
                            t('pages.friends.sections.friends.title') &&
                          section.title !==
                            t('pages.friends.sections.blocked.title')
                        "
                        size="small"
                        color="primary"
                        variant="outlined"
                        :loading="isActionLoading(item.id, 'request')"
                        @click="applyAction(item.id, 'request')"
                      >
                        {{ t('pages.friends.actions.resend') }}
                      </v-btn>
                    </div>
                  </template>
                </v-list-item>
              </v-list>

              <v-card-text v-else class="text-medium-emphasis">
                {{ section.emptyText }}
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>
