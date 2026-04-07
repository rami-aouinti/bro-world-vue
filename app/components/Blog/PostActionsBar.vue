<script setup lang="ts">
const props = withDefaults(defineProps<{
  commentsCount?: number
  sharesCount?: number
}>(), {
  commentsCount: 0,
  sharesCount: 0,
})

const emit = defineEmits<{
  like: []
  comment: []
  share: []
}>()
</script>

<template>
  <div class="post-actions-wrap">
    <div class="post-stats text-medium-emphasis">
      <span>{{ commentsCount }} Kommentare</span>
      <span>{{ sharesCount }} Mal geteilt</span>
    </div>

    <v-divider class="my-2" />

    <div class="post-actions d-flex ga-2">
      <v-btn class="action-btn" variant="text" prepend-icon="mdi-thumb-up-outline" @click="emit('like')">
        Gefällt mir
      </v-btn>
      <v-btn class="action-btn" variant="text" prepend-icon="mdi-comment-outline" @click="emit('comment')">
        Kommentieren
      </v-btn>
      <v-btn class="action-btn" variant="text" prepend-icon="mdi-share-outline" @click="emit('share')">
        Teilen
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.post-stats {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  font-size: 0.95rem;
}

.action-btn {
  flex: 1;
  justify-content: center;
  color: rgb(var(--v-theme-on-surface));
  text-transform: none;
  font-weight: 600;
}
</style>
