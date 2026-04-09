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

type PublicUser = {
  id: string
  email?: string
  firstName: string
  lastName: string
  photo?: string
}

type PublicUsersResponse = {
  users?: PublicUser[]
}

const api = $fetch.create({
  headers: {
    accept: 'application/json',
  },
})

const { isPageSkeletonVisible } = usePageSkeleton()
const actionLoadingUserId = ref<string | null>(null)
const actionLoadingType = ref<FriendAction | null>(null)
const globalError = ref<string>('')
const publicUsers = ref<PublicUser[]>([])
const suggestedUsers = ref<PublicUser[]>([])

const friends = computed(() => profile.value?.friends ?? [])
const requests = computed(() => profile.value?.incomingRequests ?? [])
const invitations = computed(() => profile.value?.friendRequests ?? [])
const blockedUsers = computed(() => profile.value?.blockedUsers ?? [])
const excludedSuggestionIds = computed(() => {
  const ids = new Set<string>()

  profile.value?.friends?.forEach((item) => ids.add(item.id))
  profile.value?.incomingRequests?.forEach((item) => ids.add(item.id))
  profile.value?.friendRequests?.forEach((item) => ids.add(item.id))
  profile.value?.blockedUsers?.forEach((item) => ids.add(item.id))

  if (profile.value?.id) {
    ids.add(profile.value.id)
  }

  return ids
})

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

function suggestionName(item: PublicUser) {
  return [item.firstName, item.lastName].filter(Boolean).join(' ')
}

function suggestionHandle(item: PublicUser) {
  return item.email?.split('@')[0] || suggestionName(item).replaceAll(' ', '')
}

function shuffleUsers(items: PublicUser[]) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = current
  }

  return shuffled
}

function refreshSuggestions() {
  const candidates = publicUsers.value.filter(
    (item) => !excludedSuggestionIds.value.has(item.id),
  )

  suggestedUsers.value = shuffleUsers(candidates).slice(0, 6)
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
    refreshSuggestions()
  } catch (error) {
    globalError.value =
      error instanceof Error ? error.message : t('pages.friends.errors.load')
  }
}

async function fetchPublicUsers() {
  try {
    const response = await api<PublicUsersResponse>('/api/public/users')
    publicUsers.value = response.users ?? []
    refreshSuggestions()
  } catch (error) {
    if (!globalError.value) {
      globalError.value =
        error instanceof Error ? error.message : t('pages.friends.errors.load')
    }
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

onMounted(async () => {
  await Promise.all([fetchFriendsData(), fetchPublicUsers()])
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <v-card variant="text" class="postcard-gradient-card">
          <v-card-title class="d-flex align-center ga-2">
            <v-icon icon="mdi-account-multiple-plus-outline" />
            {{ t('pages.friends.suggestions.title') }}
          </v-card-title>
          <v-list v-if="suggestedUsers.length" class="bg-transparent">
            <v-list-item
              v-for="item in suggestedUsers"
              :key="item.id"
              :title="suggestionName(item)"
              :subtitle="`@${suggestionHandle(item)}`"
            >
              <template #prepend>
                <v-avatar size="36" color="primary">
                  <v-img
                    :src="item.photo"
                    :alt="`Avatar of ${suggestionName(item)}`"
                  />
                </v-avatar>
              </template>

              <template #append>
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  :loading="isActionLoading(item.id, 'request')"
                  @click="applyAction(item.id, 'request')"
                >
                  {{ t('pages.friends.actions.send') }}
                </v-btn>
              </template>
            </v-list-item>
          </v-list>

          <v-card-text v-else class="text-medium-emphasis">
            {{ t('pages.friends.suggestions.emptyText') }}
          </v-card-text>
        </v-card>
      </template>
    </AppPageDrawers>

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
