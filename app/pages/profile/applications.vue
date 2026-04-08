<script setup lang="ts">
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const profileStore = useProfileStore()
const { profile, loading, error } = storeToRefs(profileStore)

const applications = computed(() => profile.value?.applications ?? [])

async function refreshApplications(force = false) {
  try {
    await profileStore.fetchProfile(force)
  } catch {
    // Error state is already managed by the profile store.
  }
}

definePageMeta({
  title: 'Applications',
  middleware: 'auth',
})

onMounted(() => refreshApplications())
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible" />
        <ProfileDrawer v-else />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible && loading" />
      <template v-else>
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h1 class="text-h4 mb-2">{{ t('pages.profileOverview.applicationsTitle') }}</h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ t('pages.profileOverview.applicationsSubtitle') }}
            </p>
          </div>

          <v-btn
            prepend-icon="mdi-refresh"
            color="primary"
            variant="text"
            :loading="loading"
            @click="refreshApplications(true)"
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

        <v-row v-if="applications.length">
          <v-col
            v-for="application in applications"
            :key="application.id"
            cols="12"
            md="6"
            xl="4"
          >
            <v-card variant="outlined" class="h-100">
              <v-card-item>
                <v-card-title>{{ application.title }}</v-card-title>
                <v-card-subtitle>{{ application.platformName }}</v-card-subtitle>
              </v-card-item>
              <v-card-text class="pt-0">
                <p class="text-body-2 text-medium-emphasis mb-4">
                  {{ application.description }}
                </p>
                <div class="d-flex flex-wrap ga-2">
                  <v-chip
                    size="small"
                    :color="application.status === 'active' ? 'success' : 'warning'"
                    label
                  >
                    {{ application.status }}
                  </v-chip>
                  <v-chip
                    size="small"
                    :color="application.private ? 'deep-purple-accent-4' : 'teal-darken-1'"
                    label
                  >
                    {{ application.private ? 'Private' : 'Public' }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-alert v-else type="info" variant="tonal">
          No applications found for the connected user.
        </v-alert>
      </template>
    </v-container>
  </div>
</template>
