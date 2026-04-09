<script setup lang="ts">
type BlogFeedMode = 'general' | 'mine'

type BlogReaction = {
  type: string | null
  isAuthor?: boolean
}

type BlogComment = {
  id: string | number
  content: string
  reactions?: BlogReaction[]
}

type BlogPost = {
  id: string | number
  slug?: string | null
  content: string
  reactions?: BlogReaction[]
}

const props = withDefaults(
  defineProps<{
    mode?: BlogFeedMode
    showComposer?: boolean
    showStories?: boolean
  }>(),
  {
    mode: 'general',
    showComposer: false,
    showStories: false,
  },
)
const { t } = useI18n()

const {
  posts,
  pending,
  pagination,
  reactionTypes,
  refresh,
  loadMore,
  comment,
  react,
  edit,
  delete: remove,
} = useBlogFeed({
  mode: props.mode,
})
const { loggedIn } = useUserSession()
const editDialog = ref(false)
const editContent = ref('')
const editPending = ref(false)
const editTarget = ref<
  | { type: 'post'; postId: string | number }
  | { type: 'comment'; postId: string | number; commentId: string | number }
  | null
>(null)

await refresh()

async function createComment(payload: {
  post: { id: string | number }
  content: string
}) {
  if (!loggedIn.value) {
    return
  }

  await comment(payload.post.id, { content: payload.content })
}

function findOwnReaction(reactions?: BlogReaction[]) {
  return reactions?.find((entry) => entry.isAuthor)
}

async function reactToPost(payload: { post: BlogPost; code: string }) {
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

async function reactToComment(payload: {
  post: BlogPost
  comment: BlogComment
  code: string
}) {
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

async function replyToComment(payload: {
  post: { id: string | number }
  comment: { id: string | number }
  content: string
}) {
  if (!loggedIn.value) {
    return
  }

  await comment(payload.post.id, {
    content: payload.content,
    parentId: payload.comment.id,
  })
}

function openPostEdit(post: BlogPost) {
  editTarget.value = { type: 'post', postId: post.id }
  editContent.value = post.content ?? ''
  editDialog.value = true
}

function openCommentEdit(payload: { post: BlogPost; comment: BlogComment }) {
  editTarget.value = {
    type: 'comment',
    postId: payload.post.id,
    commentId: payload.comment.id,
  }
  editContent.value = payload.comment.content ?? ''
  editDialog.value = true
}

async function deletePost(post: BlogPost) {
  await remove('post', post.id)
}

async function deleteComment(payload: {
  post: BlogPost
  comment: BlogComment
}) {
  await remove('comment', payload.comment.id, payload.post.id)
}

async function submitEdit() {
  const target = editTarget.value
  const content = editContent.value.trim()

  if (!target || !content || editPending.value) {
    return
  }

  editPending.value = true

  try {
    if (target.type === 'post') {
      await edit('post', target.postId, { content })
    } else {
      await edit('comment', target.commentId, { content }, target.postId)
    }

    editDialog.value = false
    editTarget.value = null
    editContent.value = ''
  } finally {
    editPending.value = false
  }
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
        :can-interact="loggedIn"
        :reaction-types="reactionTypes"
        @create-comment="createComment"
        @reply="replyToComment"
        @like="togglePostLike"
        @react-post="reactToPost"
        @react-comment="reactToComment"
        @edit-post="openPostEdit"
        @delete-post="deletePost"
        @edit-comment="openCommentEdit"
        @delete-comment="deleteComment"
      />

      <v-card v-if="!pending && posts.length === 0" rounded="lg">
        <v-card-text class="text-medium-emphasis">
          {{ t('blog.post.empty') }}
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
          {{ t('blog.post.cta.seeMore') }}
        </v-btn>
      </div>
    </div>

    <v-dialog v-model="editDialog" max-width="560">
      <v-card rounded="lg">
        <v-card-title>{{ t('blog.post.menu.edit') }}</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="editContent"
            :label="t('blog.post.edit.contentLabel')"
            rows="5"
            auto-grow
            variant="outlined"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">{{
            t('common.cancel')
          }}</v-btn>
          <v-btn
            color="primary"
            :loading="editPending"
            :disabled="editPending || !editContent.trim()"
            @click="submitEdit"
          >
            {{ t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
