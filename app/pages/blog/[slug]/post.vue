<script setup lang="ts">
definePageMeta({
  title: 'Blog post',
})

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

type BlogPostView = {
  id: string | number
  slug: string
  title: string | null
  content: string
  createdAt: string | null
  author: {
    firstName: string | null
    lastName: string | null
    username: string | null
    photo: string | null
    displayName: string
  } | null
  comments: any[]
  reactions: any[]
  isAuthor: boolean
  sharedUrl: string | null
  mediaUrl: string | null
}

const fetchPost = async () =>
  (await ($fetch as any)(
    `/api/blog/posts/${encodeURIComponent(slug.value)}`,
  )) as Record<string, any>

const { data: postResponse, pending, error } = await useAsyncData(
  () => `blog-post-${slug.value}`,
  fetchPost,
  {
    watch: [slug],
  },
)

const post = computed<BlogPostView | null>(() => {
  const source = (postResponse.value ?? null) as Record<string, any> | null
  if (!source) {
    return null
  }

  const authorSource = (source.author ?? {}) as Record<string, any>
  const fullName = [authorSource.firstName, authorSource.lastName]
    .filter((part) => typeof part === 'string' && part.trim().length > 0)
    .join(' ')
    .trim()

  return {
    id: source.id ?? '',
    slug: typeof source.slug === 'string' ? source.slug : '',
    title: typeof source.title === 'string' ? source.title : null,
    content: typeof source.content === 'string' ? source.content : '',
    createdAt: typeof source.createdAt === 'string' ? source.createdAt : null,
    author:
      source.author && typeof source.author === 'object'
        ? {
            firstName:
              typeof authorSource.firstName === 'string'
                ? authorSource.firstName
                : null,
            lastName:
              typeof authorSource.lastName === 'string'
                ? authorSource.lastName
                : null,
            username:
              typeof authorSource.username === 'string'
                ? authorSource.username
                : null,
            photo:
              typeof authorSource.photo === 'string' ? authorSource.photo : null,
            displayName:
              fullName ||
              (typeof authorSource.username === 'string'
                ? authorSource.username
                : '') ||
              'Utilisateur',
          }
        : null,
    comments: Array.isArray(source.comments) ? source.comments : [],
    reactions: Array.isArray(source.reactions) ? source.reactions : [],
    isAuthor: Boolean(source.isAuthor),
    sharedUrl: typeof source.sharedUrl === 'string' ? source.sharedUrl : null,
    mediaUrl:
      typeof source.mediaUrl === 'string'
        ? source.mediaUrl
        : typeof source.filePath === 'string'
          ? source.filePath
          : null,
  }
})
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
