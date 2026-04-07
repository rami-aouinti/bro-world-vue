<script setup lang="ts">
type PlatformApplication = {
  id: string
  title: string
  description: string
  photo: string
  platformName: string
  platformKey: string
  status: string
  private: boolean
  pluginKeys: string[]
  isOwner: boolean
}

type PlatformResponse = {
  items: PlatformApplication[]
}

const { t } = useI18n()
const { loggedIn } = useUserSession()

definePageMeta({
  title: 'appbar.platform',
})

const { data, pending, error, refresh } = await useAsyncData(
  'platform-applications',
  () => {
    const query = loggedIn.value ? { page: 1, limit: 10 } : { page: 1, limit: 20 }

    if (loggedIn.value) {
      return $fetch<PlatformResponse>('/api/application/private', { query })
    }

    return $fetch<PlatformResponse>('/api/application/public', { query })
  },
  {
    watch: [loggedIn],
    default: () => ({ items: [] }),
  },
)

const applications = computed(() => data.value?.items ?? [])
</script>

<template>
  <v-container fluid class="py-6">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">{{ t('platform.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis">
          {{ t('platform.subtitle') }}
        </p>
      </div>
      <v-btn
        variant="tonal"
        color="primary"
        prepend-icon="mdi-refresh"
        :loading="pending"
        @click="refresh()"
      >
        {{ t('platform.refresh') }}
      </v-btn>
    </div>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      :text="t('platform.error')"
    />

    <v-row v-if="pending" dense>
      <v-col v-for="index in 6" :key="`skeleton-${index}`" cols="12" sm="6" lg="4">
        <v-skeleton-loader type="image, article, actions" />
      </v-col>
    </v-row>

    <v-row v-else-if="applications.length" dense>
      <v-col v-for="application in applications" :key="application.id" cols="12" sm="6" lg="4">
        <v-card rounded="xl" elevation="2" class="platform-card h-100">
          <v-img :src="application.photo" height="180" cover>
            <div class="platform-card__status pa-3 d-flex justify-space-between align-center">
              <v-chip
                size="small"
                label
                :color="application.status === 'active' ? 'success' : 'warning'"
              >
                {{ application.status }}
              </v-chip>
              <v-chip
                v-if="application.private"
                size="small"
                label
                color="deep-purple-accent-4"
              >
                Private
              </v-chip>
            </div>
          </v-img>
          <v-card-item>
            <v-card-title class="text-wrap">{{ application.title }}</v-card-title>
            <v-card-subtitle>
              {{ application.platformName }} · {{ application.platformKey }}
            </v-card-subtitle>
          </v-card-item>
          <v-card-text class="pt-0">
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ application.description }}
            </p>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="pluginKey in application.pluginKeys"
                :key="pluginKey"
                size="small"
                variant="outlined"
                color="primary"
              >
                {{ pluginKey }}
              </v-chip>
              <v-chip v-if="!application.pluginKeys.length" size="small" variant="outlined">
                No plugins
              </v-chip>
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="px-4 py-3">
            <v-chip
              :color="application.isOwner ? 'success' : 'default'"
              size="small"
              label
            >
              {{ application.isOwner ? t('platform.owner') : t('platform.member') }}
            </v-chip>
            <v-spacer />
            <template v-if="application.isOwner">
              <v-btn size="small" color="primary" variant="text" prepend-icon="mdi-pencil">
                {{ t('common.edit') }}
              </v-btn>
              <v-btn size="small" color="error" variant="text" prepend-icon="mdi-delete-outline">
                {{ t('common.delete') }}
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-alert
      v-else
      type="info"
      variant="tonal"
      class="mt-4"
      :title="t('platform.emptyTitle')"
      :text="t('platform.emptySubtitle')"
    />
  </v-container>
</template>

<style scoped>
.platform-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.platform-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
}

.platform-card__status {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent);
}
</style>
