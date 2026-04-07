<script setup lang="ts">
import type { SessionUser } from '~/types/session'

interface FriendUser {
  id: string
  username: string
  firstName: string
  lastName: string
  photo?: string
}

type FriendAction =
  | 'request'
  | 'cancel'
  | 'accept'
  | 'reject'
  | 'block'
  | 'unblock'

const { t } = useI18n()
const route = useRoute()
const { user } = useUserSession()
const api = $fetch.create({
  headers: {
    accept: 'application/json',
  },
})

const loading = ref(false)
const actionLoadingUserId = ref<string | null>(null)
const actionLoadingType = ref<FriendAction | null>(null)
const globalError = ref<string>('')

const friends = ref<FriendUser[]>([])
const requests = ref<FriendUser[]>([])
const invitations = ref<FriendUser[]>([])
const blockedUsers = ref<FriendUser[]>([])

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

const sectionConfigs = computed(() => [
  {
    title: 'Friends',
    subtitle: 'Utilisateurs déjà acceptés.',
    icon: 'mdi-account-group-outline',
    items: friends.value,
    emptyText: 'Aucun ami pour le moment.',
    actions: [
      { label: 'Bloquer', action: 'block' as const, color: 'error', variant: 'tonal' as const },
    ],
  },
  {
    title: 'Requests',
    subtitle: 'Demandes reçues.',
    icon: 'mdi-account-arrow-right-outline',
    items: requests.value,
    emptyText: 'Aucune demande reçue.',
    actions: [
      { label: 'Accepter', action: 'accept' as const, color: 'success', variant: 'flat' as const },
      { label: 'Refuser', action: 'reject' as const, color: 'error', variant: 'tonal' as const },
      { label: 'Bloquer', action: 'block' as const, color: 'error', variant: 'text' as const },
    ],
  },
  {
    title: 'Invitations',
    subtitle: 'Demandes envoyées.',
    icon: 'mdi-account-arrow-left-outline',
    items: invitations.value,
    emptyText: 'Aucune invitation envoyée.',
    actions: [
      { label: 'Annuler', action: 'cancel' as const, color: 'warning', variant: 'tonal' as const },
      { label: 'Bloquer', action: 'block' as const, color: 'error', variant: 'text' as const },
    ],
  },
  {
    title: 'Blocked',
    subtitle: 'Utilisateurs bloqués.',
    icon: 'mdi-block-helper',
    items: blockedUsers.value,
    emptyText: 'Aucun utilisateur bloqué.',
    actions: [
      { label: 'Débloquer', action: 'unblock' as const, color: 'primary', variant: 'tonal' as const },
    ],
  },
])

function userName(item: FriendUser) {
  return [item.firstName, item.lastName].filter(Boolean).join(' ') || item.username
}

function isActionLoading(userId: string, action: FriendAction) {
  return actionLoadingUserId.value === userId && actionLoadingType.value === action
}

async function fetchFriendsData() {
  loading.value = true
  globalError.value = ''

  try {
    const [friendsData, requestsData, invitationsData, blockedData] = await Promise.all([
      api<FriendUser[]>('/api/users/me/friends'),
      api<FriendUser[]>('/api/users/me/friends/requests'),
      api<FriendUser[]>('/api/users/me/friends/requests/sent'),
      api<FriendUser[]>('/api/users/me/friends/blocked'),
    ])

    friends.value = friendsData
    requests.value = requestsData
    invitations.value = invitationsData
    blockedUsers.value = blockedData
  }
  catch (error) {
    globalError.value = error instanceof Error ? error.message : 'Erreur lors du chargement.'
  }
  finally {
    loading.value = false
  }
}

async function applyAction(userId: string, action: FriendAction) {
  actionLoadingUserId.value = userId
  actionLoadingType.value = action

  try {
    if (action === 'unblock') {
      await api(`/api/users/${userId}/block`, { method: 'DELETE' })
    }
    else {
      const endpoint = action === 'block'
        ? `/api/users/${userId}/block`
        : `/api/users/${userId}/friends/${action}`

      await api(endpoint, { method: 'POST' })
    }

    await fetchFriendsData()
  }
  catch (error) {
    globalError.value = error instanceof Error ? error.message : `Erreur sur l'action ${action}.`
  }
  finally {
    actionLoadingUserId.value = null
    actionLoadingType.value = null
  }
}

definePageMeta({
  title: 'appbar.profile',
  middleware: 'auth',
})

onMounted(fetchFriendsData)
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
        <v-alert v-if="globalError" type="error" variant="tonal" class="mb-4" closable>
          {{ globalError }}
        </v-alert>

        <v-card class="pa-4 pa-md-6">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <h1 class="text-h5 mb-1">Friends</h1>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Gérer vos amis, demandes, invitations et utilisateurs bloqués.
              </p>
            </div>
            <v-btn
              prepend-icon="mdi-refresh"
              color="primary"
              variant="text"
              :loading="loading"
              @click="fetchFriendsData"
            >
              Actualiser
            </v-btn>
          </div>

          <v-row>
            <v-col
              v-for="section in sectionConfigs"
              :key="section.title"
              cols="12"
            >
              <v-card variant="outlined">
                <v-card-title class="d-flex align-center ga-2">
                  <v-icon :icon="section.icon" />
                  {{ section.title }}
                </v-card-title>
                <v-card-subtitle>{{ section.subtitle }}</v-card-subtitle>

                <v-list v-if="section.items.length">
                  <v-list-item
                    v-for="item in section.items"
                    :key="item.id"
                    :title="userName(item)"
                    :subtitle="`@${item.username}`"
                  >
                    <template #prepend>
                      <v-avatar size="40" color="primary">
                        <v-img :src="item.photo" />
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
                          v-if="section.title !== 'Friends' && section.title !== 'Blocked'"
                          size="small"
                          color="primary"
                          variant="outlined"
                          :loading="isActionLoading(item.id, 'request')"
                          @click="applyAction(item.id, 'request')"
                        >
                          Relancer
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
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
