<script setup lang="ts">
definePageMeta({
  title: 'Blog post',
})

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

type BlogPostView = {
  id: string | number
  slug?: string
  title?: string | null
  content: string
  createdAt?: string | null
  author?: {
    firstName?: string | null
    lastName?: string | null
    username?: string | null
    photo?: string | null
    displayName?: string
  } | null
  comments?: unknown[]
  reactions?: unknown[]
  isAuthor?: boolean
  sharedUrl?: string | null
  mediaUrl?: string | null
}

const { data: post, pending, error } = await useAsyncData<BlogPostView>(
  () => `blog-post-${slug.value}`,
  () => $fetch(`/api/blog/posts/${encodeURIComponent(slug.value)}`),
  {
    watch: [slug],
  },
)
</script>

<template>
  <v-container fluid class="py-6">
    <div class="mx-auto" style="max-width: 920px">
      <v-progress-linear v-if="pending" indeterminate color="primary" class="mb-4" />

      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        Impossible de charger le post pour le slug: <strong>{{ slug }}</strong>
      </v-alert>

      <BlogPostCard
        v-else-if="post"
        :post="post"
        :can-interact="false"
        :reaction-types="[]"
      />
    </div>
  </v-container>
</template>
