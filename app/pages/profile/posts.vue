<script setup lang="ts">
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
  $fetch<BlogPostStats>('/api/blog/private/posts/stats' as string),
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
  layout: 'profile',
  title: 'profile.posts.title',
  middleware: 'auth',
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <v-card
          rounded="xl"
          variant="text"
          class="postcard-gradient-card profile-posts-stats-card"
        >
          <v-card-title>Statistiques de mes posts</v-card-title>

          <v-card-text>
            <v-skeleton-loader
              v-if="statsPending"
              type="list-item-three-line"
              class="bg-transparent px-0"
            />

            <v-alert v-else-if="statsError" type="warning" variant="tonal">
              Impossible de charger les statistiques.
            </v-alert>

            <div v-else class="d-flex flex-column ga-3">
              <v-card
                rounded="lg"
                variant="text"
                class="pa-3 postcard-gradient-card"
              >
                <p class="text-caption text-medium-emphasis mb-2">Posts</p>
                <v-chip color="primary" label size="large">
                  {{ safeStats.totalPosts }}
                </v-chip>
              </v-card>

              <v-card
                rounded="lg"
                variant="text"
                class="pa-3 postcard-gradient-card"
              >
                <p class="text-caption text-medium-emphasis mb-2">
                  Commentaires
                </p>
                <v-chip color="secondary" label size="large">
                  {{ safeStats.totalComments }}
                </v-chip>
              </v-card>

              <v-card
                rounded="lg"
                variant="text"
                class="pa-3 postcard-gradient-card"
              >
                <p class="text-caption text-medium-emphasis mb-2">Réactions</p>
                <v-chip color="success" label size="large">
                  {{ safeStats.totalReacts }}
                </v-chip>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
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

<style scoped>
.profile-posts-stats-card :deep(.v-card) {
  background: transparent;
}
</style>
