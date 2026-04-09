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

const PAGE_SIZE = 6

const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const { loggedIn } = useUserSession()

definePageMeta({
  title: 'appbar.platform',
})

const searchTerm = ref('')
const selectedStatus = ref<'all' | 'active' | 'inactive'>('all')
const selectedVisibility = ref<'all' | 'private' | 'public'>('all')
const selectedOwnership = ref<'all' | 'owner' | 'member'>('all')
const selectedPlatformId = ref<string | null>(null)
const currentPage = ref(1)

const { data, pending, error, refresh } = await useAsyncData(
  'platform-applications',
  () => {
    const query = loggedIn.value
      ? { page: 1, limit: 120 }
      : { page: 1, limit: 120 }

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

const filteredApplications = computed(() => {
  return applications.value.filter((application) => {
    const matchesSearch =
      !searchTerm.value ||
      application.title
        .toLowerCase()
        .includes(searchTerm.value.toLowerCase()) ||
      application.platformName
        .toLowerCase()
        .includes(searchTerm.value.toLowerCase()) ||
      application.platformKey
        .toLowerCase()
        .includes(searchTerm.value.toLowerCase())

    const matchesStatus =
      selectedStatus.value === 'all' ||
      application.status === selectedStatus.value
    const matchesVisibility =
      selectedVisibility.value === 'all' ||
      (selectedVisibility.value === 'private' && application.private) ||
      (selectedVisibility.value === 'public' && !application.private)

    const matchesOwnership =
      selectedOwnership.value === 'all' ||
      (selectedOwnership.value === 'owner' && application.isOwner) ||
      (selectedOwnership.value === 'member' && !application.isOwner)

    return (
      matchesSearch && matchesStatus && matchesVisibility && matchesOwnership
    )
  })
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredApplications.value.length / PAGE_SIZE)),
)

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredApplications.value.slice(start, start + PAGE_SIZE)
})

const selectedPlatform = computed(
  () =>
    applications.value.find((item) => item.id === selectedPlatformId.value) ??
    null,
)

watch(
  filteredApplications,
  (items) => {
    if (!items.length) {
      currentPage.value = 1
      selectedPlatformId.value = null
      return
    }

    if (currentPage.value > pageCount.value) {
      currentPage.value = pageCount.value
    }

    const selectionStillExists = items.some(
      (item) => item.id === selectedPlatformId.value,
    )

    if (!selectionStillExists) {
      selectedPlatformId.value = items[0]?.id ?? null
    }
  },
  { immediate: true },
)

watch(currentPage, () => {
  const visibleIds = new Set(paginatedApplications.value.map((item) => item.id))

  if (!selectedPlatformId.value || !visibleIds.has(selectedPlatformId.value)) {
    selectedPlatformId.value = paginatedApplications.value[0]?.id ?? null
  }
})

function resetFilters() {
  searchTerm.value = ''
  selectedStatus.value = 'all'
  selectedVisibility.value = 'all'
  selectedOwnership.value = 'all'
  currentPage.value = 1
}
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible" />
        <div v-else class="d-flex flex-column ga-2">
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-plus-outline"
            @click="resetFilters"
          >
            Create Platform
          </v-btn>

          <v-text-field
            v-model="searchTerm"
            :label="t('common.search')"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />

          <v-select
            v-model="selectedStatus"
            :label="t('platform.status')"
            variant="outlined"
            density="compact"
            :items="[
              { title: t('platform.all'), value: 'all' },
              { title: 'Active', value: 'active' },
              { title: 'Inactive', value: 'inactive' },
            ]"
            hide-details
          />

          <v-select
            v-model="selectedVisibility"
            :label="t('platform.visibility')"
            variant="outlined"
            density="compact"
            :items="[
              { title: t('platform.all'), value: 'all' },
              { title: t('platform.private'), value: 'private' },
              { title: t('platform.public'), value: 'public' },
            ]"
            hide-details
          />

          <v-select
            v-model="selectedOwnership"
            :label="t('platform.role')"
            variant="outlined"
            density="compact"
            :items="[
              { title: t('platform.all'), value: 'all' },
              { title: t('platform.owner'), value: 'owner' },
              { title: t('platform.member'), value: 'member' },
            ]"
            hide-details
          />

          <v-btn
            variant="tonal"
            prepend-icon="mdi-filter-off-outline"
            @click="resetFilters"
          >
            {{ t('platform.clearFilters') }}
          </v-btn>
        </div>
      </template>

      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible" />
        <div
          v-else-if="selectedPlatform"
          class="pa-2 d-flex flex-column ga-2 h-100"
        >
          <div>
            <h3 class="text-h6 font-weight-bold">
              {{ selectedPlatform?.title || t('platform.selectPlatform') }}
            </h3>
          </div>
          <v-img
            :src="selectedPlatform.photo"
            :alt="selectedPlatform.title"
            height="120"
            cover
          />
          <v-card-text class="d-flex flex-column ga-3">
            <div class="text-body-2 text-medium-emphasis">
              {{ selectedPlatform.description }}
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                size="small"
                :color="
                  selectedPlatform.status === 'active' ? 'success' : 'warning'
                "
                label
              >
                {{ selectedPlatform.status }}
              </v-chip>
              <v-chip size="small" color="primary" variant="outlined" label>
                {{ selectedPlatform.platformName }}
              </v-chip>
              <v-chip
                size="small"
                :color="
                  selectedPlatform.private
                    ? 'deep-purple-accent-4'
                    : 'teal-darken-1'
                "
                label
              >
                {{
                  selectedPlatform.private
                    ? t('platform.private')
                    : t('platform.public')
                }}
              </v-chip>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="pluginKey in selectedPlatform.pluginKeys"
                :key="`selected-${pluginKey}`"
                size="small"
                variant="outlined"
              >
                {{ pluginKey }}
              </v-chip>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-btn
                v-if="selectedPlatform.isOwner"
                color="primary"
                variant="outlined"
                prepend-icon="mdi-pencil"
              >
                {{ t('common.edit') }}
              </v-btn>
              <v-btn
                v-if="selectedPlatform.isOwner"
                color="error"
                variant="tonal"
                prepend-icon="mdi-delete-outline"
              >
                {{ t('common.delete') }}
              </v-btn>
              <v-chip v-else color="grey" variant="tonal" label>
                {{ t('platform.member') }}
              </v-chip>
            </div>
          </v-card-text>
        </div>
        <v-alert
          v-else
          type="info"
          variant="tonal"
          :text="t('platform.selectPlatformHint')"
        />
      </template>
    </AppPageDrawers>

    <v-container fluid class="platform-page">
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <client-only>
          <teleport to="#app-bar">
            <v-btn
              variant="tonal"
              color="primary"
              icon="mdi-refresh"
              :loading="pending"
              @click="refresh()"
            />
          </teleport>
        </client-only>

        <div class="platform-page__content">
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
            :text="t('platform.error')"
          />

          <v-row v-if="pending" dense>
            <v-col
              v-for="index in 6"
              :key="`skeleton-${index}`"
              cols="12"
              md="6"
            >
              <v-skeleton-loader type="image, article" class="skeleton-card" />
            </v-col>
          </v-row>

          <v-row
            v-else-if="paginatedApplications.length"
            dense
            class="platform-grid"
          >
            <v-col
              v-for="application in paginatedApplications"
              :key="application.id"
              cols="12"
              md="6"
              class="d-flex"
            >
              <v-card
                elevation="3"
                class="platform-card w-100"
                :class="{
                  'platform-card--selected':
                    selectedPlatformId === application.id,
                }"
                @click="selectedPlatformId = application.id"
              >
                <div class="platform-card__overlay pa-1 d-flex justify-end">
                  <v-chip
                    size="small"
                    label
                    :color="
                      application.status === 'active' ? 'success' : 'warning'
                    "
                  >
                    {{ application.status }}
                  </v-chip>
                </div>

                <v-card-item>
                  <v-card-title class="text-wrap text-subtitle-2">{{
                    application.title
                  }}</v-card-title>
                </v-card-item>

                <v-card-text class="pt-0">
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
                    <v-chip size="small" variant="outlined" color="secondary">
                      {{
                        application.private
                          ? t('platform.private')
                          : t('platform.public')
                      }}
                    </v-chip>
                  </div>
                </v-card-text>
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
        </div>

        <div
          v-if="!pending && filteredApplications.length"
          class="platform-page__pagination d-flex justify-center mt-2"
        >
          <v-pagination
            v-model="currentPage"
            :length="pageCount"
            :total-visible="7"
            rounded="circle"
          />
        </div>
      </template>
    </v-container>
  </div>
</template>

<style scoped>
.platform-page {
  min-height: calc(90vh - var(--v-layout-top, 0px));
  display: flex;
  flex-direction: column;
}

.platform-page__content {
  flex: 1;
}

.platform-page__pagination {
  margin-top: auto;
  padding-bottom: 5px;
}

.skeleton-card {
  border-radius: 20px;
}

.platform-grid {
  animation: fade-in 0.35s ease;
}

.platform-card {
  cursor: pointer;
  min-height: 100px;
  max-height: 320px;
  overflow: hidden;
  border: 1px solid rgba(100, 116, 139, 0.15);
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    filter 0.25s ease;
}

.platform-card__image {
  transition: transform 0.3s ease;
}

.platform-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
}

.platform-card:hover .platform-card__image {
  transform: scale(1.03);
}

.platform-card--selected {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 16px 38px rgba(var(--v-theme-primary));
}

.platform-card__overlay {
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.4), transparent);
}

.selected-platform-card {
  animation: slide-up 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
