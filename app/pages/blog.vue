<script setup lang="ts">
const { loggedIn } = useUserSession()

definePageMeta({
  title: 'Blog',
})
</script>

<template>
  <v-container fluid class="blog-feed-shell">
    <BlogPostFeed
      :show-composer="loggedIn"
      :show-stories="loggedIn"
      :content-preview-lines="2"
      show-read-more
    />
  </v-container>
</template>

<style scoped>
.blog-feed-shell {
  max-width: 920px;
  margin: 0 auto;
  padding-bottom: 24px;
}
</style>
