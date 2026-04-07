<script setup lang="ts">
type BlogFeedMode = 'general' | 'mine'

const props = withDefaults(defineProps<{
  mode?: BlogFeedMode
  showComposer?: boolean
  showStories?: boolean
}>(), {
  mode: 'general',
  showComposer: false,
  showStories: false,
})

const { posts, pending, pagination, refresh, loadMore, comment } = useBlogFeed({
  mode: props.mode,
})
const { loggedIn } = useUserSession()

await refresh()

async function createComment(payload: { post: { id: string | number }, content: string }) {
  if (!loggedIn.value) {
    return
  }

  await comment(payload.post.id, { content: payload.content })
}
</script>

<template>
  <div>
    <BlogStoriesCarousel v-if="showStories" />
    <div v-if="showComposer" class="mb-4">
      <BlogNewPostCard />
    </div>

    <div class="d-flex flex-column ga-4">
      <BlogPostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @create-comment="createComment"
      />

      <v-card v-if="!pending && posts.length === 0" rounded="lg">
        <v-card-text class="text-medium-emphasis">
          Aucune publication à afficher
        </v-card-text>
      </v-card>

      <div class="d-flex justify-center py-2">
        <v-btn
          :loading="pending"
          :disabled="pending || !pagination.hasNextPage"
          variant="text"
          color="primary"
          @click="loadMore"
        >
          Voir plus
        </v-btn>
      </div>
    </div>
  </div>
</template>
