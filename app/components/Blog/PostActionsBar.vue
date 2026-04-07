<script setup lang="ts">
const emit = defineEmits<{
  like: []
  comment: []
  share: []
}>()
</script>

<template>
  <v-divider class="my-3" />
  <div class="d-flex ga-2">
    <v-btn variant="text" prepend-icon="mdi-thumb-up-outline" @click="emit('like')">
      Like
    </v-btn>
    <v-btn variant="text" prepend-icon="mdi-comment-outline" @click="emit('comment')">
      Comment
    </v-btn>
    <v-btn variant="text" prepend-icon="mdi-share-outline" @click="emit('share')">
      Share
    </v-btn>
  </div>
</template>
