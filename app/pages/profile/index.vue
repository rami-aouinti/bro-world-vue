<script setup lang="ts">
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const profileStore = useProfileStore()
const { profile, loading, error } = storeToRefs(profileStore)

const fullName = computed(() => {
  const user = profile.value
  if (!user) {
    return ''
  }

  return (
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username
  )
})

const profileTitle = computed(() => profile.value?.profile?.title || 'Member')
const profileInformation = computed(
  () => profile.value?.profile?.information || '',
)

async function fetchProfile(force = false) {
  try {
    await profileStore.fetchProfile(force)
  } catch {
    // Error state handled by store.
  }
}

definePageMeta({
  layout: 'profile',
  title: 'appbar.profile',
  middleware: 'auth',
})

onMounted(() => fetchProfile())
</script>

<template>
  <div>
    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible && loading" />
      <template v-else>
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h1 class="text-h4 mb-2">{{ t('appbar.profile') }}</h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ t('pages.profileOverview.subtitle') }}
            </p>
          </div>

          <v-btn
            prepend-icon="mdi-refresh"
            color="primary"
            variant="text"
            :loading="loading"
            @click="fetchProfile(true)"
          >
            {{ t('common.refresh') }}
          </v-btn>
        </div>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
        >
          {{ error }}
        </v-alert>

        <v-card v-if="profile" variant="outlined">
          <v-card-text
            class="d-flex flex-column flex-md-row ga-4 align-start align-md-center"
          >
            <v-avatar size="84">
              <v-img :src="profile.photo" :alt="fullName" />
            </v-avatar>

            <div class="flex-grow-1">
              <h2 class="text-h5 mb-1">{{ fullName }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-1">
                @{{ profile.username }}
              </p>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ profile.email }}
              </p>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-chip color="amber-darken-2" label>
                {{ profile.coins }} coins
              </v-chip>
              <v-chip color="primary" variant="outlined" label>
                {{ profileTitle }}
              </v-chip>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-text>
            <p class="text-body-1 mb-0">
              {{ profileInformation || 'No profile information yet.' }}
            </p>
          </v-card-text>
        </v-card>
      </template>
    </v-container>
  </div>
</template>
