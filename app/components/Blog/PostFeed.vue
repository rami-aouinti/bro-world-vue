<script setup lang="ts">
type BlogFeedMode = 'general' | 'mine'

type BlogReaction = {
  type: string | null
  isAuthor: boolean
}

type BlogComment = {
  id: string | number
  reactions?: BlogReaction[]
}

type BlogPost = {
  id: string | number
  reactions?: BlogReaction[]
}

const props = withDefaults(defineProps<{
  mode?: BlogFeedMode
  showComposer?: boolean
  showStories?: boolean
}>(), {
  mode: 'general',
  showComposer: false,
  showStories: false,
})

const { posts, pending, pagination, reactionTypes, refresh, loadMore, comment, react } = useBlogFeed({
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

function findOwnReaction(reactions?: BlogReaction[]) {
  return reactions?.find((entry) => entry.isAuthor)
}

async function reactToPost(payload: { post: BlogPost, code: string }) {
  if (!loggedIn.value) {
    return
  }

  const existing = findOwnReaction(payload.post.reactions)

  if (!existing) {
    await react('post', payload.post.id, { type: payload.code }, 'create')
    return
  }

  if ((existing.type ?? '').toLowerCase() === payload.code.toLowerCase()) {
    await react('post', payload.post.id, undefined, 'delete')
    return
  }

  await react('post', payload.post.id, { type: payload.code }, 'update')
}

async function togglePostLike(post: BlogPost) {
  await reactToPost({ post, code: 'like' })
}

async function reactToComment(payload: { post: BlogPost, comment: BlogComment, code: string }) {
  if (!loggedIn.value) {
    return
  }

  const existing = findOwnReaction(payload.comment.reactions)

  if (!existing) {
    await react('comment', payload.comment.id, { type: payload.code }, 'create')
    return
  }

  if ((existing.type ?? '').toLowerCase() === payload.code.toLowerCase()) {
    await react('comment', payload.comment.id, undefined, 'delete')
    return
  }

  await react('comment', payload.comment.id, { type: payload.code }, 'update')
}

async function replyToComment(payload: { post: { id: string | number }, comment: { id: string | number }, content: string }) {
  if (!loggedIn.value) {
    return
  }

  await comment(payload.post.id, {
    content: payload.content,
    parentId: payload.comment.id,
  })
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
        :reaction-types="reactionTypes"
        @create-comment="createComment"
        @reply="replyToComment"
        @like="togglePostLike"
        @react-post="reactToPost"
        @react-comment="reactToComment"
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
