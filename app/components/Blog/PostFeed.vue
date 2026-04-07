<script setup lang="ts">
import { formatDateTime } from '../../utils/formatDateTime'

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

const { posts, pending, pagination, refresh, loadMore } = useBlogFeed({
  mode: props.mode,
})
const { locale } = useI18n()

function formatPostDate(value: string | null) {
  if (!value) {
    return ''
  }

  return formatDateTime(locale.value, new Date(value))
}

await refresh()
</script>

<template>
  <div>
    <BlogStoriesCarousel v-if="showStories" />
    <BlogNewPostCard v-if="showComposer" />

    <v-card rounded="lg">
      <v-list lines="three">
        <v-list-subheader>Fil du blog</v-list-subheader>

        <v-list-item
          v-for="post in posts"
          :key="post.id"
          :title="post.title || 'Publication'"
          :subtitle="post.content"
        >
          <template #append>
            <span class="text-caption text-medium-emphasis">
              {{ formatPostDate(post.createdAt) }}
            </span>
          </template>
        </v-list-item>

        <v-list-item v-if="!pending && posts.length === 0" title="Aucune publication à afficher" />
      </v-list>

      <v-card-actions class="justify-center py-4">
        <v-btn
          :loading="pending"
          :disabled="pending || !pagination.hasNextPage"
          variant="text"
          color="primary"
          @click="loadMore"
        >
          Voir plus
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
