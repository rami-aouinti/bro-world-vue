<script setup lang="ts">
defineOptions({
  name: 'BlogCommentThread',
})

type BlogComment = {
  id: string | number
  content: string
  createdAt: string | null
  isAuthor: boolean
  author?: {
    firstName: string | null
    lastName: string | null
    username: string | null
    displayName: string
    photo: string | null
  } | null
  children?: BlogComment[]
}

withDefaults(defineProps<{
  comments?: BlogComment[]
  level?: number
}>(), {
  comments: () => [],
  level: 0,
})

const emit = defineEmits<{
  reply: [comment: BlogComment]
  edit: [comment: BlogComment]
  delete: [comment: BlogComment]
}>()
</script>

<template>
  <div class="d-flex flex-column ga-3">
    <div
      v-for="comment in comments"
      :key="comment.id"
      class="comment-item"
      :class="{ 'nested-comment': level > 0 }"
    >
      <div class="d-flex ga-2 align-start">
        <v-avatar size="34" color="grey-darken-2">
          <v-img v-if="comment.author?.photo" :src="comment.author.photo" />
          <v-icon v-else size="18" icon="mdi-account" />
        </v-avatar>

        <div class="comment-body">
          <div class="comment-bubble">
            <div class="text-subtitle-2 font-weight-bold">{{ comment.author?.displayName || 'Utilisateur' }}</div>
            <p class="mb-0 text-body-1">{{ comment.content }}</p>
          </div>

          <div class="comment-actions text-medium-emphasis">
            <span>{{ comment.createdAt ?? 'Maintenant' }}</span>
            <button type="button" @click="emit('reply', comment)">Répondre</button>
            <template v-if="comment.isAuthor">
              <button type="button" @click="emit('edit', comment)">Modifier</button>
              <button type="button" class="text-error" @click="emit('delete', comment)">Supprimer</button>
            </template>
          </div>
        </div>
      </div>

      <div v-if="comment.children?.length" class="children-wrap">
        <BlogCommentThread
          :comments="comment.children"
          :level="level + 1"
          @reply="emit('reply', $event)"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-item.nested-comment {
  margin-left: 1.6rem;
  padding-left: 0.8rem;
  border-left: 2px solid rgba(255, 255, 255, 0.12);
}

.comment-body {
  flex: 1;
}

.comment-bubble {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 0.6rem 0.9rem;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-top: 0.35rem;
  padding-left: 0.15rem;
  font-size: 0.95rem;
}

.comment-actions button {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-weight: 600;
}

.children-wrap {
  margin-top: 0.45rem;
}
</style>
