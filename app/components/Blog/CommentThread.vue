<script setup lang="ts">
defineOptions({
  name: 'BlogCommentThread',
})

type BlogComment = {
  id: string | number
  content: string
  createdAt: string | null
  isAuthor: boolean
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
    <v-card
      v-for="comment in comments"
      :key="comment.id"
      variant="tonal"
      rounded="lg"
      :class="level > 0 ? 'ms-6' : ''"
    >
      <v-card-text class="pb-2">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-caption text-medium-emphasis">{{ comment.createdAt ?? 'Maintenant' }}</span>
          <div class="d-flex ga-1">
            <v-btn size="x-small" variant="text" @click="emit('reply', comment)">
              Répondre
            </v-btn>
            <template v-if="comment.isAuthor">
              <v-btn size="x-small" variant="text" @click="emit('edit', comment)">
                Modifier
              </v-btn>
              <v-btn size="x-small" variant="text" color="error" @click="emit('delete', comment)">
                Supprimer
              </v-btn>
            </template>
          </div>
        </div>

        <p class="text-body-2 mb-0">{{ comment.content }}</p>
      </v-card-text>

      <v-card-text v-if="comment.children?.length" class="pt-0">
        <BlogCommentThread
          :comments="comment.children"
          :level="level + 1"
          @reply="emit('reply', $event)"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </v-card-text>
    </v-card>
  </div>
</template>
