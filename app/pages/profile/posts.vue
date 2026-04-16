<script setup lang="ts">
import { privateApi } from '~/utils/http/privateApi'

type BlogPostStats = {
  totalPosts: number
  totalComments: number
  totalReacts: number
}

const { isPageSkeletonVisible } = usePageSkeleton()

const {
  data: stats,
  pending: statsPending,
  error: statsError,
} = await useAsyncData<BlogPostStats>('profile-posts-stats', () =>
  privateApi.request<BlogPostStats>('/api/blog/private/posts/stats' as string),
)

const safeStats = computed<BlogPostStats>(() => {
  if (!stats.value) {
    return {
      totalPosts: 0,
      totalComments: 0,
      totalReacts: 0,
    }
  }

  return {
    totalPosts: Number(stats.value.totalPosts ?? 0),
    totalComments: Number(stats.value.totalComments ?? 0),
    totalReacts: Number(stats.value.totalReacts ?? 0),
  }
})

definePageMeta({
  title: 'profile.posts.title',
  middleware: 'auth',
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <div class="text-h6 pa-4">Statistics</div>

        <v-card-text>
          <v-skeleton-loader
            v-if="statsPending"
            type="list-item-three-line"
            class="px-0"
          />

          <v-alert v-else-if="statsError" type="warning" variant="tonal">
            Impossible de charger les statistiques.
          </v-alert>

          <div v-else class="d-flex flex-column ga-3">
            <div class="d-flex align-center">
              <v-chip color="primary" label size="large">
                {{ safeStats.totalPosts }}
              </v-chip>
              <p class="text-caption text-medium-emphasis mx-3">Posts</p>
            </div>
            <div class="d-flex align-center">
              <v-chip color="primary" label size="large">
                {{ safeStats.totalComments }}
              </v-chip>
              <p class="text-caption text-medium-emphasis mx-3">Comments</p>
            </div>
            <div class="d-flex align-center">
              <v-chip color="primary" label size="large">
                {{ safeStats.totalReacts }}
              </v-chip>
              <p class="text-caption text-medium-emphasis mx-3">Reacts</p>
            </div>
          </div>
        </v-card-text>
      </template>
      <template #left>
        <ProfileDrawer />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <BlogPostFeed
        v-else
        mode="mine"
        :show-composer="false"
        :show-stories="false"
      />
    </v-container>
  </div>
</template>
