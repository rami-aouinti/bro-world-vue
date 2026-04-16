<script setup lang="ts">
import { storeToRefs } from 'pinia'

const { isPageSkeletonVisible } = usePageSkeleton()
const profileStore = useProfileStore()
const { profile, loading, error } = storeToRefs(profileStore)

const applications = computed(() => profile.value?.applications ?? [])
const selectedApplicationId = ref<string | null>(null)

const selectedApplication = computed(
  () =>
    applications.value.find(
      (item) => item.id === selectedApplicationId.value,
    ) ?? null,
)

async function refreshApplications(force = false) {
  try {
    await profileStore.fetchProfile(force)
  } catch {
    // Error state is already managed by the profile store.
  }
}

watch(
  applications,
  (items) => {
    if (!items.length) {
      selectedApplicationId.value = null
      return
    }

    const selectionStillExists = items.some(
      (item) => item.id === selectedApplicationId.value,
    )

    if (!selectionStillExists) {
      selectedApplicationId.value = items[0]?.id ?? null
    }
  },
  { immediate: true },
)

definePageMeta({
  title: 'Applications',
  middleware: 'auth',
})

onMounted(() => refreshApplications())
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible && loading" />
        <div v-else-if="selectedApplication">
          <div>
            <h3 class="text-h6 font-weight-bold">
              {{ selectedApplication.title }}
            </h3>
          </div>

          <v-card-text class="pa-0 d-flex flex-column ga-3">
            <div class="text-body-2 text-medium-emphasis">
              {{ selectedApplication.description }}
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-chip
                size="small"
                :color="
                  selectedApplication.status === 'active'
                    ? 'success'
                    : 'warning'
                "
                label
              >
                {{ selectedApplication.status }}
              </v-chip>
              <v-chip
                size="small"
                :color="
                  selectedApplication.private
                    ? 'deep-purple-accent-4'
                    : 'teal-darken-1'
                "
                label
              >
                {{ selectedApplication.private ? 'Private' : 'Public' }}
              </v-chip>
            </div>

            <v-list density="compact" class="pa-0">
              <v-list-item
                class="px-0"
                title="Platform"
                :subtitle="selectedApplication.platformName"
              />
              <v-list-item
                class="px-0"
                title="Platform ID"
                :subtitle="selectedApplication.platformId"
              />
              <v-list-item
                class="px-0"
                title="Slug"
                :subtitle="selectedApplication.slug"
              />
              <v-list-item
                class="px-0"
                title="Created"
                :subtitle="selectedApplication.createdAt"
              />
              <v-list-item
                class="px-0"
                title="Updated"
                :subtitle="selectedApplication.updatedAt"
              />
            </v-list>
          </v-card-text>
        </div>
        <v-alert
          v-else
          type="info"
          variant="tonal"
          text="Sélectionnez une application pour afficher ses détails."
        />
      </template>
      <template #left>
        <ProfileDrawer />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible && loading" />
      <template v-else>
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
            <v-card
              variant="text"
              class="h-100 postcard-gradient-card application-card"
              :class="{
                'application-card--selected':
                  selectedApplicationId === application.id,
              }"
              @click="selectedApplicationId = application.id"
            >
              <v-card-item>
                <v-card-title>{{ application.title }}</v-card-title>
                <v-card-subtitle>{{
                  application.platformName
                }}</v-card-subtitle>
              </v-card-item>
              <v-card-text class="pt-0">
                <p class="text-body-2 text-medium-emphasis mb-4">
                  {{ application.description }}
                </p>
                <div class="d-flex flex-wrap ga-2">
                  <v-chip
                    size="small"
                    :color="
                      application.status === 'active' ? 'success' : 'warning'
                    "
                    label
                  >
                    {{ application.status }}
                  </v-chip>
                  <v-chip
                    size="small"
                    :color="
                      application.private
                        ? 'deep-purple-accent-4'
                        : 'teal-darken-1'
                    "
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

<style scoped>
.application-card {
  cursor: pointer;
  border: 1px solid rgba(100, 116, 139, 0.15);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.application-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.application-card--selected {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 12px 24px rgba(var(--v-theme-primary), 0.25);
}
</style>
