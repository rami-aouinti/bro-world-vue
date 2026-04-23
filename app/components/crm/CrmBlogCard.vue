<script setup lang="ts">
type BlogAuthor = {
  firstName: string | null
  lastName: string | null
  username: string | null
  photo: string | null
  displayName: string
}

type BlogReaction = {
  type: string | null
  count?: number
  isAuthor?: boolean
}

type BlogComment = {
  id: string
  content: string
  createdAt: string
  isAuthor: boolean
  author: BlogAuthor
  reactions?: BlogReaction[]
  children?: BlogComment[]
}

type BlogPost = {
  id: string
  slug: string | null
  author: BlogAuthor
  createdAt: string
  title: string
  content: string
  mediaUrls?: string[]
  isAuthor: boolean
  comments?: BlogComment[]
  reactions?: BlogReaction[]
}

type NewPostPayload = {
  title: string
  content: string
  youtubeUrl?: string
  imageUrl?: string
  videoUrl?: string
}

const { t } = useI18n()

const currentUser: BlogAuthor = {
  firstName: 'Bro',
  lastName: 'World',
  username: 'bro.world',
  photo: null,
  displayName: 'Bro World',
}

const reactionTypes = [
  { code: 'like', label: t('blog.post.reactions.like') },
  { code: 'heart', label: t('blog.post.reactions.heart') },
  { code: 'celebrate', label: t('blog.post.reactions.celebrate') },
]

const posts = ref<BlogPost[]>([
  {
    id: 'mock-post-1',
    slug: null,
    title: 'Sprint sync ready',
    content: 'Le sprint avance bien. La prochaine review est prévue demain matin.',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    author: {
      firstName: 'Yanis',
      lastName: 'Team Lead',
      username: 'yanis.lead',
      photo: null,
      displayName: 'Yanis Team Lead',
    },
    isAuthor: false,
    comments: [],
    reactions: [{ type: 'like', count: 3 }],
  },
  {
    id: 'mock-post-2',
    slug: null,
    title: 'Need QA support',
    content: 'On a besoin d\'un check QA sur les derniers changements API avant merge.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    author: {
      firstName: 'Camille',
      lastName: 'QA',
      username: 'camille.qa',
      photo: null,
      displayName: 'Camille QA',
    },
    isAuthor: false,
    comments: [],
    reactions: [{ type: 'heart', count: 1 }],
  },
])

function normalizePostContent(payload: NewPostPayload): string {
  return (
    payload.youtubeUrl?.trim()
    || payload.imageUrl?.trim()
    || payload.videoUrl?.trim()
    || payload.content.trim()
  )
}

function addPost(payload: NewPostPayload) {
  const title = payload.title.trim()
  const content = normalizePostContent(payload)

  if (!title || !content) return

  posts.value.unshift({
    id: `mock-post-${Date.now()}`,
    slug: null,
    title,
    content,
    createdAt: new Date().toISOString(),
    author: currentUser,
    isAuthor: true,
    comments: [],
    reactions: [],
  })
}

function createComment(payload: { post: BlogPost; content: string }) {
  const content = payload.content.trim()
  if (!content) return

  const target = posts.value.find((post) => post.id === payload.post.id)
  if (!target) return

  const nextComment: BlogComment = {
    id: `mock-comment-${Date.now()}`,
    content,
    createdAt: new Date().toISOString(),
    isAuthor: true,
    author: currentUser,
    children: [],
    reactions: [],
  }

  target.comments = [...(target.comments ?? []), nextComment]
}

function reactToPost(payload: { post: BlogPost; code: string }) {
  const target = posts.value.find((post) => post.id === payload.post.id)
  if (!target) return

  const code = payload.code.toLowerCase()
  const reactions = [...(target.reactions ?? [])]
  const existing = reactions.find((entry) => (entry.type ?? '').toLowerCase() === code)

  if (existing) {
    existing.count = (existing.count ?? 0) + 1
  } else {
    reactions.push({ type: code, count: 1 })
  }

  target.reactions = reactions
}
</script>

<template>
  <v-card rounded="xl" class="pa-4 postcard-gradient-card mt-4">
    <h3 class="text-subtitle-1 mb-4">Blog</h3>

    <div class="mb-4">
      <BlogNewPostCard @submit="addPost" />
    </div>

    <div class="d-flex flex-column ga-4">
      <BlogPostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :reaction-types="reactionTypes"
        @create-comment="createComment"
        @react-post="reactToPost"
        @like="reactToPost({ post, code: 'like' })"
      />

      <v-alert v-if="posts.length === 0" type="info" variant="tonal">
        {{ t('blog.post.empty') }}
      </v-alert>
    </div>
  </v-card>
</template>
